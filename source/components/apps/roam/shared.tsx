"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Qty, spring, ease } from "../../kit/ui";
import { TODAY, addDays } from "../../kit/store";
import { listings, quote, usd, type Listing, type Search } from "./data";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthDays(y: number, m: number) {
  const first = new Date(y, m, 1);
  const pad = first.getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = Array(pad).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  return cells;
}

/** Range calendar. Blocked dates can't be crossed; hover previews the range. */
export function Calendar({
  start,
  end,
  onChange,
  blocked = [],
  months = 2,
  stacked = false,
}: {
  start: string | null;
  end: string | null;
  onChange: (s: string | null, e: string | null) => void;
  blocked?: string[];
  months?: number;
  stacked?: boolean;
}) {
  const base = new Date(TODAY + "T12:00:00");
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [dir, setDir] = useState(0);
  const firstBlockedAfter = (s: string) => blocked.filter((b) => b > s).sort()[0];
  function pick(d: string) {
    if (!start || (start && end) || d <= start) {
      onChange(d, null);
      return;
    }
    const limit = firstBlockedAfter(start);
    if (limit && d > limit) {
      onChange(d, null);
      return;
    }
    onChange(start, d);
  }
  const list = Array.from({ length: stacked ? 4 : months }, (_, i) => {
    const dt = new Date(base.getFullYear(), base.getMonth() + offset + i, 1);
    return { y: dt.getFullYear(), m: dt.getMonth() };
  });
  const limit = start && !end ? firstBlockedAfter(start) : null;
  const previewEnd = start && !end && hover && hover > start && (!limit || hover <= limit) ? hover : null;
  return (
    <div className={`rm-cal ${stacked ? "stacked" : ""}`}>
      {!stacked && (
        <div className="rm-cal-nav">
          <button className="kit-icon-btn" onClick={() => { setDir(-1); setOffset(Math.max(0, offset - 1)); }} disabled={offset === 0} aria-label="Previous month"><Icon name="back" size={18} /></button>
          <button className="kit-icon-btn" onClick={() => { setDir(1); setOffset(offset + 1); }} aria-label="Next month"><Icon name="next" size={18} /></button>
        </div>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={offset} className="rm-cal-months" initial={{ x: dir * 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 40, opacity: 0 }} transition={{ duration: 0.35, ease }}>
          {list.map(({ y, m }) => (
            <div className="rm-month" key={`${y}-${m}`}>
              <h4>{MONTHS[m]} {y}</h4>
              <div className="rm-dow">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
              <div className="rm-days" onMouseLeave={() => setHover(null)}>
                {monthDays(y, m).map((d, i) => {
                  if (!d) return <span key={i} />;
                  const past = d < TODAY;
                  const isBlocked = blocked.includes(d);
                  const beyond = !!(limit && d > limit);
                  const disabled = past || (isBlocked && !(start && !end && d === limit));
                  const e = end || previewEnd;
                  const inRange = start && e && d > start && d < e;
                  const isStart = d === start;
                  const isEnd = d === e;
                  return (
                    <button
                      key={d}
                      disabled={disabled}
                      className={`${inRange ? "in" : ""} ${isStart ? "start" : ""} ${isEnd ? "end" : ""} ${isBlocked ? "blocked" : ""} ${beyond ? "beyond" : ""} ${start && e && start !== e ? "has-range" : ""}`}
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHover(d)}
                      aria-label={`${new Date(d + "T12:00:00").toDateString()}${isBlocked ? ", unavailable" : ""}`}
                      aria-pressed={isStart || isEnd}
                    >
                      <span>{Number(d.slice(8))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="rm-cal-foot">
        <span>{start && end ? `${Math.round((new Date(end).getTime() - new Date(start).getTime()) / 864e5)} nights` : start ? "Select check-out" : "Select check-in"}</span>
        <button className="rm-link" onClick={() => onChange(null, null)}>Clear dates</button>
      </div>
    </div>
  );
}

export function Guests({ s, set, max }: { s: Search; set: (s: Search) => void; max?: number }) {
  const total = s.adults + s.children;
  const rows: [keyof Search, string, string, number][] = [
    ["adults", "Adults", "Ages 13 or above", 1],
    ["children", "Children", "Ages 2–12", 0],
    ["infants", "Infants", "Under 2", 0],
    ["pets", "Pets", "Bringing a service animal?", 0],
  ];
  return (
    <div className="rm-guests">
      {rows.map(([k, t, sub, min]) => (
        <div key={k} className="rm-guest-row">
          <div>
            <strong>{t}</strong>
            <small>{sub}</small>
          </div>
          <Qty value={s[k] as number} min={min} max={(k === "adults" || k === "children") && max ? (s[k] as number) + Math.max(0, max - total) : 8} onChange={(n) => set({ ...s, [k]: n })} label={t} />
        </div>
      ))}
      {max && <p className="rm-muted">This place has a maximum of {max} guests, not including infants.</p>}
    </div>
  );
}

/** Illustrative map with total-price pins linked to the list. */
export function StayMap({
  items,
  active,
  setActive,
  open,
  search,
  compact = false,
}: {
  items: Listing[];
  active: string | null;
  setActive: (id: string | null) => void;
  open: (id: string) => void;
  search: Search;
  compact?: boolean;
}) {
  return (
    <div className={`rm-map ${compact ? "compact" : ""}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="rm-hatch" width="3" height="3" patternUnits="userSpaceOnUse">
            <path d="M0 3L3 0" stroke="#000" strokeOpacity=".04" strokeWidth=".4" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="var(--map-sea, #cfdde0)" />
        <path d="M6 4 C 22 2, 40 6, 58 4 S 92 6, 98 10 L 97 70 C 92 78, 84 82, 80 92 C 74 96, 70 90, 66 86 C 56 80, 46 84, 38 80 C 26 76, 18 82, 10 74 C 4 62, 6 40, 3 24 Z" fill="var(--map-land, #efe8d8)" />
        <path d="M6 4 C 22 2, 40 6, 58 4 S 92 6, 98 10 L 97 70 C 92 78, 84 82, 80 92 C 74 96, 70 90, 66 86 C 56 80, 46 84, 38 80 C 26 76, 18 82, 10 74 C 4 62, 6 40, 3 24 Z" fill="url(#rm-hatch)" />
        <path d="M60 30 C 64 38, 70 40, 74 48 S 72 60, 78 66" fill="none" stroke="var(--map-river, #a9c2c9)" strokeWidth=".8" />
        <path d="M10 20 C 14 30, 12 40, 20 46" fill="none" stroke="var(--map-river, #a9c2c9)" strokeWidth=".6" />
        <ellipse cx="68" cy="40" rx="4" ry="2.4" fill="var(--map-river, #a9c2c9)" />
        <path d="M20 58 l4 -6 l4 6 z M26 60 l3 -5 l3 5z M64 36 l3 -5 l3 5z M70 40 l2.6 -4 l2.6 4z" fill="var(--map-mtn, #d9cfb9)" />
        <path d="M5 50 H 95 M 50 6 V 94" stroke="#000" strokeOpacity=".04" strokeWidth=".3" />
      </svg>
      <span className="rm-map-note">Illustrative map</span>
      {items.map((l) => {
        const q = quote(l, search.start, search.end);
        const on = active === l.id;
        return (
          <motion.button
            key={l.id}
            className={`rm-pin ${on ? "on" : ""}`}
            style={{ left: `${l.map[0]}%`, top: `${l.map[1]}%` }}
            onMouseEnter={() => setActive(l.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(l.id)}
            onClick={() => (compact && !on ? setActive(l.id) : open(l.id))}
            animate={{ scale: on ? 1.15 : 1, zIndex: on ? 5 : 1 }}
            transition={spring}
            aria-label={`${l.title}, ${q.n ? usd(q.total) + " total" : usd(l.nightly) + " per night"}`}
          >
            {q.n ? usd(q.total) : usd(l.nightly)}
          </motion.button>
        );
      })}
      <AnimatePresence>
        {active && !compact && (
          <motion.div className="rm-map-card" key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {(() => {
              const l = listings.find((x) => x.id === active)!;
              return (
                <>
                  <img src={l.photos[0]} alt="" />
                  <div>
                    <strong>{l.title}</strong>
                    <span>{l.place}</span>
                    <span><Icon name="star" size={12} fill /> {l.rating}</span>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Dual-handle price filter over a histogram of nightly prices. */
export function PriceRange({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const buckets = 24;
  const step = (max - min) / buckets;
  const hist = Array.from({ length: buckets }, (_, i) => {
    const lo = min + i * step;
    const real = listings.filter((l) => l.nightly >= lo && l.nightly < lo + step).length;
    return real * 3 + 1 + Math.round(Math.abs(Math.sin(i * 1.7)) * 4 + (i > 4 && i < 16 ? 3 : 0));
  });
  const peak = Math.max(...hist);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="rm-price">
      <div className="rm-hist" aria-hidden="true">
        {hist.map((h, i) => {
          const lo = min + i * step;
          const inside = lo >= value[0] && lo <= value[1];
          return <motion.span key={i} animate={{ height: `${(h / peak) * 100}%`, opacity: inside ? 1 : 0.3 }} />;
        })}
      </div>
      <div className="rm-range">
        <div className="rm-range-fill" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
        <input type="range" min={min} max={max} step={5} value={value[0]} aria-label="Minimum price" onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - 20), value[1]])} />
        <input type="range" min={min} max={max} step={5} value={value[1]} aria-label="Maximum price" onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + 20)])} />
      </div>
      <div className="rm-price-boxes">
        <label><small>Minimum</small>{usd(value[0])}</label>
        <span>—</span>
        <label><small>Maximum</small>{usd(value[1])}{value[1] >= max ? "+" : ""}</label>
      </div>
    </div>
  );
}

export function Lightbox({ photos, index, onClose, title }: { photos: string[]; index: number | null; onClose: () => void; title: string }) {
  const [i, setI] = useState(index || 0);
  const [d, setD] = useState(0);
  useEffect(() => {
    if (index != null) setI(index);
  }, [index]);
  useEffect(() => {
    if (index == null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") { setD(1); setI((x) => (x + 1) % photos.length); }
      if (e.key === "ArrowLeft") { setD(-1); setI((x) => (x - 1 + photos.length) % photos.length); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, photos.length, onClose]);
  return (
    <AnimatePresence>
      {index != null && (
        <motion.div className="kit-layer rm-lightbox" role="dialog" aria-label={`${title} photos`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="rm-lb-top">
            <button className="kit-icon-btn" onClick={onClose} aria-label="Close photos"><Icon name="close" /></button>
            <span>{i + 1} / {photos.length}</span>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={i}
              src={photos[i]}
              alt={`${title}, photo ${i + 1}`}
              initial={{ x: d * 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -d * 80, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) { setD(1); setI((x) => (x + 1) % photos.length); }
                if (info.offset.x > 60) { setD(-1); setI((x) => (x - 1 + photos.length) % photos.length); }
              }}
            />
          </AnimatePresence>
          <button className="rm-lb-arrow l" onClick={() => { setD(-1); setI((x) => (x - 1 + photos.length) % photos.length); }} aria-label="Previous photo"><Icon name="back" /></button>
          <button className="rm-lb-arrow r" onClick={() => { setD(1); setI((x) => (x + 1) % photos.length); }} aria-label="Next photo"><Icon name="next" /></button>
          <div className="rm-lb-thumbs">
            {photos.map((p, k) => (
              <button key={k} aria-pressed={k === i} onClick={() => { setD(k > i ? 1 : -1); setI(k); }} aria-label={`Photo ${k + 1}`}><img src={p} alt="" /></button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Heart({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button className={`rm-heart ${on ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); onClick(); }} aria-pressed={on} aria-label={label}>
      <motion.span key={String(on)} initial={{ scale: on ? 0.2 : 1 }} animate={{ scale: [null, on ? 1.3 : 1, 1] }} transition={{ duration: 0.45 }}>
        <Icon name="heart" size={22} fill={on} stroke={1.8} />
      </motion.span>
      {on && (
        <span className="rm-burst" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.i key={i} initial={{ scale: 0, x: 0, y: 0, opacity: 1 }} animate={{ scale: 1, x: Math.cos((i / 6) * 6.28) * 18, y: Math.sin((i / 6) * 6.28) * 18, opacity: 0 }} transition={{ duration: 0.6 }} />
          ))}
        </span>
      )}
    </button>
  );
}

export const today = TODAY;
export { addDays };
