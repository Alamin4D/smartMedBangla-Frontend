"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";
import { FEATURES, PROBLEMS } from "./content";
import { Reveal } from "./reveal";

export function FeaturesView() {
  const { t, tp } = useT();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="max-w-3xl">
        <Badge variant="secondary">{t("12+ features · 6 AI-powered", "১২+ ফিচার · ৬টি এআই চালিত")}</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t("Everything you need to take medicine safely", "নিরাপদে ওষুধ খাওয়ার জন্য যা যা দরকার")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t(
            "SmartMed combines OCR, large language models and simple design to solve everyday medication problems in Bangladesh.",
            "স্মার্টমেড OCR, এআই আর সহজ ডিজাইন মিলিয়ে বাংলাদেশের প্রতিদিনের ওষুধ সংক্রান্ত সমস্যার সমাধান করে।",
          )}
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title[0]} delay={(i % 3) * 80}>
            <Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-6" />
                  </span>
                  {f.ai && <Badge>AI</Badge>}
                </div>
                <h2 className="text-lg font-semibold">{tp(f.title)}</h2>
                <p className="text-sm text-muted-foreground">{tp(f.description)}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">{t("Problems we solve", "আমরা যেসব সমস্যার সমাধান করি")}</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {PROBLEMS.map((row, i) => (
          <div key={i} className="grid gap-2 border-b p-5 last:border-b-0 md:grid-cols-2 md:gap-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-destructive">{t("Problem: ", "সমস্যা: ")}</span>
              {tp(row.problem)}
            </p>
            <p>
              <span className="font-semibold text-primary">{t("SmartMed: ", "সমাধান: ")}</span>
              {tp(row.fix)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg" className="rounded-full" asChild>
          <Link href="/register">{t("Try SmartMed free", "ফ্রিতে স্মার্টমেড ব্যবহার করুন")}</Link>
        </Button>
      </div>
    </div>
  );
}
