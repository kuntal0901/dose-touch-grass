import { cn } from "@/lib/utils";

const SIZE = 260;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CountdownRing({
  progress,
  strokeClass,
  children,
}: {
  /** 0 → just started, 1 → finished */
  progress: number;
  strokeClass: string;
  children: React.ReactNode;
}) {
  const offset = CIRCUMFERENCE * Math.min(1, Math.max(0, progress));
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-300 ease-linear", strokeClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
