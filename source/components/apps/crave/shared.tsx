"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, animate, useMotionValue } from "motion/react";
import { Icon } from "../../kit/icons";
import { Qty, ease, spring } from "../../kit/ui";
import { defaultChoices, priceFor, usd, type Dish, type Restaurant, stages } from "./data";

export function Cover({ r, className = "" }: { r: Restaurant; className?: string }) {
  if (r.cover) return <img className={`cr-cover ${className}`} src={r.cover} alt="" loading="lazy" />;
  return (
    <div className={`cr-cover cr-brand ${className}`} style={{ background: r.brand!.bg, color: r.brand!.fg }} aria-hidden="true">
      <span>{r.brand!.mark}</span>
      <svg viewBox="0 0 200 200" className="cr-brand-blob">
        <path d="M44 30c34-22 100-14 124 22s10 98-34 116-104 6-118-38S10 52 44 30z" fill="currentColor" opacity=".12" />
      </svg>
    </div>
  );
}

export function DishImg({ d, className = "" }: { d: { img?: string; tone?: string; name: string }; className?: string }) {
  if (d.img) return <img className={`cr-dish-img ${className}`} src={d.img} alt="" loading="lazy" />;
  return (
    <div className={`cr-dish-img cr-dish-art ${className}`} style={{ background: `radial-gradient(circle at 30% 25%, #fff6, transparent 45%), ${d.tone || "#e9a23b"}` }} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="54" r="30" fill="#fff" opacity=".88" />
        <circle cx="50" cy="54" r="22" fill={d.tone || "#e9a23b"} opacity=".85" />
        <circle cx="42" cy="48" r="4" fill="#fff" opacity=".7" />
        <circle cx="58" cy="58" r="3" fill="#fff" opacity=".6" />
      </svg>
    </div>
  );
}

/** Dish customisation: required groups, optional extras, notes, quantity. */
export function Customizer({ d, onAdd, compact = false }: { d: Dish; onAdd: (choices: string[], unit: number, qty: number, note: string) => void; compact?: boolean }) {
  const [chosen, setChosen] = useState<Record<string, string[]>>(defaultChoices(d));
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [shake, setShake] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLFieldSetElement | null>>({});
  const unit = priceFor(d, chosen);
  const missing = d.groups?.filter((g) => g.required && !(chosen[g.name] || []).length) || [];
  function toggle(g: NonNullable<Dish["groups"]>[number], name: string) {
    setChosen((c) => {
      const cur = c[g.name] || [];
      if (g.max === 1) return { ...c, [g.name]: [name] };
      if (cur.includes(name)) return { ...c, [g.name]: cur.filter((x) => x !== name) };
      if (cur.length >= g.max) return c;
      return { ...c, [g.name]: [...cur, name] };
    });
  }
  function submit() {
    if (missing.length) {
      setShake(missing[0].name);
      refs.current[missing[0].name]?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShake(null), 600);
      return;
    }
    onAdd(Object.values(chosen).flat(), unit, qty, note);
  }
  return (
    <div className={`cr-custom ${compact ? "compact" : ""}`}>
      <div className="cr-custom-scroll">
        {d.groups?.map((g) => {
          const ok = !g.required || (chosen[g.name] || []).length > 0;
          return (
            <motion.fieldset
              key={g.name}
              ref={(el) => {
                refs.current[g.name] = el;
              }}
              className="cr-group"
              animate={shake === g.name ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <legend>
                <span>{g.name}</span>
                <small>{g.max === 1 ? "Choose 1" : `Choose up to ${g.max}`}</small>
                <motion.em className={g.required ? (ok ? "ok" : "req") : "opt"} key={String(ok)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={spring}>
                  {g.required ? (ok ? <><Icon name="check" size={12} stroke={2.6} /> Done</> : "Required") : "Optional"}
                </motion.em>
              </legend>
              {g.options.map((o) => {
                const on = (chosen[g.name] || []).includes(o.name);
                const disabled = !on && g.max > 1 && (chosen[g.name] || []).length >= g.max;
                return (
                  <label key={o.name} className={`cr-opt ${on ? "on" : ""} ${disabled ? "dis" : ""}`}>
                    <input type={g.max === 1 ? "radio" : "checkbox"} name={d.id + g.name} checked={on} disabled={disabled} onChange={() => toggle(g, o.name)} />
                    <span className={`cr-tick ${g.max === 1 ? "round" : ""}`}>{on && <Icon name="check" size={13} stroke={3} />}</span>
                    <span className="grow">{o.name}</span>
                    {o.price > 0 && <span className="cr-opt-price">+{usd(o.price)}</span>}
                  </label>
                );
              })}
            </motion.fieldset>
          );
        })}
        <label className="cr-note">
          <span>Special instructions</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Allergies, no onions, sauce on the side…" rows={2} maxLength={140} />
        </label>
      </div>
      <div className="cr-custom-foot">
        <Qty value={qty} min={1} onChange={setQty} />
        <motion.button className="cr-btn grow" onClick={submit} whileTap={{ scale: 0.97 }}>
          <span>{missing.length ? `Choose ${missing[0].name.toLowerCase()}` : "Add to cart"}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.b key={unit * qty} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}>
              {usd(unit * qty)}
            </motion.b>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

/* ---------- Tracking map ---------- */

const ROUTE = "M86 304 L86 236 Q86 218 104 218 L212 218 Q230 218 230 200 L230 128 Q230 110 248 110 L330 110";

export function courierProgress(stage: number) {
  return [0, 0, 0.55, 0.88, 1][stage] ?? 0;
}

export function TrackMap({ stage, className = "", compact = false }: { stage: number; className?: string; compact?: boolean }) {
  const path = useRef<SVGPathElement>(null);
  const prog = useMotionValue(courierProgress(stage));
  const [pt, setPt] = useState({ x: 86, y: 304, a: 0 });
  useEffect(() => {
    const c = animate(prog, courierProgress(stage), { duration: 2.6, ease: "easeInOut" });
    return () => c.stop();
  }, [stage, prog]);
  useEffect(
    () =>
      prog.on("change", (v) => {
        const p = path.current;
        if (!p) return;
        const L = p.getTotalLength();
        const a = p.getPointAtLength(v * L);
        const b = p.getPointAtLength(Math.min(L, v * L + 1));
        setPt({ x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
      }),
    [prog],
  );
  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const a = p.getPointAtLength(prog.get() * p.getTotalLength());
    setPt({ x: a.x, y: a.y, a: 0 });
  }, [prog]);
  const blocks = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (let x = 0; x < 420; x += 72) for (let y = 0; y < 380; y += 54) out.push([x + 8, y + 8, 56, 38]);
    return out;
  }, []);
  return (
    <div className={`cr-map ${className}`}>
      <svg viewBox={compact ? "48 50 324 300" : "0 0 420 380"} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Courier map — ${stages[stage].name}`}>
        <rect width="420" height="380" fill="var(--map-bg, #f1ebe0)" />
        {blocks.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill={i % 7 === 3 ? "var(--map-park, #cfe3b7)" : "var(--map-block, #e6ddcd)"} />
        ))}
        <path d="M-10 340 C 80 300, 140 360, 240 320 S 380 300, 440 330 L440 400 L-10 400 Z" fill="var(--map-water, #bcd6e3)" />
        <path d={ROUTE} fill="none" stroke="var(--map-route-bg, #fff)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={path} d={ROUTE} fill="none" stroke="var(--map-route, #d6361f)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 9" />
        <motion.path d={ROUTE} fill="none" stroke="var(--map-route, #d6361f)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: prog }} />
        <g transform="translate(86 304)">
          <circle r="16" fill="#fff" />
          <circle r="12" fill="var(--map-route, #d6361f)" />
          <path d="M-5 -1 h10 v6 h-10z M-6 -4 h12" stroke="#fff" strokeWidth="1.8" fill="none" />
        </g>
        <g transform="translate(330 110)">
          <circle r="22" fill="var(--map-home, #1e1410)" opacity=".12">
            <animate attributeName="r" values="14;26;14" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="12" fill="var(--map-home, #1e1410)" />
          <path d="M-5 1 L0 -4 L5 1 V5 H-5Z" fill="#fff" />
        </g>
        {stage >= 2 && (
          <g transform={`translate(${pt.x} ${pt.y})`}>
            <circle r="18" fill="var(--map-route, #d6361f)" opacity=".18">
              <animate attributeName="r" values="12;22;12" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r="13" fill="#fff" stroke="var(--map-route, #d6361f)" strokeWidth="3" />
            <g transform={`rotate(${pt.a})`}>
              <path d="M-6 3 a3 3 0 1 0 .1 0 M6 3 a3 3 0 1 0 .1 0 M-6 3 L-1 -4 H4 L6 3" stroke="var(--map-route, #d6361f)" strokeWidth="1.6" fill="none" />
            </g>
          </g>
        )}
      </svg>
      <div className="cr-map-tags" aria-hidden="true" hidden={compact}>
        <span style={{ left: "13%", top: "86%" }}>Restaurant</span>
        <span style={{ left: "72%", top: "20%" }}>You</span>
      </div>
    </div>
  );
}

export function StageList({ stage }: { stage: number }) {
  return (
    <ol className="cr-stages">
      {stages.map((s, i) => (
        <li key={s.name} className={i < stage ? "done" : i === stage ? "now" : ""}>
          <motion.span className="cr-stage-dot" animate={i === stage ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ repeat: i === stage && stage < 4 ? Infinity : 0, duration: 1.6 }}>
            <Icon name={i < stage ? "check" : s.icon} size={14} stroke={2.2} />
          </motion.span>
          <div>
            <strong>{s.name}</strong>
            {i === stage && (
              <motion.small initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
                {s.note}
              </motion.small>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function etaFor(stage: number) {
  return [28, 22, 14, 4, 0][stage];
}

export function Stars({ value, onChange, size = 30 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return (
    <div className="cr-rate" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)} whileTap={{ scale: 1.3 }} animate={{ scale: n <= value ? 1.08 : 1 }} className={n <= value ? "on" : ""}>
          <Icon name="star" size={size} fill={n <= value} stroke={1.4} />
        </motion.button>
      ))}
    </div>
  );
}
