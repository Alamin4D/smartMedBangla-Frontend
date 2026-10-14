"use client";

import { Camera, Loader2, Save } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TagInput } from "@/components/shared/tag-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorMessage } from "@/lib/api";
import { initials, toInputDate } from "@/lib/format";
import { compressImage } from "@/lib/image";
import type { User } from "@/types";
import { useUpdateProfile, useUploadAvatar } from "./api";
import { useT } from "@/hooks/use-t";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const avatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useT();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    dateOfBirth: toInputDate(user.dateOfBirth),
    gender: user.gender ?? "",
    bloodGroup: user.bloodGroup ?? "",
    allergies: user.allergies,
    chronicConditions: user.chronicConditions,
    emergencyContact: user.emergencyContact ?? "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isPatient = user.role === "PATIENT";

  const save = () =>
    update.mutate(
      {
        name: form.name,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: (form.gender || null) as User["gender"],
        bloodGroup: form.bloodGroup || null,
        allergies: form.allergies,
        chronicConditions: form.chronicConditions,
        emergencyContact: form.emergencyContact || null,
      },
      { onSuccess: () => toast.success(t("Profile saved", "প্রোফাইল সংরক্ষণ হয়েছে")), onError: (e) => toast.error(errorMessage(e)) },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Profile", "প্রোফাইল")}</CardTitle>
        <CardDescription>{isPatient ? t("Your medical profile is shown to doctors through your share link and used by the AI for safety checks.", "আপনার মেডিকেল প্রোফাইল শেয়ার লিংকের মাধ্যমে ডাক্তার দেখতে পান এবং এআই নিরাপত্তা যাচাইয়ে ব্যবহার করে।") : t("Your account details.", "আপনার অ্যাকাউন্টের তথ্য।")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary/15 text-2xl text-primary">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={avatar.isPending}>
            {avatar.isPending ? <Loader2 className="animate-spin" /> : <Camera />} {t("Change photo", "ছবি পরিবর্তন")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f)
                avatar.mutate(await compressImage(f, 600), {
                  onSuccess: () => toast.success(t("Photo updated", "ছবি পরিবর্তন হয়েছে")),
                  onError: (err) => toast.error(errorMessage(err)),
                });
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">{t("Full name", "পুরো নাম")}</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-phone">{t("Phone", "ফোন")}</Label>
            <Input id="p-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          {isPatient && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="p-dob">{t("Date of birth", "জন্ম তারিখ")}</Label>
                <Input id="p-dob" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-gender">{t("Gender", "লিঙ্গ")}</Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger id="p-gender" className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("Male", "পুরুষ")}</SelectItem>
                      <SelectItem value="female">{t("Female", "নারী")}</SelectItem>
                      <SelectItem value="other">{t("Other", "অন্যান্য")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-blood">{t("Blood group", "রক্তের গ্রুপ")}</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
                    <SelectTrigger id="p-blood" className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-allergies">{t("Allergies", "অ্যালার্জি")}</Label>
                <TagInput id="p-allergies" value={form.allergies} onChange={(v) => set("allergies", v)} placeholder={t("e.g. Penicillin — press Enter", "যেমন: পেনিসিলিন — লিখে Enter চাপুন")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-conditions">{t("Long-term conditions", "দীর্ঘমেয়াদি রোগ")}</Label>
                <TagInput id="p-conditions" value={form.chronicConditions} onChange={(v) => set("chronicConditions", v)} placeholder={t("e.g. Diabetes — press Enter", "যেমন: ডায়াবেটিস — লিখে Enter চাপুন")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-emergency">{t("Emergency contact", "জরুরি যোগাযোগ")}</Label>
                <Input id="p-emergency" value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} placeholder={t("Name and phone number", "নাম ও ফোন নম্বর")} />
              </div>
            </>
          )}
        </div>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="animate-spin" /> : <Save />} {t("Save profile", "প্রোফাইল সংরক্ষণ")}
        </Button>
      </CardContent>
    </Card>
  );
}
