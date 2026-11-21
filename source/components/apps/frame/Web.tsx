"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Modal, useToast, ease, spring, Empty } from "../../kit/ui";
import { T, playable, profiles, titles, useFrame, type Title } from "./data";
import { Player, Poster, ProfileGate, ProgressLine } from "./shared";

type Page = "home" | "series" | "films" | "new" | "list";

function HoverCard({ t, onOpen, onPlay, progress, top }: { t: Title; onOpen: () => void; onPlay: () => void; progress?: number; top?: number }) {
  const s = useFrame();
  const toast = useToast();
  const [hover, setHover] = useState(false);
  const timer = useRef<any>(0);
  const inList = s.list.includes(t.id);
  const liked = s.likes.includes(t.id);
  return (
    <div
      className={`fr-card ${top ? "top" : ""}`}
      onMouseEnter={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setHover(true), 380);
      }}
      onMouseLeave={() => {
        clearTimeout(timer.current);
        setHover(false);
      }}
    >
      {top && <span className="fr-top-n" aria-hidden="true">{top}</span>}
      <button className="fr-card-btn" onClick={onOpen} aria-label={`${t.name} — more info`}>
        <Poster t={t} wide={!top} />
        {progress != null && <ProgressLine value={progress} />}
      </button>
      <AnimatePresence>
        {hover && (
          <motion.div className="fr-pop" initial={{ opacity: 0, scale: 0.85, y: 0 }} animate={{ opacity: 1, scale: 1, y: -30 }} exit={{ opacity: 0, scale: 0.9, y: 0 }} transition={{ duration: 0.35, ease }}>
            <div className="fr-pop-media" onClick={onOpen}>
              {t.episodes[0] ? <video src={t.episodes[0].src} autoPlay muted loop playsInline poster={t.still} /> : <img src={t.still} alt="" />}
              <span className="fr-pop-name">{t.name}</span>
            </div>
            <div className="fr-pop-body">
              <div className="fr-pop-actions">
                {t.episodes.length ? (
                  <button className="fr-round white" onClick={onPlay} aria-label={`Play ${t.name}`}><Icon name="play" size={18} fill /></button>
                ) : (
                  <button className={`fr-round ${s.reminders.includes(t.id) ? "on" : ""}`} onClick={() => toast(s.toggleRemind(t.id) ? `We'll remind you on ${t.comingSoon}` : "Reminder removed", { icon: "bell" })} aria-label="Remind me"><Icon name="bell" size={18} /></button>
                )}
                <button className={`fr-round ${inList ? "on" : ""}`} onClick={() => toast(s.toggleList(t.id) ? "Added to My List" : "Removed from My List", { icon: "check" })} aria-label={inList ? "Remove from My List" : "Add to My List"}>
                  <motion.span key={String(inList)} initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} transition={spring}><Icon name={inList ? "check" : "plus"} size={18} /></motion.span>
                </button>
                <button className={`fr-round ${liked ? "on" : ""}`} onClick={() => s.toggleLike(t.id)} aria-label="Like" aria-pressed={liked}>
                  <motion.span animate={liked ? { scale: [1, 1.4, 1], rotate: [0, -12, 0] } : {}}><Icon name="heart" size={17} fill={liked} /></motion.span>
                </button>
                <span className="grow" />
                <button className="fr-round" onClick={onOpen} aria-label="More info"><Icon name="down" size={18} /></button>
              </div>
              <div className="fr-pop-meta">
                <b>{t.match}% match</b> <span className="fr-rating">{t.rating}</span> {t.runtime}
              </div>
              <div className="fr-pop-genres">{t.genres.join(" • ")}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ title, items, onOpen, onPlay, top = false, resume = false }: { title: string; items: { t: Title; progress?: number; epId?: string }[]; onOpen: (t: Title) => void; onPlay: (t: Title, epId?: string) => void; top?: boolean; resume?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  return (
    <section className="fr-row">
      <h2>{title}</h2>
      <div className="fr-row-wrap">
        <button className="fr-row-arrow l" onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth * 0.8, behavior: "smooth" })} aria-label={`Scroll ${title} left`}><Icon name="back" size={28} /></button>
        <div className={`fr-row-track ${top ? "top" : ""}`} ref={track}>
          {items.map(({ t, progress, epId }, i) => (
            <motion.div key={t.id + (epId || "")} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.05 }}>
              <HoverCard t={t} onOpen={() => (resume ? onPlay(t, epId) : onOpen(t))} onPlay={() => onPlay(t, epId)} progress={progress} top={top ? i + 1 : undefined} />
            </motion.div>
          ))}
        </div>
        <button className="fr-row-arrow r" onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * 0.8, behavior: "smooth" })} aria-label={`Scroll ${title} right`}><Icon name="next" size={28} /></button>
      </div>
    </section>
  );
}

function Hero({ t, onPlay, onOpen }: { t: Title; onPlay: () => void; onOpen: () => void }) {
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const v = useRef<HTMLVideoElement>(null);
  return (
    <section className="fr-hero">
      <AnimatePresence>
        {!ended && (
          <motion.video
            ref={v}
            key={t.id}
            className="fr-hero-video"
            src={t.episodes[0].src}
            poster={t.still}
            autoPlay
            muted={muted}
            playsInline
            onEnded={() => setEnded(true)}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease }}
          />
        )}
      </AnimatePresence>
      {ended && <motion.img className="fr-hero-video" src={t.still} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
      <div className="fr-hero-shade" />
      <div className="fr-hero-copy">
        <motion.span className="fr-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <span className="fr-mark">F</span> {t.kind === "Series" ? "SERIES" : t.kind.toUpperCase()}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0, scale: ended ? 1 : 1 }} transition={{ duration: 1, ease, delay: 0.2 }}>
          {t.name}
        </motion.h1>
        <motion.div className="fr-hero-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <b>#1 in Documentaries today</b> · {t.year} · <span className="fr-rating">{t.rating}</span> · {t.runtime}
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: ended ? 1 : 0.92, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
          {t.synopsis}
        </motion.p>
        <motion.div className="fr-hero-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8, ease }}>
          <button className="fr-btn big white" onClick={onPlay}><Icon name="play" size={22} fill /> Play</button>
          <button className="fr-btn big ghost" onClick={onOpen}><Icon name="info" size={22} /> More info</button>
        </motion.div>
      </div>
      <div className="fr-hero-side">
        <button className="fr-round" onClick={() => { if (ended) { setEnded(false); } else setMuted(!muted); }} aria-label={ended ? "Replay preview" : muted ? "Unmute preview" : "Mute preview"}>
          <Icon name={ended ? "refresh" : muted ? "mute" : "volume"} size={18} />
        </button>
        <span className="fr-age">{t.rating}</span>
      </div>
    </section>
  );
}

function TitleModal({ t, onClose, onPlay, onOpen }: { t: Title | null; onClose: () => void; onPlay: (t: Title, epId?: string) => void; onOpen: (t: Title) => void }) {
  const s = useFrame();
  const toast = useToast();
  return (
    <Modal open={!!t} onClose={onClose} label={t ? t.name : "Title"} className="fr-modal">
      {t && (
        <div className="fr-detail">
          <div className="fr-detail-hero">
            {t.episodes[0] ? <video src={t.episodes[0].src} poster={t.still} autoPlay muted loop playsInline /> : <img src={t.still} alt="" />}
            <div className="fr-detail-shade" />
            <div className="fr-detail-copy">
              <h2>{t.name}</h2>
              <div className="fr-hero-btns">
                {t.episodes.length ? (
                  <button className="fr-btn white" onClick={() => onPlay(t)}><Icon name="play" size={20} fill /> {s.resume.some((r) => r.t.id === t.id) ? "Resume" : "Play"}</button>
                ) : (
                  <button className={`fr-btn white`} onClick={() => toast(s.toggleRemind(t.id) ? `Reminder set for ${t.comingSoon}` : "Reminder removed", { icon: "bell" })}><Icon name="bell" size={18} /> {s.reminders.includes(t.id) ? "Reminder set" : "Remind me"}</button>
                )}
                <button className={`fr-round ${s.list.includes(t.id) ? "on" : ""}`} onClick={() => toast(s.toggleList(t.id) ? "Added to My List" : "Removed from My List", { icon: "check" })} aria-label="My List"><Icon name={s.list.includes(t.id) ? "check" : "plus"} size={18} /></button>
                <button className={`fr-round ${s.likes.includes(t.id) ? "on" : ""}`} onClick={() => s.toggleLike(t.id)} aria-label="Like"><Icon name="heart" size={17} fill={s.likes.includes(t.id)} /></button>
              </div>
            </div>
          </div>
          <div className="fr-detail-body">
            <div className="fr-detail-info">
              <div>
                <div className="fr-pop-meta"><b>{t.match}% match</b> {t.year} <span className="fr-rating">{t.rating}</span> {t.runtime} <span className="fr-hd">HD</span> <span className="fr-hd">CC</span></div>
                <p>{t.synopsis}</p>
              </div>
              <dl>
                <div><dt>Cast</dt><dd>{t.cast.join(", ")}</dd></div>
                <div><dt>Genres</dt><dd>{t.genres.join(", ")}</dd></div>
                {t.comingSoon && <div><dt>Arrives</dt><dd>{t.comingSoon}</dd></div>}
              </dl>
            </div>
            {t.episodes.length > 1 && (
              <section>
                <div className="fr-eps-head"><h3>Episodes</h3><span>Season 1</span></div>
                <ol className="fr-eps">
                  {t.episodes.map((e) => {
                    const h = s.history[e.id];
                    return (
                      <li key={e.id}>
                        <button onClick={() => onPlay(t, e.id)}>
                          <span className="fr-ep-n">{e.n}</span>
                          <span className="fr-ep-img"><img src={e.still} alt="" /><i><Icon name="play" size={18} fill /></i>{h && <ProgressLine value={h.done ? 1 : h.at / e.dur} />}</span>
                          <span className="fr-ep-copy"><b>{e.title}</b><small>{e.desc}</small></span>
                          <span className="fr-ep-dur">{e.dur}s</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
            <section>
              <h3>More like this</h3>
              <div className="fr-more">
                {titles.filter((x) => x.id !== t.id && x.genres.some((g) => t.genres.includes(g)) && s.visible(x)).slice(0, 6).map((x) => (
                  <button key={x.id} onClick={() => onOpen(x)}>
                    <Poster t={x} wide />
                    <span><b>{x.match}% match</b> {x.year}</span>
                    <small>{x.synopsis.slice(0, 80)}…</small>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function FrameWeb() {
  const s = useFrame();
  const [page, setPage] = useState<Page>("home");
  const [open, setOpen] = useState<Title | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 30);
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  if (!s.me) return <div className="frame fr-web"><ProfileGate onPick={s.setProfile} /></div>;
  const vis = titles.filter(s.visible);
  const play = (t: Title, epId?: string) => {
    const r = s.resume.find((x) => x.t.id === t.id);
    setOpen(null);
    setPlaying(epId || r?.e.id || t.episodes[0]?.id);
  };
  const featured = s.me.kids ? T("earth") : T("earth");
  const results = q ? vis.filter((t) => (t.name + t.genres.join(" ") + t.cast.join(" ")).toLowerCase().includes(q.toLowerCase())) : [];
  const byGenre = (g: string) => vis.filter((t) => t.genres.includes(g)).map((t) => ({ t }));
  const go = (p: Page) => {
    setPage(p);
    setQ("");
    scrollTo({ top: 0 });
  };
  return (
    <div className="frame fr-web">
      <header className={`fr-header ${scrolled ? "solid" : ""}`}>
        <button className="fr-logo" onClick={() => go("home")}>FRAME</button>
        <nav aria-label="Browse">
          {([["home", "Home"], ["series", "Series"], ["films", "Films"], ["new", "New & Popular"], ["list", "My List"]] as [Page, string][]).map(([k, l]) => (
            <button key={k} aria-current={page === k && !q ? "page" : undefined} onClick={() => go(k)}>{l}</button>
          ))}
        </nav>
        <div className="fr-tools">
          <motion.div className={`fr-search ${searchOpen || q ? "open" : ""}`} layout>
            <button onClick={() => setSearchOpen(true)} aria-label="Search"><Icon name="search" size={20} /></button>
            {(searchOpen || q) && <motion.input initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} autoFocus value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => !q && setSearchOpen(false)} placeholder="Titles, people, genres" aria-label="Search titles" />}
          </motion.div>
          <button className="fr-bell" aria-label="Notifications"><Icon name="bell" size={20} />{s.reminders.length > 0 && <i />}</button>
          <div className="fr-me-wrap">
            <button className="fr-me" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Profile menu"><span style={{ background: s.me.color }} />{s.me.name}<Icon name="down" size={14} /></button>
            <AnimatePresence>
              {menu && (
                <motion.div className="fr-me-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {profiles.filter((p) => p.id !== s.profile).map((p) => (
                    <button key={p.id} onClick={() => { s.setProfile(p.id); setMenu(false); go("home"); }}><span style={{ background: p.color }} />{p.name}</button>
                  ))}
                  <button onClick={() => { s.setProfile(null); setMenu(false); }}><Icon name="people" size={16} /> Manage profiles</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {q ? (
        <div className="fr-results">
          <p>{results.length ? `Results for “${q}”` : `No results for “${q}”`}</p>
          <div className="fr-grid">
            {results.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <HoverCard t={t} onOpen={() => setOpen(t)} onPlay={() => play(t)} />
              </motion.div>
            ))}
          </div>
          {!results.length && <div className="fr-suggest">Try: {["Documentary", "Sci-fi", "Drama", "Ines Valk"].map((x) => <button key={x} onClick={() => setQ(x)}>{x}</button>)}</div>}
        </div>
      ) : page === "home" ? (
        <>
          <Hero t={featured} onPlay={() => play(featured)} onOpen={() => setOpen(featured)} />
          <div className="fr-rows">
            <Row title={`Continue watching for ${s.me.name}`} resume items={s.resume.filter((r) => s.visible(r.t)).map((r) => ({ t: r.t, progress: r.at / r.e.dur, epId: r.e.id }))} onOpen={setOpen} onPlay={play} />
            <Row title="Top 5 in the U.S. today" top items={vis.filter((t) => t.top).sort((a, b) => a.top! - b.top!).map((t) => ({ t }))} onOpen={setOpen} onPlay={play} />
            <Row title="New this week" items={vis.filter((t) => t.isNew).map((t) => ({ t }))} onOpen={setOpen} onPlay={play} />
            <Row title="Slow TV & documentaries" items={byGenre("Documentary")} onOpen={setOpen} onPlay={play} />
            <Row title="Edge-of-your-seat" items={[...byGenre("Thriller"), ...byGenre("Sci-fi")].filter((x, i, a) => a.findIndex((y) => y.t.id === x.t.id) === i)} onOpen={setOpen} onPlay={play} />
            {s.list.length > 0 && <Row title="My List" items={s.list.map(T).filter(s.visible).map((t) => ({ t }))} onOpen={setOpen} onPlay={play} />}
          </div>
        </>
      ) : (
        <div className="fr-results">
          <h1 className="fr-page-title">{{ series: "Series", films: "Films", new: "New & Popular", list: "My List" }[page]}</h1>
          {page === "new" && (
            <div className="fr-coming">
              {titles.filter((t) => t.comingSoon).map((t) => (
                <motion.div key={t.id} className="fr-coming-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Poster t={t} wide />
                  <div>
                    <small>Coming {t.comingSoon}</small>
                    <h3>{t.name}</h3>
                    <p>{t.synopsis}</p>
                    <button className={`fr-btn ${s.reminders.includes(t.id) ? "white" : "ghost"}`} onClick={() => s.toggleRemind(t.id)}><Icon name={s.reminders.includes(t.id) ? "check" : "bell"} size={16} /> {s.reminders.includes(t.id) ? "Reminder set" : "Remind me"}</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="fr-grid">
            {(page === "series" ? vis.filter((t) => t.kind === "Series") : page === "films" ? vis.filter((t) => t.kind !== "Series") : page === "new" ? vis.filter((t) => t.isNew || t.top) : s.list.map(T).filter(s.visible)).map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <HoverCard t={t} onOpen={() => setOpen(t)} onPlay={() => play(t)} />
              </motion.div>
            ))}
          </div>
          {page === "list" && !s.list.length && <Empty icon="plus" title="Your list is empty" text="Add shows and films to watch them later." />}
        </div>
      )}
      <footer className="fr-footer">FRAME · Concept by Sheikh Robin Emon · Original motion studies with captions · {playable.length} playable titles</footer>
      <TitleModal t={open} onClose={() => setOpen(null)} onPlay={play} onOpen={setOpen} />
      <AnimatePresence>{playing && <Player key="player" epId={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </div>
  );
}
