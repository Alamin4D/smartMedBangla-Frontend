"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/features/notifications/api";
import { useT } from "@/hooks/use-t";

export function NotificationBell() {
  const { data: count = 0 } = useUnreadCount();
  const { t } = useT();
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/dashboard/notifications" aria-label={t(`Notifications${count ? `, ${count} unread` : ""}`, `নোটিফিকেশন${count ? `, ${count}টি অপঠিত` : ""}`)} className="relative">
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[0.65rem] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
