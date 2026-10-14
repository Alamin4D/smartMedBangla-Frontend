"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Laptop, Loader2, LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Spinner } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChangePassword, useRevokeSession, useSessions } from "@/features/auth/api";
import { PasswordInput } from "@/features/auth/password-input";
import { authSchemas, type ChangePasswordValues } from "@/features/auth/schemas";
import { errorMessage } from "@/lib/api";
import { fmtRelative } from "@/lib/format";
import type { User } from "@/types";
import { useDeleteAccount } from "./api";
import { useT } from "@/hooks/use-t";

function describeAgent(ua: string | null, unknown: string) {
  if (!ua) return unknown;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return `${browser}${os ? ` on ${os}` : ""}`;
}

export function SecurityCard({ user }: { user: User }) {
  const router = useRouter();
  const change = useChangePassword();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const del = useDeleteAccount();
  const [deletePassword, setDeletePassword] = useState("");
  const { t, lang } = useT();
  const schema = useMemo(() => authSchemas(lang).change, [lang]);
  const form = useForm<ChangePasswordValues>({ resolver: zodResolver(schema), defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });
  const { errors } = form.formState;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> {t("Change password", "পাসওয়ার্ড পরিবর্তন")}
          </CardTitle>
          <CardDescription>{t("Other devices are logged out after a password change.", "পাসওয়ার্ড বদলালে অন্য সব ডিভাইস থেকে লগআউট হয়ে যাবে।")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-3"
            noValidate
            onSubmit={form.handleSubmit(({ currentPassword, newPassword }) =>
              change.mutate(
                { currentPassword, newPassword },
                {
                  onSuccess: (r) => {
                    toast.success(r.message);
                    form.reset();
                    sessions.refetch();
                  },
                  onError: (e) => toast.error(errorMessage(e)),
                },
              ),
            )}
          >
            <FormField id="cur" label={t("Current password", "বর্তমান পাসওয়ার্ড")} error={errors.currentPassword?.message}>
              <PasswordInput id="cur" autoComplete="current-password" {...form.register("currentPassword")} />
            </FormField>
            <FormField id="new" label={t("New password", "নতুন পাসওয়ার্ড")} error={errors.newPassword?.message}>
              <PasswordInput id="new" autoComplete="new-password" {...form.register("newPassword")} />
            </FormField>
            <FormField id="confirm" label={t("Confirm", "আবার দিন")} error={errors.confirm?.message}>
              <PasswordInput id="confirm" autoComplete="new-password" {...form.register("confirm")} />
            </FormField>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={change.isPending}>
                {change.isPending && <Loader2 className="animate-spin" />} {t("Update password", "পাসওয়ার্ড পরিবর্তন করুন")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>{t("Active sessions", "সক্রিয় ডিভাইস")}</CardTitle>
            <CardDescription>{t("Devices currently logged in to your account.", "যেসব ডিভাইসে আপনার অ্যাকাউন্ট লগইন আছে।")}</CardDescription>
          </div>
          <Button
            variant="outline"
            disabled={revoke.isPending || (sessions.data?.length ?? 0) <= 1}
            onClick={() => revoke.mutate(undefined, { onSuccess: () => toast.success(t("Logged out of other devices", "অন্য সব ডিভাইস থেকে লগআউট হয়েছে")) })}
          >
            <LogOut /> {t("Log out other devices", "অন্য ডিভাইস থেকে লগআউট")}
          </Button>
        </CardHeader>
        <CardContent>
          {sessions.isLoading ? (
            <Spinner />
          ) : (
            <ul className="divide-y">
              {sessions.data?.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <Laptop className="size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {describeAgent(s.userAgent, t("Unknown device", "অজানা ডিভাইস"))} {s.current && <Badge variant="success">{t("This device", "এই ডিভাইস")}</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Signed in", "লগইন")} {fmtRelative(s.createdAt)}
                      {s.ip ? ` · ${s.ip}` : ""}
                    </p>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" onClick={() => revoke.mutate(s.id)}>
                      {t("Revoke", "বাতিল করুন")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {user.role !== "ADMIN" && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">{t("Delete account", "অ্যাকাউন্ট মুছে ফেলুন")}</CardTitle>
            <CardDescription>{t("Permanently delete your account, prescriptions, medicines and history. This cannot be undone.", "আপনার অ্যাকাউন্ট, প্রেসক্রিপশন, ওষুধ ও ইতিহাস স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো যাবে না।")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 /> {t("Delete my account", "আমার অ্যাকাউন্ট মুছুন")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("Delete your account?", "অ্যাকাউন্ট মুছে ফেলবেন?")}</DialogTitle>
                  <DialogDescription>{t("Enter your password to confirm. All your data will be erased.", "নিশ্চিত করতে পাসওয়ার্ড দিন। আপনার সব তথ্য মুছে যাবে।")}</DialogDescription>
                </DialogHeader>
                <PasswordInput value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder={t("Password", "পাসওয়ার্ড")} aria-label={t("Password", "পাসওয়ার্ড")} />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    disabled={!deletePassword || del.isPending}
                    onClick={() =>
                      del.mutate(deletePassword, {
                        onSuccess: () => {
                          toast.success(t("Your account has been deleted", "আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে"));
                          router.replace("/");
                        },
                        onError: (e) => toast.error(errorMessage(e)),
                      })
                    }
                  >
                    {del.isPending && <Loader2 className="animate-spin" />} {t("Delete permanently", "স্থায়ীভাবে মুছুন")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
