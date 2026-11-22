export const projects = [
  {
    slug: "ecommerce",
    label: "E-COMMERCE",
    name: "ATELIER",
    line: "Objects for a quieter life.",
    tag: "Editorial commerce",
    color: "#d7c5a9",
    ink: "#302b23",
    problem:
      "Finding something beautiful often takes too many steps and comparisons.",
    audience:
      "Intentional shoppers seeking everyday objects with lasting value.",
    hypothesis:
      "Material-led photography and persistent cart context may reduce decision friction.",
    persona:
      "Maya, 29, wants to compare materials and sizes without losing her place.",
    flow: [
      "Discover",
      "Filter & search",
      "Choose variant",
      "Review bag",
      "Checkout",
      "Confirmation",
    ],
    signature:
      "A product image flies into the bag; on mobile, swipe-to-pay guards the purchase.",
    tradeoff:
      "Editorial pacing trades some density for clarity; quick view keeps fast shoppers fast.",
  },
  {
    slug: "social",
    label: "SOCIAL",
    name: "COMMON",
    line: "Find your kind of people.",
    tag: "Creative communities",
    color: "#e5ed82",
    ink: "#182b26",
    problem:
      "High-volume feeds can make meaningful participation feel like work.",
    audience: "Creatives looking for small, supportive communities.",
    hypothesis:
      "Topic-first discovery and a low-pressure composer may encourage thoughtful contributions.",
    persona:
      "Alex, 24, wants feedback on a new illustration and a community that shares their interests.",
    flow: [
      "Browse feed",
      "Explore community",
      "Compose",
      "Publish",
      "Discuss",
      "Save",
    ],
    signature:
      "Critique posts collect feedback tagged by what it addresses — colour, composition, type.",
    tradeoff:
      "Circles before follower counts trades reach for relevance, especially for new members.",
  },
  {
    slug: "streaming",
    label: "STREAMING",
    name: "FRAME",
    line: "Stories worth staying in for.",
    tag: "Cinematic discovery",
    color: "#9a9dc7",
    ink: "#171923",
    problem:
      "Choosing what to watch can become more time-consuming than watching.",
    audience: "Viewers looking for a clear editorial recommendation.",
    hypothesis:
      "A cinematic featured title paired with concise metadata may aid faster selection.",
    persona: "Sam, 31, has one free evening and wants a documentary.",
    flow: [
      "Browse shelves",
      "Select genre",
      "Open title",
      "Watch",
      "Resume",
      "Save",
    ],
    signature:
      "Hover cards grow into previews; the player resumes exactly where you left off.",
    tradeoff:
      "Previews only on intent keep the interface calm and save bandwidth.",
  },
  {
    slug: "health",
    label: "HEALTH",
    name: "VITAL",
    line: "Small steps. Better days.",
    tag: "Personal wellness",
    color: "#afceb3",
    ink: "#173d35",
    problem: "Wellness data can feel overwhelming and judgmental.",
    audience: "People building sustainable daily routines.",
    hypothesis:
      "A daily timeline and nonjudgmental progress indicators may make logging feel approachable.",
    persona:
      "Jordan, 34, wants to build small habits around sleep and activity.",
    flow: [
      "Review today",
      "Log activity",
      "Track habits",
      "Set goals",
      "Explore trends",
      "Reflect",
    ],
    signature:
      "A live workout with simulated heart rate closes the rings in real time.",
    tradeoff:
      "Plain-language insights favour encouragement over clinical precision.",
  },
  {
    slug: "finance",
    label: "FINANCE",
    name: "MONETA",
    line: "Make room for what matters.",
    tag: "Personal finance",
    color: "#bdc8ed",
    ink: "#172947",
    problem:
      "Transaction lists rarely provide a clear connection to spending goals.",
    audience: "People who want to understand and plan their spending.",
    hypothesis:
      "Linked summaries and budget editing can make the impact of spending choices more legible.",
    persona: "Taylor, 27, wants to see where money goes and save for a trip.",
    flow: [
      "Review overview",
      "Filter transactions",
      "Inspect spending",
      "Edit budget",
      "Create goal",
      "Review",
    ],
    signature:
      "A scrub-able net-worth chart, and transfers confirmed with a biometric step.",
    tradeoff:
      "A deliberate review step adds friction exactly where mistakes are costly.",
  },
  {
    slug: "food",
    label: "FOOD",
    name: "CRAVE",
    line: "Good food, closer.",
    tag: "Local food delivery",
    color: "#f3a45d",
    ink: "#4a2319",
    problem:
      "Unclear customization and delivery estimates create uncertainty at checkout.",
    audience: "Busy diners seeking a quick, transparent order.",
    hypothesis:
      "Visible meal extras, totals and status milestones may increase confidence.",
    persona:
      "Riley, 26, wants dinner delivered after work with specific toppings.",
    flow: [
      "Discover restaurants",
      "Select cuisine",
      "Open menu",
      "Customize",
      "Checkout",
      "Track",
    ],
    signature:
      "Required choices validate in the dish sheet; a courier glides along the live route.",
    tradeoff:
      "A staged timeline plus an illustrative map is more honest than fake GPS precision.",
  },
  {
    slug: "stays",
    label: "STAYS",
    name: "ROAM",
    line: "Somewhere feels like you.",
    tag: "Slow travel & stays",
    color: "#e0c4ac",
    ink: "#352d23",
    problem:
      "Travelers need to compare location, availability and prices without losing context.",
    audience: "Independent travelers looking for distinctive stays.",
    hypothesis:
      "Linked map and list views plus transparent nightly pricing may support confident booking.",
    persona: "Casey, 32, wants a peaceful weekend for two with a clear budget.",
    flow: [
      "Search destination",
      "Choose dates",
      "Compare map",
      "Open stay",
      "Review price",
      "Reserve",
    ],
    signature:
      "Total-price pins on a linked map, and a calendar that won't let you cross a booked night.",
    tradeoff:
      "An illustrative map keeps the demo deterministic without pretending to live geography.",
  },
] as const;
export type Project = (typeof projects)[number];
export const asset = (name: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/${name}`;
export const route = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;

export function projectArtwork(slug: string) {
  const src = asset(slug + ".webp");
  const width = ["finance", "food", "stays"].includes(slug) ? 762 : 881;
  return {
    src,
    srcSet: `${asset(slug + "-mobile.webp")} 460w, ${asset(slug + "-tablet.webp")} 680w, ${src} ${width}w`,
  };
}
