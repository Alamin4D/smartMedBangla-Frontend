"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/states";
import { useMe } from "@/features/auth/api";
import { CaregiverInvites, PatientCareCircle } from "@/features/care/care-circle";
import { T } from "@/components/shared/t";

export default function CarePage() {
  const { data: user } = useMe();
  if (!user) return <PageLoader />;

  if (user.role === "CAREGIVER") {
    return (
      <>
        <PageHeader title={<T en="Caregiver invitations" bn="কেয়ারগিভার আমন্ত্রণ" />} description={<T en="Accept an invitation to start monitoring a patient's medicines." bn="আমন্ত্রণ গ্রহণ করে রোগীর ওষুধের খোঁজ রাখা শুরু করুন।" />} />
        <CaregiverInvites />
      </>
    );
  }
  return (
    <>
      <PageHeader title={<T en="Care circle" bn="কেয়ার সার্কেল" />} description={<T en="Family members who can see your medicine schedule and receive missed-dose alerts." bn="পরিবারের যারা আপনার ওষুধের তালিকা দেখতে ও সতর্কবার্তা পেতে পারেন।" />} />
      <PatientCareCircle />
    </>
  );
}
