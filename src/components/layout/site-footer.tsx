"use client";

import { Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useT } from "@/hooks/use-t";

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            {t(
              "AI prescription reader, Bangla voice reminders and family care dashboard — right in your browser.",
              "এআই প্রেসক্রিপশন রিডার, বাংলা ভয়েস রিমাইন্ডার আর পরিবারের জন্য কেয়ার ড্যাশবোর্ড — সরাসরি ব্রাউজারে।",
            )}
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{t("Product", "প্রোডাক্ট")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/features">{t("Features", "সুবিধাসমূহ")}</Link></li>
            <li><Link className="hover:text-foreground" href="/pricing">{t("Pricing", "মূল্য")}</Link></li>
            <li><Link className="hover:text-foreground" href="/register">{t("Create account", "অ্যাকাউন্ট খুলুন")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{t("Company", "প্রতিষ্ঠান")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/about">{t("About us", "আমাদের কথা")}</Link></li>
            <li><Link className="hover:text-foreground" href="/login">{t("Log in", "লগইন")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{t("Medical disclaimer", "চিকিৎসা সংক্রান্ত সতর্কতা")}</h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "SmartMed helps you follow your doctor's advice. It does not replace a doctor or pharmacist.",
              "স্মার্টমেড আপনাকে ডাক্তারের পরামর্শ মেনে চলতে সাহায্য করে। এটি ডাক্তার বা ফার্মাসিস্টের বিকল্প নয়।",
            )}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-destructive">
            <Phone className="size-4" /> {t("Emergency: call 999", "জরুরি প্রয়োজনে: ৯৯৯")}
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © SmartMed · {t("Made with care in Bangladesh", "বাংলাদেশে যত্ন নিয়ে তৈরি")}
      </div>
    </footer>
  );
}
