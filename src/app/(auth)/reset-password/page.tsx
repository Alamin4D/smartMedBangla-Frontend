import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/states";
import { ResetPasswordForm } from "@/features/auth/password-reset-forms";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><T en="Set a new password" bn="নতুন পাসওয়ার্ড দিন" /></h1>
        <p className="mt-1 text-muted-foreground"><T en="For your security, all devices will be logged out." bn="নিরাপত্তার জন্য সব ডিভাইস থেকে লগআউট করা হবে।" /></p>
      </div>
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
