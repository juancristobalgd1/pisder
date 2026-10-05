# pisoya

Buscador agregador de pisos para España: todos los portales en una sola búsqueda, en lenguaje natural.
Versión española inspirada en el flujo de Roomix (Argentina): misma estructura de pantallas y UX, marca, código y textos propios.

## Qué incluye
- **Portada**: buscador con IA (alquilar / comprar, búsqueda por foto), búsquedas populares, «Tu búsqueda, reinventada», carruseles por ciudad y barrio, sección para inmobiliarias, herramientas, FAQ e índice de precios.
- **Resultados** `/buscar/alquilar` y `/buscar/comprar`: barra «Refina esta búsqueda», chips de lo que entendió la IA (con «Ocultar IA»), filtros en panel lateral, crear alerta (WhatsApp / email), vistas Lista / Dividida / Mapa (el mapa filtra por zona al moverlo), orden y «cargar más».
- **Ficha** `/inmueble/[id]`: galería, precio y €/m² frente al barrio, características, mapa, contacto por WhatsApp sin registro, portales donde aparece y a qué precio, riesgo de estafa y similares.
- **Favoritos y colecciones** sin registro (`/favoritos`).
- **Herramientas**: actualizar alquiler (IPC / IRAV), simulador de hipoteca (fijo o Euríbor + diferencial), detector de estafas, índice de precios.
- **Web estática**: la búsqueda corre en el navegador, lista para GitHub Pages (workflow en `.github/workflows/pages.yml`). Las alertas se guardan en el dispositivo hasta que haya backend.

Adaptado a España: euros, habitaciones y baños (no «ambientes»), gastos de comunidad (no «expensas»), tipos de vivienda locales (ático, dúplex, chalet, habitación…), y ciudades desde Madrid y Barcelona hasta Donostia, Eibar y Elgoibar.

## Arrancar
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # pruebas del intérprete de búsqueda
npm run build   # genera la web estática en out/
```

## Datos
Ahora mismo usa ~1.600 anuncios **de demostración** generados en `lib/data.ts` (fotos de relleno). Para datos reales ver `ingest/README.md`: API oficial de Idealista, feeds de agencias y publicación propia. No se incluye scraping de portales porque va contra sus condiciones de uso.

## Marca
Nombre, dominio y contacto en `lib/brand.ts`.
