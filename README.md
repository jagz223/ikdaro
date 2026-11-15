# Ikdaro 읽다로

Mi lista de mangas: los últimos capítulos gratuitos de las series que sigo en Asura Scans, Demonic Scans y Weeb Central, ordenados por la salida más reciente, con marcas de leído guardadas en el navegador.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript estricto · Tailwind CSS 4 · Motion · cheerio · zod · Vitest.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build de producción y servidor |
| `npm test` | Tests de parsers y reglas de dominio |
| `npm run lint` / `npm run typecheck` | ESLint y TypeScript |
| `npm run snapshot` | Lee las tres fuentes y escribe `src/data/snapshot.json` |

## Arquitectura

```
src/domain           Tipos, contrato SeriesSourceReader, reglas de capítulos
src/application      Casos de uso cacheados (feed y detalle) y armado de vistas
src/infrastructure   HTTP con cola por host y reintentos, un lector por sitio, snapshot
src/config/catalog   Las series y su referencia en cada sitio
src/features         Progreso de lectura, tema, idioma, reloj relativo
src/i18n             Diccionarios ES / EN tipados
src/ui/components    Interfaz
```

Añadir un sitio nuevo: crear un lector que cumpla `SeriesSourceReader`, registrarlo en `live-readers.ts` y añadir su id en `domain/source.ts`.

Añadir una serie: una entrada en `src/config/catalog.ts`.

## Datos y caché

Las páginas se prerenderizan y se regeneran cada 30 minutos (`cacheLife("sources")`). Weeb Central se consulta de a una petición y respeta `Retry-After` ante un 429. Los capítulos de Asura con candado o de pago no se muestran.

Las portadas pasan por `/api/cover`, que solo acepta los tres dominios de portadas y queda cacheado una semana en la CDN.

## Despliegue en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel (plan Hobby). No necesita variables de entorno.
2. Listo: modo `live`.

### Plan B si Cloudflare bloquea a Vercel

Síntoma: en la web aparece “Este sitio no respondió” de forma permanente en una fuente.

1. Haz el repo público (minutos de GitHub Actions ilimitados) o revisa tu cuota.
2. En `.github/workflows/snapshot.yml` añade el horario bajo `on:`:
   ```yaml
   schedule:
     - cron: "*/30 * * * *"
   ```
3. En Vercel → Settings → Environment Variables añade `DATA_MODE=snapshot` y redespliega.

El workflow regenera `src/data/snapshot.json` y hace commit solo si cambió; cada commit redespliega Vercel.
