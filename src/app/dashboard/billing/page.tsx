"use client";

import { CheckCircle2, Crown, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ListSkeleton } from "@/components/shared/states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAiUsage } from "@/features/ai/api";
import { useMe } from "@/features/auth/api";
import { useMyPayments } from "@/features/billing/api";
import { PlanCards } from "@/features/billing/plan-cards";
import { fmtDate, fmtDateTime, formatTaka } from "@/lib/format";
import { useT } from "@/hooks/use-t";

const STATUS_VARIANT = { SUCCESS: "success", PENDING: "warning", FAILED: "destructive", CANCELLED: "secondary" } as const;

function PaymentResult() {
  const params = useSearchParams();
  const { t } = useT();
  const qc = useQueryClient();
  const status = params.get("status");

  useEffect(() => {
    if (status) {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      qc.invalidateQueries({ queryKey: ["billing"] });
    }
  }, [status, qc]);

  if (status === "success")
    return (
      <Alert className="mb-6 border-success/50 bg-success/10">
        <CheckCircle2 className="text-success" />
        <AlertTitle>{t("Payment successful — welcome to Premium!", "পেমেন্ট সফল — প্রিমিয়ামে স্বাগতম!")}</AlertTitle>
        <AlertDescription>{t("Transaction", "লেনদেন")} {params.get("tran")}</AlertDescription>
      </Alert>
    );
  if (status === "failed" || status === "cancelled")
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle />
        <AlertTitle>{status === "failed" ? t("Payment failed", "পেমেন্ট ব্যর্থ হয়েছে") : t("Payment cancelled", "পেমেন্ট বাতিল হয়েছে")}</AlertTitle>
        <AlertDescription>{t("No money was taken. You can try again any time.", "কোনো টাকা কাটা হয়নি। যেকোনো সময় আবার চেষ্টা করতে পারেন।")}</AlertDescription>
      </Alert>
    );
  return null;
}

export default function BillingPage() {
  const { data: user } = useMe();
  const payments = useMyPayments();
  const usage = useAiUsage();
  const { t, n } = useT();

  return (
    <>
      <PageHeader title={t("Billing", "বিলিং")} description={t("Manage your SmartMed plan and payment history.", "আপনার প্ল্যান ও পেমেন্টের ইতিহাস।")} />
      <Suspense>
        <PaymentResult />
      </Suspense>

      <Card className="mb-8">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Crown className="size-6" />
          </span>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t("Current plan", "বর্তমান প্ল্যান")}</p>
            <p className="text-2xl font-bold">
              {user?.plan === "PREMIUM" ? t("Premium", "প্রিমিয়াম") : t("Free", "ফ্রি")}{" "}
              {user?.plan === "PREMIUM" && user.planExpiresAt && (
                <span className="text-base font-normal text-muted-foreground">{t("until", "পর্যন্ত")} {fmtDate(user.planExpiresAt)}</span>
              )}
            </p>
          </div>
          {usage.data && (
            <div className="text-sm">
              <p className="text-muted-foreground">{t("AI scans this month", "এই মাসের এআই স্ক্যান")}</p>
              <p className="text-xl font-semibold">
                {n(usage.data.used)}
                {usage.data.limit != null ? ` / ${n(usage.data.limit)}` : t(" (unlimited)", " (আনলিমিটেড)")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">{user?.plan === "PREMIUM" ? t("Extend Premium", "প্রিমিয়াম বাড়ান") : t("Upgrade to Premium", "প্রিমিয়ামে আপগ্রেড করুন")}</h2>
      <PlanCards checkout currentPlan={user?.plan} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("Payment history", "পেমেন্টের ইতিহাস")}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.isLoading ? (
            <ListSkeleton rows={2} />
          ) : !payments.data?.length ? (
            <EmptyState title={t("No payments yet", "এখনো কোনো পেমেন্ট নেই")} className="py-8" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Date", "তারিখ")}</TableHead>
                  <TableHead>{t("Transaction", "লেনদেন")}</TableHead>
                  <TableHead>{t("Plan", "প্ল্যান")}</TableHead>
                  <TableHead>{t("Amount", "পরিমাণ")}</TableHead>
                  <TableHead>{t("Status", "অবস্থা")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{fmtDateTime(p.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{p.tranId}</TableCell>
                    <TableCell>{t(`${p.months} month(s)`, `${n(p.months)} মাস`)}</TableCell>
                    <TableCell>{formatTaka(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[p.status]}>{p.status.toLowerCase()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
