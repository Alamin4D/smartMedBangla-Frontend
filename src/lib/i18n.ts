/**
 * Tiny language store shared by React (via useSyncExternalStore) and plain modules
 * (API client, date formatting). Bangla is the default; the choice is persisted locally.
 */
export type Lang = "bn" | "en";

const STORAGE_KEY = "sm-lang";
let current: Lang = "bn";
const listeners = new Set<() => void>();

export const getLang = () => current;
export const getServerLang = (): Lang => "bn";

export function subscribeLang(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLang(lang: Lang) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = lang;
  }
  if (lang === current) return;
  current = lang;
  listeners.forEach((l) => l());
}

/** The language the visitor explicitly picked on this device, if any. */
export function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "bn" ? v : null;
  } catch {
    return null;
  }
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Converts ASCII digits to Bangla digits when the UI is in Bangla. */
export const localDigits = (value: string | number, lang: Lang = current) =>
  lang === "bn" ? String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]!) : String(value);
