export type ChemicalId = "dopamine" | "oxytocin" | "serotonin" | "endorphins";

export type Chemical = {
  id: ChemicalId;
  name: string;
  nickname: string;
  tagline: string;
  emoji: string;
  /** Tailwind class sets — kept as literal strings so Tailwind can detect them. */
  styles: {
    text: string;
    softBg: string;
    border: string;
    solidBg: string;
    stroke: string;
  };
  funFacts: string[];
};

export const CHEMICALS: Record<ChemicalId, Chemical> = {
  dopamine: {
    id: "dopamine",
    name: "Dopamine",
    nickname: "The reward chemical",
    tagline: "Motivation & the joy of getting things done.",
    emoji: "🏆",
    styles: {
      text: "text-amber-700 dark:text-amber-300",
      softBg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900",
      solidBg: "bg-amber-500",
      stroke: "stroke-amber-500",
    },
    funFacts: [
      "Dopamine is more about anticipation than pleasure — it surges when you expect a reward, which is what pulls you toward a goal.",
      "Breaking a big goal into tiny, finishable steps gives your brain repeated small hits of progress-driven dopamine.",
      "Most of your brain's dopamine is produced in two tiny midbrain regions: the substantia nigra and the ventral tegmental area.",
      "Novelty is a dopamine trigger — trying something new, even a small new skill, lights up your reward system.",
      "Your body uses dopamine as a building block to make norepinephrine and adrenaline.",
    ],
  },
  oxytocin: {
    id: "oxytocin",
    name: "Oxytocin",
    nickname: "The love chemical",
    tagline: "Connection, trust & warmth.",
    emoji: "🤝",
    styles: {
      text: "text-rose-700 dark:text-rose-300",
      softBg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-900",
      solidBg: "bg-rose-500",
      stroke: "stroke-rose-500",
    },
    funFacts: [
      "The word oxytocin comes from Greek words meaning \"swift birth\" — it plays a key role in childbirth and breastfeeding.",
      "Oxytocin is made in the hypothalamus and released into the bloodstream by the pituitary gland.",
      "Studies have found that when dogs and their owners gaze at each other, oxytocin rises in both of them.",
      "Warm touch — hugs, massage, holding hands — is one of the most reliable ways to release oxytocin.",
      "Oxytocin is linked to lower stress responses and greater feelings of trust and generosity.",
    ],
  },
  serotonin: {
    id: "serotonin",
    name: "Serotonin",
    nickname: "The mood stabilizer",
    tagline: "Calm, contentment & a steady mood.",
    emoji: "☀️",
    styles: {
      text: "text-teal-700 dark:text-teal-300",
      softBg: "bg-teal-50 dark:bg-teal-950/40",
      border: "border-teal-200 dark:border-teal-900",
      solidBg: "bg-teal-500",
      stroke: "stroke-teal-500",
    },
    funFacts: [
      "Around 90% of your body's serotonin is made in your gut, not your brain.",
      "Research has found the brain produces more serotonin on bright, sunny days than on dull ones.",
      "Serotonin is the raw material your body uses to make melatonin, the hormone that helps you sleep.",
      "Your body builds serotonin from tryptophan, an amino acid found in foods like eggs, cheese, oats and nuts.",
      "Regular rhythmic movement like walking is associated with healthier serotonin activity.",
    ],
  },
  endorphins: {
    id: "endorphins",
    name: "Endorphins",
    nickname: "The natural painkiller",
    tagline: "Energy, euphoria & stress relief.",
    emoji: "🔥",
    styles: {
      text: "text-violet-700 dark:text-violet-300",
      softBg: "bg-violet-50 dark:bg-violet-950/40",
      border: "border-violet-200 dark:border-violet-900",
      solidBg: "bg-violet-500",
      stroke: "stroke-violet-500",
    },
    funFacts: [
      "\"Endorphin\" is short for \"endogenous morphine\" — a painkiller your body makes itself.",
      "Endorphins bind to the same opioid receptors as pain medication, dulling pain and lifting mood.",
      "Laughing together has been shown to raise people's pain tolerance, a sign that endorphins are being released.",
      "Singing and dancing in a group can boost endorphins and make people feel closer to each other.",
      "The famous \"runner's high\" is linked to endorphins, along with the body's own cannabis-like endocannabinoids.",
    ],
  },
};

export const CHEMICAL_IDS = Object.keys(CHEMICALS) as ChemicalId[];

export function isChemicalId(value: unknown): value is ChemicalId {
  return typeof value === "string" && value in CHEMICALS;
}
