import type { ChapterIdentity } from "@/domain/chapter-number";

export const es = {
  meta: {
    description: "Tu registro personal de manhwa y manga: los últimos capítulos de Asura, Demonic y Weeb Central.",
  },
  header: {
    tagline: "Mi lista de mangas",
    toLight: "Cambiar a tema claro",
    toDark: "Cambiar a tema oscuro",
    language: "Cambiar idioma",
    home: "Ikdaro, inicio",
  },
  hero: {
    label: "Estrenos más recientes",
    newArrival: "Nuevo capítulo",
    readChapter: (name: string) => `Leer ${name}`,
    viewSeries: "Ver serie",
    releasedOn: (source: string) => `Salió en ${source}`,
    pendingInSeries: (count: number) =>
      count === 0 ? "Todo al día" : count === 1 ? "1 capítulo reciente sin leer" : `${count} capítulos recientes sin leer`,
    availableOn: (count: number) => (count === 1 ? "En 1 sitio" : `En ${count} sitios`),
    showSlide: (index: number, title: string) => `Mostrar ${index}: ${title}`,
    pause: "Pausar rotación",
    play: "Reanudar rotación",
  },
  counter: {
    label: "Tiempo desde el último estreno",
    days: "Días",
    hours: "Horas",
    minutes: "Min",
    seconds: "Seg",
    since: "desde el estreno en",
  },
  nav: {
    week: "Esta semana",
    latest: "Últimas",
    light: "Claro",
    dark: "Oscuro",
  },
  ticker: {
    label: "Últimos estrenos",
  },
  week: {
    heading: "Esta semana",
    today: "Hoy",
    empty: "Sin estrenos",
    finding: (count: number) => (count === 1 ? "1 estreno en los últimos 7 días." : `${count} estrenos en los últimos 7 días.`),
    more: (count: number) => `+${count} más`,
  },
  feed: {
    heading: "Últimas actualizaciones",
    finding: (pending: number, total: number) =>
      pending === 0
        ? `Estás al día con las ${total} series.`
        : `${pending} de ${total} series tienen su último capítulo sin leer.`,
    search: "Buscar serie",
    allSources: "Todas",
    onlyPending: "Solo pendientes",
    empty: "Ninguna serie coincide con estos filtros.",
    clearFilters: "Quitar filtros",
    pendingBadge: "Tienes capítulos nuevos sin leer",
    caughtUpBadge: "Estás al día",
  },
  source: {
    unavailable: "Este sitio no respondió. Se reintentará en la próxima actualización.",
    noChapters: "Sin capítulos gratuitos todavía.",
    tabsLabel: "Sitios",
  },
  chapter: {
    name: (chapter: ChapterIdentity) => `${chapter.season ? `T${chapter.season} · ` : ""}Capítulo ${chapter.number}`,
    markRead: (name: string) => `Marcar ${name} como leído`,
    markUnread: (name: string) => `Desmarcar ${name}`,
    isNew: "Nuevo",
    opensIn: (source: string) => `abre en ${source}`,
  },
  detail: {
    back: "Volver a la lista",
    chapters: (count: number) => (count === 1 ? "1 capítulo" : `${count} capítulos`),
    progress: (read: number, total: number) => `${read} de ${total} leídos`,
    latest: "Último capítulo",
    newest: "Recientes primero",
    oldest: "Antiguos primero",
    searchChapters: "Buscar capítulo",
    noMatches: "Ningún capítulo coincide.",
    openSeries: (source: string) => `Abrir en ${source}`,
    readLatest: (name: string) => `Leer ${name}`,
    notFound: "Esta serie no está en tu lista.",
  },
  footer: {
    note: "Ikdaro enlaza a los capítulos en sus sitios originales. Actualiza cada 30 minutos.",
    seriesCount: (count: number) => `${count} series en seguimiento`,
  },
};

export type Dictionary = typeof es;
