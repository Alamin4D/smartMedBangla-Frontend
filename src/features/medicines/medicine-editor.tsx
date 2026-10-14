"use client";

import { Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_LABELS, weekdayLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MealTiming, Medicine } from "@/types";
import type { MedicineInput, ReminderInput } from "./api";
import { useT } from "@/hooks/use-t";

export const FORMS = ["tablet", "capsule", "syrup", "injection", "drop", "cream", "inhaler", "other"];
const FORMS_BN: Record<string, string> = { tablet: "ট্যাবলেট", capsule: "ক্যাপসুল", syrup: "সিরাপ", injection: "ইনজেকশন", drop: "ড্রপ", cream: "ক্রিম", inhaler: "ইনহেলার", other: "অন্যান্য" };

const SLOT_TIMES: Record<number, string[]> = {
  1: ["08:00"],
  2: ["08:00", "21:00"],
  3: ["08:00", "14:00", "21:00"],
  4: ["08:00", "13:00", "18:00", "22:00"],
};

/** "1+0+1" → reminders at 08:00 and 21:00. */
export function remindersFromPattern(pattern: string): ReminderInput[] | null {
  const parts = pattern.split(/[+\-]/).map((p) => p.trim());
  const slots = SLOT_TIMES[parts.length];
  if (!slots || parts.some((p) => !/^(\d+(\/\d+)?|½)$/.test(p))) return null;
  return parts
    .map((qty, i) => ({ time: slots[i]!, quantity: qty, daysOfWeek: [] as number[] }))
    .filter((r) => r.quantity !== "0");
}

export const emptyMedicine = (): MedicineInput => ({
  name: "",
  genericName: "",
  strength: "",
  form: "tablet",
  dosagePattern: "",
  instructions: "",
  instructionsBn: "",
  mealTiming: "AFTER_MEAL",
  durationDays: null,
  reminders: [{ time: "08:00", quantity: "1", daysOfWeek: [] }],
});

export const medicineToInput = (m: Medicine): MedicineInput => ({
  name: m.name,
  genericName: m.genericName ?? "",
  strength: m.strength ?? "",
  form: m.form ?? "tablet",
  dosagePattern: m.dosagePattern ?? "",
  instructions: m.instructions ?? "",
  instructionsBn: m.instructionsBn ?? "",
  mealTiming: m.mealTiming,
  durationDays: m.durationDays,
  startDate: m.startDate,
  isActive: m.isActive,
  reminders: m.reminders
    .filter((r) => r.isActive)
    .map((r) => ({ id: r.id, time: r.time, quantity: r.quantity, daysOfWeek: r.daysOfWeek, isActive: r.isActive })),
});

/** Strips empty strings so optional fields are sent as null. */
export const cleanMedicine = (m: MedicineInput): MedicineInput => ({
  ...m,
  name: m.name.trim(),
  genericName: m.genericName?.trim() || null,
  strength: m.strength?.trim() || null,
  form: m.form || null,
  dosagePattern: m.dosagePattern?.trim() || null,
  instructions: m.instructions?.trim() || null,
  instructionsBn: m.instructionsBn?.trim() || null,
  durationDays: m.durationDays || null,
});

export function validateMedicine(m: MedicineInput, lang: "bn" | "en" = "bn") {
  const t = (en: string, bn: string) => (lang === "en" ? en : bn);
  if (!m.name.trim()) return t("Medicine name is required", "ওষুধের নাম দিন");
  if (m.reminders.some((r) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time))) return t("Every reminder needs a valid time", "প্রতিটি রিমাইন্ডারে সঠিক সময় দিন");
  if (m.reminders.some((r) => !r.quantity.trim())) return t("Every reminder needs a quantity", "প্রতিটি রিমাইন্ডারে পরিমাণ দিন");
  return null;
}

export function MedicineEditor({ value, onChange, idPrefix = "med" }: { value: MedicineInput; onChange: (v: MedicineInput) => void; idPrefix?: string }) {
  const set = <K extends keyof MedicineInput>(key: K, v: MedicineInput[K]) => onChange({ ...value, [key]: v });
  const setReminder = (i: number, patch: Partial<ReminderInput>) =>
    set(
      "reminders",
      value.reminders.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  const id = (name: string) => `${idPrefix}-${name}`;
  const { t } = useT();
  const fromPattern = value.dosagePattern ? remindersFromPattern(value.dosagePattern) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={id("name")}>{t("Medicine name *", "ওষুধের নাম *")}</Label>
          <Input id={id("name")} value={value.name} onChange={(e) => set("name", e.target.value)} placeholder={t("e.g. Napa Extend", "যেমন: নাপা এক্সটেন্ড")} className="text-base font-semibold" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("strength")}>{t("Strength", "মাত্রা")}</Label>
          <Input id={id("strength")} value={value.strength ?? ""} onChange={(e) => set("strength", e.target.value)} placeholder="665 mg" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("generic")}>{t("Generic name", "জেনেরিক নাম")}</Label>
          <Input id={id("generic")} value={value.genericName ?? ""} onChange={(e) => set("genericName", e.target.value)} placeholder="Paracetamol" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("form")}>{t("Form", "ধরন")}</Label>
          <Select value={value.form ?? "tablet"} onValueChange={(v) => set("form", v)}>
            <SelectTrigger id={id("form")} className="w-full capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMS.map((f) => (
                <SelectItem key={f} value={f} className="capitalize">
                  {t(f, FORMS_BN[f] ?? f)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("meal")}>{t("When to take", "কখন খাবেন")}</Label>
          <Select value={value.mealTiming} onValueChange={(v) => set("mealTiming", v as MealTiming)}>
            <SelectTrigger id={id("meal")} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MEAL_LABELS) as MealTiming[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {t(MEAL_LABELS[k].en, MEAL_LABELS[k].bn)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("pattern")}>{t("Dose pattern", "খাওয়ার নিয়ম")}</Label>
          <div className="flex gap-2">
            <Input id={id("pattern")} value={value.dosagePattern ?? ""} onChange={(e) => set("dosagePattern", e.target.value)} placeholder="1+0+1" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!fromPattern}
              onClick={() => fromPattern && set("reminders", fromPattern)}
              aria-label={t("Create reminders from dose pattern", "নিয়ম থেকে রিমাইন্ডার তৈরি করুন")}
              title={t("Create reminders from pattern", "নিয়ম থেকে রিমাইন্ডার তৈরি করুন")}
            >
              <Wand2 />
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("duration")}>{t("Duration (days)", "কত দিন")}</Label>
          <Input
            id={id("duration")}
            type="number"
            min={1}
            value={value.durationDays ?? ""}
            onChange={(e) => set("durationDays", e.target.value ? Number(e.target.value) : null)}
            placeholder={t("Leave empty if continuing", "চলতে থাকলে খালি রাখুন")}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={id("instr-bn")}>{t("Instructions (Bangla) — read aloud by voice", "নির্দেশনা (বাংলা) — ভয়েসে পড়ে শোনানো হবে")}</Label>
          <Textarea
            id={id("instr-bn")}
            rows={2}
            value={value.instructionsBn ?? ""}
            onChange={(e) => set("instructionsBn", e.target.value)}
            placeholder="সকালে ও রাতে ভরা পেটে ১টি করে খাবেন"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={id("instr")}>{t("Instructions (English)", "নির্দেশনা (ইংরেজি)")}</Label>
          <Input id={id("instr")} value={value.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">{t("Reminder times", "রিমাইন্ডারের সময়")}</legend>
        {value.reminders.length === 0 && <p className="text-sm text-muted-foreground">{t("No reminders — this medicine will not appear in the daily schedule.", "কোনো রিমাইন্ডার নেই — এই ওষুধ দৈনিক তালিকায় দেখাবে না।")}</p>}
        {value.reminders.map((r, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor={id(`time-${i}`)} className="text-xs">
                  {t("Time", "সময়")}
                </Label>
                <Input id={id(`time-${i}`)} type="time" value={r.time} onChange={(e) => setReminder(i, { time: e.target.value })} className="w-32" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={id(`qty-${i}`)} className="text-xs">
                  {t("Quantity", "পরিমাণ")}
                </Label>
                <Input id={id(`qty-${i}`)} value={r.quantity} onChange={(e) => setReminder(i, { quantity: e.target.value })} className="w-24" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto text-destructive"
                onClick={() => set("reminders", value.reminders.filter((_, idx) => idx !== i))}
                aria-label={t("Remove reminder", "রিমাইন্ডার সরান")}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label={t("Days of week (none selected = every day)", "সপ্তাহের দিন (কিছু না বাছলে প্রতিদিন)")}>
              {weekdayLabels().map((day, d) => {
                const on = r.daysOfWeek.includes(d);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setReminder(i, { daysOfWeek: on ? r.daysOfWeek.filter((x) => x !== d) : [...r.daysOfWeek, d].sort() })
                    }
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium",
                      on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
              <span className="ml-1 self-center text-xs text-muted-foreground">{r.daysOfWeek.length ? "" : t("Every day", "প্রতিদিন")}</span>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={value.reminders.length >= 8}
          onClick={() => set("reminders", [...value.reminders, { time: "21:00", quantity: "1", daysOfWeek: [] }])}
        >
          <Plus /> {t("Add time", "সময় যোগ করুন")}
        </Button>
      </fieldset>
    </div>
  );
}
