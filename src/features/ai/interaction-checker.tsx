"use client";

import { AlertOctagon, Loader2, Plus, ShieldCheck, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInteractionCheck } from "./api";
import { useT } from "@/hooks/use-t";

const RISK_UI = {
  LOW: { en: "Low risk", bn: "কম ঝুঁকি", variant: "success" as const, box: "bg-success/10" },
  MODERATE: { en: "Moderate risk", bn: "মাঝারি ঝুঁকি", variant: "warning" as const, box: "bg-warning/15" },
  HIGH: { en: "High risk", bn: "উচ্চ ঝুঁকি", variant: "destructive" as const, box: "bg-destructive/10" },
  UNKNOWN: { en: "Unclear", bn: "অস্পষ্ট", variant: "secondary" as const, box: "bg-muted" },
};
const SEVERITY_BN = { MINOR: "সামান্য", MODERATE: "মাঝারি", MAJOR: "গুরুতর" } as const;
const SEVERITY = { MINOR: "secondary", MODERATE: "warning", MAJOR: "destructive" } as const;

export function InteractionChecker({ patientId, includesCurrent = true }: { patientId?: string; includesCurrent?: boolean }) {
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const check = useInteractionCheck(patientId);
  const report = check.data;
  const { t } = useT();

  const add = () => {
    const name = draft.trim();
    if (name.length >= 2 && !extra.includes(name)) setExtra((list) => [...list, name]);
    setDraft("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="size-5 text-primary" /> {t("Drug interaction checker", "ওষুধের পারস্পরিক প্রতিক্রিয়া যাচাই")}
        </CardTitle>
        <CardDescription>
          {includesCurrent ? t("Checks your active medicines, allergies and conditions. ", "আপনার চলমান ওষুধ, অ্যালার্জি ও রোগ যাচাই করে। ") : ""}
          {t("Add a new medicine (e.g. one bought from the pharmacy) to see if it is safe with the others.", "নতুন কোনো ওষুধ (যেমন ফার্মেসি থেকে কেনা) যোগ করে দেখুন অন্যগুলোর সাথে নিরাপদ কিনা।")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("Add a medicine, e.g. Ibuprofen", "ওষুধ যোগ করুন, যেমন: আইবুপ্রোফেন")} aria-label={t("Medicine to add", "যোগ করার ওষুধ")} />
          <Button type="submit" variant="outline" disabled={draft.trim().length < 2}>
            <Plus /> {t("Add", "যোগ")}
          </Button>
        </form>
        {extra.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {extra.map((name) => (
              <Badge key={name} variant="secondary" className="gap-1 py-1 pr-1 text-sm">
                {name}
                <button type="button" onClick={() => setExtra((l) => l.filter((x) => x !== name))} aria-label={t(`Remove ${name}`, `${name} সরান`)} className="rounded p-0.5 hover:bg-background">
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Button onClick={() => check.mutate(extra)} disabled={check.isPending}>
          {check.isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />} {t("Check safety", "নিরাপত্তা যাচাই করুন")}
        </Button>

        {check.error && <ErrorState error={check.error} onRetry={() => check.mutate(extra)} />}

        {report && (
          <div className="space-y-4">
            <div className={cn("rounded-xl p-4", RISK_UI[report.overallRisk].box)}>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant={RISK_UI[report.overallRisk].variant}>{t(RISK_UI[report.overallRisk].en, RISK_UI[report.overallRisk].bn)}</Badge>
                <span className="text-xs text-muted-foreground">{t("Checked", "যাচাই করা হয়েছে")}: {report.checkedMedicines.join(", ")}</span>
              </div>
              <p>{report.summary}</p>
            </div>
            {report.allergyWarnings.length > 0 && (
              <div className="rounded-xl border border-destructive/40 p-4">
                <p className="mb-1 flex items-center gap-2 font-semibold text-destructive">
                  <AlertOctagon className="size-4" /> {t("Allergy warnings", "অ্যালার্জি সতর্কতা")}
                </p>
                <ul className="list-disc pl-5 text-sm">
                  {report.allergyWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.interactions.map((it, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant={SEVERITY[it.severity]}>{t(it.severity.toLowerCase(), SEVERITY_BN[it.severity])}</Badge>
                  <span className="font-semibold">{it.medicines.join(" + ")}</span>
                </div>
                <p className="text-sm">{it.description}</p>
                <p className="mt-1 text-sm text-muted-foreground">👉 {it.recommendation}</p>
              </div>
            ))}
            {report.duplicateTherapy.length > 0 && (
              <p className="rounded-xl bg-warning/15 p-3 text-sm">
                <strong>{t("Same medicine twice: ", "একই ওষুধ দুইবার: ")}</strong>
                {report.duplicateTherapy.join("; ")}
              </p>
            )}
            {report.generalAdvice.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {report.generalAdvice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{t("AI-generated — confirm with your doctor or pharmacist before changing anything.", "এআই দ্বারা তৈরি — কিছু বদলানোর আগে ডাক্তার বা ফার্মাসিস্টের সাথে কথা বলুন।")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
