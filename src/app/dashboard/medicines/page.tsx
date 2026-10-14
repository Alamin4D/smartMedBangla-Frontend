"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MedicineList } from "@/features/medicines/medicine-list";
import { T } from "@/components/shared/t";

function MedicinesContent() {
  const params = useSearchParams();
  return <MedicineList startWithNew={params.get("new") === "1"} />;
}

export default function MedicinesPage() {
  return (
    <>
      <PageHeader title={<T en="Medicines" bn="ওষুধসমূহ" />} description={<T en="All your medicines and their reminder times." bn="আপনার সব ওষুধ ও রিমাইন্ডারের সময়।" />} />
      <Suspense>
        <MedicinesContent />
      </Suspense>
    </>
  );
}
