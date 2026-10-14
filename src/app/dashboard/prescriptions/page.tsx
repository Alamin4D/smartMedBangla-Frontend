"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PrescriptionList } from "@/features/prescriptions/prescription-list";
import { T } from "@/components/shared/t";

function Content() {
  const params = useSearchParams();
  return <PrescriptionList openUpload={params.get("upload") === "1"} patientId={params.get("patientId") ?? undefined} />;
}

export default function PrescriptionsPage() {
  return (
    <>
      <PageHeader title={<T en="Prescriptions" bn="প্রেসক্রিপশন" />} description={<T en="Your digital prescription history — never lose a paper prescription again." bn="আপনার ডিজিটাল প্রেসক্রিপশন ইতিহাস — কাগজ হারানোর ভয় আর নেই।" />} />
      <Suspense>
        <Content />
      </Suspense>
    </>
  );
}
