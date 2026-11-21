"use client";

import { asset } from "../../../lib/projects";
import { useStore, uid, TODAY } from "../../kit/store";

export type Option = { name: string; price: number };
export type Group = { name: string; required: boolean; max: number; options: Option[] };
export type Dish = {
  id: string;
  name: string;
  desc: string;
  price: number;
  img?: string;
  tone?: string;
  tags?: string[];
  popular?: boolean;
  groups?: Group[];
};
export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  ratings: string;
  eta: [number, number];
  fee: number;
  price: string;
  distance: string;
  cover?: string;
  brand?: { bg: string; fg: string; mark: string };
  offer?: string;
  tags: string[];
  menu: { section: string; dishes: Dish[] }[];
};

const a = asset;
const size: Group = { name: "Size", required: true, max: 1, options: [{ name: "Regular", price: 0 }, { name: "Large", price: 3 }] };

export const restaurants: Restaurant[] = [
  {
    id: "buns",
    name: "Good Buns",
    cuisine: "Burgers",
    rating: 4.8,
    ratings: "2.1k",
    eta: [15, 25],
    fee: 0,
    price: "$$",
    distance: "0.8 mi",
    cover: a("food.webp"),
    offer: "Free delivery",
    tags: ["Burgers", "American", "Late night"],
    menu: [
      {
        section: "Burgers",
        dishes: [
          { id: "b1", name: "The Double Smash", desc: "Two smashed patties, American cheese, pickles, house sauce, potato bun.", price: 14.5, img: a("dish-burger.webp"), popular: true, tags: ["Most ordered"], groups: [
            { name: "Doneness", required: true, max: 1, options: [{ name: "Medium", price: 0 }, { name: "Well done", price: 0 }] },
            { name: "Add-ons", required: false, max: 3, options: [{ name: "Bacon", price: 2.5 }, { name: "Fried egg", price: 1.5 }, { name: "Jalapeños", price: 0.75 }, { name: "Extra cheese", price: 1 }] },
            { name: "Make it a meal", required: false, max: 1, options: [{ name: "Fries + drink", price: 5 }] },
          ] },
          { id: "b2", name: "Crispy Chicken", desc: "Buttermilk-brined thigh, slaw, hot honey.", price: 13, tone: "#e9a23b", groups: [
            { name: "Heat", required: true, max: 1, options: [{ name: "Mild", price: 0 }, { name: "Hot", price: 0 }, { name: "Inferno", price: 0 }] },
            { name: "Add-ons", required: false, max: 2, options: [{ name: "Pickles", price: 0.5 }, { name: "Avocado", price: 2 }] },
          ] },
          { id: "b3", name: "Garden Stack", desc: "Black-bean patty, charred peppers, chipotle mayo.", price: 12.5, tone: "#6c9a4a", tags: ["Vegetarian"] },
        ],
      },
      {
        section: "Sides",
        dishes: [
          { id: "s1", name: "Shoestring Fries", desc: "Sea salt, rosemary.", price: 4.5, img: a("dish-fries.webp"), popular: true, groups: [size] },
          { id: "s2", name: "Onion Rings", desc: "Beer battered, smoked aioli.", price: 5.5, tone: "#d9a35b" },
        ],
      },
      {
        section: "Drinks",
        dishes: [
          { id: "d1", name: "Vanilla Shake", desc: "Madagascar vanilla, whole milk.", price: 6, tone: "#f2e3c9", groups: [size] },
          { id: "d2", name: "House Lemonade", desc: "Fresh-squeezed, mint.", price: 3.5, tone: "#f4dd6a" },
        ],
      },
    ],
  },
  {
    id: "fuoco",
    name: "Fuoco",
    cuisine: "Pizza",
    rating: 4.9,
    ratings: "1.4k",
    eta: [25, 35],
    fee: 1.99,
    price: "$$",
    distance: "1.6 mi",
    cover: a("pizza.webp"),
    offer: "20% off first order",
    tags: ["Pizza", "Italian", "Wood-fired"],
    menu: [
      {
        section: "Wood-fired pizza",
        dishes: [
          { id: "p1", name: "Margherita", desc: "San Marzano, fior di latte, basil, olive oil.", price: 16, img: a("dish-pizza.webp"), popular: true, tags: ["Most ordered", "Vegetarian"], groups: [
            { name: "Size", required: true, max: 1, options: [{ name: '12"', price: 0 }, { name: '16"', price: 6 }] },
            { name: "Crust", required: true, max: 1, options: [{ name: "Classic", price: 0 }, { name: "Gluten-free", price: 3 }] },
            { name: "Extra toppings", required: false, max: 4, options: [{ name: "Burrata", price: 4 }, { name: "Prosciutto", price: 3.5 }, { name: "Hot honey", price: 1 }, { name: "Mushrooms", price: 2 }] },
          ] },
          { id: "p2", name: "Diavola", desc: "Spicy salami, chilli, smoked mozzarella.", price: 19, tone: "#c2412d", groups: [
            { name: "Size", required: true, max: 1, options: [{ name: '12"', price: 0 }, { name: '16"', price: 6 }] },
          ] },
          { id: "p3", name: "Funghi Bianca", desc: "Wild mushrooms, fontina, thyme, no sauce.", price: 18, tone: "#c9b28a", tags: ["Vegetarian"] },
        ],
      },
      {
        section: "Small plates",
        dishes: [
          { id: "sp1", name: "Garlic Knots", desc: "Parmesan, parsley, marinara.", price: 7, img: a("dish-oven.webp") },
          { id: "sp2", name: "Caesar", desc: "Little gem, anchovy dressing, crumbs.", price: 11, tone: "#9fbf6a" },
        ],
      },
    ],
  },
  {
    id: "kumo",
    name: "Kumo Ramen",
    cuisine: "Japanese",
    rating: 4.7,
    ratings: "980",
    eta: [20, 30],
    fee: 2.49,
    price: "$$",
    distance: "1.2 mi",
    cover: a("bowl.webp"),
    tags: ["Ramen", "Japanese", "Noodles"],
    menu: [
      {
        section: "Ramen",
        dishes: [
          { id: "r1", name: "Tonkotsu Classic", desc: "18-hour pork broth, chashu, ajitama egg, scallion.", price: 17, img: a("dish-ramen.webp"), popular: true, tags: ["Most ordered"], groups: [
            { name: "Noodle firmness", required: true, max: 1, options: [{ name: "Soft", price: 0 }, { name: "Regular", price: 0 }, { name: "Firm", price: 0 }] },
            { name: "Spice level", required: true, max: 1, options: [{ name: "None", price: 0 }, { name: "Medium", price: 0 }, { name: "Hot", price: 0 }] },
            { name: "Extras", required: false, max: 3, options: [{ name: "Extra chashu", price: 4 }, { name: "Ajitama egg", price: 2 }, { name: "Corn butter", price: 1.5 }] },
          ] },
          { id: "r2", name: "Shoyu Chicken", desc: "Clear soy broth, chicken thigh, menma.", price: 15.5, tone: "#b7763a" },
          { id: "r3", name: "Miso Veggie", desc: "Red miso, roasted squash, tofu, sesame.", price: 15, tone: "#d38b3b", tags: ["Vegan"] },
        ],
      },
      { section: "Sides", dishes: [{ id: "k1", name: "Ajitama Eggs (2)", desc: "Soy-marinated jammy eggs.", price: 4, img: a("dish-egg.webp") }, { id: "k2", name: "Gyoza (6)", desc: "Pork and cabbage, chilli oil.", price: 8, tone: "#e3c18e" }] },
    ],
  },
  {
    id: "verde",
    name: "Verde Bowls",
    cuisine: "Healthy",
    rating: 4.6,
    ratings: "640",
    eta: [10, 20],
    fee: 0.99,
    price: "$",
    distance: "0.5 mi",
    brand: { bg: "#2f7d4f", fg: "#e9f5d0", mark: "verde" },
    offer: "Buy 1 get 1 50%",
    tags: ["Bowls", "Healthy", "Vegan options"],
    menu: [
      {
        section: "Bowls",
        dishes: [
          { id: "v1", name: "Harvest Bowl", desc: "Quinoa, roasted squash, kale, tahini.", price: 13, tone: "#8fb35a", popular: true, groups: [
            { name: "Protein", required: true, max: 1, options: [{ name: "Tofu", price: 0 }, { name: "Chicken", price: 2.5 }, { name: "Salmon", price: 4 }] },
            { name: "Dressing", required: true, max: 1, options: [{ name: "Tahini", price: 0 }, { name: "Miso-ginger", price: 0 }, { name: "Green goddess", price: 0 }] },
          ] },
          { id: "v2", name: "Lemon Lentil", desc: "Herbed lentils, preserved lemon, feta.", price: 12, tone: "#c8b24a", tags: ["Vegetarian"] },
        ],
      },
      { section: "Juices", dishes: [{ id: "v3", name: "Green Press", desc: "Cucumber, apple, celery, lime.", price: 7, tone: "#7fbf5a" }] },
    ],
  },
  {
    id: "luz",
    name: "Taquería Luz",
    cuisine: "Mexican",
    rating: 4.8,
    ratings: "1.1k",
    eta: [20, 30],
    fee: 0,
    price: "$",
    distance: "1.1 mi",
    brand: { bg: "#f2b632", fg: "#3a1a10", mark: "Luz" },
    offer: "Free delivery",
    tags: ["Tacos", "Mexican"],
    menu: [
      { section: "Tacos", dishes: [
        { id: "t1", name: "Al Pastor (3)", desc: "Spit-roasted pork, pineapple, salsa verde.", price: 11, tone: "#e0702f", popular: true, groups: [{ name: "Tortilla", required: true, max: 1, options: [{ name: "Corn", price: 0 }, { name: "Flour", price: 0 }] }] },
        { id: "t2", name: "Baja Fish (3)", desc: "Beer-battered cod, cabbage, chipotle crema.", price: 12.5, tone: "#e8c46a" },
      ] },
      { section: "Extras", dishes: [{ id: "t3", name: "Chips & Guac", desc: "Made to order.", price: 6.5, tone: "#7fa84a" }] },
    ],
  },
  {
    id: "dolce",
    name: "Dolce Bakery",
    cuisine: "Desserts",
    rating: 4.9,
    ratings: "720",
    eta: [15, 25],
    fee: 1.49,
    price: "$",
    distance: "0.9 mi",
    brand: { bg: "#f4c9c2", fg: "#7a2b2b", mark: "Dolce" },
    tags: ["Desserts", "Bakery", "Coffee"],
    menu: [{ section: "Sweet", dishes: [{ id: "x1", name: "Cardamom Bun", desc: "Laminated dough, cardamom sugar.", price: 4.5, tone: "#d8a56a", popular: true }, { id: "x2", name: "Basque Cheesecake", desc: "Burnt top, creamy centre.", price: 7, tone: "#c98a4a" }] }],
  },
];

export const cuisines = [
  { name: "All", icon: "sparkle" },
  { name: "Burgers", icon: "flame" },
  { name: "Pizza", icon: "fork" },
  { name: "Japanese", icon: "bowl" },
  { name: "Healthy", icon: "leaf" },
  { name: "Mexican", icon: "sun" },
  { name: "Desserts", icon: "gift" },
];

export const addresses = [
  { id: "home", label: "Home", line: "214 Bayview Ave", city: "Tampa, FL 33602" },
  { id: "work", label: "Studio", line: "1100 N Franklin St, Fl 3", city: "Tampa, FL 33602" },
];

export type CartLine = { key: string; rid: string; dishId: string; name: string; qty: number; unit: number; choices: string[]; note?: string; img?: string; tone?: string };
export type Order = {
  id: string;
  rid: string;
  lines: CartLine[];
  total: number;
  placed: number; // timestamp
  stage: number; // 0 confirmed .. 4 delivered
  address: string;
  tip: number;
  rating?: number;
  mode: "delivery" | "pickup";
};

export const stages = [
  { name: "Order confirmed", note: "The restaurant has your order", icon: "check" },
  { name: "Preparing", note: "Your food is being made", icon: "flame" },
  { name: "Courier picked up", note: "Marco is on the way", icon: "bike" },
  { name: "Arriving", note: "Around the corner", icon: "pin" },
  { name: "Delivered", note: "Enjoy your meal", icon: "smile" },
];

export const PROMO: Record<string, number> = { CRAVE5: 5 };
export const SERVICE_RATE = 0.08;
export const rest = (id: string) => restaurants.find((r) => r.id === id)!;
export const dishById = (rid: string, id: string) => rest(rid).menu.flatMap((s) => s.dishes).find((d) => d.id === id)!;
export const usd = (n: number) => "$" + n.toFixed(2);

const pastOrder: Order = {
  id: "CR-20418",
  rid: "fuoco",
  lines: [{ key: "p1-a", rid: "fuoco", dishId: "p1", name: "Margherita", qty: 1, unit: 16, choices: ['12"', "Classic"], img: a("dish-pizza.webp") }, { key: "sp1-a", rid: "fuoco", dishId: "sp1", name: "Garlic Knots", qty: 1, unit: 7, choices: [], img: a("dish-oven.webp") }],
  total: 31.4,
  placed: new Date(TODAY + "T19:12:00").getTime() - 5 * 864e5,
  stage: 4,
  address: "214 Bayview Ave",
  tip: 4,
  rating: 5,
  mode: "delivery",
};

export function useCrave() {
  const [cart, setCart] = useStore<CartLine[]>("food", "cart", []);
  const [orders, setOrders] = useStore<Order[]>("food", "orders", [pastOrder]);
  const [addr, setAddr] = useStore<string>("food", "address", "home");
  const [favs, setFavs] = useStore<string[]>("food", "favs", ["fuoco"]);
  const [promo, setPromo] = useStore<string>("food", "promo", "");
  const cartRid = cart[0]?.rid;
  const subtotal = cart.reduce((s, l) => s + l.unit * l.qty, 0);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  function add(rid: string, d: Dish, choices: string[], unit: number, qty: number, note?: string) {
    const key = d.id + "|" + choices.join(",") + "|" + (note || "");
    setCart((c) => {
      const base = c.length && c[0].rid !== rid ? [] : c;
      return base.some((l) => l.key === key)
        ? base.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        : [...base, { key, rid, dishId: d.id, name: d.name, qty, unit, choices, note, img: d.img, tone: d.tone }];
    });
  }
  const setQty = (key: string, qty: number) => setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty } : l))));
  function fees(mode: "delivery" | "pickup", tip: number) {
    const r = cartRid ? rest(cartRid) : null;
    const delivery = mode === "pickup" || !r ? 0 : r.fee;
    const service = Math.round(subtotal * SERVICE_RATE * 100) / 100;
    const discount = PROMO[promo] && subtotal >= 15 ? PROMO[promo] : 0;
    const tax = Math.round(subtotal * 0.075 * 100) / 100;
    return { delivery, service, discount, tax, tip, total: subtotal + delivery + service + tax + tip - discount };
  }
  function place(mode: "delivery" | "pickup", tip: number) {
    const f = fees(mode, tip);
    const a2 = addresses.find((x) => x.id === addr)!;
    const o: Order = { id: uid("CR-").slice(0, 8), rid: cartRid!, lines: cart, total: f.total, placed: Date.now(), stage: 0, address: a2.line, tip, mode };
    setOrders((os) => [o, ...os]);
    setCart([]);
    setPromo("");
    return o;
  }
  const advance = (id: string) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, stage: Math.min(4, o.stage + 1) } : o)));
  const rate = (id: string, rating: number) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, rating } : o)));
  const reorder = (o: Order) => setCart(o.lines.map((l) => ({ ...l })));
  const toggleFav = (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const active = orders.find((o) => o.stage < 4);
  return { cart, setCart, orders, addr, setAddr, favs, toggleFav, promo, setPromo, cartRid, subtotal, count, add, setQty, fees, place, advance, rate, reorder, active };
}

/** Price for a dish given chosen option names. */
export function priceFor(d: Dish, chosen: Record<string, string[]>) {
  let p = d.price;
  d.groups?.forEach((g) => (chosen[g.name] || []).forEach((n) => (p += g.options.find((o) => o.name === n)?.price || 0)));
  return p;
}
export function defaultChoices(d: Dish) {
  const c: Record<string, string[]> = {};
  d.groups?.forEach((g) => (c[g.name] = []));
  return c;
}
