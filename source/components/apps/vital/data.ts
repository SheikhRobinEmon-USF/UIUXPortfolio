"use client";

import { useStore, uid, TODAY, addDays } from "../../kit/store";

/* Deterministic pseudo-random per date so every day has believable data. */
function rnd(date: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (const ch of date) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export const GOALS = { move: 520, exercise: 30, stand: 12, steps: 8000, water: 8, sleep: 8, kcal: 2100 };

export type Workout = { id: string; date: string; type: string; min: number; kcal: number; hr: number; km?: number };
export type Meal = { id: string; date: string; name: string; kcal: number; p: number; c: number; f: number; slot: "Breakfast" | "Lunch" | "Dinner" | "Snack" };
export type Habit = { id: string; name: string; icon: string; color: string };
export type Journal = { mood: number; text: string; tags: string[] };

export const workoutTypes = [
  { id: "run", name: "Outdoor run", icon: "run", met: 9.8, color: "#ff6b4a" },
  { id: "walk", name: "Brisk walk", icon: "route", met: 4.3, color: "#58c4f0" },
  { id: "cycle", name: "Cycling", icon: "bike", met: 7.5, color: "#b8e04a" },
  { id: "yoga", name: "Yoga flow", icon: "yoga", met: 3, color: "#a48bf2" },
  { id: "strength", name: "Strength", icon: "bolt", met: 5, color: "#f2b84a" },
];

export const mealPresets = [
  { name: "Greek yoghurt, berries & oats", kcal: 380, p: 24, c: 48, f: 9, slot: "Breakfast" as const },
  { name: "Harvest grain bowl", kcal: 540, p: 22, c: 68, f: 18, slot: "Lunch" as const },
  { name: "Salmon, greens & rice", kcal: 620, p: 42, c: 52, f: 24, slot: "Dinner" as const },
  { name: "Apple & almond butter", kcal: 210, p: 5, c: 24, f: 11, slot: "Snack" as const },
  { name: "Tonkotsu ramen", kcal: 780, p: 32, c: 86, f: 30, slot: "Dinner" as const },
  { name: "Protein smoothie", kcal: 300, p: 28, c: 34, f: 6, slot: "Snack" as const },
];

export const defaultHabits: Habit[] = [
  { id: "stretch", name: "Stretch 5 minutes", icon: "yoga", color: "#a48bf2" },
  { id: "outside", name: "Walk outside", icon: "sun", color: "#f2b84a" },
  { id: "read", name: "Read 20 pages", icon: "list", color: "#58c4f0" },
  { id: "screens", name: "No screens after 10pm", icon: "moon", color: "#6a6fe0" },
  { id: "water", name: "Drink 8 glasses", icon: "drop", color: "#3fb8d6" },
];

export const moods = [
  { n: 1, label: "Rough", color: "#e0786a" },
  { n: 2, label: "Low", color: "#e9a76a" },
  { n: 3, label: "Okay", color: "#e3cf6a" },
  { n: 4, label: "Good", color: "#9fcf6a" },
  { n: 5, label: "Great", color: "#5fbf86" },
];

export function baseDay(date: string) {
  const r = (s: number) => rnd(date, s);
  const weekend = [0, 6].includes(new Date(date + "T12:00:00").getDay());
  return {
    move: Math.round(300 + r(1) * 340 + (weekend ? 60 : 0)),
    exercise: Math.round(8 + r(2) * 38),
    stand: Math.round(7 + r(3) * 6),
    steps: Math.round(4200 + r(4) * 7600),
    resting: Math.round(56 + r(5) * 8),
    hrv: Math.round(38 + r(6) * 30),
    sleep: Math.round((6.1 + r(7) * 2.4) * 10) / 10,
    bedtime: 22.3 + r(8) * 1.6,
    mood: 2 + Math.round(r(9) * 3),
  };
}

/** Hypnogram for a night: list of [stage, minutes]. Stages: 0 awake, 1 REM, 2 core, 3 deep. */
export function hypnogram(date: string) {
  const total = baseDay(date).sleep * 60;
  const out: [number, number][] = [];
  let t = 0;
  let k = 0;
  while (t < total) {
    const cycle = k++;
    const seq: [number, number][] = [
      [2, 20 + rnd(date, 20 + cycle) * 15],
      [3, Math.max(5, (cycle < 2 ? 35 : 12) * (0.7 + rnd(date, 30 + cycle) * 0.6))],
      [2, 15 + rnd(date, 40 + cycle) * 10],
      [1, (cycle < 2 ? 12 : 28) * (0.7 + rnd(date, 50 + cycle) * 0.6)],
      ...(rnd(date, 60 + cycle) > 0.6 ? ([[0, 4]] as [number, number][]) : []),
    ];
    for (const [st, m] of seq) {
      const mm = Math.min(m, total - t);
      if (mm <= 0) break;
      out.push([st, Math.round(mm)]);
      t += mm;
    }
  }
  return out;
}

export function heartSamples(date: string, extra: Workout[]) {
  const base = baseDay(date).resting;
  return Array.from({ length: 48 }, (_, i) => {
    const hour = i / 2;
    const day = hour > 7 && hour < 22 ? 14 + Math.sin(hour / 2) * 6 : 0;
    const spike = extra.some((w) => Math.abs(hour - 18) < w.min / 60) ? 50 : hour > 17 && hour < 18 && rnd(date, 70) > 0.5 ? 40 : 0;
    return Math.round(base + day + spike + rnd(date, 100 + i) * 8);
  });
}

const seedWorkouts: Workout[] = [
  { id: "w1", date: addDays(TODAY, -1), type: "run", min: 32, kcal: 341, hr: 148, km: 5.2 },
  { id: "w2", date: addDays(TODAY, -3), type: "yoga", min: 25, kcal: 92, hr: 98 },
  { id: "w3", date: addDays(TODAY, -4), type: "cycle", min: 45, kcal: 410, hr: 136, km: 16.4 },
];
const seedMeals: Meal[] = [
  { id: "m1", date: TODAY, ...mealPresets[0] },
  { id: "m2", date: TODAY, ...mealPresets[1] },
];
const seedHabits = (() => {
  const h: Record<string, string[]> = {};
  for (let i = 1; i < 84; i++) {
    const d = addDays(TODAY, -i);
    h[d] = defaultHabits.filter((x, k) => rnd(d, 200 + k) > (k === 3 ? 0.55 : 0.32)).map((x) => x.id);
  }
  h[TODAY] = ["stretch"];
  return h;
})();

export function useVital() {
  const [date, setDate] = useStore<string>("health", "date", TODAY);
  const [workouts, setWorkouts] = useStore<Workout[]>("health", "workouts", seedWorkouts);
  const [meals, setMeals] = useStore<Meal[]>("health", "meals", seedMeals);
  const [water, setWater] = useStore<Record<string, number>>("health", "water", { [TODAY]: 3 });
  const [habits, setHabits] = useStore<Habit[]>("health", "habits", defaultHabits);
  const [done, setDone] = useStore<Record<string, string[]>>("health", "habitsDone", seedHabits);
  const [mindful, setMindful] = useStore<Record<string, number>>("health", "mindful", {});
  const [journal, setJournal] = useStore<Record<string, Journal>>("health", "journal", { [addDays(TODAY, -1)]: { mood: 4, text: "Long walk by the water after work. Slept well.", tags: ["Outdoors", "Rested"] } });

  function day(d: string) {
    const b = baseDay(d);
    const ws = workouts.filter((w) => w.date === d);
    const ms = meals.filter((m) => m.date === d);
    const kcalIn = ms.reduce((a, m) => a + m.kcal, 0);
    const isToday = d === TODAY;
    const partial = isToday ? 0.62 : 1;
    return {
      ...b,
      move: Math.round(b.move * partial + ws.reduce((a, w) => a + w.kcal, 0)),
      exercise: Math.round(b.exercise * partial + ws.reduce((a, w) => a + w.min, 0)),
      stand: Math.round(b.stand * (isToday ? 0.7 : 1)),
      steps: Math.round(b.steps * partial + ws.reduce((a, w) => a + (w.km || 0) * 1300, 0)),
      workouts: ws,
      meals: ms,
      kcalIn,
      protein: ms.reduce((a, m) => a + m.p, 0),
      carbs: ms.reduce((a, m) => a + m.c, 0),
      fat: ms.reduce((a, m) => a + m.f, 0),
      water: water[d] ?? (isToday ? 0 : 5 + Math.round(rnd(d, 11) * 4)),
      mindful: (mindful[d] || 0) + (isToday ? 0 : Math.round(rnd(d, 12) * 10)),
      habits: done[d] || [],
      journal: journal[d],
    };
  }
  const logWorkout = (w: Omit<Workout, "id">) => setWorkouts((ws) => [{ ...w, id: uid("w") }, ...ws]);
  const logMeal = (m: Omit<Meal, "id">) => setMeals((ms) => [...ms, { ...m, id: uid("m") }]);
  const removeMeal = (id: string) => setMeals((ms) => ms.filter((m) => m.id !== id));
  const addWater = (d: string, n: number) => setWater((w) => ({ ...w, [d]: Math.max(0, Math.min(12, (w[d] ?? 0) + n)) }));
  const toggleHabit = (d: string, id: string) => {
    let on = false;
    setDone((x) => {
      const cur = x[d] || [];
      on = !cur.includes(id);
      return { ...x, [d]: on ? [...cur, id] : cur.filter((y) => y !== id) };
    });
    return on;
  };
  const addHabit = (name: string) => setHabits((h) => [...h, { id: uid("h"), name, icon: "sparkle", color: ["#ff6b4a", "#b8e04a", "#58c4f0", "#a48bf2"][h.length % 4] }]);
  const removeHabit = (id: string) => setHabits((h) => h.filter((x) => x.id !== id));
  const addMindful = (d: string, m: number) => setMindful((x) => ({ ...x, [d]: (x[d] || 0) + m }));
  const saveJournal = (d: string, j: Journal) => setJournal((x) => ({ ...x, [d]: j }));
  function streak(id: string) {
    let n = 0;
    for (let i = 0; i < 90; i++) {
      const d = addDays(TODAY, -i);
      if ((done[d] || []).includes(id)) n++;
      else if (i > 0) break;
    }
    return n;
  }
  return { date, setDate, day, workouts, logWorkout, meals, logMeal, removeMeal, addWater, habits, addHabit, removeHabit, done, toggleHabit, streak, addMindful, journal, saveJournal };
}

export const stageNames = ["Awake", "REM", "Core", "Deep"];
export const stageColors = ["#f2b84a", "#58c4f0", "#6a8bf2", "#4a3fb8"];
export const fmtH = (h: number) => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
export const clock = (h: number) => {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h % 1) * 60);
  return `${hh % 12 || 12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
};
export const dayLabel = (d: string) => (d === TODAY ? "Today" : d === addDays(TODAY, -1) ? "Yesterday" : new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
export { TODAY, addDays };
