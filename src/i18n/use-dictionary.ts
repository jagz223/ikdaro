"use client";

import { useLanguage } from "@/features/preferences/preferences";
import { en } from "./en";
import { es } from "./es";

const dictionaries = { es, en };

export function useDictionary() {
  const [language] = useLanguage();
  return { t: dictionaries[language], language };
}
