"use client";

import { Badge } from "@/components/ui/badge";
import type { PrescriptionStatus } from "@/types";
import { useT } from "@/hooks/use-t";

const MAP: Record<PrescriptionStatus, { en: string; bn: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  VERIFIED: { en: "Verified", bn: "যাচাইকৃত", variant: "success" },
  PROCESSED: { en: "Needs review", bn: "যাচাই করুন", variant: "warning" },
  PROCESSING: { en: "Reading…", bn: "পড়া হচ্ছে…", variant: "secondary" },
  FAILED: { en: "Manual entry", bn: "নিজে লিখুন", variant: "destructive" },
};

export function PrescriptionStatusBadge({ status }: { status: PrescriptionStatus }) {
  const { t } = useT();
  const s = MAP[status];
  return <Badge variant={s.variant}>{t(s.en, s.bn)}</Badge>;
}
