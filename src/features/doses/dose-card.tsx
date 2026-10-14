"use client";

import { Check, Clock, Loader2, RotateCcw, SkipForward, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNow } from "@/hooks/use-now";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { fmtTime, MEAL_LABELS } from "@/lib/format";
import { localDigits } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/voice";
import type { Dose } from "@/types";
import { useUpdateDose } from "./api";
import { useT } from "@/hooks/use-t";

const STATUS: Record<Dose["status"], { en: string; bn: string; variant: "success" | "destructive" | "secondary" | "outline" }> = {
  TAKEN: { en: "Taken", bn: "খেয়েছেন", variant: "success" },
  MISSED: { en: "Missed", bn: "বাদ পড়েছে", variant: "destructive" },
  SKIPPED: { en: "Skipped", bn: "এড়িয়ে গেছেন", variant: "secondary" },
  PENDING: { en: "Upcoming", bn: "আসছে", variant: "outline" },
};

export function DoseCard({ dose, patientId, highlight }: { dose: Dose; patientId?: string; highlight?: boolean }) {
  const update = useUpdateDose(patientId);
  const now = useNow();
  const due = dose.status === "PENDING" && new Date(dose.scheduledFor).getTime() <= now;
  const canAct = dose.status === "PENDING" || dose.status === "MISSED";
  const meal = MEAL_LABELS[dose.medicine.mealTiming];
  const { t, lang } = useT();
  const status = due ? { label: t("Due now", "এখন খাওয়ার সময়"), variant: "default" as const } : { label: t(STATUS[dose.status].en, STATUS[dose.status].bn), variant: STATUS[dose.status].variant };

  const mark = (next: "TAKEN" | "SKIPPED" | "PENDING") =>
    update.mutate({ id: dose.id, status: next }, { onSuccess: (r) => toast.success(r.message), onError: (e) => toast.error(errorMessage(e)) });

  const readAloud = () => {
    const text =
      (lang === "bn" ? dose.medicine.instructionsBn : null) ||
      (lang === "bn" ? `${dose.medicine.name}, ${localDigits(dose.reminder.quantity, "bn")}টি, ${meal.bn}।` : `${dose.medicine.name}, take ${dose.reminder.quantity}, ${meal.en}.`);
    void speak(text);
  };

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:p-5",
        (highlight || due) && "border-primary ring-2 ring-primary/30",
        dose.status === "TAKEN" && "opacity-80",
      )}
    >
      <div className="flex w-20 shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-0">
        <Clock className="size-4 text-muted-foreground sm:hidden" />
        <p className="text-xl font-bold tabular-nums">{fmtTime(dose.reminder.time)}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{dose.medicine.name}</h3>
          {dose.medicine.strength && <span className="text-muted-foreground">{dose.medicine.strength}</span>}
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-1 text-base">
          {t("Take", "খাবেন")} <strong>{localDigits(dose.reminder.quantity, lang)}</strong> {dose.medicine.form ?? t("dose", "ডোজ")} · {t(meal.en, meal.bn)}
        </p>
        {dose.medicine.instructionsBn && <p className="mt-1 text-sm text-muted-foreground">{dose.medicine.instructionsBn}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="icon" onClick={readAloud} aria-label={t(`Read instructions for ${dose.medicine.name} aloud`, `${dose.medicine.name} এর নিয়ম শুনুন`)}>
          <Volume2 className="size-5" />
        </Button>
        {canAct ? (
          <>
            <Button size="lg" onClick={() => mark("TAKEN")} disabled={update.isPending} className="min-w-32">
              {update.isPending && update.variables?.status === "TAKEN" ? <Loader2 className="animate-spin" /> : <Check />} {t("Taken", "খেয়েছি")}
            </Button>
            <Button variant="outline" size="lg" onClick={() => mark("SKIPPED")} disabled={update.isPending} aria-label={t("Skip this dose", "এই ডোজটি এড়িয়ে যান")}>
              <SkipForward /> <span className="sm:hidden lg:inline">{t("Skip", "বাদ দিন")}</span>
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => mark("PENDING")} disabled={update.isPending}>
            <RotateCcw /> {t("Undo", "ফিরিয়ে নিন")}
          </Button>
        )}
      </div>
    </article>
  );
}
