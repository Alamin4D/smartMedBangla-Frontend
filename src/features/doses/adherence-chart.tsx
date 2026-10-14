"use client";

import { format, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dateLocale } from "@/lib/format";
import type { AdherenceStats } from "@/types";
import { useT } from "@/hooks/use-t";

/** Stacked daily bars: taken / missed / skipped. Colours come from theme tokens so dark mode works. */
export function AdherenceChart({ daily, height = 260 }: { daily: AdherenceStats["daily"]; height?: number }) {
  const { t } = useT();
  const data = daily.map((d) => ({ ...d, label: format(parseISO(d.date), daily.length > 10 ? "d MMM" : "EEE", { locale: dateLocale() }) }));
  return (
    <div style={{ height }} role="img" aria-label={t("Daily doses taken, missed and skipped", "প্রতিদিন খাওয়া, বাদ পড়া ও এড়িয়ে যাওয়া ডোজ")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="taken" name={t("Taken", "খেয়েছেন")} stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="skipped" name={t("Skipped", "এড়িয়ে গেছেন")} stackId="a" fill="var(--chart-3)" />
          <Bar dataKey="missed" name={t("Missed", "বাদ পড়েছে")} stackId="a" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
