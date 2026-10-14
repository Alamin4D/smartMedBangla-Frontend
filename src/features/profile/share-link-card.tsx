"use client";

import { Copy, ExternalLink, Link2, Link2Off, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorMessage } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import type { User } from "@/types";
import { useRevokeShareLink, useShareLink } from "./api";
import { useT } from "@/hooks/use-t";

export function ShareLinkCard({ user }: { user: User }) {
  const create = useShareLink();
  const revoke = useRevokeShareLink();
  const [days, setDays] = useState<"1" | "7" | "30" | "never">("7");
  const { t } = useT();
  const expired = user.shareExpiresAt && new Date(user.shareExpiresAt) < new Date();
  const url = user.shareToken && !expired && typeof window !== "undefined" ? `${window.location.origin}/share/${user.shareToken}` : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-5 text-primary" /> {t("Share with a doctor", "ডাক্তারকে দেখান")}
        </CardTitle>
        <CardDescription>{t("A read-only link to your prescriptions, current medicines, allergies and adherence. No login needed.", "আপনার প্রেসক্রিপশন, বর্তমান ওষুধ, অ্যালার্জি ও ওষুধ খাওয়ার রিপোর্টের একটি শুধু-দেখার লিংক। লগইন লাগবে না।")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {url ? (
          <>
            <div className="flex gap-2">
              <Input value={url} readOnly aria-label={t("Share link", "শেয়ার লিংক")} onFocus={(e) => e.target.select()} />
              <Button
                variant="outline"
                size="icon"
                aria-label={t("Copy link", "লিংক কপি করুন")}
                onClick={() => navigator.clipboard.writeText(url).then(() => toast.success(t("Link copied", "লিংক কপি হয়েছে")))}
              >
                <Copy />
              </Button>
              <Button variant="outline" size="icon" asChild aria-label={t("Open link", "লিংক খুলুন")}>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{user.shareExpiresAt ? `${t("Expires", "মেয়াদ শেষ")} ${fmtDateTime(user.shareExpiresAt)}` : t("Never expires", "মেয়াদ নেই")}</p>
            <Button
              variant="destructive"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(undefined, { onSuccess: () => toast.success(t("Link disabled", "লিংক বন্ধ করা হয়েছে")), onError: (e) => toast.error(errorMessage(e)) })}
            >
              <Link2Off /> {t("Disable link", "লিংক বন্ধ করুন")}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={days} onValueChange={(v) => setDays(v as typeof days)}>
              <SelectTrigger className="w-full sm:w-48" aria-label={t("Link validity", "লিংকের মেয়াদ")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("Valid for 1 day", "১ দিনের জন্য")}</SelectItem>
                <SelectItem value="7">{t("Valid for 7 days", "৭ দিনের জন্য")}</SelectItem>
                <SelectItem value="30">{t("Valid for 30 days", "৩০ দিনের জন্য")}</SelectItem>
                <SelectItem value="never">{t("No expiry", "মেয়াদ ছাড়া")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              disabled={create.isPending}
              onClick={() =>
                create.mutate(days === "never" ? null : (Number(days) as 1 | 7 | 30), {
                  onSuccess: () => toast.success(t("Share link created", "শেয়ার লিংক তৈরি হয়েছে")),
                  onError: (e) => toast.error(errorMessage(e)),
                })
              }
            >
              {create.isPending ? <Loader2 className="animate-spin" /> : <Link2 />} {t("Create link", "লিংক তৈরি করুন")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
