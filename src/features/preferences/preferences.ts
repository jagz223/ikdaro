"use client";

import { createPersistentStore, usePersistentStore } from "@/features/persistent-store";
import { LANGUAGE_KEY, THEME_KEY } from "./keys";

export type Theme = "dark" | "light";
export type Language = "es" | "en";

const oneOf =
  <T extends string>(...values: T[]) =>
  (raw: string): T | undefined =>
    values.find((value) => value === raw);

const themeStore = createPersistentStore<Theme>({
  key: THEME_KEY,
  serverValue: "dark",
  fallback: () => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
  parse: oneOf<Theme>("dark", "light"),
  serialize: (value) => value,
  onChange: (value) => {
    document.documentElement.dataset.theme = value;
  },
});

const languageStore = createPersistentStore<Language>({
  key: LANGUAGE_KEY,
  serverValue: "es",
  fallback: () => (navigator.language.toLowerCase().startsWith("es") ? "es" : "en"),
  parse: oneOf<Language>("es", "en"),
  serialize: (value) => value,
  onChange: (value) => {
    document.documentElement.lang = value;
  },
});

export function useTheme() {
  return [usePersistentStore(themeStore), themeStore.set] as const;
}

export function useLanguage() {
  return [usePersistentStore(languageStore), languageStore.set] as const;
}
