"use client";

// On-device inference with WebLLM + Gemma 3 1B. The model runs on the user's
// GPU via WebGPU inside a Web Worker: no API keys, no server, nothing the user
// writes leaves their device, and the UI never freezes. After the one-time
// download it works offline.

import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import { create } from "zustand";
import type { Challenge } from "@/data/challenges";
import { makeId } from "@/lib/session";
import { GPU_CHANNEL, type GpuMessage } from "./gpu-channel";
import {
  buildChallengePrompt,
  buildReflectionPrompt,
  isChallengeComplete,
  parseChallenge,
  type CoachRequest,
} from "./prompts";

export const MODEL_ID = "gemma3-1b-it-q4f16_1-MLC";
export const MODEL_LABEL = "Gemma 3 1B";
export const MODEL_SIZE_LABEL = "~700 MB";

/**
 * No grammar-constrained JSON: under a JSON schema Gemma 3 1B wrote a title
 * and description, then padded whitespace until max_tokens rather than add
 * "steps". The prompt asks for a plain line format instead, and generation
 * stops as soon as the third step is written.
 */
const MAX_TOKENS = 200;
/** Hard ceiling per attempt so the UI can never spin forever. */
const ATTEMPT_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS = 2;

export type AiStatus = "checking" | "unsupported" | "idle" | "loading" | "ready" | "error";

type AiState = {
  status: AiStatus;
  /** 0–1 while downloading / loading the model. */
  progress: number;
  progressText: string;
  /** Model weights already in the browser cache (no download needed). */
  cached: boolean;
  error?: string;
};

export const useAi = create<AiState>(() => ({
  status: "checking",
  progress: 0,
  progressText: "",
  cached: false,
}));

let engine: MLCEngineInterface | null = null;
let worker: Worker | null = null;
let loading: Promise<MLCEngineInterface> | null = null;
let detecting = false;

const GPU_LOST_MESSAGE =
  "Your graphics chip stopped responding, so the coach was unloaded. Tap Start coach to reload it.";
/** Rejecters for in-flight loads/generations, fired when the GPU is lost. */
const gpuLostListeners = new Set<(err: Error) => void>();
let gpuChannel: BroadcastChannel | null = null;

/**
 * The worker reports a lost GPU device (driver reset/hang). WebLLM unloads the
 * model when that happens and pending requests never settle, so drop the
 * worker and fail them now instead of waiting for the timeout. No auto-reload:
 * a GPU that keeps resetting would loop forever.
 */
function listenForGpuLoss() {
  if (gpuChannel) return;
  gpuChannel = new BroadcastChannel(GPU_CHANNEL);
  gpuChannel.onmessage = (ev: MessageEvent<GpuMessage>) => {
    if (ev.data?.type !== "device-lost") return;
    console.warn("[coach] GPU device lost:", ev.data.message);
    worker?.terminate();
    worker = null;
    engine = null;
    loading = null;
    const err = new Error(GPU_LOST_MESSAGE);
    for (const reject of gpuLostListeners) reject(err);
    useAi.setState({ status: "error", error: GPU_LOST_MESSAGE, progress: 0 });
  };
}

/** Settle `promise` early (rejected) if the GPU is lost meanwhile. */
function untilGpuLost<T>(promise: Promise<T>): Promise<T> {
  let reject!: (err: Error) => void;
  const lost = new Promise<never>((_, r) => (reject = r));
  gpuLostListeners.add(reject);
  return Promise.race([promise, lost]).finally(() => gpuLostListeners.delete(reject));
}

type GpuNavigator = Navigator & { gpu?: { requestAdapter(): Promise<unknown> } };

/** Check WebGPU support; auto-load the model if it's already cached. */
export async function detectAi() {
  if (detecting) return;
  detecting = true;
  // Never leave the UI stuck on "checking": any failure means "unsupported".
  try {
    // WebGPU only exists in secure contexts (https:// or localhost).
    const gpu = (navigator as GpuNavigator).gpu;
    if (!gpu || !(await gpu.requestAdapter())) {
      useAi.setState({ status: "unsupported" });
      return;
    }
    const { hasModelInCache } = await import("@mlc-ai/web-llm");
    const cached = await hasModelInCache(MODEL_ID).catch(() => false);
    useAi.setState({ status: "idle", cached });
    if (cached) void loadModel().catch(() => {});
  } catch {
    useAi.setState({ status: "unsupported" });
  }
}

export function loadModel(): Promise<MLCEngineInterface> {
  if (engine) return Promise.resolve(engine);
  if (!loading) {
    useAi.setState({ status: "loading", progress: 0, progressText: "Starting…", error: undefined });
    listenForGpuLoss();
    const attempt: Promise<MLCEngineInterface> = untilGpuLost((async () => {
      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
      worker = new Worker(new URL("./llm.worker.ts", import.meta.url), { type: "module" });
      const created = await CreateWebWorkerMLCEngine(
        worker,
        MODEL_ID,
        {
          initProgressCallback: (r) =>
            useAi.setState({ progress: r.progress, progressText: r.text }),
        },
        // WebLLM's prebuilt Gemma 3 record sets context_window_size=4096 while the
        // model config sets sliding_window_size=512, and WebLLM rejects both being
        // positive. Keep the sliding window Gemma 3 was built with and drop the
        // fixed context instead: disabling the window made the model ramble and
        // never emit an end-of-turn token.
        { context_window_size: -1, sliding_window_size: 512, attention_sink_size: 0 },
      );
      // The first generation compiles GPU shaders (~15s in testing). Do it now,
      // behind the progress bar, so the user's first "Create" click is fast.
      // A few tokens rather than 1 (a 1-token run once threw "Object has
      // already been disposed"), then clear the history so it can't leak.
      useAi.setState({ progressText: "Warming up the model…" });
      await created.chat.completions.create({
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 4,
      });
      await created.resetChat();
      engine = created;
      useAi.setState({ status: "ready", cached: true, progress: 1 });
      return created;
    })()).catch((err: unknown) => {
      // A newer load may have started after a GPU loss; leave it alone.
      if (loading !== attempt) throw err;
      loading = null;
      const message = err instanceof Error ? err.message : String(err);
      useAi.setState({
        status: "error",
        error: message === GPU_LOST_MESSAGE ? message : `Couldn't load the model: ${message}`,
      });
      throw err;
    });
    loading = attempt;
  }
  return loading;
}

/**
 * Kill a wedged worker and reload the model from the browser cache (~10s).
 * Used when interruptGenerate() doesn't stop a runaway generation.
 */
function hardReset() {
  worker?.terminate();
  worker = null;
  engine = null;
  loading = null;
  void loadModel().catch(() => {});
}

/** Grace period after interruptGenerate() before we kill the worker. */
const INTERRUPT_GRACE_MS = 5_000;

/**
 * Stream one completion with a hard timeout. Returns whatever text was
 * produced (possibly partial if the timeout interrupted generation), and is
 * guaranteed to settle even if the worker stops responding. `isDone` stops
 * generation early once the text is good enough.
 */
async function streamText(
  e: MLCEngineInterface,
  request: Omit<Parameters<MLCEngineInterface["chat"]["completions"]["create"]>[0], "stream">,
  onText: (textSoFar: string) => void,
  timeoutMs: number,
  isDone?: (textSoFar: string) => boolean,
): Promise<{ text: string; timedOut: boolean }> {
  let text = "";
  let timedOut = false;
  let stopped = false;
  let softTimer = 0;
  let hardTimer = 0;
  const consume = (async () => {
    const chunks = await e.chat.completions.create({ ...request, stream: true });
    for await (const chunk of chunks) {
      text += chunk.choices[0]?.delta?.content ?? "";
      onText(text);
      if (!stopped && isDone?.(text)) {
        stopped = true;
        e.interruptGenerate();
      }
    }
  })();
  const deadline = new Promise<"hard">((resolve) => {
    softTimer = window.setTimeout(() => {
      timedOut = true;
      e.interruptGenerate();
      hardTimer = window.setTimeout(() => resolve("hard"), INTERRUPT_GRACE_MS);
    }, timeoutMs);
  });
  try {
    const outcome = await Promise.race([untilGpuLost(consume), deadline]);
    if (outcome === "hard") hardReset();
  } finally {
    window.clearTimeout(softTimer);
    window.clearTimeout(hardTimer);
  }
  return { text, timedOut };
}

/** Ask Gemma for a challenge; retries once on rule-breaking output. */
export async function generateChallenge(
  req: CoachRequest,
  onProgress?: (textSoFar: string) => void,
): Promise<Challenge> {
  const e = await loadModel();
  const prompt = buildChallengePrompt(req);
  let timedOut = false;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = await streamText(
      e,
      {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: MAX_TOKENS,
      },
      (text) => onProgress?.(text),
      ATTEMPT_TIMEOUT_MS,
      isChallengeComplete,
    );
    timedOut ||= result.timedOut;
    const challenge = parseChallenge(result.text, req, `ai-${makeId()}`);
    if (challenge) return challenge;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[coach] rejected model output:", result.text);
    }
  }
  throw new Error(
    timedOut
      ? "Gemma is running slowly on this device. Try again, or pick one from the library."
      : "Gemma couldn't come up with a valid screen-free idea. Try again or use the library.",
  );
}

/** Stream a short reflection on a finished challenge. */
export async function streamReflection(
  input: Parameters<typeof buildReflectionPrompt>[0],
  onToken: (textSoFar: string) => void,
): Promise<string> {
  const e = await loadModel();
  const { text } = await streamText(
    e,
    {
      messages: [{ role: "user", content: buildReflectionPrompt(input) }],
      temperature: 0.7,
      max_tokens: 160,
    },
    onToken,
    ATTEMPT_TIMEOUT_MS,
  );
  return text.trim();
}
