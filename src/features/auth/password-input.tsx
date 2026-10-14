"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/use-t";

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const { t } = useT();
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className="pr-11" {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1 right-1"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("Hide password", "পাসওয়ার্ড লুকান") : t("Show password", "পাসওয়ার্ড দেখান")}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
});
