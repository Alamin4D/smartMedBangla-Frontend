"use client";

import { useQuery } from "@tanstack/react-query";
import { Droplet, FileText, Pill, ShieldAlert, Stethoscope, Target } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/shared/logo";
import { ErrorState, PageLoader } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { ageFromDob, fmtDate, fmtDateTime, MEAL_LABELS } from "@/lib/format";
import type { MealTiming } from "@/types";
import { useT } from "@/hooks/use-t";
import { LanguageToggle } from "@/components/shared/language-toggle";

interface SharedProfile {
  patient: {
    name: string;
    gender: string | null;
    dateOfBirth: string | null;
    bloodGroup: string | null;
    allergies: string[];
    chronicConditions: string[];
  };
  expiresAt: string | null;
  currentMedicines: {
    name: string;
    genericName: string | null;
    strength: string | null;
    dosagePattern: string | null;
    mealTiming: MealTiming;
    startDate: string;
    endDate: string | null;
  }[];
  prescriptions: {
    id: string;
    title: string | null;
    doctorName: string | null;
    hospital: string | null;
    prescribedDate: string | null;
    diagnosis: string | null;
    advice: string | null;
    imageUrl: string;
    createdAt: string;
    medicines: { name: string; strength: string | null; dosagePattern: string | null; durationDays: number | null }[];
  }[];
  adherence: { rate: number | null };
}

/** Public, read-only medical history a patient shares with a new doctor. */
function SharedProfile() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["share", token],
    queryFn: async () => (await api.get<SharedProfile>(`/share/${token}`)).data,
    retry: false,
  });
  const { t, n } = useT();

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">{t("Read-only medical summary", "শুধু-দেখার মেডিকেল সারাংশ")}</Badge>
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {error || !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{data.patient.name}</h1>
                  <p className="text-muted-foreground">
                    {[ageFromDob(data.patient.dateOfBirth) && t(`${ageFromDob(data.patient.dateOfBirth)} years`, `${n(ageFromDob(data.patient.dateOfBirth)!)} বছর`), data.patient.gender].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.patient.bloodGroup && (
                    <Badge variant="outline" className="gap-1 text-sm">
                      <Droplet className="size-3.5" /> {data.patient.bloodGroup}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1 text-sm">
                    <Target className="size-3.5" /> {t("30-day adherence", "৩০ দিনের নিয়মিততা")}: {n(data.adherence.rate ?? "—")}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="size-5" /> {t("Allergies", "অ্যালার্জি")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {data.patient.allergies.length ? data.patient.allergies.map((a) => <Badge key={a} variant="destructive">{a}</Badge>) : <span className="text-muted-foreground">{t("None recorded", "কিছু নেই")}</span>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("Long-term conditions", "দীর্ঘমেয়াদি রোগ")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {data.patient.chronicConditions.length ? (
                    data.patient.chronicConditions.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)
                  ) : (
                    <span className="text-muted-foreground">{t("None recorded", "কিছু নেই")}</span>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="size-5 text-primary" /> {t("Current medicines", "বর্তমান ওষুধ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {data.currentMedicines.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">{t("Medicine", "ওষুধ")}</TableHead>
                        <TableHead>{t("Dose", "ডোজ")}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t("Timing", "সময়")}</TableHead>
                        <TableHead className="hidden md:table-cell">{t("Since", "শুরু")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.currentMedicines.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-6">
                            <p className="font-medium">
                              {m.name} {m.strength}
                            </p>
                            {m.genericName && <p className="text-xs text-muted-foreground">{m.genericName}</p>}
                          </TableCell>
                          <TableCell>{m.dosagePattern ?? "—"}</TableCell>
                          <TableCell className="hidden sm:table-cell">{t(MEAL_LABELS[m.mealTiming].en, MEAL_LABELS[m.mealTiming].bn)}</TableCell>
                          <TableCell className="hidden md:table-cell">{fmtDate(m.startDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="px-6 text-muted-foreground">{t("No active medicines.", "কোনো চলমান ওষুধ নেই।")}</p>
                )}
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                <FileText className="size-5 text-primary" /> {t("Prescription history", "প্রেসক্রিপশনের ইতিহাস")}
              </h2>
              <div className="space-y-4">
                {data.prescriptions.length === 0 && <p className="text-muted-foreground">{t("No prescriptions shared.", "কোনো প্রেসক্রিপশন নেই।")}</p>}
                {data.prescriptions.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="flex flex-col gap-4 sm:flex-row">
                      <a href={p.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail */}
                        <img
                          src={p.imageUrl.replace("/upload/", "/upload/c_fill,w_240,h_300,q_auto,f_auto/")}
                          alt={t(`Prescription from ${fmtDate(p.prescribedDate ?? p.createdAt)}`, `${fmtDate(p.prescribedDate ?? p.createdAt)} তারিখের প্রেসক্রিপশন`)}
                          className="h-36 w-28 rounded-lg object-cover"
                        />
                      </a>
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold">
                          {fmtDate(p.prescribedDate ?? p.createdAt)} · {p.title || p.diagnosis || t("Prescription", "প্রেসক্রিপশন")}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Stethoscope className="size-4" /> {[p.doctorName, p.hospital].filter(Boolean).join(", ") || "—"}
                        </p>
                        {p.diagnosis && <p className="text-sm">{t("Diagnosis", "রোগ নির্ণয়")}: {p.diagnosis}</p>}
                        <p className="text-sm">
                          {p.medicines.map((m) => [m.name, m.strength, m.dosagePattern, m.durationDays && `${m.durationDays}d`].filter(Boolean).join(" ")).join(" · ")}
                        </p>
                        {p.advice && <p className="text-sm text-muted-foreground">{t("Advice", "পরামর্শ")}: {p.advice}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <p className="text-center text-xs text-muted-foreground">
              {t("Shared via SmartMed", "স্মার্টমেডের মাধ্যমে শেয়ার করা")}
              {data.expiresAt ? ` · ${t("link expires", "লিংকের মেয়াদ")} ${fmtDateTime(data.expiresAt)}` : ""}.{" "}
              {t("Prescriptions were transcribed with AI assistance and verified by the patient.", "প্রেসক্রিপশনগুলো এআই এর সাহায্যে পড়া এবং রোগী নিজে যাচাই করেছেন।")}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function SharedProfilePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SharedProfile />
    </Suspense>
  );
}
