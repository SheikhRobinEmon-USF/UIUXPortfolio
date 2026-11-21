"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Rings } from "../../kit/charts";
import { ease, spring } from "../../kit/ui";
import { GOALS, TODAY, addDays, baseDay, stageColors, stageNames, workoutTypes, useVital } from "./data";

export function WeekStrip({ compact = false }: { compact?: boolean }) {
  const s = useVital();
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  return (
    <div className={`vt-week ${compact ? "compact" : ""}`} role="radiogroup" aria-label="Choose a day">
      {days.map((d) => {
        const x = s.day(d);
        const on = s.date === d;
        return (
          <button key={d} role="radio" aria-checked={on} onClick={() => s.setDate(d)}>
            <small>{new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" })}</small>
            <Rings
              size={compact ? 30 : 36}
              width={compact ? 3.5 : 4}
              label=""
              rings={[
                { value: x.move / GOALS.move, color: "#ff6b4a" },
                { value: x.exercise / GOALS.exercise, color: "#9fd13a" },
                { value: x.stand / GOALS.stand, color: "#3fb8e6" },
              ]}
            />
            <span>{Number(d.slice(8))}</span>
            {on && <motion.i layoutId={compact ? "vt-wk-m" : "vt-wk"} className="vt-week-on" transition={spring} />}
          </button>
        );
      })}
    </div>
  );
}

export function RingSet({ d, size = 200 }: { d: ReturnType<ReturnType<typeof useVital>["day"]>; size?: number }) {
  return (
    <Rings
      size={size}
      width={size * 0.095}
      label={`Move ${d.move} of ${GOALS.move} kcal, exercise ${d.exercise} of ${GOALS.exercise} minutes, stand ${d.stand} of ${GOALS.stand} hours`}
      rings={[
        { value: d.move / GOALS.move, color: "#ff6b4a" },
        { value: d.exercise / GOALS.exercise, color: "#9fd13a" },
        { value: d.stand / GOALS.stand, color: "#3fb8e6" },
      ]}
    />
  );
}

export function Hypnogram({ data, height = 140 }: { data: [number, number][]; height?: number }) {
  const total = data.reduce((a, [, m]) => a + m, 0);
  let x = 0;
  return (
    <div className="vt-hypno" style={{ height }} role="img" aria-label="Sleep stages through the night">
      {[0, 1, 2, 3].map((st) => (
        <div key={st} className="vt-hypno-row">
          <span>{stageNames[st]}</span>
        </div>
      ))}
      <svg viewBox={`0 0 ${total} 4`} preserveAspectRatio="none">
        {data.map(([st, m], i) => {
          const el = (
            <motion.rect
              key={i}
              x={x}
              y={st}
              width={m}
              height={0.82}
              rx={0.3}
              fill={stageColors[st]}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.02, ease }}
              style={{ transformOrigin: `${x}px ${st + 0.4}px` }}
            />
          );
          x += m;
          return el;
        })}
      </svg>
    </div>
  );
}

export function Water({ n, onAdd, compact = false }: { n: number; onAdd: (k: number) => void; compact?: boolean }) {
  return (
    <div className={`vt-water ${compact ? "compact" : ""}`}>
      <div className="vt-glasses" role="group" aria-label={`${n} of ${GOALS.water} glasses`}>
        {Array.from({ length: GOALS.water }, (_, i) => (
          <button key={i} className={i < n ? "full" : ""} onClick={() => onAdd(i < n ? -(n - i) : i + 1 - n)} aria-label={`Set water to ${i < n ? i : i + 1} glasses`}>
            <svg viewBox="0 0 24 30" aria-hidden="true">
              <path d="M3 3h18l-2.2 24H5.2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <motion.path d="M4.2 10h15.6l-1.7 16H5.9z" fill="currentColor" initial={false} animate={{ opacity: i < n ? 1 : 0, y: i < n ? 0 : 8 }} transition={{ ...spring, delay: i < n ? 0.03 * i : 0 }} />
            </svg>
          </button>
        ))}
      </div>
      <div className="vt-water-row">
        <span><b>{n}</b> / {GOALS.water} glasses</span>
        <button className="vt-pill" onClick={() => onAdd(1)} disabled={n >= 12}><Icon name="plus" size={16} /> Glass</button>
      </div>
    </div>
  );
}

/** Live workout: timer, simulated heart rate, energy and a hold-to-finish control. */
export function LiveWorkout({ type, onClose, onFinish }: { type: string | null; onClose: () => void; onFinish: (min: number, kcal: number, hr: number, km?: number) => void }) {
  const w = workoutTypes.find((x) => x.id === type);
  const [sec, setSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hr, setHr] = useState(92);
  const [hold, setHold] = useState(0);
  const [summary, setSummary] = useState<null | { min: number; kcal: number; hr: number; km?: number }>(null);
  const holdRef = useRef<any>(0);
  const hrs = useRef<number[]>([]);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!type) {
      setSec(0);
      setPaused(false);
      setSummary(null);
      hrs.current = [];
      return;
    }
    if (paused || summary) return;
    const id = setInterval(() => {
      // demo time runs 12× faster so a session feels real in a short visit
      setSec((s) => s + 12);
      setHr((h) => {
        const target = 90 + (w?.met || 5) * 7 + Math.sin(Date.now() / 3000) * 8;
        const v = Math.round(h + (target - h) * 0.25 + (Math.random() - 0.5) * 4);
        hrs.current.push(v);
        return v;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [type, paused, summary, w]);
  const min = sec / 60;
  const kcal = Math.round((w?.met || 5) * 70 * (min / 60) * 1.05);
  const km = type === "run" ? min / 6.1 : type === "walk" ? min / 11 : type === "cycle" ? min / 2.7 : undefined;
  function startHold() {
    clearInterval(holdRef.current);
    const t0 = performance.now();
    holdRef.current = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 900);
      setHold(p);
      if (p >= 1) {
        clearInterval(holdRef.current);
        const avg = Math.round(hrs.current.reduce((a, b) => a + b, 0) / Math.max(1, hrs.current.length)) || hr;
        setSummary({ min: Math.max(1, Math.round(min)), kcal: Math.max(5, kcal), hr: avg, km: km ? Math.round(km * 10) / 10 : undefined });
      }
    }, 16);
  }
  function endHold() {
    clearInterval(holdRef.current);
    if (!summary) setHold(0);
  }
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return (
    <AnimatePresence>
      {type && w && (
        <motion.div className="kit-layer vt-live" style={{ "--wc": w.color } as React.CSSProperties} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.45, ease }} role="dialog" aria-label={`${w.name} in progress`}>
          {!summary ? (
            <div className="vt-live-body">
              <div className="vt-live-top">
                <span className="vt-live-type"><Icon name={w.icon} size={18} /> {w.name}</span>
                <span className={`vt-live-state ${paused ? "paused" : ""}`}>{paused ? "Paused" : "Live"}</span>
              </div>
              <div className="vt-live-timer" aria-live="off">
                {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </div>
              <div className="vt-live-stats">
                <div>
                  <motion.span className="vt-beat" animate={paused || reduce ? {} : { scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 60 / hr }}>
                    <Icon name="heart" size={22} fill />
                  </motion.span>
                  <b>{hr}</b>
                  <small>BPM</small>
                </div>
                <div><Icon name="flame" size={22} /><b>{kcal}</b><small>KCAL</small></div>
                {km != null && <div><Icon name="route" size={22} /><b>{km.toFixed(2)}</b><small>KM</small></div>}
              </div>
              <div className="vt-zone" aria-label="Heart rate zone">
                {["Warm-up", "Fat burn", "Cardio", "Peak"].map((z, i) => (
                  <span key={z} className={hr >= 95 + i * 22 && hr < 117 + i * 22 ? "on" : ""}>{z}</span>
                ))}
              </div>
              <div className="vt-live-ctl">
                <button className="vt-live-btn" onClick={() => setPaused(!paused)} aria-label={paused ? "Resume" : "Pause"}>
                  <Icon name={paused ? "play" : "pause"} size={30} fill />
                </button>
                <button
                  className="vt-live-btn end"
                  onPointerDown={startHold}
                  onPointerUp={endHold}
                  onPointerLeave={endHold}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !e.repeat && startHold()}
                  onKeyUp={endHold}
                  aria-label="Hold to end workout"
                >
                  <svg viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="4" />
                    <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={232} strokeDashoffset={232 * (1 - hold)} transform="rotate(-90 40 40)" strokeLinecap="round" />
                  </svg>
                  <Icon name="close" size={28} />
                </button>
              </div>
              <p className="vt-live-hint">Hold ✕ to finish · demo time runs 12× faster</p>
            </div>
          ) : (
            <motion.div className="vt-live-body summary" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
              <motion.span className="vt-medal" initial={{ rotate: -40, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ ...spring, delay: 0.15 }}><Icon name={w.icon} size={40} /></motion.span>
              <h2>Nice work.</h2>
              <p>{w.name} · {summary.min} min</p>
              <div className="vt-sum-grid">
                <div><b>{summary.kcal}</b><small>Active kcal</small></div>
                <div><b>{summary.hr}</b><small>Avg BPM</small></div>
                {summary.km && <div><b>{summary.km}</b><small>Kilometres</small></div>}
              </div>
              <button className="vt-btn light block" onClick={() => { onFinish(summary.min, summary.kcal, summary.hr, summary.km); onClose(); }}>Save workout</button>
              <button className="vt-link light" onClick={onClose}>Discard</button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PATTERNS = {
  calm: { name: "Calm · 4-7-8", steps: [["Breathe in", 4], ["Hold", 7], ["Breathe out", 8]] as [string, number][] },
  box: { name: "Focus · Box", steps: [["Breathe in", 4], ["Hold", 4], ["Breathe out", 4], ["Hold", 4]] as [string, number][] },
  easy: { name: "Easy · 5-5", steps: [["Breathe in", 5], ["Breathe out", 5]] as [string, number][] },
};

export function Breathe({ compact = false }: { compact?: boolean }) {
  const s = useVital();
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>("easy");
  const [mins, setMins] = useState(1);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const p = PATTERNS[pattern];
  useEffect(() => {
    if (!running) return;
    setLeft(p.steps[phase][1]);
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setLeft((l) => {
        if (l <= 1) {
          setPhase((ph) => (ph + 1) % p.steps.length);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);
  useEffect(() => {
    if (running && elapsed >= mins * 60) {
      setRunning(false);
      setDone(true);
      s.addMindful(TODAY, mins);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);
  const [label, dur] = p.steps[phase];
  const scale = label === "Breathe in" ? 1 : label === "Breathe out" ? 0.55 : phase > 0 && p.steps[phase - 1][0] === "Breathe in" ? 1 : 0.55;
  return (
    <div className={`vt-breathe ${compact ? "compact" : ""} ${running ? "running" : ""}`}>
      <div className="vt-orb-wrap">
        <motion.div className="vt-orb" animate={{ scale: running ? scale : 0.7 }} transition={{ duration: running ? dur : 1, ease: "easeInOut" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span key={i} style={{ rotate: i * 60 }} animate={{ rotate: running ? i * 60 + (label === "Breathe in" ? 30 : 0) : i * 60 }} transition={{ duration: dur, ease: "easeInOut" }}>
              <i />
            </motion.span>
          ))}
        </motion.div>
        <div className="vt-orb-label" aria-live="polite">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}><b>Well done</b><small>{mins} mindful minute{mins > 1 ? "s" : ""} logged</small></motion.div>
          ) : running ? (
            <AnimatePresence mode="wait">
              <motion.div key={phase + label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <b>{label}</b>
                <small>{left}</small>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div><b>Breathe</b><small>{p.name}</small></div>
          )}
        </div>
      </div>
      {running && (
        <div className="vt-breathe-prog"><motion.i animate={{ width: `${(elapsed / (mins * 60)) * 100}%` }} /></div>
      )}
      {!running && (
        <div className="vt-breathe-ctl">
          <div className="vt-seg" role="radiogroup" aria-label="Pattern">
            {(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).map((k) => <button key={k} role="radio" aria-checked={pattern === k} onClick={() => { setPattern(k); setDone(false); }}>{PATTERNS[k].name.split(" · ")[0]}</button>)}
          </div>
          <div className="vt-seg" role="radiogroup" aria-label="Duration">
            {[1, 3, 5].map((m) => <button key={m} role="radio" aria-checked={mins === m} onClick={() => { setMins(m); setDone(false); }}>{m} min</button>)}
          </div>
        </div>
      )}
      <button className={`vt-btn ${running ? "ghost" : ""}`} onClick={() => { if (running) { setRunning(false); } else { setDone(false); setElapsed(0); setPhase(0); setRunning(true); } }}>
        {running ? "End session" : done ? "Again" : "Begin"}
      </button>
    </div>
  );
}

export function Insight({ d }: { d: ReturnType<ReturnType<typeof useVital>["day"]> }) {
  const lines = [
    d.move >= 520 ? "You closed your Move ring — lovely." : `${520 - d.move} kcal to close Move. A 15-minute walk would do it.`,
    d.sleep >= 7.5 ? `You slept ${d.sleep}h — above your 7-day average.` : "A slightly earlier night could help tomorrow feel easier.",
    d.resting < 60 ? "Resting heart rate is in your usual calm range." : "Resting heart rate is a little higher than usual — be gentle with yourself.",
  ];
  return (
    <div className="vt-insight">
      <Icon name="sparkle" size={18} />
      <span>{lines[(d.steps + d.move) % 3]}</span>
    </div>
  );
}

export const base = baseDay;
