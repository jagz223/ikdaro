# Prompt — IKDARO 읽다로 · Tracker personal de manhwa / manga

> Versión final v2.
>
> **Nombre:** *Ikdaro* viene de 읽다 (*ikda*, "leer") + 로 (*-ro*, "hacia"): "hacia la lectura". Se escribe 읽다로.

---

## 1. Objetivo

Construye una web personal que siga una lista fija de manhwas/mangas en tres sitios (Demonic Scans, Asura Scans, Weeb Central), muestre sus últimos capítulos ordenados por el capítulo más reciente, deje marcar capítulos como leídos y lleve directo al capítulo en el sitio original. Sin base de datos ni servidor propio. Se despliega gratis en Vercel (plan Hobby).

## 2. Stack (obligatorio)

- **Next.js 15 (App Router) + TypeScript en modo `strict`**
- **Tailwind CSS v4** para estilos y tokens de diseño en `@theme`
- **Motion** (`motion/react`) para animaciones; respeta `prefers-reduced-motion`
- **cheerio** para parsear el HTML de Demonic y Weeb Central
- **zod** para validar todo dato externo (respuesta de API o HTML parseado) antes de que llegue al dominio
- **Vitest** para tests de parsers con fixtures HTML/JSON guardados
- Antes de escribir código de cualquier librería, consulta su documentación actual con Context7

## 3. Restricciones de código

- Sin comentarios en el código. Los nombres explican la intención.
- Clean Code: funciones cortas, un nivel de abstracción por función, sin números ni strings mágicos, sin `any`.
- SOLID aplicado de verdad:
  - **S**: cada fuente tiene su adaptador; cada adaptador solo sabe hablar con su sitio.
  - **O**: añadir una cuarta fuente = crear un adaptador y registrarlo, sin tocar casos de uso ni UI.
  - **L**: todos los adaptadores cumplen el mismo contrato y son intercambiables.
  - **I**: interfaces pequeñas (`LatestChaptersReader`, `ChapterListReader`).
  - **D**: los casos de uso dependen de las interfaces del dominio, nunca de cheerio ni de `fetch`.
- No metas abstracciones que nadie pidió. Si algo se puede resolver con una función, no crees una clase.

## 4. Arquitectura

```
src/
  domain/
    series.ts            Series, SourceId, SourceEntry
    chapter.ts           Chapter { number, title?, publishedAt, url, sourceId, locked? }
    ports.ts             LatestChaptersReader, ChapterListReader
  application/
    get-latest-feed.ts   junta las fuentes, fusiona, ordena por último capítulo
    get-series-detail.ts lista completa por fuente
    pick-default-source.ts elige la fuente con el capítulo gratuito más reciente
  infrastructure/
    http/fetch-html.ts   fetch con User-Agent, timeout, revalidate de Next
    sources/
      asura/             adapter + schema zod + fixture
      demonic/           adapter + parser cheerio + fixture
      weebcentral/       adapter + parser cheerio + fixture
      snapshot/          adapter que lee public/data/*.json (plan B, sección 9)
      registry.ts        Map<SourceId, adapter>, elige live o snapshot según DATA_MODE
  config/
    catalog.ts           catálogo de series (sección 7)
  features/
    read-progress/       store en localStorage + hook useSyncExternalStore
    preferences/         tema (dark/light) e idioma (es/en) en localStorage
  i18n/
    es.ts, en.ts         diccionarios tipados con la misma forma
scripts/
  snapshot.ts            ejecuta los adaptadores live y escribe public/data/*.json
  ui/
    components/          SeriesCard, ChapterRow, ReadCheck, SourceTabs, Cover...
    motion/              variantes de animación compartidas
app/
  page.tsx               portada: feed
  series/[slug]/page.tsx detalle con pestañas por fuente
  api/cover/route.ts     proxy de portadas (solo si hay hotlink protection)
```

- La obtención de datos ocurre en **Server Components** con `fetch(url, { next: { revalidate: 1800 } })` (ISR). Así no hay backend propio, el navegador no choca con CORS y los sitios se consultan como mucho cada 30 min.
- Si una fuente falla, la página se renderiza igual con las otras y muestra un estado discreto de “fuente no disponible”. Nunca rompe la página entera.
- Cada fuente se consulta en paralelo (`Promise.allSettled`).

## 5. Fuentes (endpoints verificados el 14-11-2026)

### Asura Scans — API JSON
- Buscar / metadatos: `GET https://api.asurascans.com/api/series?search={texto}` → `title`, `slug`, `cover`, `status`, `type`, `last_chapter_at`, `latest_chapters[]`, `public_url`, `genres`.
- Capítulos: `GET https://api.asurascans.com/api/series/{slug}/chapters` → `number`, `published_at`, `is_premium`, `early_access_until`.
- URL pública del capítulo: `https://asurascans.com{public_url}/chapter/{number}`.
- **Solo capítulos gratuitos y disponibles**: descarta todo capítulo con `is_premium === true` o con `early_access_until` posterior a la hora actual. Lo bloqueado no existe para la app: ni en la portada, ni en el detalle, ni para ordenar.

### Weeb Central — HTML
- Serie: `https://weebcentral.com/series/{id}/{slug}` → portada en `og:image`.
- Lista completa: `https://weebcentral.com/series/{id}/full-chapter-list` → enlaces `/chapters/{chapterId}`, texto `Chapter N`, `datetime` ISO.

### Demonic Scans — HTML
- Serie: `https://demonicscans.org/manga/{slug}` → portada en `og:image`, lista de capítulos en la misma página.
- URL del capítulo: `https://demonicscans.org/chaptered.php?manga={id}&chapter={n}`.
- Fecha por capítulo: parsear `YYYY-MM-DD` de cada fila.

Cada parser tiene un test con su fixture real. Si el HTML cambia, falla el test y no la web.

## 6. Funcionalidad

### Portada
- Una tarjeta por serie con portada, título y **sus últimos 3 capítulos gratuitos**.
- Si la serie existe en varias fuentes, la tarjeta tiene **pestañas por fuente** (Asura / Demonic / Weeb) y cada pestaña muestra los últimos 3 de esa fuente.
- La pestaña **preseleccionada** es la fuente con el capítulo gratuito publicado más recientemente.
- Orden de las tarjetas: por la fecha del capítulo gratuito más reciente de cualquier fuente, de más nuevo a más viejo.
- Cada capítulo muestra número, fecha relativa (“hace 3 h”), insignia de la fuente y un check de leído.
- Clic en el capítulo → abre ese capítulo en el sitio original (nueva pestaña).
- Clic en el título o la portada → `/series/[slug]`.
- Filtros: buscar por nombre, filtrar por fuente, ocultar series sin capítulos nuevos sin leer.

### Detalle de serie
- Hero con portada grande, título, títulos alternativos, estado y tipo.
- Pestañas, una por cada fuente donde existe la serie. Solo aparecen las fuentes con entrada en el catálogo. Preseleccionada: la de la salida más reciente (misma regla que la portada).
- Lista completa de capítulos de la fuente activa, buscable y con orden ascendente/descendente.
- Mismo check de leído que en la portada, sincronizado en vivo entre ambas pantallas.
- Clic en un capítulo → abre ese capítulo en el sitio original.

### Check de leído
- Se guarda en `localStorage` bajo una única clave versionada (`manrok:read:v1`).
- Marcar lo guarda; desmarcar lo borra (no deja `false`, elimina la entrada).
- Clave del capítulo: `{seriesSlug}:{chapterNumber}`, **independiente de la fuente**. Marcar el capítulo 50 en Asura lo marca también en Demonic y Weeb.
- Normaliza el número (`"50"`, `"50.0"` y `50` son el mismo capítulo; `50.5` es otro distinto).
- Sincroniza entre pestañas con el evento `storage`.
- Lectura con `useSyncExternalStore` para que no haya desajuste de hidratación.
- Sin exportar/importar.

### Preferencias
- **Tema**: botón dark/light en la cabecera. Se guarda en `localStorage` (`manrok:theme`). En la primera visita usa `prefers-color-scheme`. Aplica el tema con un script inline en `<head>` antes del primer pintado para que no haya parpadeo.
- **Idioma**: botón ES/EN en la cabecera. Se guarda en `localStorage` (`manrok:lang`). En la primera visita usa `navigator.language`. Todos los textos de la UI salen de `i18n/es.ts` y `i18n/en.ts`, con el mismo tipo para que falte una traducción = error de compilación. Las fechas relativas usan `Intl.RelativeTimeFormat` en el idioma activo. Los títulos de las series no se traducen.

## 7. Catálogo

Una serie = una entrada, aunque cada sitio la llame distinto. `slug` interno en kebab-case.

| Serie (nombre canónico) | Asura (`/comics/…`) | Demonic (`/manga/…`) | Weeb Central (`/series/…`) |
|---|---|---|---|
| The Last Master of Jongnam Sect | — | The-Last-Master-of-Jongnam-Sect | — |
| Skeleton Soldier | — | Skeleton-Soldier | 01J76XYCRFYM9JT9WE2M8Q6D6T/Skeleton-Soldier-Couldnt-Protect-The-Dungeon |
| Superhuman Era | — | Superhuman-Era | 01JJCB9WGMBX1D4VTE7X7J2JAQ/the-superhuman-era |
| Reformation of the Deadbeat Noble (The Lazy Lord Masters the Sword) | reformation-of-the-deadbeat-noble-f212c582 | Reformation-Of-The-Deadbeat-Noble | 01J76XYEZWRB4MRT7EHVVPEDXV/Reformation-of-the-Deadbeat-Noble |
| Swordmaster's Youngest Son | swordmasters-youngest-son-f212c582 | Swordmaster%2527s-Youngest-Son | — |
| The Knight of Embers | — | The-Knight-of-Embers | 01J76XYEVH4687SJ1FY602R4JP/The-Ember-Knight |
| The Wandering Knight's Survival Manual | the-wandering-knights-survival-manual-f212c582 | The-Wandering-Knight%2527s-Survival-Manual | — |
| Hardcore Leveling Warrior | — | Hardcore-Leveling-Warrior | 01J76XYBPH622HYFF8K397PYR7/Hardcore-Leveling-Warrior |
| The War of Corpses | — | The-War-of-Corpses | 01K0C68QJ5T181NP5XSGKQ1R8N/war-of-corpses |
| Doctor's Rebirth | doctors-rebirth-f212c582 | Doctor%2527s-Rebirth | — |
| The Wind Mage | — | The-Wind-Mage | — |
| The Archmage Transcending Through Regression | archmage-transcending-through-regression-f212c582 | The-Archmage-Transcending-Through-Regression | 01J76XYG8CARE2MWTE3C5NG4RZ/The-Great-Wizard-Transcendent |
| Survival Story of a Sword King in a Fantasy World (Latna Saga) | — | Survival-Story-of-a-Sword-King-in-a-Fantasy-World | 01J76XYDTDB5T14BKD51MJHNKF/Survival-Story-of-a-Sword-King-in-a-Fantasy-World |
| Absolute Sword Sense | absolute-sword-sense-f212c582 | Absolute-Sword-Sense | 01JJ2D2B46DZ8QYPVGNVC63V3E/absolute-sword-sense |
| Infinite Mage | infinite-mage-f212c582 | Infinite-Mage | 01JRZATJ2P56YN7DNT6CXQBMEN/the-infinite-mage |
| Tales of Demons and Gods | — | Tales-of-Demons-and-Gods | 01J76XYBBSN5EJ5GTKCBB253NT/Tales-Of-Demons-And-Gods |
| The Shepherd Wizard | the-shepherd-wizard-f212c582 | The-Shepherd-Wizard | 01KX60V3G890XFPFYR0CFS0HJJ/the-shepherd-wizard |
| The Regressed Mercenary's Machinations | the-regressed-mercenarys-machinations-f212c582 | The-Regressed-Mercenary%2527s-Machinations | 01JNKHGT37KPS3KBVA5CG1X7V0/the-regressed-mercenary-has-a-plan |
| The Dark Magician Transmigrates After 66666 Years | the-dark-magician-transmigrates-after-66666-years-f212c582 | The-Dark-Magician-Transmigrates-After-66666-Years | 01J76XYEZZ9J2810N80XATRD3V/The-Dark-Magician-Transmigrates-After-66666-Years |
| Omniscient Reader's Viewpoint | omniscient-readers-viewpoint-f212c582 | Omniscient-Reader%2527s-Viewpoint | 01J76XYDMWWJX3T4BFWR84FQQK/Omniscient-Readers-Viewpoint |
| The Beginning After the End | — | The-Beginning-After-the-End | 01J76XYE23859ZWDP7BJ520AKY/The-Beginning-After-The-End |
| Trash of the Count's Family (Lout of Count's Family) | trash-of-the-counts-family-f212c582 | Trash-of-the-Count%2527s-Family | 01J76XYE153CVDWZ5JB5VGGB2M/Trash-of-the-Counts-Family |
| Return of the Mount Hua Sect (Return of the Blossoming Blade) | return-of-the-mount-hua-sect-f212c582 | Return-of-the-Mount-Hua-Sect | 01J76XYEVCSS5ANBCJZ4ZF9P65/Return-of-the-Blossoming-Blade |
| Dungeon Odyssey | dungeon-odyssey-f212c582 | Dungeon-Odyssey | 01JNKGRKJ61H73S8M5CKZ5FKWD/dungeon-odyssey |
| Star-Embracing Swordmaster | star-embracing-swordmaster-f212c582 | Star%25252DEmbracing-Swordmaster | — |
| Absolute Regression | absolute-regression-f212c582 | Absolute-Regression | 01JGBYTDYCGFHJCQ16JBW69SZB/absolute-regression |
| Clevatess | — | Clevatess-%25252D-Maju-no-O-to-Akago-to-Kabane-no-Yusha-%255BALL-CHAPTERS%255D | 01J76XYFBKRNDYWQP1WC24QDM7/Clevatess |
| Moonchild | — | — | 01JMMEVK738XETJ6MM5NGEAH3K/moonchild |
| The Second Life Is a Healing Life? | — | My-Second-Life-is-a-Healing-Life%253F | 01KD8AVB7090XYQ6GPZP5FM5HR/the-second-life-is-a-healing-life |
| The Bugle Call (Sensou Kyoushitsu) | — | — | 01J76XYGW6F702H48WE54YDYTS/Sensou-Kyoushitsu |
| Hunter x Hunter | — | Hunter-x-Hunter | 01J76XY7EXQV9RE9KQ3JYE0WZ9/Hunter-X-Hunter |
| Tower Dungeon | — | — | 01J76XYGYHXDBJDTHB6JT8MNXY/Tower-Dungeon |
| Teenage Mercenary (Mercenary Enrollment) | — | Mercenary-Enrollment | 01J76XYEA95PG5AVMCKC9TK492/Mercenary-Enrollment |
| Doom Breaker (Reincarnation of the Suicidal Battle God) | reincarnation-of-the-suicidal-battle-god-f212c582 | — | 01J76XYEZ1BQJM22H3RREE1XMG/Doom-Breaker |
| Welcome to Demon School! Iruma-kun | — | Mairimashita%2521-Iruma%25252Dkun | 01J76XYC5SVSG0YGGA1EN740VW/Mairimashita-Iruma-kun |
| Rakujitsu no Pathos | — | — | 01J76XYCD8NR3XZJHGGKYRVEA7/Rakujitsu-No-Pathos |
| Kingdom | — | Kingdom | 01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom |
| Lookism | — | Lookism | 01J76XYBD282Y3XKX0KRGD64Q5/Lookism |
| Viral Hit | — | — | 01J76XYE8HKQ5KFPY5MRR9CNCR/Viral-Hit |
| The World After the Fall (The World After the End) | the-world-after-the-end-f212c582 | The-World-After-the-Fall | 01J76XYFA2SNRMQT60JEWDRZRW/The-World-After-the-Fall |
| A Flame Reborn (Regressor of the Fallen Family) | regressor-of-the-fallen-family-f212c582 | Regressor-of-the-Fallen-family | 01JGBYWKFZ1BNQ7M99CNQ38D49/a-flame-reborn |

Fuera: *Just a Goblin* (no está en ninguna de las 3).

Portada: usa la de Asura si existe (mejor calidad), luego Weeb Central, luego Demonic.

## 8. Dirección visual

Usa a fondo las skills de diseño (`impeccable`, `design-taste-frontend`, `antislop`, `antislop-ui`, `emil-design-eng`, `animate`). Las referencias de Asura solo dictan **qué información** va en cada lista, no cómo se ve.

**Concepto: “tinta y laca”.** Estética editorial que mezcla Japón (sumi-e, washi, hanko), China (laca bermellón, dorado viejo) y Corea (hanji, dancheong como acento). Moderna y premium, no temática de disfraz.

- **Paleta**: tokens semánticos en `:root` con dos temas completos.
  - *Dark (noche de tinta)*: fondo `#0E0D0C`, superficie `#181614`, texto `#EDE6D6`, bermellón laca `#D23C26`, dorado viejo `#C2A066`, jade `#5E7D6C`.
  - *Light (papel washi)*: fondo `#EDE6D6`, superficie `#F6F1E6`, texto `#1A1714`, bermellón `#B32B17`, dorado `#8E6F3A`, jade `#3F5B4D`.
  - Comprueba contraste AA en ambos temas.
- **Tipografía**: display con carácter (serif de alto contraste estilo *Shippori Mincho* / *Noto Serif JP* para kanji decorativos, y una sans geométrica ancha con tracking amplio para títulos, como la referencia de la iguana). Texto en una sans legible.
- **Hero de portada (referencia principal: la imagen de la iguana)**:
  - La serie con el capítulo gratuito más reciente ocupa un hero **a sangre**: su portada grande, recortada y con viñeteado profundo que se funde con el fondo. Detrás, la misma portada muy desenfocada y ampliada, como el fondo borroso de la referencia.
  - A la izquierda, título enorme con tracking amplio. Debajo, un subtítulo más fino (último capítulo y fuente) y un párrafo corto (estado, tipo, géneros).
  - Una línea vertical fina con indicadores pequeños, como la columna de redes de la referencia. Aquí son las fuentes disponibles (A / D / W) y un contador de capítulos sin leer.
  - El nombre de la serie en kanji/hangul como sello vertical bermellón, en el borde.
  - El hero rota suavemente entre las 5 series más recientes, con un crossfade del fondo y el texto entrando escalonado. Se puede pausar con hover y con foco.
  - Navegación arriba: logo `IKDARO 읽다로`, buscador y los botones de tema e idioma.
- **Detalles**: sello hanko rojo como “nuevo” en capítulos no leídos de menos de 24 h, textura de papel sutil (SVG noise), patrón seigaiha (olas) en separadores, líneas finas tipo cuadrícula de pergamino.
- **Animación**:
  - Entrada escalonada de tarjetas al hacer scroll.
  - Hover en tarjeta: portada con leve parallax/tilt y brillo de laca.
  - Check de leído: trazo de pincel que se dibuja (SVG `pathLength`), con micro-rebote.
  - Transición portada → detalle con `layoutId` compartido en la portada (la imagen “vuela” a su sitio).
  - Pestañas de fuente con indicador deslizante.
  - Skeletons con brillo tipo tinta mientras carga.
- **Responsive**: móvil primero; en móvil una columna, en escritorio grid de 2–3 columnas como la referencia.
- **Accesibilidad**: contraste AA, foco visible, checks operables con teclado, `aria-label` en enlaces externos, `prefers-reduced-motion` desactiva parallax y transiciones grandes.
- Verifica con Playwright cada pantalla en 390 px y 1440 px antes de dar por terminado.

## 9. Despliegue

- Repo en GitHub → importar en Vercel (Hobby). Sin variables de entorno.
- `next/image` con `remotePatterns` para `cdn.asurascans.com`, `temp.compsci88.com`, `readermc.org`. Si alguna portada bloquea hotlink, sírvela por `app/api/cover/route.ts`.
### Anti-bloqueo de Cloudflare (de lo más simple a lo más robusto)

1. **Por defecto (`DATA_MODE=live`)**: ISR en Vercel. Peticiones con cabeceras de navegador real (`User-Agent` de Chrome actual, `Accept`, `Accept-Language`, `Referer` del propio sitio). Como mucho una petición por URL cada 30 min gracias a la caché. Asura va por su API JSON, que es lo menos sensible a bloqueos. Mete las peticiones a un mismo sitio en una cola con concurrencia 3, sin ráfagas de 40 a la vez.
2. **Detección**: si una respuesta es 403/503 o su HTML contiene `cf-chl` / `Just a moment`, el adaptador lanza `SourceBlockedError`. La UI muestra “fuente no disponible” solo en esa pestaña, y la revalidación siguiente lo vuelve a intentar.
3. **Plan B (`DATA_MODE=snapshot`)**: `.github/workflows/snapshot.yml` con `cron: "*/30 * * * *"` ejecuta `npm run snapshot` (los mismos adaptadores live), escribe `public/data/*.json` y hace commit solo si cambió algo. Vercel redespliega solo, sin pasar de su límite de 100 deploys/día. La app lee esos JSON con el adaptador `snapshot`. Para cambiar de modo basta una variable de entorno en Vercel; ni los casos de uso ni la UI se tocan. Repo público = minutos de Actions ilimitados.
4. Déjalo todo listo desde el principio: el workflow existe pero empieza desactivado (`workflow_dispatch` solamente). Documenta en el README cómo activarlo.

## 10. Definición de hecho

- `npm run build`, `npm run lint`, `npm run test` en verde.
- Cada adaptador tiene test con fixture.
- La portada carga con una fuente caída.
- Marcar/desmarcar persiste tras recargar y se refleja en ambas pantallas y en todas las fuentes.
- Tema e idioma persisten tras recargar, sin parpadeo.
- Ningún capítulo bloqueado o de pago de Asura aparece en ninguna parte.
- La pestaña preseleccionada de cada serie es la de la salida gratuita más reciente.
- `DATA_MODE=snapshot` funciona con los JSON generados por `npm run snapshot`.
- Capturas Playwright en móvil y escritorio revisadas.
