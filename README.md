# 🌱 DOSE: Touch Grass

**An on-device AI coach that gets you off your phone and outside.**

Pick the feel-good chemical you're craving (**D**opamine, **O**xytocin, **S**erotonin or **E**ndorphins), and DOSE gives you a short screen-free challenge to do outdoors. A timer runs while you're out, and a private journal keeps track of how it went.

The coach is **Gemma 3 1B running entirely in your browser** through WebGPU. There are no API keys, no server and no account, and your journal never leaves your device.

> Built for the [DEV Hacktoberfest Open-Source AI Challenge](https://dev.to/challenges), Week 1: *Touch Grass* · `#hf26challenge`

**Live demo:** _add your Vercel URL here_ · **Write-up:** _add your DEV post here_

---

## Why open-source AI?

An app that wants you to put your phone down shouldn't send your mood journal to a cloud API.

- **Private:** inference runs locally, so your mood, energy and journal stay in `localStorage`.
- **Free:** there are no per-token costs, so anyone can fork it and host it for $0.
- **Works offline:** once the model (~700 MB) is cached, the coach works on a trail with no signal.
- **Swappable:** the model is a single constant (`MODEL_ID` in `src/lib/ai/engine.ts`). Any WebLLM-compatible open model fits.

## Features

- 🧪 **Four chemicals plus "Surprise me"**, each with a curated library of 48 outdoor challenges (including "Touch Grass (Literally)").
- 🤖 **AI coach:** you tell it where you are, who you're with, your energy level and how many minutes you have. You can also add the current weather (Open-Meteo, with coordinates rounded). Gemma then writes a challenge made for that moment, and the title streams in live as it's generated.
- 🛡️ **Guard rails:** a challenge that mentions screens, phones or apps is rejected, and so is malformed output. The coach retries automatically.
- ⏱️ **Timer** with a chime and vibration that rings on time even in a background tab.
- 📓 **Journal** with an optional reflection questionnaire, a Gemma-written reflection, per-chemical stats and a **grass vs. screen ratio**. That ratio comes from tracking how often you peeked at the app during a challenge.
- 📴 **Offline-first:** a service worker caches the app shell, and WebLLM caches the model weights.
- 📱 **Graceful fallback:** browsers without WebGPU get the full challenge library without the coach.

## How it works

```
/            pick a chemical
/challenges  AI coach tab  ──►  Web Worker ─► WebLLM ─► Gemma 3 1B (WebGPU)
             Library tab   ──►  src/data/challenges.ts
/timer       countdown, chime + vibrate
/complete    fun fact, journal questionnaire, optional AI reflection
/journal     stats and history (all in localStorage)
```

| Piece | Where |
| --- | --- |
| Model loading, timeouts, hard reset | `src/lib/ai/engine.ts` |
| Inference worker (off the main thread) | `src/lib/ai/llm.worker.ts` |
| GPU device-lost detection | `src/lib/ai/gpu-channel.ts` |
| Prompts, parsing, validation (pure, testable) | `src/lib/ai/prompts.ts` |
| Weather context | `src/lib/weather.ts` |
| State (zustand, persisted to `localStorage`) | `src/lib/store.ts` |
| Screen-time tracking, SW registration | `src/components/ClientBoot.tsx` |
| Offline service worker | `public/sw.js` |

### What it took to get a 1B model to behave in a browser

Small models are fragile. Getting reliable output took these fixes:

- **Sliding-window attention:** WebLLM's prebuilt Gemma 3 record conflicts with the model's 512-token sliding window. Turning the window off made Gemma ramble and never stop. The fix is `{ context_window_size: -1, sliding_window_size: 512, attention_sink_size: 0 }`.
- **No JSON mode:** under a JSON-schema grammar, Gemma 1B padded whitespace until it hit `max_tokens`. Instead, the prompt asks for plain `Title: / Description: / 1. 2. 3.` lines. A tolerant parser handles `**Title:**`, `Step 1:` and inline steps, with JSON salvage as a fallback. Generation stops as soon as step 3 is written.
- **Never spin forever:** each attempt times out after 90 s and is interrupted. After a 5 s grace period the worker is terminated and the model reloads from the cache. A `GPUDevice.lost` watcher reports driver resets right away over a `BroadcastChannel`.
- **Shader warm-up:** a 4-token generation after load, followed by `resetChat()`, makes the first real request fast.

## Run locally

Requirements: Node 20+ and a WebGPU browser (Chrome or Edge 113+, or recent Safari) to try the coach.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build (enables the service worker)
npm run lint
```

- The first click on **Start coach** downloads about 700 MB once. Later visits load from the browser cache in a few seconds.
- WebGPU and geolocation need a **secure context**. `localhost` counts as one, but `http://192.168.x.x` from your phone doesn't, so phones on your LAN only get library mode. To test the coach on a phone, use the HTTPS deployment.
- **Quick timer testing (dev only):** `/challenges?chem=serotonin&debug=1` makes minutes count as seconds.

## Editing content

| What | File |
| --- | --- |
| Challenge library | `src/data/challenges.ts` |
| Chemical names, colours, fun facts | `src/data/chemicals.ts` |
| Coach options (place, company, energy) | `src/data/coach.ts` |
| Journal questionnaire | `src/data/questionnaire.ts` |

Every challenge must be screen-free, need no special equipment and set `defaultMinutes` between 15 and 45 (in steps of 5). Each `id` must be unique and stable, because journal entries refer to it. A missing id shows up as "Retired challenge".

## Tech stack

Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI) · zustand · [WebLLM](https://github.com/mlc-ai/web-llm) · [Gemma 3](https://ai.google.dev/gemma) · [Open-Meteo](https://open-meteo.com/)

## Contributing

Issues and PRs are welcome, especially for new challenges, better prompts or support for other small open models. Please run `npm run lint` and `npm run build` before opening a PR.

## License

MIT. Gemma is subject to the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).

---

*Now close this tab and go outside.* 🌿
