import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/states";
import { LoginForm } from "@/features/auth/login-form";
import { T } from "@/components/shared/t";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold"><T en="Welcome back" bn="আবার স্বাগতম" /></h1>
        <p className="mt-1 text-muted-foreground"><T en="Log in to see today's medicines." bn="আজকের ওষুধ দেখতে লগইন করুন।" /></p>
      </div>
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        <T en="New to SmartMed?" bn="স্মার্টমেডে নতুন?" />{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          <T en="Create an account" bn="অ্যাকাউন্ট খুলুন" />
        </Link>
      </p>
    </div>
  );
}
