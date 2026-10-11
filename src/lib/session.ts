const ADJECTIVES = [
  "Calm", "Brave", "Gentle", "Sunny", "Curious", "Steady", "Bright", "Cosy",
  "Bold", "Kind", "Quiet", "Lively", "Mellow", "Nimble", "Happy", "Wise",
];

const NOUNS = [
  "Otter", "Fern", "Sparrow", "Maple", "Panda", "River", "Fox", "Willow",
  "Koala", "Pebble", "Heron", "Cedar", "Robin", "Lotus", "Badger", "Comet",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomNickname(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

/** crypto.randomUUID is only available in secure contexts (not http://<LAN-IP>). */
export function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
