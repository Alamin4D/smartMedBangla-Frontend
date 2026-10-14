"use client";

import { Flame, Pill, Target, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AdherenceInsightPanel } from "@/features/ai/adherence-insight-panel";
import { AdherenceChart } from "@/features/doses/adherence-chart";
import { useDoseStats } from "@/features/doses/api";
import { useT } from "@/hooks/use-t";

const SLOT_LABEL: Record<string, [string, string]> = { morning: ["Morning", "সকাল"], afternoon: ["Afternoon", "দুপুর"], evening: ["Evening", "সন্ধ্যা"], night: ["Night", "রাত"] };

export default function InsightsPage() {
  const { data, isLoading, error, refetch } = useDoseStats(30);
  const { t, tp, n } = useT();

  return (
    <>
      <PageHeader title={t("Insights", "রিপোর্ট ও পরামর্শ")} description={t("How well you followed your medicines in the last 30 days.", "গত ৩০ দিনে আপনি কতটা নিয়মিত ওষুধ খেয়েছেন।")} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : (
              <>
                <StatCard label={t("Adherence", "নিয়মিততা")} value={data.adherenceRate === null ? "—" : n(`${data.adherenceRate}%`)} icon={<Target />} />
                <StatCard label={t("Doses taken", "খাওয়া ডোজ")} value={n(data.totals.taken)} icon={<Pill />} tone="success" />
                <StatCard label={t("Missed", "বাদ পড়েছে")} value={n(data.totals.missed)} icon={<XCircle />} tone="danger" />
                <StatCard label={t("Streak", "টানা দিন")} value={t(`${data.streakDays} days`, `${n(data.streakDays)} দিন`)} icon={<Flame />} tone="warning" />
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("Daily doses", "দৈনিক ডোজ")}</CardTitle>
            </CardHeader>
            <CardContent>{data ? <AdherenceChart daily={data.daily} height={300} /> : <Skeleton className="h-72" />}</CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("By time of day", "দিনের সময় অনুযায়ী")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.byTimeOfDay.length ? (
                  data.byTimeOfDay.map((s) => (
                    <div key={s.slot}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{SLOT_LABEL[s.slot] ? tp(SLOT_LABEL[s.slot]) : s.slot}</span>
                        <span className="text-muted-foreground">
                          {n(`${s.taken}/${s.total} · ${s.rate}%`)}
                        </span>
                      </div>
                      <Progress value={s.rate ?? 0} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("No completed doses yet.", "এখনো কোনো ডোজের হিসাব নেই।")}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("By medicine", "ওষুধ অনুযায়ী")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.byMedicine.length ? (
                  data.byMedicine.map((m) => (
                    <div key={m.medicineId}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="truncate">{m.name}</span>
                        <span className="text-muted-foreground">
                          {n(`${m.taken}/${m.total} · ${m.rate}%`)}
                        </span>
                      </div>
                      <Progress value={m.rate ?? 0} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("No completed doses yet.", "এখনো কোনো ডোজের হিসাব নেই।")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <AdherenceInsightPanel />
        </div>
      )}
    </>
  );
}
