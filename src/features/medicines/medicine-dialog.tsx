"use client";

import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { errorMessage } from "@/lib/api";
import type { Medicine } from "@/types";
import { useSaveMedicine, type MedicineInput } from "./api";
import { cleanMedicine, emptyMedicine, MedicineEditor, medicineToInput, validateMedicine } from "./medicine-editor";
import { useT } from "@/hooks/use-t";

/** Mounted only while the dialog is open, so its state always starts fresh. */
function MedicineForm({ medicine, patientId, onDone }: { medicine?: Medicine; patientId?: string; onDone: () => void }) {
  const [value, setValue] = useState<MedicineInput>(() => (medicine ? medicineToInput(medicine) : emptyMedicine()));
  const save = useSaveMedicine(patientId);
  const { t, lang } = useT();

  const submit = () => {
    const problem = validateMedicine(value, lang);
    if (problem) return toast.error(problem);
    save.mutate(
      { id: medicine?.id, input: cleanMedicine(value) },
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
      <MedicineEditor value={value} onChange={setValue} />
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          {t("Cancel", "বাতিল")}
        </Button>
        <Button onClick={submit} disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />} {t("Save medicine", "ওষুধ সংরক্ষণ")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function MedicineDialog({
  medicine,
  patientId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  medicine?: Medicine;
  patientId?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{medicine ? t(`Edit ${medicine.name}`, `${medicine.name} সম্পাদনা`) : t("Add a medicine", "ওষুধ যোগ করুন")}</DialogTitle>
          <DialogDescription>{t("Reminders are created from the times below in your own timezone.", "নিচের সময়গুলো অনুযায়ী আপনার রিমাইন্ডার তৈরি হবে।")}</DialogDescription>
        </DialogHeader>
        {open && <MedicineForm medicine={medicine} patientId={patientId} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
