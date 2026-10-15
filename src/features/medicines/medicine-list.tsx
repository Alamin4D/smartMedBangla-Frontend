"use client";

import { Clock, FileText, MoreVertical, Pause, Pencil, Pill, Play, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicineInfoDialog } from "@/features/ai/medicine-info-view";
import { errorMessage } from "@/lib/api";
import { fmtDate, fmtTime, MEAL_LABELS, weekdayLabels } from "@/lib/format";
import type { Medicine } from "@/types";
import { useDeleteMedicine, useMedicines, useSaveMedicine } from "./api";
import { MedicineDialog } from "./medicine-dialog";
import { useT } from "@/hooks/use-t";

function MedicineCard({ medicine, patientId }: { medicine: Medicine; patientId?: string }) {
  const [editing, setEditing] = useState(false);
  const save = useSaveMedicine(patientId);
  const remove = useDeleteMedicine(patientId);
  const reminders = medicine.reminders.filter((r) => r.isActive);
  const { t, n } = useT();

  const toggleActive = () =>
    save.mutate(
      { id: medicine.id, input: { isActive: !medicine.isActive } },
      { onSuccess: () => toast.success(medicine.isActive ? t("Reminders paused", "রিমাইন্ডার বন্ধ করা হয়েছে") : t("Reminders resumed", "রিমাইন্ডার আবার চালু হয়েছে")), onError: (e) => toast.error(errorMessage(e)) },
    );

  return (
    <Card className={medicine.isActive ? "h-full" : "h-full opacity-70"}>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Pill className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{medicine.name}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {[medicine.strength, medicine.form, medicine.genericName].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t(`Actions for ${medicine.name}`, `${medicine.name} এর অপশন`)}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil /> {t("Edit", "সম্পাদনা")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleActive}>
                {medicine.isActive ? <Pause /> : <Play />} {medicine.isActive ? t("Pause reminders", "রিমাইন্ডার বন্ধ করুন") : t("Resume reminders", "রিমাইন্ডার চালু করুন")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDialog
                title={t(`Delete ${medicine.name}?`, `${medicine.name} মুছে ফেলবেন?`)}
                description={t("Its reminders and dose history will be removed permanently.", "এর রিমাইন্ডার ও ইতিহাস স্থায়ীভাবে মুছে যাবে।")}
                confirmLabel={t("Delete", "মুছুন")}
                onConfirm={() =>
                  remove.mutate(medicine.id, { onSuccess: () => toast.success(t("Medicine deleted", "ওষুধ মুছে ফেলা হয়েছে")), onError: (e) => toast.error(errorMessage(e)) })
                }
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 /> {t("Delete", "মুছুন")}
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {!medicine.isActive && <Badge variant="secondary">{t("Paused / finished", "বন্ধ / শেষ")}</Badge>}
          <Badge variant="outline">{t(MEAL_LABELS[medicine.mealTiming].en, MEAL_LABELS[medicine.mealTiming].bn)}</Badge>
          {medicine.dosagePattern && <Badge variant="outline">{medicine.dosagePattern}</Badge>}
        </div>

        {reminders.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-sm">
                <Clock className="size-3.5" />
                <strong>{fmtTime(r.time)}</strong> × {n(r.quantity)}
                {r.daysOfWeek.length > 0 && <span className="text-xs text-muted-foreground">({r.daysOfWeek.map((d) => weekdayLabels()[d]).join(", ")})</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No reminders set", "কোনো রিমাইন্ডার নেই")}</p>
        )}

        {medicine.instructionsBn && <p className="text-sm">{medicine.instructionsBn}</p>}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>
            {fmtDate(medicine.startDate)} → {medicine.endDate ? fmtDate(medicine.endDate) : t("ongoing", "চলমান")}
          </span>
          <div className="flex items-center gap-1">
            {medicine.prescription && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/prescriptions/${medicine.prescription.id}`}>
                  <FileText /> Rx
                </Link>
              </Button>
            )}
            <MedicineInfoDialog name={medicine.name} />
          </div>
        </div>
      </CardContent>
      <MedicineDialog medicine={medicine} patientId={patientId} open={editing} onOpenChange={setEditing} />
    </Card>
  );
}

export function MedicineList({ patientId, startWithNew = false }: { patientId?: string; startWithNew?: boolean }) {
  const [tab, setTab] = useState<"active" | "all">("active");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(startWithNew);
  const { data, isLoading, error, refetch } = useMedicines({ patientId, active: tab === "active" ? true : undefined, search: search || undefined });
  const { t } = useT();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "all")}>
          <TabsList>
            <TabsTrigger value="active">{t("Active", "চলমান")}</TabsTrigger>
            <TabsTrigger value="all">{t("All medicines", "সব ওষুধ")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("Search medicines", "ওষুধ খুঁজুন")} className="pl-9" aria-label={t("Search medicines", "ওষুধ খুঁজুন")} />
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus /> {t("Add", "যোগ করুন")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          icon={<Pill />}
          title={search ? t("No medicines match your search", "এই নামে কোনো ওষুধ নেই") : t("No medicines yet", "এখনো কোনো ওষুধ নেই")}
          description={t("Add medicines manually or upload a prescription and let AI fill them in.", "নিজে ওষুধ যোগ করুন অথবা প্রেসক্রিপশন আপলোড করলে এআই নিজেই যোগ করে দেবে।")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreating(true)}>
                <Plus /> {t("Add medicine", "ওষুধ যোগ করুন")}
              </Button>
              {!patientId && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/prescriptions?upload=1">{t("Upload prescription", "প্রেসক্রিপশন আপলোড")}</Link>
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((m) => (
            <MedicineCard key={m.id} medicine={m} patientId={patientId} />
          ))}
        </div>
      )}

      <MedicineDialog patientId={patientId} open={creating} onOpenChange={setCreating} />
    </div>
  );
}
