"use client";

import { useStore, uid, TODAY, addDays } from "../../kit/store";

export type Cat = { id: string; name: string; icon: string; color: string };
export const cats: Cat[] = [
  { id: "groceries", name: "Groceries", icon: "bag", color: "#2bc48a" },
  { id: "dining", name: "Dining", icon: "fork", color: "#f2994a" },
  { id: "transport", name: "Transport", icon: "car", color: "#3a5ef0" },
  { id: "shopping", name: "Shopping", icon: "tag", color: "#c86bf0" },
  { id: "bills", name: "Bills & utilities", icon: "bolt", color: "#f2c94c" },
  { id: "subs", name: "Subscriptions", icon: "repeat", color: "#56ccf2" },
  { id: "travel", name: "Travel", icon: "globe", color: "#eb5757" },
  { id: "health", name: "Health", icon: "pulse", color: "#6fcf97" },
  { id: "income", name: "Income", icon: "in", color: "#0f1b3d" },
  { id: "transfer", name: "Transfers", icon: "send", color: "#8a94b0" },
];
export const C = (id: string) => cats.find((c) => c.id === id)!;

export type Account = { id: string; name: string; kind: "Checking" | "Savings" | "Credit" | "Investments"; bank: string; mask: string; balance: number; color: string };
export type Txn = { id: string; date: string; merchant: string; amount: number; cat: string; account: string; pending?: boolean; note?: string; split?: { with: string; share: number } };
export type Budget = { cat: string; limit: number };
export type Sub = { id: string; name: string; amount: number; cycle: "mo" | "yr"; next: string; cat: string; color: string; status: "active" | "cancelled"; used: string };
export type Goal = { id: string; name: string; target: number; saved: number; due: string; icon: string; color: string };
export type Card = { id: string; name: string; mask: string; exp: string; frozen: boolean; limit: number; spent: number; tone: [string, string]; virtual?: boolean };
export type Contact = { id: string; name: string; handle: string; color: string };

export const contacts: Contact[] = [
  { id: "maya", name: "Maya Rivera", handle: "@maya", color: "#f2994a" },
  { id: "sam", name: "Sam Okafor", handle: "@samok", color: "#2bc48a" },
  { id: "lee", name: "Lee Park", handle: "@leep", color: "#c86bf0" },
  { id: "ana", name: "Ana Souza", handle: "@anas", color: "#3a5ef0" },
  { id: "landlord", name: "Harbor Lofts", handle: "Rent · ACH", color: "#0f1b3d" },
];

const seedAccounts: Account[] = [
  { id: "chk", name: "Everyday", kind: "Checking", bank: "Moneta", mask: "4821", balance: 4286.42, color: "#3a5ef0" },
  { id: "sav", name: "High-yield savings", kind: "Savings", bank: "Moneta", mask: "9930", balance: 12480.0, color: "#2bc48a" },
  { id: "cc", name: "Moneta Card", kind: "Credit", bank: "Moneta", mask: "1107", balance: -842.18, color: "#0f1b3d" },
  { id: "inv", name: "Index portfolio", kind: "Investments", bank: "Brokerage", mask: "5512", balance: 18920.55, color: "#c86bf0" },
];

const merchants: [string, string, number, number][] = [
  ["Fresh Market", "groceries", 34, 96],
  ["Corner Café", "dining", 5, 14],
  ["Kumo Ramen", "dining", 18, 42],
  ["Metro Transit", "transport", 2.75, 2.75],
  ["Lyft", "transport", 11, 26],
  ["Atelier", "shopping", 68, 129],
  ["Pharmacy+", "health", 9, 38],
  ["Fuel & Go", "transport", 32, 54],
  ["Good Buns", "dining", 14, 31],
  ["Bookshop", "shopping", 15, 42],
];

function seedTxns(): Txn[] {
  const out: Txn[] = [];
  let seed = 7;
  const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let d = 0; d < 62; d++) {
    const date = addDays(TODAY, -d);
    const n = 1 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const [m, cat, lo, hi] = merchants[Math.floor(r() * merchants.length)];
      out.push({ id: `t${d}-${i}`, date, merchant: m, amount: -Math.round((lo + r() * (hi - lo)) * 100) / 100, cat, account: r() > 0.45 ? "cc" : "chk", pending: d === 0 && i === 0 });
    }
    const dom = Number(date.slice(8));
    if (dom === 1) out.push({ id: `rent${d}`, date, merchant: "Harbor Lofts — Rent", amount: -1650, cat: "bills", account: "chk" });
    if (dom === 15 || dom === 30) out.push({ id: `pay${d}`, date, merchant: "Payroll — Studio North", amount: 2840, cat: "income", account: "chk" });
    if (dom === 8) out.push({ id: `elec${d}`, date, merchant: "City Power & Light", amount: -74.2, cat: "bills", account: "chk" });
    if (dom === 12) out.push({ id: `flix${d}`, date, merchant: "FRAME Premium", amount: -15.99, cat: "subs", account: "cc" });
    if (dom === 18) out.push({ id: `gym${d}`, date, merchant: "Studio Gym", amount: -42, cat: "health", account: "cc" });
    if (dom === 3) out.push({ id: `mus${d}`, date, merchant: "Soundwave Music", amount: -10.99, cat: "subs", account: "cc" });
  }
  return out;
}

const seedSubs: Sub[] = [
  { id: "s1", name: "FRAME Premium", amount: 15.99, cycle: "mo", next: "2026-12-12", cat: "subs", color: "#a7a3f0", status: "active", used: "Used 3 days ago" },
  { id: "s2", name: "Soundwave Music", amount: 10.99, cycle: "mo", next: "2026-12-03", cat: "subs", color: "#2bc48a", status: "active", used: "Used today" },
  { id: "s3", name: "Studio Gym", amount: 42, cycle: "mo", next: "2026-12-18", cat: "health", color: "#f2994a", status: "active", used: "Last visit 26 days ago" },
  { id: "s4", name: "Cloud Storage 2TB", amount: 99.99, cycle: "yr", next: "2027-03-02", cat: "subs", color: "#56ccf2", status: "active", used: "Used weekly" },
  { id: "s5", name: "News Daily", amount: 8, cycle: "mo", next: "2026-11-28", cat: "subs", color: "#eb5757", status: "active", used: "Last opened 41 days ago" },
];

const seedGoals: Goal[] = [
  { id: "g1", name: "Lisbon trip", target: 3200, saved: 1960, due: "2027-05-01", icon: "globe", color: "#f2994a" },
  { id: "g2", name: "Emergency fund", target: 10000, saved: 7400, due: "2027-12-31", icon: "shield", color: "#2bc48a" },
  { id: "g3", name: "New laptop", target: 2200, saved: 450, due: "2027-02-15", icon: "bolt", color: "#3a5ef0" },
];

const seedCards: Card[] = [
  { id: "c1", name: "Moneta Card", mask: "1107", exp: "08/29", frozen: false, limit: 5000, spent: 842.18, tone: ["#0f1b3d", "#3a5ef0"] },
  { id: "c2", name: "Online shopping", mask: "6634", exp: "02/28", frozen: false, limit: 500, spent: 128.0, tone: ["#c86bf0", "#3a5ef0"], virtual: true },
  { id: "c3", name: "Travel", mask: "2045", exp: "11/28", frozen: true, limit: 2000, spent: 0, tone: ["#f2994a", "#eb5757"], virtual: true },
];

export function useMoneta() {
  const [accounts, setAccounts] = useStore<Account[]>("finance", "accounts", seedAccounts);
  const [txns, setTxns] = useStore<Txn[]>("finance", "txns", seedTxns());
  const [budgets, setBudgets] = useStore<Budget[]>("finance", "budgets", [
    { cat: "groceries", limit: 450 },
    { cat: "dining", limit: 300 },
    { cat: "transport", limit: 220 },
    { cat: "shopping", limit: 250 },
    { cat: "subs", limit: 60 },
    { cat: "health", limit: 80 },
  ]);
  const [subs, setSubs] = useStore<Sub[]>("finance", "subs", seedSubs);
  const [goals, setGoals] = useStore<Goal[]>("finance", "goals", seedGoals);
  const [cards, setCards] = useStore<Card[]>("finance", "cards", seedCards);
  const [hidden, setHidden] = useStore<boolean>("finance", "hidden", false);

  const netWorth = accounts.reduce((a, x) => a + x.balance, 0);
  const monthKey = TODAY.slice(0, 7);
  const monthTx = txns.filter((t) => t.date.startsWith(monthKey));
  const spentBy = (cat: string, list = monthTx) => -list.filter((t) => t.cat === cat && t.amount < 0).reduce((a, t) => a + (t.split ? t.amount * t.split.share : t.amount), 0);
  const income = monthTx.filter((t) => t.amount > 0 && t.cat === "income").reduce((a, t) => a + t.amount, 0);
  const spending = -monthTx.filter((t) => t.amount < 0 && t.cat !== "transfer").reduce((a, t) => a + (t.split ? t.amount * t.split.share : t.amount), 0);

  /** Net worth history: walk balances backwards through transactions. */
  function history(days: number) {
    const out: number[] = [];
    let v = netWorth;
    const byDate: Record<string, number> = {};
    txns.forEach((t) => (byDate[t.date] = (byDate[t.date] || 0) + t.amount));
    for (let i = 0; i < days; i++) {
      const d = addDays(TODAY, -i);
      out.unshift(Math.round((v + Math.sin(i / 3.3) * 120 + (i % 7) * 12) * 100) / 100);
      v -= byDate[d] || 0;
      v -= 18; // investment drift
    }
    // light smoothing so paydays read as steps rather than spikes
    const sm = out.map((_, i) => {
      const w = out.slice(Math.max(0, i - 2), i + 3);
      return Math.round((w.reduce((a, b) => a + b, 0) / w.length) * 100) / 100;
    });
    sm[sm.length - 1] = netWorth;
    return sm;
  }

  const recat = (id: string, cat: string) => setTxns((ts) => ts.map((t) => (t.id === id ? { ...t, cat } : t)));
  const note = (id: string, n: string) => setTxns((ts) => ts.map((t) => (t.id === id ? { ...t, note: n } : t)));
  const split = (id: string, who: string, share: number) => setTxns((ts) => ts.map((t) => (t.id === id ? { ...t, split: who ? { with: who, share } : undefined } : t)));
  const setLimit = (cat: string, limit: number) => setBudgets((b) => (b.some((x) => x.cat === cat) ? b.map((x) => (x.cat === cat ? { ...x, limit } : x)) : [...b, { cat, limit }]));
  const cancelSub = (id: string) => setSubs((s) => s.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
  const resumeSub = (id: string) => setSubs((s) => s.map((x) => (x.id === id ? { ...x, status: "active" } : x)));
  const contribute = (gid: string, amount: number, from = "chk") => {
    setGoals((g) => g.map((x) => (x.id === gid ? { ...x, saved: Math.round((x.saved + amount) * 100) / 100 } : x)));
    setAccounts((as) => as.map((a) => (a.id === from ? { ...a, balance: a.balance - amount } : a.id === "sav" ? { ...a, balance: a.balance + amount } : a)));
    setTxns((ts) => [{ id: uid("t"), date: TODAY, merchant: `To goal — ${goals.find((x) => x.id === gid)?.name}`, amount: -amount, cat: "transfer", account: from }, ...ts]);
  };
  const addGoal = (g: Omit<Goal, "id" | "saved">) => setGoals((gs) => [...gs, { ...g, id: uid("g"), saved: 0 }]);
  function send(to: string, amount: number, from: string, memo: string) {
    const c = contacts.find((x) => x.id === to)!;
    setAccounts((as) => as.map((a) => (a.id === from ? { ...a, balance: Math.round((a.balance - amount) * 100) / 100 } : a)));
    const t: Txn = { id: uid("t"), date: TODAY, merchant: `To ${c.name}`, amount: -amount, cat: "transfer", account: from, note: memo, pending: true };
    setTxns((ts) => [t, ...ts]);
    return t;
  }
  function move(from: string, to: string, amount: number) {
    setAccounts((as) => as.map((a) => (a.id === from ? { ...a, balance: a.balance - amount } : a.id === to ? { ...a, balance: a.balance + amount } : a)));
    setTxns((ts) => [{ id: uid("t"), date: TODAY, merchant: `Transfer to ${accounts.find((a) => a.id === to)?.name}`, amount: -amount, cat: "transfer", account: from }, ...ts]);
  }
  const freeze = (id: string) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c)));
  const cardLimit = (id: string, limit: number) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, limit } : c)));
  const newCard = (name: string) => setCards((cs) => [...cs, { id: uid("c"), name, mask: String(1000 + Math.floor(Math.random() * 8999)), exp: "12/29", frozen: false, limit: 300, spent: 0, tone: [["#2bc48a", "#3a5ef0"], ["#f2c94c", "#f2994a"], ["#56ccf2", "#c86bf0"]][cs.length % 3] as [string, string], virtual: true }]);
  return { accounts, txns, budgets, subs, goals, cards, hidden, setHidden, netWorth, monthTx, spentBy, income, spending, history, recat, note, split, setLimit, cancelSub, resumeSub, contribute, addGoal, send, move, freeze, cardLimit, newCard };
}

export const usd = (n: number, cents = true) => (n < 0 ? "−" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
export const mask = (s: string, hidden: boolean) => (hidden ? "••••••" : s);
export const dLabel = (d: string) => (d === TODAY ? "Today" : d === addDays(TODAY, -1) ? "Yesterday" : new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
export { TODAY, addDays };
