"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, BookOpen, Check, RotateCcw, Sparkles, X } from "lucide-react";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CoachPanel } from "@/components/CoachPanel";
import { DurationPicker } from "@/components/DurationPicker";
import { Button } from "@/components/ui/button";
import { challengesFor, CHALLENGES_BY_ID, type Challenge } from "@/data/challenges";
import { CHEMICALS, isChemicalId, type ChemicalId } from "@/data/chemicals";
import { useAi } from "@/lib/ai/engine";
import { scheduleChime, unlockAudio } from "@/lib/chime";
import { useHydrated } from "@/lib/hooks";
import { shuffle } from "@/lib/session";
import { useDoseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Mode = "coach" | "library";

export default function ChallengesPage() {
  return (
    <Suspense fallback={<DeckSkeleton />}>
      <ChallengesContent />
    </Suspense>
  );
}

function ChallengesContent() {
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const aiStatus = useAi((s) => s.status);
  const startChallenge = useDoseStore((s) => s.startChallenge);
  const [chosenMode, setChosenMode] = useState<Mode | null>(null);

  const raw = params.get("chem");
  const chem: ChemicalId | "random" = isChemicalId(raw) ? raw : "random";
  // Dev-only shortcut for testing the timer: minutes become seconds.
  const debug = process.env.NODE_ENV !== "production" && params.get("debug") === "1";
  // Default to the AI coach wherever WebGPU works; the library is always there.
  const mode: Mode = chosenMode ?? (aiStatus === "unsupported" ? "library" : "coach");

  const heading =
    chem === "random" ? "Surprise me" : `${CHEMICALS[chem].emoji} ${CHEMICALS[chem].name}`;

  const start = (challenge: Challenge, minutes: number) => {
    unlockAudio();
    const active = startChallenge(challenge, minutes, debug);
    scheduleChime(active.endsAt);
    router.push("/timer");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Back to chemicals"
          className="-ml-2 rounded-md p-2 text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold">{heading}</h1>
        {debug && (
          <span className="ml-auto rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-900">
            debug: min → sec
          </span>
        )}
      </div>

      {hydrated && aiStatus !== "checking" ? (
        <>
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm">
            <ModeTab active={mode === "coach"} onClick={() => setChosenMode("coach")}>
              <Sparkles className="size-4" /> AI coach
            </ModeTab>
            <ModeTab active={mode === "library"} onClick={() => setChosenMode("library")}>
              <BookOpen className="size-4" /> Library
            </ModeTab>
          </div>
          {mode === "coach" ? (
            <CoachPanel key={chem} chem={chem} onStart={start} />
          ) : (
            // Deck shuffles with Math.random, so it only renders on the client.
            <Deck key={chem} chem={chem} onStart={start} />
          )}
        </>
      ) : (
        <DeckSkeleton />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex h-9 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
        active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Deck({
  chem,
  onStart,
}: {
  chem: ChemicalId | "random";
  onStart: (challenge: Challenge, minutes: number) => void;
}) {
  const pool = challengesFor(chem);
  const [order, setOrder] = useState(() => shuffle(pool.map((c) => c.id)));
  const [accepted, setAccepted] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(20);

  const seenIds = useDoseStore((s) => s.seenIds);
  const markSeen = useDoseStore((s) => s.markSeen);
  const clearSeen = useDoseStore((s) => s.clearSeen);

  const currentId = order.find((id) => !seenIds.includes(id));
  const current = currentId ? CHALLENGES_BY_ID[currentId] : undefined;
  const remaining = order.filter((id) => !seenIds.includes(id)).length;

  if (!current) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6 text-center">
        <p className="text-lg font-medium">You&apos;ve seen every challenge here.</p>
        <p className="text-sm text-muted-foreground">Reshuffle to see them again.</p>
        <Button
          className="h-11"
          onClick={() => {
            clearSeen(order);
            setOrder(shuffle(order));
          }}
        >
          <RotateCcw /> Reshuffle
        </Button>
      </div>
    );
  }

  if (accepted === current.id) {
    return (
      <div className="space-y-5">
        <ChallengeCard challenge={current} />
        <section className="space-y-5 rounded-2xl border bg-card p-5">
          <h2 className="text-center font-medium">How long will you be outside?</h2>
          <DurationPicker value={minutes} onChange={setMinutes} />
          <Button className="h-12 w-full text-base" onClick={() => onStart(current, minutes)}>
            Start the timer
          </Button>
          <Button variant="ghost" className="h-10 w-full" onClick={() => setAccepted(null)}>
            Back
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ChallengeCard key={current.id} challenge={current} />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 text-base" onClick={() => markSeen(current.id)}>
          <X /> Not this one
        </Button>
        <Button
          className="h-12 text-base"
          onClick={() => {
            setMinutes(current.defaultMinutes);
            setAccepted(current.id);
          }}
        >
          <Check /> Let&apos;s do it
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {remaining - 1 > 0 ? `${remaining - 1} more ideas in this deck` : "Last one in this deck"}
      </p>
    </div>
  );
}

function DeckSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
}
