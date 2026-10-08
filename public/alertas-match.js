// Comprueba si un anuncio del índice encaja con los filtros de una alerta.
// Lo usan el service worker (importScripts) y los tests (require).
(function (g) {
  function encaja(l, f) {
    if (l.op !== f.op) return false;
    if (f.provincia && l.prov !== f.provincia) return false;
    if (f.ciudad && l.ciudad !== f.ciudad) return false;
    if (f.barrio && l.barrio !== f.barrio) return false;
    if (f.tipos && f.tipos.length && f.tipos.indexOf(l.tipo) < 0) return false;
    if (f.precioMin && l.precio < f.precioMin) return false;
    if (f.precioMax && l.precio > f.precioMax) return false;
    if (f.m2Min && l.m2 < f.m2Min) return false;
    if (f.m2Max && l.m2 > f.m2Max) return false;
    if (f.habMin && l.hab < f.habMin) return false;
    if (f.banosMin && l.banos < f.banosMin) return false;
    if (f.extras && f.extras.length && !f.extras.every(function (e) { return l.extras.indexOf(e) >= 0; })) return false;
    if (f.part && !l.part) return false;
    if (f.playa && (l.playa === null || l.playa === undefined || l.playa > f.playa)) return false;
    if (f.bbox) { var s = f.bbox[0], w = f.bbox[1], n = f.bbox[2], e = f.bbox[3]; if (l.lat < s || l.lat > n || l.lng < w || l.lng > e) return false; }
    return true;
  }
  // Anuncios nuevos (publicados después de `visto`) que encajan, del más reciente al más antiguo
  function nuevos(items, alerta) {
    var visto = Date.parse(alerta.visto || 0) || 0;
    return items.filter(function (l) { return Date.parse(l.pub) > visto && encaja(l, alerta.filtros); })
      .sort(function (a, b) { return Date.parse(b.pub) - Date.parse(a.pub); });
  }
  g.pisderAlertas = { encaja: encaja, nuevos: nuevos };
  if (typeof module !== "undefined" && module.exports) module.exports = g.pisderAlertas;
})(typeof self !== "undefined" ? self : globalThis);
