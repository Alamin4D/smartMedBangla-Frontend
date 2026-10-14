"use client";

import { useEffect, useState } from "react";

/** Current timestamp that re-renders every `intervalMs` – keeps "due now" badges fresh without impure renders. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
