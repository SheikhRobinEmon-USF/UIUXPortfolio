"use client";

import { useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "./ui";

/* Smooth path through points (Catmull-Rom → Bézier). */
function smooth(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * Area/line chart with a pointer scrubber. `onScrub` reports the hovered
 * index so the parent can update a headline figure (the "live number" pattern).
 */
export function LineChart({
  data,
  labels,
  height = 180,
  color = "currentColor",
  fill = true,
  onScrub,
  format = (n: number) => String(n),
  label,
  baseline,
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fill?: boolean;
  onScrub?: (index: number | null) => void;
  format?: (n: number) => string;
  label: string;
  baseline?: number;
}) {
  const W = 600;
  const H = height;
  const pad = 8;
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { pts, min, max } = useMemo(() => {
    const min = Math.min(...data, baseline ?? Infinity);
    const max = Math.max(...data, baseline ?? -Infinity);
    const span = max - min || 1;
    const pts = data.map((v, i) => [
      (i / Math.max(1, data.length - 1)) * W,
      pad + (1 - (v - min) / span) * (H - pad * 2),
    ]) as [number, number][];
    return { pts, min, max };
  }, [data, H, baseline]);
  const line = smooth(pts);
  const area = `${line} L${W},${H} L0,${H} Z`;
  const yOf = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);

  function scrub(clientX: number) {
    const box = svg.current!.getBoundingClientRect();
    const i = Math.round(((clientX - box.left) / box.width) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    setHover(clamped);
    onScrub?.(clamped);
  }
  const hp = hover != null ? pts[hover] : null;

  return (
    <div className="kit-chart">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        style={{ height, touchAction: "pan-y" }}
        onPointerMove={(e) => scrub(e.clientX)}
        onPointerDown={(e) => scrub(e.clientX)}
        onPointerLeave={() => {
          setHover(null);
          onScrub?.(null);
        }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {baseline != null && (
          <line x1="0" x2={W} y1={yOf(baseline)} y2={yOf(baseline)} stroke={color} strokeOpacity=".25" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        )}
        {fill && (
          <motion.path
            d={area}
            fill={`url(#g${id})`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1, d: area }}
            transition={{ duration: 0.9, ease }}
          />
        )}
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1, d: line }}
          transition={{ duration: 1.2, ease }}
        />
        {hp && (
          <>
            <line x1={hp[0]} x2={hp[0]} y1="0" y2={H} stroke={color} strokeOpacity=".35" vectorEffect="non-scaling-stroke" />
            <circle cx={hp[0]} cy={hp[1]} r="5" fill={color} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {hover != null && (
        <div className="kit-chart-tip" style={{ left: `${(hover / Math.max(1, data.length - 1)) * 100}%` }}>
          <strong>{format(data[hover])}</strong>
          {labels && <span>{labels[hover]}</span>}
        </div>
      )}
      {labels && (
        <div className="kit-chart-axis" aria-hidden="true">
          {labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0).map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Bars({
  data,
  labels,
  height = 140,
  selected,
  onSelect,
  goal,
  format = (n: number) => String(n),
  label,
  color = "currentColor",
}: {
  data: number[];
  labels: string[];
  height?: number;
  selected?: number;
  onSelect?: (i: number) => void;
  goal?: number;
  format?: (n: number) => string;
  label: string;
  color?: string;
}) {
  const max = Math.max(...data, goal || 0) || 1;
  return (
    <div className="kit-bars" role="group" aria-label={label} style={{ height: height + 28 }}>
      {goal != null && <div className="kit-bars-goal" style={{ bottom: 28 + (goal / max) * height }} aria-hidden="true"><span>Goal</span></div>}
      {data.map((v, i) => (
        <button
          key={i}
          className={selected === i ? "on" : ""}
          onClick={() => onSelect?.(i)}
          aria-pressed={selected === i}
          aria-label={`${labels[i]}: ${format(v)}`}
        >
          <span className="kit-bar-track" style={{ height }}>
            <motion.span
              className="kit-bar"
              style={{ background: color }}
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ duration: 0.8, ease, delay: i * 0.035 }}
            />
          </span>
          <small>{labels[i]}</small>
        </button>
      ))}
    </div>
  );
}

/** Concentric progress rings. Values are 0..1 (can exceed 1). */
export function Rings({
  rings,
  size = 180,
  width = 16,
  label,
}: {
  rings: { value: number; color: string; track?: string }[];
  size?: number;
  width?: number;
  label: string;
}) {
  const reduce = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="kit-rings">
      {rings.map((r, i) => {
        const radius = size / 2 - width / 2 - i * (width + Math.max(1, width * 0.3));
        const c = 2 * Math.PI * radius;
        return (
          <g key={i} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={r.track || r.color} strokeOpacity={r.track ? 1 : 0.18} strokeWidth={width} />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={r.color}
              strokeWidth={width}
              strokeLinecap="round"
              strokeDasharray={c}
              initial={reduce ? false : { strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - Math.min(r.value, 1)) }}
              transition={{ duration: 1.4, ease, delay: 0.15 + i * 0.12 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({
  segments,
  size = 160,
  width = 22,
  label,
  active,
  onSelect,
  children,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  width?: number;
  label: string;
  active?: number | null;
  onSelect?: (i: number | null) => void;
  children?: React.ReactNode;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - width / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="kit-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const offset = acc;
          acc += len;
          return (
            <motion.circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={active === i ? width + 6 : width}
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              initial={{ strokeDashoffset: c, opacity: 0 }}
              animate={{ strokeDashoffset: -offset, opacity: active == null || active === i ? 1 : 0.35 }}
              transition={{ duration: 1, ease, delay: i * 0.06 }}
              style={{ cursor: onSelect ? "pointer" : undefined }}
              onPointerEnter={() => onSelect?.(i)}
              onPointerLeave={() => onSelect?.(null)}
            />
          );
        })}
      </svg>
      <div className="kit-donut-center">{children}</div>
    </div>
  );
}

export function Spark({ data, color = "currentColor", width = 90, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, 2 + (1 - (v - min) / (max - min || 1)) * (height - 4)]) as [number, number][];
  return (
    <svg width={width} height={height} aria-hidden="true" className="kit-spark">
      <motion.path d={smooth(pts)} fill="none" stroke={color} strokeWidth="1.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease }} />
    </svg>
  );
}

export function Progress({ value, color, label }: { value: number; color?: string; label: string }) {
  return (
    <div className="kit-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <motion.span style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.min(1, value) * 100}%` }} transition={{ duration: 1, ease }} />
    </div>
  );
}
