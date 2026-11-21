"use client";

import { useEffect, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { type Project, route } from "../../lib/projects";
import { resetApp } from "../kit/store";
import { ToastHost, Segmented, ease } from "../kit/ui";
import { Icon } from "../kit/icons";
import "../kit/kit.css";

export type View = "web" | "mobile";
export type AppProps = { view: View };

const apps: Record<string, ComponentType<AppProps>> = {
  ecommerce: dynamic(() => import("../apps/atelier/App"), { ssr: false }),
  social: dynamic(() => import("../apps/common/App"), { ssr: false }),
  streaming: dynamic(() => import("../apps/frame/App"), { ssr: false }),
  health: dynamic(() => import("../apps/vital/App"), { ssr: false }),
  finance: dynamic(() => import("../apps/moneta/App"), { ssr: false }),
  food: dynamic(() => import("../apps/crave/App"), { ssr: false }),
  stays: dynamic(() => import("../apps/roam/App"), { ssr: false }),
};

export type Tour = { web: string[]; mobile: string[]; notes: string[] };

function useClock() {
  const [t, setT] = useState("9:41");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, ""));
    f();
    const i = setInterval(f, 30000);
    return () => clearInterval(i);
  }, []);
  return t;
}

function StatusBar() {
  const time = useClock();
  return (
    <div className="phone-status" aria-hidden="true">
      <span>{time}</span>
      <span className="phone-island" />
      <span className="phone-status-icons">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" /><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
        <Icon name="wifi" size={16} stroke={2.2} />
        <svg width="26" height="13" viewBox="0 0 26 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" /><rect x="24" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

export default function PlayShell({ project: p, tour }: { project: Project; tour: Tour }) {
  const App = apps[p.slug];
  const [view, setView] = useState<View | null>(null);
  const [handheld, setHandheld] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [intro, setIntro] = useState(true);
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("view");
    const small = matchMedia("(max-width: 700px)");
    if (params.get("embed") === "1") {
      setEmbed(true);
      setIntro(false);
    }
    setHandheld(small.matches);
    setView(q === "web" || q === "mobile" ? q : small.matches ? "mobile" : "web");
    const onChange = () => setHandheld(small.matches);
    small.addEventListener("change", onChange);
    const t = setTimeout(() => setIntro(false), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100);
    return () => {
      small.removeEventListener("change", onChange);
      clearTimeout(t);
    };
  }, []);

  function choose(v: View) {
    setView(v);
    const url = new URL(location.href);
    url.searchParams.set("view", v);
    history.replaceState(null, "", url);
    window.scrollTo({ top: 0 });
  }

  const bar = (
    <div className="demo-bar">
      <a href={route(`/work/${p.slug}/`)} className="demo-back">
        <Icon name="back" size={16} />
        <span>Case study</span>
      </a>
      {view && (
        <Segmented
          label="Prototype platform"
          className="demo-switch"
          value={view}
          onChange={choose}
          options={[
            { value: "web", label: <><Icon name="grid" size={15} /> Web</> },
            { value: "mobile", label: <><Icon name="phone" size={15} /> Mobile app</> },
          ]}
        />
      )}
      <button
        className="demo-reset"
        onClick={() => {
          resetApp(p.slug);
          setEpoch((e) => e + 1);
        }}
      >
        <Icon name="refresh" size={15} />
        <span>Reset demo</span>
      </button>
    </div>
  );

  return (
    <main id="main" className={`play play-${p.slug} view-${view || "pending"} ${handheld && !embed ? "handheld" : ""} ${embed ? "embed" : ""}`} style={{ "--accent": p.color, "--accent-ink": p.ink } as React.CSSProperties}>
      <AnimatePresence>
        {intro && (
          <motion.div className="play-intro" style={{ background: p.ink, color: p.color }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.8, ease }} aria-hidden="true">
            <motion.strong initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease }}>
              {p.name}
            </motion.strong>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.35 }}>
              {p.tag}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {!embed && bar}
      {view === "web" && (
        <ToastHost key={`w${epoch}`} className="web-toasts">
          <App view="web" />
        </ToastHost>
      )}
      {view === "mobile" && (
        <div className="device-stage">
          {!handheld && !embed && (
            <aside className="device-notes device-notes-left">
              <span className="device-kicker">{p.tag} · iOS concept</span>
              <h1>
                {p.name}
                <i>.</i>
              </h1>
              <p>{p.line}</p>
              <h2>Flows to try</h2>
              <ol>
                {tour.mobile.map((t, i) => (
                  <motion.li key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05, ease }}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {t}
                  </motion.li>
                ))}
              </ol>
            </aside>
          )}
          <motion.div
            className="phone"
            initial={handheld || embed ? false : { y: 60, opacity: 0, rotateX: 8 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ duration: 1, ease, delay: 0.25 }}
          >
            <div className="phone-screen">
              {(!handheld || embed) && <StatusBar />}
              <ToastHost key={`m${epoch}`} className="phone-toasts">
                <App view="mobile" />
              </ToastHost>
              {(!handheld || embed) && <span className="phone-home" aria-hidden="true" />}
            </div>
          </motion.div>
          {!handheld && !embed && (
            <aside className="device-notes device-notes-right">
              <h2>Mobile patterns</h2>
              <ul>
                {tour.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="device-hint">
                <Icon name="info" size={15} /> State is shared with the web version — add something here, then switch to Web.
              </p>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
