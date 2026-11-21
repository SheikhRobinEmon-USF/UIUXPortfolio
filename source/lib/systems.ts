/** Visual systems for each product, shown in the case studies. */
export type System = {
  palette: { name: string; hex: string; ink?: string }[];
  display: { family: string; css: string; sample: string };
  text: { family: string; css: string };
  radius: string;
  motion: string;
  principles: string[];
};

export const systems: Record<string, System> = {
  ecommerce: {
    palette: [
      { name: "Cream", hex: "#F4EEE4" },
      { name: "Espresso", hex: "#241812", ink: "#F4EEE4" },
      { name: "Clay", hex: "#A5512F", ink: "#fff" },
      { name: "Sand", hex: "#D7C5A9" },
      { name: "Paper", hex: "#FBF8F2" },
    ],
    display: { family: "Instrument Serif", css: '"Instrument Serif", serif', sample: "Objects for a quieter life." },
    text: { family: "Inter Tight", css: '"Inter Tight", sans-serif' },
    radius: "0 on web, 14 px on mobile",
    motion: "Slow, gallery-like easing; images scale on hover; a product image flies into the bag.",
    principles: ["Photography leads; chrome recedes", "Price impact of every option is visible", "Nothing irreversible without a clear review step"],
  },
  social: {
    palette: [
      { name: "Paper", hex: "#F6F5F0" },
      { name: "Ink", hex: "#14171A", ink: "#F6F5F0" },
      { name: "Lime", hex: "#D7F25C" },
      { name: "Lilac", hex: "#B9A6FF" },
      { name: "Coral", hex: "#FF7A59" },
    ],
    display: { family: "Space Grotesk", css: '"Space Grotesk", sans-serif', sample: "Find your kind of people." },
    text: { family: "Space Grotesk", css: '"Space Grotesk", sans-serif' },
    radius: "20 px cards, pill chips",
    motion: "Springy, playful feedback: heart bursts, sticker-like chips, story progress.",
    principles: ["Circles before follower counts", "Feedback is specific, not just likes", "Low-pressure posting"],
  },
  streaming: {
    palette: [
      { name: "Midnight", hex: "#08090C", ink: "#ECEBF5" },
      { name: "Slate", hex: "#141821", ink: "#ECEBF5" },
      { name: "Lilac", hex: "#A7A3F0" },
      { name: "Signal", hex: "#F05A4F", ink: "#fff" },
      { name: "Mist", hex: "#ECEBF5" },
    ],
    display: { family: "Syne", css: "Syne, sans-serif", sample: "Stories worth staying in for." },
    text: { family: "Inter Tight", css: '"Inter Tight", sans-serif' },
    radius: "8 px posters, 14 px panels",
    motion: "Cinematic: hover cards expand into previews, controls fade after inactivity.",
    principles: ["Let the footage sell the title", "Always show where you left off", "Remove decisions, not choice"],
  },
  health: {
    palette: [
      { name: "Sage", hex: "#EEF2EA" },
      { name: "Pine", hex: "#173D35", ink: "#EEF2EA" },
      { name: "Move", hex: "#FF6B4A", ink: "#fff" },
      { name: "Lime", hex: "#B8E04A" },
      { name: "Sky", hex: "#58C4F0" },
    ],
    display: { family: "DM Sans", css: '"DM Sans", sans-serif', sample: "Small steps. Better days." },
    text: { family: "DM Sans", css: '"DM Sans", sans-serif' },
    radius: "24 px, soft and friendly",
    motion: "Rings fill on launch, breathing animation paced to 4-7-8, gentle confetti on streaks.",
    principles: ["Encourage, never shame", "One tap to log the common things", "Trends over single numbers"],
  },
  finance: {
    palette: [
      { name: "Fog", hex: "#F3F5FA" },
      { name: "Navy", hex: "#0F1B3D", ink: "#F3F5FA" },
      { name: "Cobalt", hex: "#3A5EF0", ink: "#fff" },
      { name: "Mint", hex: "#2BC48A" },
      { name: "Alert", hex: "#E5484D", ink: "#fff" },
    ],
    display: { family: "Manrope", css: "Manrope, sans-serif", sample: "Make room for what matters." },
    text: { family: "JetBrains Mono (figures)", css: '"JetBrains Mono", monospace' },
    radius: "12 px web, 20 px mobile cards",
    motion: "Precise and calm: scrub-able charts, number roll-ups, biometric confirmation.",
    principles: ["Every number has a source", "Consequential actions get a review", "Tabular figures for scanning"],
  },
  food: {
    palette: [
      { name: "Cream", hex: "#FFF8EF" },
      { name: "Chili", hex: "#D6361F", ink: "#fff" },
      { name: "Tangerine", hex: "#FF8A3D" },
      { name: "Basil", hex: "#2F7D4F", ink: "#fff" },
      { name: "Char", hex: "#1E1410", ink: "#FFF8EF" },
    ],
    display: { family: "Bricolage Grotesque", css: '"Bricolage Grotesque", sans-serif', sample: "Good food, closer." },
    text: { family: "Bricolage Grotesque", css: '"Bricolage Grotesque", sans-serif' },
    radius: "18 px, chunky buttons",
    motion: "Appetising and quick: bouncy add-to-cart, a courier that moves along the route.",
    principles: ["Fees before the final screen", "Required choices are obvious", "Status is always one glance away"],
  },
  stays: {
    palette: [
      { name: "Linen", hex: "#F7F3EA" },
      { name: "Bark", hex: "#2E2820", ink: "#F7F3EA" },
      { name: "Terracotta", hex: "#C66A43", ink: "#fff" },
      { name: "Moss", hex: "#5B6B4A", ink: "#fff" },
      { name: "Sky", hex: "#A9C2C9" },
    ],
    display: { family: "Fraunces", css: "Fraunces, serif", sample: "Somewhere feels like you." },
    text: { family: "DM Sans", css: '"DM Sans", sans-serif' },
    radius: "16 px, generous whitespace",
    motion: "Unhurried: map pins lift on hover, galleries glide, calendars fill as you drag.",
    principles: ["Total price, everywhere", "Map and list never drift apart", "Dates, guests, then everything else"],
  },
};
