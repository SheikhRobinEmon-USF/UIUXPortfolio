"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Bars, LineChart, Progress } from "../../kit/charts";
import { CountUp, Screen, Sheet, useToast, ease, spring } from "../../kit/ui";
import { useNav, type Nav } from "../../kit/store";
import { GOALS, TODAY, addDays, clock, dayLabel, fmtH, heartSamples, hypnogram, mealPresets, moods, stageColors, stageNames, workoutTypes, useVital } from "./data";
import { Breathe, Hypnogram, Insight, LiveWorkout, RingSet, Water, WeekStrip } from "./shared";

function Tile({ icon, label, value, unit, color, onClick, children }: { icon: string; label: string; value: React.ReactNode; unit?: string; color: string; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <motion.button className="vtm-tile" onClick={onClick} whileTap={{ scale: 0.97 }} style={{ "--tc": color } as React.CSSProperties}>
      <span className="vtm-tile-head"><Icon name={icon} size={16} /> {label}<Icon name="next" size={14} /></span>
      <span className="vtm-tile-val"><b>{value}</b> {unit}</span>
      {children}
    </motion.button>
  );
}

function Today({ nav, startPicker, openMeal }: { nav: Nav; startPicker: () => void; openMeal: () => void }) {
  const s = useVital();
  const toast = useToast();
  const d = s.day(s.date);
  const hr = heartSamples(s.date, d.workouts);
  return (
    <div className="ph-pad-top vtm-today">
      <div className="vtm-head">
        <div>
          <small>{new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}</small>
          <h1>Summary</h1>
        </div>
        <span className="vt-me">J</span>
      </div>
      <WeekStrip compact />
      <motion.div className="vtm-rings" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease, duration: 0.6 }}>
        <RingSet d={d} size={150} />
        <div className="vtm-ring-vals">
          <div><small style={{ color: "#ff6b4a" }}>Move</small><b><CountUp value={d.move} /><span className="u">/{GOALS.move}</span></b></div>
          <div><small style={{ color: "#9fd13a" }}>Exercise</small><b><CountUp value={d.exercise} /><span className="u">/{GOALS.exercise}</span></b></div>
          <div><small style={{ color: "#3fb8e6" }}>Stand</small><b><CountUp value={d.stand} /><span className="u">/{GOALS.stand}</span></b></div>
        </div>
      </motion.div>
      <div className="vtm-pad"><Insight d={d} /></div>
      <div className="vtm-actions">
        <button className="vt-btn" onClick={startPicker}><Icon name="play" size={16} fill /> Workout</button>
        <button className="vt-btn ghost" onClick={openMeal}><Icon name="fork" size={16} /> Meal</button>
        <button className="vt-btn ghost" onClick={() => nav.tab("mind")}><Icon name="leaf" size={16} /> Breathe</button>
      </div>
      <div className="vtm-tiles">
        <Tile icon="pulse" label="Heart" value={d.resting} unit="BPM rest" color="#ff6b4a" onClick={() => nav.push("heart")}>
          <svg viewBox="0 0 100 26" className="vtm-spark" aria-hidden="true"><polyline fill="none" stroke="#ff6b4a" strokeWidth="1.6" points={hr.map((v, i) => `${(i / 47) * 100},${26 - ((v - 50) / 100) * 26}`).join(" ")} /></svg>
        </Tile>
        <Tile icon="moon" label="Sleep" value={fmtH(d.sleep)} color="#6a6fe0" onClick={() => nav.tab("sleep")}>
          <span className="vt-stagebar">{hypnogram(s.date).map(([st, m], i) => <i key={i} style={{ flex: m, background: stageColors[st] }} />)}</span>
        </Tile>
        <Tile icon="run" label="Steps" value={<CountUp value={d.steps} />} color="#173d35" onClick={() => nav.tab("activity")}>
          <Progress value={d.steps / GOALS.steps} color="#173d35" label="Steps" />
        </Tile>
        <Tile icon="fork" label="Fuel" value={d.kcalIn} unit="kcal" color="#f2b84a" onClick={openMeal}>
          <span className="vtm-macro-mini"><i style={{ flex: d.protein * 4 || 1, background: "#ff6b4a" }} /><i style={{ flex: d.carbs * 4 || 1, background: "#f2b84a" }} /><i style={{ flex: d.fat * 9 || 1, background: "#58c4f0" }} /></span>
        </Tile>
      </div>
      <section className="vtm-card">
        <h2>Water</h2>
        <Water n={d.water} onAdd={(k) => { s.addWater(s.date, k); if (k > 0) toast(`${d.water + k} of ${GOALS.water}`, { icon: "drop" }); }} compact />
      </section>
      <section className="vtm-card">
        <h2>Habits <button className="vt-link" onClick={() => nav.tab("habits")}>See all</button></h2>
        <QuickHabits />
      </section>
    </div>
  );
}

function QuickHabits() {
  const s = useVital();
  const toast = useToast();
  const d = s.day(s.date);
  return (
    <ul className="vt-habits">
      {s.habits.map((h) => {
        const on = d.habits.includes(h.id);
        return (
          <li key={h.id}>
            <button className={on ? "on" : ""} aria-pressed={on} style={{ "--hc": h.color } as React.CSSProperties} onClick={() => { if (s.toggleHabit(s.date, h.id)) toast(`${s.streak(h.id) + 1} day streak!`, { icon: "flame" }); }}>
              <span className="vt-check"><AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}><Icon name="check" size={14} stroke={3} /></motion.span>}</AnimatePresence></span>
              <span className="grow">{h.name}</span>
              <span className="vt-streak"><Icon name="flame" size={13} /> {s.streak(h.id)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ActivityTab({ start }: { start: (t: string) => void }) {
  const s = useVital();
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  const sel = days.indexOf(s.date);
  return (
    <div className="ph-pad-top">
      <h1 className="vtm-title">Activity</h1>
      <section className="vtm-card">
        <h2>Move this week</h2>
        <Bars data={days.map((d) => s.day(d).move)} labels={days.map((d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" }))} goal={GOALS.move} color="#ff6b4a" selected={sel} onSelect={(i) => s.setDate(days[i])} label="Move per day" height={120} />
      </section>
      <h2 className="vtm-h2">Start a workout</h2>
      <div className="vtm-wtypes">
        {workoutTypes.map((w) => (
          <motion.button key={w.id} style={{ "--wc": w.color } as React.CSSProperties} onClick={() => start(w.id)} whileTap={{ scale: 0.95 }}>
            <span><Icon name={w.icon} size={24} /></span>
            <strong>{w.name}</strong>
            <Icon name="play" size={16} fill />
          </motion.button>
        ))}
      </div>
      <h2 className="vtm-h2">Recent</h2>
      <div className="vtm-wlist">
        {s.workouts.slice(0, 6).map((w) => {
          const t = workoutTypes.find((x) => x.id === w.type)!;
          return (
            <motion.div key={w.id} layout className="vtm-w" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="vt-wico" style={{ background: t.color }}><Icon name={t.icon} size={18} /></span>
              <div className="grow"><strong>{t.name}</strong><small>{dayLabel(w.date)} · {w.min} min · {w.hr} bpm</small></div>
              <b>{w.kcal}<small> kcal</small></b>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SleepTab() {
  const s = useVital();
  const d = s.day(s.date);
  const night = hypnogram(s.date);
  return (
    <div className="vtm-sleep">
      <div className="ph-pad-top">
        <h1 className="vtm-title light">Sleep</h1>
        <div className="vtm-pad"><WeekStrip compact /></div>
        <div className="vtm-sleep-hero">
          <motion.b key={s.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{fmtH(d.sleep)}</motion.b>
          <span>{clock(d.bedtime)} – {clock(d.bedtime + d.sleep)}</span>
        </div>
        <div className="vtm-pad"><Hypnogram data={night} height={150} /></div>
        <div className="vtm-stage-grid">
          {[0, 1, 2, 3].map((st) => (
            <div key={st}><i style={{ background: stageColors[st] }} /><span>{stageNames[st]}</span><b>{Math.round(night.filter(([x]) => x === st).reduce((a, [, m]) => a + m, 0))}m</b></div>
          ))}
        </div>
        <p className="vtm-tip"><Icon name="moon" size={16} /> Wind-down reminder at 10:15 PM keeps your bedtime consistent.</p>
      </div>
    </div>
  );
}

function MindTab() {
  const s = useVital();
  const toast = useToast();
  const [mood, setMood] = useState(s.journal[TODAY]?.mood || 0);
  const [text, setText] = useState(s.journal[TODAY]?.text || "");
  return (
    <div className="ph-pad-top vtm-mind">
      <h1 className="vtm-title">Mind</h1>
      <section className="vtm-card breathe"><Breathe compact /></section>
      <section className="vtm-card">
        <h2>How are you feeling?</h2>
        <div className="vt-moods" role="radiogroup" aria-label="Mood">
          {moods.map((m) => (
            <motion.button key={m.n} role="radio" aria-checked={mood === m.n} onClick={() => setMood(m.n)} whileTap={{ scale: 0.9 }} animate={{ scale: mood === m.n ? 1.15 : 1 }} style={{ "--mc": m.color } as React.CSSProperties}>
              <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="currentColor" /><circle cx="14" cy="16" r="2" fill="#173d35" /><circle cx="26" cy="16" r="2" fill="#173d35" /><path d={`M12 ${26 - (m.n - 3)} Q20 ${26 + (m.n - 3) * 2.4} 28 ${26 - (m.n - 3)}`} stroke="#173d35" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
              <span>{m.label}</span>
            </motion.button>
          ))}
        </div>
        <textarea className="vt-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="A sentence about today…" aria-label="Journal" />
        <button className="vt-btn block" disabled={!mood} onClick={() => { s.saveJournal(TODAY, { mood, text, tags: [] }); toast("Saved to journal", { icon: "check" }); }}>Save</button>
      </section>
    </div>
  );
}

function HabitsTab() {
  const s = useVital();
  const [name, setName] = useState("");
  const days = Array.from({ length: 35 }, (_, i) => addDays(TODAY, i - 34));
  return (
    <div className="ph-pad-top">
      <h1 className="vtm-title">Habits</h1>
      <section className="vtm-card"><QuickHabits /></section>
      <section className="vtm-card">
        <h2>Last 5 weeks</h2>
        {s.habits.map((h) => (
          <div key={h.id} className="vtm-heat-row">
            <span>{h.name}</span>
            <div className="vt-heat small" style={{ "--hc": h.color } as React.CSSProperties}>
              {days.map((d) => <i key={d} className={(s.done[d] || []).includes(h.id) ? "on" : ""} />)}
            </div>
          </div>
        ))}
      </section>
      <form className="vt-add-habit vtm-pad" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { s.addHabit(name.trim()); setName(""); } }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit" aria-label="New habit" />
        <button className="vt-btn" disabled={!name.trim()}>Add</button>
      </form>
    </div>
  );
}

function HeartScreen({ nav }: { nav: Nav }) {
  const s = useVital();
  const d = s.day(s.date);
  const hr = heartSamples(s.date, d.workouts);
  const [at, setAt] = useState<number | null>(null);
  const month = Array.from({ length: 30 }, (_, i) => s.day(addDays(TODAY, i - 29)).resting);
  return (
    <div>
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>Heart</strong><span /></div>
      <div className="vtm-pad">
        <div className="vt-big-num"><b>{at != null ? hr[at] : d.resting}</b> <span>BPM · {at != null ? clock(at / 2) : "resting"}</span></div>
        <LineChart data={hr} color="#ff6b4a" height={150} onScrub={setAt} label="Heart rate today" format={(n) => `${n} BPM`} />
        <h2 className="vtm-h2 flush">Resting, 30 days</h2>
        <LineChart data={month} color="#173d35" height={110} label="Resting heart rate, 30 days" format={(n) => `${n} BPM`} />
        <p className="vt-muted small">HRV {d.hrv} ms. These figures are simulated and not medical advice.</p>
      </div>
    </div>
  );
}

export default function VitalMobile() {
  const s = useVital();
  const toast = useToast();
  const nav = useNav({ name: "today" });
  const [live, setLive] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [meal, setMeal] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  const tabs: [string, string, string][] = [["today", "home", "Summary"], ["activity", "flame", "Activity"], ["sleep", "moon", "Sleep"], ["mind", "leaf", "Mind"], ["habits", "check", "Habits"]];
  const dark = nav.screen === "sleep";
  return (
    <div className={`vital ph-app vtm ${dark ? "dark" : ""}`} style={{ "--status-ink": dark || live ? "#fff" : "#173d35" } as React.CSSProperties}>
      <div className="ph-scroll" ref={scroller}>
        <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir}>
          {nav.screen === "today" && <Today nav={nav} startPicker={() => setPicker(true)} openMeal={() => setMeal(true)} />}
          {nav.screen === "activity" && <ActivityTab start={setLive} />}
          {nav.screen === "sleep" && <SleepTab />}
          {nav.screen === "mind" && <MindTab />}
          {nav.screen === "habits" && <HabitsTab />}
          {nav.screen === "heart" && <HeartScreen nav={nav} />}
        </Screen>
      </div>
      <nav className="ph-tabs" aria-label="VITAL">
        {tabs.map(([k, i, l]) => (
          <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)}>
            <Icon name={i} size={23} />
            {l}
          </button>
        ))}
      </nav>
      <Sheet open={picker} onClose={() => setPicker(false)} title="Start a workout">
        <div className="vtm-wtypes">
          {workoutTypes.map((w) => (
            <button key={w.id} style={{ "--wc": w.color } as React.CSSProperties} onClick={() => { setPicker(false); setLive(w.id); }}>
              <span><Icon name={w.icon} size={24} /></span>
              <strong>{w.name}</strong>
              <Icon name="play" size={16} fill />
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={meal} onClose={() => setMeal(false)} title="Log a meal">
        {mealPresets.map((m) => (
          <button key={m.name} className="ph-row" onClick={() => { s.logMeal({ ...m, date: s.date }); setMeal(false); toast(`${m.kcal} kcal logged`, { icon: "check" }); }}>
            <span className="vt-slot">{m.slot[0]}</span>
            <span className="grow">{m.name}<small>{m.kcal} kcal · P {m.p} C {m.c} F {m.f}</small></span>
            <Icon name="plus" size={18} />
          </button>
        ))}
      </Sheet>
      <LiveWorkout type={live} onClose={() => setLive(null)} onFinish={(min, kcal, hr, km) => { s.logWorkout({ date: TODAY, type: live!, min, kcal, hr, km }); s.setDate(TODAY); toast("Workout saved", { icon: "flame" }); nav.tab("today"); }} />
    </div>
  );
}
