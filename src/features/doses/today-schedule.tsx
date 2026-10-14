"use client";

import { CalendarCheck2, Pill } from "lucide-react";
import Link from "next/link";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { TodaySchedule as TodayData } from "@/types";
import { DoseCard } from "./dose-card";
import { useT } from "@/hooks/use-t";

export function TodaySchedule({
  data,
  isLoading,
  error,
  onRetry,
  patientId,
  emptyAction = true,
}: {
  data?: TodayData;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  patientId?: string;
  emptyAction?: boolean;
}) {
  const { t, n } = useT();
  if (isLoading) return <ListSkeleton rows={3} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!data || data.doses.length === 0) {
    return (
      <EmptyState
        icon={<Pill />}
        title={t("No medicines scheduled today", "আজ কোনো ওষুধ নেই")}
        description={t("Upload a prescription or add a medicine to start getting reminders.", "রিমাইন্ডার পেতে প্রেসক্রিপশন আপলোড করুন বা ওষুধ যোগ করুন।")}
        action={
          emptyAction ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/dashboard/prescriptions">{t("Upload prescription", "প্রেসক্রিপশন আপলোড")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/medicines">{t("Add medicine", "ওষুধ যোগ করুন")}</Link>
              </Button>
            </div>
          ) : undefined
        }
      />
    );
  }

  const done = data.summary.taken + data.summary.skipped;
  const pct = Math.round((data.summary.taken / data.summary.total) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium">
            <CalendarCheck2 className="size-4 text-primary" /> {t(`${data.summary.taken} of ${data.summary.total} doses taken`, `${n(data.summary.total)}টির মধ্যে ${n(data.summary.taken)}টি খেয়েছেন`)}
          </span>
          <span className="text-muted-foreground">
            {data.summary.missed > 0 && <span className="text-destructive">{t(`${data.summary.missed} missed`, `${n(data.summary.missed)}টি বাদ`)} · </span>}
            {t(`${data.summary.total - done - data.summary.missed} left`, `${n(data.summary.total - done - data.summary.missed)}টি বাকি`)}
          </span>
        </div>
        <Progress value={pct} aria-label={t(`${pct}% of today's doses taken`, `আজকের ${n(pct)}% ওষুধ খাওয়া হয়েছে`)} />
      </div>
      <div className="space-y-3">
        {data.doses.map((dose) => (
          <DoseCard key={dose.id} dose={dose} patientId={patientId} highlight={dose.id === data.nextDoseId} />
        ))}
      </div>
    </div>
  );
}
