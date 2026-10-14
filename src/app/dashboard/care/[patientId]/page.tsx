"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { PageLoader } from "@/components/shared/states";
import { PatientOverviewView } from "@/features/care/patient-overview";

function Content() {
  const { patientId } = useParams<{ patientId: string }>();
  return <PatientOverviewView patientId={patientId} />;
}

export default function CaredPatientPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Content />
    </Suspense>
  );
}
