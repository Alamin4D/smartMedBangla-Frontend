"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/shared/states";
import { PrescriptionDetail } from "@/features/prescriptions/prescription-detail";

function Content() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  return <PrescriptionDetail id={id} patientId={params.get("patientId") ?? undefined} />;
}

export default function PrescriptionDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Content />
    </Suspense>
  );
}
