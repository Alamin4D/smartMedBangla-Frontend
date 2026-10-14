"use client";

import { Archive, CheckCircle2, MoreVertical, Package, Pencil, Plus, ScanLine, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatCard } from "@/components/shared/stat-card";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorMessage } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/types";
import { useCabinet, useDeleteCabinetItem, useSaveCabinetItem, type CabinetFilter } from "./api";
import { CabinetItemDialog } from "./cabinet-item-dialog";
import { useT } from "@/hooks/use-t";

const STATE_UI = {
  OK: { en: "Good", bn: "ভালো আছে", variant: "success" as const, ring: "" },
  EXPIRING: { en: "Expiring soon", bn: "শীঘ্রই মেয়াদ শেষ", variant: "warning" as const, ring: "border-warning" },
  EXPIRED: { en: "Expired — do not take", bn: "মেয়াদোত্তীর্ণ — খাবেন না", variant: "destructive" as const, ring: "border-destructive" },
  DISPOSED: { en: "Disposed", bn: "ফেলে দেওয়া হয়েছে", variant: "secondary" as const, ring: "opacity-70" },
};

function ItemCard({ item, patientId, onEdit }: { item: InventoryItem; patientId?: string; onEdit: () => void }) {
  const save = useSaveCabinetItem(patientId);
  const remove = useDeleteCabinetItem(patientId);
  const ui = STATE_UI[item.state];
  const { t, n } = useT();

  return (
    <Card className={cn("h-full", ui.ring)}>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail
            <img
              src={item.imageUrl.replace("/upload/", "/upload/c_fill,w_120,h_120,q_auto,f_auto/")}
              alt=""
              className="size-14 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted">
              <Package className="size-6 text-muted-foreground" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{item.name}</h3>
            <Badge variant={ui.variant}>{t(ui.en, ui.bn)}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t(`Actions for ${item.name}`, `${item.name} এর অপশন`)}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil /> {t("Edit", "সম্পাদনা")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  save.mutate(
                    { id: item.id, input: { isDisposed: !item.isDisposed } },
                    { onSuccess: () => toast.success(item.isDisposed ? t("Restored", "ফিরিয়ে আনা হয়েছে") : t("Marked as disposed", "ফেলে দেওয়া হিসেবে চিহ্নিত")), onError: (e) => toast.error(errorMessage(e)) },
                  )
                }
              >
                {item.isDisposed ? <Undo2 /> : <Archive />} {item.isDisposed ? t("Restore", "ফিরিয়ে আনুন") : t("Mark as disposed", "ফেলে দিয়েছি")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDialog
                title={t(`Remove ${item.name}?`, `${item.name} সরাবেন?`)}
                confirmLabel={t("Remove", "সরান")}
                onConfirm={() => remove.mutate(item.id, { onSuccess: () => toast.success(t("Removed", "সরানো হয়েছে")), onError: (e) => toast.error(errorMessage(e)) })}
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 /> {t("Remove", "সরান")}
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-xl bg-muted/60 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t("Expiry date", "মেয়াদ শেষের তারিখ")}</p>
          <p className="text-2xl font-bold">{fmtDate(item.expiryDate)}</p>
          {!item.isDisposed && (
            <p className={cn("text-sm", item.daysLeft < 0 ? "text-destructive" : item.daysLeft <= 7 ? "text-amber-600" : "text-muted-foreground")}>
              {item.daysLeft < 0 ? t(`Expired ${Math.abs(item.daysLeft)} days ago`, `${n(Math.abs(item.daysLeft))} দিন আগে মেয়াদ শেষ`) : item.daysLeft === 0 ? t("Expires today", "আজ মেয়াদ শেষ") : t(`${item.daysLeft} days left`, `আর ${n(item.daysLeft)} দিন বাকি`)}
            </p>
          )}
        </div>
        <p className="mt-auto text-xs text-muted-foreground">
          {[item.batchNumber && `${t("Batch", "ব্যাচ")} ${item.batchNumber}`, item.quantity != null && t(`${item.quantity} left`, `${n(item.quantity)}টি বাকি`)].filter(Boolean).join(" · ")}
        </p>
      </CardContent>
    </Card>
  );
}

export function CabinetView({ patientId, startScan = false }: { patientId?: string; startScan?: boolean }) {
  const [filter, setFilter] = useState<CabinetFilter>("active");
  const [dialog, setDialog] = useState<{ open: boolean; scan?: boolean; item?: InventoryItem }>({ open: startScan, scan: startScan });
  const { data, isLoading, error, refetch } = useCabinet(filter, patientId);
  const { t, n } = useT();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={() => setDialog({ open: true, scan: true })}>
          <ScanLine /> {t("Scan strip with AI", "এআই দিয়ে পাতা স্ক্যান")}
        </Button>
        <Button size="lg" variant="outline" onClick={() => setDialog({ open: true })}>
          <Plus /> {t("Add manually", "নিজে যোগ করুন")}
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label={t("Good", "ভালো আছে")} value={n(data.summary.ok)} icon={<CheckCircle2 />} tone="success" />
          <StatCard label={t("Expiring ≤ 7 days", "৭ দিনে মেয়াদ শেষ")} value={n(data.summary.expiring)} icon={<Package />} tone="warning" />
          <StatCard label={t("Expired", "মেয়াদোত্তীর্ণ")} value={n(data.summary.expired)} icon={<Trash2 />} tone="danger" />
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as CabinetFilter)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="active">{t("In cabinet", "বাক্সে আছে")}</TabsTrigger>
          <TabsTrigger value="expiring">{t("Expiring", "মেয়াদ শেষ হচ্ছে")}</TabsTrigger>
          <TabsTrigger value="expired">{t("Expired", "মেয়াদোত্তীর্ণ")}</TabsTrigger>
          <TabsTrigger value="disposed">{t("Disposed", "ফেলে দেওয়া")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={<Package />}
          title={filter === "active" ? t("Your medicine cabinet is empty", "আপনার ওষুধের বাক্স খালি") : t("Nothing here", "এখানে কিছু নেই")}
          description={t("Scan the medicines you keep at home. We'll warn you before any of them expire.", "ঘরে থাকা ওষুধগুলো স্ক্যান করুন। মেয়াদ শেষ হওয়ার আগেই আমরা জানিয়ে দেব।")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item) => (
            <ItemCard key={item.id} item={item} patientId={patientId} onEdit={() => setDialog({ open: true, item })} />
          ))}
        </div>
      )}

      <CabinetItemDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        item={dialog.item}
        scan={dialog.scan}
        patientId={patientId}
      />
    </div>
  );
}
