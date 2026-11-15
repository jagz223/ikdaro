import type { NextConfig } from "next";

const THIRTY_MINUTES = 60 * 30;
const FIVE_MINUTES = 60 * 5;
const ONE_DAY = 60 * 60 * 24;
const ONE_MINUTE = 60;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    sources: { stale: FIVE_MINUTES, revalidate: THIRTY_MINUTES, expire: ONE_DAY },
    sourceFailure: { stale: ONE_MINUTE, revalidate: ONE_MINUTE, expire: FIVE_MINUTES },
  },
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
