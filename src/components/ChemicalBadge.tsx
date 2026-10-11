import { CHEMICALS, type ChemicalId } from "@/data/chemicals";
import { cn } from "@/lib/utils";

export function ChemicalBadge({ chemical, className }: { chemical: ChemicalId; className?: string }) {
  const c = CHEMICALS[chemical];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.styles.softBg,
        c.styles.border,
        c.styles.text,
        className,
      )}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.name}
    </span>
  );
}
