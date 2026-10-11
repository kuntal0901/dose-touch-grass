"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BellRing, Leaf } from "lucide-react";
import { ChemicalBadge } from "@/components/ChemicalBadge";
import { CountdownRing } from "@/components/CountdownRing";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CHEMICALS } from "@/data/chemicals";
import { cancelChime, playChime, vibrate } from "@/lib/chime";
import { formatClock, useHydrated, useNow } from "@/lib/hooks";
import { useDoseStore, type ActiveChallenge, type EntryStatus } from "@/lib/store";

export default function TimerPage() {
  const hydrated = useHydrated();
  const active = useDoseStore((s) => s.active);
  // Keeps the timer on screen while the store clears `active` and we navigate to /complete.
  const [finishing, setFinishing] = useState<ActiveChallenge | null>(null);
  const shown = active ?? finishing;

  if (!hydrated) return <div className="mx-auto mt-10 size-64 animate-pulse rounded-full bg-muted" />;
  if (!shown) return <NothingRunning />;
  return <TimerView key={shown.startedAt} snapshot={shown} onFinishing={setFinishing} />;
}

function TimerView({
  snapshot,
  onFinishing,
}: {
  snapshot: ActiveChallenge;
  onFinishing: (snapshot: ActiveChallenge) => void;
}) {
  const router = useRouter();
  const now = useNow();
  const stillActive = useDoseStore((s) => s.active?.startedAt === snapshot.startedAt);
  const finishChallenge = useDoseStore((s) => s.finishChallenge);

  const { challenge } = snapshot;
  const chem = CHEMICALS[challenge.chemical];
  const total = snapshot.endsAt - snapshot.startedAt;
  const remaining = Math.max(0, snapshot.endsAt - now);

  const finish = (status: EntryStatus) => {
    if (status !== "completed") cancelChime();
    onFinishing(snapshot);
    finishChallenge(status);
    router.replace("/complete");
  };

  // Time's up → chime, vibrate, celebrate.
  useEffect(() => {
    if (!stillActive || now < snapshot.endsAt) return;
    playChime(snapshot.endsAt);
    vibrate();
    onFinishing(snapshot);
    finishChallenge("completed");
    router.replace("/complete");
  }, [now, stillActive, snapshot, onFinishing, finishChallenge, router]);

  // Show the countdown in the tab title.
  useEffect(() => {
    const previous = document.title;
    document.title = `${formatClock(remaining)} · ${challenge.title}`;
    return () => {
      document.title = previous;
    };
  }, [remaining, challenge.title]);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 text-center">
      <ChemicalBadge chemical={challenge.chemical} />
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{challenge.title}</h1>

      <CountdownRing progress={1 - remaining / total} strokeClass={chem.styles.stroke}>
        <span className="text-5xl font-semibold tabular-nums">{formatClock(remaining)}</span>
        <span className="mt-1 text-sm text-muted-foreground">
          of {snapshot.minutes} {snapshot.debug ? "sec" : "min"}
        </span>
      </CountdownRing>

      <div className="space-y-1">
        <p className="flex items-center justify-center gap-2 text-lg font-medium">
          <Leaf className="size-5 text-teal-500" aria-hidden /> Put your screen down
        </p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll chime when time&apos;s up. Go enjoy your challenge!
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-left text-xs text-muted-foreground">
        <BellRing className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Keep this tab open and your volume up to hear the chime. If your phone locks, the
          browser may pause it. Just come back and we&apos;ll pick up where you left off.
        </span>
      </div>

      <div className="mt-auto grid w-full grid-cols-2 gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="ghost" className="h-11" />}>Give up</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stop this challenge?</DialogTitle>
              <DialogDescription>
                No worries. Showing up counts, and we&apos;ll log it as attempted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Keep going</DialogClose>
              <Button variant="destructive" onClick={() => finish("attempted")}>
                Stop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" className="h-11" onClick={() => finish("partial")}>
          I&apos;m done early
        </Button>
      </div>
    </div>
  );
}

function NothingRunning() {
  return (
    <div className="mt-10 space-y-4 text-center">
      <p className="text-lg font-medium">No challenge running right now.</p>
      <Link href="/" className={buttonVariants({ className: "h-11 px-5" })}>
        Find a challenge
      </Link>
    </div>
  );
}
