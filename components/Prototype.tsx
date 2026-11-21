"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { type Project, route } from "../lib/projects";
import "./prototype.css";

const Catalog = dynamic(() => import("./prototypes/Catalog"));
const Ledger = dynamic(() => import("./prototypes/Ledger"));
const Social = dynamic(() => import("./prototypes/Social"));

const navs: Record<string, string[]> = {
  ecommerce: ["Discover", "Browse", "Wishlist", "Bag", "Orders"],
  food: ["Discover", "Cart", "Tracking", "Orders"],
  stays: ["Discover", "Browse", "Saved", "Trips"],
  streaming: [
    "Home",
    "Browse",
    "Watchlist",
    "Continue watching",
    "History",
    "Profiles",
  ],
  social: [
    "Feed",
    "Explore",
    "Communities",
    "Saved",
    "Messages",
    "Notifications",
    "Profile",
  ],
  health: [
    "Today",
    "Activity",
    "Sleep",
    "Habits",
    "Nutrition",
    "Trends",
    "Goals",
    "Journal",
    "Insights",
    "Settings",
  ],
  finance: [
    "Overview",
    "Accounts",
    "Transactions",
    "Spending",
    "Budgets",
    "Subscriptions",
    "Goals",
    "Insights",
    "Settings",
  ],
};
export default function Prototype({ project: p }: { project: Project }) {
  const [epoch, setEpoch] = useState(0);
  const [screen, setScreen] = useState(navs[p.slug][0]);
  const [note, setNote] = useState("");
  const go = (s: string) => {
    setScreen(s);
    setNote("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <main
      id="main"
      className={"prototype " + p.slug}
      style={{ "--accent": p.color, "--ink": p.ink } as React.CSSProperties}
    >
      <div className="demo-banner">
        <a href={route("/work/" + p.slug + "/")}>← Case study</a>
        <span>Interactive demo</span>
        <button
          onClick={() => {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (k?.startsWith("sre:" + p.slug + ":"))
                localStorage.removeItem(k);
            }
            setEpoch((x) => x + 1);
            go(navs[p.slug][0]);
            setNote("Demo data reset.");
          }}
        >
          Reset demo data
        </button>
      </div>
      <header className="app-header">
        <a
          href="#main"
          className="wordmark"
          onClick={() => go(navs[p.slug][0])}
        >
          {p.name}
          <b>●</b>
        </a>
        <nav aria-label={`${p.name} navigation`}>
          {navs[p.slug].map((s) => (
            <button
              key={s}
              aria-current={screen === s ? "page" : undefined}
              onClick={() => go(s)}
            >
              {s}
            </button>
          ))}
        </nav>
      </header>
      <div className="app-body" key={epoch}>
        <p className="notice" role="status">
          {note}
        </p>
        {["ecommerce", "food", "stays", "streaming"].includes(p.slug) ? (
          <Catalog p={p} screen={screen} go={go} notify={setNote} />
        ) : p.slug === "social" ? (
          <Social screen={screen} go={go} notify={setNote} />
        ) : (
          <Ledger p={p} screen={screen} go={go} notify={setNote} />
        )}
      </div>
      <footer className="app-footer">
        {p.name} · Concept by Sheikh Robin Emon · Local simulation
      </footer>
    </main>
  );
}
