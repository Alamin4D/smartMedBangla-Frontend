"use client";

import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MedicineInput } from "@/features/medicines/api";
import { cleanMedicine, emptyMedicine, MedicineEditor, medicineToInput, validateMedicine } from "@/features/medicines/medicine-editor";
import { errorMessage } from "@/lib/api";
import { toInputDate } from "@/lib/format";
import type { Prescription } from "@/types";
import { useConfirmPrescription, type PrescriptionMetaInput } from "./api";
import { useT } from "@/hooks/use-t";

/** The patient checks what the AI read, fixes anything wrong, then activates reminders. */
export function PrescriptionReview({ prescription, patientId }: { prescription: Prescription; patientId?: string }) {
  const confirm = useConfirmPrescription(prescription.id, patientId);
  const { t, n, lang } = useT();
  const [meta, setMeta] = useState<PrescriptionMetaInput>({
    title: prescription.title ?? "",
    doctorName: prescription.doctorName ?? "",
    hospital: prescription.hospital ?? "",
    prescribedDate: toInputDate(prescription.prescribedDate),
    diagnosis: prescription.diagnosis ?? "",
    advice: prescription.advice ?? "",
  });
  const [medicines, setMedicines] = useState<MedicineInput[]>(() => prescription.medicines.map(medicineToInput));

  const setField = (key: keyof PrescriptionMetaInput, value: string) => setMeta((m) => ({ ...m, [key]: value }));

  const submit = () => {
    for (const [i, m] of medicines.entries()) {
      const problem = validateMedicine(m, lang);
      if (problem) return toast.error(`${t("Medicine", "ওষুধ")} ${i + 1}: ${problem}`);
    }
    confirm.mutate(
      {
        title: meta.title || null,
        doctorName: meta.doctorName || null,
        hospital: meta.hospital || null,
        prescribedDate: meta.prescribedDate || null,
        diagnosis: meta.diagnosis || null,
        advice: meta.advice || null,
        medicines: medicines.map((m) => {
          const { id: _id, isActive: _a, ...rest } = cleanMedicine(m) as MedicineInput & { id?: string };
          return { ...rest, reminders: rest.reminders.map(({ id: _rid, ...r }) => r) };
        }),
      },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Prescription details", "প্রেসক্রিপশনের তথ্য")}</CardTitle>
          <CardDescription>{t("Check what the AI found. Everything is editable.", "এআই যা পেয়েছে তা মিলিয়ে দেখুন। সব কিছু বদলানো যাবে।")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["title", t("Title", "শিরোনাম")],
              ["doctorName", t("Doctor", "ডাক্তার")],
              ["hospital", t("Hospital / chamber", "হাসপাতাল / চেম্বার")],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`rx-${key}`}>{label}</Label>
              <Input id={`rx-${key}`} value={meta[key] ?? ""} onChange={(e) => setField(key, e.target.value)} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="rx-date">{t("Prescription date", "প্রেসক্রিপশনের তারিখ")}</Label>
            <Input id="rx-date" type="date" value={meta.prescribedDate ?? ""} onChange={(e) => setField("prescribedDate", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rx-diagnosis">{t("Diagnosis", "রোগ নির্ণয়")}</Label>
            <Input id="rx-diagnosis" value={meta.diagnosis ?? ""} onChange={(e) => setField("diagnosis", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="rx-advice">{t("Advice (tests, diet, follow-up)", "পরামর্শ (টেস্ট, খাবার, ফলো-আপ)")}</Label>
            <Textarea id="rx-advice" rows={2} value={meta.advice ?? ""} onChange={(e) => setField("advice", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("Medicines", "ওষুধ")} ({n(medicines.length)})</h2>
          <Button variant="outline" size="sm" onClick={() => setMedicines((list) => [...list, emptyMedicine()])}>
            <Plus /> {t("Add medicine", "ওষুধ যোগ করুন")}
          </Button>
        </div>
        {medicines.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">{t("No medicines yet. Add them manually from the paper prescription.", "এখনো কোনো ওষুধ নেই। কাগজের প্রেসক্রিপশন দেখে নিজে যোগ করুন।")}</p>
        )}
        {medicines.map((m, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {n(i + 1)}. {m.name || t("New medicine", "নতুন ওষুধ")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setMedicines((list) => list.filter((_, idx) => idx !== i))}
              >
                <Trash2 /> {t("Remove", "সরান")}
              </Button>
            </CardHeader>
            <CardContent>
              <MedicineEditor
                idPrefix={`rx-med-${i}`}
                value={m}
                onChange={(v) => setMedicines((list) => list.map((item, idx) => (idx === i ? v : item)))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button size="lg" onClick={submit} disabled={confirm.isPending} className="shadow-lg">
          {confirm.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {t("Confirm & start reminders", "নিশ্চিত করুন ও রিমাইন্ডার চালু করুন")}
        </Button>
      </div>
    </div>
  );
}
