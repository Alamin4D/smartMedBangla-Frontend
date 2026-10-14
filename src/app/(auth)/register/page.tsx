import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/states";
import { RegisterForm } from "@/features/auth/register-form";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><T en="Create your account" bn="আপনার অ্যাকাউন্ট খুলুন" /></h1>
        <p className="mt-1 text-muted-foreground"><T en="Reminders are free forever. Takes less than a minute." bn="রিমাইন্ডার সবসময় ফ্রি। এক মিনিটও লাগবে না।" /></p>
      </div>
      <Suspense fallback={<Spinner />}>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        <T en="Already have an account?" bn="আগে থেকেই অ্যাকাউন্ট আছে?" />{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          <T en="Log in" bn="লগইন" />
        </Link>
      </p>
    </div>
  );
}
