"use client";

import { BellRing, Loader2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/hooks/use-t";
import { errorMessage } from "@/lib/api";
import { setLang } from "@/lib/i18n";
import { disablePush, enablePush, getPushSubscription, isPushSupported } from "@/lib/push";
import { hasBanglaVoice, isSpeechSupported, speak } from "@/lib/voice";
import type { User } from "@/types";
import { useUpdatePreferences } from "./api";

const TIMEZONES = ["Asia/Dhaka", "Asia/Kolkata", "Asia/Dubai", "Asia/Riyadh", "Asia/Kuala_Lumpur", "Asia/Singapore", "Europe/London", "America/New_York", "Australia/Sydney"];

export function PreferencesForm({ user }: { user: User }) {
  const { t, lang } = useT();
  const update = useUpdatePreferences();
  const [honorific, setHonorific] = useState(user.honorific ?? "");
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [banglaVoice, setBanglaVoice] = useState<boolean | null>(null);

  useEffect(() => {
    void getPushSubscription().then((s) => setPushOn(Boolean(s) || (typeof Notification !== "undefined" && Notification.permission === "granted")));
    void hasBanglaVoice().then(setBanglaVoice);
  }, []);

  const save = (patch: Parameters<typeof update.mutate>[0], message = t("Preference saved", "পছন্দ সংরক্ষণ হয়েছে")) =>
    update.mutate(patch, {
      onSuccess: () => {
        toast.success(message);
        try {
          if (patch.largeFont !== undefined) localStorage.setItem("sm-large-text", patch.largeFont ? "1" : "0");
        } catch {
          /* ignore */
        }
      },
      onError: (e) => toast.error(errorMessage(e)),
    });

  const togglePush = async (on: boolean) => {
    setPushBusy(true);
    try {
      if (on) {
        const result = await enablePush();
        toast.success(
          result.push
            ? t("Browser notifications enabled", "ব্রাউজার নোটিফিকেশন চালু হয়েছে")
            : t("Notifications allowed while SmartMed is open", "স্মার্টমেড খোলা থাকলে নোটিফিকেশন দেখাবে"),
        );
      } else {
        await disablePush();
        toast(t("Browser notifications turned off", "ব্রাউজার নোটিফিকেশন বন্ধ করা হয়েছে"));
      }
      setPushOn(on);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPushBusy(false);
    }
  };

  const who = honorific || user.name.split(" ")[0];
  const sample = lang === "bn" ? `${who}, এখন আপনার ভরা পেটে ওষুধ খাওয়ার সময় হয়েছে।` : `${who}, it is time to take your medicine after your meal.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Accessibility, language & voice", "সহজ ব্যবহার, ভাষা ও ভয়েস")}</CardTitle>
        <CardDescription>{t("Make SmartMed easier to read and hear.", "স্মার্টমেড পড়া ও শোনা আরও সহজ করুন।")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="pref-large" className="text-base">{t("Large text", "বড় লেখা")}</Label>
            <p className="text-sm text-muted-foreground">{t("Bigger letters everywhere — easier for older eyes.", "সব জায়গায় বড় অক্ষর — বয়স্কদের জন্য পড়া সহজ।")}</p>
          </div>
          <Switch id="pref-large" checked={user.largeFont} onCheckedChange={(v) => save({ largeFont: v })} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="pref-voice" className="text-base">{t("Voice reminders", "ভয়েস রিমাইন্ডার")}</Label>
            <p className="text-sm text-muted-foreground">{t("Speak reminders aloud when it is time for a dose.", "ওষুধের সময় হলে রিমাইন্ডার জোরে পড়ে শোনাবে।")}</p>
          </div>
          <Switch id="pref-voice" checked={user.voiceEnabled} onCheckedChange={(v) => save({ voiceEnabled: v })} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="pref-push" className="text-base">{t("Browser notifications", "ব্রাউজার নোটিফিকেশন")}</Label>
            <p className="text-sm text-muted-foreground">{t("Show reminders even when SmartMed is in another tab.", "স্মার্টমেড অন্য ট্যাবে থাকলেও রিমাইন্ডার দেখাবে।")}</p>
          </div>
          <Switch id="pref-push" checked={pushOn} disabled={pushBusy || !isPushSupported()} onCheckedChange={togglePush} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pref-lang">{t("Language (website, reminders & AI)", "ভাষা (ওয়েবসাইট, রিমাইন্ডার ও এআই)")}</Label>
            <Select
              value={lang}
              onValueChange={(v) => {
                setLang(v as User["language"]);
                save({ language: v as User["language"] });
              }}
            >
              <SelectTrigger id="pref-lang" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-tz">{t("Timezone", "টাইমজোন")}</Label>
            <Select value={user.timezone} onValueChange={(v) => save({ timezone: v }, t("Timezone updated — reminders follow the new time", "টাইমজোন পরিবর্তন হয়েছে — রিমাইন্ডার নতুন সময় অনুযায়ী আসবে"))}>
              <SelectTrigger id="pref-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([user.timezone, ...TIMEZONES])].map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pref-honorific">{t("How should the voice address you?", "ভয়েস আপনাকে কী বলে ডাকবে?")}</Label>
            <div className="flex gap-2">
              <Input id="pref-honorific" value={honorific} onChange={(e) => setHonorific(e.target.value)} placeholder="দাদু, নানু, আম্মা, Abba…" />
              <Button variant="outline" disabled={update.isPending} onClick={() => save({ honorific: honorific.trim() || null })}>
                {update.isPending && <Loader2 className="animate-spin" />} {t("Save", "সংরক্ষণ")}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-muted/60 p-4">
          <p className="text-sm">
            <BellRing className="mr-1 inline size-4" /> {t("Sample", "নমুনা")}: “{sample}”
          </p>
          <Button variant="secondary" onClick={() => speak(sample)} disabled={!isSpeechSupported()}>
            <Volume2 /> {t("Test voice", "ভয়েস শুনুন")}
          </Button>
          {lang === "bn" && banglaVoice === false && (
            <Alert>
              <AlertDescription>
                {t(
                  "This browser has no Bangla voice installed. Chrome on Android usually has one; on Windows add “Bangla” in Settings → Time & language → Speech.",
                  "এই ব্রাউজারে বাংলা ভয়েস নেই। অ্যান্ড্রয়েডের ক্রোমে সাধারণত থাকে; উইন্ডোজে Settings → Time & language → Speech থেকে “Bangla” যোগ করুন।",
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
