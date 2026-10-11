"use client";

import { useEffect } from "react";
import { detectAi } from "@/lib/ai/engine";
import { useDoseStore } from "@/lib/store";

const FLUSH_EVERY_S = 5;

/** App-wide client side effects: session, AI detection, screen-time tracking, offline support. */
export function ClientBoot() {
  const ensureSession = useDoseStore((s) => s.ensureSession);
  const addScreenSeconds = useDoseStore((s) => s.addScreenSeconds);

  useEffect(() => {
    // Phase 1 "profile": a random anonymous session created on first visit.
    ensureSession();
    void detectAi();
  }, [ensureSession]);

  // Count every second this app is actually on screen. The goal is to keep it tiny.
  useEffect(() => {
    let pending = 0;
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      pending += 1;
      if (pending >= FLUSH_EVERY_S) {
        addScreenSeconds(pending);
        pending = 0;
      }
    }, 1000);
    const flush = () => {
      if (pending > 0) addScreenSeconds(pending);
      pending = 0;
    };
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, [addScreenSeconds]);

  // Offline app shell for use on the trail (production only, so dev HMR isn't cached).
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
