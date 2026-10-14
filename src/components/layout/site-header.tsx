"use client";

import { ArrowRight, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Logo } from "@/components/shared/logo";
// import { TextSizeToggle } from "@/components/shared/text-size-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMe } from "@/features/auth/api";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", en: "Home", bn: "হোম" },
  { href: "/features", en: "Features", bn: "সুবিধাসমূহ" },
  { href: "/pricing", en: "Pricing", bn: "মূল্য" },
  { href: "/about", en: "About", bn: "আমাদের কথা" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: user } = useMe();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const authActions = user ? (
    <Button className="rounded-full" asChild>
      <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
        <LayoutDashboard /> {t("Dashboard", "ড্যাশবোর্ড")}
      </Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" className="rounded-full" asChild>
        <Link href="/login">{t("Log in", "লগইন")}</Link>
      </Button>
      <Button className="rounded-full shadow-md shadow-primary/25" asChild>
        <Link href="/register">
          {t("Get started", "শুরু করুন")} <ArrowRight />
        </Link>
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "border-b bg-background/80 shadow-sm backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 rounded-full border bg-background/60 p-1 backdrop-blur md:flex" aria-label={t("Main", "প্রধান মেনু")}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "bg-primary/10 text-primary",
              )}
            >
              {t(item.en, item.bn)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {/* <TextSizeToggle className="hidden lg:inline-flex" /> */}
          <LanguageToggle />
          <ThemeToggle />
          {authActions}
        </div>
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("Open menu", "মেনু খুলুন")}>
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label={t("Mobile menu", "মোবাইল মেনু")}>
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn("rounded-lg px-3 py-3 text-base font-medium hover:bg-muted", pathname === item.href && "bg-accent")}
                  >
                    {t(item.en, item.bn)}
                  </Link>
                ))}
                <div className="mt-3 flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm text-muted-foreground">{t("Text size", "লেখার আকার")}</span>
                  {/* <TextSizeToggle /> */}
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm text-muted-foreground">{t("Theme", "থিম")}</span>
                  <ThemeToggle />
                </div>
                <div className="mt-4 flex flex-col gap-2" onClick={() => setOpen(false)}>
                  {authActions}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
