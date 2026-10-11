# Handoff: DOSE "Touch Grass" app (saved 2026-10-11, before system restart)

## Goal
Submit to the **DEV Hacktoberfest Open-Source AI Challenge, Week 1: "Touch Grass"**.
Deadline: **Oct 11, 2026, 11:59 PM PDT** (= Oct 12, 06:59 UTC). Tag: `#hf26challenge`.
Judging: writing quality (heaviest), relevance (open-source AI at the core + gets people outside),
creativity, technical execution. Optional partner prize: **Best Use of Gemma** ($200 featured).
Bonus points: actually do challenges outside and write how it went.

## What the app is
Next.js 16.4 (App Router, Turbopack, `cacheComponents: true`) + Tailwind v4 + shadcn/ui (Base UI) + zustand.
No backend/DB: everything is in localStorage (`dose-store`, version 2 with a v1→v2 migration).
Flow: `/` pick a chemical (Dopamine/Oxytocin/Serotonin/Endorphins/Surprise) → `/challenges`
(tabs: **AI coach** | **Library**) → `/timer` (chime + vibrate) → `/complete` (fun fact, optional
journal questionnaire, optional Gemma reflection) → `/journal` (stats incl. grass-vs-screen ratio).

## Done
- 48 curated outdoor challenges (`src/data/challenges.ts`), incl. "Touch Grass (Literally)".
- On-device AI coach: Gemma 3 1B (`gemma3-1b-it-q4f16_1-MLC`) via `@mlc-ai/web-llm@0.2.85`,
  running in a Web Worker (`src/lib/ai/llm.worker.ts`, `src/lib/ai/engine.ts`).
  Prompt/validation is pure and testable (`src/lib/ai/prompts.ts`): it rejects screen/phone/app
  words, salvages truncated JSON, and trims rambling fields.
- Coach inputs: place / company / energy / minutes, plus optional weather (Open-Meteo, coords rounded,
  `src/lib/weather.ts`). Live "✍️ title…" preview while generating.
- Screen-time tracking (`src/components/ClientBoot.tsx`), grass-vs-screen stat in the journal,
  per-entry "screen peeks".
- Offline service worker (`public/sw.js`, registered only in production).
- `next.config.ts`: `allowedDevOrigins` for LAN IPs (fixed pages stuck on skeletons at 192.168.x.x).
- lint, tsc and `npm run build` all pass.

## Fixes applied for WebLLM / Gemma issues
1. `sliding_window_size: -1` passed as chatOpts (WebLLM's prebuilt Gemma 3 record sets
   context_window_size 4096 AND the model sets sliding_window_size 512, which WebLLM rejects).
2. JSON-schema grammar **disabled** (`USE_JSON_SCHEMA=false`): under the grammar, Gemma 1B rambled until
   max_tokens and never closed the JSON. Now max_tokens 200, with stricter brevity rules in the prompt.
3. Timeouts: 90s per attempt → `interruptGenerate()`, then after 5s grace `hardReset()` terminates the
   worker and reloads from cache, so the UI can never spin forever.
4. Warm-up generation after load (`max_tokens: 1`, "Hi") to precompile shaders.
   ⚠️ SUSPECT: in a main-thread probe, the 1-token warm-up threw "Object has already been disposed".
   That probe ran on the already-bad cached profile (see open issue), so it's unconfirmed. Consider
   changing it to `max_tokens: 8` followed by `resetChat()`, or removing it.

## Session 2 (2026-10-11, after restart): coach fixed and verified end to end
- **Cache loading works after reboot** (loads in ~4s, no DEVICE_HUNG). The earlier hang was a bad
  GPU/driver state or a corrupted old profile, not caching itself.
- **Real root cause of the garbage output:** `sliding_window_size: -1`. With it, Gemma rambled, never
  emitted end-of-turn and wrote multiple JSON objects. Now chatOpts are
  `{ context_window_size: -1, sliding_window_size: 512, attention_sink_size: 0 }` → coherent output.
- **JSON dropped:** Gemma 1B skipped `steps` (and under a JSON grammar it padded whitespace until
  max_tokens). The prompt now asks for `Title: / Description: / 1. 2. 3.` lines (example first, marked
  "do not copy"). `parseLines()` tolerates `**Title:**`, `Step 1:`, `3:`, inline `Steps: 1. … 2. …`.
  The JSON parse is kept as a fallback, and `salvage()` no longer leaks keys into steps.
  `isChallengeComplete()` → `interruptGenerate()` as soon as step 3 is written. Temperature 0.8.
- **GPU-loss detection:** the worker wraps `GPUAdapter.prototype.requestDevice`, watches `device.lost`
  and posts on `BroadcastChannel("dose-gpu")` (`src/lib/ai/gpu-channel.ts`). The main thread
  terminates the worker, rejects pending load/generation (`untilGpuLost`) and shows an error with
  "Start coach" (no auto-reload loop).
- Warm-up is now `max_tokens: 4` + `resetChat()`.
- Verified with `ui2.mjs` (cached profile): 3/3 ideas in 19–34s each, one bad attempt recovered by the retry.
  Remaining: deploy over HTTPS, demo, go outside, DEV post.

## (Resolved) Earlier open issue, kept for context
Machine GPU: **Intel Iris Xe (integrated)**. Findings from a headless Chrome probe:
- **Fresh download → works** (~5 tok/s; valid JSON in ~25–35s).
- **Loading the model from the browser cache (an earlier test profile) → GPU hang**:
  `DXGI_ERROR_DEVICE_HUNG`, the first token is garbage (`<image_soft_token>`), WebLLM logs
  "Device was lost" and calls `unload()`. Any pending generation then waits forever.
  This matches the user's experience (downloaded, refreshed, loaded from cache).
- **Not yet determined:** is the cache corrupted (e.g. by interrupted/killed runs), or is loading from
  the cache always broken on this machine? Next test: rerun `probe.mjs` against the now-cached
  `profile-fresh` (test scripts in `%TEMP%\dose-e2e\`: `probe.mjs`, `probe2.mjs`, `ui.mjs`).
  Also possible: the GPU/driver was in a bad state after a 16-min hang. A reboot may clear that.

### Next steps after restart
1. In the browser: open DevTools → Application → Cache Storage, delete the `webllm/*` caches
   (or call `deleteModelAllInfoInCache`), then re-download and test "Create my challenge".
2. Then reload the page (it now loads from the cache) and test again. If it breaks only after a reload,
   set `appConfig.useIndexedDBCache = true` (needs `{...prebuiltAppConfig, useIndexedDBCache: true}`
   passed as `appConfig` in the engine config) and retest.
3. Add fast device-lost detection: in the worker, wrap `GPUAdapter.prototype.requestDevice` to watch
   `device.lost` (ignore reason "destroyed") and post over a `BroadcastChannel("dose-gpu")`. The main
   thread then calls `hardReset()` immediately and shows a clear error, instead of waiting 95s.
4. Re-verify end to end, then: deploy over HTTPS (WebGPU + geolocation need a secure context; phones on
   http://LAN-IP get the "coach unavailable" fallback and library mode), record a demo, go outside, and
   write the DEV post (why open: private on-device journal, works offline, free, swappable model).

## Running
`npm run dev` → http://localhost:3000. Dev-only shortcut: `/challenges?chem=serotonin&debug=1`
(minutes count as seconds). The project is not a git repo yet; consider `git init` plus a first commit.
