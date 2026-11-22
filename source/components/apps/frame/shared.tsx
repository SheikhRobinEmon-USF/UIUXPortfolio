"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { ease, spring } from "../../kit/ui";
import { epById, fmtTime, profiles, useFrame, type Episode, type Title } from "./data";

export function Poster({ t, className = "", label = true, wide = false }: { t: Title; className?: string; label?: boolean; wide?: boolean }) {
  return (
    <div className={`fr-poster ${wide ? "wide" : ""} ${className}`} style={{ "--tone": t.tone } as React.CSSProperties}>
      <img src={t.still} alt="" loading="lazy" />
      {label && (
        <div className="fr-poster-type">
          <span className="fr-mark">F</span>
          <strong>{t.name}</strong>
          {t.isNew && <em>New episodes</em>}
        </div>
      )}
    </div>
  );
}

export function ProfileGate({ onPick, compact = false }: { onPick: (id: string) => void; compact?: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className={`fr-gate ${compact ? "compact" : ""}`}>
      <motion.span className="fr-logo big" initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.32em" }} transition={{ duration: 1.2, ease }}>
        FRAME
      </motion.span>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }}>
        Who's watching?
      </motion.h1>
      <div className="fr-profiles">
        {profiles.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => {
              setPicked(p.id);
              setTimeout(() => onPick(p.id), 650);
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={picked ? (picked === p.id ? { scale: 1.25, opacity: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 0 }) : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease, delay: picked ? 0 : 0.45 + i * 0.08 }}
            whileHover={{ y: -6 }}
          >
            <span className="fr-avatar" style={{ background: p.color }}>
              <svg viewBox="0 0 60 60" aria-hidden="true">
                <circle cx="21" cy="25" r="3.2" fill="#0b0d12" />
                <circle cx="39" cy="25" r="3.2" fill="#0b0d12" />
                <path d={p.kids ? "M18 36 Q30 48 42 36" : "M20 38 Q30 44 40 38"} stroke="#0b0d12" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            {p.name}
          </motion.button>
        ))}
      </div>
      <motion.p className="fr-gate-note" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1 }}>
        Kids shows only all-ages titles.
      </motion.p>
    </div>
  );
}

/** Full player. `rotated` renders it as a landscape phone player. */
export function Player({ epId, onClose, rotated = false }: { epId: string; onClose: () => void; rotated?: boolean }) {
  const s = useFrame();
  const [current, setCurrent] = useState(epId);
  const f = epById(current)!;
  const t = f.t;
  const e = f.e;
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(e.dur);
  const [muted, setMuted] = useState(false);
  const [ui, setUi] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [menu, setMenu] = useState<null | "speed" | "episodes">(null);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const hideTimer = useRef<any>(0);
  const lastSave = useRef(0);
  const next: Episode | undefined = t.episodes[e.n];

  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setUi(false), 2600);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const resumeAt = s.history[current] && !s.history[current].done ? s.history[current].at : 0;
    v.currentTime = resumeAt;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
    setCountdown(null);
    poke();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!video.current) return;
    const track = video.current.textTracks[0];
    if (track) track.mode = s.captions ? "showing" : "hidden";
  }, [s.captions, current]);

  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) {
      if (next) setCurrent(next.id);
      return;
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, next]);

  useEffect(() => {
    const k = (ev: KeyboardEvent) => {
      const v = video.current;
      if (!v) return;
      if (ev.key === "Escape") close();
      if (ev.key === " " || ev.key === "k") {
        ev.preventDefault();
        v.paused ? v.play() : v.pause();
      }
      if (ev.key === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 2);
      if (ev.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 2);
      if (ev.key === "m") toggleMute();
      if (ev.key === "c") s.setCaptions(!s.captions);
      poke();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  function close() {
    const v = video.current;
    if (v) s.progress(current, v.currentTime, v.duration || e.dur);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose();
  }
  function toggleMute() {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }
  function seekTo(clientX: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const ratio = rotated ? (clientX - r.top) / r.height : (clientX - r.left) / r.width;
    const v = video.current!;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * (v.duration || dur);
  }
  const pct = dur ? (time / dur) * 100 : 0;

  return (
    <motion.div
      ref={box}
      className={`fr-player ${rotated ? "rotated" : ""} ${ui ? "" : "idle"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onPointerMove={poke}
      onClick={(ev) => {
        if ((ev.target as HTMLElement).closest("button, .fr-scrub, .fr-menu")) return;
        if (rotated && !ui) return poke();
        const v = video.current!;
        v.paused ? v.play() : v.pause();
        poke();
      }}
      role="dialog"
      aria-label={`Playing ${t.name}${t.episodes.length > 1 ? `, episode ${e.n}` : ""}`}
    >
      <video
        ref={video}
        key={current}
        src={e.src}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(ev) => setDur(ev.currentTarget.duration || e.dur)}
        onTimeUpdate={(ev) => {
          const v = ev.currentTarget;
          setTime(v.currentTime);
          if (performance.now() - lastSave.current > 1500) {
            lastSave.current = performance.now();
            s.progress(current, v.currentTime, v.duration || e.dur);
          }
        }}
        onEnded={(ev) => {
          s.progress(current, ev.currentTarget.duration, ev.currentTarget.duration);
          setUi(true);
          if (next) setCountdown(5);
        }}
      >
        <track kind="captions" src={e.vtt} srcLang="en" label="English" default={s.captions} />
      </video>

      <div className="fr-p-top">
        <button className="fr-p-icon" onClick={close} aria-label="Close player">
          <Icon name="back" size={26} />
        </button>
        <div className="fr-p-title">
          <strong>{t.name}</strong>
          {t.episodes.length > 1 && <span>E{e.n} · {e.title}</span>}
        </div>
        <span />
      </div>

      <AnimatePresence>
        {time < 2 && time > 0.05 && !countdown && t.episodes.length > 1 && (
          <motion.button className="fr-skip" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => { video.current!.currentTime = 2; }}>
            Skip intro
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!playing && ui && countdown == null && (
          <motion.button className="fr-bigplay" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }} transition={spring} onClick={() => video.current?.play()} aria-label="Play">
            <Icon name="play" size={40} fill />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {countdown != null && next && (
          <motion.div className="fr-upnext" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <img src={next.still} alt="" />
            <div>
              <small>Next episode in {countdown}</small>
              <strong>E{next.n} · {next.title}</strong>
              <div className="fr-upnext-actions">
                <button className="fr-btn" onClick={() => setCurrent(next.id)}><Icon name="play" size={16} fill /> Play now</button>
                <button className="fr-btn ghost" onClick={() => setCountdown(null)}>Cancel</button>
              </div>
            </div>
            <svg className="fr-upnext-ring" viewBox="0 0 40 40" aria-hidden="true">
              <motion.circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="2.5" initial={{ pathLength: 1 }} animate={{ pathLength: 0 }} transition={{ duration: 5, ease: "linear" }} />
            </svg>
          </motion.div>
        )}
        {countdown != null && !next && (
          <motion.div className="fr-upnext end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div><small>You finished</small><strong>{t.name}</strong><button className="fr-btn" onClick={close}>Back to browse</button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fr-p-bottom">
        <div
          className="fr-scrub"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur)}
          aria-valuenow={Math.round(time)}
          tabIndex={0}
          onPointerDown={(ev) => seekTo(rotated ? ev.clientY : ev.clientX, ev.currentTarget)}
          onPointerMove={(ev) => {
            const r = ev.currentTarget.getBoundingClientRect();
            const ratio = rotated ? (ev.clientY - r.top) / r.height : (ev.clientX - r.left) / r.width;
            setHoverT(Math.max(0, Math.min(1, ratio)) * dur);
            if (ev.buttons) seekTo(rotated ? ev.clientY : ev.clientX, ev.currentTarget);
          }}
          onPointerLeave={() => setHoverT(null)}
          onKeyDown={(ev) => {
            if (ev.key === "ArrowRight") video.current!.currentTime += 1;
            if (ev.key === "ArrowLeft") video.current!.currentTime -= 1;
          }}
        >
          <div className="fr-scrub-track">
            <i className="fr-scrub-fill" style={{ width: `${pct}%` }} />
            <i className="fr-scrub-knob" style={{ left: `${pct}%` }} />
          </div>
          {hoverT != null && !rotated && (
            <div className="fr-scrub-preview" style={{ left: `${(hoverT / dur) * 100}%` }}>
              <img src={e.still} alt="" />
              <span>{fmtTime(hoverT)}</span>
            </div>
          )}
        </div>
        <div className="fr-p-controls">
          <button className="fr-p-icon" onClick={() => (playing ? video.current?.pause() : video.current?.play())} aria-label={playing ? "Pause" : "Play"}>
            <Icon name={playing ? "pause" : "play"} size={26} fill />
          </button>
          <button className="fr-p-icon" onClick={() => (video.current!.currentTime = Math.max(0, time - 2))} aria-label="Back 2 seconds"><Icon name="rew" size={22} fill /></button>
          <button className="fr-p-icon" onClick={() => (video.current!.currentTime = Math.min(dur, time + 2))} aria-label="Forward 2 seconds"><Icon name="fwd" size={22} fill /></button>
          <button className="fr-p-icon" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}><Icon name={muted ? "mute" : "volume"} size={22} /></button>
          <span className="fr-time">{fmtTime(time)} / {fmtTime(dur)}</span>
          <span className="grow" />
          {next && <button className="fr-p-icon" onClick={() => setCurrent(next.id)} aria-label="Next episode"><Icon name="next" size={24} /></button>}
          {t.episodes.length > 1 && <button className="fr-p-icon" onClick={() => setMenu(menu === "episodes" ? null : "episodes")} aria-label="Episodes" aria-expanded={menu === "episodes"}><Icon name="list" size={22} /></button>}
          <button className={`fr-p-icon ${s.captions ? "on" : ""}`} onClick={() => s.setCaptions(!s.captions)} aria-label="Captions" aria-pressed={s.captions}><Icon name="cc" size={22} /></button>
          <button className="fr-p-icon fr-speed-btn" onClick={() => setMenu(menu === "speed" ? null : "speed")} aria-label="Playback speed" aria-expanded={menu === "speed"}>{speed}×</button>
          {!rotated && (
            <button className="fr-p-icon" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen())} aria-label="Full screen"><Icon name="expand" size={22} /></button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menu === "speed" && (
          <motion.div className="fr-menu speed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <strong>Playback speed</strong>
            {[0.5, 1, 1.25, 1.5, 2].map((v) => (
              <button key={v} aria-pressed={speed === v} onClick={() => { setSpeed(v); setMenu(null); }}>{v === 1 ? "1× (Normal)" : `${v}×`}</button>
            ))}
          </motion.div>
        )}
        {menu === "episodes" && (
          <motion.div className="fr-menu eps" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <strong>{t.name} · Season 1</strong>
            {t.episodes.map((x) => (
              <button key={x.id} aria-pressed={x.id === current} onClick={() => { setCurrent(x.id); setMenu(null); }}>
                <img src={x.still} alt="" />
                <span><b>{x.n}. {x.title}</b><small>{x.desc}</small></span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProgressLine({ value }: { value: number }) {
  return (
    <span className="fr-pline" aria-hidden="true">
      <i style={{ width: `${Math.min(1, value) * 100}%` }} />
    </span>
  );
}
