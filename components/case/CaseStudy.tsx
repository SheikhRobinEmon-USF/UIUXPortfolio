"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion, type MotionValue } from "motion/react";
import Lenis from "lenis";
import Cursor from "../home/Cursor";
import { route, projectArtwork, type Project } from "../../lib/projects";
import type { System } from "../../lib/systems";
import type { Tour } from "../play/PlayShell";

const ease = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

export type CaseContent = {
  concept: string;
  opportunity: string;
  pattern: string;
  source: readonly [string, string] | string[];
  architecture: readonly string[] | string[];
  frames: readonly { title: string; rows: readonly (readonly string[])[] }[];
  identity: string;
  result: string;
  reflection: string;
};

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ duration: 1, ease, delay }}>
      {children}
    </motion.div>
  );
}

function Lines({ text, className, as: Tag = "h2" }: { text: string; className?: string; as?: any }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <Tag ref={ref} className={`c-lines ${className || ""}`} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="c-mask">
            <motion.span initial={{ y: "110%" }} animate={seen ? { y: "0%" } : {}} transition={{ duration: 1, ease, delay: i * 0.03 }}>
              {w}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Paragraph whose words light up as it scrolls through the viewport. */
function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="c-scrolltext">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

function Frame({ src, title, kind }: { src: string; title: string; kind: "web" | "mobile" }) {
  const box = useRef<HTMLDivElement>(null);
  const near = useInView(box, { once: true, margin: "400px 0px" });
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    if (kind !== "web") return;
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1440));
    ro.observe(el);
    return () => ro.disconnect();
  }, [kind]);
  return (
    <div className={`c-frame ${kind}`}>
      {kind === "web" && (
        <div className="c-browser-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{title.toLowerCase().replace(/\s/g, "")}.app</span>
        </div>
      )}
      <div className="c-frame-view" ref={box} style={kind === "web" ? { height: 900 * scale } : undefined}>
        {near ? (
          <iframe
            src={src}
            title={`${title} ${kind} prototype`}
            loading="lazy"
            style={kind === "web" ? { width: 1440, height: 900, transform: `scale(${scale})` } : undefined}
          />
        ) : (
          <div className="c-frame-ph" />
        )}
      </div>
    </div>
  );
}

function Journey({ tour, color }: { tour: Tour; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const f = () => setDist(Math.max(0, (track.current?.scrollWidth || 0) - innerWidth + 80));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const steps = [...tour.web.map((t) => ({ t, k: "Web" })), ...tour.mobile.map((t) => ({ t, k: "Mobile" }))];
  return (
    <section className="c-journey" ref={ref} style={{ height: `calc(100vh + ${dist}px)` }}>
      <div className="c-journey-sticky">
        <div className="c-journey-head">
          <span className="eyebrow">04 — The complete journey</span>
          <h2>
            {steps.length} flows across <em>two platforms.</em>
          </h2>
        </div>
        <motion.div className="c-journey-track" ref={track} style={{ x }}>
          {steps.map((s, i) => (
            <div className={`c-step ${s.k.toLowerCase()}`} key={i} style={{ "--c": color } as CSSProperties}>
              <span className="c-step-n">{pad(i + 1)}</span>
              <span className="c-step-k">{s.k}</span>
              <p>{s.t}</p>
            </div>
          ))}
        </motion.div>
        <div className="c-journey-bar">
          <motion.i style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}

function NextProject({ next }: { next: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [p, setP] = useState(0);
  const acc = useRef(0);
  const gone = useRef(false);
  const href = route(`/work/${next.slug}/`);
  useEffect(() => {
    function go() {
      if (gone.current) return;
      gone.current = true;
      try {
        sessionStorage.setItem("sre:from-home", next.slug);
      } catch {}
      document.documentElement.classList.add("case-leaving");
      setTimeout(() => location.assign(href), 700);
    }
    function onWheel(e: WheelEvent) {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      if (!atBottom || e.deltaY <= 0) {
        if (e.deltaY < 0) {
          acc.current = 0;
          setP(0);
        }
        return;
      }
      acc.current = Math.min(1, acc.current + e.deltaY / 1400);
      setP(acc.current);
      if (acc.current >= 1) go();
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [href, next.slug]);
  const C = 2 * Math.PI * 34;
  return (
    <a ref={ref} href={href} className="c-next" style={{ "--np": next.color, "--npi": next.ink } as CSSProperties} data-cursor="Next" onClick={() => { try { sessionStorage.setItem("sre:from-home", next.slug); } catch {} }}>
      <div className="c-next-img" style={{ clipPath: `inset(${(1 - p) * 18}% ${(1 - p) * 22}% ${(1 - p) * 18}% ${(1 - p) * 22}%)` }}>
        <img {...projectArtwork(next.slug)} sizes="100vw" alt="" loading="lazy" />
      </div>
      <div className="c-next-copy">
        <span className="eyebrow">Next project — {next.label}</span>
        <strong>
          {next.name}
          <i>.</i>
        </strong>
        <span className="c-next-hint">
          <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 40 40)" />
          </svg>
          Keep scrolling or click to continue
        </span>
      </div>
    </a>
  );
}

export default function CaseStudy({
  project,
  content,
  tour,
  system,
  next,
  index,
}: {
  project: Project;
  content: CaseContent;
  tour: Tour;
  system: System;
  next: Project;
  index: number;
}) {
  const hero = useRef<HTMLElement>(null);
  const [fromHome, setFromHome] = useState<boolean | null>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const progress = useScroll().scrollYProgress;

  useEffect(() => {
    let f = false;
    try {
      f = sessionStorage.getItem("sre:from-home") === project.slug;
      sessionStorage.removeItem("sre:from-home");
      sessionStorage.setItem("sre:active-project", project.slug);
    } catch {}
    setFromHome(f);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [project.slug]);

  const web = route(`/play/${project.slug}/?view=web&embed=1`);
  const mobile = route(`/play/${project.slug}/?view=mobile&embed=1`);
  const letters = project.name.split("");
  const ready = fromHome !== null;

  return (
    <main id="main" className="case" style={{ "--paper": project.color, "--ink": project.ink } as CSSProperties}>
      <Cursor />
      <motion.div className="c-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <header className="c-nav">
        <a href={route(`/?project=${project.slug}`)} className="c-nav-back">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          Index
        </a>
        <span className="c-nav-mid">
          {pad(index + 1)} / 07 · {project.name}
        </span>
        <a href={route(`/play/${project.slug}/`)} className="c-nav-cta">
          Launch prototype
        </a>
      </header>

      <section className="c-hero" ref={hero}>
        <motion.div
          className="c-hero-img"
          style={{ scale: imgScale, y: imgY }}
          initial={false}
          animate={ready && !fromHome ? { clipPath: ["inset(14% 10% 14% 10%)", "inset(0% 0% 0% 0%)"] } : {}}
          transition={{ duration: 1.4, ease }}
        >
          <img src={projectArtwork(project.slug).src} alt="" fetchPriority="high" />
        </motion.div>
        <motion.div className="c-hero-copy" style={{ y: titleY }}>
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>
            {project.tag} · {project.label}
          </motion.span>
          <h1 aria-label={project.name}>
            {letters.map((ch, i) => (
              <span className="c-mask" key={i} aria-hidden="true">
                <motion.span initial={{ y: "105%" }} animate={ready ? { y: "0%" } : {}} transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.045 }}>
                  {ch}
                </motion.span>
              </span>
            ))}
            <motion.i initial={{ scale: 0 }} animate={ready ? { scale: 1 } : {}} transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 18 }}>
              .
            </motion.i>
          </h1>
        </motion.div>
        <motion.dl className="c-meta" initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.9, ease }}>
          <div>
            <dt>Role</dt>
            <dd>Product design, interaction, front-end</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>Responsive web + iOS app</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>2026 · Independent concept</dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd>React, TypeScript, Motion</dd>
          </div>
        </motion.dl>
      </section>

      <section className="c-intro">
        <span className="eyebrow">01 — Overview</span>
        <ScrollText text={content.concept} />
        <div className="c-intro-ctas">
          <a className="c-btn" href={route(`/play/${project.slug}/?view=web`)}>Open the web prototype</a>
          <a className="c-btn ghost" href={route(`/play/${project.slug}/?view=mobile`)}>Open the mobile app</a>
        </div>
      </section>

      <section className="c-facts">
        {[
          ["The problem", project.problem],
          ["Who it's for", project.audience],
          ["Hypothesis", project.hypothesis],
          ["Persona (illustrative)", project.persona],
        ].map(([k, v], i) => (
          <Reveal key={k} delay={i * 0.08} className="c-fact">
            <span className="c-fact-n">{pad(i + 1)}</span>
            <h3>{k}</h3>
            <p>{v}</p>
          </Reveal>
        ))}
      </section>

      <section className="c-opportunity">
        <div>
          <span className="eyebrow">02 — Opportunity</span>
          <Lines text={content.opportunity} />
        </div>
        <Reveal className="c-research" delay={0.1}>
          <h3>What informed the approach</h3>
          <p>{content.pattern}</p>
          <a className="c-source" href={content.source[1]} target="_blank" rel="noreferrer">
            {content.source[0]} ↗
          </a>
          <h3>Information architecture</h3>
          <ul>
            {content.architecture.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="c-platforms">
        <div className="c-platforms-head">
          <span className="eyebrow">03 — One product, two platforms</span>
          <Lines text="Live prototypes — try them right here." />
          <p>Both run on the same local data: add something on the phone and it appears on the web. Each platform follows its own conventions rather than shrinking one into the other.</p>
        </div>
        <div className="c-platforms-grid">
          <Reveal className="c-platform web">
            <Frame src={web} title={project.name} kind="web" />
            <div className="c-platform-cap">
              <strong>Web</strong>
              <span>Hover states, multi-column layouts, drawers and keyboard flow.</span>
              <a href={route(`/play/${project.slug}/?view=web`)}>Full screen ↗</a>
            </div>
          </Reveal>
          <Reveal className="c-platform mobile" delay={0.15}>
            <div className="c-phone">
              <Frame src={mobile} title={project.name} kind="mobile" />
            </div>
            <div className="c-platform-cap">
              <strong>iOS app</strong>
              <span>Tab bar, sheets, swipe gestures, thumb-zone actions.</span>
              <a href={route(`/play/${project.slug}/?view=mobile`)}>Full screen ↗</a>
            </div>
          </Reveal>
        </div>
      </section>

      <Journey tour={tour} color={project.color} />

      <section className="c-wire">
        <div className="c-wire-head">
          <span className="eyebrow">05 — Structure</span>
          <Lines text="Low-fidelity first, so the hierarchy is settled before the pixels." />
        </div>
        <div className="c-wire-grid">
          {content.frames.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} className="c-wire-card">
              <div className="c-wire-page">
                {f.rows.map((row, r) => (
                  <div className="c-wire-row" key={r}>
                    {row.map((b) => (
                      <span key={b}>{b}</span>
                    ))}
                  </div>
                ))}
              </div>
              <h3>{f.title}</h3>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="c-system" style={{ "--display": system.display.css } as CSSProperties}>
        <div className="c-system-head">
          <span className="eyebrow">06 — Visual system</span>
          <Lines text={`The ${project.name} design language.`} />
          <p>{content.identity}</p>
        </div>
        <div className="c-swatches">
          {system.palette.map((c, i) => (
            <motion.div key={c.hex} className="c-swatch" style={{ background: c.hex, color: c.ink || "#111" }} initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease, delay: i * 0.07 }}>
              <strong>{c.name}</strong>
              <span>{c.hex}</span>
            </motion.div>
          ))}
        </div>
        <div className="c-type">
          <Reveal className="c-type-sample">
            <span className="eyebrow">Display · {system.display.family}</span>
            <p style={{ fontFamily: system.display.css }}>{system.display.sample}</p>
            <span className="c-type-aa" style={{ fontFamily: system.display.css }}>Aa</span>
          </Reveal>
          <Reveal className="c-type-specs" delay={0.1}>
            <dl>
              <div>
                <dt>Text</dt>
                <dd style={{ fontFamily: system.text.css }}>{system.text.family}</dd>
              </div>
              <div>
                <dt>Radius</dt>
                <dd>{system.radius}</dd>
              </div>
              <div>
                <dt>Motion</dt>
                <dd>{system.motion}</dd>
              </div>
            </dl>
            <h3>Principles</h3>
            <ol>
              {system.principles.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="c-outcome">
        <div>
          <span className="eyebrow">07 — Outcome</span>
          <Lines text="What the prototype proves — and what it doesn't yet." />
        </div>
        <div className="c-outcome-cols">
          <Reveal>
            <h3>Signature interaction</h3>
            <p>{project.signature}</p>
            <h3>Trade-off</h3>
            <p>{project.tradeoff}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3>Result</h3>
            <p>{content.result}</p>
            <h3>Next to test</h3>
            <p>{content.reflection}</p>
            <p className="c-note">Personas and hypotheses are illustrative. This is an independent concept: no recruited usability study or business results are claimed.</p>
          </Reveal>
        </div>
      </section>

      <NextProject next={next} />
    </main>
  );
}
