"use client";

import { asset } from "../../../lib/projects";
import { useStore, uid, TODAY, addDays } from "../../kit/store";

export type Colorway = { name: string; swatch: string; img: string; filter?: string };
export type Product = {
  id: string;
  name: string;
  cat: "Living" | "Lighting" | "Objects" | "Carry";
  price: number;
  was?: number;
  material: string;
  maker: string;
  blurb: string;
  details: string[];
  dims: string;
  sizes?: { name: string; delta: number }[];
  colors: Colorway[];
  rating: number;
  reviews: number;
  badge?: string;
  stock?: number;
};

const img = (n: string) => asset(n);

export const products: Product[] = [
  {
    id: "forma",
    name: "Forma Lounge Chair",
    cat: "Living",
    price: 1290,
    material: "Bouclé · ash",
    maker: "Studio Oiva, Lisbon",
    blurb: "A low, enveloping chair upholstered in a dense wool bouclé that softens with use.",
    details: ["Kiln-dried solid ash frame", "High-resilience foam, no glue", "Removable bouclé cover", "Made to order in Portugal"],
    dims: "W 86 × D 80 × H 72 cm · Seat 40 cm",
    colors: [
      { name: "Oat", swatch: "#e5d8c3", img: img("chair.webp") },
      { name: "Cocoa", swatch: "#5a3a2b", img: img("chair-dark.webp") },
    ],
    rating: 4.8,
    reviews: 214,
    badge: "Bestseller",
  },
  {
    id: "arc",
    name: "Arc Lounge Set",
    cat: "Living",
    price: 1840,
    was: 2160,
    material: "Bouclé · brushed steel",
    maker: "Studio Oiva × Lumen",
    blurb: "The Forma chair paired with our brushed-steel arc lamp — a reading corner in one order.",
    details: ["Forma chair in Oat", "Arc lamp, 2700K dimmable bulb", "White-glove delivery included"],
    dims: "Lamp reach 140 cm · H 190 cm",
    colors: [{ name: "Oat / Steel", swatch: "#d9c9ae", img: img("arc-lamp.webp") }],
    rating: 4.9,
    reviews: 48,
    badge: "Set −15%",
  },
  {
    id: "vessel",
    name: "Terracotta Vessel",
    cat: "Objects",
    price: 68,
    material: "Hand-thrown terracotta",
    maker: "Barro Workshop, Oaxaca",
    blurb: "Hand-finished clay with a tactile matte surface. Each piece carries the marks of its maker.",
    details: ["Watertight glazed interior", "Unique variations in tone", "Wipe clean with a dry cloth"],
    dims: "Small Ø 14 cm · Medium Ø 20 cm · Large Ø 28 cm",
    sizes: [
      { name: "S", delta: 0 },
      { name: "M", delta: 24 },
      { name: "L", delta: 58 },
    ],
    colors: [
      { name: "Terracotta", swatch: "#a5512f", img: img("vase.webp") },
      { name: "Ash", swatch: "#8f8a85", img: img("vase.webp"), filter: "grayscale(.85) brightness(1.08)" },
    ],
    rating: 4.7,
    reviews: 389,
  },
  {
    id: "tote",
    name: "Everyday Carry Tote",
    cat: "Carry",
    price: 89,
    material: "Waxed organic canvas",
    maker: "Atelier own studio",
    blurb: "A structured canvas tote for wherever the day goes, with a leather-bound handle.",
    details: ["14 oz organic cotton canvas", "Interior slip pocket", "Vegetable-tanned leather trims"],
    dims: "W 42 × H 38 × D 14 cm",
    colors: [
      { name: "Natural", swatch: "#e9dfcb", img: img("bag.webp") },
      { name: "Charcoal", swatch: "#3e3c3a", img: img("bag.webp"), filter: "grayscale(1) brightness(.55) contrast(1.2)" },
      { name: "Olive", swatch: "#6c6b3f", img: img("bag.webp"), filter: "sepia(.7) hue-rotate(30deg) saturate(1.4) brightness(.7)" },
    ],
    rating: 4.6,
    reviews: 152,
    stock: 3,
  },
  {
    id: "luna",
    name: "Luna Table Lamp",
    cat: "Lighting",
    price: 129,
    material: "Opal glass · travertine",
    maker: "Lumen Collective",
    blurb: "A warm pool of light for your favourite corner, on a solid travertine foot.",
    details: ["Mouth-blown opal glass", "Dimmable, E26 2700K bulb included", "Braided cotton cable, 2 m"],
    dims: "Ø 18 × H 46 cm",
    colors: [{ name: "Opal", swatch: "#f3e9d6", img: img("lamp.webp") }],
    rating: 4.9,
    reviews: 97,
    badge: "New",
  },
  {
    id: "dome",
    name: "Dome Lamp",
    cat: "Lighting",
    price: 159,
    material: "Lacquered steel · stone",
    maker: "Lumen Collective",
    blurb: "A mushroom silhouette that throws soft downward light across a table or console.",
    details: ["Powder-coated steel shade", "Cast stone base", "Touch dimmer, 3 levels"],
    dims: "Ø 32 × H 38 cm",
    colors: [
      { name: "Cream", swatch: "#efe4cd", img: img("mushroom-lamp.webp") },
      { name: "Rust", swatch: "#a6582f", img: img("mushroom-lamp.webp"), filter: "sepia(.6) saturate(2.4) hue-rotate(-12deg) brightness(.85)" },
    ],
    rating: 4.5,
    reviews: 61,
  },
  {
    id: "arch",
    name: "Arch Stool",
    cat: "Living",
    price: 340,
    material: "Solid walnut",
    maker: "Holz & Hand, Vienna",
    blurb: "Carved from a single block of walnut. A stool, a side table, a small sculpture.",
    details: ["FSC-certified American walnut", "Hand-rubbed oil finish", "Each grain pattern is unique"],
    dims: "Ø 38 × H 46 cm",
    colors: [
      { name: "Walnut", swatch: "#6b3f22", img: img("stool.webp") },
      { name: "Smoked", swatch: "#2f241e", img: img("stool.webp"), filter: "brightness(.55) contrast(1.15)" },
    ],
    rating: 4.8,
    reviews: 73,
  },
  {
    id: "column",
    name: "Column Side Table",
    cat: "Living",
    price: 620,
    material: "Solid walnut",
    maker: "Holz & Hand, Vienna",
    blurb: "Fluted walnut columns under a thick round top — architecture at coffee-table scale.",
    details: ["Solid walnut, no veneers", "Felt-lined feet", "Ships assembled"],
    dims: "Ø 70 × H 42 cm",
    sizes: [
      { name: "Ø 70", delta: 0 },
      { name: "Ø 90", delta: 210 },
    ],
    colors: [{ name: "Walnut", swatch: "#6b3f22", img: img("sidetable.webp") }],
    rating: 4.7,
    reviews: 39,
  },
];

export const stories = [
  { id: "s1", kicker: "The Autumn Edit", title: "Rooms that hold the light", img: img("ecommerce.webp"), tone: "#a24d26" },
  { id: "s2", kicker: "Maker spotlight", title: "Holz & Hand carve in walnut", img: img("studio.webp"), tone: "#6b3f22" },
  { id: "s3", kicker: "Material notes", title: "Why bouclé softens with time", img: img("chair.webp"), tone: "#b78e62" },
];

export const reviewsFor = (p: Product) => [
  { name: "Maya R.", rating: 5, date: "Oct 30", title: "Even better in person", text: `The ${p.material.toLowerCase()} feels substantial. Delivery was booked to the hour and the packaging was plastic-free.`, verified: true },
  { name: "Daniel K.", rating: 4, date: "Oct 12", title: "Beautiful, check the size", text: "Love it, but measure your space — it's a touch larger than I imagined. Customer care helped me swap sizes quickly.", verified: true },
  { name: "Priya S.", rating: 5, date: "Sep 28", title: "A forever piece", text: "You can tell it was made by people who care. It's become the centre of the room.", verified: false },
];

export type Line = { key: string; id: string; color: string; size?: string; qty: number };
export type Order = {
  id: string;
  date: string;
  lines: (Line & { name: string; price: number; img: string; filter?: string })[];
  total: number;
  shipping: string;
  address: string;
  status: number; // 0 placed .. 3 delivered
  returned?: string[];
};

export const productById = (id: string) => products.find((p) => p.id === id)!;
export const colorOf = (p: Product, name: string) => p.colors.find((c) => c.name === name) || p.colors[0];
export const unitPrice = (p: Product, size?: string) => p.price + (p.sizes?.find((s) => s.name === size)?.delta || 0);

export const SHIP = { standard: { label: "Standard", note: "3–5 business days", cost: 12 }, express: { label: "Express", note: "Next business day", cost: 28 }, whiteglove: { label: "White glove", note: "Scheduled, room of choice", cost: 79 } } as const;
export const FREE_OVER = 250;
export const PROMOS: Record<string, number> = { ATELIER10: 0.1, WELCOME15: 0.15 };

const seedOrder: Order = {
  id: "AT-48213",
  date: addDays(TODAY, -9),
  lines: [{ key: "luna-Opal", id: "luna", color: "Opal", qty: 1, name: "Luna Table Lamp", price: 129, img: img("lamp.webp") }],
  total: 141,
  shipping: "Standard",
  address: "214 Bayview Ave, Tampa FL",
  status: 3,
};

export function useAtelier() {
  const [bag, setBag] = useStore<Line[]>("ecommerce", "bag", []);
  const [wish, setWish] = useStore<string[]>("ecommerce", "wish", ["luna"]);
  const [orders, setOrders] = useStore<Order[]>("ecommerce", "orders", [seedOrder]);
  const [recent, setRecent] = useStore<string[]>("ecommerce", "recent", ["lamp", "walnut"]);
  const [promo, setPromo] = useStore<string>("ecommerce", "promo", "");

  const add = (id: string, color: string, size: string | undefined, qty = 1) => {
    const key = `${id}-${color}-${size || ""}`;
    setBag((b) => (b.some((l) => l.key === key) ? b.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...b, { key, id, color, size, qty }]));
  };
  const setQty = (key: string, qty: number) => setBag((b) => (qty <= 0 ? b.filter((l) => l.key !== key) : b.map((l) => (l.key === key ? { ...l, qty } : l))));
  const toggleWish = (id: string) => {
    let added = false;
    setWish((w) => {
      added = !w.includes(id);
      return added ? [...w, id] : w.filter((x) => x !== id);
    });
    return added;
  };
  const count = bag.reduce((a, l) => a + l.qty, 0);
  const subtotal = bag.reduce((a, l) => a + unitPrice(productById(l.id), l.size) * l.qty, 0);
  const discount = PROMOS[promo] ? Math.round(subtotal * PROMOS[promo]) : 0;

  function place(ship: keyof typeof SHIP, address: string) {
    const shipCost = subtotal - discount >= FREE_OVER && ship === "standard" ? 0 : SHIP[ship].cost;
    const tax = Math.round((subtotal - discount) * 0.07);
    const order: Order = {
      id: uid("AT-").slice(0, 8),
      date: TODAY,
      lines: bag.map((l) => {
        const p = productById(l.id);
        const c = colorOf(p, l.color);
        return { ...l, name: p.name, price: unitPrice(p, l.size), img: c.img, filter: c.filter };
      }),
      total: subtotal - discount + shipCost + tax,
      shipping: SHIP[ship].label,
      address,
      status: 0,
    };
    setOrders((o) => [order, ...o]);
    setBag([]);
    setPromo("");
    return order;
  }
  const advance = (id: string) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: Math.min(3, x.status + 1) } : x)));
  const returnItems = (id: string, keys: string[]) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, returned: [...(x.returned || []), ...keys] } : x)));
  const remember = (q: string) => q.trim() && setRecent((r) => [q.trim(), ...r.filter((x) => x !== q.trim())].slice(0, 5));

  return { bag, wish, orders, recent, promo, setPromo, add, setQty, toggleWish, count, subtotal, discount, place, advance, returnItems, remember, setRecent };
}

export const statusSteps = ["Order placed", "Packed at the studio", "Out for delivery", "Delivered"];
export const money = (n: number) => "$" + n.toLocaleString("en-US");
