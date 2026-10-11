// Pure prompt-building and validation logic for the on-device coach.
// Kept free of WebLLM imports so it can be unit-tested in Node.

import { MAX_MINUTES, MIN_MINUTES, MINUTE_STEP, type Challenge } from "@/data/challenges";
import { CHEMICALS, CHEMICAL_IDS, type ChemicalId } from "@/data/chemicals";
import { COMPANY, ENERGY, PLACES, type CoachPrefs } from "@/data/coach";
import type { EntryStatus } from "@/lib/store";

export type Weather = { tempC: number; description: string; isDay: boolean };

export type CoachRequest = CoachPrefs & {
  chemical: ChemicalId;
  weather?: Weather;
  seed: string;
  avoidTitles: string[];
};

const CHEMICAL_HINTS: Record<ChemicalId, string> = {
  dopamine: "a small, finishable goal or a new discovery that gives a sense of achievement",
  oxytocin: "connection: kindness, conversation, play or gentle time with people or animals",
  serotonin: "calm: daylight, nature, slow mindful attention and gratitude",
  endorphins: "physical exertion that raises the heart rate, or big laughter",
};

const label = <T extends string>(opts: { value: T; label: string }[], v: T) =>
  opts.find((o) => o.value === v)?.label.toLowerCase() ?? v;

export function buildChallengePrompt(req: CoachRequest): string {
  const chem = CHEMICALS[req.chemical];
  const weather = req.weather
    ? `Current weather: ${req.weather.description}, ${Math.round(req.weather.tempC)}°C, ${req.weather.isDay ? "daytime" : "night-time"}.`
    : "Weather: unknown — suggest something that works in most weather.";
  const avoid = req.avoidTitles.length
    ? `Do not repeat these ideas: ${req.avoidTitles.slice(0, 6).join("; ")}.`
    : "";

  // A plain "Title: / Description: / 1. 2. 3." format rather than JSON: in
  // testing Gemma 3 1B rarely produced valid JSON (it skipped "steps" and
  // kept writing extra objects) but follows this layout well. The example
  // comes first and is marked as someone else's, or the model "continues" it.
  return [
    "You are a friendly outdoor coach. Invent ONE short screen-free challenge that gets the person outside.",
    "",
    "Here is an example of a good challenge (for a different person, do not copy it):",
    "Title: Touch Grass (Literally)",
    "Description: Take your shoes off and walk on real grass, noticing five different textures.",
    "1. Find a clear patch of grass and take your shoes off.",
    "2. Stand still for ten slow breaths.",
    "3. Walk slowly and notice five textures under your feet.",
    "",
    "Now write a NEW challenge for this person.",
    "",
    `Goal: boost ${chem.name} — ${CHEMICAL_HINTS[req.chemical]}.`,
    `Where: ${label(PLACES, req.place)}. Company: ${label(COMPANY, req.company)}. Energy: ${label(ENERGY, req.energy)}.`,
    `Time available: ${req.minutes} minutes.`,
    weather,
    `Theme to inspire you: ${req.seed}.`,
    ...(avoid ? [avoid] : []),
    "",
    "Rules:",
    "- It must happen outdoors and use no phone, screen, app, music player or headphones.",
    "- Anyone can do it with no special equipment or cost. Keep it safe.",
    `- It must fit in ${req.minutes} minutes.`,
    "- Be brief: title 2 to 5 words, one short sentence of description, 3 short steps.",
    "",
    "Reply in exactly this format and nothing else:",
    "Title: <2 to 5 words>",
    "Description: <one short sentence>",
    "1. <first step>",
    "2. <second step>",
    "3. <third step>",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/** Words that mean the "screen-free" rule was broken. */
const SCREEN_WORDS =
  /\b(app|apps|screen|screens|phone|smartphone|tablet|laptop|computer|tv|television|video|videos|youtube|tiktok|instagram|netflix|scroll|online|headphones?|earbuds?|playlist|podcast|selfie|photo|photos)\b/i;

const clampMinutes = (n: number) =>
  Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(n / MINUTE_STEP) * MINUTE_STEP));

const clean = (s: unknown) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");

/** Keep the first sentence and cap the length — small models tend to ramble. */
function tidy(s: string, maxChars: number): string {
  const firstSentence = s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;
  if (firstSentence.length <= maxChars) return firstSentence;
  const cut = firstSentence.slice(0, maxChars);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "")}…`;
}

const unescape = (s: string) => {
  try {
    return JSON.parse(`"${s}"`) as string;
  } catch {
    return s;
  }
};

/**
 * Pull fields out of possibly-truncated JSON (e.g. the model hit max_tokens or
 * our timeout mid-sentence). Only complete strings are kept.
 */
function salvage(raw: string): { title?: string; description?: string; steps: string[] } {
  const field = (name: string) =>
    raw.match(new RegExp(`"${name}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
  // Stop at "]" so keys of a following object aren't taken as steps.
  const stepsBlock = raw.match(/"steps"\s*:\s*\[((?:[^\]"]|"(?:[^"\\]|\\.)*")*)/)?.[1] ?? "";
  const steps = [...stepsBlock.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => unescape(m[1]));
  const title = field("title");
  const description = field("description");
  return {
    title: title && unescape(title),
    description: description && unescape(description),
    steps,
  };
}

/** Markdown the model likes to sprinkle in ("**Title:**", "## Steps"). */
const stripMarkdown = (s: string) => s.replace(/[*_#`]+/g, "");

const TITLE_LINE = /^\s*title\s*:\s*(.+)$/im;
const DESCRIPTION_LINE = /^\s*description\s*:\s*(.+)$/im;
/** "1. …", "1) …", "Step 1: …", "3: …" */
const STEP_LINE = /^\s*(?:[-•]\s*)?(?:step\s*)?(\d)\s*[.):]\s*(.+)$/gim;

/** Parse the "Title: / Description: / 1. 2. 3." format the prompt asks for. */
function parseLines(raw: string): { title?: string; description?: string; steps: string[] } {
  const text = stripMarkdown(raw);
  const title = text.match(TITLE_LINE)?.[1];
  const description = text.match(DESCRIPTION_LINE)?.[1];
  const afterDescription = description ? text.slice(text.search(DESCRIPTION_LINE)) : text;
  let steps = [...afterDescription.matchAll(STEP_LINE)].map((m) => m[2]);
  if (steps.length < 2) {
    // Inline: "Steps: 1. Find a spot. 2. Look up. 3. Breathe."
    const inline = afterDescription.match(/steps?\s*:\s*(.+)$/im)?.[1] ?? "";
    steps = inline.split(/\s*\b\d\s*[.)]\s+/).filter(Boolean);
  }
  return { title, description, steps };
}

/**
 * True once the model has written a title and a complete third step: the
 * caller stops generation there, since small models tend to keep chatting.
 */
export function isChallengeComplete(raw: string): boolean {
  const text = stripMarkdown(raw);
  return TITLE_LINE.test(text) && /^\s*(?:step\s*)?3\s*[.):]\s*\S.*\n/im.test(text);
}

/** Partial title while the model is still writing (for a live preview). */
export function peekTitle(raw: string): string | null {
  const line = stripMarkdown(raw).match(/^\s*title\s*:\s*(.+)/im)?.[1];
  if (line) return line.trim();
  const m = raw.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)/);
  return m ? unescape(m[1]) : null;
}

/**
 * Parse and sanity-check model output. Returns null when it breaks the rules,
 * so the caller can retry or fall back to the curated library.
 */
export function parseChallenge(raw: string, req: CoachRequest, id: string): Challenge | null {
  let obj: { title?: unknown; description?: unknown; steps?: unknown } = parseLines(raw);
  // Fall back to JSON in case the model answers in JSON anyway.
  if (!obj.title && raw.includes("{")) {
    try {
      // Small models sometimes wrap JSON in prose or code fences.
      obj = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    } catch {
      obj = salvage(raw);
    }
  }
  const title = tidy(clean(obj.title), 60).replace(/[.!]$/, "");
  const description = tidy(clean(obj.description), 200);
  const steps = (Array.isArray(obj.steps) ? obj.steps : [])
    .map((s) => tidy(clean(s), 140))
    .filter((s) => s.length >= 3)
    .slice(0, 4);

  if (title.length < 3 || description.length < 10 || steps.length < 2) return null;

  // Allow the phrase "screen-free" itself, but nothing that sends you back to a device.
  const text = [title, description, ...steps].join(" ").replace(/screen-free/gi, "");
  if (SCREEN_WORDS.test(text)) return null;

  return {
    id,
    chemical: req.chemical,
    title,
    description,
    steps,
    defaultMinutes: clampMinutes(req.minutes),
    source: "ai",
  };
}

export function buildReflectionPrompt(input: {
  title: string;
  chemical: ChemicalId;
  minutes: number;
  status: EntryStatus;
  answers?: Record<string, string | number>;
  reflection?: string;
}): string {
  const chem = CHEMICALS[input.chemical];
  const others = CHEMICAL_IDS.filter((c) => c !== input.chemical)
    .map((c) => CHEMICALS[c].name)
    .join(", ");
  const a = input.answers ?? {};
  return [
    "You are a warm, encouraging wellbeing coach. Someone just finished a screen-free outdoor challenge.",
    `Challenge: "${input.title}" (${chem.name}), ${input.minutes} minutes, status: ${input.status}.`,
    a.moodBefore !== undefined ? `Mood before: ${a.moodBefore}/5. Mood after: ${a.moodAfter ?? "?"}/5.` : "",
    a.difficulty ? `Difficulty: ${a.difficulty}.` : "",
    input.reflection ? `In their words: "${input.reflection}"` : "",
    "",
    `Write 2 or 3 short sentences: reflect back what went well, then suggest which chemical to try next (${others}) and one outdoor idea for it.`,
    "Speak directly to them. No lists, no markdown, no emojis.",
  ]
    .filter(Boolean)
    .join("\n");
}
