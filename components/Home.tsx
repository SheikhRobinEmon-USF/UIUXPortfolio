"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { projects, route, projectArtwork } from "../lib/projects";

const pad = (number: number) => String(number).padStart(2, "0");
const lastIndex = projects.length - 1;

export default function Home() {
  const [active, setActive] = useState(0);
  const wheel = useRef({
    total: 0,
    time: 0,
    changed: Number.NEGATIVE_INFINITY,
  });
  const touch = useRef<{
    x: number;
    y: number;
    time: number;
    href: string | null;
  } | null>(null);
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
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX))
        return;
      const target = event.target as Element | null;
      if (target?.closest?.(".portfolio-header, .home-footer")) return;
      const now = performance.now();
      if (now - wheel.current.time > 150) wheel.current.total = 0;
      wheel.current.time = now;
      wheel.current.total += event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (
        Math.abs(wheel.current.total) > 44 &&
        now - wheel.current.changed > 470
      ) {
        select(active + Math.sign(wheel.current.total));
        wheel.current.changed = now;
        wheel.current.total = 0;
      }
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [active, select]);

  return (
    <main
      id="main"
      className="portfolio"
      style={{ "--project": project.color } as CSSProperties}
    >
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
          <a href={route("/contact/")}>Contact</a>
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
          aria-label="Project previews"
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
              href:
                target.closest<HTMLAnchorElement>(".preview.current")?.href ??
                null,
            };
          }}
          onTouchCancel={() => {
            touch.current = null;
          }}
          onTouchEnd={(event) => {
            const start = touch.current;
            touch.current = null;
            if (!start || event.touches.length) return;
            const end = event.changedTouches[0];
            const dx = start.x - end.clientX;
            const dy = start.y - end.clientY;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
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

        <nav className="project-menu" aria-label="Select project">
          <span className="menu-heading">Project index</span>
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
        </nav>

        <div className="left-copy" aria-live="polite">
          <h1 key={project.slug}>
            {project.name}
            <span>.</span>
          </h1>
          <p>{project.line}</p>
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
            ↑
          </button>
          <span>
            {pad(active + 1)} / {pad(projects.length)}
          </span>
          <button
            aria-label="Next project"
            onClick={() => select(active + 1)}
            disabled={active === lastIndex}
          >
            ↓
          </button>
        </div>
        <span>SCROLL OR SELECT TO EXPLORE</span>
      </footer>
    </main>
  );
}
