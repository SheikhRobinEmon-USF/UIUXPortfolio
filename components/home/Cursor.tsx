"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A soft follower cursor. It reads `data-cursor` from whatever is under the
 * pointer to show a contextual label (View, Drag, Select…). Mouse only.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);
  const [down, setDown] = useState(false);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      setOn(true);
      const el = (e.target as Element)?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactive = (e.target as Element)?.closest?.("a, button");
      setLabel(el?.dataset.cursor || (interactive ? "•" : ""));
    };
    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.2;
      cur.y += (pos.y - cur.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    const leave = () => setOn(false);
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    document.documentElement.classList.add("has-cursor");
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  const big = label && label !== "•";
  return (
    <div ref={dot} className={`cursor ${on ? "on" : ""} ${big ? "big" : ""} ${label === "•" ? "link" : ""} ${down ? "down" : ""}`} aria-hidden="true">
      <span>{big ? label : ""}</span>
    </div>
  );
}
