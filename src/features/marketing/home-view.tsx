"use client";

/**
 * Landing page – built only from the global theme tokens so it matches the rest of the app:
 * primary = dark blue, secondary = white / soft blue.
 * Accessibility: ≥4.5:1 contrast, ≥44px targets, visible focus, reduced-motion aware.
 */
import { useQuery } from "@tanstack/react-query";
import {
  AlarmClock,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Clock,
  FileText,
  HeartHandshake,
  History,
  Hourglass,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Type,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/api";
import { useT } from "@/hooks/use-t";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/voice";
import type { Pair } from "./content";
import { Reveal } from "./reveal";

/* ───────────────────────── Copy ───────────────────────── */

const STEPS: { icon: LucideIcon; title: Pair; text: Pair }[] = [
  {
    icon: Camera,
    title: ["Take a photo", "ছবি তুলুন"],
    text: ["Use your phone camera, or upload a prescription from the gallery.", "ফোনের ক্যামেরা দিয়ে তুলুন, অথবা গ্যালারি থেকে প্রেসক্রিপশন আপলোড করুন।"],
  },
  {
    icon: FileText,
    title: ["AI reads it", "এআই পড়ে নেয়"],
    text: ["Medicine names, doses and timing appear in big letters. You check and confirm.", "ওষুধের নাম, ডোজ আর সময় বড় অক্ষরে দেখায়। আপনি মিলিয়ে নিশ্চিত করেন।"],
  },
  {
    icon: Volume2,
    title: ["Hear the reminder", "রিমাইন্ডার শুনুন"],
    text: ["At dose time SmartMed speaks aloud in Bangla, with a notification.", "ওষুধের সময় নোটিফিকেশনের সাথে বাংলায় মুখে বলে মনে করিয়ে দেয়।"],
  },
];

const FEATURES: { icon: LucideIcon; title: Pair; text: Pair }[] = [
  {
    icon: FileText,
    title: ["Reads unclear handwriting", "অস্পষ্ট লেখা পড়া"],
    text: ["Correct medicine names and doses from a doctor's handwriting, in big letters.", "ডাক্তারের হাতের লেখা থেকে ওষুধের সঠিক নাম ও ডোজ, বড় অক্ষরে।"],
  },
  {
    icon: Type,
    title: ["Big text, simple buttons", "বড় লেখা, সহজ বোতাম"],
    text: ["Just bookmark a link — no app downloads or updates.", "একটি লিংক বুকমার্ক করলেই চলে — ডাউনলোড বা আপডেটের ঝামেলা নেই।"],
  },
  {
    icon: Volume2,
    title: ["Bangla voice guide", "বাংলায় ভয়েস গাইড"],
    text: ["Reads out when and how to take each medicine.", "কখন ও কীভাবে ওষুধ খাবেন, মুখে পড়ে শোনায়।"],
  },
  {
    icon: Hourglass,
    title: ["Expiry alerts", "মেয়াদ শেষের সতর্কতা"],
    text: ["Scan a medicine strip — get reminded 7 days before it expires.", "ওষুধের পাতা স্ক্যান করুন — মেয়াদ শেষের ৭ দিন আগে জানিয়ে দেবে।"],
  },
  {
    icon: HeartHandshake,
    title: ["Caregiver dashboard", "কেয়ারগিভার ড্যাশবোর্ড"],
    text: ["From far away, see whether parents took today's medicines.", "দূরে থেকেও দেখুন বাবা-মা আজকের ওষুধ খেয়েছেন কিনা।"],
  },
  {
    icon: History,
    title: ["Prescription history", "প্রেসক্রিপশনের ইতিহাস"],
    text: ["Every prescription saved by date — show a new doctor at a glance.", "সব প্রেসক্রিপশন তারিখ অনুযায়ী — নতুন ডাক্তারকে এক নজরে দেখান।"],
  },
];

const FAQ: { q: Pair; a: Pair }[] = [
  {
    q: ["Do I need to download an app?", "অ্যাপ ডাউনলোড করতে হবে?"],
    a: [
      "No. SmartMed is a website that works in any phone, tablet or computer browser. Bookmark it once — no storage or updates needed.",
      "না। স্মার্টমেড একটি ওয়েবসাইট — যেকোনো ফোন, ট্যাব বা কম্পিউটারের ব্রাউজারে চলে। একবার বুকমার্ক করলেই হলো।",
    ],
  },
  {
    q: ["What if the AI reads something wrong?", "এআই ভুল পড়লে কী হবে?"],
    a: [
      "No reminder starts until you check and confirm each medicine against the photo. You can edit anything.",
      "প্রতিটি ওষুধ ছবির সাথে মিলিয়ে আপনি নিশ্চিত না করা পর্যন্ত কোনো রিমাইন্ডার চালু হয় না। যেকোনো কিছু বদলে নিতে পারেন।",
    ],
  },
  {
    q: ["Will the voice really speak Bangla?", "ভয়েস কি সত্যিই বাংলায় বলবে?"],
    a: [
      "Yes. Reminders are spoken in Bangla by your browser's voice, and you choose how it addresses you.",
      "হ্যাঁ। ব্রাউজারের ভয়েসে বাংলায় বলে, আর কী বলে ডাকবে — দাদু, নানু, আম্মা — তাও বেছে নিতে পারেন।",
    ],
  },
  {
    q: ["Is it free?", "এটা কি ফ্রি?"],
    a: [
      "Reminders, voice alerts and caregivers are free. Premium adds unlimited AI scans and a larger care circle.",
      "রিমাইন্ডার, ভয়েস অ্যালার্ট ও কেয়ারগিভার সম্পূর্ণ ফ্রি। প্রিমিয়ামে পাবেন আনলিমিটেড এআই স্ক্যান।",
    ],
  },
];

const VOICE_LINE: Pair = ["Grandpa, it's time to take Napa Extend after your meal.", "দাদু, এখন আপনার ভরা পেটে নাপা এক্সটেন্ড খাওয়ার সময় হয়েছে।"];

/* ─────────────────────── Building blocks ─────────────────────── */

const bigBtn = "h-14 rounded-xl px-7 text-lg [&_svg:not([class*='size-'])]:size-5";
const outlineBtn = "border-2 border-primary text-primary hover:bg-secondary hover:text-primary";
const onPrimaryOutline = "border-2 border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";

function SectionTitle({
  eyebrow,
  title,
  text,
  id,
  onPrimary,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  id: string;
  onPrimary?: boolean;
  center?: boolean;
}) {
  return (
    <div className={cn(center && "mx-auto max-w-2xl text-center")}>
      <p className={cn("text-base font-semibold", onPrimary ? "text-primary-foreground/80" : "text-primary/80")}>{eyebrow}</p>
      <h2 id={id} className={cn("mt-2 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.5rem]", onPrimary ? "text-primary-foreground" : "text-primary")}>
        {title}
      </h2>
      {text && <p className={cn("mt-4 text-lg leading-relaxed", onPrimary ? "text-primary-foreground/85" : "text-muted-foreground")}>{text}</p>}
    </div>
  );
}

/** Marks illustrations so they are never mistaken for the user's real data. */
function ExampleTag() {
  const { t } = useT();
  return <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">{t("Example", "উদাহরণ")}</span>;
}

/* ─────────────────────── Illustrations ─────────────────────── */

function PrescriptionPreview() {
  const { t, lang } = useT();
  const slots = [
    { label: t("Morning", "সকাল"), qty: t("1", "১") },
    { label: t("Noon", "দুপুর"), qty: t("0", "০"), off: true },
    { label: t("Night", "রাত"), qty: t("1", "১") },
  ];
  return (
    <figure className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_30px_70px_-30px] shadow-primary/40">
        <div className="flex items-center justify-between gap-3 bg-primary px-5 py-4 text-primary-foreground">
          <p className="flex items-center gap-2 text-base font-semibold">
            <FileText className="size-5" aria-hidden /> {t("Found in the prescription", "প্রেসক্রিপশন থেকে পাওয়া গেছে")}
          </p>
          <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">{t("3 medicines", "৩টি ওষুধ")}</span>
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-2xl bg-secondary p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-primary">{t("Napa Extend", "নাপা এক্সটেন্ড")}</p>
                <p className="text-base text-muted-foreground">{t("Paracetamol 665 mg", "প্যারাসিটামল ৬৬৫ মি.গ্রা.")}</p>
              </div>
              <Button className="h-11 shrink-0 rounded-full px-4 text-base" onClick={() => speak(lang === "en" ? VOICE_LINE[0] : VOICE_LINE[1])}>
                <Volume2 aria-hidden /> {t("Listen", "শুনুন")}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {slots.map((s) => (
                <div
                  key={s.label}
                  className={cn("rounded-xl border-2 bg-card py-2.5 text-center", s.off ? "border-dashed border-border text-muted-foreground" : "border-primary text-primary")}
                >
                  <p className="text-sm">{s.label}</p>
                  <p className="text-2xl font-bold">{s.qty}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">{t("After meal", "ভরা পেটে")}</span>
              <span className="rounded-full border border-primary/30 bg-card px-3 py-1 text-sm font-semibold text-primary">{t("7 days", "৭ দিন")}</span>
            </div>
          </div>

          {[
            [t("Omeprazole 20 mg", "ওমিপ্রাজল ২০ মি.গ্রা."), t("1—0—1 · before meal", "১—০—১ · খালি পেটে")],
            [t("Fexo 120 mg", "ফেক্সো ১২০ মি.গ্রা."), t("0—0—1 · any time", "০—০—১ · যেকোনো সময়")],
          ].map(([name, rule]) => (
            <div key={name} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border px-4 py-3 text-base">
              <span className="font-semibold text-foreground">{name}</span>
              <span className="text-muted-foreground">{rule}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ExampleTag /> {t("Always double-check with your doctor's prescription", "সবসময় ডাক্তারের প্রেসক্রিপশনের সাথে মিলিয়ে নিন")}
      </figcaption>
    </figure>
  );
}

function ReminderPreview() {
  const { t, lang } = useT();
  const [answer, setAnswer] = useState<"taken" | "later" | null>(null);
  const line = lang === "en" ? VOICE_LINE[0] : VOICE_LINE[1];

  return (
    <div>
      <div className="rounded-3xl bg-card p-6 text-card-foreground shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-base text-muted-foreground">
            <AlarmClock className="size-5 text-primary" aria-hidden /> {t("9:00 PM · speaking now", "রাত ৯:০০ · এখন বলছে")}
          </p>
          <ExampleTag />
        </div>
        <p className="mt-3 text-2xl leading-snug font-bold text-primary">“{line}”</p>
        <div aria-live="polite">
          {answer ? (
            <p className="mt-5 flex min-h-12 items-center gap-2 rounded-xl bg-secondary px-4 font-semibold text-primary">
              <Check className="size-5" aria-hidden />
              {answer === "taken" ? t("Great! Marked as taken.", "দারুণ! খাওয়া হিসেবে চিহ্নিত হলো।") : t("Okay, I'll remind you in 10 minutes.", "ঠিক আছে, ১০ মিনিট পরে আবার মনে করিয়ে দেব।")}
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button className="h-13 rounded-xl text-lg" onClick={() => setAnswer("taken")}>
                <Check className="size-5" aria-hidden /> {t("Yes, taken", "হ্যাঁ, খেয়েছি")}
              </Button>
              <Button variant="outline" className={cn("h-13 rounded-xl text-lg", outlineBtn)} onClick={() => setAnswer("later")}>
                {t("In 10 minutes", "১০ মিনিট পরে")}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => {
          setAnswer(null);
          void speak(line);
        }}
        className={cn("mt-4 h-12 rounded-full px-5 text-base focus-visible:ring-primary-foreground/50", onPrimaryOutline)}
      >
        <Volume2 className="size-5" aria-hidden /> {t("Hear a sample", "নমুনা শুনে দেখুন")}
      </Button>
    </div>
  );
}

function FamilyPreview() {
  const { t } = useT();
  const rows = [
    { time: t("8:00 AM", "সকাল ৮:০০"), med: t("Omeprazole", "ওমিপ্রাজল"), note: t("Taken · 8:03", "খেয়েছেন · ৮:০৩"), ok: true },
    { time: t("2:00 PM", "দুপুর ২:০০"), med: t("Napa Extend", "নাপা এক্সটেন্ড"), note: t("Taken · 2:12", "খেয়েছেন · ২:১২"), ok: true },
    { time: t("9:00 PM", "রাত ৯:০০"), med: t("Napa Extend", "নাপা এক্সটেন্ড"), note: t("Not taken yet · family alerted", "এখনো খাননি · পরিবারকে জানানো হয়েছে"), ok: false },
  ];
  return (
    <figure className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-primary">{t("Mom — today's medicines", "আম্মা — আজকের ওষুধ")}</p>
          <p className="text-sm text-muted-foreground">{t("Last update: 2 minutes ago", "শেষ আপডেট: ২ মিনিট আগে")}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">{t("2/3 done", "২/৩ সম্পন্ন")}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden>
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.time} className={cn("flex items-center gap-3 rounded-2xl border p-3.5", r.ok ? "bg-card" : "border-2 border-primary bg-secondary")}>
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                r.ok ? "bg-primary text-primary-foreground" : "bg-card text-primary ring-2 ring-primary",
              )}
            >
              {r.ok ? <Check className="size-5" aria-hidden /> : <Clock className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-foreground">
                {r.time} · {r.med}
              </p>
              <p className={cn("text-sm", r.ok ? "text-muted-foreground" : "font-semibold text-primary")}>{r.note}</p>
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <ExampleTag /> {t("What a caregiver sees on their dashboard.", "কেয়ারগিভার তার ড্যাশবোর্ডে যা দেখেন।")}
      </figcaption>
    </figure>
  );
}

/** Real platform numbers from the database; hidden until there is activity. */
function TrustLine() {
  const { t, n } = useT();
  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => (await api.get<{ patients: number; prescriptionsRead: number; dosesTaken: number }>("/stats/public")).data,
    staleTime: 5 * 60_000,
  });
  if (!data || data.prescriptionsRead + data.dosesTaken === 0) return null;
  return (
    <p className="mt-6 text-base text-primary-foreground/80">
      {t(
        `${data.prescriptionsRead.toLocaleString()} prescriptions read · ${data.dosesTaken.toLocaleString()} doses taken on time`,
        `${n(data.prescriptionsRead)}টি প্রেসক্রিপশন পড়া হয়েছে · ${n(data.dosesTaken)}টি ডোজ সময়মতো খাওয়া হয়েছে`,
      )}
    </p>
  );
}

/** Mobile-only sticky call to action: shown between the hero and the closing CTA, never over the footer. */
function StickyCta({ heroRef, endRef, href }: { heroRef: RefObject<HTMLElement | null>; endRef: RefObject<HTMLElement | null>; href: string }) {
  const { t } = useT();
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const end = endRef.current;
    if (!hero || !end) return;
    const heroObserver = new IntersectionObserver(([e]) => setPastHero(Boolean(e && !e.isIntersecting && e.boundingClientRect.top < 0)));
    const endObserver = new IntersectionObserver(([e]) => setAtEnd(Boolean(e && (e.isIntersecting || e.boundingClientRect.top < 0))));
    heroObserver.observe(hero);
    endObserver.observe(end);
    return () => {
      heroObserver.disconnect();
      endObserver.disconnect();
    };
  }, [heroRef, endRef]);

  const visible = pastHero && !atEnd;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <Button asChild className={cn(bigBtn, "w-full")}>
        <Link href={href} tabIndex={visible ? 0 : -1}>
          <Camera aria-hidden /> {t("Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন")}
        </Link>
      </Button>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export function HomeView() {
  const { t, tp } = useT();
  const { data: user } = useMe();
  const heroRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const startHref = user ? (user.role === "PATIENT" ? "/dashboard/prescriptions?upload=1" : "/dashboard") : "/register";

  return (
    <div className="-mt-16 overflow-x-clip bg-background pt-16">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} aria-labelledby="hero-title" className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[85%] bg-gradient-to-b from-secondary to-background" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-base font-semibold text-primary shadow-sm">
              <MonitorSmartphone className="size-4" aria-hidden /> {t("No app download needed", "কোনো অ্যাপ ডাউনলোড লাগবে না")}
            </span>
            <h1 id="hero-title" className="mt-6 text-4xl leading-[1.15] font-extrabold tracking-tight text-balance text-primary sm:text-5xl lg:text-[3.6rem]">
              {t("Doctor's handwriting,", "ডাক্তারের লেখা,")}
              <br />
              <span className="text-foreground">{t("now in clear Bangla.", "এখন পরিষ্কার বাংলায়।")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted-foreground">
              {t(
                "Take one photo of the prescription. SmartMed shows medicine names, doses and timing in big letters — and reminds you aloud in Bangla on time.",
                "প্রেসক্রিপশনের একটা ছবি তুলুন। স্মার্টমেড ওষুধের নাম, ডোজ আর খাওয়ার নিয়ম বড় অক্ষরে দেখাবে — আর সময়মতো বাংলায় মুখে বলে মনে করিয়ে দেবে।",
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={cn(bigBtn, "shadow-lg shadow-primary/25")}>
                <Link href={startHref}>
                  <Camera aria-hidden /> {t("Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন")}
                </Link>
              </Button>
              <Button asChild variant="outline" className={cn(bigBtn, outlineBtn)}>
                <a href="#how">{t("How it works", "কীভাবে কাজ করে")}</a>
              </Button>
            </div>
            <ul className="mt-8 grid gap-x-6 gap-y-3 text-base text-foreground sm:grid-cols-2">
              {[
                t("Phone, laptop, tablet — works everywhere", "ফোন, ল্যাপটপ, ট্যাব — সবখানে চলে"),
                t("Bangla voice reminders", "বাংলায় ভয়েস রিমাইন্ডার"),
                t("Free to start, no card needed", "শুরু করা ফ্রি, কার্ড লাগবে না"),
                t("You confirm every AI result", "এআই এর প্রতিটি ফল আপনি নিশ্চিত করেন"),
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <PrescriptionPreview />
          </Reveal>
        </div>
      </section>

      {/* ─── How it works: connected timeline ─────────────── */}
      <section id="how" aria-labelledby="how-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal>
          <SectionTitle center id="how-title" eyebrow={t("Three simple steps", "তিনটি সহজ ধাপ")} title={t("Take a photo, SmartMed does the rest", "ছবি তুলুন, বাকিটা স্মার্টমেডের")} />
        </Reveal>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span className="absolute top-8 right-[16%] left-[16%] hidden h-0.5 bg-primary/20 md:block" aria-hidden />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title[0]} className="relative">
              <Reveal delay={i * 120} className="text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <Icon className="size-7" aria-hidden />
                  <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full border-2 border-primary bg-card text-sm font-bold text-primary" aria-hidden>
                    {t(String(i + 1), ["১", "২", "৩"][i]!)}
                  </span>
                </span>
                <h3 className="mt-5 text-xl font-bold text-primary">
                  <span className="sr-only">{t(`Step ${i + 1}: `, `ধাপ ${["১", "২", "৩"][i]}: `)}</span>
                  {tp(title)}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-base leading-relaxed text-muted-foreground">{tp(text)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Voice reminder (primary band) ─────────────────── */}
      <section id="voice" aria-labelledby="voice-title" className="scroll-mt-20 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Reveal>
            <SectionTitle
              onPrimary
              id="voice-title"
              eyebrow={t("Voice reminders", "ভয়েস রিমাইন্ডার")}
              title={
                <>
                  {t("No need to read —", "পড়তে হবে না —")}
                  <br />
                  {t("SmartMed says it for you", "স্মার্টমেড নিজেই বলবে")}
                </>
              }
              text={t(
                "For those who struggle with small text or notifications, SmartMed speaks the medicine time and instructions clearly in Bangla.",
                "যাঁরা ছোট লেখা পড়তে পারেন না বা নোটিফিকেশন বোঝেন না, তাঁদের জন্য ওষুধের সময় ও নিয়ম পরিষ্কার বাংলায় শোনানো হয়।",
              )}
            />
            <TrustLine />
          </Reveal>
          <Reveal delay={120}>
            <ReminderPreview />
          </Reveal>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section id="features" aria-labelledby="features-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal>
          <SectionTitle center id="features-title" eyebrow={t("What you get", "যা যা পাবেন")} title={t("Built with elders in mind", "প্রবীণদের কথা ভেবে বানানো")} />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title[0]} delay={(i % 3) * 80}>
              <article className="group h-full rounded-2xl border bg-card p-6 transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-lg">
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-xl font-bold text-primary">{tp(title)}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{tp(text)}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className={cn(bigBtn, outlineBtn)}>
            <Link href="/features">
              {t("See all features", "সব সুবিধা দেখুন")} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── For families ─────────────────────────────────── */}
      <section id="family" aria-labelledby="family-title" className="scroll-mt-20 bg-secondary">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <FamilyPreview />
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={100}>
            <SectionTitle
              id="family-title"
              eyebrow={t("For children living far away", "দূরে থাকা সন্তানদের জন্য")}
              title={t("Stay worry-free, from the office or abroad", "অফিসে বা প্রবাসে বসেও নিশ্চিন্ত থাকুন")}
              text={t(
                "When parents press “Taken” after their medicine, it shows on your dashboard. If they don't press it on time, you get an alert by email.",
                "বাবা-মা ওষুধ খেয়ে “খেয়েছি” চাপলেই আপনার ড্যাশবোর্ডে দেখা যাবে। সময় পার হয়ে গেলেও না চাপলে আপনার ইমেইলে সতর্কবার্তা যাবে।",
              )}
            />
            <Button asChild className={cn(bigBtn, "mt-7")}>
              <Link href="/register?role=CAREGIVER">
                <HeartHandshake aria-hidden /> {t("Join as a caregiver", "কেয়ারগিভার হিসেবে যুক্ত হন")}
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ─── Safety + FAQ ─────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="rounded-3xl border bg-card p-7 lg:sticky lg:top-24">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-7" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-primary">{t("Your safety comes first", "আপনার নিরাপত্তা আগে")}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                {t(
                  "AI can sometimes misread handwriting, so you confirm every medicine before any reminder starts. If unsure, ask your doctor or pharmacist before buying.",
                  "এআই কখনো কখনো ভুল পড়তে পারে। তাই প্রতিটি ওষুধ আপনাকে মিলিয়ে নিশ্চিত করতে বলা হয়। সন্দেহ হলে ওষুধ কেনার আগে ডাক্তার বা ফার্মাসিস্টকে জিজ্ঞেস করুন।",
                )}
              </p>
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-4 text-base font-semibold text-primary">
                <Lock className="mt-0.5 size-5 shrink-0" aria-hidden />
                {t("Only you and the caregivers you choose can see your prescriptions.", "আপনার প্রেসক্রিপশন শুধু আপনি আর আপনার বেছে নেওয়া কেয়ারগিভার দেখতে পারেন।")}
              </p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionTitle id="faq-title" eyebrow={t("Questions", "জিজ্ঞাসা")} title={t("What families ask us", "পরিবারগুলো যা জানতে চায়")} />
            </Reveal>
            <div className="mt-8 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q[0]} className="group rounded-2xl border bg-card open:border-primary/40 open:shadow-md">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 text-lg font-semibold text-primary focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                    {tp(item.q)}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 text-base leading-relaxed text-muted-foreground">{tp(item.a)}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section ref={endRef} aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <div className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-primary-foreground/10" aria-hidden />
            <div className="absolute -bottom-28 -left-20 -z-10 size-64 rounded-full bg-primary-foreground/5" aria-hidden />
            <h2 id="cta-title" className="text-3xl font-bold text-balance sm:text-4xl">
              {t("Add your first prescription today", "আজই প্রথম প্রেসক্রিপশন যোগ করুন")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/85">
              {t("Open an account with just your email. It takes less than a minute.", "শুধু ইমেইল দিয়ে অ্যাকাউন্ট খুলুন। এক মিনিটও লাগবে না।")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary" className={bigBtn}>
                <Link href={startHref}>
                  <Camera aria-hidden /> {t("Take a photo of the prescription", "প্রেসক্রিপশনের ছবি তুলুন")}
                </Link>
              </Button>
              <Button asChild variant="ghost" className={cn(bigBtn, onPrimaryOutline)}>
                <Link href={user ? "/dashboard" : "/login"}>{user ? t("Go to dashboard", "ড্যাশবোর্ডে যান") : t("I already have an account", "আগে থেকে অ্যাকাউন্ট আছে")}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <StickyCta heroRef={heroRef} endRef={endRef} href={startHref} />
    </div>
  );
}
