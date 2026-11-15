import { SourceBlockedError } from "@/domain/series";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 5;
const MAX_JITTER_MS = 2500;
const DEFAULT_RETRY_AFTER_SECONDS = 5;
const MAX_RETRY_AFTER_SECONDS = 15;
const TOO_MANY_REQUESTS = 429;
const CHALLENGE_MARKERS = ["<title>Just a moment...</title>", "cf-chl-widget", "window._cf_chl_opt"];

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function isChallenge(body: string): boolean {
  return CHALLENGE_MARKERS.some((marker) => body.includes(marker));
}

function retryDelayMs(response: Response): number {
  const seconds = Number(response.headers.get("Retry-After")) || DEFAULT_RETRY_AFTER_SECONDS;
  return Math.min(seconds, MAX_RETRY_AFTER_SECONDS) * 1000 + Math.random() * MAX_JITTER_MS;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchText(url: string, attempt = 1): Promise<string> {
  const target = new URL(url);
  const response = await fetch(target, {
    headers: { ...BROWSER_HEADERS, Referer: `${target.origin}/` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === TOO_MANY_REQUESTS && attempt < MAX_ATTEMPTS) {
    await wait(retryDelayMs(response));
    return fetchText(url, attempt + 1);
  }
  const body = await response.text();
  if (!response.ok || isChallenge(body)) throw new SourceBlockedError(url, response.status);
  return body;
}

export async function fetchJson(url: string): Promise<unknown> {
  return JSON.parse(await fetchText(url));
}
