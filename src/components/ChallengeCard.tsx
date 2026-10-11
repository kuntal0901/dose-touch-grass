import { Clock, Sparkles } from "lucide-react";
import type { Challenge } from "@/data/challenges";
import { CHEMICALS } from "@/data/chemicals";
import { cn } from "@/lib/utils";
import { ChemicalBadge } from "./ChemicalBadge";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const chem = CHEMICALS[challenge.chemical];
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        chem.styles.border,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-1.5">
          <ChemicalBadge chemical={challenge.chemical} />
          {challenge.source === "ai" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <Sparkles className="size-3" aria-hidden /> Made on-device by Gemma
            </span>
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />~{challenge.defaultMinutes} min
        </span>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{challenge.title}</h2>
        <p className="text-muted-foreground">{challenge.description}</p>
      </div>
      <ol className="space-y-2 text-sm">
        {challenge.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                chem.styles.solidBg,
              )}
            >
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
