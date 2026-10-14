"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlarmClock,
  AlertCircle,
  Camera,
  Check,
  FileText,
  HeartHandshake,
  History,
  Hourglass,
  Phone,
  ShieldCheck,
  Type,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useMe } from "@/features/auth/api";
import { useT } from "@/hooks/use-t";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/voice";
import type { Pair } from "./content";
import { Reveal } from "./reveal";

/* ───────────────────────── Copy ───────────────────────── */

const STEPS: { title: Pair; text: Pair }[] = [
  {
    title: ["Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন"],
    text: ["Use your phone camera, or upload one from the gallery.", "ফোনের ক্যামেরা দিয়ে সরাসরি তুলুন, অথবা গ্যালারি থেকে আপলোড করুন।"],
  },
  {
    title: ["AI reads the handwriting", "এআই লেখা পড়ে নেয়"],
    text: [
      "Medicine names, doses and timing come out of messy handwriting in big letters. You check and confirm.",
      "অস্পষ্ট হাতের লেখা থেকে ওষুধের নাম, ডোজ আর সময় বের করে বড় অক্ষরে দেখায়। আপনি মিলিয়ে নিশ্চিত করেন।",
    ],
  },
  {
    title: ["On-time reminders in Bangla", "সময়মতো বাংলায় রিমাইন্ডার"],
    text: ["At dose time it speaks aloud along with a notification.", "ওষুধের সময় হলে নোটিফিকেশনের সাথে মুখে বলে মনে করিয়ে দেয়।"],
  },
];

const ELDER_FEATURES: { icon: LucideIcon; title: Pair; text: Pair; warm?: boolean }[] = [
  {
    icon: FileText,
    title: ["Reads unclear handwriting", "অস্পষ্ট লেখা পড়া"],
    text: ["Shows the correct medicine names and doses from doctors' handwriting in big letters.", "ডাক্তারের হাতের লেখা থেকে ওষুধের সঠিক নাম ও ডোজ বড় অক্ষরে।"],
  },
  {
    icon: Type,
    title: ["Big text, simple buttons", "বড় লেখা, সহজ বোতাম"],
    text: ["Just bookmark a link — no app downloads or updates to worry about.", "একটি লিংক বুকমার্ক করলেই চলে — ডাউনলোড বা আপডেটের ঝামেলা নেই।"],
  },
  {
    icon: Volume2,
    title: ["Bangla voice guide", "বাংলায় ভয়েস গাইড"],
    text: ["At dose time it reads out how to take the medicine.", "ওষুধের সময় ও খাওয়ার নিয়ম মুখে পড়ে শোনায়।"],
  },
  {
    icon: Hourglass,
    title: ["Expiry alerts", "মেয়াদ শেষের সতর্কতা"],
    text: ["Scan the medicine strip — you're reminded 7 days before it expires.", "ঘরের ওষুধের পাতা স্ক্যান করুন — মেয়াদ শেষের ৭ দিন আগে জানিয়ে দেবে।"],
    warm: true,
  },
  {
    icon: HeartHandshake,
    title: ["Caregiver dashboard", "কেয়ারগিভার ড্যাশবোর্ড"],
    text: ["From far away, see whether parents took today's medicines.", "দূরে থেকেও দেখুন বাবা-মা আজকের ওষুধ খেয়েছেন কিনা।"],
  },
  {
    icon: History,
    title: ["Prescription history", "প্রেসক্রিপশনের ইতিহাস"],
    text: ["Every prescription saved by date — show a new doctor at a glance.", "সব প্রেসক্রিপশন তারিখ অনুযায়ী সাজানো — নতুন ডাক্তারকে এক নজরে দেখান।"],
  },
];

const VOICE_LINE: Pair = [
  "Grandpa, it's time to take Napa Extend after your meal.",
  "দাদু, এখন আপনার ভরা পেটে নাপা এক্সটেন্ড খাওয়ার সময় হয়েছে।",
];

/* ─────────────────────── Building blocks ─────────────────────── */

function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return <p className={cn("text-sm font-semibold", light ? "text-[#f4a77f]" : "text-[var(--h-orange)]")}>{children}</p>;
}

function Heading({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <h2 className={cn("mt-2 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl", light ? "text-white" : "text-[var(--h-green)]", className)}>
      {children}
    </h2>
  );
}

const btnOrange =
  "inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-[var(--h-orange)] px-6 text-base font-semibold text-white shadow-lg shadow-[var(--h-orange)]/25 transition-colors hover:bg-[var(--h-orange-hover)] focus-visible:ring-3 focus-visible:ring-[var(--h-orange)]/40 focus-visible:outline-none";
const btnOutline =
  "inline-flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-[var(--h-green)] px-6 text-base font-semibold text-[var(--h-green)] transition-colors hover:bg-[var(--h-green-soft)] focus-visible:ring-3 focus-visible:ring-[var(--h-green)]/30 focus-visible:outline-none";

/* ─────────────────────── Sections ─────────────────────── */

/** Illustrative example of what the AI extracts (static, not user data). */
function PrescriptionPreview() {
  const { t, lang } = useT();
  const slots = [
    { label: t("Morning", "সকাল"), qty: t("1", "১") },
    { label: t("Noon", "দুপুর"), qty: t("0", "০"), off: true },
    { label: t("Night", "রাত"), qty: t("1", "১") },
  ];
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--h-line)] bg-[var(--h-surface)] p-5 shadow-[0_20px_60px_-20px_rgba(15,76,69,0.35)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--h-muted)]">{t("Found in the prescription", "প্রেসক্রিপশন থেকে পাওয়া গেছে")}</p>
          <span className="rounded-full bg-[var(--h-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--h-green)]">{t("3 medicines", "৩টি ওষুধ")}</span>
        </div>

        <div className="mt-4 rounded-2xl bg-[var(--h-soft)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-[var(--h-green)]">{t("Napa Extend", "নাপা এক্সটেন্ড")}</p>
              <p className="text-sm text-[var(--h-muted)]">{t("Paracetamol 665 mg", "প্যারাসিটামল ৬৬৫ মি.গ্রা.")}</p>
            </div>
            <button
              type="button"
              onClick={() => speak(lang === "en" ? VOICE_LINE[0] : VOICE_LINE[1])}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--h-green)] px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:text-[var(--h-green-deep)]"
            >
              <Volume2 className="size-4" /> {t("Listen", "শুনুন")}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {slots.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border-2 bg-[var(--h-surface)] py-2.5 text-center",
                  s.off ? "border-dashed border-[var(--h-line)] text-[var(--h-muted)]" : "border-[var(--h-green)] text-[var(--h-green)]",
                )}
              >
                <p className="text-xs">{s.label}</p>
                <p className="text-2xl font-bold">{s.qty}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-[var(--h-orange-soft)] px-3 py-1 text-xs font-semibold text-[var(--h-orange)]">{t("After meal", "ভরা পেটে")}</span>
            <span className="rounded-full bg-[var(--h-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--h-green)]">{t("7 days", "৭ দিন")}</span>
          </div>
        </div>

        {[
          [t("Omeprazole 20 mg", "ওমিপ্রাজল ২০ মি.গ্রা."), t("1—0—1 · before meal", "১—০—১ · খালি পেটে")],
          [t("Fexo 120 mg", "ফেক্সো ১২০ মি.গ্রা."), t("0—0—1 · any time", "০—০—১ · যেকোনো সময়")],
        ].map(([name, rule]) => (
          <div key={name} className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--h-line)] px-4 py-3 text-sm">
            <span className="font-semibold">{name}</span>
            <span className="text-[var(--h-muted)]">{rule}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[var(--h-muted)]">
        {t("Example shown · always double-check with your doctor's prescription", "উদাহরণ দেখানো হয়েছে · সবসময় ডাক্তারের প্রেসক্রিপশনের সাথে মিলিয়ে নিন")}
      </p>
    </div>
  );
}

/** Interactive example of the spoken reminder. */
function ReminderPreview() {
  const { t, lang } = useT();
  const [answer, setAnswer] = useState<"taken" | "later" | null>(null);
  const line = lang === "en" ? VOICE_LINE[0] : VOICE_LINE[1];

  return (
    <div>
      <div className="rounded-3xl bg-[var(--h-surface)] p-6 text-[var(--h-ink)] shadow-2xl sm:p-7">
        <p className="flex items-center gap-2 text-sm text-[var(--h-muted)]">
          <AlarmClock className="size-4 text-[var(--h-orange)]" /> {t("9:00 PM · speaking now", "রাত ৯:০০ · এখন বলছে")}
        </p>
        <p className="mt-3 text-2xl leading-snug font-bold text-[var(--h-green)]">“{line}”</p>
        {answer ? (
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--h-green-soft)] px-4 py-3 font-semibold text-[var(--h-green)]" role="status">
            <Check className="size-5" />
            {answer === "taken" ? t("Great! Marked as taken.", "দারুণ! খাওয়া হিসেবে চিহ্নিত হলো।") : t("Okay, I'll remind you in 10 minutes.", "ঠিক আছে, ১০ মিনিট পরে আবার মনে করিয়ে দেব।")}
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAnswer("taken")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--h-green)] font-semibold text-white transition-opacity hover:opacity-90 dark:text-[var(--h-green-deep)]"
            >
              <Check className="size-5" /> {t("Yes, taken", "হ্যাঁ, খেয়েছি")}
            </button>
            <button
              type="button"
              onClick={() => setAnswer("later")}
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[var(--h-line)] font-semibold transition-colors hover:bg-[var(--h-soft)]"
            >
              {t("In 10 minutes", "১০ মিনিট পরে")}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setAnswer(null);
          void speak(line);
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        <Volume2 className="size-4" /> {t("Hear a sample", "নমুনা শুনে দেখুন")}
      </button>
    </div>
  );
}

/** Illustrative caregiver view (static example). */
function FamilyPreview() {
  const { t } = useT();
  const rows = [
    { time: t("8:00 AM", "সকাল ৮:০০"), med: t("Omeprazole", "ওমিপ্রাজল"), note: t("Taken · 8:03", "খেয়েছেন · ৮:০৩"), ok: true },
    { time: t("2:00 PM", "দুপুর ২:০০"), med: t("Napa Extend", "নাপা এক্সটেন্ড"), note: t("Taken · 2:12", "খেয়েছেন · ২:১২"), ok: true },
    { time: t("9:00 PM", "রাত ৯:০০"), med: t("Napa Extend", "নাপা এক্সটেন্ড"), note: t("Not taken yet · 30 min late", "এখনো খাননি · ৩০ মিনিট পার"), ok: false },
  ];
  return (
    <div className="rounded-3xl border border-[var(--h-line)] bg-[var(--h-soft)] p-5 shadow-sm sm:p-6" aria-label={t("Example caregiver view", "কেয়ারগিভার ভিউয়ের উদাহরণ")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-[var(--h-green)]">{t("Mom — today's medicines", "আম্মা — আজকের ওষুধ")}</p>
          <p className="text-xs text-[var(--h-muted)]">{t("Last update: 2 minutes ago", "শেষ আপডেট: ২ মিনিট আগে")}</p>
        </div>
        <span className="rounded-full border border-[var(--h-line)] bg-[var(--h-surface)] px-3 py-1 text-xs font-semibold text-[var(--h-green)]">{t("2/3 done", "২/৩ সম্পন্ন")}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li
            key={r.time}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-[var(--h-surface)] p-3.5",
              r.ok ? "border-[var(--h-line)]" : "border-2 border-[var(--h-orange)]",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full",
                r.ok ? "bg-[var(--h-green)] text-white dark:text-[var(--h-green-deep)]" : "bg-[var(--h-orange-soft)] text-[var(--h-orange)]",
              )}
            >
              {r.ok ? <Check className="size-5" /> : <AlertCircle className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {r.time} · {r.med}
              </p>
              <p className={cn("text-xs", r.ok ? "text-[var(--h-muted)]" : "font-semibold text-[var(--h-orange)]")}>{r.note}</p>
            </div>
            {!r.ok && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--h-orange)] px-3 py-1.5 text-xs font-semibold text-white">
                <Phone className="size-3.5" /> {t("Call", "ফোন করুন")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Real platform numbers (only shown once there is activity). */
function TrustLine() {
  const { t, n } = useT();
  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => (await api.get<{ patients: number; prescriptionsRead: number; dosesTaken: number }>("/stats/public")).data,
    staleTime: 5 * 60_000,
  });
  if (!data || data.prescriptionsRead + data.dosesTaken === 0) return null;
  return (
    <p className="mt-6 text-sm text-white/70">
      {t(
        `${data.prescriptionsRead.toLocaleString()} prescriptions read · ${data.dosesTaken.toLocaleString()} doses taken on time`,
        `${n(data.prescriptionsRead)}টি প্রেসক্রিপশন পড়া হয়েছে · ${n(data.dosesTaken)}টি ডোজ সময়মতো খাওয়া হয়েছে`,
      )}
    </p>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export function HomeView() {
  const { t, tp } = useT();
  const { data: user } = useMe();
  const startHref = user ? (user.role === "PATIENT" ? "/dashboard/prescriptions?upload=1" : "/dashboard") : "/register";

  return (
    <div className="home -mt-16 overflow-x-clip pt-16">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-24">
        <div>
          <span className="inline-block rounded-full bg-[var(--h-orange-soft)] px-3.5 py-1.5 text-sm font-semibold text-[var(--h-orange)]">
            {t("No app download needed", "কোনো অ্যাপ ডাউনলোড লাগবে না")}
          </span>
          <h1 className="mt-6 text-4xl leading-[1.15] font-extrabold tracking-tight text-balance text-[var(--h-green)] sm:text-5xl lg:text-[3.5rem]">
            {t("Doctor's handwriting,", "ডাক্তারের লেখা,")}
            <br />
            {t("now in clear Bangla.", "এখন পরিষ্কার বাংলায়।")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--h-muted)]">
            {t(
              "Take one photo of the prescription. SmartMed shows medicine names, doses and timing in big letters — and reminds you aloud in Bangla on time.",
              "প্রেসক্রিপশনের একটা ছবি তুলুন। স্মার্টমেড ওষুধের নাম, ডোজ আর খাওয়ার নিয়ম বড় অক্ষরে দেখাবে — আর সময়মতো বাংলায় মুখে বলে মনে করিয়ে দেবে।",
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={startHref} className={btnOrange}>
              <Camera className="size-5" /> {t("Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন")}
            </Link>
            <a href="#how" className={btnOutline}>
              {t("How it works", "কীভাবে কাজ করে")}
            </a>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--h-muted)]">
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-[var(--h-green)]" /> {t("Phone, laptop, tablet — works everywhere", "ফোন, ল্যাপটপ, ট্যাব — সবখানে চলে")}
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-[var(--h-green)]" /> {t("Bangla voice reminders", "বাংলায় ভয়েস রিমাইন্ডার")}
            </li>
          </ul>
        </div>
        <Reveal>
          <PrescriptionPreview />
        </Reveal>
      </section>

      {/* Three steps */}
      <section id="how" className="scroll-mt-20 bg-[var(--h-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <Eyebrow>{t("Three simple steps", "তিনটি সহজ ধাপ")}</Eyebrow>
            <Heading>{t("Take a photo, SmartMed does the rest", "ছবি তুলুন, বাকিটা স্মার্টমেডের")}</Heading>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title[0]} delay={i * 100}>
                <div className="h-full rounded-2xl bg-[var(--h-soft)] p-6">
                  <p className="text-3xl font-extrabold text-[var(--h-orange)]">{t(String(i + 1), ["১", "২", "৩"][i]!)}</p>
                  <h3 className="mt-3 text-lg font-bold text-[var(--h-green)]">{tp(step.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--h-muted)]">{tp(step.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Voice reminder */}
      <section id="voice" className="scroll-mt-20 bg-[#0f4a43] text-white dark:bg-[var(--h-green-deep)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Reveal>
            <Eyebrow light>{t("Voice reminders", "ভয়েস রিমাইন্ডার")}</Eyebrow>
            <Heading light>
              {t("No need to read —", "পড়তে হবে না —")}
              <br />
              {t("SmartMed says it for you", "স্মার্টমেড নিজেই বলবে")}
            </Heading>
            <p className="mt-4 max-w-lg leading-relaxed text-white/80">
              {t(
                "For those who struggle with small text or notifications, SmartMed speaks the medicine time and instructions clearly in Bangla.",
                "যাঁরা ছোট লেখা পড়তে পারেন না বা নোটিফিকেশন বোঝেন না, তাঁদের জন্য ওষুধের সময় ও নিয়ম পরিষ্কার বাংলায় শোনানো হয়।",
              )}
            </p>
            <TrustLine />
          </Reveal>
          <Reveal delay={120}>
            <ReminderPreview />
          </Reveal>
        </div>
      </section>

      {/* Built for elders */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal>
          <Eyebrow>{t("What you get", "যা যা পাবেন")}</Eyebrow>
          <Heading>{t("Built with elders in mind", "প্রবীণদের কথা ভেবে বানানো")}</Heading>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ELDER_FEATURES.map(({ icon: Icon, title, text, warm }, i) => (
            <Reveal key={title[0]} delay={(i % 3) * 80}>
              <div className="h-full rounded-2xl border border-[var(--h-line)] bg-[var(--h-surface)] p-6 transition-shadow hover:shadow-lg">
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-xl",
                    warm ? "bg-[var(--h-orange-soft)] text-[var(--h-orange)]" : "bg-[var(--h-green-soft)] text-[var(--h-green)]",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-[var(--h-green)]">{tp(title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--h-muted)]">{tp(text)}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/features" className="text-sm font-semibold text-[var(--h-green)] underline-offset-4 hover:underline">
            {t("See all features →", "সব সুবিধা দেখুন →")}
          </Link>
        </div>
      </section>

      {/* For families */}
      <section id="family" className="scroll-mt-20 border-y border-[var(--h-line)] bg-[var(--h-surface)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <FamilyPreview />
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={100}>
            <Eyebrow>{t("For children living far away", "দূরে থাকা সন্তানদের জন্য")}</Eyebrow>
            <Heading>{t("Stay worry-free, from the office or abroad", "অফিসে বা প্রবাসে বসেও নিশ্চিন্ত থাকুন")}</Heading>
            <p className="mt-4 max-w-lg leading-relaxed text-[var(--h-muted)]">
              {t(
                "When parents press “Taken” after their medicine, it shows on your dashboard. If they don't press it on time, you get an alert by email.",
                "বাবা-মা ওষুধ খেয়ে “খেয়েছি” চাপলেই আপনার ড্যাশবোর্ডে দেখা যাবে। সময় পার হয়ে গেলেও না চাপলে আপনার ইমেইলে সতর্কবার্তা যাবে।",
              )}
            </p>
            <Link href="/register?role=CAREGIVER" className={cn(btnOutline, "mt-6 h-12")}>
              {t("Join as a caregiver", "কেয়ারগিভার হিসেবে যুক্ত হন")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20">
        <Reveal>
          <div className="flex flex-col gap-4 rounded-3xl bg-[var(--h-orange-soft)] p-6 sm:flex-row sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--h-surface)] text-[var(--h-orange)] shadow-sm">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--h-orange)]">{t("Your safety comes first", "আপনার নিরাপত্তা আগে")}</h2>
              <p className="mt-2 leading-relaxed text-[var(--h-ink)]/80">
                {t(
                  "AI can sometimes misread handwriting, so you confirm every medicine before any reminder starts. If you're unsure about a name or dose, check with your doctor or pharmacist before buying. Your prescriptions are seen only by you and the caregivers you choose.",
                  "এআই কখনো কখনো ভুল পড়তে পারে। তাই প্রতিটি ওষুধ আপনাকে মিলিয়ে নিশ্চিত করতে বলা হয়। কোনো নাম বা ডোজে সন্দেহ হলে ওষুধ কেনার আগে ডাক্তার বা ফার্মাসিস্টকে জিজ্ঞেস করুন। আপনার প্রেসক্রিপশন শুধু আপনি আর আপনার বেছে নেওয়া কেয়ারগিভার দেখতে পারেন।",
                )}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="rounded-3xl bg-[#103b36] px-6 py-14 text-center text-white sm:px-12 dark:bg-[var(--h-green-deep)]">
            <h2 className="text-3xl font-bold text-balance sm:text-4xl">{t("Add your first prescription today", "আজই প্রথম প্রেসক্রিপশন যোগ করুন")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              {t("Open an account with just your email. It takes less than a minute.", "শুধু ইমেইল দিয়ে অ্যাকাউন্ট খুলুন। এক মিনিটও লাগবে না।")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={startHref} className={btnOrange}>
                {t("Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন")}
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex h-13 items-center justify-center rounded-xl border-2 border-white/60 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                {user ? t("Go to dashboard", "ড্যাশবোর্ডে যান") : t("I already have an account", "আগে থেকে অ্যাকাউন্ট আছে")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
