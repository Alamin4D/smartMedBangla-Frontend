"use client";

import { Lightbulb, Loader2, Sparkles, TrendingUp, Users, Volume2 } from "lucide-react";
import { ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { speak } from "@/lib/voice";
import { useAdherenceInsight } from "./api";
import { useT } from "@/hooks/use-t";

const RISK = { GOOD: "success", FAIR: "warning", POOR: "destructive" } as const;

export function AdherenceInsightPanel({ patientId }: { patientId?: string }) {
  const insight = useAdherenceInsight(patientId);
  const data = insight.data;
  const { t, n } = useT();

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> {t("AI adherence coach", "এআই ওষুধ-অভ্যাস কোচ")}
          </CardTitle>
          <CardDescription>{t("Analyses the last 30 days and suggests what to improve.", "গত ৩০ দিন বিশ্লেষণ করে কোথায় উন্নতি দরকার তা বলে।")}</CardDescription>
        </div>
        <Button onClick={() => insight.mutate()} disabled={insight.isPending}>
          {insight.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} {data ? t("Refresh analysis", "আবার বিশ্লেষণ করুন") : t("Analyse my adherence", "বিশ্লেষণ করুন")}
        </Button>
      </CardHeader>
      <CardContent>
        {insight.error && <ErrorState error={insight.error} onRetry={() => insight.mutate()} />}
        {!data && !insight.error && !insight.isPending && (
          <p className="text-muted-foreground">{t("Press the button to get a personalised report in your language.", "বোতাম চাপলে আপনার ভাষায় ব্যক্তিগত রিপোর্ট পাবেন।")}</p>
        )}
        {insight.isPending && <p className="text-muted-foreground">{t("Looking at your dose history…", "আপনার ওষুধের ইতিহাস দেখা হচ্ছে…")}</p>}
        {data && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-accent p-4 text-accent-foreground">
              <TrendingUp className="size-6" />
              <p className="flex-1 text-lg font-medium">{data.headline}</p>
              <Badge variant={RISK[data.riskLevel]}>{n(data.stats.adherenceRate ?? "—")}%</Badge>
              <Button variant="ghost" size="icon-sm" onClick={() => speak([data.headline, ...data.tips].join(" "))} aria-label={t("Read aloud", "শুনুন")}>
                <Volume2 />
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">{t("What we noticed", "আমরা যা দেখেছি")}</h4>
                <ul className="space-y-2">
                  {data.insights.map((line, i) => (
                    <li key={i} className="rounded-lg border p-3 text-sm">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Lightbulb className="size-4 text-amber-500" /> {t("Tips", "পরামর্শ")}
                </h4>
                <ul className="space-y-2">
                  {data.tips.map((line, i) => (
                    <li key={i} className="rounded-lg bg-muted p-3 text-sm">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {data.caregiverNote && (
              <p className="flex gap-2 rounded-lg border border-dashed p-3 text-sm">
                <Users className="size-4 shrink-0 text-primary" /> <span><strong>{t("For family: ", "পরিবারের জন্য: ")}</strong>{data.caregiverNote}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
