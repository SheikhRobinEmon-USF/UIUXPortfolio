"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import PortfolioTransitions from "./PortfolioTransitions";
import { projects, route, projectArtwork } from "../lib/projects";

const pad = (number: number) => String(number).padStart(2, "0");
const lastIndex = projects.length - 1;

export default function Home() {
  const [active, setActive] = useState(0);
  const wheel = useRef({
    total: 0,
    time: 0,
    direction: 0,
    magnitude: 0,
    committed: false,
  });
  const touch = useRef<{
    x: number;
    y: number;
    time: number;
    href: string | null;
    horizontal: boolean;
  } | null>(null);
  const previewFrame = useRef(0);
  const artwork = useRef<HTMLDivElement>(null);
  const project = projects[active];

  const select = useCallback((index: number) => {
    const next = Math.max(0, Math.min(lastIndex, index));
    setActive(next);
    try {
      sessionStorage.setItem("sre:active-project", projects[next].slug);
    } catch {}
  }, []);

  useEffect(() => {
    let slug = new URLSearchParams(window.location.search).get("project");
    try {
      slug ||= sessionStorage.getItem("sre:active-project");
    } catch {}
    const index = projects.findIndex((item) => item.slug === slug);
    if (index >= 0) setActive(index);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const direction = ["ArrowDown", "ArrowRight"].includes(event.key)
        ? 1
        : ["ArrowUp", "ArrowLeft"].includes(event.key)
          ? -1
          : 0;
      if (direction) {
        event.preventDefault();
        select(active + direction);
      }
      if (event.key === "Enter" && !target?.closest("button, a")) {
        window.location.assign(route(`/work/${project.slug}/`));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, project.slug, select]);

  useEffect(() => {
    function onWheel(event: WheelEvent) {
      if (
        event.ctrlKey ||
        !event.deltaY ||
        Math.abs(event.deltaY) < Math.abs(event.deltaX)
      )
        return;
      const target = event.target as Element | null;
      if (
        target?.closest?.(".portfolio-header, .home-footer") ||
        window.innerWidth <= 800
      )
        return;

      const now = performance.now();
      const direction = Math.sign(event.deltaY);
      const magnitude = Math.abs(
        event.deltaY *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? innerHeight
              : 1),
      );
      const gesture = wheel.current;
      const idle = now - gesture.time;
      const deliberateReversal =
        direction !== gesture.direction && magnitude >= 12;
      const newImpulse =
        idle > 72 && magnitude > Math.max(28, gesture.magnitude * 1.85);
      const slowingTail =
        gesture.committed &&
        direction === gesture.direction &&
        idle < 320 &&
        magnitude < gesture.magnitude * 0.78;
      if ((idle > 155 && !slowingTail) || deliberateReversal || newImpulse) {
        gesture.total = 0;
        gesture.direction = direction;
        gesture.committed = false;
      }
      gesture.time = now;
      gesture.magnitude = magnitude;

      if (gesture.committed || direction !== gesture.direction) return;
      gesture.total += magnitude;
      if (gesture.total >= 39) {
        gesture.committed = true;
        select(active + direction);
      }
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [active, select]);

  useEffect(() => () => cancelAnimationFrame(previewFrame.current), []);

  function followPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const current =
      event.currentTarget.querySelector<HTMLElement>(".preview.current");
    if (!current) return;
    const bounds = current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) return;
    cancelAnimationFrame(previewFrame.current);
    previewFrame.current = requestAnimationFrame(() => {
      current.style.setProperty("--look-x", `${x * -15}px`);
      current.style.setProperty("--look-y", `${y * -12}px`);
      current.style.setProperty("--light-x", `${(x + 0.5) * 100}%`);
      current.style.setProperty("--light-y", `${(y + 0.5) * 100}%`);
    });
  }

  function resetDrag() {
    artwork.current?.removeAttribute("data-dragging");
    artwork.current?.style.removeProperty("--drag");
  }

  return (
    <main
      id="main"
      className="portfolio"
      style={{ "--project": project.color } as CSSProperties}
    >
      <PortfolioTransitions />
      <header className="portfolio-header">
        <a href={route("/")} className="identity">
          <span className="identity-mark" aria-hidden="true">
            S<span>·</span>E
          </span>
          <span className="identity-name">
            Sheikh Robin Emon<small>Digital product designer</small>
          </span>
        </a>
        <nav aria-label="Portfolio">
          <a href={route("/about/")}>About</a>
          <a href={route("/contact/")}>Connect</a>
        </nav>
      </header>

      <div className="home-stage">
        <div className="home-heading">
          <span className="eyebrow">Independent UI/UX portfolio</span>
          <div className="home-title">
            Selected <em>work.</em>
          </div>
        </div>

        <div
          className="stack"
          ref={artwork}
          aria-label="Project previews"
          onPointerMove={followPointer}
          onPointerLeave={() => cancelAnimationFrame(previewFrame.current)}
          onTouchStart={(event) => {
            if (event.touches.length !== 1) {
              touch.current = null;
              return;
            }
            const target = event.target as Element;
            touch.current = {
              x: event.touches[0].clientX,
              y: event.touches[0].clientY,
              time: performance.now(),
              horizontal: false,
              href:
                target.closest<HTMLAnchorElement>(".preview.current")?.href ??
                null,
            };
          }}
          onTouchMove={(event) => {
            const start = touch.current;
            if (
              !start ||
              event.touches.length !== 1 ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;
            const finger = event.touches[0];
            const x = finger.clientX - start.x;
            const y = finger.clientY - start.y;
            start.horizontal ||=
              Math.abs(x) > 9 && Math.abs(x) > Math.abs(y) * 1.25;
            if (!start.horizontal) return;
            const resistance =
              (active === 0 && x > 0) || (active === lastIndex && x < 0)
                ? 0.18
                : 0.78;
            event.currentTarget.dataset.dragging = "";
            event.currentTarget.style.setProperty(
              "--drag",
              `${x * resistance}px`,
            );
          }}
          onTouchCancel={() => {
            touch.current = null;
            resetDrag();
          }}
          onTouchEnd={(event) => {
            const start = touch.current;
            touch.current = null;
            resetDrag();
            if (!start || event.touches.length) return;
            const end = event.changedTouches[0];
            const dx = start.x - end.clientX;
            const dy = start.y - end.clientY;
            const elapsed = performance.now() - start.time;
            const flick = elapsed < 230 && Math.abs(dx) > 28;
            if (
              (Math.abs(dx) > 54 || flick) &&
              Math.abs(dx) > Math.abs(dy) * 1.15
            ) {
              event.preventDefault();
              select(active + Math.sign(dx));
              return;
            }
            const target = event.target as Element;
            const link = target.closest<HTMLAnchorElement>(".preview.current");
            if (
              start.href &&
              link?.href === start.href &&
              Math.hypot(dx, dy) < 10 &&
              performance.now() - start.time < 550
            ) {
              event.preventDefault();
              window.location.assign(start.href);
            }
          }}
        >
          {projects.map((item, index) => {
            const offset = index - active;
            const selected = offset === 0;
            return (
              <a
                key={item.slug}
                className={`preview${selected ? " current" : Math.abs(offset) === 1 ? " adjacent" : ""}`}
                style={
                  {
                    "--offset": offset,
                    "--distance": Math.abs(offset),
                    "--paper": item.color,
                  } as CSSProperties
                }
                href={route(`/work/${item.slug}/`)}
                tabIndex={selected ? 0 : -1}
                aria-hidden={!selected}
                onClick={(event) => {
                  if (!selected) {
                    event.preventDefault();
                    select(index);
                  }
                }}
              >
                <img
                  {...projectArtwork(item.slug)}
                  sizes="(max-width: 800px) 90vw, 70vw"
                  alt=""
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
                <div className="preview-caption">
                  <span>{item.tag}</span>
                  <strong>
                    {item.name}
                    <i>.</i>
                  </strong>
                </div>
                <span className="preview-open" aria-hidden="true">
                  +
                </span>
              </a>
            );
          })}
        </div>

        <nav
          className="project-menu"
          aria-label="Select project"
          style={{ "--active-index": active } as CSSProperties}
        >
          <span className="menu-heading">Project index</span>
          <div className="project-menu-list">
            <span className="project-menu-marker" aria-hidden="true" />
            {projects.map((item, index) => (
              <button
                key={item.slug}
                onClick={() => select(index)}
                aria-current={active === index ? "true" : undefined}
              >
                <span>{pad(index + 1)}</span>
                {item.label}
                <i />
              </button>
            ))}
          </div>
        </nav>

        <div className="left-copy" aria-live="polite">
          <h1 key={project.slug}>
            {project.name}
            <span>.</span>
          </h1>
          <p key={`${project.slug}-summary`}>{project.line}</p>
          <div className="project-links">
            <a className="text-link" href={route(`/work/${project.slug}/`)}>
              View case study
            </a>
            <a
              className="secondary-link"
              href={route(`/play/${project.slug}/`)}
            >
              Try the prototype
            </a>
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <span>PRODUCT DESIGN · INTERACTION · FRONTEND</span>
        <div className="project-controls">
          <button
            aria-label="Previous project"
            onClick={() => select(active - 1)}
            disabled={active === 0}
          >
            <span className="project-step-icon" aria-hidden="true">
              ↑
            </span>
          </button>
          <span>
            {pad(active + 1)} / {pad(projects.length)}
          </span>
          <button
            aria-label="Next project"
            onClick={() => select(active + 1)}
            disabled={active === lastIndex}
          >
            <span className="project-step-icon" aria-hidden="true">
              ↓
            </span>
          </button>
        </div>
        <span>SCROLL OR SELECT TO EXPLORE</span>
      </footer>
    </main>
  );
}
