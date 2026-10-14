"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/features/auth/api";
import { useUpdatePreferences } from "@/features/profile/api";
import { useLang } from "@/hooks/use-t";
import { setLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "bn", label: "BN", name: "বাংলা" },
  { value: "en", label: "EN", name: "English" },
];

/** BN | EN pill switch. Logged-in users also get AI answers & voice reminders in the chosen language. */
export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang();
  const { data: user } = useMe();
  const update = useUpdatePreferences();
  const qc = useQueryClient();

  const choose = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    if (user && user.language !== next) update.mutate({ language: next });
    // Server messages (toasts, errors) are localised – refresh data shown on screen.
    void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Language / ভাষা"
      className={cn("inline-flex items-center rounded-full border bg-muted/70 p-0.5 text-xs font-bold shadow-inner", className)}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={lang === o.value}
          aria-label={o.name}
          title={o.name}
          onClick={() => choose(o.value)}
          className={cn(
            "min-w-9 rounded-full px-2.5 py-1.5 transition-all",
            lang === o.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
