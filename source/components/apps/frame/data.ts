"use client";

import { asset } from "../../../lib/projects";
import { useStore } from "../../kit/store";

export type Episode = { id: string; n: number; title: string; desc: string; src: string; vtt: string; still: string; dur: number };
export type Title = {
  id: string;
  name: string;
  kind: "Series" | "Film" | "Documentary";
  genres: string[];
  year: number;
  rating: "All ages" | "13+" | "16+";
  match: number;
  runtime: string;
  synopsis: string;
  cast: string[];
  still: string;
  tone: string;
  episodes: Episode[];
  isNew?: boolean;
  top?: number;
  comingSoon?: string;
};

const a = asset;
const eps = (base: string, titles: [string, string][]) =>
  titles.map(([t, d], i) => ({ id: `${base}-${i}`, n: i + 1, title: t, desc: d, src: a(`${base}-${i}.mp4`), vtt: a(`${base}-${i}.vtt`), still: a(`still-${base}-${i}.webp`), dur: 6 }));

export const titles: Title[] = [
  {
    id: "earth",
    name: "The Quiet Earth",
    kind: "Series",
    genres: ["Documentary", "Nature"],
    year: 2026,
    rating: "All ages",
    match: 98,
    runtime: "3 episodes",
    synopsis: "A meditative journey through remote landscapes, and the small lives that keep them turning. Filmed over four seasons with no narration — only wind, water and light.",
    cast: ["Narration-free", "Dir. Ines Valk"],
    still: a("still-earth-0.webp"),
    tone: "#c27a3a",
    episodes: eps("earth", [["First Light", "Dawn over a mountain lake, and a cabin waking up."], ["The Long Afternoon", "Smoke, pines and the slow arithmetic of firewood."], ["Lake Effect", "Mist rolls in; everything goes quiet."]]),
    top: 1,
  },
  {
    id: "rain",
    name: "After the Rain",
    kind: "Series",
    genres: ["Drama", "Mystery"],
    year: 2026,
    rating: "13+",
    match: 94,
    runtime: "3 episodes",
    synopsis: "A glass house in the forest, a family that stopped talking, and the storm that forces them to. A slow-burn drama about what's left when the weather clears.",
    cast: ["Mara Lind", "Joel Okafor", "Sun-Hee Park"],
    still: a("still-rain-0.webp"),
    tone: "#d39a4c",
    episodes: eps("rain", [["The Glass House", "Ada arrives at dusk with nowhere else to go."], ["Undercurrent", "Old letters surface in the library."], ["Clearing", "The storm passes. Not everyone stays."]]),
    isNew: true,
    top: 2,
  },
  {
    id: "orbit",
    name: "In Orbit",
    kind: "Series",
    genres: ["Sci-fi", "Thriller"],
    year: 2025,
    rating: "16+",
    match: 91,
    runtime: "3 episodes",
    synopsis: "Stranded on a moon at the edge of the system, a lone surveyor has 40 hours of oxygen and one impossible signal coming from the fog.",
    cast: ["Abel Strand", "Noor Haddad"],
    still: a("still-orbit-0.webp"),
    tone: "#6aa3c9",
    episodes: eps("orbit", [["Signal", "The beacon wasn't meant to answer."], ["Fog Line", "Visibility: zero. Oxygen: falling."], ["Return Window", "One chance to launch."]]),
    top: 3,
  },
  {
    id: "blue",
    name: "Blue Hour",
    kind: "Documentary",
    genres: ["Documentary", "Wellness"],
    year: 2026,
    rating: "All ages",
    match: 89,
    runtime: "3 episodes",
    synopsis: "Movement teachers from around the world share the practices that help them slow down — filmed entirely in the minutes between day and night.",
    cast: ["Lea Moreau", "Kaveh Amini"],
    still: a("still-blue-0.webp"),
    tone: "#8aa07a",
    episodes: eps("blue", [["Breath", "Starting with the simplest thing."], ["Balance", "Holding still is a skill."], ["Release", "Letting the day go."]]),
    isNew: true,
  },
  {
    id: "smash",
    name: "Smash",
    kind: "Documentary",
    genres: ["Documentary", "Food"],
    year: 2026,
    rating: "All ages",
    match: 87,
    runtime: "1h 32m",
    synopsis: "Inside the obsessive, greasy, joyful world of competitive burger cooks — and one diner fighting to keep its counter open.",
    cast: ["Dir. Ray Coulter"],
    still: a("food.webp"),
    tone: "#c4471f",
    episodes: eps("earth", [["Smash", "Feature preview"]]).map((e) => ({ ...e, id: "smash-0", title: "Smash", still: a("food.webp") })),
    top: 4,
  },
  {
    id: "margins",
    name: "Margins",
    kind: "Film",
    genres: ["Drama", "Romance"],
    year: 2025,
    rating: "13+",
    match: 85,
    runtime: "1h 51m",
    synopsis: "A book editor finds notes in the margins of second-hand novels — and starts writing back.",
    cast: ["Ama Mensah", "Theo Grant"],
    still: a("social.webp"),
    tone: "#7d2a3a",
    episodes: eps("rain", [["Margins", "Feature preview"]]).map((e) => ({ ...e, id: "margins-0", title: "Margins", still: a("social.webp") })),
  },
  {
    id: "arch",
    name: "The Blue Arch",
    kind: "Film",
    genres: ["Thriller", "Crime"],
    year: 2026,
    rating: "16+",
    match: 90,
    runtime: "2h 04m",
    synopsis: "A heist inside the world's most secure vault — planned in plain sight, by someone who designed it.",
    cast: ["Iris Vey", "Marco Bellini"],
    still: a("finance.webp"),
    tone: "#2a4ac9",
    episodes: eps("orbit", [["The Blue Arch", "Feature preview"]]).map((e) => ({ ...e, id: "arch-0", title: "The Blue Arch", still: a("finance.webp") })),
    isNew: true,
    top: 5,
  },
  {
    id: "desert",
    name: "Casa Sol",
    kind: "Film",
    genres: ["Drama", "Family"],
    year: 2027,
    rating: "All ages",
    match: 88,
    runtime: "1h 40m",
    synopsis: "Three estranged sisters inherit a house in the desert and one summer to decide what to do with it.",
    cast: ["Lucía Ortega", "Bea Lowe"],
    still: a("villa.webp"),
    tone: "#d58a4c",
    episodes: [],
    comingSoon: "Dec 19",
  },
  {
    id: "studio",
    name: "Grain",
    kind: "Series",
    genres: ["Documentary", "Design"],
    year: 2027,
    rating: "All ages",
    match: 86,
    runtime: "6 episodes",
    synopsis: "Woodworkers, potters and weavers on why the slow way is still the best way.",
    cast: ["Dir. Ines Valk"],
    still: a("studio.webp"),
    tone: "#8a5a2b",
    episodes: [],
    comingSoon: "Jan 9",
  },
];

export const profiles = [
  { id: "sam", name: "Sam", color: "#a7a3f0", kids: false },
  { id: "alex", name: "Alex", color: "#f05a4f", kids: false },
  { id: "rio", name: "Rio", color: "#58c4a0", kids: false },
  { id: "kids", name: "Kids", color: "#f2c14e", kids: true },
];

export const T = (id: string) => titles.find((t) => t.id === id)!;
export const epById = (id: string) => {
  for (const t of titles) for (const e of t.episodes) if (e.id === id) return { t, e };
  return null;
};
export const playable = titles.filter((t) => t.episodes.length);

export type History = Record<string, { at: number; done: boolean; when: number }>;

export function useFrame() {
  const [profile, setProfile] = useStore<string | null>("streaming", "profile", null);
  const [list, setList] = useStore<string[]>("streaming", "list", ["rain"]);
  const [history, setHistory] = useStore<History>("streaming", "history", { "orbit-0": { at: 3.4, done: false, when: Date.now() - 864e5 } });
  const [likes, setLikes] = useStore<string[]>("streaming", "likes", []);
  const [downloads, setDownloads] = useStore<Record<string, number>>("streaming", "downloads", { "earth-0": 1 });
  const [reminders, setReminders] = useStore<string[]>("streaming", "reminders", []);
  const [captions, setCaptions] = useStore<boolean>("streaming", "captions", true);
  const me = profiles.find((p) => p.id === profile) || null;
  const visible = (t: Title) => !me?.kids || t.rating === "All ages";
  const toggleList = (id: string) => {
    let added = false;
    setList((l) => {
      added = !l.includes(id);
      return added ? [...l, id] : l.filter((x) => x !== id);
    });
    return added;
  };
  const toggleLike = (id: string) => setLikes((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const toggleRemind = (id: string) => {
    let on = false;
    setReminders((r) => {
      on = !r.includes(id);
      return on ? [...r, id] : r.filter((x) => x !== id);
    });
    return on;
  };
  const progress = (epId: string, at: number, dur: number) => setHistory((h) => ({ ...h, [epId]: { at, done: at >= dur - 0.4, when: Date.now() } }));
  /** Continue-watching rows: most recent unfinished episode per title, or next episode. */
  const resume = Object.entries(history)
    .sort((x, y) => y[1].when - x[1].when)
    .map(([id, h]) => {
      const f = epById(id);
      if (!f) return null;
      if (h.done) {
        const next = f.t.episodes[f.e.n];
        return next ? { t: f.t, e: next, at: 0 } : null;
      }
      return { t: f.t, e: f.e, at: h.at };
    })
    .filter((x, i, arr) => x && arr.findIndex((y) => y?.t.id === x.t.id) === i) as { t: Title; e: Episode; at: number }[];
  return { profile, setProfile, me, list, toggleList, history, progress, likes, toggleLike, downloads, setDownloads, reminders, toggleRemind, captions, setCaptions, visible, resume };
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
