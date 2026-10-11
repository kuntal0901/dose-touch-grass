// Time's-up alert built on the Web Audio API — no audio files needed.
//
// Browsers only allow audio after a user gesture, so `unlockAudio()` must be
// called from the "Start" click. We then *pre-schedule* the chime on the audio
// clock: it plays on time even if the tab is in the background and JS timers
// are throttled.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const NOTES = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
const REPEATS = 3;

let ctx: AudioContext | null = null;
let scheduled: { endsAt: number; nodes: OscillatorNode[] } | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function scheduleNotes(c: AudioContext, startAt: number): OscillatorNode[] {
  const nodes: OscillatorNode[] = [];
  for (let r = 0; r < REPEATS; r++) {
    NOTES.forEach((freq, i) => {
      const t = startAt + r * 1.6 + i * 0.18;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 1.25);
      nodes.push(osc);
    });
  }
  return nodes;
}

/** Call inside a click handler to satisfy browser autoplay rules. */
export function unlockAudio() {
  const c = getContext();
  if (!c) return;
  void c.resume().catch(() => {});
  // A silent blip fully unlocks audio on iOS Safari.
  const osc = c.createOscillator();
  const gain = c.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.05);
}

/** Pre-schedule the chime to ring at `endsAt` (epoch ms). */
export function scheduleChime(endsAt: number) {
  cancelChime();
  const c = getContext();
  if (!c) return;
  const delay = (endsAt - Date.now()) / 1000;
  if (delay <= 0) return;
  scheduled = { endsAt, nodes: scheduleNotes(c, c.currentTime + delay) };
}

export function cancelChime() {
  scheduled?.nodes.forEach((n) => {
    try {
      n.stop();
    } catch {
      // already stopped
    }
  });
  scheduled = null;
}

/** Ring now, unless a pre-scheduled chime for this timer is already playing. */
export function playChime(endsAt?: number) {
  const c = getContext();
  if (!c) return;
  if (scheduled && scheduled.endsAt === endsAt && c.state === "running") {
    scheduled = null;
    return;
  }
  scheduled = null;
  c.resume()
    .then(() => scheduleNotes(c, c.currentTime + 0.05))
    .catch(() => {});
}

export function vibrate() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([300, 150, 300, 150, 300]);
  }
}
