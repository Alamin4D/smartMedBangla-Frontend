"use client";

import { format, parseISO, subDays } from "date-fns";
import { CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dateLocale, fmtTime } from "@/lib/format";
import type { Dose } from "@/types";
import { AdherenceChart } from "./adherence-chart";
import { useDoseHistory, useDoseStats } from "./api";
import { useT } from "@/hooks/use-t";

const STATUS_VARIANT = { TAKEN: "success", MISSED: "destructive", SKIPPED: "secondary", PENDING: "outline" } as const;
const STATUS_BN = { TAKEN: "খেয়েছেন", MISSED: "বাদ পড়েছে", SKIPPED: "এড়িয়ে গেছেন", PENDING: "বাকি" } as const;
const RANGES = [7, 14, 30] as const;

export function DoseHistory({ patientId }: { patientId?: string }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const { t, n } = useT();
  const { from, to } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: subDays(end, days).toISOString(), to: end.toISOString() };
  }, [days]);
  const history = useDoseHistory(from, to, patientId);
  const stats = useDoseStats(days, patientId);

  const grouped = useMemo(() => {
    const map = new Map<string, Dose[]>();
    for (const d of [...(history.data ?? [])].reverse()) {
      const key = format(parseISO(d.scheduledFor), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return [...map.entries()];
  }, [history.data]);

  return (
    <div className="space-y-6">
      <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as (typeof RANGES)[number])}>
        <TabsList>
          {RANGES.map((r) => (
            <TabsTrigger key={r} value={String(r)}>
              {t(`Last ${r} days`, `শেষ ${n(r)} দিন`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>{t("Adherence", "নিয়মিত ওষুধ খাওয়া")}</CardTitle>
          {stats.data && (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="success">{t(`${stats.data.totals.taken} taken`, `${n(stats.data.totals.taken)}টি খেয়েছেন`)}</Badge>
              <Badge variant="destructive">{t(`${stats.data.totals.missed} missed`, `${n(stats.data.totals.missed)}টি বাদ`)}</Badge>
              <Badge variant="secondary">{t(`${stats.data.totals.skipped} skipped`, `${n(stats.data.totals.skipped)}টি এড়িয়ে গেছেন`)}</Badge>
              <Badge>{n(stats.data.adherenceRate ?? "—")}% {t("adherence", "নিয়মিত")}</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>{stats.data ? <AdherenceChart daily={stats.data.daily} /> : <ListSkeleton rows={2} />}</CardContent>
      </Card>

      {history.isLoading ? (
        <ListSkeleton />
      ) : history.error ? (
        <ErrorState error={history.error} onRetry={history.refetch} />
      ) : grouped.length === 0 ? (
        <EmptyState icon={<CalendarClock />} title={t("No dose history in this period", "এই সময়ে কোনো ইতিহাস নেই")} description={t("History appears once reminders start.", "রিমাইন্ডার শুরু হলে ইতিহাস দেখা যাবে।")} />
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, doses]) => (
            <section key={day}>
              <h3 className="mb-2 font-semibold">{n(format(parseISO(day), "EEEE, d MMMM", { locale: dateLocale() }))}</h3>
              <ul className="divide-y rounded-xl border bg-card">
                {doses.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-20 shrink-0 font-medium tabular-nums">{fmtTime(d.reminder.time)}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {d.medicine.name} <span className="text-muted-foreground">× {n(d.reminder.quantity)}</span>
                    </span>
                    {d.takenAt && <span className="hidden text-xs text-muted-foreground sm:inline">{t("at", "সময়")} {n(format(parseISO(d.takenAt), "h:mm a"))}</span>}
                    <Badge variant={STATUS_VARIANT[d.status]}>{t(d.status.toLowerCase(), STATUS_BN[d.status])}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
