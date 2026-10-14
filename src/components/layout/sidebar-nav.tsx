"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { NAV_BY_ROLE } from "./nav-config";

export function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useT();
  const isActive = (href: string) =>
    href === "/dashboard" || href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="space-y-6" aria-label={t("Dashboard", "ড্যাশবোর্ড")}>
      {NAV_BY_ROLE[role].map((group, i) => (
        <div key={i}>
          {group.title && <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t(group.title, group.titleBn ?? group.title)}</p>}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="size-5 shrink-0" aria-hidden />
                  {t(item.label, item.labelBn)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
