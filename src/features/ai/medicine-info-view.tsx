"use client";

import { AlertTriangle, Ban, Info, Loader2, Pill, Sparkles, Thermometer, Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { speak } from "@/lib/voice";
import type { MedicineInfo } from "@/types";
import { useMedicineInfo } from "./api";
import { useT } from "@/hooks/use-t";

function Section({ icon, title, items, tone }: { icon: ReactNode; title: string; items: string[]; tone?: "danger" }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className={`mb-1.5 flex items-center gap-2 font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>
        {icon} {title}
      </h4>
      <ul className="list-disc space-y-1 pl-6 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function MedicineInfoView({ info }: { info: MedicineInfo }) {
  const { t } = useT();
  if (!info.isKnownMedicine) {
    return (
      <div className="rounded-xl bg-muted p-4 text-sm">
        {t(`The AI does not recognise “${info.name}”. Please check the spelling or ask your pharmacist.`, `এআই “${info.name}” চিনতে পারেনি। বানান দেখুন বা ফার্মাসিস্টকে জিজ্ঞাসা করুন।`)}
      </div>
    );
  }
  const readAloud = [info.summary, info.howToTake, ...info.seriousWarnings].filter(Boolean).join(" ");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold">{info.name}</h3>
          <p className="text-sm text-muted-foreground">{[info.genericName, info.category].filter(Boolean).join(" · ")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => speak(readAloud)}>
          <Volume2 /> {t("Read aloud", "শুনুন")}
        </Button>
      </div>
      <p className="rounded-xl bg-accent p-4 text-accent-foreground">{info.summary}</p>
      <Section icon={<Pill className="size-4" />} title={t("Used for", "কী কাজে লাগে")} items={info.uses} />
      {info.howToTake && (
        <div>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <Info className="size-4" /> {t("How to take", "কীভাবে খাবেন")}
          </h4>
          <p className="text-sm">{info.howToTake}</p>
        </div>
      )}
      <Section icon={<Thermometer className="size-4" />} title={t("Common side effects", "সাধারণ পার্শ্বপ্রতিক্রিয়া")} items={info.sideEffects} />
      <Section icon={<AlertTriangle className="size-4" />} title={t("See a doctor if", "যেসব ক্ষেত্রে ডাক্তার দেখাবেন")} items={info.seriousWarnings} tone="danger" />
      <Section icon={<Ban className="size-4" />} title={t("Avoid", "এড়িয়ে চলুন")} items={info.avoid} />
      {info.storage && <p className="text-sm text-muted-foreground">{t("Storage", "সংরক্ষণ")}: {info.storage}</p>}
      <p className="text-xs text-muted-foreground">{t("AI-generated information. Always follow your doctor's prescription.", "এআই দ্বারা তৈরি তথ্য। সবসময় ডাক্তারের প্রেসক্রিপশন মেনে চলুন।")}</p>
    </div>
  );
}

/** Button that opens an AI explainer for a medicine name. */
export function MedicineInfoDialog({ name, trigger }: { name: string; trigger?: ReactNode }) {
  const info = useMedicineInfo();
  const { t } = useT();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !info.data && !info.isPending) info.mutate(name);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <Sparkles /> {t("What is this?", "এটা কী ওষুধ?")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> {t(`About ${name}`, `${name} সম্পর্কে`)}
          </DialogTitle>
          <DialogDescription>
            {t("Explained simply by AI", "এআই সহজ ভাষায় ব্যাখ্যা করেছে")}
          </DialogDescription>
        </DialogHeader>
        {info.isPending && (
          <div className="flex items-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="animate-spin" /> {t("Asking the AI pharmacist…", "এআই ফার্মাসিস্টকে জিজ্ঞাসা করা হচ্ছে…")}
          </div>
        )}
        {info.error && <ErrorState error={info.error} onRetry={() => info.mutate(name)} />}
        {info.data && <MedicineInfoView info={info.data} />}
      </DialogContent>
    </Dialog>
  );
}
