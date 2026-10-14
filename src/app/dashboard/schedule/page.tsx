import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DoseHistory } from "@/features/doses/dose-history";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Dose history" };

export default function SchedulePage() {
  return (
    <>
      <PageHeader title={<T en="Dose history" bn="ওষুধ খাওয়ার ইতিহাস" />} description={<T en="Every dose — taken, skipped or missed — day by day." bn="প্রতিদিনের প্রতিটি ডোজ — খাওয়া, এড়ানো বা বাদ পড়া।" />} />
      <DoseHistory />
    </>
  );
}
