"use client";

import { Loader2, ScanLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/shared/image-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import { toInputDate } from "@/lib/format";
import type { InventoryItem } from "@/types";
import { useSaveCabinetItem, useScanStrip, type CabinetInput } from "./api";
import { useT } from "@/hooks/use-t";

const toInput = (item?: InventoryItem): CabinetInput =>
  item
    ? {
        name: item.name,
        batchNumber: item.batchNumber ?? "",
        manufactureDate: toInputDate(item.manufactureDate),
        expiryDate: toInputDate(item.expiryDate),
        quantity: item.quantity,
        notes: item.notes ?? "",
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId,
      }
    : { name: "", batchNumber: "", manufactureDate: "", expiryDate: "", quantity: null, notes: "", imageUrl: null, imagePublicId: null };

interface FormProps {
  item?: InventoryItem;
  scan?: boolean;
  patientId?: string;
  onDone: () => void;
  onBusyChange: (busy: boolean) => void;
}

/**
 * Mounted fresh each time the dialog opens. In scan mode the user first photographs the strip;
 * the AI pre-fills name and expiry date, which the user confirms before saving.
 */
function CabinetItemForm({ item, scan, patientId, onDone, onBusyChange }: FormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [value, setValue] = useState<CabinetInput>(() => toInput(item));
  const [scanned, setScanned] = useState<{ confidence: number } | null>(null);
  const scanStrip = useScanStrip(patientId);
  const save = useSaveCabinetItem(patientId);
  const showScanStep = scan && !scanned && !item;
  const { t, n } = useT();

  const set = <K extends keyof CabinetInput>(k: K, v: CabinetInput[K]) => setValue((s) => ({ ...s, [k]: v }));

  const runScan = () => {
    if (!file) return;
    onBusyChange(true);
    scanStrip.mutate(file, {
      onSettled: () => onBusyChange(false),
      onSuccess: (res) => {
        const r = res.data;
        setScanned({ confidence: r.confidence });
        setValue({
          name: [r.name, r.strength].filter(Boolean).join(" "),
          batchNumber: r.batchNumber ?? "",
          manufactureDate: r.manufactureDate ?? "",
          expiryDate: r.expiryDate ?? "",
          quantity: null,
          notes: "",
          imageUrl: r.imageUrl,
          imagePublicId: r.imagePublicId,
        });
        if (r.expiryDate) toast.success(res.message);
        else toast.warning(res.message);
      },
    });
  };

  const submit = () => {
    if (!value.name.trim()) return toast.error(t("Medicine name is required", "ওষুধের নাম দিন"));
    if (!value.expiryDate) return toast.error(t("Expiry date is required", "মেয়াদ শেষের তারিখ দিন"));
    save.mutate(
      {
        id: item?.id,
        input: {
          ...value,
          name: value.name.trim(),
          batchNumber: value.batchNumber || null,
          manufactureDate: value.manufactureDate || null,
          notes: value.notes || null,
        },
      },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <>
      <DialogDescription>
        {showScanStep ? t("Photograph the side of the strip or box where the expiry date is printed.", "পাতা বা বাক্সের যেখানে মেয়াদ লেখা আছে সেই অংশের ছবি তুলুন।") : t("We'll alert you 7 days before it expires.", "মেয়াদ শেষের ৭ দিন আগে আমরা জানিয়ে দেব।")}
      </DialogDescription>

      {showScanStep ? (
        <div className="space-y-4">
          {scanStrip.error && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage(scanStrip.error)}</AlertDescription>
            </Alert>
          )}
          <ImagePicker file={file} onChange={setFile} disabled={scanStrip.isPending} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {scanned && (
            <div className="flex items-center gap-2 rounded-lg bg-accent p-3 text-sm text-accent-foreground sm:col-span-2">
              <Sparkles className="size-4" /> {t("Filled by AI — please double-check.", "এআই পূরণ করেছে — একবার মিলিয়ে দেখুন।")}
              <Badge variant="secondary" className="ml-auto">
                {t(`${Math.round(scanned.confidence * 100)}% sure`, `${n(Math.round(scanned.confidence * 100))}% নিশ্চিত`)}
              </Badge>
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cab-name">{t("Medicine name *", "ওষুধের নাম *")}</Label>
            <Input id="cab-name" value={value.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cab-exp">{t("Expiry date *", "মেয়াদ শেষের তারিখ *")}</Label>
            <Input id="cab-exp" type="date" value={value.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cab-mfg">{t("Manufacture date", "উৎপাদনের তারিখ")}</Label>
            <Input id="cab-mfg" type="date" value={value.manufactureDate ?? ""} onChange={(e) => set("manufactureDate", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cab-batch">{t("Batch no.", "ব্যাচ নং")}</Label>
            <Input id="cab-batch" value={value.batchNumber ?? ""} onChange={(e) => set("batchNumber", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cab-qty">{t("Quantity left", "কতগুলো বাকি")}</Label>
            <Input
              id="cab-qty"
              type="number"
              min={0}
              value={value.quantity ?? ""}
              onChange={(e) => set("quantity", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cab-notes">{t("Notes", "নোট")}</Label>
            <Textarea id="cab-notes" rows={2} value={value.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={scanStrip.isPending}>
          {t("Cancel", "বাতিল")}
        </Button>
        {showScanStep ? (
          <Button onClick={runScan} disabled={!file || scanStrip.isPending}>
            {scanStrip.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} {t("Read expiry date", "মেয়াদ পড়ুন")}
          </Button>
        ) : (
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending && <Loader2 className="animate-spin" />} {t("Save", "সংরক্ষণ")}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

export function CabinetItemDialog({
  open,
  onOpenChange,
  item,
  scan,
  patientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem;
  scan?: boolean;
  patientId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const { t } = useT();
  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {scan && !item ? <ScanLine className="size-5 text-primary" /> : null}
            {item ? t(`Edit ${item.name}`, `${item.name} সম্পাদনা`) : scan ? t("Scan a medicine strip", "ওষুধের পাতা স্ক্যান করুন") : t("Add to medicine cabinet", "ওষুধের বাক্সে যোগ করুন")}
          </DialogTitle>
        </DialogHeader>
        {open && <CabinetItemForm item={item} scan={scan} patientId={patientId} onDone={() => onOpenChange(false)} onBusyChange={setBusy} />}
      </DialogContent>
    </Dialog>
  );
}
