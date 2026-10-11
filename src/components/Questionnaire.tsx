"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLETION_QUESTION_ID,
  QUESTIONS,
  REFLECTION_PROMPT,
  type Question,
} from "@/data/questionnaire";
import type { EntryStatus, JournalEntry } from "@/lib/store";
import { cn } from "@/lib/utils";

type Answers = Record<string, string | number>;

function Pills({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | number | undefined;
  onChange: (v: string | number) => void;
}) {
  const options =
    question.kind === "choice"
      ? question.options
      : Array.from({ length: question.max - question.min + 1 }, (_, i) => {
          const n = question.min + i;
          return { value: n, label: String(n) };
        });

  return (
    <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              question.kind === "scale" && "min-w-10 px-0",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Questionnaire({
  entry,
  onSubmit,
  onCancel,
}: {
  entry: JournalEntry;
  onSubmit: (data: { status: EntryStatus; answers: Answers; reflection: string }) => void;
  onCancel: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>({ [COMPLETION_QUESTION_ID]: entry.status });
  const [reflection, setReflection] = useState("");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          status: (answers[COMPLETION_QUESTION_ID] as EntryStatus) ?? entry.status,
          answers,
          reflection: reflection.trim(),
        });
      }}
    >
      {QUESTIONS.map((q) => (
        <fieldset key={q.id} className="space-y-2">
          <legend id={`q-${q.id}`} className="mb-2 text-sm font-medium">
            {q.label}
          </legend>
          <Pills
            question={q}
            value={answers[q.id]}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          />
          {q.kind === "scale" && (
            <div className="flex w-[calc(5*2.5rem+4*0.5rem)] justify-between text-xs text-muted-foreground">
              <span>{q.minLabel}</span>
              <span>{q.maxLabel}</span>
            </div>
          )}
        </fieldset>
      ))}

      <div className="space-y-2">
        <Label htmlFor="reflection">{REFLECTION_PROMPT}</Label>
        <Textarea
          id="reflection"
          rows={4}
          placeholder="A few words about how it went…"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" className="h-11 flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="h-11 flex-1 text-base">
          Save entry
        </Button>
      </div>
    </form>
  );
}
