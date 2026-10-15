"use client";

import { AlertTriangle, ChevronRight, Clock, HeartHandshake, MailPlus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ageFromDob, fmtTime, initials } from "@/lib/format";
import type { User } from "@/types";
import { useCaredPatients, useCareInvites } from "./api";
import { useT } from "@/hooks/use-t";

export function CaregiverHome({ user }: { user: User }) {
  const patients = useCaredPatients();
  const invites = useCareInvites();
  const { t, n } = useT();

  return (
    <>
      <PageHeader title={t(`Hello, ${user.name.split(" ")[0]}`, `স্বাগতম, ${user.name.split(" ")[0]}`)} description={t("See how your loved ones are doing with their medicines today.", "আপনার প্রিয়জনরা আজ ঠিকমতো ওষুধ খাচ্ছেন কিনা দেখুন।")} />

      {invites.data && invites.data.length > 0 && (
        <Card className="mb-6 border-primary/40 bg-accent/50">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <MailPlus className="size-6 text-primary" />
            <p className="flex-1">
              {t(`You have ${invites.data.length} pending caregiver invitation${invites.data.length > 1 ? "s" : ""}.`, `আপনার ${n(invites.data.length)}টি কেয়ারগিভার আমন্ত্রণ অপেক্ষায় আছে।`)}
            </p>
            <Button asChild>
              <Link href="/dashboard/care">{t("Review invitations", "আমন্ত্রণ দেখুন")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {patients.isLoading ? (
        <CardGridSkeleton count={3} />
      ) : patients.error ? (
        <ErrorState error={patients.error} onRetry={patients.refetch} />
      ) : !patients.data?.length ? (
        <EmptyState
          icon={<HeartHandshake />}
          title={t("No patients yet", "এখনো কোনো রোগী নেই")}
          description={t("Ask your parent or patient to invite you from their SmartMed “Care circle” page using this email address.", "আপনার বাবা-মা বা রোগীকে বলুন স্মার্টমেডের “কেয়ার সার্কেল” পেজ থেকে এই ইমেইলে আপনাকে আমন্ত্রণ পাঠাতে।")}
          action={<p className="rounded-lg bg-muted px-3 py-2 font-mono text-sm">{user.email}</p>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {patients.data.map(({ linkId, patient, relation, today, nextDose, missedToday }) => {
            const pct = today.total ? Math.round((today.taken / today.total) * 100) : 0;
            const age = ageFromDob(patient.dateOfBirth);
            return (
              <Card key={linkId} className={missedToday.length ? "border-destructive/50" : undefined}>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      {patient.avatarUrl && <AvatarImage src={patient.avatarUrl} alt="" />}
                      <AvatarFallback className="bg-secondary text-primary">{initials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold">{patient.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {[relation && t(`Your ${relation.toLowerCase()}`, relation), age && t(`${age} yrs`, `${n(age)} বছর`), patient.bloodGroup].filter(Boolean).join(" · ") || patient.email}
                      </p>
                    </div>
                    {missedToday.length ? <Badge variant="destructive">{t(`${missedToday.length} missed`, `${n(missedToday.length)}টি বাদ`)}</Badge> : <Badge variant="success">{t("On track", "ঠিক আছে")}</Badge>}
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>
                        {t(`${today.taken}/${today.total} doses taken today`, `আজ ${n(today.total)}টির মধ্যে ${n(today.taken)}টি খেয়েছেন`)}
                      </span>
                      <span className="text-muted-foreground">{n(pct)}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>

                  {missedToday.length > 0 && (
                    <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{t("Missed", "বাদ পড়েছে")}: {missedToday.map((m) => `${m.medicine} (${fmtTime(m.time)})`).join(", ")}</span>
                    </div>
                  )}
                  {nextDose && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" /> {t("Next", "পরবর্তী")}: <strong className="text-foreground">{nextDose.medicine.name}</strong> {t("at", "—")}{" "}
                      {fmtTime(nextDose.reminder.time)}
                    </p>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/care/${patient.id}`}>
                      {t("Open full dashboard", "পুরো ড্যাশবোর্ড দেখুন")} <ChevronRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
