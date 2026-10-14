"use client";

import { AlertTriangle, Camera, Flame, Package, Pill, PlusCircle, ScanLine, Target } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdherenceChart } from "@/features/doses/adherence-chart";
import { usePatientDashboard } from "@/features/doses/api";
import { TodaySchedule } from "@/features/doses/today-schedule";
import { fmtDate } from "@/lib/format";
import { useT } from "@/hooks/use-t";
import type { User } from "@/types";

function greeting(lang: "bn" | "en") {
  const h = new Date().getHours();
  if (lang === "bn") return h < 12 ? "শুভ সকাল" : h < 17 ? "শুভ দুপুর" : "শুভ সন্ধ্যা";
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function PatientHome({ user }: { user: User }) {
  const { data, isLoading, error, refetch } = usePatientDashboard();
  const { t, n, lang } = useT();

  return (
    <>
      <PageHeader
        title={`${greeting(lang)}, ${user.honorific || user.name.split(" ")[0]}`}
        description={data ? fmtDate(data.today.date, "EEEE, d MMMM") : t("Here is your medicine plan for today.", "আজকের ওষুধের তালিকা।")}
        actions={
          <>
            <Button asChild>
              <Link href="/dashboard/prescriptions?upload=1">
                <Camera /> {t("Upload prescription", "প্রেসক্রিপশন আপলোড")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/medicines?new=1">
                <PlusCircle /> {t("Add medicine", "ওষুধ যোগ করুন")}
              </Link>
            </Button>
          </>
        }
      />

      {data && data.expiringItems.length > 0 && (
        <Alert className="mb-6 border-warning/50 bg-warning/10">
          <AlertTriangle className="text-amber-600" />
          <AlertTitle>{t("Medicines expiring soon", "শীঘ্রই মেয়াদ শেষ হচ্ছে")}</AlertTitle>
          <AlertDescription>
            <p>
              {data.expiringItems.map((i) => `${i.name} (${fmtDate(i.expiryDate)})`).join(", ")} — {t("please do not take expired medicine.", "মেয়াদোত্তীর্ণ ওষুধ খাবেন না।")}
            </p>
            <Link href="/dashboard/cabinet" className="font-medium text-primary underline-offset-4 hover:underline">
              {t("Open medicine cabinet", "ওষুধের বাক্স খুলুন")}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label={t("Taken today", "আজ খেয়েছেন")} value={n(`${data.today.summary.taken}/${data.today.summary.total}`)} icon={<Target />} />
            <StatCard
              label={t("7-day adherence", "৭ দিনের নিয়মিততা")}
              value={data.weekly.adherenceRate === null ? "—" : n(`${data.weekly.adherenceRate}%`)}
              icon={<Pill />}
              tone={data.weekly.adherenceRate === null || data.weekly.adherenceRate >= 85 ? "success" : data.weekly.adherenceRate >= 60 ? "warning" : "danger"}
            />
            <StatCard label={t("Perfect-day streak", "টানা নিখুঁত দিন")} value={t(`${data.weekly.streakDays} days`, `${n(data.weekly.streakDays)} দিন`)} icon={<Flame />} tone="warning" />
            <StatCard
              label={t("Medicine cabinet", "ওষুধের বাক্স")}
              value={n(data.counts.expiringItems)}
              hint={t("expiring within 7 days", "৭ দিনের মধ্যে মেয়াদ শেষ")}
              icon={<Package />}
              tone={data.counts.expiringItems ? "danger" : "muted"}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section aria-labelledby="today-heading">
          <h2 id="today-heading" className="mb-3 text-xl font-semibold">
            {t("Today's doses", "আজকের ওষুধ")}
          </h2>
          <TodaySchedule data={data?.today} isLoading={isLoading} error={error} onRetry={refetch} />
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("This week", "এই সপ্তাহ")}</CardTitle>
              <CardDescription>{t("Taken vs missed doses", "খাওয়া বনাম বাদ পড়া ডোজ")}</CardDescription>
            </CardHeader>
            <CardContent>
              {data ? <AdherenceChart daily={data.weekly.daily} height={200} /> : <Skeleton className="h-48" />}
              <Button variant="link" className="mt-2 px-0" asChild>
                <Link href="/dashboard/insights">{t("See full insights & AI tips →", "পুরো রিপোর্ট ও এআই পরামর্শ দেখুন →")}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("Quick actions", "দ্রুত কাজ")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/cabinet?scan=1">
                  <ScanLine /> {t("Scan a medicine strip", "ওষুধের পাতা স্ক্যান করুন")}
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/care">
                  <PlusCircle /> {t("Invite a family caregiver", "পরিবারের কাউকে যুক্ত করুন")}
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/assistant">
                  <Pill /> {t("Ask the health assistant", "স্বাস্থ্য সহকারীকে জিজ্ঞাসা করুন")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
