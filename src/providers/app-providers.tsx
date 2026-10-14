"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMe } from "@/features/auth/api";
import { ApiError } from "@/lib/api";
import { setLang, storedLang } from "@/lib/i18n";

/** Applies the user's accessibility preferences (large text, UI language) to <html>. */
function PreferenceSync() {
  const { data: user } = useMe();

  // Language: an explicit choice on this device wins, then the account preference, then Bangla.
  useEffect(() => {
    setLang(storedLang() ?? user?.language ?? "bn");
  }, [user?.language]);

  useEffect(() => {
    const root = document.documentElement;
    let large = user?.largeFont;
    if (large === undefined) {
      try {
        large = localStorage.getItem("sm-large-text") === "1";
      } catch {
        large = false;
      }
    }
    root.classList.toggle("large-text", Boolean(large));
  }, [user?.largeFont]);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={200}>
          <PreferenceSync />
          {children}
          <Toaster richColors closeButton position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
