"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MAX_MINUTES, MIN_MINUTES, MINUTE_STEP } from "@/data/challenges";

export function DurationPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (minutes: number) => void;
}) {
  const clamp = (n: number) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, n));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Decrease duration"
          onClick={() => onChange(clamp(value - MINUTE_STEP))}
          disabled={value <= MIN_MINUTES}
        >
          <Minus />
        </Button>
        <div className="text-center">
          <div className="text-4xl font-semibold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">minutes</div>
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Increase duration"
          onClick={() => onChange(clamp(value + MINUTE_STEP))}
          disabled={value >= MAX_MINUTES}
        >
          <Plus />
        </Button>
      </div>
      <Slider
        aria-label="Duration in minutes"
        min={MIN_MINUTES}
        max={MAX_MINUTES}
        step={MINUTE_STEP}
        value={[value]}
        onValueChange={(v) => onChange(clamp(Array.isArray(v) ? v[0] : v))}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{MIN_MINUTES} min</span>
        <span>{MAX_MINUTES} min</span>
      </div>
    </div>
  );
}
