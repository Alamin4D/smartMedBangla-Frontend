import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/password-reset-forms";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><T en="Forgot your password?" bn="পাসওয়ার্ড ভুলে গেছেন?" /></h1>
        <p className="mt-1 text-muted-foreground"><T en="Enter your email and we'll send a 6-digit reset code." bn="আপনার ইমেইল দিন, আমরা ৬ সংখ্যার একটি রিসেট কোড পাঠাব।" /></p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          <T en="Back to log in" bn="লগইনে ফিরে যান" />
        </Link>
      </p>
    </div>
  );
}
