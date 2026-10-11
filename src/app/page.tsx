"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import { AiStatusCard } from "@/components/AiStatusCard";
import { ChemicalCard, RandomCard } from "@/components/ChemicalCard";
import { buttonVariants } from "@/components/ui/button";
import { CHEMICAL_IDS, CHEMICALS } from "@/data/chemicals";
import { useHydrated } from "@/lib/hooks";
import { useDoseStore } from "@/lib/store";

export default function HomePage() {
  const hydrated = useHydrated();
  const nickname = useDoseStore((s) => s.session?.nickname);
  const active = useDoseStore((s) => s.active);
  const activeChallenge = active?.challenge;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="h-5 text-sm text-muted-foreground">
          {hydrated && nickname ? `Hi, ${nickname} 👋` : ""}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Touch grass. <br />
          Earn your <span className="text-amber-500">D</span>
          <span className="text-rose-500">O</span>
          <span className="text-teal-500">S</span>
          <span className="text-violet-500">E</span>.
        </h1>
        <p className="text-muted-foreground">
          Pick the feel-good chemical you want to boost. Your private AI coach invents a 15–45
          minute outdoor challenge for where you are right now. Start the timer, put the phone
          away and go outside.
        </p>
      </section>

      {hydrated && activeChallenge && (
        <Link
          href="/timer"
          className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <Timer className="size-5 shrink-0" aria-hidden />
          <span className="flex-1 text-sm">
            <span className="font-medium">{activeChallenge.title}</span> is in progress.
          </span>
          <span className={buttonVariants({ size: "sm" })}>Resume</span>
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">What do you need today?</h2>
        <div className="grid grid-cols-2 gap-3">
          {CHEMICAL_IDS.map((id) => (
            <ChemicalCard key={id} chemical={CHEMICALS[id]} />
          ))}
        </div>
        <RandomCard />
      </section>

      {hydrated && <AiStatusCard />}
    </div>
  );
}
