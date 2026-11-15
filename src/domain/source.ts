export const SOURCE_IDS = ["asura", "demonic", "weebcentral"] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

export const SOURCE_LABELS: Record<SourceId, { name: string; short: string }> = {
  asura: { name: "Asura Scans", short: "A" },
  demonic: { name: "Demonic Scans", short: "D" },
  weebcentral: { name: "Weeb Central", short: "W" },
};
