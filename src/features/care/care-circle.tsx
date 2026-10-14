"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, HeartHandshake, Loader2, Mail, UserMinus, UserPlus, X } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { fmtRelative, initials } from "@/lib/format";
import { useCaregivers, useCareInvites, useInviteCaregiver, useRespondInvite, useRevokeCaregiver } from "./api";
import { useT } from "@/hooks/use-t";

const inviteSchema = (msg: string) =>
  z.object({
    email: z.string().trim().email(msg),
    relation: z.string().trim().max(40).optional(),
  });

/** Patient side: invite family members and manage who can see the schedule. */
export function PatientCareCircle() {
  const caregivers = useCaregivers();
  const invite = useInviteCaregiver();
  const revoke = useRevokeCaregiver();
  const { t } = useT();
  const schema = useMemo(() => inviteSchema(t("Enter a valid email", "সঠিক ইমেইল দিন")), [t]);
  const form = useForm<{ email: string; relation?: string }>({ resolver: zodResolver(schema), defaultValues: { email: "", relation: "" } });

  const onSubmit = form.handleSubmit((values) =>
    invite.mutate(
      { email: values.email, relation: values.relation || undefined },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          form.reset();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" /> {t("Invite a caregiver", "কেয়ারগিভার আমন্ত্রণ করুন")}
          </CardTitle>
          <CardDescription>{t("Your son, daughter or nurse will see whether you took your medicines and get an alert if a dose is missed.", "আপনার ছেলে, মেয়ে বা নার্স দেখতে পাবেন আপনি ওষুধ খেয়েছেন কিনা, আর ওষুধ বাদ পড়লে সতর্কবার্তা পাবেন।")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField id="cg-email" label={t("Their email", "তাদের ইমেইল")} error={form.formState.errors.email?.message}>
              <Input id="cg-email" type="email" placeholder="son@example.com" {...form.register("email")} />
            </FormField>
            <FormField id="cg-relation" label={t("Relation (optional)", "সম্পর্ক (ঐচ্ছিক)")}>
              <Input id="cg-relation" placeholder={t("Son, Daughter, Nurse…", "ছেলে, মেয়ে, নার্স…")} {...form.register("relation")} />
            </FormField>
            <Button type="submit" className="w-full" disabled={invite.isPending}>
              {invite.isPending ? <Loader2 className="animate-spin" /> : <Mail />} {t("Send invitation", "আমন্ত্রণ পাঠান")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("Your care circle", "আপনার কেয়ার সার্কেল")}</h2>
        {caregivers.isLoading ? (
          <ListSkeleton rows={2} />
        ) : caregivers.error ? (
          <ErrorState error={caregivers.error} onRetry={caregivers.refetch} />
        ) : !caregivers.data?.length ? (
          <EmptyState icon={<HeartHandshake />} title={t("No caregivers yet", "এখনো কোনো কেয়ারগিভার নেই")} description={t("Invite a family member so they can look after you from anywhere.", "পরিবারের কাউকে আমন্ত্রণ জানান, যাতে তারা যেকোনো জায়গা থেকে আপনার খেয়াল রাখতে পারেন।")} />
        ) : (
          <ul className="space-y-3">
            {caregivers.data.map((link) => (
              <li key={link.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <Avatar className="size-11">
                  {link.caregiver?.avatarUrl && <AvatarImage src={link.caregiver.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-primary/15 text-primary">{initials(link.caregiver?.name ?? link.inviteEmail)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{link.caregiver?.name ?? link.inviteEmail}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[link.relation, link.caregiver ? link.inviteEmail : `${t("invited", "আমন্ত্রিত")} ${fmtRelative(link.createdAt)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Badge variant={link.status === "ACCEPTED" ? "success" : "warning"}>{link.status === "ACCEPTED" ? t("Active", "সক্রিয়") : t("Pending", "অপেক্ষমাণ")}</Badge>
                <ConfirmDialog
                  title={t("Remove this caregiver?", "এই কেয়ারগিভারকে সরাবেন?")}
                  description={t("They will no longer see your medicines or receive alerts.", "তারা আর আপনার ওষুধ দেখতে বা সতর্কবার্তা পাবেন না।")}
                  confirmLabel={t("Remove", "সরান")}
                  onConfirm={() => revoke.mutate(link.id, { onSuccess: () => toast.success(t("Caregiver removed", "কেয়ারগিভার সরানো হয়েছে")), onError: (e) => toast.error(errorMessage(e)) })}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("Remove caregiver", "কেয়ারগিভার সরান")} className="text-destructive">
                      <UserMinus />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Caregiver side: accept or decline invitations sent to their email. */
export function CaregiverInvites() {
  const invites = useCareInvites();
  const { t } = useT();
  const respond = useRespondInvite();

  if (invites.isLoading) return <ListSkeleton rows={2} />;
  if (invites.error) return <ErrorState error={invites.error} onRetry={invites.refetch} />;
  if (!invites.data?.length)
    return <EmptyState icon={<Mail />} title={t("No pending invitations", "কোনো আমন্ত্রণ নেই")} description={t("When a patient invites your email address, the invitation will appear here.", "কোনো রোগী আপনার ইমেইলে আমন্ত্রণ পাঠালে এখানে দেখা যাবে।")} />;

  return (
    <ul className="space-y-3">
      {invites.data.map((inv) => (
        <li key={inv.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <Avatar className="size-11">
            <AvatarFallback className="bg-primary/15 text-primary">{initials(inv.patient?.name ?? "?")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{inv.patient?.name}</p>
            <p className="text-sm text-muted-foreground">
              {t(`wants you as their ${inv.relation?.toLowerCase() ?? "caregiver"}`, `আপনাকে ${inv.relation ?? "কেয়ারগিভার"} হিসেবে চান`)} · {fmtRelative(inv.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={respond.isPending}
              onClick={() => respond.mutate({ id: inv.id, accept: true }, { onSuccess: () => toast.success(t("Invitation accepted", "আমন্ত্রণ গ্রহণ করেছেন")), onError: (e) => toast.error(errorMessage(e)) })}
            >
              <Check /> {t("Accept", "গ্রহণ করুন")}
            </Button>
            <Button
              variant="outline"
              disabled={respond.isPending}
              onClick={() => respond.mutate({ id: inv.id, accept: false }, { onSuccess: () => toast(t("Invitation declined", "আমন্ত্রণ প্রত্যাখ্যান করেছেন")), onError: (e) => toast.error(errorMessage(e)) })}
            >
              <X /> {t("Decline", "প্রত্যাখ্যান")}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
