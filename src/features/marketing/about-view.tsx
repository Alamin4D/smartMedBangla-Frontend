"use client";

import { Database, Globe, HeartPulse, Server, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/hooks/use-t";

const STACK = [
  { icon: Globe, title: ["Frontend", "ফ্রন্টএন্ড"], text: "Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query" },
  { icon: Server, title: ["Backend", "ব্যাকএন্ড"], text: "Node.js, Express (MVC), REST APIs, Zod, JWT" },
  { icon: Database, title: ["Data", "ডেটা"], text: "PostgreSQL + Prisma v7, Redis + BullMQ" },
  { icon: Sparkles, title: ["AI", "এআই"], text: "Google Gemini (vision + text), Groq fallback" },
] as const;

const VALUES = [
  { icon: HeartPulse, title: ["Our mission", "আমাদের লক্ষ্য"], text: ["Make taking the right medicine at the right time effortless for every family.", "প্রতিটি পরিবারের জন্য সঠিক সময়ে সঠিক ওষুধ খাওয়া সহজ করা।"] },
  { icon: Users, title: ["Who it is for", "কাদের জন্য"], text: ["Elderly and chronic patients, their caregivers, and anyone managing multiple prescriptions.", "বয়স্ক ও দীর্ঘমেয়াদি রোগী, তাদের দেখাশোনাকারী, আর যারা একাধিক প্রেসক্রিপশন সামলান।"] },
  { icon: Sparkles, title: ["What makes us different", "আমাদের বিশেষত্ব"], text: ["Handwriting-to-Bangla-voice: AI reads the prescription and speaks reminders in Bangla.", "হাতের লেখা থেকে বাংলা ভয়েস: এআই প্রেসক্রিপশন পড়ে বাংলায় মনে করিয়ে দেয়।"] },
] as const;

export function AboutView() {
  const { t, tp } = useT();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("About SmartMed", "স্মার্টমেড সম্পর্কে")}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {t(
          "SmartMed started with a simple observation: in Bangladesh, many elderly patients cannot read their doctor's handwriting, struggle with small text on medicine strips, and live far from the children who worry about them. We built a website — not an app — so anyone can use it from any device without downloads.",
          "স্মার্টমেড শুরু হয়েছে একটি সাধারণ বাস্তবতা থেকে: বাংলাদেশে অনেক বয়স্ক রোগী ডাক্তারের লেখা পড়তে পারেন না, ওষুধের পাতার ছোট লেখা দেখতে পান না, আর তাদের নিয়ে চিন্তিত সন্তানরা থাকেন দূরে। তাই আমরা অ্যাপ নয়, একটি ওয়েবসাইট বানিয়েছি — যেকোনো ডিভাইস থেকে কিছু ডাউনলোড না করেই ব্যবহার করা যায়।",
        )}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {VALUES.map((item) => (
          <Card key={item.title[0]}>
            <CardContent className="space-y-2">
              <item.icon className="size-7 text-primary" />
              <h2 className="text-lg font-semibold">{tp(item.title)}</h2>
              <p className="text-sm text-muted-foreground">{tp(item.text)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold">{t("Technology", "প্রযুক্তি")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {STACK.map((item) => (
          <div key={item.title[0]} className="flex gap-4 rounded-2xl border p-5">
            <item.icon className="size-7 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{tp(item.title)}</h3>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
