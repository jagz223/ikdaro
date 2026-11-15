import type { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["cdn.asurascans.com", "temp.compsci88.com", "readermc.org"]);
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;
const REQUEST_TIMEOUT_MS = 10_000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function allowedTarget(raw: string | null): URL | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const target = allowedTarget(request.nextUrl.searchParams.get("url"));
  if (!target) return new Response("Not allowed", { status: 400 });

  const upstream = await fetch(target, {
    headers: { "User-Agent": BROWSER_USER_AGENT, Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  }).catch(() => undefined);

  const contentType = upstream?.headers.get("content-type") ?? "";
  if (!upstream?.ok || !contentType.startsWith("image/")) return new Response("Cover unavailable", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${ONE_WEEK_SECONDS}, s-maxage=${ONE_WEEK_SECONDS}, stale-while-revalidate=${ONE_WEEK_SECONDS}`,
    },
  });
}
