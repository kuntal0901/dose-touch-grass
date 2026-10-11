"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Cpu, Loader2, Sparkles } from "lucide-react";
import { Questionnaire } from "@/components/Questionnaire";
import { Button, buttonVariants } from "@/components/ui/button";
import { CHEMICALS } from "@/data/chemicals";
import { streamReflection, useAi } from "@/lib/ai/engine";
import { formatSeconds, useHydrated } from "@/lib/hooks";
import { useDoseStore, type JournalEntry } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HEADLINES: Record<JournalEntry["status"], { title: string; subtitle: string }> = {
  completed: { title: "Time's up — you did it! 🎉", subtitle: "Challenge complete." },
  partial: { title: "Nice work! 🌱", subtitle: "Every screen-free minute counts." },
  attempted: { title: "You showed up. 💪", subtitle: "Trying is how habits start." },
};

export default function CompletePage() {
  const hydrated = useHydrated();
  const entry = useDoseStore((s) => s.entries.find((e) => e.id === s.lastEntryId));

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
  if (!entry) {
    return (
      <div className="mt-10 space-y-4 text-center">
        <p className="text-lg font-medium">Nothing to celebrate… yet!</p>
        <Link href="/" className={buttonVariants({ className: "h-11 px-5" })}>
          Find a challenge
        </Link>
      </div>
    );
  }
  return <Celebration key={entry.id} entry={entry} />;
}

function Celebration({ entry }: { entry: JournalEntry }) {
  const logEntry = useDoseStore((s) => s.logEntry);
  const chem = CHEMICALS[entry.chemical];
  const [funFact] = useState(
    () => chem.funFacts[Math.floor(Math.random() * chem.funFacts.length)],
  );
  const [mode, setMode] = useState<"ask" | "form" | "done">(entry.logged ? "done" : "ask");
  const headline = HEADLINES[entry.status];

  return (
    <div className="space-y-6">
      <section className="space-y-2 text-center animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="text-6xl" aria-hidden>
          {chem.emoji}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{headline.title}</h1>
        <p className="text-muted-foreground">
          {headline.subtitle} {entry.title} · {entry.minutes} min outside
        </p>
        <p className="text-sm text-muted-foreground">
          📱 Screen time during the challenge: {formatSeconds(entry.screenSeconds)}
        </p>
        <p className="text-lg">
          You {entry.status === "completed" ? "earned" : "boosted"} a dose of{" "}
          <span className={cn("font-semibold", chem.styles.text)}>{chem.name}</span>
        </p>
      </section>

      <section className={cn("space-y-2 rounded-2xl border p-5", chem.styles.softBg, chem.styles.border)}>
        <h2 className={cn("flex items-center gap-2 text-sm font-semibold", chem.styles.text)}>
          <Sparkles className="size-4" aria-hidden /> Fun fact
        </h2>
        <p className="text-sm leading-relaxed">{funFact}</p>
      </section>

      {mode === "ask" && (
        <section className="space-y-3 rounded-2xl border bg-card p-5 text-center">
          <p className="font-medium">Want to add this to your journal?</p>
          <p className="text-sm text-muted-foreground">
            A few quick questions help you notice what works for you. It&apos;s already counted
            in your progress either way.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button variant="outline" className="h-11" onClick={() => setMode("done")}>
              Skip
            </Button>
            <Button className="h-11" onClick={() => setMode("form")}>
              Write entry
            </Button>
          </div>
        </section>
      )}

      {mode === "form" && (
        <section className="rounded-2xl border bg-card p-5">
          <Questionnaire
            entry={entry}
            onCancel={() => setMode("ask")}
            onSubmit={(data) => {
              logEntry(entry.id, data);
              toast.success("Saved to your journal");
              setMode("done");
            }}
          />
        </section>
      )}

      {mode === "done" && <CoachReflection entry={entry} />}

      {mode === "done" && (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/journal" className={buttonVariants({ variant: "outline", className: "h-11" })}>
            <BookOpen /> Journal
          </Link>
          <Link href="/" className={buttonVariants({ className: "h-11" })}>
            Another challenge
          </Link>
        </div>
      )}
    </div>
  );
}

/** Optional on-device reflection from Gemma on how the challenge went. */
function CoachReflection({ entry }: { entry: JournalEntry }) {
  const aiStatus = useAi((s) => s.status);
  const setAiReflection = useDoseStore((s) => s.setAiReflection);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const text = entry.aiReflection ?? streaming;
  if (aiStatus !== "ready" && !text) return null;

  const run = async () => {
    setFailed(false);
    setStreaming("");
    try {
      const result = await streamReflection(entry, setStreaming);
      if (result) setAiReflection(entry.id, result);
    } catch {
      setFailed(true);
      setStreaming(null);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Cpu className="size-4" aria-hidden /> Your coach&apos;s take
      </h2>
      {text !== null && text !== undefined ? (
        <p className="text-sm leading-relaxed">
          {text || <Loader2 className="size-4 animate-spin" aria-label="Thinking" />}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Get a short reflection and an idea for next time, written privately on your device.
          </p>
          <Button variant="outline" className="h-10 w-full" onClick={run}>
            <Sparkles /> Reflect with Gemma
          </Button>
        </>
      )}
      {failed && <p className="text-xs text-destructive">Couldn&apos;t generate a reflection.</p>}
    </section>
  );
}
