"use client";

import { Cpu, Download, ShieldCheck, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadModel, MODEL_LABEL, MODEL_SIZE_LABEL, useAi } from "@/lib/ai/engine";

/** Explains the on-device model and lets the user download / load it. */
export function AiStatusCard({ compact = false }: { compact?: boolean }) {
  const { status, progress, progressText, cached, error } = useAi();

  if (status === "checking") {
    return <div className="h-20 animate-pulse rounded-2xl bg-muted" />;
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">On-device coach unavailable here</p>
        <p className="mt-1">
          This browser doesn&apos;t support WebGPU (try desktop Chrome or Edge over HTTPS). The
          curated challenge library works everywhere.
        </p>
      </div>
    );
  }

  if (status === "ready") {
    return compact ? null : (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
        <Cpu className="size-5 shrink-0 text-emerald-600" aria-hidden />
        <span>
          <span className="font-medium">{MODEL_LABEL} is running on your device.</span> Your
          answers and journal never leave this browser.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 font-medium">
        <Cpu className="size-5" aria-hidden /> Your private AI coach
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {MODEL_LABEL}, an open-weight model, runs entirely in your browser. No account, no
          server.
        </li>
        <li className="flex gap-2">
          <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          One-time download ({MODEL_SIZE_LABEL}), then it works offline.
        </li>
      </ul>

      {status === "loading" ? (
        <div className="space-y-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="truncate text-xs text-muted-foreground">{progressText}</p>
        </div>
      ) : (
        <>
          {status === "error" && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <Button className="h-11 w-full" onClick={() => void loadModel().catch(() => {})}>
            <Download /> {cached ? "Start coach" : `Download coach (${MODEL_SIZE_LABEL})`}
          </Button>
        </>
      )}
    </div>
  );
}
