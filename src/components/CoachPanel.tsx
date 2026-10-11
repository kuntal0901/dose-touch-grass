"use client";

import { useState } from "react";
import { CloudSun, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AiStatusCard } from "@/components/AiStatusCard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { DurationPicker } from "@/components/DurationPicker";
import { OptionPills } from "@/components/OptionPills";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/data/challenges";
import { CHEMICAL_IDS, type ChemicalId } from "@/data/chemicals";
import { COMPANY, ENERGY, INSPIRATION_SEEDS, PLACES } from "@/data/coach";
import { generateChallenge, MODEL_LABEL, useAi } from "@/lib/ai/engine";
import { peekTitle, type Weather } from "@/lib/ai/prompts";
import { useDoseStore } from "@/lib/store";
import { fetchLocalWeather } from "@/lib/weather";

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function CoachPanel({
  chem,
  onStart,
}: {
  chem: ChemicalId | "random";
  onStart: (challenge: Challenge, minutes: number) => void;
}) {
  const aiStatus = useAi((s) => s.status);
  const prefs = useDoseStore((s) => s.coachPrefs);
  const setPrefs = useDoseStore((s) => s.setCoachPrefs);

  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherState, setWeatherState] = useState<"idle" | "loading" | "error">("idle");
  const [generating, setGenerating] = useState(false);
  /** Raw model output streamed so far, for a live preview. */
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  if (aiStatus !== "ready") return <AiStatusCard />;

  const generate = async () => {
    setGenerating(true);
    setDraft("");
    setError(null);
    try {
      const result = await generateChallenge(
        {
          ...prefs,
          chemical: chem === "random" ? pick(CHEMICAL_IDS) : chem,
          weather: weather ?? undefined,
          seed: pick(INSPIRATION_SEEDS),
          avoidTitles: history,
        },
        setDraft,
      );
      setChallenge(result);
      setHistory((h) => [result.title, ...h].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const loadWeather = async () => {
    setWeatherState("loading");
    try {
      setWeather(await fetchLocalWeather());
      setWeatherState("idle");
    } catch {
      setWeatherState("error");
    }
  };

  if (challenge) {
    return (
      <div className="space-y-4">
        <ChallengeCard challenge={challenge} />
        <Button className="h-12 w-full text-base" onClick={() => onStart(challenge, prefs.minutes)}>
          Start the timer · {prefs.minutes} min
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11" disabled={generating} onClick={generate}>
            {generating ? <Loader2 className="animate-spin" /> : <RefreshCw />} Another idea
          </Button>
          <Button variant="ghost" className="h-11" onClick={() => setChallenge(null)}>
            Change details
          </Button>
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5">
      <OptionPills label="Where can you go?" options={PLACES} value={prefs.place} onChange={(place) => setPrefs({ place })} />
      <OptionPills label="Who's with you?" options={COMPANY} value={prefs.company} onChange={(company) => setPrefs({ company })} />
      <OptionPills label="Energy level" options={ENERGY} value={prefs.energy} onChange={(energy) => setPrefs({ energy })} />

      <div className="space-y-2">
        <p className="text-sm font-medium">How long can you be outside?</p>
        <DurationPicker value={prefs.minutes} onChange={(minutes) => setPrefs({ minutes })} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3 text-sm">
        <span className="flex items-center gap-2">
          <CloudSun className="size-4 shrink-0" aria-hidden />
          {weather
            ? `${weather.description}, ${Math.round(weather.tempC)}°C`
            : weatherState === "error"
              ? "Couldn't get weather"
              : "Match today's weather?"}
        </span>
        {!weather && (
          <Button size="sm" variant="outline" disabled={weatherState === "loading"} onClick={loadWeather}>
            {weatherState === "loading" ? <Loader2 className="animate-spin" /> : "Use my location"}
          </Button>
        )}
      </div>

      <Button className="h-12 w-full text-base" disabled={generating} onClick={generate}>
        {generating ? (
          <>
            <Loader2 className="animate-spin" />
            {draft ? `${MODEL_LABEL} is writing…` : `${MODEL_LABEL} is thinking…`}
          </>
        ) : (
          <>
            <Sparkles /> Create my challenge
          </>
        )}
      </Button>
      {generating && peekTitle(draft) && (
        <p className="animate-pulse text-center text-sm font-medium">✍️ {peekTitle(draft)}…</p>
      )}
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">
        Generated on your device. Nothing you choose here is sent anywhere.
        {weather && " (Weather came from Open-Meteo using your rounded location.)"}
      </p>
    </div>
  );
}
