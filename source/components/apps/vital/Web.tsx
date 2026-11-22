"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Bars, Donut, LineChart, Progress } from "../../kit/charts";
import { CountUp, Modal, Segmented, useToast, ease, spring, Empty, Reveal } from "../../kit/ui";
import { GOALS, TODAY, addDays, clock, dayLabel, fmtH, heartSamples, hypnogram, mealPresets, moods, stageColors, stageNames, workoutTypes, useVital } from "./data";
import { Breathe, Hypnogram, Insight, LiveWorkout, RingSet, Water, WeekStrip } from "./shared";

type Page = "summary" | "activity" | "sleep" | "nutrition" | "mind" | "habits" | "trends" | "journal";

function Card({ children, className = "", title, action, i = 0 }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode; i?: number }) {
  return (
    <motion.section className={`vt-card ${className}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: i * 0.06 }}>
      {title && (
        <header className="vt-card-head">
          <h2>{title}</h2>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

function Summary({ go, start, openMeal }: { go: (p: Page) => void; start: () => void; openMeal: () => void }) {
  const s = useVital();
  const toast = useToast();
  const d = s.day(s.date);
  const hr = heartSamples(s.date, d.workouts);
  const [hrAt, setHrAt] = useState<number | null>(null);
  const night = hypnogram(s.date);
  const deep = night.filter(([st]) => st === 3).reduce((a, [, m]) => a + m, 0);
  return (
    <div className="vt-grid">
      <Card className="vt-rings-card span2" i={0}>
        <div className="vt-rings-wrap">
          <RingSet d={d} size={210} />
          <div className="vt-ring-stats">
            {[
              ["Move", d.move, GOALS.move, "kcal", "#ff6b4a"],
              ["Exercise", d.exercise, GOALS.exercise, "min", "#9fd13a"],
              ["Stand", d.stand, GOALS.stand, "hrs", "#3fb8e6"],
            ].map(([l, v, g, u, c]) => (
              <div key={l as string}>
                <small style={{ color: c as string }}>{l}</small>
                <strong>
                  <CountUp value={v as number} />
                  <span className="u">/{g} {u}</span>
                </strong>
                <Progress value={(v as number) / (g as number)} color={c as string} label={`${l} progress`} />
              </div>
            ))}
          </div>
        </div>
        <Insight d={d} />
        <div className="vt-quick">
          <button className="vt-btn" onClick={start}><Icon name="play" size={16} fill /> Start workout</button>
          <button className="vt-btn ghost" onClick={openMeal}><Icon name="plus" size={16} /> Log meal</button>
          <button className="vt-btn ghost" onClick={() => go("mind")}><Icon name="leaf" size={16} /> Breathe</button>
        </div>
      </Card>
      <Card title="Heart rate" i={1} action={<span className="vt-muted">Resting {d.resting} BPM</span>}>
        <div className="vt-big-num">
          <b>{hrAt != null ? hr[hrAt] : d.resting}</b> <span>BPM · {hrAt != null ? clock(hrAt / 2) : "resting"}</span>
        </div>
        <LineChart data={hr} label="Heart rate through the day" color="#ff6b4a" height={120} onScrub={setHrAt} labels={hr.map((_, i) => clock(i / 2))} format={(n) => `${n} BPM`} />
        <p className="vt-muted small">HRV {d.hrv} ms · scrub the chart to read any time</p>
      </Card>
      <Card title="Sleep" i={2} action={<button className="vt-link" onClick={() => go("sleep")}>Details →</button>} className="vt-night">
        <div className="vt-big-num light">
          <b>{fmtH(d.sleep)}</b> <span>{clock(d.bedtime)} – {clock(d.bedtime + d.sleep)}</span>
        </div>
        <div className="vt-stagebar">
          {night.map(([st, m], i) => <i key={i} style={{ flex: m, background: stageColors[st] }} />)}
        </div>
        <p className="vt-muted small">Deep sleep {Math.round(deep)} min · goal {GOALS.sleep}h</p>
      </Card>
      <Card title="Fuel" i={3} action={<button className="vt-link" onClick={() => go("nutrition")}>Meals →</button>}>
        <div className="vt-fuel">
          <Donut
            size={120}
            width={16}
            label="Macronutrients"
            segments={[
              { value: d.protein * 4 || 1, color: "#ff6b4a", label: "Protein" },
              { value: d.carbs * 4 || 1, color: "#f2b84a", label: "Carbs" },
              { value: d.fat * 9 || 1, color: "#58c4f0", label: "Fat" },
            ]}
          >
            <b>{d.kcalIn}</b>
            <small>kcal</small>
          </Donut>
          <ul className="vt-macros">
            <li><i style={{ background: "#ff6b4a" }} />Protein <b>{d.protein} g</b></li>
            <li><i style={{ background: "#f2b84a" }} />Carbs <b>{d.carbs} g</b></li>
            <li><i style={{ background: "#58c4f0" }} />Fat <b>{d.fat} g</b></li>
          </ul>
        </div>
        <Water n={d.water} onAdd={(k) => { s.addWater(s.date, k); if (k > 0) toast(`${d.water + k} glasses today`, { icon: "drop" }); }} compact />
      </Card>
      <Card title="Today's habits" i={4} action={<button className="vt-link" onClick={() => go("habits")}>All →</button>}>
        <HabitList date={s.date} />
      </Card>
      <Card title="Steps" i={5}>
        <div className="vt-big-num"><b><CountUp value={d.steps} /></b> <span>of {GOALS.steps.toLocaleString()}</span></div>
        <Progress value={d.steps / GOALS.steps} color="#173d35" label="Steps progress" />
        <p className="vt-muted small">{(d.steps * 0.00076).toFixed(1)} km · {Math.round(d.steps / 105)} min on your feet</p>
      </Card>
    </div>
  );
}

function HabitList({ date }: { date: string }) {
  const s = useVital();
  const toast = useToast();
  const d = s.day(date);
  return (
    <ul className="vt-habits">
      {s.habits.map((h) => {
        const on = d.habits.includes(h.id);
        return (
          <li key={h.id}>
            <button
              className={on ? "on" : ""}
              aria-pressed={on}
              onClick={() => {
                const now = s.toggleHabit(date, h.id);
                if (now) toast(`${h.name} — ${s.streak(h.id) + 1} day streak`, { icon: "flame" });
              }}
              style={{ "--hc": h.color } as React.CSSProperties}
            >
              <span className="vt-check">
                <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}><Icon name="check" size={14} stroke={3} /></motion.span>}</AnimatePresence>
              </span>
              <span className="grow">{h.name}</span>
              <span className="vt-streak"><Icon name="flame" size={14} /> {s.streak(h.id)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Activity({ start }: { start: (t?: string) => void }) {
  const s = useVital();
  const [metric, setMetric] = useState<"move" | "exercise" | "steps">("move");
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  const vals = days.map((d) => s.day(d)[metric]);
  const sel = days.indexOf(s.date);
  const d = s.day(s.date);
  return (
    <div className="vt-grid">
      <Card title="This week" className="span2" action={<Segmented label="Metric" value={metric} onChange={setMetric} options={[{ value: "move", label: "Move" }, { value: "exercise", label: "Exercise" }, { value: "steps", label: "Steps" }]} />}>
        <div className="vt-big-num"><b>{vals[sel >= 0 ? sel : 6].toLocaleString()}</b> <span>{metric === "move" ? "kcal" : metric === "exercise" ? "min" : "steps"} on {dayLabel(s.date)}</span></div>
        <Bars data={vals} labels={days.map((x) => new Date(x + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }))} selected={sel} onSelect={(i) => s.setDate(days[i])} goal={metric === "move" ? GOALS.move : metric === "exercise" ? GOALS.exercise : GOALS.steps} color={metric === "move" ? "#ff6b4a" : metric === "exercise" ? "#9fd13a" : "#173d35"} label={`${metric} per day`} height={180} />
      </Card>
      <Card title="Start a workout" className="span2">
        <div className="vt-wtypes">
          {workoutTypes.map((w, i) => (
            <motion.button key={w.id} style={{ "--wc": w.color } as React.CSSProperties} onClick={() => start(w.id)} data-type={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
              <span><Icon name={w.icon} size={26} /></span>
              {w.name}
            </motion.button>
          ))}
        </div>
      </Card>
      <Card title="Workouts" className="span2">
        {s.workouts.length ? (
          <ul className="vt-wlist">
            {s.workouts.slice(0, 8).map((w) => {
              const t = workoutTypes.find((x) => x.id === w.type)!;
              return (
                <motion.li key={w.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="vt-wico" style={{ background: t.color }}><Icon name={t.icon} size={20} /></span>
                  <div className="grow"><strong>{t.name}</strong><small>{dayLabel(w.date)}</small></div>
                  <span><b>{w.min}</b> min</span>
                  <span><b>{w.kcal}</b> kcal</span>
                  <span><b>{w.hr}</b> avg bpm</span>
                  {w.km && <span><b>{w.km}</b> km</span>}
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <Empty icon="run" title="No workouts yet" />
        )}
        <p className="vt-muted small">{d.workouts.length} workout{d.workouts.length === 1 ? "" : "s"} on {dayLabel(s.date)}</p>
      </Card>
    </div>
  );
}

function Sleep() {
  const s = useVital();
  const d = s.day(s.date);
  const night = hypnogram(s.date);
  const totals = [0, 1, 2, 3].map((st) => night.filter(([x]) => x === st).reduce((a, [, m]) => a + m, 0));
  const week = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  return (
    <div className="vt-grid">
      <Card className="vt-night span2" title={`Night of ${dayLabel(addDays(s.date, -1))}`}>
        <div className="vt-sleep-head">
          <div className="vt-big-num light"><b>{fmtH(d.sleep)}</b> <span>asleep · {clock(d.bedtime)} – {clock(d.bedtime + d.sleep)}</span></div>
          <div className="vt-sleep-score">
            <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="7" /><motion.circle cx="40" cy="40" r="34" fill="none" stroke="#9fd13a" strokeWidth="7" strokeLinecap="round" strokeDasharray={214} initial={{ strokeDashoffset: 214 }} animate={{ strokeDashoffset: 214 * (1 - Math.min(1, d.sleep / 8.5)) }} transform="rotate(-90 40 40)" transition={{ duration: 1.2, ease }} /></svg>
            <b>{Math.round(Math.min(100, (d.sleep / 8.5) * 100))}</b>
            <small>score</small>
          </div>
        </div>
        <Hypnogram data={night} height={170} />
        <div className="vt-stage-totals">
          {totals.map((m, st) => (
            <div key={st}><i style={{ background: stageColors[st] }} /><span>{stageNames[st]}</span><b>{Math.round(m)} min</b></div>
          ))}
        </div>
      </Card>
      <Card title="Consistency" className="span2">
        <div className="vt-consistency">
          {week.map((x) => {
            const b = s.day(x);
            const left = ((b.bedtime - 21) / 12) * 100;
            const width = (b.sleep / 12) * 100;
            return (
              <button key={x} onClick={() => s.setDate(x)} aria-pressed={x === s.date}>
                <small>{new Date(x + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}</small>
                <span className="vt-cons-track"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease }} style={{ left: `${left}%`, width: `${width}%` }} /></span>
                <b>{fmtH(b.sleep)}</b>
              </button>
            );
          })}
          <div className="vt-cons-axis"><span>9 PM</span><span>12 AM</span><span>3 AM</span><span>6 AM</span><span>9 AM</span></div>
        </div>
        <p className="vt-muted small">Your bedtime varies by about 50 minutes. Keeping it within 30 minutes tends to make mornings easier.</p>
      </Card>
    </div>
  );
}

function Nutrition({ openMeal }: { openMeal: () => void }) {
  const s = useVital();
  const toast = useToast();
  const d = s.day(s.date);
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
  return (
    <div className="vt-grid">
      <Card title={`${d.kcalIn.toLocaleString()} kcal eaten`} className="span2" action={<button className="vt-btn" onClick={openMeal}><Icon name="plus" size={16} /> Log meal</button>}>
        <div className="vt-macro-bars">
          {[["Protein", d.protein, 110, "#ff6b4a"], ["Carbs", d.carbs, 240, "#f2b84a"], ["Fat", d.fat, 70, "#58c4f0"], ["Energy", d.kcalIn, GOALS.kcal, "#173d35"]].map(([l, v, g, c]) => (
            <div key={l as string}><span>{l}</span><Progress value={(v as number) / (g as number)} color={c as string} label={`${l}`} /><b>{v}{l === "Energy" ? "" : " g"} <small>/ {g}</small></b></div>
          ))}
        </div>
      </Card>
      {slots.map((slot, i) => (
        <Card key={slot} title={slot} i={i}>
          <AnimatePresence initial={false}>
            {d.meals.filter((m) => m.slot === slot).map((m) => (
              <motion.div key={m.id} className="vt-meal" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="grow"><strong>{m.name}</strong><small>P {m.p} · C {m.c} · F {m.f}</small></div>
                <b>{m.kcal}</b>
                <button className="kit-icon-btn" onClick={() => { s.removeMeal(m.id); toast("Meal removed"); }} aria-label={`Remove ${m.name}`}><Icon name="trash" size={16} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
          {!d.meals.some((m) => m.slot === slot) && <button className="vt-add-slot" onClick={openMeal}><Icon name="plus" size={16} /> Add {slot.toLowerCase()}</button>}
        </Card>
      ))}
      <Card title="Water" className="span2">
        <Water n={d.water} onAdd={(k) => s.addWater(s.date, k)} />
      </Card>
    </div>
  );
}

function Habits() {
  const s = useVital();
  const [name, setName] = useState("");
  const weeks = 12;
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(TODAY, i - weeks * 7 + 1));
  return (
    <div className="vt-grid">
      <Card title={`Habits on ${dayLabel(s.date)}`} className="span2">
        <HabitList date={s.date} />
        <form className="vt-add-habit" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { s.addHabit(name.trim()); setName(""); } }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a small habit — e.g. ‘Floss’" aria-label="New habit" maxLength={40} />
          <button className="vt-btn" disabled={!name.trim()}>Add</button>
        </form>
      </Card>
      <Card title="Last 12 weeks" className="span2">
        <div className="vt-heat-wrap">
          {s.habits.map((h) => (
            <div key={h.id} className="vt-heat-row">
              <span className="vt-heat-name">{h.name}<small><Icon name="flame" size={12} /> {s.streak(h.id)} day streak</small></span>
              <div className="vt-heat" style={{ "--hc": h.color } as React.CSSProperties}>
                {days.map((d, i) => (
                  <motion.i key={d} className={(s.done[d] || []).includes(h.id) ? "on" : ""} title={`${d}${(s.done[d] || []).includes(h.id) ? " ✓" : ""}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.003 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Trends() {
  const s = useVital();
  const [range, setRange] = useState<"7" | "30">("30");
  const [metric, setMetric] = useState<"resting" | "sleep" | "steps" | "hrv">("resting");
  const n = Number(range);
  const days = Array.from({ length: n }, (_, i) => addDays(TODAY, i - n + 1));
  const vals = days.map((d) => s.day(d)[metric] as number);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const prev = Array.from({ length: n }, (_, i) => s.day(addDays(TODAY, i - 2 * n + 1))[metric] as number);
  const prevAvg = prev.reduce((a, b) => a + b, 0) / prev.length;
  const [at, setAt] = useState<number | null>(null);
  const unit = { resting: "BPM", sleep: "h", steps: "steps", hrv: "ms" }[metric];
  const better = metric === "resting" ? avg < prevAvg : avg > prevAvg;
  return (
    <div className="vt-grid">
      <Card className="span2" title="Trends" action={<div className="vt-trend-ctl"><Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "Week" }, { value: "30", label: "Month" }]} /></div>}>
        <div className="vt-seg wide" role="radiogroup" aria-label="Metric">
          {([["resting", "Resting HR"], ["hrv", "HRV"], ["sleep", "Sleep"], ["steps", "Steps"]] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={metric === k} onClick={() => setMetric(k)}>{l}</button>)}
        </div>
        <div className="vt-big-num">
          <b>{at != null ? vals[at].toLocaleString() : (Math.round(avg * 10) / 10).toLocaleString()}</b> <span>{unit} · {at != null ? dayLabel(days[at]) : `${range}-day average`}</span>
        </div>
        <LineChart data={vals} labels={days.map((d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }))} color="#173d35" height={220} onScrub={setAt} baseline={avg} label={`${metric} trend`} format={(v) => `${v} ${unit}`} />
        <div className={`vt-compare ${better ? "up" : "down"}`}>
          <Icon name={better ? "out" : "in"} size={18} />
          {Math.abs(Math.round(((avg - prevAvg) / prevAvg) * 1000) / 10)}% {avg > prevAvg ? "higher" : "lower"} than the previous {range} days — {better ? "trending in a good direction." : "worth keeping an eye on."}
        </div>
      </Card>
    </div>
  );
}

function JournalPage() {
  const s = useVital();
  const toast = useToast();
  const cur = s.journal[s.date];
  const [mood, setMood] = useState(cur?.mood || 0);
  const [text, setText] = useState(cur?.text || "");
  const [tags, setTags] = useState<string[]>(cur?.tags || []);
  const all = ["Rested", "Outdoors", "Social", "Stressed", "Focused", "Tired", "Grateful"];
  const past = Object.entries(s.journal).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return (
    <div className="vt-grid">
      <Card className="span2" title={`How was ${s.date === TODAY ? "today" : dayLabel(s.date)}?`}>
        <div className="vt-moods" role="radiogroup" aria-label="Mood">
          {moods.map((m) => (
            <motion.button key={m.n} role="radio" aria-checked={mood === m.n} onClick={() => setMood(m.n)} whileTap={{ scale: 0.9 }} animate={{ scale: mood === m.n ? 1.12 : 1 }} style={{ "--mc": m.color } as React.CSSProperties}>
              <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="currentColor" /><circle cx="14" cy="16" r="2" fill="#173d35" /><circle cx="26" cy="16" r="2" fill="#173d35" /><path d={`M12 ${26 - (m.n - 3)} Q20 ${26 + (m.n - 3) * 2.4} 28 ${26 - (m.n - 3)}`} stroke="#173d35" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
              <span>{m.label}</span>
            </motion.button>
          ))}
        </div>
        <div className="vt-tags">{all.map((t) => <button key={t} aria-pressed={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>)}</div>
        <textarea className="vt-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="One thing that went well, one thing you'd change…" aria-label="Journal entry" />
        <button className="vt-btn" disabled={!mood} onClick={() => { s.saveJournal(s.date, { mood, text, tags }); toast("Entry saved", { icon: "check" }); }}>Save entry</button>
      </Card>
      <Card title="Past entries" className="span2">
        {past.map(([d, j]) => (
          <Reveal key={d} className="vt-entry">
            <span className="vt-entry-mood" style={{ background: moods[j.mood - 1].color }}>{moods[j.mood - 1].label}</span>
            <div><strong>{dayLabel(d)}</strong><p>{j.text || "No notes."}</p><small>{j.tags.join(" · ")}</small></div>
          </Reveal>
        ))}
      </Card>
    </div>
  );
}

export default function VitalWeb() {
  const s = useVital();
  const toast = useToast();
  const [page, setPage] = useState<Page>("summary");
  const [picker, setPicker] = useState(false);
  const [live, setLive] = useState<string | null>(null);
  const [meal, setMeal] = useState(false);
  const nav: [Page, string, string][] = [
    ["summary", "home", "Summary"],
    ["activity", "flame", "Activity"],
    ["sleep", "moon", "Sleep"],
    ["nutrition", "fork", "Nutrition"],
    ["mind", "leaf", "Mindfulness"],
    ["habits", "check", "Habits"],
    ["trends", "chart", "Trends"],
    ["journal", "edit", "Journal"],
  ];
  const go = (p: Page) => {
    setPage(p);
    scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  return (
    <div className="vital vt-web">
      <aside className="vt-side">
        <div className="vt-logo">vital<i /></div>
        <nav aria-label="VITAL">
          {nav.map(([k, i, l]) => (
            <button key={k} aria-current={page === k ? "page" : undefined} onClick={() => go(k)}>
              {page === k && <motion.span layoutId="vt-nav" className="vt-nav-bg" transition={spring} />}
              <Icon name={i} size={20} />
              <span>{l}</span>
            </button>
          ))}
        </nav>
        <div className="vt-side-foot">
          <span className="vt-me">J</span>
          <div><strong>Jordan</strong><small>Goals: move 520 · sleep 8h</small></div>
        </div>
      </aside>
      <main className="vt-main">
        <header className="vt-top">
          <div>
            <motion.h1 key={page + s.date} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {page === "summary" ? (s.date === TODAY ? "Good afternoon, Jordan" : dayLabel(s.date)) : nav.find((n) => n[0] === page)![2]}
            </motion.h1>
            <p className="vt-muted">{dayLabel(s.date)} · {new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <WeekStrip />
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}>
            {page === "summary" && <Summary go={go} start={() => setPicker(true)} openMeal={() => setMeal(true)} />}
            {page === "activity" && <Activity start={(t) => (t ? setLive(t) : setPicker(true))} />}
            {page === "sleep" && <Sleep />}
            {page === "nutrition" && <Nutrition openMeal={() => setMeal(true)} />}
            {page === "mind" && (
              <div className="vt-grid">
                <Card className="span2 vt-mind">
                  <Breathe />
                </Card>
                <Card title="Mindful minutes" className="span2">
                  <Bars data={Array.from({ length: 7 }, (_, i) => s.day(addDays(TODAY, i - 6)).mindful)} labels={Array.from({ length: 7 }, (_, i) => new Date(addDays(TODAY, i - 6) + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }))} color="#a48bf2" label="Mindful minutes per day" height={120} selected={6} />
                </Card>
              </div>
            )}
            {page === "habits" && <Habits />}
            {page === "trends" && <Trends />}
            {page === "journal" && <JournalPage key={s.date} />}
          </motion.div>
        </AnimatePresence>
        <footer className="vt-footer">VITAL · Concept by Sheikh Robin Emon · Simulated, non-medical data. Not a medical device.</footer>
      </main>
      <Modal open={picker} onClose={() => setPicker(false)} label="Choose a workout" className="vt-modal">
        <div className="vt-modal-body">
          <h2>What are you doing?</h2>
          <div className="vt-wtypes">
            {workoutTypes.map((w) => (
              <button key={w.id} style={{ "--wc": w.color } as React.CSSProperties} onClick={() => { setPicker(false); setLive(w.id); }}>
                <span><Icon name={w.icon} size={26} /></span>
                {w.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
      <Modal open={meal} onClose={() => setMeal(false)} label="Log a meal" className="vt-modal">
        <div className="vt-modal-body">
          <h2>Log a meal</h2>
          <p className="vt-muted">Quick add from your recent meals. Values are estimates.</p>
          <div className="vt-meal-pick">
            {mealPresets.map((m) => (
              <button key={m.name} onClick={() => { s.logMeal({ ...m, date: s.date }); setMeal(false); toast(`${m.name} · ${m.kcal} kcal`, { icon: "check" }); }}>
                <span className="vt-slot">{m.slot}</span>
                <strong>{m.name}</strong>
                <small>{m.kcal} kcal · P {m.p} C {m.c} F {m.f}</small>
              </button>
            ))}
          </div>
        </div>
      </Modal>
      <LiveWorkout
        type={live}
        onClose={() => setLive(null)}
        onFinish={(min, kcal, hr, km) => {
          s.logWorkout({ date: TODAY, type: live!, min, kcal, hr, km });
          s.setDate(TODAY);
          toast("Workout saved — rings updated", { icon: "flame" });
        }}
      />
    </div>
  );
}
