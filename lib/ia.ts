// Búsqueda por foto o por frase con EmbeddingGemma 2, todo en el navegador.
// Los anuncios ya vienen con su vector precalculado (public/ia); aquí solo se calcula el de la consulta.
import { asset } from "./asset";
import { allListings } from "./data";
import type { Listing, Operacion } from "./types";

const CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
const MODELO = "onnx-community/embeddinggemma-2-ONNX";

type Indice = { dim: number; tv: Int8Array; fv: Int8Array; fila: Map<string, number>; foto: Map<string, number> };
let indice: Promise<Indice> | null = null;
const nombre = (f: string) => f.split("/").pop()!.split("?")[0];

export function cargarIndice(): Promise<Indice> {
  return (indice ??= (async () => {
    const [ix, tv, fv] = await Promise.all([
      fetch(asset("/ia/indice.json")).then((r) => r.json()),
      fetch(asset("/ia/texto.i8")).then((r) => r.arrayBuffer()),
      fetch(asset("/ia/fotos.i8")).then((r) => r.arrayBuffer()),
    ]);
    return {
      dim: ix.dim, tv: new Int8Array(tv), fv: new Int8Array(fv),
      fila: new Map((ix.ids as string[]).map((id, i) => [id, i])),
      foto: new Map((ix.fotos as string[]).map((f, i) => [nombre(f), i])),
    };
  })());
}

type Motor = { vision: boolean; embed: (texto: string | null, img?: unknown) => Promise<Float32Array>; T: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
let motor: Promise<Motor> | null = null;
let motorVision = false;

/** Descarga (una vez, luego queda en caché del navegador) y prepara el modelo. */
export function cargarMotor(vision: boolean, progreso?: (pct: number) => void): Promise<Motor> {
  if (motor && (motorVision || !vision)) return motor;
  motorVision = vision;
  const p = (async () => {
    const T = await import(/* webpackIgnore: true */ CDN);
    const config = await T.AutoConfig.from_pretrained(MODELO);
    config.audio_config = null; // sin audio: ~190 MB menos
    if (!vision) config.vision_config = null; // solo texto
    const vistos: Record<string, [number, number]> = {};
    const progress_callback = (e: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (e.status !== "progress" || !e.file || !e.total) return;
      vistos[e.file] = [e.loaded ?? 0, e.total];
      const [a, b] = Object.values(vistos).reduce(([x, y], [l, t]) => [x + l, y + t], [0, 0]);
      progreso?.(Math.min(99, Math.round((a / b) * 100)));
    };
    const processor = await T.AutoProcessor.from_pretrained(MODELO, { progress_callback });
    let model;
    const gpu = typeof navigator !== "undefined" && "gpu" in navigator;
    try { model = await T.AutoModel.from_pretrained(MODELO, { config, dtype: "q4", device: gpu ? "webgpu" : "wasm", progress_callback }); }
    catch { model = await T.AutoModel.from_pretrained(MODELO, { config, dtype: "q4", device: "wasm", progress_callback }); }
    progreso?.(100);
    const embed = async (texto: string | null, img?: unknown) => {
      const out = await model(await (img ? processor(null, img) : processor([texto])));
      return new Float32Array(out.sentence_embedding.data);
    };
    return { vision, embed, T };
  })();
  motor = p;
  p.catch(() => { if (motor === p) motor = null; });
  return p;
}

function recortar(v: Float32Array, dim: number) { // MRL: primeras `dim` dimensiones y renormalizar
  const r = v.slice(0, dim); let n = 0; for (const x of r) n += x * x; n = Math.sqrt(n) || 1;
  for (let i = 0; i < dim; i++) r[i] /= n; return r;
}
const z = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; const d = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length) || 1; return xs.map((x) => (x - m) / d); };

async function ordenar(q: Float32Array, modo: "foto" | "frase", op: Operacion, n: number): Promise<Listing[]> {
  const ix = await cargarIndice(); const D = ix.dim; const qv = recortar(q, D);
  const cand: Listing[] = [], st: number[] = [], sf: number[] = [];
  const dot = (arr: Int8Array, fila: number) => { let s = 0; const o = fila * D; for (let i = 0; i < D; i++) s += arr[o + i] * qv[i]; return s / 127; };
  const cacheFoto = new Map<number, number>();
  for (const l of allListings()) {
    if (l.operacion !== op) continue;
    const f = ix.fila.get(l.id); if (f === undefined) continue;
    let mejor = -1;
    for (const ft of l.fotos) { const k = ix.foto.get(nombre(ft)); if (k === undefined) continue; if (!cacheFoto.has(k)) cacheFoto.set(k, dot(ix.fv, k)); mejor = Math.max(mejor, cacheFoto.get(k)!); }
    cand.push(l); st.push(dot(ix.tv, f)); sf.push(mejor < 0 ? 0 : mejor);
  }
  const [zt, zf] = [z(st), z(sf)];
  const [wt, wf] = modo === "foto" ? [0.25, 0.75] : [0.65, 0.35];
  return cand.map((l, i) => [l, wt * zt[i] + wf * zf[i]] as const).sort((a, b) => b[1] - a[1]).slice(0, n).map(([l]) => l);
}

export async function buscarPorFrase(frase: string, op: Operacion, progreso?: (pct: number) => void, n = 60) {
  const m = await cargarMotor(false, progreso);
  return ordenar(await m.embed(`task: search result | query: ${frase}`), "frase", op, n);
}

export async function buscarPorFoto(archivo: Blob, op: Operacion, progreso?: (pct: number) => void, n = 60) {
  const m = await cargarMotor(true, progreso);
  const img = await m.T.RawImage.fromBlob(archivo);
  return ordenar(await m.embed(null, img), "foto", op, n);
}
