"use client";

import { Loader2, ScanText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/shared/image-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAiUsage } from "@/features/ai/api";
import { ApiError, errorMessage } from "@/lib/api";
import { useUploadPrescription } from "./api";
import { useT } from "@/hooks/use-t";

/** Friendly progress while the AI works; mounted only during the upload so it always starts at step 1. */
function ProcessingStages() {
  const [stage, setStage] = useState(0);
  const { t } = useT();
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-4 py-6 text-center" aria-live="polite">
      <Sparkles className="mx-auto size-10 animate-pulse text-primary" />
      <p className="text-lg font-medium">{t(STAGES[stage]![0], STAGES[stage]![1])}</p>
      <Progress value={((stage + 1) / STAGES.length) * 90} />
      <p className="text-sm text-muted-foreground">{t("This usually takes 10–20 seconds.", "সাধারণত ১০–২০ সেকেন্ড লাগে।")}</p>
    </div>
  );
}

const STAGES = [
  ["Uploading photo securely…", "নিরাপদে ছবি আপলোড হচ্ছে…"],
  ["Reading handwriting with AI…", "এআই হাতের লেখা পড়ছে…"],
  ["Finding medicines and doses…", "ওষুধ ও ডোজ খুঁজে বের করছে…"],
  ["Writing Bangla instructions…", "বাংলায় নির্দেশনা লিখছে…"],
] as const;

export function UploadPrescriptionDialog({
  trigger,
  defaultOpen = false,
  patientId,
}: {
  trigger: ReactNode;
  defaultOpen?: boolean;
  patientId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const upload = useUploadPrescription(patientId);
  const usage = useAiUsage();
  const { t, n } = useT();

  const submit = () => {
    if (!file) return toast.error(t("Please choose a photo first", "আগে একটি ছবি বেছে নিন"));
    upload.mutate(
      { file, title: title.trim() || undefined },
      {
        onSuccess: (res) => {
          const p = res.data;
          if (p.status === "FAILED") toast.warning(p.failureReason ?? t("AI could not read it, you can add medicines manually.", "এআই পড়তে পারেনি, আপনি নিজে ওষুধ যোগ করতে পারেন।"));
          else toast.success(res.message);
          setOpen(false);
          setFile(null);
          setTitle("");
          const qs = patientId ? `?patientId=${patientId}` : "";
          router.push(`/dashboard/prescriptions/${p.id}${qs}`);
        },
      },
    );
  };

  const limitReached = usage.data?.limit != null && usage.data.used >= usage.data.limit;

  return (
    <Dialog open={open} onOpenChange={(o) => !upload.isPending && setOpen(o)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="size-5 text-primary" /> {t("Upload a prescription", "প্রেসক্রিপশন আপলোড করুন")}
          </DialogTitle>
          <DialogDescription>{t("Take a clear photo — our AI reads the handwriting and lists every medicine for you to check.", "পরিষ্কার একটি ছবি তুলুন — এআই হাতের লেখা পড়ে সব ওষুধের তালিকা দেখাবে, আপনি যাচাই করবেন।")}</DialogDescription>
        </DialogHeader>

        {upload.isPending ? (
          <ProcessingStages />
        ) : (
          <div className="space-y-4">
            {upload.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errorMessage(upload.error)}
                  {upload.error instanceof ApiError && upload.error.status === 402 && (
                    <Button variant="link" className="h-auto p-0 pl-1" onClick={() => router.push("/dashboard/billing")}>
                      {t("Upgrade", "আপগ্রেড করুন")}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <ImagePicker file={file} onChange={setFile} />
            <div className="space-y-1.5">
              <Label htmlFor="rx-title">{t("Title (optional)", "শিরোনাম (ঐচ্ছিক)")}</Label>
              <Input id="rx-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. Diabetes check-up, March", "যেমন: ডায়াবেটিস চেকআপ, মার্চ")} />
            </div>
            {usage.data?.limit != null && (
              <p className="text-sm text-muted-foreground">
                {t("AI scans this month", "এই মাসের এআই স্ক্যান")}: {n(usage.data.used)} / {n(usage.data.limit)} {t("(free plan)", "(ফ্রি প্ল্যান)")}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={upload.isPending}>
            {t("Cancel", "বাতিল")}
          </Button>
          <Button onClick={submit} disabled={!file || upload.isPending || limitReached}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />} {t("Read with AI", "এআই দিয়ে পড়ুন")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
