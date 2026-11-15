"use client";

import { AnimatePresence, motion } from "motion/react";

interface ReadCheckProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function ReadCheck({ checked, label, onChange }: ReadCheckProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="group relative grid size-8 shrink-0 cursor-pointer place-items-center"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0.5 rounded-[5px] border-[1.5px] border-dashed transition-colors duration-300 ${
          checked ? "border-transparent" : "border-ink-faint/60 group-hover:border-lacquer"
        }`}
      />
      <span
        aria-hidden="true"
        className={`font-mincho text-sm font-bold transition-opacity duration-200 ${
          checked ? "opacity-0" : "text-ink-faint/70 group-hover:text-lacquer"
        }`}
      >
        未
      </span>
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center rounded-[5px] bg-lacquer font-mincho text-[0.95rem] font-extrabold text-lacquer-ink shadow-[inset_0_0_0_2px_var(--lacquer),inset_0_0_0_3px_var(--lacquer-ink)]"
            initial={{ scale: 1.9, opacity: 0, rotate: -24 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            exit={{ scale: 0.6, opacity: 0, rotate: 8, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 520, damping: 18, mass: 0.7 }}
          >
            読
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
