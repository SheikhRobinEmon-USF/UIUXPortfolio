"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { projects, route, projectArtwork } from "../lib/projects";
import { SliderGL, type Plane } from "./home/gl";
import Cursor from "./home/Cursor";

const pad = (n: number) => String(n).padStart(2, "0");
const N = projects.length;
const ease = [0.22, 1, 0.36, 1] as const;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Layout = Plane & { scale: number };

/** Where every project plane sits for a given scroll position and mode. */
function layout(i: number, current: number, grid: number, vw: number, vh: number, mobile: boolean): Layout {
  const d = i - current;
  const ad = Math.abs(d);
  let x: number, y: number, w: number, h: number;
  if (mobile) {
    w = vw * 0.8;
    h = w * 0.66;
    x = d * (w + 18);
    y = -vh * 0.1;
  } else {
    w = Math.min(vw * 0.5, 980);
    h = w * 0.56;
    const gap = vh * 0.16;
    x = -vw * 0.035;
    y = d * (h + gap) - vh * 0.05;
  }
  const s = 1 - Math.min(ad, 2) * (mobile ? 0.08 : 0.14);
  w *= s;
  h *= s;
  if (grid > 0) {
    const cols = mobile ? 2 : 4;
    const gw = mobile ? vw * 0.42 : Math.min(vw * 0.19, 340);
    const gh = gw * 0.62;
    const gapX = mobile ? 12 : 28;
    const gapY = mobile ? 54 : 70;
    const row = Math.floor(i / cols);
    const rows = Math.ceil(N / cols);
    const inRow = Math.min(cols, N - row * cols);
    const col = i % cols;
    const gx = (col - (inRow - 1) / 2) * (gw + gapX);
    const gy = (row - (rows - 1) / 2) * (gh + gapY) + (mobile ? 0 : vh * 0.02);
    x = lerp(x, gx, grid);
    y = lerp(y, gy, grid);
    w = lerp(w, gw, grid);
    h = lerp(h, gh, grid);
  }
  const alpha = lerp(clamp(1 - ad * (mobile ? 0.35 : 0.5), 0.12, 1), 1, grid);
  return { x, y, w, h, alpha, gray: lerp(clamp(ad, 0, 1) * 0.85, 0, grid), hover: 0, scale: s };
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [grid, setGrid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [glFailed, setGlFailed] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const state = useRef({
    current: 0,
    target: 0,
    vel: 0,
    grid: 0,
    gridTarget: 0,
    intro: 0,
    wheelTimer: 0 as any,
    wheelFrom: null as number | null,
    drag: null as null | { start: number; startTarget: number; moved: number; t: number; last: number; v: number },
    mouse: Array.from({ length: N }, () => [0.5, 0.5] as [number, number]),
    hover: Array.from({ length: N }, () => 0),
    hoverTarget: -1,
    mobile: false,
    reduced: false,
  });
  const project = projects[active];

  const select = useCallback((i: number) => {
    const s = state.current;
    s.target = clamp(i, 0, N - 1);
    if (s.reduced) s.current = s.target;
  }, []);

  /* Restore the last viewed project and decide whether to show the loader. */
  useEffect(() => {
    const s = state.current;
    s.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let slug = new URLSearchParams(location.search).get("project");
    try {
      slug ||= sessionStorage.getItem("sre:active-project");
    } catch {}
    const i = projects.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      s.current = s.target = i;
      setActive(i);
    }
    let seen = false;
    try {
      seen = sessionStorage.getItem("sre:intro") === "1";
    } catch {}
    if (seen || s.reduced) {
      setLoading(false);
      s.intro = 1;
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("sre:active-project", projects[active].slug);
    } catch {}
  }, [active]);

  /* Animation loop: physics + WebGL + DOM hit targets. */
  useEffect(() => {
    const s = state.current;
    let gl: SliderGL | null = null;
    let loaded = 0;
    const start = performance.now();
    try {
      gl = new SliderGL(
        canvas.current!,
        projects.map((p) => projectArtwork(p.slug).src),
        (n) => {
          loaded = n;
          setProgress(n / N);
        },
      );
    } catch {
      setGlFailed(true);
      setProgress(1);
    }
    const onResize = () => {
      s.mobile = innerWidth <= 800;
      gl?.resize();
    };
    onResize();
    window.addEventListener("resize", onResize);
    let raf = 0;
    let lastActive = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const vw = innerWidth;
      const vh = innerHeight;
      const k = s.reduced ? 1 : 0.085;
      const prev = s.current;
      if (!s.drag) s.current = lerp(s.current, s.target, k);
      s.vel = lerp(s.vel, clamp((s.current - prev) * 9, -1.2, 1.2), 0.25);
      s.grid = lerp(s.grid, s.gridTarget, s.reduced ? 1 : 0.09);
      if (loaded >= N || !gl) s.intro = lerp(s.intro, loadingRef.current ? 0 : 1, 0.05);
      const nearest = clamp(Math.round(s.current), 0, N - 1);
      if (nearest !== lastActive) {
        lastActive = nearest;
        setActive(nearest);
      }
      const planes: Plane[] = projects.map((_, i) => {
        const l = layout(i, s.current, s.grid, vw, vh, s.mobile);
        s.hover[i] = lerp(s.hover[i], s.hoverTarget === i ? 1 : 0, 0.08);
        const introScale = lerp(0.82, 1, s.intro);
        const p: Plane = { ...l, w: l.w * introScale, h: l.h * introScale, y: l.y + (1 - s.intro) * vh * 0.12 * (i - s.current + 1), alpha: l.alpha * s.intro, hover: s.hover[i] };
        const a = links.current[i];
        if (a) {
          a.style.transform = `translate(${vw / 2 + p.x - p.w / 2}px, ${vh / 2 + p.y - p.h / 2}px)`;
          a.style.width = p.w + "px";
          a.style.height = p.h + "px";
          a.style.opacity = gl ? "" : String(p.alpha);
        }
        return p;
      });
      gl?.draw(planes, s.mobile ? 0 : s.vel, s.mobile ? s.vel : 0, (now - start) / 1000, s.mouse);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      gl?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  /* Loader finishes when textures are ready (minimum 1.6 s for the count). */
  useEffect(() => {
    if (!loading) return;
    const t0 = performance.now();
    let raf = 0;
    const el = document.querySelector<HTMLElement>(".loader-count");
    let shown = 0;
    const step = () => {
      const timeP = Math.min(1, (performance.now() - t0) / 1600);
      shown = lerp(shown, Math.min(timeP, progress || 0.05), 0.12);
      if (el) el.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (shown > 0.995 && progress >= 1) {
        try {
          sessionStorage.setItem("sre:intro", "1");
        } catch {}
        setTimeout(() => setLoading(false), 250);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loading, progress]);

  /* Wheel, keyboard and drag input. */
  useEffect(() => {
    const s = state.current;
    function onWheel(e: WheelEvent) {
      if (s.gridTarget || e.ctrlKey) return;
      const target = e.target as Element;
      if (target.closest?.(".home-header, .home-index, .home-bottom")) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
      if (s.wheelFrom == null) s.wheelFrom = Math.round(s.current);
      s.target = clamp(s.target + (delta * unit) / 700, -0.3, N - 0.7);
      clearTimeout(s.wheelTimer);
      s.wheelTimer = setTimeout(() => {
        // Any deliberate gesture moves at least one project in its direction.
        const from = s.wheelFrom ?? Math.round(s.target);
        const moved = s.target - from;
        const steps = Math.abs(moved) < 0.08 ? 0 : Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)));
        s.target = clamp(from + steps, 0, N - 1);
        s.wheelFrom = null;
      }, 130);
    }
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) {
        e.preventDefault();
        select(Math.round(s.target) + 1);
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        select(Math.round(s.target) - 1);
      } else if (e.key.toLowerCase() === "g") {
        toggleGrid();
      } else if (e.key === "Escape" && s.gridTarget) {
        toggleGrid(false);
      }
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [select]);

  function toggleGrid(on?: boolean) {
    const s = state.current;
    const next = on ?? !s.gridTarget;
    s.gridTarget = next ? 1 : 0;
    setGrid(next);
  }

  function onPointerDown(e: React.PointerEvent) {
    const s = state.current;
    if (s.gridTarget || e.button !== 0) return;
    const pos = s.mobile ? e.clientX : e.clientY;
    s.drag = { start: pos, startTarget: s.current, moved: 0, t: performance.now(), last: pos, v: 0 };
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = state.current;
    // pointer uv over the hovered plane for the ripple
    const el = (e.target as Element).closest<HTMLAnchorElement>("[data-plane]");
    const idx = el ? Number(el.dataset.plane) : -1;
    s.hoverTarget = idx === Math.round(s.current) || s.gridTarget ? idx : -1;
    if (el) {
      const r = el.getBoundingClientRect();
      s.mouse[idx] = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    }
    if (!s.drag) return;
    const pos = s.mobile ? e.clientX : e.clientY;
    const now = performance.now();
    const unit = s.mobile ? innerWidth * 0.8 : innerHeight * 0.45;
    s.drag.v = (pos - s.drag.last) / Math.max(1, now - s.drag.t);
    s.drag.t = now;
    s.drag.last = pos;
    s.drag.moved = Math.max(s.drag.moved, Math.abs(pos - s.drag.start));
    s.current = clamp(s.drag.startTarget - (pos - s.drag.start) / unit, -0.3, N - 0.7);
    s.target = s.current;
  }
  function onPointerUp() {
    const s = state.current;
    if (!s.drag) return;
    const fling = -s.drag.v * 0.9;
    const moved = s.drag.moved;
    s.drag = null;
    if (moved > 6) {
      s.target = clamp(Math.round(s.current + clamp(fling, -1, 1)), 0, N - 1);
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 50);
    }
  }
  const suppressClick = useRef(false);

  function open(i: number, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const s = state.current;
    if (suppressClick.current) return;
    if (s.gridTarget) {
      s.current = s.target = i;
      toggleGrid(false);
      return;
    }
    if (i !== Math.round(s.current)) {
      select(i);
      return;
    }
    const href = route(`/work/${projects[i].slug}/`);
    if (s.reduced) {
      location.assign(href);
      return;
    }
    // Expand the artwork to fill the screen, then continue into the case study.
    const r = e.currentTarget.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "home-expand";
    ghost.style.setProperty("--img", `url(${projectArtwork(projects[i].slug).src})`);
    ghost.style.background = projects[i].color;
    document.body.appendChild(ghost);
    const from = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`;
    ghost.animate([{ clipPath: from }, { clipPath: "inset(0px 0px 0px 0px)" }], { duration: 900, easing: "cubic-bezier(.77,0,.18,1)", fill: "forwards" });
    setLeaving(projects[i].slug);
    try {
      sessionStorage.setItem("sre:from-home", projects[i].slug);
    } catch {}
    setTimeout(() => location.assign(href), 880);
  }

  const letters = project.name.split("");

  return (
    <main
      id="main"
      className={`home ${grid ? "is-grid" : ""} ${glFailed ? "no-gl" : ""} ${leaving ? "is-leaving" : ""}`}
      style={{ "--project": project.color, "--project-ink": project.ink } as CSSProperties}
      data-cursor-zone
    >
      <Cursor />
      <AnimatePresence>
        {loading && (
          <motion.div className="loader" exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}>
            <div className="loader-name">
              <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease }}>
                Sheikh Robin Emon
              </motion.span>
            </div>
            <div className="loader-meta">
              <span>Product designer · Portfolio 2026</span>
              <span className="loader-count">000</span>
            </div>
            <motion.div className="loader-bar" initial={{ scaleX: 0 }} animate={{ scaleX: progress }} transition={{ duration: 0.6 }} />
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvas} className="home-canvas" aria-hidden="true" />

      <div
        className="home-planes"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          state.current.hoverTarget = -1;
          onPointerUp();
        }}
        data-cursor={grid ? "Open" : "Drag"}
      >
        {projects.map((p, i) => (
          <a
            key={p.slug}
            ref={(el) => {
              links.current[i] = el;
            }}
            data-plane={i}
            data-cursor={grid ? p.name : i === active ? "View" : "Select"}
            className={`home-plane ${i === active ? "active" : ""}`}
            href={route(`/work/${p.slug}/`)}
            onClick={(e) => open(i, e)}
            tabIndex={grid || i === active ? 0 : -1}
            aria-label={`${p.name} — ${p.tag}. ${i === active ? "Open case study" : "Select project"}`}
            draggable={false}
          >
            <img {...projectArtwork(p.slug)} sizes="50vw" alt="" draggable={false} />
            {grid && (
              <span className="home-plane-label">
                <small>{pad(i + 1)}</small>
                {p.name}
              </span>
            )}
          </a>
        ))}
      </div>

      <header className="home-header">
        <a href={route("/")} className="home-id">
          <strong>Sheikh Robin Emon</strong>
          <span>Product designer — UI/UX, interaction & front-end</span>
        </a>
        <nav aria-label="Portfolio">
          <button className={`home-grid-btn ${grid ? "on" : ""}`} onClick={() => toggleGrid()} aria-pressed={grid}>
            <span className="home-grid-icon" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {grid ? "Close" : "Overview"}
          </button>
          <a href={route("/about/")}>About</a>
          <a href={route("/contact/")}>Contact</a>
        </nav>
      </header>

      <div className="home-title" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {!grid && (
            <motion.h1 key={project.slug} className="home-name" aria-label={project.name} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              {letters.map((ch, i) => (
                <span className="home-char-mask" key={i} aria-hidden="true">
                  <motion.span initial={{ y: "105%", rotate: 4 }} animate={{ y: "0%", rotate: 0 }} exit={{ y: "-105%" }} transition={{ duration: 0.9, ease, delay: (loading ? 0.6 : 0.05) + i * 0.035 }}>
                    {ch}
                  </motion.span>
                </span>
              ))}
              <motion.i className="home-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 20 }}>
                .
              </motion.i>
            </motion.h1>
          )}
          {grid && (
            <motion.h1 key="grid" className="home-name small" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Seven products<i className="home-dot">.</i>
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <div className="home-bottom">
        <AnimatePresence mode="wait">
          <motion.div key={project.slug} className="home-info" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease }}>
            <span className="home-tag">
              {pad(active + 1)} — {project.label}
            </span>
            <p>
              {project.line} <span>{project.tag}.</span>
            </p>
            <div className="home-ctas">
              <a href={route(`/work/${project.slug}/`)} className="home-cta" onClick={(e) => {
                const el = links.current[active];
                if (el) {
                  e.preventDefault();
                  el.click();
                }
              }}>
                <span>Case study</span>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              </a>
              <a href={route(`/play/${project.slug}/?view=web`)} className="home-cta ghost">
                Web prototype
              </a>
              <a href={route(`/play/${project.slug}/?view=mobile`)} className="home-cta ghost">
                Mobile app
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="home-progress" aria-hidden="true">
          <span>{pad(active + 1)}</span>
          <div className="home-progress-track">
            <motion.i animate={{ scaleY: (active + 1) / N, scaleX: (active + 1) / N }} transition={{ duration: 0.8, ease }} />
          </div>
          <span>{pad(N)}</span>
        </div>
        <span className="home-hint">{grid ? "Select a project" : "Scroll · drag · use arrow keys"}</span>
      </div>

      <nav className="home-index" aria-label="Project index">
        <span className="home-index-head">Project index</span>
        <ol>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <button
                aria-current={i === active ? "true" : undefined}
                onClick={() => {
                  if (state.current.gridTarget) toggleGrid(false);
                  select(i);
                }}
                onMouseEnter={() => (state.current.hoverTarget = -1)}
                data-cursor="Select"
              >
                <span className="home-index-n">{pad(i + 1)}</span>
                <span className="home-index-label">{p.label}</span>
                <span className="home-index-line" />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </main>
  );
}
