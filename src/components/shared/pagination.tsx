"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-t";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t, n } = useT();
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label={t("Pagination", "পৃষ্ঠা নির্বাচন")}>
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft /> {t("Previous", "আগের")}
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        {t(`Page ${page} of ${totalPages}`, `পৃষ্ঠা ${n(page)} / ${n(totalPages)}`)}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        {t("Next", "পরের")} <ChevronRight />
      </Button>
    </nav>
  );
}
