"use client";

import { Loader2, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMedicineInfo } from "@/features/ai/api";
import { InteractionChecker } from "@/features/ai/interaction-checker";
import { MedicineInfoView } from "@/features/ai/medicine-info-view";
import { useMe } from "@/features/auth/api";
import { useT } from "@/hooks/use-t";

export default function AiToolsPage() {
  const { data: user } = useMe();
  const [name, setName] = useState("");
  const info = useMedicineInfo();
  const { t } = useT();

  return (
    <>
      <PageHeader title={t("Medicine check", "ওষুধ যাচাই")} description={t("Understand any medicine and check whether your medicines are safe together.", "যেকোনো ওষুধ সম্পর্কে জানুন আর আপনার ওষুধগুলো একসাথে নিরাপদ কিনা দেখুন।")} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> {t("Medicine explainer", "ওষুধ পরিচিতি")}
            </CardTitle>
            <CardDescription>{t("Type a brand or generic name — get uses, side effects and warnings in simple words.", "ব্র্যান্ড বা জেনেরিক নাম লিখুন — কাজ, পার্শ্বপ্রতিক্রিয়া ও সতর্কতা সহজ ভাষায় জানুন।")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim().length >= 2) info.mutate(name.trim());
              }}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. Seclo 20, Metformin", "যেমন: সেকলো ২০, মেটফরমিন")} aria-label={t("Medicine name", "ওষুধের নাম")} />
              <Button type="submit" disabled={info.isPending || name.trim().length < 2}>
                {info.isPending ? <Loader2 className="animate-spin" /> : <Search />} {t("Explain", "জানুন")}
              </Button>
            </form>
            {info.error && <ErrorState error={info.error} onRetry={() => info.mutate(name.trim())} />}
            {info.data && <MedicineInfoView info={info.data} />}
          </CardContent>
        </Card>
        {user?.role === "PATIENT" ? (
          <InteractionChecker />
        ) : (
          <Card className="h-fit">
            <CardContent className="text-muted-foreground">
              {t("To check interactions for someone you care for, open their dashboard from “My patients”.", "যার দেখাশোনা করেন তার ওষুধ যাচাই করতে “আমার রোগীরা” থেকে তার ড্যাশবোর্ড খুলুন।")}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
