# Ingesta de anuncios (arquitectura)

La app lee de `lib/data.ts` (datos demo). En producción se cambia por una tabla `listings` en Postgres alimentada por conectores:

| Fuente | Cómo | Estado |
|---|---|---|
| Idealista | API oficial para partners (hay que solicitar acceso) | por pedir |
| Feeds XML/JSON de agencias | Importación directa (formato Kyero / feed propio) | listo para implementar |
| Particulares | Publicación propia en pisder | por hacer |
| Otros portales | Solo con acuerdo o licencia. Hacer scraping va contra sus condiciones de uso | no recomendado |

## Pipeline
1. `connector.fetch()` → anuncios crudos.
2. `normalize()` → esquema `Listing` (lib/types.ts).
3. `dedupe()` → misma vivienda en varios portales: clave = dirección normalizada + geohash(7) + m² ±3 % + habitaciones. Se guardan todas las fuentes en `fuentes[]`.
4. Upsert en Postgres + índice de búsqueda (Postgres FTS o Meilisearch).
5. Disparo de alertas para las búsquedas guardadas que encajan (WhatsApp Cloud API / email).

## Feeds de inmobiliarias (formato Kyero V3)

La mayoría de CRM inmobiliarios en España (Inmovilla, Witei, Mobilia, Habitania…) exportan un feed XML en formato Kyero V3.
Cuando una inmobiliaria nos da su feed (con permiso para mostrar sus anuncios y fotos), se añade a `ingest/feeds.json`:

```json
[{ "agencia": "Inmobiliaria Ejemplo", "url": "https://.../feed.xml", "telefono": "+34 943 000 000", "web": "https://..." }]
```

`npx tsx ingest/kyero.ts` descarga los feeds y escribe `data/real.json`; el siguiente build los publica con sus fotos reales.
