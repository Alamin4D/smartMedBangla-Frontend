"use client";

import { ChevronDown } from "lucide-react";
import { PlanCards } from "@/features/billing/plan-cards";
import { useT } from "@/hooks/use-t";

const FAQ = [
  {
    q: ["Do I need to install an app?", "অ্যাপ ইনস্টল করতে হবে?"],
    a: ["No. SmartMed works in any modern browser on phones, tablets and computers. Just bookmark it.", "না। স্মার্টমেড যেকোনো ফোন, ট্যাব বা কম্পিউটারের ব্রাউজারে চলে। শুধু বুকমার্ক করে রাখুন।"],
  },
  {
    q: ["How do I pay?", "কীভাবে পেমেন্ট করব?"],
    a: ["Premium is paid securely through SSLCommerz — bKash, Nagad, Rocket, cards and internet banking are supported.", "প্রিমিয়ামের পেমেন্ট SSLCommerz দিয়ে নিরাপদে হয় — বিকাশ, নগদ, রকেট, কার্ড ও ইন্টারনেট ব্যাংকিং চলে।"],
  },
  {
    q: ["Is my medical data safe?", "আমার মেডিকেল তথ্য কি নিরাপদ?"],
    a: [
      "Connections are encrypted, accounts are protected with email verification and login lockout, and only caregivers you approve can see your schedule.",
      "সংযোগ এনক্রিপ্টেড, অ্যাকাউন্ট ইমেইল যাচাই ও লগইন সুরক্ষা দিয়ে সুরক্ষিত, আর শুধু আপনার অনুমোদিত কেয়ারগিভাররাই তালিকা দেখতে পারেন।",
    ],
  },
  {
    q: ["Does the AI replace my doctor?", "এআই কি ডাক্তারের বিকল্প?"],
    a: ["No. SmartMed helps you follow your doctor's prescription. Always confirm with a doctor or pharmacist when unsure.", "না। স্মার্টমেড শুধু ডাক্তারের প্রেসক্রিপশন মেনে চলতে সাহায্য করে। সন্দেহ হলে ডাক্তার বা ফার্মাসিস্টকে জিজ্ঞাসা করুন।"],
  },
] as const;

export function PricingView() {
  const { t, tp } = useT();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("Simple, fair pricing", "সহজ ও ন্যায্য মূল্য")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t(
            "Reminders and voice alerts are always free. Upgrade for unlimited AI scans and a bigger care circle.",
            "রিমাইন্ডার ও ভয়েস অ্যালার্ট সবসময় ফ্রি। আনলিমিটেড এআই স্ক্যান আর বড় কেয়ার সার্কেলের জন্য আপগ্রেড করুন।",
          )}
        </p>
      </div>
      <div className="mt-10">
        <PlanCards />
      </div>
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold">{t("Frequently asked questions", "সাধারণ জিজ্ঞাসা")}</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q[0]} className="group rounded-2xl border bg-card px-5 py-4 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {tp(item.q)}
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-muted-foreground">{tp(item.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
