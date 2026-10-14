"use client";

import { Loader2, Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import type { Role } from "@/types";
import { useBroadcast } from "./api";
import { useT } from "@/hooks/use-t";

export function BroadcastCard() {
  const broadcast = useBroadcast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const { t } = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-5 text-primary" /> {t("Send announcement", "ঘোষণা পাঠান")}
        </CardTitle>
        <CardDescription>{t("Appears in every selected user's notification centre.", "নির্বাচিত সব ইউজারের নোটিফিকেশনে দেখাবে।")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="bc-title">{t("Title", "শিরোনাম")}</Label>
          <Input id="bc-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bc-msg">{t("Message", "বার্তা")}</Label>
          <Textarea id="bc-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
        </div>
        <div className="flex gap-2">
          <Select value={role} onValueChange={(v) => setRole(v as Role | "ALL")}>
            <SelectTrigger className="w-44" aria-label={t("Audience", "কাদের জন্য")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("All users", "সব ইউজার")}</SelectItem>
              <SelectItem value="PATIENT">{t("Patients", "রোগী")}</SelectItem>
              <SelectItem value="CAREGIVER">{t("Caregivers", "কেয়ারগিভার")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="flex-1"
            disabled={title.trim().length < 3 || message.trim().length < 3 || broadcast.isPending}
            onClick={() =>
              broadcast.mutate(
                { title: title.trim(), message: message.trim(), role: role === "ALL" ? undefined : role },
                {
                  onSuccess: (r) => {
                    toast.success((r as { message: string }).message);
                    setTitle("");
                    setMessage("");
                  },
                  onError: (e) => toast.error(errorMessage(e)),
                },
              )
            }
          >
            {broadcast.isPending && <Loader2 className="animate-spin" />} {t("Send", "পাঠান")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
