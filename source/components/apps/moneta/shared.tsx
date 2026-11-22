"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { ease, spring } from "../../kit/ui";
import { C, contacts, dLabel, usd, type Card, type Txn } from "./data";

export function CatIcon({ cat, size = 40 }: { cat: string; size?: number }) {
  const c = C(cat);
  return (
    <span className="mn-cat" style={{ width: size, height: size, background: `color-mix(in srgb, ${c.color} 16%, transparent)`, color: c.color }} aria-hidden="true">
      <Icon name={c.icon} size={size * 0.45} />
    </span>
  );
}

export function TxnRow({ t, onClick, hidden = false }: { t: Txn; onClick?: () => void; hidden?: boolean }) {
  const amt = t.split ? t.amount * t.split.share : t.amount;
  return (
    <button className="mn-txn" onClick={onClick}>
      <CatIcon cat={t.cat} />
      <span className="grow">
        <strong>{t.merchant}</strong>
        <small>
          {C(t.cat).name}
          {t.pending && <em className="mn-pending">Pending</em>}
          {t.split && <em className="mn-split">Split ÷{Math.round(1 / t.split.share)}</em>}
          {t.note && <> · {t.note}</>}
        </small>
      </span>
      <b className={amt > 0 ? "pos" : ""}>{hidden ? "•••" : (amt > 0 ? "+" : "") + usd(amt).replace("−", "−")}</b>
    </button>
  );
}

export function groupByDate(list: Txn[]) {
  const g: { date: string; items: Txn[] }[] = [];
  list.forEach((t) => {
    const last = g[g.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else g.push({ date: t.date, items: [t] });
  });
  return g.map((x) => ({ ...x, label: dLabel(x.date) }));
}

/** Payment card that flips to reveal its details. */
export function CardFace({ c, revealed, onFlip, small = false }: { c: Card; revealed: boolean; onFlip?: () => void; small?: boolean }) {
  return (
    <motion.div className={`mn-card-3d ${small ? "small" : ""}`} onClick={onFlip} style={{ perspective: 1000 }}>
      <motion.div className="mn-card-inner" animate={{ rotateY: revealed ? 180 : 0 }} transition={{ duration: 0.7, ease }}>
        <div className={`mn-pcard front ${c.frozen ? "frozen" : ""}`} style={{ background: `linear-gradient(135deg, ${c.tone[0]}, ${c.tone[1]})` }}>
          <div className="mn-card-top"><span className="mn-card-logo">moneta</span>{c.virtual && <em>Virtual</em>}</div>
          <span className="mn-chip" aria-hidden="true" />
          <div className="mn-card-bot">
            <span>{c.name}</span>
            <span>•••• {c.mask}</span>
          </div>
          <AnimatePresence>
            {c.frozen && (
              <motion.div className="mn-frost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Icon name="snow" size={28} /> Frozen
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mn-pcard back" style={{ background: `linear-gradient(135deg, ${c.tone[1]}, ${c.tone[0]})` }}>
          <span className="mn-stripe" />
          <div className="mn-card-num">4716 2290 8813 {c.mask}</div>
          <div className="mn-card-meta"><span>EXP {c.exp}</span><span>CVC 3{c.mask.slice(1)}</span></div>
          <small>Demo card — not a real number</small>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Keypad({ value, onChange, max = 99999 }: { value: string; onChange: (v: string) => void; max?: number }) {
  function press(k: string) {
    let v = value;
    if (k === "⌫") v = v.slice(0, -1);
    else if (k === ".") v = v.includes(".") ? v : (v || "0") + ".";
    else {
      if (v.includes(".") && v.split(".")[1].length >= 2) return;
      v = v === "0" ? k : v + k;
    }
    if (Number(v) > max) return;
    onChange(v);
  }
  return (
    <div className="mn-keypad">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
        <motion.button key={k} onClick={() => press(k)} whileTap={{ scale: 0.88, backgroundColor: "rgba(58,94,240,.12)" }} aria-label={k === "⌫" ? "Delete" : k}>
          {k === "⌫" ? <Icon name="back" size={22} /> : k}
        </motion.button>
      ))}
    </div>
  );
}

export function AmountDisplay({ value, shake }: { value: string; shake?: boolean }) {
  const [int, dec] = (value || "0").split(".");
  return (
    <motion.div className="mn-amount" animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
      <span className="mn-amount-sym">$</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {(Number(int).toLocaleString("en-US") + (value.includes(".") ? "." + (dec || "") : "")).split("").map((ch, i) => (
          <motion.span key={i + ch} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={spring}>
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/** Simulated biometric confirmation. */
export function FaceId({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<"scan" | "ok">("scan");
  useEffect(() => {
    const a = setTimeout(() => setState("ok"), 1300);
    const b = setTimeout(onDone, 2000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [onDone]);
  return (
    <motion.div className="mn-faceid" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} role="status" aria-label={state === "ok" ? "Confirmed" : "Confirming with Face ID"}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        {state === "scan" ? (
          <>
            <path d="M8 24V14a6 6 0 0 1 6-6h10M56 8h10a6 6 0 0 1 6 6v10M72 56v10a6 6 0 0 1-6 6H56M24 72H14a6 6 0 0 1-6-6V56" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>
              <path d="M28 30v6M52 30v6M40 32v14h-4M30 54c6 5 14 5 20 0" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </motion.g>
          </>
        ) : (
          <>
            <motion.circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
            <motion.path d="M26 41l10 10 20-22" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.25 }} />
          </>
        )}
      </svg>
      <span>{state === "ok" ? "Confirmed" : "Face ID"}</span>
    </motion.div>
  );
}

export function ContactAv({ id, size = 44 }: { id: string; size?: number }) {
  const c = contacts.find((x) => x.id === id)!;
  return (
    <span className="mn-contact-av" style={{ width: size, height: size, background: c.color, fontSize: size * 0.36 }} aria-hidden="true">
      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
    </span>
  );
}
