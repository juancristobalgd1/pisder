"""Calcula con EmbeddingGemma 2 los vectores de texto y de fotos de los anuncios de Pisder,
y detecta anuncios duplicados (mismo inmueble publicado por varias fuentes).

Salida:
  public/ia/indice.json   ids de anuncios, nombres de fotos, dimensión
  public/ia/texto.i8      N x DIM int8 (vector de cada anuncio, texto)
  public/ia/fotos.i8      F x DIM int8 (vector de cada foto distinta)
  data/duplicados.json    { idOculto: idQueSeQueda }
"""
import json, math, os, sys
import numpy as np
import torch
from PIL import Image
from sentence_transformers import SentenceTransformer

DIM = 256
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
anuncios = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "ingest/ia/anuncios.json")))

ETAPA = os.environ.get("ETAPA", "todo")
CACHE = os.path.join(ROOT, "ingest/ia")
def cargar(sin_vision):
    ck = {"audio_config": None}
    if sin_vision: ck["vision_config"] = None
    return SentenceTransformer("google/embeddinggemma-2", config_kwargs=ck,
                               model_kwargs={"torch_dtype": torch.bfloat16, "low_cpu_mem_usage": True})

def doc(a):
    extras = ", ".join(a["extras"])
    return f"title: {a['titulo']} | text: {a['descripcion']} {('Extras: ' + extras) if extras else ''}".strip()

fotos = sorted({f for a in anuncios for f in a["fotos"]})
def renorm(v):
    v = v.astype(np.float32); return v / np.linalg.norm(v, axis=1, keepdims=True)
with torch.inference_mode():
  if ETAPA == "texto":
    model = cargar(True)
    tv = model.encode([doc(a) for a in anuncios], batch_size=8, truncate_dim=DIM,
                      normalize_embeddings=False, show_progress_bar=False, convert_to_tensor=True)
    np.save(os.path.join(CACHE, "tv.npy"), renorm(tv.float().cpu().numpy())); sys.exit(0)
  if ETAPA == "fotos":
    model = cargar(False)
    imgs = []
    for f in fotos:
        p = f if f.startswith("http") else os.path.join(ROOT, "public", f.lstrip("/"))
        imgs.append(Image.open(p).convert("RGB") if not f.startswith("http") else f)
    fv = model.encode(imgs, batch_size=2, truncate_dim=DIM, normalize_embeddings=False,
                      show_progress_bar=False, convert_to_tensor=True)
    np.save(os.path.join(CACHE, "fv.npy"), renorm(fv.float().cpu().numpy())); sys.exit(0)
tv = np.load(os.path.join(CACHE, "tv.npy")); fv = np.load(os.path.join(CACHE, "fv.npy"))

q = lambda v: np.clip(np.round(v * 127), -127, 127).astype(np.int8)
os.makedirs(os.path.join(ROOT, "public/ia"), exist_ok=True)
q(tv).tofile(os.path.join(ROOT, "public/ia/texto.i8"))
q(fv).tofile(os.path.join(ROOT, "public/ia/fotos.i8"))
json.dump({"modelo": "google/embeddinggemma-2", "dim": DIM, "ids": [a["id"] for a in anuncios], "fotos": fotos},
          open(os.path.join(ROOT, "public/ia/indice.json"), "w"))

# --- Duplicados: mismo inmueble en varias fuentes ---------------------------------
fidx = {f: i for i, f in enumerate(fotos)}
def fotos_vec(a): return fv[[fidx[f] for f in a["fotos"]]] if a["fotos"] else np.zeros((0, DIM))
def km(a, b):
    R = 6371; p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dl = math.radians(b["lng"] - a["lng"]); dp = p2 - p1
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(h))
def sim_fotos(a, b):
    A, B = fotos_vec(a), fotos_vec(b)
    if not len(A) or not len(B): return 0.0
    S = A @ B.T  # cada foto de A con su mejor pareja en B
    return float(np.mean(S.max(axis=1)))

duplicados, pares = {}, []
for i, a in enumerate(anuncios):
    for j in range(i + 1, len(anuncios)):
        b = anuncios[j]
        if a["operacion"] != b["operacion"] or a["tipo"] != b["tipo"] or a["hab"] != b["hab"]: continue
        if abs(a["m2"] - b["m2"]) > max(3, 0.05 * a["m2"]): continue
        if abs(a["precio"] - b["precio"]) > 0.10 * max(a["precio"], b["precio"]): continue
        if km(a, b) > 0.3: continue
        st = float(tv[i] @ tv[j]); sf = sim_fotos(a, b)
        # Mismo sitio y mismas características: las fotos (o el texto) lo confirman
        if sf >= 0.93 or st >= 0.95:
            pares.append((a["id"], b["id"], round(st, 3), round(sf, 3)))
            keep, drop = a["id"], b["id"]
            while keep in duplicados: keep = duplicados[keep]
            if drop != keep: duplicados[drop] = keep
json.dump(duplicados, open(os.path.join(ROOT, "data/duplicados.json"), "w"), indent=0)
print(json.dumps({"anuncios": len(anuncios), "fotos": len(fotos), "duplicados": len(duplicados), "ejemplos": pares[:5]}))
