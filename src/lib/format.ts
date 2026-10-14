import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import type { MealTiming } from "@/types";
import { getLang, localDigits } from "./i18n";

/** date-fns locale for the current UI language. */
export const dateLocale = () => (getLang() === "bn" ? bn : undefined);

const toDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? d : null;
};

export const fmtDate = (value: string | Date | null | undefined, pattern = "d MMM yyyy") => {
  const d = toDate(value);
  return d ? localDigits(format(d, pattern, { locale: dateLocale() })) : "—";
};

export const fmtDateTime = (value: string | Date | null | undefined) => fmtDate(value, getLang() === "bn" ? "d MMM yyyy, p" : "d MMM yyyy, h:mm a");

export const fmtRelative = (value: string | Date | null | undefined) => {
  const d = toDate(value);
  return d ? localDigits(formatDistanceToNow(d, { addSuffix: true, locale: dateLocale() })) : "—";
};

/** "14:30" → "2:30 PM" / "দুপুর ২:৩০" */
export function fmtTime(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const hour = h % 12 || 12;
  const clock = `${hour}:${String(m).padStart(2, "0")}`;
  if (getLang() === "en") return `${clock} ${h >= 12 ? "PM" : "AM"}`;
  const period = h < 4 ? "রাত" : h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকাল" : h < 20 ? "সন্ধ্যা" : "রাত";
  return `${period} ${localDigits(clock, "bn")}`;
}

/** yyyy-mm-dd for <input type="date"> */
export const toInputDate = (value: string | Date | null | undefined) => {
  const d = toDate(value);
  return d ? format(d, "yyyy-MM-dd") : "";
};

export const MEAL_LABELS: Record<MealTiming, { en: string; bn: string }> = {
  BEFORE_MEAL: { en: "Before meal", bn: "খালি পেটে" },
  AFTER_MEAL: { en: "After meal", bn: "ভরা পেটে" },
  WITH_MEAL: { en: "With meal", bn: "খাবারের সাথে" },
  ANY: { en: "Any time", bn: "যেকোনো সময়" },
};

/** Meal label in the current UI language. */
export const mealLabel = (m: MealTiming) => MEAL_LABELS[m][getLang()];

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
export const weekdayLabels = () => (getLang() === "bn" ? WEEKDAYS_BN : WEEKDAYS_EN);

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const ageFromDob = (dob: string | null | undefined) => {
  const d = toDate(dob);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 86_400_000));
};

export const formatTaka = (amount: number | string) => `৳${localDigits(Number(amount).toLocaleString("en-IN"))}`;
