"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HeartHandshake, Loader2, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/use-t";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRegister } from "./api";
import { PasswordInput } from "./password-input";
import { authSchemas, type RegisterValues } from "./schemas";

const ROLES = [
  { value: "PATIENT", en: "I take medicines", bn: "আমি ওষুধ খাই", hintEn: "Patient", hintBn: "রোগী", icon: User },
  { value: "CAREGIVER", en: "I care for someone", bn: "আমি দেখাশোনা করি", hintEn: "Caregiver", hintBn: "কেয়ারগিভার", icon: HeartHandshake },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, lang } = useT();
  const register = useRegister();
  const schema = useMemo(() => authSchemas(lang).register, [lang]);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: params.get("role") === "CAREGIVER" ? "CAREGIVER" : "PATIENT",
    },
  });
  const { errors } = form.formState;
  const role = useWatch({ control: form.control, name: "role" });

  const onSubmit = form.handleSubmit(({ confirmPassword: _c, phone, ...values }) =>
    register.mutate(
      { ...values, phone: phone || undefined },
      {
        onSuccess: () => {
          toast.success(t("Account created! Check your email for the code.", "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইলে পাঠানো কোডটি দেখুন।"));
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {register.error && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(register.error)}</AlertDescription>
        </Alert>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("Who are you?", "আপনি কে?")}</legend>
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={role === r.value}
              onClick={() => form.setValue("role", r.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-colors",
                role === r.value ? "border-primary bg-accent" : "border-border hover:bg-muted",
              )}
            >
              <r.icon className="size-6 text-primary" />
              <span className="font-semibold">{t(r.en, r.bn)}</span>
              <span className="text-xs text-muted-foreground">{t(r.hintEn, r.hintBn)}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <FormField id="name" label={t("Full name", "পুরো নাম")} error={errors.name?.message}>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...form.register("name")} />
      </FormField>
      <FormField id="email" label={t("Email", "ইমেইল")} error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...form.register("email")} />
      </FormField>
      <FormField id="phone" label={t("Phone (optional)", "ফোন (ঐচ্ছিক)")} error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...form.register("phone")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="password" label={t("Password", "পাসওয়ার্ড")} error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
        </FormField>
        <FormField id="confirmPassword" label={t("Confirm password", "পাসওয়ার্ড আবার দিন")} error={errors.confirmPassword?.message}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...form.register("confirmPassword")} />
        </FormField>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
        {register.isPending && <Loader2 className="animate-spin" />} {t("Create account", "অ্যাকাউন্ট খুলুন")}
      </Button>
    </form>
  );
}
