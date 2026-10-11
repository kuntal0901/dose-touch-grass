export type ChoiceQuestion = {
  id: string;
  kind: "choice";
  label: string;
  options: { value: string; label: string }[];
};

export type ScaleQuestion = {
  id: string;
  kind: "scale";
  label: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

export type Question = ChoiceQuestion | ScaleQuestion;

/** The question whose answer sets the entry's completion status. */
export const COMPLETION_QUESTION_ID = "completion";

export const QUESTIONS: Question[] = [
  {
    id: COMPLETION_QUESTION_ID,
    kind: "choice",
    label: "How much of the challenge did you complete?",
    options: [
      { value: "completed", label: "All of it" },
      { value: "partial", label: "Part of it" },
      { value: "attempted", label: "Just attempted" },
    ],
  },
  {
    id: "moodBefore",
    kind: "scale",
    label: "How did you feel before starting?",
    min: 1,
    max: 5,
    minLabel: "Drained",
    maxLabel: "Great",
  },
  {
    id: "moodAfter",
    kind: "scale",
    label: "How do you feel now?",
    min: 1,
    max: 5,
    minLabel: "Drained",
    maxLabel: "Great",
  },
  {
    id: "difficulty",
    kind: "choice",
    label: "How hard was it?",
    options: [
      { value: "easy", label: "Easy" },
      { value: "right", label: "Just right" },
      { value: "hard", label: "Hard" },
    ],
  },
  {
    id: "again",
    kind: "choice",
    label: "Would you do it again?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "maybe", label: "Maybe" },
      { value: "no", label: "No" },
    ],
  },
];

export const REFLECTION_PROMPT = "How did it feel to do this challenge?";
