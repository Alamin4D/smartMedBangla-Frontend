"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/components/shared/states";
import { useMe } from "@/features/auth/api";
import { CaregiverHome } from "@/features/care/caregiver-home";
import { PatientHome } from "@/features/dashboard/patient-home";

export default function DashboardPage() {
  const { data: user } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "ADMIN") router.replace("/admin");
  }, [user, router]);

  if (!user || user.role === "ADMIN") return <PageLoader />;
  return user.role === "CAREGIVER" ? <CaregiverHome user={user} /> : <PatientHome user={user} />;
}
