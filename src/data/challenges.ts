import type { ChemicalId } from "./chemicals";

export type Challenge = {
  id: string;
  chemical: ChemicalId;
  title: string;
  description: string;
  steps: string[];
  /** Suggested duration in minutes (15–45). Users can adjust it. */
  defaultMinutes: number;
  /** "library" = curated below, "ai" = generated on-device by Gemma. */
  source?: "library" | "ai";
};

export const MIN_MINUTES = 15;
export const MAX_MINUTES = 45;
export const MINUTE_STEP = 5;

/**
 * Curated "touch grass" library. Every challenge gets you outside (a park, a
 * street, a garden or at least a balcony), is screen-free, takes 15–45 minutes
 * and needs no special equipment. AI-drafted — review and edit freely.
 */
export const CHALLENGES: Challenge[] = [
  // ───────────── Dopamine (achievement) ─────────────
  {
    id: "dop-litter-mission",
    chemical: "dopamine",
    title: "Litter Pick Mission",
    description: "Pick up 20 pieces of litter on your street or in a nearby park. Small mission, visible result.",
    steps: [
      "Grab a bag (and gloves if you have them).",
      "Head out and count every piece you pick up.",
      "Hit 20, bin it and look back at the cleaner patch.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-scavenger-hunt",
    chemical: "dopamine",
    title: "Nature Scavenger Hunt",
    description: "Find all ten: something red, a feather, a Y-shaped stick, a heart-shaped leaf, moss, a seed, a smooth stone, a bird, a flower and an insect.",
    steps: [
      "Memorise or jot down the list on paper.",
      "Walk somewhere green and hunt.",
      "Tick each one off. Leave everything where you found it.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "dop-a-to-z-walk",
    chemical: "dopamine",
    title: "A-to-Z Outdoor Walk",
    description: "Walk and spot something outdoors for every letter of the alphabet, from Acorn to Zebra crossing.",
    steps: [
      "Start walking. Look for an A.",
      "Work through the alphabet in order.",
      "Stuck on Q, X or Z? Get creative — they count double.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-new-route",
    chemical: "dopamine",
    title: "Unknown Street Explorer",
    description: "Walk down a street or path near you that you've never taken, and find three things you didn't know were there.",
    steps: [
      "Pick a direction you never go.",
      "Walk without a map for 10 minutes.",
      "Find 3 new things: a shop, a tree, a mural, a view.",
      "Find your way back from memory.",
    ],
    defaultMinutes: 30,
  },
  {
    id: "dop-tree-sketch",
    chemical: "dopamine",
    title: "Sketch a Tree Three Times",
    description: "Sit in front of a tree and draw it three times, each version better than the last.",
    steps: [
      "Find a tree and a spot to sit.",
      "Quick sketch in 3 minutes.",
      "Slower sketch: trunk, branches, the shape of the leaves.",
      "Final version. Compare all three.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-paper-plane",
    chemical: "dopamine",
    title: "Park Paper Plane Record",
    description: "Take a few sheets of paper to an open space and beat your own paper airplane distance record.",
    steps: [
      "Fold a classic dart plane and throw it. Pace out the distance.",
      "Tweak it: wing folds, nose weight, flaps.",
      "Beat your first distance. Take all planes home with you.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-plant-seeds",
    chemical: "dopamine",
    title: "Plant Something",
    description: "Plant seeds, a cutting or bulbs in a pot, a garden bed or a window box. Future-you gets a reward.",
    steps: [
      "Use what you have: kitchen seeds (tomato, pepper), a herb cutting or bulbs.",
      "Fill a pot or patch with soil and plant it.",
      "Water it and pick a spot with good light.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-read-outside",
    chemical: "dopamine",
    title: "20 Pages on a Bench",
    description: "Take a physical book or magazine outside and read 20 pages on a bench, a step or the grass.",
    steps: [
      "Pick a printed book and an outdoor spot.",
      "Note your starting page.",
      "Read until you hit +20 pages.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "dop-stone-stack",
    chemical: "dopamine",
    title: "Balanced Stone Stack",
    description: "Balance the tallest stack of stones you can. It's surprisingly absorbing.",
    steps: [
      "Collect flat stones (loose ones only — don't dig).",
      "Stack them, find each balance point, rebuild when it falls.",
      "Admire your best stack, then return the stones where you found them.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-garden-tidy",
    chemical: "dopamine",
    title: "Outdoor Space Reset",
    description: "Choose one outdoor patch — a balcony, doorstep, garden bed or shared entrance — and make it spotless.",
    steps: [
      "Sweep, pull weeds, or rake leaves.",
      "Clear away anything that doesn't belong.",
      "Step back and admire it.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "dop-map-memory",
    chemical: "dopamine",
    title: "Map Your Block",
    description: "Draw a map of your neighbourhood from memory, then walk it to check how right you were.",
    steps: [
      "Sketch your streets, landmarks and shortcuts from memory.",
      "Walk the loop with your map in hand.",
      "Correct it with a different-coloured pen.",
    ],
    defaultMinutes: 30,
  },
  {
    id: "dop-sky-count",
    chemical: "dopamine",
    title: "Bird Tally",
    description: "Count as many different birds as you can in one spot. Size, colour and song all count as clues.",
    steps: [
      "Sit or stand somewhere with trees or water.",
      "Tally each different bird you see or hear.",
      "Beat your score next time.",
    ],
    defaultMinutes: 20,
  },

  // ───────────── Oxytocin (connection) ─────────────
  {
    id: "oxy-walk-talk",
    chemical: "oxytocin",
    title: "Walk-and-Talk",
    description: "Invite a friend, family member or housemate for a walk and ask three questions you've never asked them.",
    steps: [
      "Phones stay in pockets.",
      "Try: \"What's a moment you felt really proud?\"",
      "Listen fully — no interrupting.",
    ],
    defaultMinutes: 30,
  },
  {
    id: "oxy-hand-delivered",
    chemical: "oxytocin",
    title: "Hand-Delivered Thank You",
    description: "Write a handwritten note of appreciation and walk it over to them (or to a postbox).",
    steps: [
      "Write a specific memory or quality you appreciate.",
      "Walk to deliver it — doorstep, letterbox or postbox.",
      "Enjoy the walk back.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "oxy-neighbour-hello",
    chemical: "oxytocin",
    title: "Neighbourhood Hello",
    description: "Walk your street and have a real conversation with a neighbour, a shopkeeper or someone at the park.",
    steps: [
      "Head out with the intention of chatting.",
      "Start simple: a compliment or a question about their dog or garden.",
      "Learn one thing about them.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "oxy-picnic",
    chemical: "oxytocin",
    title: "Mini Picnic",
    description: "Pack a simple snack and share it outside with someone — a park, a step, a balcony.",
    steps: [
      "Pack something simple: fruit, tea, sandwiches.",
      "Invite someone and head outside.",
      "Talk about the best and hardest part of your week.",
    ],
    defaultMinutes: 30,
  },
  {
    id: "oxy-dog-walk",
    chemical: "oxytocin",
    title: "Dog Walk",
    description: "Take your dog — or offer to take a neighbour's — for a walk with your full attention on them.",
    steps: [
      "Leave headphones at home.",
      "Let the dog choose the pace and sniff stops.",
      "No dog? Visit a park and watch dogs play.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "oxy-kindness-mission",
    chemical: "oxytocin",
    title: "Outdoor Kindness Mission",
    description: "Do something kind outside: rake a neighbour's leaves, carry someone's shopping, water a shared plant.",
    steps: [
      "Look for something someone else would appreciate.",
      "Do it quietly and well.",
      "Notice how it feels to give without credit.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "oxy-call-walk",
    chemical: "oxytocin",
    title: "Old-Friend Phone Walk",
    description: "Call someone you miss while walking outside. Phone in your pocket on speaker or earpiece — no screen.",
    steps: [
      "Start walking, then call.",
      "Put the phone away; just voices.",
      "Ask how they really are — and share something real too.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "oxy-play-outside",
    chemical: "oxytocin",
    title: "Play Like a Kid",
    description: "Play an outdoor game with someone: catch, frisbee, hopscotch, tag, or kicking a ball around.",
    steps: [
      "Grab anything throwable and someone to play with.",
      "Make up silly rules.",
      "Focus on laughing, not winning.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "oxy-metta-walk",
    chemical: "oxytocin",
    title: "Loving-Kindness Walk",
    description: "Walk somewhere with people and silently wish each person you pass something good.",
    steps: [
      "Walk at an easy pace.",
      "For each person you pass, think: \"May you be happy. May you be at ease.\"",
      "Include yourself at the end.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "oxy-sunset-together",
    chemical: "oxytocin",
    title: "Watch the Sky Change Together",
    description: "Watch a sunrise, sunset or passing clouds with someone, side by side.",
    steps: [
      "Find a spot with open sky.",
      "Sit close, phones away.",
      "Share one thing you're grateful for each.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "oxy-feed-birds",
    chemical: "oxytocin",
    title: "Gentle Animal Time",
    description: "Spend quiet time with animals outside: watch ducks, birds, squirrels or a friendly cat.",
    steps: [
      "Find a park, pond or garden.",
      "Sit still and give them your full, gentle attention.",
      "Notice how your body relaxes.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "oxy-park-letters",
    chemical: "oxytocin",
    title: "People Who Shaped Me",
    description: "Sit outside and write five names of people who helped you, with one sentence about what each gave you.",
    steps: [
      "Take paper and pen to a bench or step.",
      "Write their names and one specific gift they gave you.",
      "Circle one person to thank this week.",
    ],
    defaultMinutes: 15,
  },

  // ───────────── Serotonin (mood & calm) ─────────────
  {
    id: "ser-touch-grass",
    chemical: "serotonin",
    title: "Touch Grass (Literally)",
    description: "Take your shoes off and stand, walk or lie on real grass. Notice five different textures.",
    steps: [
      "Find a patch of grass (check it's clear).",
      "Shoes off. Stand still for 10 slow breaths.",
      "Walk slowly and notice 5 textures under your feet.",
      "Lie down and watch the sky for the last few minutes.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-daylight-walk",
    chemical: "serotonin",
    title: "Headphone-Free Daylight Walk",
    description: "Walk in natural light without headphones, focusing entirely on your breath and surroundings.",
    steps: [
      "Leave headphones at home.",
      "Walk at a comfortable pace in daylight.",
      "Notice 5 things you see, 4 you hear, 3 you feel.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "ser-gratitude-sun",
    chemical: "serotonin",
    title: "Sunlit Gratitude",
    description: "Sit somewhere sunny outside and write three good things from the past day.",
    steps: [
      "Find the brightest outdoor spot you can.",
      "Write three good things, big or small.",
      "For each, write why it happened.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-tree-study",
    chemical: "serotonin",
    title: "Adopt a Tree",
    description: "Pick one tree near you and get to know it: its bark, leaves, visitors and how it moves in the wind.",
    steps: [
      "Choose a tree you pass often.",
      "Touch the bark, look closely at a leaf, look up through the branches.",
      "Notice who lives on it: birds, insects, moss.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-outdoor-tea",
    chemical: "serotonin",
    title: "Tea Outside",
    description: "Make a warm drink and take it outside — balcony, doorstep or bench — and sip it without doing anything else.",
    steps: [
      "Make your drink slowly and attentively.",
      "Take it outside.",
      "Sip slowly. Just sip and look around.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-grass-scan",
    chemical: "serotonin",
    title: "Lie-on-the-Grass Body Scan",
    description: "Lie on the grass (or a blanket) and slowly scan your body from head to toe.",
    steps: [
      "Box breathe: in 4, hold 4, out 4, hold 4 — for 3 minutes.",
      "Move attention slowly from your head to your toes.",
      "Feel the ground holding you up.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-nature-mandala",
    chemical: "serotonin",
    title: "Nature Mandala",
    description: "Arrange fallen leaves, petals, twigs and stones into a circular pattern on the ground.",
    steps: [
      "Collect fallen things only.",
      "Start with a centrepiece and build rings outward.",
      "Leave it for someone else to find.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "ser-cloud-gaze",
    chemical: "serotonin",
    title: "Sky Watching",
    description: "Lie or sit outside and simply watch the sky — clouds, birds, light changing.",
    steps: [
      "Get comfortable with a view of the sky.",
      "Find shapes in the clouds.",
      "When your mind wanders, gently return to the sky.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-slow-walk",
    chemical: "serotonin",
    title: "Slow-Motion Walk",
    description: "Practise walking meditation outside, taking each step as slowly and deliberately as you can.",
    steps: [
      "Choose a 20-step path in a park or garden.",
      "Lift, move and place each foot with full attention.",
      "Turn around slowly and repeat.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-sound-map",
    chemical: "serotonin",
    title: "Sound Map",
    description: "Sit outside with paper, close your eyes and map every sound you hear around you.",
    steps: [
      "Draw yourself as a dot in the middle of the page.",
      "Close your eyes. Mark each sound where it comes from.",
      "Notice which sounds are nature and which are human.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-sunlight-stretch",
    chemical: "serotonin",
    title: "Sunlight Stretch",
    description: "Stretch gently outside in natural light — garden, park or balcony.",
    steps: [
      "Face the light and reach your arms overhead.",
      "Flow through neck rolls, side bends and forward folds.",
      "Hold each stretch for 5 slow breaths.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "ser-worry-walk",
    chemical: "serotonin",
    title: "Worry Walk",
    description: "Write your worries on paper, then take a walk and think about one kind next step for each.",
    steps: [
      "Write every worry, no filter.",
      "Walk with the list in your pocket.",
      "For each worry, decide one small, kind next step.",
    ],
    defaultMinutes: 25,
  },

  // ───────────── Endorphins (exertion) ─────────────
  {
    id: "end-park-circuit",
    chemical: "endorphins",
    title: "Park Bench Circuit",
    description: "Use a park bench for a quick circuit: step-ups, incline push-ups, dips and squats.",
    steps: [
      "3 rounds: 10 step-ups each leg, 10 incline push-ups, 10 dips, 15 squats.",
      "Rest 1 minute between rounds.",
      "Finish with a slow walk and stretch.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "end-hill-repeats",
    chemical: "endorphins",
    title: "Hill or Stair Repeats",
    description: "Find a hill or outdoor stairs and climb it fast, walk down slow, repeat.",
    steps: [
      "Walk 3 minutes to warm up.",
      "Climb quickly, walk back down. Repeat 6–8 times.",
      "Cool down with calf stretches.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "end-walk-run",
    chemical: "endorphins",
    title: "Walk-Run Intervals",
    description: "Alternate brisk walking and easy jogging (or fast walking) outdoors.",
    steps: [
      "Walk 5 minutes to warm up.",
      "Alternate 1 minute jog / 2 minutes brisk walk.",
      "Walk the last 5 minutes to cool down.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "end-leaf-raking",
    chemical: "endorphins",
    title: "Leaf Pile Workout",
    description: "Rake leaves hard — your garden, a neighbour's or a shared path. Then jump in the pile.",
    steps: [
      "Grab a rake (or a broom).",
      "Rake at full effort, switching sides every few minutes.",
      "Jump in the pile. Rake it up again.",
    ],
    defaultMinutes: 25,
  },
  {
    id: "end-laughter",
    chemical: "endorphins",
    title: "Outdoor Laughter Session",
    description: "Laughter yoga outside: start with fake laughter until it turns real. Better with a friend.",
    steps: [
      "Stand up, clap rhythmically and say \"ho-ho, ha-ha-ha\".",
      "Force a big laugh for 30 seconds. Repeat.",
      "Recall your funniest memory and let it rip.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "end-sun-salutes",
    chemical: "endorphins",
    title: "Sun Salutations in the Sun",
    description: "Ten rounds of sun salutations on the grass, then a long full-body stretch.",
    steps: [
      "Reach up, fold down, step back to plank.",
      "Lower, lift into cobra, push back to downward dog.",
      "Step forward and rise. Repeat 10 times, then stretch.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "end-playground",
    chemical: "endorphins",
    title: "Playground Workout",
    description: "Use a playground or outdoor gym: hangs, monkey bars, step-ups, balance beams.",
    steps: [
      "Hang from a bar for as long as you can.",
      "Rotate through 5 different pieces of equipment.",
      "Do 3 rounds, resting between.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "end-singing-walk",
    chemical: "endorphins",
    title: "Singing Walk",
    description: "Walk a quiet path and sing your favourite songs out loud. Bonus points for a friend harmonising.",
    steps: [
      "Pick 4–5 songs you know by heart.",
      "Sing them full-voice while walking briskly.",
      "Add dramatic arm gestures on the chorus.",
    ],
    defaultMinutes: 20,
  },
  {
    id: "end-jump-pyramid",
    chemical: "endorphins",
    title: "Jumping Jack Pyramid",
    description: "Outside on the grass: 10, 20, 30, 40, 30, 20, 10 jumping jacks with short rests.",
    steps: [
      "Rest 30 seconds between sets.",
      "Low-impact option: step-jacks.",
      "Finish with a minute of deep breathing in fresh air.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "end-shadowbox",
    chemical: "endorphins",
    title: "Shadowboxing in the Park",
    description: "Throw punches at the air in 2-minute rounds. Fast, fun and great for stress.",
    steps: [
      "Stand with soft knees, fists up.",
      "Jab, cross, hook, uppercut — 2 minutes on, 1 minute off.",
      "Do 5 rounds.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "end-animal-moves",
    chemical: "endorphins",
    title: "Animal Moves on Grass",
    description: "Bear crawls, crab walks, frog jumps and inchworms across the grass. Silly and surprisingly tough.",
    steps: [
      "30 seconds each: bear crawl, crab walk, frog jumps, inchworms.",
      "Rest 30 seconds after each set of four.",
      "Repeat 4 times.",
    ],
    defaultMinutes: 15,
  },
  {
    id: "end-power-walk",
    chemical: "endorphins",
    title: "Power Walk Loop",
    description: "A fast, arms-swinging walk on a loop route. Aim to be slightly out of breath.",
    steps: [
      "Pick a loop of about 2–3 km.",
      "Walk fast, swinging your arms.",
      "Push the pace for the final 5 minutes.",
    ],
    defaultMinutes: 30,
  },
];

export const CHALLENGES_BY_ID: Record<string, Challenge> = Object.fromEntries(
  CHALLENGES.map((c) => [c.id, { ...c, source: "library" as const }]),
);

export function challengesFor(chemical: ChemicalId | "random"): Challenge[] {
  return chemical === "random"
    ? CHALLENGES
    : CHALLENGES.filter((c) => c.chemical === chemical);
}
