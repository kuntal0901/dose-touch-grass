"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CHALLENGES_BY_ID, type Challenge } from "@/data/challenges";
import type { ChemicalId } from "@/data/chemicals";
import { DEFAULT_COACH_PREFS, type CoachPrefs } from "@/data/coach";
import { makeId, randomNickname } from "./session";

export type Session = { id: string; nickname: string; createdAt: string };

export type ActiveChallenge = {
  /** Full snapshot, so AI-generated challenges work the same as library ones. */
  challenge: Challenge;
  minutes: number;
  startedAt: number;
  endsAt: number;
  /** Seconds the screen was on (app visible) while the timer ran. */
  screenSeconds: number;
  /** Dev-only: minutes are treated as seconds. */
  debug?: boolean;
};

export type EntryStatus = "completed" | "partial" | "attempted";

export type JournalEntry = {
  id: string;
  challengeId: string;
  title: string;
  source: "library" | "ai";
  chemical: ChemicalId;
  /** Off-screen minutes actually spent. */
  minutes: number;
  /** Seconds the app was on screen during the challenge ("peeks"). */
  screenSeconds: number;
  completedAt: string;
  status: EntryStatus;
  /** True once the user filled in the questionnaire. */
  logged: boolean;
  answers?: Record<string, string | number>;
  reflection?: string;
  /** Short reflection written on-device by Gemma. */
  aiReflection?: string;
};

type State = {
  session: Session | null;
  active: ActiveChallenge | null;
  entries: JournalEntry[];
  /** Challenge ids already shown (rejected or started) so the deck avoids repeats. */
  seenIds: string[];
  lastEntryId: string | null;
  /** Total seconds this app has been on screen (visible). */
  screenSeconds: number;
  coachPrefs: CoachPrefs;
};

type Actions = {
  ensureSession: () => void;
  markSeen: (challengeId: string) => void;
  clearSeen: (challengeIds: string[]) => void;
  startChallenge: (challenge: Challenge, minutes: number, debug?: boolean) => ActiveChallenge;
  finishChallenge: (status: EntryStatus) => string | null;
  logEntry: (
    entryId: string,
    data: Pick<JournalEntry, "status" | "answers" | "reflection">,
  ) => void;
  setAiReflection: (entryId: string, text: string) => void;
  addScreenSeconds: (seconds: number) => void;
  setCoachPrefs: (prefs: Partial<CoachPrefs>) => void;
  resetAll: () => void;
};

const initialState: State = {
  session: null,
  active: null,
  entries: [],
  seenIds: [],
  lastEntryId: null,
  screenSeconds: 0,
  coachPrefs: DEFAULT_COACH_PREFS,
};

/**
 * Phase 1: all state lives in localStorage. In phase 2, swap these actions for
 * API calls — components only talk to this store.
 */
export const useDoseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      ensureSession: () => {
        if (get().session) return;
        set({
          session: {
            id: makeId(),
            nickname: randomNickname(),
            createdAt: new Date().toISOString(),
          },
        });
      },

      markSeen: (challengeId) =>
        set((s) =>
          s.seenIds.includes(challengeId) ? s : { seenIds: [...s.seenIds, challengeId] },
        ),

      clearSeen: (challengeIds) =>
        set((s) => ({ seenIds: s.seenIds.filter((id) => !challengeIds.includes(id)) })),

      startChallenge: (challenge, minutes, debug) => {
        const startedAt = Date.now();
        const unitMs = debug ? 1000 : 60_000;
        const active: ActiveChallenge = {
          challenge,
          minutes,
          startedAt,
          endsAt: startedAt + minutes * unitMs,
          screenSeconds: 0,
          debug,
        };
        set({ active });
        if (challenge.source !== "ai") get().markSeen(challenge.id);
        return active;
      },

      finishChallenge: (status) => {
        const { active } = get();
        if (!active) return null;
        const { challenge } = active;
        const unitMs = active.debug ? 1000 : 60_000;
        const elapsed = Math.min(Date.now(), active.endsAt) - active.startedAt;
        const minutes =
          status === "completed" ? active.minutes : Math.round(elapsed / unitMs);

        const entry: JournalEntry = {
          id: makeId(),
          challengeId: challenge.id,
          title: challenge.title,
          source: challenge.source ?? "library",
          chemical: challenge.chemical,
          minutes,
          screenSeconds: active.screenSeconds,
          completedAt: new Date().toISOString(),
          status,
          logged: false,
        };
        set((s) => ({ active: null, entries: [entry, ...s.entries], lastEntryId: entry.id }));
        return entry.id;
      },

      logEntry: (entryId, data) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId ? { ...e, ...data, logged: true } : e,
          ),
        })),

      setAiReflection: (entryId, text) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === entryId ? { ...e, aiReflection: text } : e)),
        })),

      addScreenSeconds: (seconds) =>
        set((s) => ({
          screenSeconds: s.screenSeconds + seconds,
          active: s.active
            ? { ...s.active, screenSeconds: s.active.screenSeconds + seconds }
            : null,
        })),

      setCoachPrefs: (prefs) => set((s) => ({ coachPrefs: { ...s.coachPrefs, ...prefs } })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: "dose-store",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => migrate(persisted as Record<string, unknown>, version),
    },
  ),
);

/** v1 stored only challenge ids; v2 stores full challenge snapshots. */
function migrate(state: Record<string, unknown>, version: number) {
  if (version < 2) {
    const oldActive = state.active as { challengeId?: string } | null;
    const activeChallenge = oldActive?.challengeId
      ? CHALLENGES_BY_ID[oldActive.challengeId]
      : undefined;
    state.active = activeChallenge
      ? { ...oldActive, challenge: activeChallenge, screenSeconds: 0 }
      : null;
    state.entries = ((state.entries as JournalEntry[] | undefined) ?? []).map((e) => ({
      ...e,
      title: e.title ?? CHALLENGES_BY_ID[e.challengeId]?.title ?? "Retired challenge",
      source: e.source ?? "library",
      screenSeconds: e.screenSeconds ?? 0,
    }));
    state.screenSeconds = 0;
    state.coachPrefs = DEFAULT_COACH_PREFS;
  }
  return state as unknown as State & Actions;
}
