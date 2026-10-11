export type Option<T extends string> = { value: T; label: string; emoji: string };

export type Place = "park" | "street" | "garden" | "trail" | "water" | "balcony";
export type Company = "solo" | "friend" | "kids" | "dog";
export type Energy = "low" | "medium" | "high";

export const PLACES: Option<Place>[] = [
  { value: "park", label: "Park", emoji: "🌳" },
  { value: "street", label: "City street", emoji: "🏙️" },
  { value: "garden", label: "Garden / yard", emoji: "🌱" },
  { value: "trail", label: "Trail / woods", emoji: "🥾" },
  { value: "water", label: "Beach / river", emoji: "🌊" },
  { value: "balcony", label: "Balcony / doorstep", emoji: "🪴" },
];

export const COMPANY: Option<Company>[] = [
  { value: "solo", label: "Just me", emoji: "🧍" },
  { value: "friend", label: "With a friend", emoji: "👯" },
  { value: "kids", label: "With kids", emoji: "🧒" },
  { value: "dog", label: "With a dog", emoji: "🐕" },
];

export const ENERGY: Option<Energy>[] = [
  { value: "low", label: "Low", emoji: "🪫" },
  { value: "medium", label: "Medium", emoji: "🙂" },
  { value: "high", label: "High", emoji: "⚡" },
];

export type CoachPrefs = {
  place: Place;
  company: Company;
  energy: Energy;
  minutes: number;
};

export const DEFAULT_COACH_PREFS: CoachPrefs = {
  place: "park",
  company: "solo",
  energy: "medium",
  minutes: 20,
};

/** Random sensory "seed" nudges a small model toward varied ideas. */
export const INSPIRATION_SEEDS = [
  "textures", "sounds", "colours", "light and shadow", "leaves", "the sky",
  "smells", "patterns", "small creatures", "water", "wind", "stones",
  "trees", "flowers", "movement", "kindness", "curiosity", "play",
];
