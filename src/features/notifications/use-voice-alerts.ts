"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getLang } from "@/lib/i18n";
import { speak } from "@/lib/voice";
import type { AppNotification, User } from "@/types";

const STORAGE_KEY = "sm-spoken-ids";

function loadSpoken(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveSpoken(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].slice(-200)));
  } catch {
    /* private mode – fine */
  }
}

/**
 * While the dashboard is open, polls for fresh reminder notifications and
 * speaks them aloud in Bangla, shows a toast with a one-tap "Taken" button,
 * and raises a system notification when the tab is in the background.
 */
export function useVoiceAlerts(user: User | null | undefined) {
  const qc = useQueryClient();
  const spoken = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || user.role !== "PATIENT") return;
    spoken.current = loadSpoken();
    let cancelled = false;

    const tick = async () => {
      try {
        const { data } = await api.get<AppNotification[]>("/notifications/speakable", { minutes: 15 });
        for (const n of data) {
          if (cancelled || spoken.current.has(n.id)) continue;
          spoken.current.add(n.id);
          saveSpoken(spoken.current);

          if (user.voiceEnabled && n.speakText) void speak(n.speakText);

          const doseId = n.data?.doseId;
          toast(n.title, {
            description: n.message,
            duration: 60_000,
            action: doseId
              ? {
                  label: getLang() === "en" ? "✔ Taken" : "✔ খেয়েছি",
                  onClick: () =>
                    api
                      .patch(`/doses/${doseId}`, { status: "TAKEN" })
                      .then(() => {
                        toast.success(getLang() === "en" ? "Great! Dose marked as taken." : "দারুণ! ওষুধ খাওয়া হিসেবে চিহ্নিত হয়েছে।");
                        qc.invalidateQueries({ queryKey: ["doses"] });
                        qc.invalidateQueries({ queryKey: ["dashboard"] });
                      })
                      .catch(() => toast.error(getLang() === "en" ? "Could not update the dose" : "আপডেট করা যায়নি")),
                }
              : undefined,
          });

          if (document.hidden && "Notification" in window && Notification.permission === "granted") {
            new Notification(n.title, { body: n.message, tag: n.id, icon: "/icon.svg" });
          }
        }
        if (data.length) {
          qc.invalidateQueries({ queryKey: ["notifications"] });
          qc.invalidateQueries({ queryKey: ["doses"] });
        }
      } catch {
        /* offline or logged out – try again next tick */
      }
    };

    void tick();
    const id = window.setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, qc]);
}
