"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getLang, getServerLang, localDigits, subscribeLang, type Lang } from "@/lib/i18n";

export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, getServerLang);
}

/**
 * `t("English text", "বাংলা লেখা")` – returns the string for the current language.
 * Keeping both versions side by side means no key can ever go missing.
 */
export function useT() {
  const lang = useLang();
  const t = useCallback((en: string, bn: string) => (lang === "en" ? en : bn), [lang]);
  const n = useCallback((value: string | number) => localDigits(value, lang), [lang]);
  /** Same as `t` for an `[english, bangla]` pair. */
  const tp = useCallback((pair: readonly [string, string]) => (lang === "en" ? pair[0] : pair[1]), [lang]);
  return { t, tp, n, lang };
}
