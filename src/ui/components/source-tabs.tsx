"use client";

import { motion } from "motion/react";
import { useId, type KeyboardEvent } from "react";
import { SOURCE_LABELS, type SourceId } from "@/domain/source";
import { useDictionary } from "@/i18n/use-dictionary";

interface SourceTabsProps {
  sources: SourceId[];
  active: SourceId;
  onSelect: (sourceId: SourceId) => void;
  panelId: string;
  variant?: "short" | "full";
}

const NEXT_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function SourceTabs({ sources, active, onSelect, panelId, variant = "short" }: SourceTabsProps) {
  const { t } = useDictionary();
  const indicatorId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS[event.key];
    if (!step) return;
    event.preventDefault();
    const next = sources[(sources.indexOf(active) + step + sources.length) % sources.length];
    onSelect(next);
    document.getElementById(`${panelId}-tab-${next}`)?.focus();
  };

  return (
    <div role="tablist" aria-label={t.source.tabsLabel} onKeyDown={onKeyDown} className="flex gap-4">
      {sources.map((sourceId) => {
        const selected = sourceId === active;
        return (
          <button
            key={sourceId}
            id={`${panelId}-tab-${sourceId}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            title={SOURCE_LABELS[sourceId].name}
            onClick={() => onSelect(sourceId)}
            className={`relative cursor-pointer pb-1.5 text-sm transition-colors ${
              selected ? "font-bold text-ink" : "font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {variant === "full" ? SOURCE_LABELS[sourceId].name : SOURCE_LABELS[sourceId].name.split(" ")[0]}
            {selected && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-x-0 bottom-0 h-[3px] bg-lacquer"
                transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
