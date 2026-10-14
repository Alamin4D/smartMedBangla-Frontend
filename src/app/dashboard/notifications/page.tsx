"use client";

import { AlertTriangle, Bell, BellRing, CheckCheck, CreditCard, HeartHandshake, Hourglass, Megaphone, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications } from "@/features/notifications/api";
import { fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/voice";
import type { AppNotification } from "@/types";
import { useT } from "@/hooks/use-t";

const ICONS: Record<AppNotification["type"], typeof Bell> = {
  DOSE_REMINDER: BellRing,
  MISSED_DOSE: AlertTriangle,
  EXPIRY_ALERT: Hourglass,
  CARE_INVITE: HeartHandshake,
  PAYMENT: CreditCard,
  SYSTEM: Megaphone,
};

function linkFor(n: AppNotification) {
  if (n.data?.patientId) return `/dashboard/care/${n.data.patientId}`;
  if (n.type === "EXPIRY_ALERT") return "/dashboard/cabinet";
  if (n.type === "CARE_INVITE") return "/dashboard/care";
  if (n.type === "PAYMENT") return "/dashboard/billing";
  if (n.type === "DOSE_REMINDER" || n.type === "MISSED_DOSE") return "/dashboard";
  return null;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const { data, isLoading, error, refetch } = useNotifications(page, unread);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const remove = useDeleteNotification();
  const { t, n } = useT();

  return (
    <>
      <PageHeader
        title={t("Notifications", "নোটিফিকেশন")}
        description={data ? t(`${data.unread} unread`, `${n(data.unread)}টি অপঠিত`) : undefined}
        actions={
          <Button variant="outline" onClick={() => markAll.mutate()} disabled={!data?.unread || markAll.isPending}>
            <CheckCheck /> {t("Mark all as read", "সব পঠিত করুন")}
          </Button>
        }
      />
      <Tabs
        value={unread ? "unread" : "all"}
        onValueChange={(v) => {
          setUnread(v === "unread");
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">{t("All", "সব")}</TabsTrigger>
          <TabsTrigger value="unread">{t("Unread", "অপঠিত")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={<Bell />} title={unread ? t("You're all caught up", "সব পড়া হয়ে গেছে") : t("No notifications yet", "এখনো কোনো নোটিফিকেশন নেই")} description={t("Reminders, alerts and updates will appear here.", "রিমাইন্ডার, সতর্কবার্তা ও আপডেট এখানে দেখাবে।")} />
      ) : (
        <>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {data.items.map((n) => {
              const Icon = ICONS[n.type];
              const href = linkFor(n);
              return (
                <li key={n.id} className={cn("flex gap-3 p-4", !n.isRead && "bg-accent/40")}>
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      n.type === "MISSED_DOSE" ? "bg-destructive/10 text-destructive" : n.type === "EXPIRY_ALERT" ? "bg-warning/20 text-amber-700" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{fmtRelative(n.createdAt)}</span>
                      {href && (
                        <Link href={href} onClick={() => !n.isRead && markRead.mutate(n.id)} className="font-medium text-primary hover:underline">
                          {t("Open", "খুলুন")}
                        </Link>
                      )}
                      {!n.isRead && (
                        <button type="button" className="hover:text-foreground" onClick={() => markRead.mutate(n.id)}>
                          {t("Mark as read", "পঠিত করুন")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    {n.speakText && (
                      <Button variant="ghost" size="icon-sm" onClick={() => speak(n.speakText!)} aria-label={t("Read aloud", "শুনুন")}>
                        <Volume2 />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(n.id)} aria-label={t("Delete notification", "নোটিফিকেশন মুছুন")}>
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={page} totalPages={data.meta?.totalPages ?? 1} onChange={setPage} />
        </>
      )}
    </>
  );
}
