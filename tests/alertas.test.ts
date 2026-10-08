import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { allListings } from "../lib/data";
import { filtrosDeParams } from "../lib/alertas";
import { search, filtersFromParams } from "../lib/search";
import { GET } from "../app/alertas-index.json/route";
const req = createRequire(import.meta.url);
const { encaja, nuevos } = req("../public/alertas-match.js");

test("la alerta encaja con los mismos pisos que la búsqueda", async () => {
  const params = "alquilar?q=piso con terraza en Madrid hasta 1500";
  const f = filtrosDeParams(params);
  assert.equal(f.ciudad, "Madrid"); assert.equal(f.precioMax, 1500);
  const { items } = await (GET() as Response).json();
  const porAlerta = new Set(items.filter((l: { id: string }) => encaja(l, f)).map((l: { id: string }) => l.id));
  const desde = Date.now() - 20 * 86400000;
  const r = search({ ...filtersFromParams(new URLSearchParams("q=piso con terraza en Madrid hasta 1500"), "alquilar"), perPage: 5000 });
  const porBusqueda = new Set(r.items.filter((l) => Date.parse(l.publicadoEn) >= desde).map((l) => l.id));
  assert.deepEqual([...porAlerta].sort(), [...porBusqueda].sort());
});
test("solo avisa de lo publicado después de crear la alerta", async () => {
  const { items } = await (GET() as Response).json();
  const f = filtrosDeParams("alquilar?provincia=madrid");
  const ahora = { id: "x", filtros: f, visto: new Date().toISOString() };
  assert.equal(nuevos(items, ahora).length, 0);
  const antes = { id: "x", filtros: f, visto: new Date(Date.now() - 20 * 86400000).toISOString() };
  assert.ok(nuevos(items, antes).length > 0);
  assert.ok(allListings().length > 0);
});
