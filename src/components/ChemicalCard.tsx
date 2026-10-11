import Link from "next/link";
import { Shuffle } from "lucide-react";
import type { Chemical } from "@/data/chemicals";
import { cn } from "@/lib/utils";

const cardBase =
  "group flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function ChemicalCard({ chemical }: { chemical: Chemical }) {
  return (
    <Link
      href={`/challenges?chem=${chemical.id}`}
      className={cn(cardBase, chemical.styles.softBg, chemical.styles.border)}
    >
      <span className="text-3xl" aria-hidden>
        {chemical.emoji}
      </span>
      <span className={cn("text-lg font-semibold", chemical.styles.text)}>{chemical.name}</span>
      <span className="text-xs font-medium text-muted-foreground">{chemical.nickname}</span>
      <span className="mt-1 text-sm text-foreground/80">{chemical.tagline}</span>
    </Link>
  );
}

export function RandomCard() {
  return (
    <Link
      href="/challenges?chem=random"
      className={cn(cardBase, "flex-row items-center gap-3 bg-muted/50")}
    >
      <Shuffle className="size-6 text-muted-foreground" aria-hidden />
      <span className="flex flex-col">
        <span className="text-lg font-semibold">Surprise me</span>
        <span className="text-sm text-muted-foreground">A random challenge from any chemical.</span>
      </span>
    </Link>
  );
}
