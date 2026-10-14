"use client";

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api";
import { formatTaka } from "@/lib/format";
import { useCheckout, usePlans } from "./api";
import { useT } from "@/hooks/use-t";

const FREE_FEATURES = [
  ["5 AI scans per month", "মাসে ৫টি এআই স্ক্যান"],
  ["Unlimited reminders & Bangla voice alerts", "আনলিমিটেড রিমাইন্ডার ও বাংলা ভয়েস"],
  ["2 caregivers", "২ জন কেয়ারগিভার"],
  ["Medicine cabinet & expiry alerts", "ওষুধের বাক্স ও মেয়াদ সতর্কতা"],
] as const;
const PREMIUM_FEATURES_BN = ["আনলিমিটেড এআই প্রেসক্রিপশন ও ওষুধের পাতা স্ক্যান", "প্রতি রোগীর জন্য ১০ জন পর্যন্ত কেয়ারগিভার", "অগ্রাধিকার ভিত্তিতে এআই প্রসেসিং", "পুরো পরিবারের জন্য বিস্তারিত রিপোর্ট"];
const PLAN_LABEL_BN: Record<number, string> = { 1: "মাসিক", 6: "৬ মাস", 12: "বার্ষিক" };

/** Plan cards rendered from the server's plan list. `checkout` turns the buttons into SSLCommerz payments. */
export function PlanCards({ checkout = false, currentPlan }: { checkout?: boolean; currentPlan?: "FREE" | "PREMIUM" }) {
  const { data, isLoading, error, refetch } = usePlans();
  const pay = useCheckout();
  const { t, n } = useT();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-xl">{t("Free", "ফ্রি")}</CardTitle>
          <CardDescription>{t("For individuals getting started", "শুরু করার জন্য")}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <p className="text-3xl font-bold">৳0</p>
          <ul className="space-y-2 text-sm">
            {FREE_FEATURES.map(([en, bn]) => (
              <li key={en} className="flex gap-2">
                <Check className="size-4 shrink-0 text-primary" /> {t(en, bn)}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {checkout ? (
            <Button variant="outline" className="w-full" disabled>
              {currentPlan === "FREE" ? t("Current plan", "বর্তমান প্ল্যান") : t("Included", "অন্তর্ভুক্ত")}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">{t("Start free", "ফ্রি শুরু করুন")}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {data.plans.map((plan) => (
        <Card key={plan.months} className={plan.months === 12 ? "h-full border-primary shadow-md" : "h-full"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{t("Premium", "প্রিমিয়াম")} · {t(plan.label, PLAN_LABEL_BN[plan.months] ?? plan.label)}</CardTitle>
            </div>
            <CardDescription>
              {plan.discount > 0 ? <Badge variant="success">{t(`Save ${Math.round(plan.discount * 100)}%`, `${n(Math.round(plan.discount * 100))}% সাশ্রয়`)}</Badge> : t("Billed monthly", "মাসিক বিল")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <p className="text-3xl font-bold">
              {formatTaka(plan.price)}
              <span className="text-base font-normal text-muted-foreground"> / {plan.months === 1 ? t("month", "মাস") : t(`${plan.months} months`, `${n(plan.months)} মাস`)}</span>
            </p>
            <ul className="space-y-2 text-sm">
              {data.features.map((f, i) => (
                <li key={f} className="flex gap-2">
                  <Check className="size-4 shrink-0 text-primary" /> {t(f, PREMIUM_FEATURES_BN[i] ?? f)}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {checkout ? (
              <Button
                className="w-full"
                disabled={!data.enabled || pay.isPending}
                onClick={() => pay.mutate(plan.months, { onError: (e) => toast.error(errorMessage(e)) })}
              >
                {pay.isPending && pay.variables === plan.months ? <Loader2 className="animate-spin" /> : null}
                {data.enabled ? t("Pay with SSLCommerz", "SSLCommerz দিয়ে পেমেন্ট") : t("Payments coming soon", "শীঘ্রই পেমেন্ট চালু হবে")}
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/register">{t("Get Premium", "প্রিমিয়াম নিন")}</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
