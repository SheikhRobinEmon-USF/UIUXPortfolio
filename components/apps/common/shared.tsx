"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { ease, spring } from "../../kit/ui";
import { C, U, fmtK, stories, useCommon, type Post } from "./data";

const PAL = ["#ff7a59", "#d7f25c", "#b9a6ff", "#7bc5a5", "#14171a", "#f6f5f0", "#6aa3ff", "#e2b07a", "#f2a7c3"];

/** Deterministic generative artwork used for illustration posts and covers. */
export function Artwork({ seed, className = "" }: { seed: number; className?: string }) {
  const r = (n: number) => {
    const x = Math.sin(seed * 999 + n * 77.7) * 10000;
    return x - Math.floor(x);
  };
  const bg = PAL[Math.floor(r(1) * PAL.length)];
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    c: PAL[Math.floor(r(i + 2) * PAL.length)],
    x: r(i + 10) * 100,
    y: r(i + 20) * 100,
    s: 18 + r(i + 30) * 42,
    k: Math.floor(r(i + 40) * 4),
    rot: r(i + 50) * 180,
  }));
  return (
    <svg className={`cm-art ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="100" height="100" fill={bg} />
      {shapes.map((s, i) =>
        s.c === bg ? null : s.k === 0 ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.s / 2} fill={s.c} />
        ) : s.k === 1 ? (
          <rect key={i} x={s.x - s.s / 2} y={s.y - s.s / 2} width={s.s} height={s.s} rx={s.s / 6} fill={s.c} transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
        ) : s.k === 2 ? (
          <path key={i} d={`M${s.x - s.s / 2} ${s.y} a${s.s / 2} ${s.s / 2} 0 0 1 ${s.s} 0z`} fill={s.c} transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
        ) : (
          <path key={i} d={`M${s.x - s.s / 2} ${s.y + s.s / 3} Q ${s.x} ${s.y - s.s / 1.5} ${s.x + s.s / 2} ${s.y + s.s / 3}`} stroke={s.c} strokeWidth="4" fill="none" strokeLinecap="round" />
        ),
      )}
    </svg>
  );
}

export function Av({ id, size = 40, ring = false, seen = false }: { id: string; size?: number; ring?: boolean; seen?: boolean }) {
  const u = U(id) || { name: C(id)?.name || "?", color: C(id)?.color || "#ccc" };
  const s = useCommon();
  const name = id === "me" ? s.me.name : u.name;
  return (
    <span className={`cm-av ${ring ? (seen ? "ring seen" : "ring") : ""}`} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      <span style={{ background: u.color }}>{name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
    </span>
  );
}

export function Media({ p, className = "" }: { p: Pick<Post, "img" | "art">; className?: string }) {
  return p.img ? <img className={`cm-media ${className}`} src={p.img} alt="" loading="lazy" /> : <Artwork seed={p.art ?? 1} className={`cm-media ${className}`} />;
}

export function Poll({ p }: { p: Post }) {
  const s = useCommon();
  const mine = s.votes[p.id];
  const total = p.poll!.votes.reduce((x, y) => x + y, 0);
  const voted = mine != null;
  return (
    <div className="cm-poll" role="group" aria-label="Poll">
      {p.poll!.options.map((o, i) => {
        const pct = Math.round((p.poll!.votes[i] / total) * 100);
        return (
          <button key={o} className={`${voted ? "voted" : ""} ${mine === i ? "mine" : ""}`} onClick={() => s.vote(p.id, i)} disabled={voted} aria-pressed={mine === i}>
            {voted && <motion.span className="cm-poll-bar" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease }} />}
            <span className="cm-poll-label">{o}{mine === i && <Icon name="check" size={14} stroke={2.6} />}</span>
            {voted && <motion.b initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{pct}%</motion.b>}
          </button>
        );
      })}
      <small>{fmtK(total)} votes · {voted ? "Thanks for voting" : "Tap to vote"}</small>
    </div>
  );
}

/** Heart that bursts into particles when activated. */
export function LikeButton({ on, count, onClick }: { on: boolean; count: number; onClick: () => void }) {
  return (
    <button className={`cm-act ${on ? "liked" : ""}`} onClick={onClick} aria-pressed={on} aria-label={on ? "Unlike" : "Like"}>
      <span className="cm-like-ico">
        <motion.span key={String(on)} initial={{ scale: on ? 0.3 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
          <Icon name="heart" size={21} fill={on} />
        </motion.span>
        <AnimatePresence>
          {on && (
            <span className="cm-burst">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.i key={i} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: Math.cos((i / 8) * 6.28) * 20, y: Math.sin((i / 8) * 6.28) * 20, scale: 0, opacity: 0 }} transition={{ duration: 0.55 }} style={{ background: PAL[i % 4] }} />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={count} initial={{ y: on ? 10 : -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: on ? -10 : 10, opacity: 0 }}>
          {fmtK(count)}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** Full-screen story viewer with segmented progress, tap zones and hold-to-pause. */
export function StoryViewer({ start, onClose }: { start: number | null; onClose: () => void }) {
  const s = useCommon();
  const [u, setU] = useState(start ?? 0);
  const [f, setF] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const t0 = useRef(0);
  const elapsed = useRef(0);
  const [prog, setProg] = useState(0);
  const DUR = 4200;
  useEffect(() => {
    if (start != null) {
      setU(start);
      setF(0);
    }
  }, [start]);
  const story = stories[u];
  useEffect(() => {
    if (start == null || !story) return;
    s.seeStory(story.by);
    elapsed.current = 0;
    setProg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, f, start]);
  useEffect(() => {
    if (start == null || paused) return;
    t0.current = performance.now() - elapsed.current;
    let raf = 0;
    const tick = () => {
      elapsed.current = performance.now() - t0.current;
      const p = elapsed.current / DUR;
      setProg(Math.min(1, p));
      if (p >= 1) next();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, f, paused, start]);
  function next() {
    if (!story) return;
    if (f < story.frames.length - 1) setF(f + 1);
    else if (u < stories.length - 1) {
      setU(u + 1);
      setF(0);
    } else onClose();
  }
  function prev() {
    if (f > 0) setF(f - 1);
    else if (u > 0) {
      setU(u - 1);
      setF(0);
    }
  }
  return (
    <AnimatePresence>
      {start != null && story && (
        <motion.div className="kit-layer cm-story" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.35, ease }} role="dialog" aria-label={`${U(story.by).name}'s story`}>
          <motion.div
            className="cm-story-card"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
          >
            <div className="cm-story-bars">
              {story.frames.map((_, i) => (
                <span key={i}>
                  <i style={{ width: `${i < f ? 100 : i === f ? prog * 100 : 0}%` }} />
                </span>
              ))}
            </div>
            <div className="cm-story-head">
              <Av id={story.by} size={34} />
              <strong>{U(story.by).name}</strong>
              <small>{3 + u}h</small>
              <span className="grow" />
              <button onClick={() => setPaused(!paused)} aria-label={paused ? "Play story" : "Pause story"}><Icon name={paused ? "play" : "pause"} size={18} fill /></button>
              <button onClick={onClose} aria-label="Close story"><Icon name="close" size={22} /></button>
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={`${u}-${f}`} className="cm-story-media" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <Media p={story.frames[f]} />
                <p>{story.frames[f].text}</p>
              </motion.div>
            </AnimatePresence>
            <button className="cm-story-zone l" onClick={prev} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} aria-label="Previous" />
            <button className="cm-story-zone r" onClick={next} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} aria-label="Next" />
            <form
              className="cm-story-reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                s.send(story.by, `Re your story: ${reply}`);
                setReply("");
                setSent(true);
                setTimeout(() => setSent(false), 1600);
              }}
            >
              <input value={reply} onChange={(e) => setReply(e.target.value)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} placeholder={`Reply to ${U(story.by).name.split(" ")[0]}…`} aria-label="Reply to story" />
              <button aria-label="Send reply"><Icon name="send" size={20} /></button>
              <AnimatePresence>{sent && <motion.span className="cm-sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Sent</motion.span>}</AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const s = useCommon();
  const [pick, setPick] = useState<string[]>(["illo"]);
  const list = [
    ["illo", "Illustration"],
    ["type", "Typography"],
    ["film", "Film photography"],
    ["clay", "Ceramics"],
    ["ux", "UX & product"],
  ];
  return (
    <div className="cm-onboard">
      <motion.span className="cm-logo big" initial={{ rotate: -8, scale: 0.6, opacity: 0 }} animate={{ rotate: -3, scale: 1, opacity: 1 }} transition={spring}>common</motion.span>
      <h2>What are you into?</h2>
      <p>Pick a few circles. Your feed starts with them — no follower count required.</p>
      <div className="cm-ob-chips">
        {list.map(([id, l], i) => (
          <motion.button key={id} aria-pressed={pick.includes(id)} onClick={() => setPick(pick.includes(id) ? pick.filter((x) => x !== id) : [...pick, id])} style={{ "--c": C(id).color } as React.CSSProperties} initial={{ opacity: 0, y: 14, rotate: i % 2 ? 3 : -3 }} animate={{ opacity: 1, y: 0, rotate: pick.includes(id) ? (i % 2 ? 2 : -2) : 0 }} transition={{ delay: 0.15 + i * 0.05, ...spring }} whileTap={{ scale: 0.92 }}>
            {pick.includes(id) && <Icon name="check" size={16} stroke={2.6} />} {l}
          </motion.button>
        ))}
      </div>
      <button className="cm-btn big" disabled={!pick.length} onClick={() => { s.setJoined(pick); s.setOnboarded(true); onDone(); }}>
        Join {pick.length} circle{pick.length === 1 ? "" : "s"} <Icon name="next" size={18} />
      </button>
    </div>
  );
}

export const critiqueTags = ["Colour", "Composition", "Type", "Concept", "Craft"];
