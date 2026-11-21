"use client";

import { asset } from "../../../lib/projects";
import { useStore, uid, addDays, TODAY } from "../../kit/store";

export type Listing = {
  id: string;
  title: string;
  place: string;
  region: string;
  type: "Cabin" | "Loft" | "Villa" | "Glasshouse" | "Cottage";
  nightly: number;
  cleaning: number;
  rating: number;
  reviews: number;
  guests: number;
  beds: number;
  baths: number;
  photos: string[];
  map: [number, number]; // % position on illustrative map
  host: { name: string; years: number; superhost: boolean };
  highlights: [string, string, string][]; // icon, title, text
  amenities: string[];
  desc: string;
  blocked: string[]; // ISO dates unavailable
  instant: boolean;
  category: string;
  scores: Record<string, number>;
};

const a = asset;
const blockedFrom = (offsets: number[]) => offsets.map((o) => addDays(TODAY, o));

export const categories = [
  { id: "all", label: "All stays", icon: "compass" },
  { id: "Lakefront", label: "Lakefront", icon: "water" },
  { id: "Forest", label: "In the woods", icon: "leaf" },
  { id: "Desert", label: "Desert", icon: "sun" },
  { id: "City", label: "City lofts", icon: "grid" },
  { id: "Coast", label: "Coastal", icon: "pool" },
];

export const listings: Listing[] = [
  {
    id: "juniper",
    title: "Juniper Lake Cabin",
    place: "Asheville, North Carolina",
    region: "Blue Ridge",
    type: "Cabin",
    nightly: 186,
    cleaning: 65,
    rating: 4.97,
    reviews: 212,
    guests: 4,
    beds: 2,
    baths: 1,
    photos: [a("stays.webp"), a("still-earth-0.webp"), a("studio.webp"), a("still-earth-2.webp"), a("lamp.webp")],
    map: [68, 44],
    host: { name: "Eleanor", years: 6, superhost: true },
    highlights: [["water", "Private lakefront", "Kayaks and a dock a few steps from the porch."], ["flame", "Wood stove", "Seasoned firewood is stacked and ready."], ["key", "Self check-in", "Smart lock — arrive whenever you like after 3 PM."]],
    amenities: ["Lake access", "Wood stove", "Fast wifi", "Kitchen", "Kayaks", "Free parking", "Washer", "Dedicated workspace"],
    desc: "A black-timber cabin on a quiet arm of the lake. Mornings are mist and loons; evenings are the porch, the fire and an absurd number of stars. Designed for two, with a sleeping loft for friends.",
    blocked: blockedFrom([3, 4, 5, 11, 12, 18, 19, 20, 26]),
    instant: true,
    category: "Lakefront",
    scores: { Cleanliness: 4.9, Accuracy: 5, "Check-in": 5, Communication: 4.9, Location: 4.9, Value: 4.8 },
  },
  {
    id: "fern",
    title: "Glasshouse in the Ferns",
    place: "Olympic Peninsula, Washington",
    region: "Pacific Northwest",
    type: "Glasshouse",
    nightly: 264,
    cleaning: 85,
    rating: 4.93,
    reviews: 168,
    guests: 2,
    beds: 1,
    baths: 1,
    photos: [a("loft.webp"), a("still-rain-0.webp"), a("still-rain-2.webp"), a("chair.webp"), a("still-rain-1.webp")],
    map: [12, 14],
    host: { name: "Theo", years: 4, superhost: true },
    highlights: [["leaf", "Rainforest setting", "Floor-to-ceiling glass on all four sides."], ["moon", "Dark-sky reserve", "No neighbours, no light pollution."], ["coffee", "Breakfast basket", "Local bread, eggs and coffee on arrival."]],
    amenities: ["Wood stove", "Outdoor shower", "Library", "Kitchen", "Record player", "Free parking", "Hiking trails"],
    desc: "A glass pavilion raised on stilts in an old-growth fern valley. Listen to rain on the roof from the reading nook, then walk straight out to the trailhead.",
    blocked: blockedFrom([1, 2, 8, 9, 10, 15, 22, 23]),
    instant: false,
    category: "Forest",
    scores: { Cleanliness: 5, Accuracy: 4.9, "Check-in": 4.9, Communication: 5, Location: 4.8, Value: 4.7 },
  },
  {
    id: "sol",
    title: "Casa Sol",
    place: "Joshua Tree, California",
    region: "High Desert",
    type: "Villa",
    nightly: 318,
    cleaning: 120,
    rating: 4.89,
    reviews: 301,
    guests: 6,
    beds: 3,
    baths: 2,
    photos: [a("villa.webp"), a("stair-vase.webp"), a("sidetable.webp"), a("arc-lamp.webp"), a("stool.webp")],
    map: [16, 66],
    host: { name: "Marisol", years: 8, superhost: true },
    highlights: [["pool", "Heated plunge pool", "Open year-round, lit at night."], ["sun", "Sunset terrace", "West-facing over the boulder fields."], ["star", "Guest favourite", "One of the top 5% of homes here."]],
    amenities: ["Pool", "Hot tub", "Air conditioning", "Kitchen", "Fire pit", "Fast wifi", "EV charger", "Free parking"],
    desc: "Adobe walls, a plunge pool and nothing but Joshua trees to the horizon. Three bedrooms open onto a shaded courtyard built for long, slow evenings.",
    blocked: blockedFrom([6, 7, 13, 14, 27, 28]),
    instant: true,
    category: "Desert",
    scores: { Cleanliness: 4.8, Accuracy: 4.9, "Check-in": 5, Communication: 4.9, Location: 4.8, Value: 4.7 },
  },
  {
    id: "terracotta",
    title: "The Terracotta Loft",
    place: "Austin, Texas",
    region: "Hill Country",
    type: "Loft",
    nightly: 142,
    cleaning: 45,
    rating: 4.84,
    reviews: 96,
    guests: 2,
    beds: 1,
    baths: 1,
    photos: [a("ecommerce.webp"), a("chair-dark.webp"), a("vase.webp"), a("stair-vase.webp"), a("mushroom-lamp.webp")],
    map: [44, 72],
    host: { name: "Diego", years: 3, superhost: false },
    highlights: [["grid", "Walkable", "Cafés and live music within 5 minutes."], ["bolt", "Fast wifi", "Tested at 500 Mbps — good for calls."], ["key", "Self check-in", "Keypad entry."]],
    amenities: ["Fast wifi", "Dedicated workspace", "Kitchen", "Washer", "Air conditioning", "Rooftop"],
    desc: "A plaster-walled loft over a design studio, all warm light and curved furniture. Two blocks from South Congress.",
    blocked: blockedFrom([2, 9, 16, 17, 24]),
    instant: true,
    category: "City",
    scores: { Cleanliness: 4.9, Accuracy: 4.8, "Check-in": 4.9, Communication: 4.8, Location: 5, Value: 4.7 },
  },
  {
    id: "linen",
    title: "Linen House",
    place: "St. Pete Beach, Florida",
    region: "Gulf Coast",
    type: "Cottage",
    nightly: 224,
    cleaning: 90,
    rating: 4.91,
    reviews: 143,
    guests: 4,
    beds: 2,
    baths: 2,
    photos: [a("health.webp"), a("still-blue-0.webp"), a("lamp.webp"), a("bag.webp"), a("still-blue-2.webp")],
    map: [74, 86],
    host: { name: "Ana", years: 5, superhost: true },
    highlights: [["pool", "Steps to the beach", "Two-minute walk on a sandy path."], ["sun", "Sunrise yoga deck", "Mats and blocks provided."], ["bike", "Bikes included", "Two cruisers and a cart."]],
    amenities: ["Beach access", "Bikes", "Outdoor shower", "Kitchen", "Air conditioning", "Washer", "Free parking"],
    desc: "A whitewashed cottage with linen everything, a yoga deck and the Gulf at the end of the lane.",
    blocked: blockedFrom([4, 5, 12, 13, 20, 21]),
    instant: false,
    category: "Coast",
    scores: { Cleanliness: 5, Accuracy: 4.9, "Check-in": 4.9, Communication: 5, Location: 4.9, Value: 4.8 },
  },
];

export const destinations = [
  { name: "Anywhere", sub: "Flexible", icon: "globe" },
  { name: "Blue Ridge", sub: "Mountains & lakes", icon: "water" },
  { name: "Pacific Northwest", sub: "Rainforests", icon: "leaf" },
  { name: "High Desert", sub: "Big skies", icon: "sun" },
  { name: "Hill Country", sub: "City & music", icon: "grid" },
  { name: "Gulf Coast", sub: "Beaches", icon: "pool" },
];

export type Search = { where: string; start: string | null; end: string | null; adults: number; children: number; infants: number; pets: number };
export type Trip = { id: string; lid: string; start: string; end: string; guests: number; total: number; status: "upcoming" | "past" | "cancelled"; message: string; created: number };
export type Wish = { id: string; name: string; ids: string[] };

export const SERVICE = 0.12;
export const TAX = 0.09;
export const L = (id: string) => listings.find((x) => x.id === id)!;
export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export function nights(s: string | null, e: string | null) {
  if (!s || !e) return 0;
  return Math.round((new Date(e + "T12:00:00").getTime() - new Date(s + "T12:00:00").getTime()) / 864e5);
}
export function quote(l: Listing, s: string | null, e: string | null) {
  const n = nights(s, e);
  const base = l.nightly * n;
  const weekly = n >= 7 ? Math.round(base * 0.1) : 0;
  const service = Math.round((base - weekly + l.cleaning) * SERVICE);
  const tax = Math.round((base - weekly) * TAX);
  return { n, base, weekly, cleaning: n ? l.cleaning : 0, service: n ? service : 0, tax: n ? tax : 0, total: n ? base - weekly + l.cleaning + service + tax : 0 };
}
export function available(l: Listing, s: string | null, e: string | null) {
  if (!s || !e) return true;
  for (let d = s; d < e; d = addDays(d, 1)) if (l.blocked.includes(d)) return false;
  return true;
}
export const fmtRange = (s: string | null, e: string | null) => {
  if (!s) return "Add dates";
  const f = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return e ? `${f(s)} – ${f(e)}` : `${f(s)} – ?`;
};

const seedTrips: Trip[] = [
  { id: "RM-73021", lid: "fern", start: addDays(TODAY, -60), end: addDays(TODAY, -57), guests: 2, total: 1018, status: "past", message: "", created: Date.now() - 90 * 864e5 },
];

export function useRoam() {
  const [search, setSearch] = useStore<Search>("stays", "search", { where: "Anywhere", start: addDays(TODAY, 21), end: addDays(TODAY, 24), adults: 2, children: 0, infants: 0, pets: 0 });
  const [trips, setTrips] = useStore<Trip[]>("stays", "trips", seedTrips);
  const [wishes, setWishes] = useStore<Wish[]>("stays", "wishes", [{ id: "w1", name: "Weekend escapes", ids: ["juniper"] }, { id: "w2", name: "Someday", ids: [] }]);
  const saved = (id: string) => wishes.some((w) => w.ids.includes(id));
  const guests = search.adults + search.children;
  function toggleSave(id: string, list?: string) {
    if (saved(id) && !list) {
      setWishes((ws) => ws.map((w) => ({ ...w, ids: w.ids.filter((x) => x !== id) })));
      return false;
    }
    setWishes((ws) => ws.map((w) => (w.id === (list || ws[0].id) ? { ...w, ids: [...w.ids.filter((x) => x !== id), id] } : w)));
    return true;
  }
  function newList(name: string, id?: string) {
    const w: Wish = { id: uid("w"), name, ids: id ? [id] : [] };
    setWishes((ws) => [...ws.map((x) => ({ ...x, ids: id ? x.ids.filter((y) => y !== id) : x.ids })), w]);
    return w;
  }
  function book(lid: string, message: string) {
    const l = L(lid);
    const q = quote(l, search.start, search.end);
    const t: Trip = { id: uid("RM-").slice(0, 8), lid, start: search.start!, end: search.end!, guests, total: q.total, status: "upcoming", message, created: Date.now() };
    setTrips((ts) => [t, ...ts]);
    return t;
  }
  const cancel = (id: string) => setTrips((ts) => ts.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t)));
  return { search, setSearch, trips, wishes, saved, toggleSave, newList, book, cancel, guests };
}

export function refundFor(t: Trip) {
  const days = nights(TODAY, t.start);
  return days >= 14 ? t.total : days >= 7 ? Math.round(t.total * 0.5) : 0;
}
