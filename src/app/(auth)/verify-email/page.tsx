import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/states";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><T en="Verify your email" bn="আপনার ইমেইল যাচাই করুন" /></h1>
        <p className="mt-1 text-muted-foreground"><T en="This keeps your health records safe." bn="এতে আপনার স্বাস্থ্য তথ্য নিরাপদ থাকে।" /></p>
      </div>
      <Suspense fallback={<Spinner />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
