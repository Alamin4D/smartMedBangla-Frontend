"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/use-t";
import { errorMessage } from "@/lib/api";
import { useForgotPassword, useResendOtp, useResetPassword } from "./api";
import { PasswordInput } from "./password-input";
import { authSchemas, type ResetValues } from "./schemas";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { t, lang } = useT();
  const forgot = useForgotPassword();
  const schema = useMemo(() => z.object({ email: authSchemas(lang).email }), [lang]);
  const form = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit(({ email }) =>
    forgot.mutate(
      { email },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {forgot.error && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(forgot.error)}</AlertDescription>
        </Alert>
      )}
      <FormField id="email" label={t("Email", "ইমেইল")} error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={forgot.isPending}>
        {forgot.isPending && <Loader2 className="animate-spin" />} {t("Send reset code", "রিসেট কোড পাঠান")}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, lang } = useT();
  const reset = useResetPassword();
  const resend = useResendOtp();
  const schema = useMemo(() => authSchemas(lang).reset, [lang]);
  const form = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get("email") ?? "", code: "", password: "", confirmPassword: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(({ confirmPassword: _c, ...values }) =>
    reset.mutate(values, {
      onSuccess: () => {
        toast.success(t("Password updated. Please log in.", "পাসওয়ার্ড পরিবর্তন হয়েছে। আবার লগইন করুন।"));
        router.push("/login");
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {reset.error && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(reset.error)}</AlertDescription>
        </Alert>
      )}
      <FormField id="email" label={t("Email", "ইমেইল")} error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField id="code" label={t("6-digit code from email", "ইমেইলে পাওয়া ৬ সংখ্যার কোড")} error={errors.code?.message}>
        <Input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="text-lg tracking-[0.3em]" {...form.register("code")} />
      </FormField>
      <FormField id="password" label={t("New password", "নতুন পাসওয়ার্ড")} error={errors.password?.message}>
        <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <FormField id="confirmPassword" label={t("Confirm new password", "নতুন পাসওয়ার্ড আবার দিন")} error={errors.confirmPassword?.message}>
        <PasswordInput id="confirmPassword" autoComplete="new-password" {...form.register("confirmPassword")} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={reset.isPending}>
        {reset.isPending && <Loader2 className="animate-spin" />} {t("Update password", "পাসওয়ার্ড পরিবর্তন করুন")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={resend.isPending}
        onClick={() => {
          const email = form.getValues("email");
          if (!email) return toast.error(t("Enter your email first", "আগে আপনার ইমেইল দিন"));
          resend.mutate(
            { email, purpose: "PASSWORD_RESET" },
            { onSuccess: () => toast.success(t("A new code is on its way", "নতুন কোড পাঠানো হয়েছে")), onError: (e) => toast.error(errorMessage(e)) },
          );
        }}
      >
        {t("Resend code", "কোড আবার পাঠান")}
      </Button>
    </form>
  );
}
