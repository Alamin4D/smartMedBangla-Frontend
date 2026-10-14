"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CabinetView } from "@/features/cabinet/cabinet-view";
import { T } from "@/components/shared/t";

function Content() {
  const params = useSearchParams();
  return <CabinetView startScan={params.get("scan") === "1"} />;
}

export default function CabinetPage() {
  return (
    <>
      <PageHeader title={<T en="Medicine cabinet" bn="ওষুধের বাক্স" />} description={<T en="Track the medicines you keep at home and never take an expired one." bn="ঘরে রাখা ওষুধের হিসাব রাখুন, মেয়াদোত্তীর্ণ ওষুধ আর খাবেন না।" />} />
      <Suspense>
        <Content />
      </Suspense>
    </>
  );
}
