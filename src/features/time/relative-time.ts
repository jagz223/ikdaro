const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

export const DAY_MS = 24 * 60 * 60 * 1000;

export function formatRelative(
  iso: string,
  now: number,
  language: string,
  style: Intl.RelativeTimeFormatStyle = "long",
): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(language, { numeric: "auto", style });
  const [unit, size] = UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ["minute", 60];
  return formatter.format(Math.round(seconds / size), unit);
}

export function isRecent(iso: string, now: number | undefined, windowMs = DAY_MS): boolean {
  return now !== undefined && now - new Date(iso).getTime() < windowMs;
}
