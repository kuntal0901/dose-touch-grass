import { CHEMICAL_IDS, CHEMICALS } from "@/data/chemicals";
import { formatSeconds } from "@/lib/hooks";
import type { JournalEntry } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StatsSummary({
  entries,
  screenSeconds,
}: {
  entries: JournalEntry[];
  /** Total seconds the app itself has been on screen. */
  screenSeconds: number;
}) {
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const completed = entries.filter((e) => e.status === "completed").length;
  const minutesBy = Object.fromEntries(
    CHEMICAL_IDS.map((id) => [
      id,
      entries.filter((e) => e.chemical === id).reduce((sum, e) => sum + e.minutes, 0),
    ]),
  );
  const countBy = Object.fromEntries(
    CHEMICAL_IDS.map((id) => [id, entries.filter((e) => e.chemical === id).length]),
  );
  const maxMinutes = Math.max(1, ...Object.values(minutesBy));

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5">
      <GrassVsScreen grassMinutes={totalMinutes} screenSeconds={screenSeconds} />
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Challenges" value={entries.length} />
        <Stat label="Completed" value={completed} />
        <Stat label="Min outside" value={totalMinutes} />
      </div>
      <div className="space-y-3">
        {CHEMICAL_IDS.map((id) => {
          const chem = CHEMICALS[id];
          return (
            <div key={id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={cn("font-medium", chem.styles.text)}>
                  {chem.emoji} {chem.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {countBy[id]} · {minutesBy[id]} min
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", chem.styles.solidBg)}
                  style={{ width: `${(minutesBy[id] / maxMinutes) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/** The core metric: the screen should be the shortest part of the experience. */
function GrassVsScreen({ grassMinutes, screenSeconds }: { grassMinutes: number; screenSeconds: number }) {
  const grassSeconds = grassMinutes * 60;
  const total = Math.max(1, grassSeconds + screenSeconds);
  const ratio = screenSeconds > 0 ? Math.round(grassSeconds / screenSeconds) : null;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">
          🌿 {grassMinutes} min outside
        </span>
        <span className="text-muted-foreground">📱 {formatSeconds(screenSeconds)} in this app</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-emerald-500" style={{ width: `${(grassSeconds / total) * 100}%` }} />
        <div className="h-full bg-slate-400" style={{ width: `${(screenSeconds / total) * 100}%` }} />
      </div>
      {ratio !== null && ratio >= 1 && (
        <p className="text-center text-sm">
          For every minute on screen, you spent <span className="font-semibold">{ratio} minutes</span> touching grass.
        </p>
      )}
    </div>
  );
}
