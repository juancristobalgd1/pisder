import { test } from "node:test";
import assert from "node:assert/strict";
import { parseQuery } from "../lib/nlparse";
import { search } from "../lib/search";

test("entiende ciudad, habitaciones, precio y extras", () => {
  const { filtros } = parseQuery("piso de 2 habitaciones en Madrid con terraza hasta 1.400€");
  assert.equal(filtros.ciudad, "madrid");
  assert.equal(filtros.habMin, 2);
  assert.equal(filtros.precioMax, 1400);
  assert.deepEqual(filtros.tipos, ["piso"]);
  assert.ok(filtros.extras?.includes("terraza"));
});
test("barrio y compra con 'k'", () => {
  const { filtros } = parseQuery("ático en Gràcia para comprar hasta 450k");
  assert.equal(filtros.ciudad, "barcelona");
  assert.equal(filtros.barrio, "Gràcia");
  assert.equal(filtros.operacion, "comprar");
  assert.equal(filtros.precioMax, 450000);
});
test("3 habitaciones no es tipo habitación", () => {
  const { filtros } = parseQuery("3 habitaciones en Bilbao");
  assert.ok(!filtros.tipos?.includes("habitacion"));
  assert.equal(filtros.habMin, 3);
});
test("mascotas y particulares", () => {
  const { filtros } = parseQuery("estudio en Valencia que admita perro, dueño directo");
  assert.ok(filtros.extras?.includes("mascotas"));
  assert.equal(filtros.soloParticulares, true);
});
test("la búsqueda respeta los filtros", () => {
  const r = search({ operacion: "alquilar", q: "piso en Madrid hasta 1500 euros" });
  assert.ok(r.total > 0);
  for (const l of r.items) { assert.equal(l.ciudad, "Madrid"); assert.ok(l.precio <= 1500); assert.equal(l.operacion, "alquilar"); }
});
test("Elgoibar existe", () => {
  const r = search({ operacion: "alquilar", q: "pisos en Elgoibar" });
  assert.ok(r.items.every((l) => l.ciudad === "Elgoibar"));
});
