import type { Dictionary } from "./es";

export const en: Dictionary = {
  meta: {
    description: "Your personal manhwa and manga log: the latest chapters from Asura, Demonic and Weeb Central.",
  },
  header: {
    tagline: "My manga list",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    language: "Change language",
    home: "Ikdaro, home",
  },
  hero: {
    label: "Latest releases",
    newArrival: "New chapter",
    readChapter: (name) => `Read ${name}`,
    viewSeries: "View series",
    releasedOn: (source) => `Out on ${source}`,
    pendingInSeries: (count) =>
      count === 0 ? "All caught up" : count === 1 ? "1 recent chapter unread" : `${count} recent chapters unread`,
    availableOn: (count) => (count === 1 ? "On 1 site" : `On ${count} sites`),
    showSlide: (index, title) => `Show ${index}: ${title}`,
    pause: "Pause rotation",
    play: "Resume rotation",
  },
  counter: {
    label: "Time since the latest release",
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
    since: "since it came out on",
  },
  nav: {
    week: "This week",
    latest: "Latest",
    light: "Light",
    dark: "Dark",
  },
  ticker: {
    label: "Latest releases",
  },
  week: {
    heading: "This week",
    today: "Today",
    empty: "No releases",
    finding: (count) => (count === 1 ? "1 release in the last 7 days." : `${count} releases in the last 7 days.`),
    more: (count) => `+${count} more`,
  },
  feed: {
    heading: "Latest updates",
    finding: (pending, total) =>
      pending === 0
        ? `You are caught up on all ${total} series.`
        : `${pending} of ${total} series have their latest chapter unread.`,
    search: "Search series",
    allSources: "All",
    onlyPending: "Unread only",
    empty: "No series match these filters.",
    clearFilters: "Clear filters",
    pendingBadge: "You have unread new chapters",
    caughtUpBadge: "You are caught up",
  },
  source: {
    unavailable: "This site did not respond. It will be retried on the next refresh.",
    noChapters: "No free chapters yet.",
    tabsLabel: "Sites",
  },
  chapter: {
    name: (chapter) => `${chapter.season ? `S${chapter.season} · ` : ""}Chapter ${chapter.number}`,
    markRead: (name) => `Mark ${name} as read`,
    markUnread: (name) => `Unmark ${name}`,
    isNew: "New",
    opensIn: (source) => `opens on ${source}`,
  },
  detail: {
    back: "Back to the list",
    chapters: (count) => (count === 1 ? "1 chapter" : `${count} chapters`),
    progress: (read, total) => `${read} of ${total} read`,
    latest: "Latest chapter",
    newest: "Newest first",
    oldest: "Oldest first",
    searchChapters: "Search chapter",
    noMatches: "No chapter matches.",
    openSeries: (source) => `Open on ${source}`,
    readLatest: (name) => `Read ${name}`,
    notFound: "This series is not on your list.",
  },
  footer: {
    note: "Ikdaro links to chapters on their original sites. Refreshes every 30 minutes.",
    seriesCount: (count) => `${count} series followed`,
  },
};
