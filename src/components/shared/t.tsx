"use client";

import { useT } from "@/hooks/use-t";

/** Inline translated text for server components: `<T en="Hello" bn="হ্যালো" />`. */
export function T({ en, bn }: { en: string; bn: string }) {
  const { t } = useT();
  return <>{t(en, bn)}</>;
}
