import { HeartHandshake, Languages, ScanLine } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { T } from "@/components/shared/t";
import { LanguageToggle } from "@/components/shared/language-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo className="[&_span:first-child]:bg-primary-foreground [&_span:first-child]:text-primary [&_.text-primary]:text-primary-foreground/80" />
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight"><T en="Your family's medicines, read by AI and spoken in Bangla." bn="পরিবারের ওষুধ — এআই পড়ে দেয়, বাংলায় মনে করিয়ে দেয়।" /></h2>
          <ul className="space-y-4 text-primary-foreground/90">
            <li className="flex gap-3">
              <ScanLine className="size-6 shrink-0" /> <T en="Upload any handwritten prescription" bn="যেকোনো হাতে লেখা প্রেসক্রিপশন আপলোড করুন" />
            </li>
            <li className="flex gap-3">
              <Languages className="size-6 shrink-0" /> <T en="Bangla voice reminders at dose time" bn="ওষুধের সময় বাংলায় ভয়েস রিমাইন্ডার" />
            </li>
            <li className="flex gap-3">
              <HeartHandshake className="size-6 shrink-0" /> <T en="Caregivers alerted when a dose is missed" bn="ওষুধ বাদ পড়লে পরিবারকে জানানো হয়" />
            </li>
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70"><T en="SmartMed does not replace medical advice." bn="স্মার্টমেড ডাক্তারের পরামর্শের বিকল্প নয়।" /></p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end">
          <Logo className="lg:hidden" />
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
