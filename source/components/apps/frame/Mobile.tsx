"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Screen, useToast, ease, spring, Empty, Sheet } from "../../kit/ui";
import { useNav, type Nav } from "../../kit/store";
import { T, playable, profiles, titles, useFrame, type Title } from "./data";
import { Player, Poster, ProfileGate, ProgressLine } from "./shared";

function Rail({ title, items, nav, wide = false }: { title: string; items: Title[]; nav: Nav; wide?: boolean }) {
  if (!items.length) return null;
  return (
    <section className="frm-rail">
      <h2>{title}</h2>
      <div className="ph-hscroll">
        {items.map((t, i) => (
          <motion.button key={t.id} className={`frm-tile ${wide ? "wide" : ""}`} onClick={() => nav.push("title", { id: t.id })} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <Poster t={t} wide={wide} />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function HomeTab({ nav, play }: { nav: Nav; play: (epId: string) => void }) {
  const s = useFrame();
  const toast = useToast();
  const vis = titles.filter(s.visible);
  const hero = T("rain").rating !== "All ages" && s.me?.kids ? T("earth") : T("rain");
  const [chip, setChip] = useState("All");
  return (
    <div className="frm-home">
      <div className="frm-top">
        <span className="fr-logo">FRAME</span>
        <div>
          <button className="kit-icon-btn" aria-label="Search" onClick={() => nav.push("search")}><Icon name="search" /></button>
          <button className="frm-me" onClick={() => s.setProfile(null)} aria-label="Switch profile" style={{ background: s.me!.color }} />
        </div>
      </div>
      <div className="ph-chips frm-chips">
        {["All", "Series", "Films", "Documentary"].map((c) => <button key={c} className="ph-chip" aria-pressed={chip === c} onClick={() => setChip(c)}>{c}</button>)}
      </div>
      <motion.div className="frm-hero" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
        <img src={hero.still} alt="" />
        <div className="frm-hero-shade" />
        <div className="frm-hero-copy">
          <strong>{hero.name}</strong>
          <span>{hero.genres.join(" • ")}</span>
          <div>
            <button className="fr-btn white" onClick={() => play(hero.episodes[0].id)}><Icon name="play" size={18} fill /> Play</button>
            <button className="fr-btn ghost" onClick={() => toast(s.toggleList(hero.id) ? "Added to My List" : "Removed", { icon: "check" })}><Icon name={s.list.includes(hero.id) ? "check" : "plus"} size={18} /> My List</button>
          </div>
        </div>
      </motion.div>
      {s.resume.length > 0 && (
        <section className="frm-rail">
          <h2>Continue watching</h2>
          <div className="ph-hscroll">
            {s.resume.filter((r) => s.visible(r.t)).map((r) => (
              <button key={r.e.id} className="frm-resume" onClick={() => play(r.e.id)}>
                <span className="frm-resume-img"><img src={r.e.still} alt="" /><i><Icon name="play" size={22} fill /></i></span>
                <ProgressLine value={r.at / r.e.dur} />
                <span className="frm-resume-meta"><b>{r.t.name}</b><small>{r.t.episodes.length > 1 ? `E${r.e.n}` : "Film"}</small></span>
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="frm-rail">
        <h2>Top 5 today</h2>
        <div className="ph-hscroll frm-top5">
          {vis.filter((t) => t.top).sort((a, b) => a.top! - b.top!).map((t) => (
            <button key={t.id} onClick={() => nav.push("title", { id: t.id })}>
              <span className="fr-top-n">{t.top}</span>
              <Poster t={t} />
            </button>
          ))}
        </div>
      </section>
      <Rail title="New this week" items={vis.filter((t) => t.isNew && (chip === "All" || t.kind === chip || t.genres.includes(chip) || (chip === "Films" && t.kind === "Film")))} nav={nav} />
      <Rail title="Documentaries" items={vis.filter((t) => t.genres.includes("Documentary"))} nav={nav} wide />
      <Rail title="My List" items={s.list.map(T).filter(s.visible)} nav={nav} />
      <div style={{ height: 24 }} />
    </div>
  );
}

function NewTab({ nav }: { nav: Nav }) {
  const s = useFrame();
  const toast = useToast();
  return (
    <div className="ph-pad-top">
      <h1 className="frm-title">New & Hot</h1>
      <div className="ph-chips frm-chips"><button className="ph-chip" aria-pressed="true">Coming soon</button><button className="ph-chip" aria-pressed="false">Everyone's watching</button></div>
      {titles.filter((t) => t.comingSoon || t.isNew).map((t, i) => (
        <motion.article key={t.id} className="frm-new" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ease, delay: i * 0.05 }}>
          <div className="frm-new-date">
            <small>{t.comingSoon ? t.comingSoon.split(" ")[0].toUpperCase() : "NOW"}</small>
            <strong>{t.comingSoon ? t.comingSoon.split(" ")[1] : "▶"}</strong>
          </div>
          <div className="frm-new-body">
            <button className="frm-new-img" onClick={() => nav.push("title", { id: t.id })}><img src={t.still} alt="" /></button>
            <div className="frm-new-head">
              <strong>{t.name}</strong>
              {t.comingSoon ? (
                <button className={`frm-remind ${s.reminders.includes(t.id) ? "on" : ""}`} onClick={() => toast(s.toggleRemind(t.id) ? "We'll remind you" : "Reminder off", { icon: "bell" })} aria-pressed={s.reminders.includes(t.id)}>
                  <motion.span key={String(s.reminders.includes(t.id))} initial={{ rotate: -30 }} animate={{ rotate: [0, -20, 20, -10, 0] }} transition={{ duration: 0.6 }}><Icon name={s.reminders.includes(t.id) ? "check" : "bell"} size={22} /></motion.span>
                  {s.reminders.includes(t.id) ? "Reminded" : "Remind me"}
                </button>
              ) : (
                <button className="frm-remind" onClick={() => nav.push("title", { id: t.id })}><Icon name="info" size={22} />Info</button>
              )}
            </div>
            <p>{t.comingSoon ? `Coming ${t.comingSoon}` : "New episodes now"} · {t.genres.join(" • ")}</p>
            <p className="frm-muted">{t.synopsis}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function ClipsTab({ nav }: { nav: Nav }) {
  const s = useFrame();
  const toast = useToast();
  const clips = playable.filter(s.visible).flatMap((t) => t.episodes.slice(0, 1).map((e) => ({ t, e })));
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);
  return (
    <div className="frm-clips" onScroll={(e) => setActive(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))}>
      {clips.map(({ t, e }, i) => (
        <section key={e.id} className="frm-clip">
          <video ref={(el) => { refs.current[i] = el; }} src={e.src} poster={e.still} muted loop playsInline autoPlay={i === 0} />
          <div className="frm-clip-shade" />
          <div className="frm-clip-side">
            <button onClick={() => s.toggleLike(t.id)} aria-pressed={s.likes.includes(t.id)} aria-label="Like">
              <motion.span animate={s.likes.includes(t.id) ? { scale: [1, 1.5, 1] } : {}}><Icon name="heart" size={28} fill={s.likes.includes(t.id)} /></motion.span>
              <small>{s.likes.includes(t.id) ? "Liked" : "Like"}</small>
            </button>
            <button onClick={() => toast(s.toggleList(t.id) ? "Added to My List" : "Removed", { icon: "check" })} aria-label="My List"><Icon name={s.list.includes(t.id) ? "check" : "plus"} size={28} /><small>My List</small></button>
            <button onClick={() => toast("Share link copied", { icon: "share" })} aria-label="Share"><Icon name="share" size={26} /><small>Share</small></button>
          </div>
          <div className="frm-clip-copy">
            <strong>{t.name}</strong>
            <p>{t.synopsis.slice(0, 90)}…</p>
            <button className="fr-btn white" onClick={() => nav.push("title", { id: t.id })}><Icon name="play" size={16} fill /> Watch</button>
          </div>
        </section>
      ))}
    </div>
  );
}

function DownloadsTab({ nav }: { nav: Nav }) {
  const s = useFrame();
  const ids = Object.keys(s.downloads);
  return (
    <div className="ph-pad-top">
      <h1 className="frm-title">Downloads</h1>
      <div className="frm-smart"><Icon name="sparkle" size={18} /><div><strong>Smart downloads</strong><small>Next episodes download on wifi; watched ones are removed.</small></div><span className="frm-on">On</span></div>
      {ids.length ? (
        <div className="frm-dl-list">
          {ids.map((id) => {
            const t = titles.find((x) => x.episodes.some((e) => e.id === id))!;
            const e = t.episodes.find((x) => x.id === id)!;
            const p = s.downloads[id];
            return (
              <motion.div layout key={id} className="frm-dl">
                <img src={e.still} alt="" />
                <div className="grow"><strong>{t.name}</strong><small>{t.episodes.length > 1 ? `E${e.n} · ${e.title}` : "Film"} · 24 MB</small></div>
                {p >= 1 ? <button className="kit-icon-btn" onClick={() => nav.push("title", { id: t.id })} aria-label="Play"><Icon name="play" fill size={16} /></button> : <DlRing p={p} />}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Empty icon="download" title="No downloads yet" text="Download episodes to watch offline." />
      )}
      <button className="fr-btn white frm-find" onClick={() => nav.tab("home")}>Find more to download</button>
    </div>
  );
}

function DlRing({ p }: { p: number }) {
  const C = 2 * Math.PI * 14;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="frm-ring" aria-label={`${Math.round(p * 100)}% downloaded`}>
      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 18 18)" strokeLinecap="round" />
      <rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function TitleScreen({ nav, play }: { nav: Nav; play: (epId: string) => void }) {
  const t = T(nav.params.id);
  const s = useFrame();
  const toast = useToast();
  function download(id: string) {
    if (s.downloads[id] != null) return;
    s.setDownloads((d) => ({ ...d, [id]: 0.02 }));
    let p = 0.02;
    const tick = setInterval(() => {
      p = Math.min(1, p + 0.12 + Math.random() * 0.1);
      s.setDownloads((d) => ({ ...d, [id]: p }));
      if (p >= 1) {
        clearInterval(tick);
        toast("Download complete", { icon: "download" });
      }
    }, 450);
  }
  const resume = s.resume.find((r) => r.t.id === t.id);
  return (
    <div className="frm-title-screen">
      <div className="frm-t-media">
        {t.episodes[0] ? <video src={t.episodes[0].src} poster={t.still} autoPlay muted loop playsInline /> : <img src={t.still} alt="" />}
        <button className="kit-icon-btn frm-back" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
      </div>
      <div className="frm-t-body">
        <h1>{t.name}</h1>
        <div className="fr-pop-meta"><b>{t.match}% match</b> {t.year} <span className="fr-rating">{t.rating}</span> {t.runtime}</div>
        {t.episodes.length ? (
          <>
            <button className="fr-btn white block" onClick={() => play(resume?.e.id || t.episodes[0].id)}><Icon name="play" size={18} fill /> {resume ? `Resume E${resume.e.n}` : "Play"}</button>
            <button className="fr-btn grey block" onClick={() => download(t.episodes[0].id)}>
              {s.downloads[t.episodes[0].id] == null ? <><Icon name="download" size={18} /> Download {t.episodes.length > 1 ? "S1:E1" : ""}</> : s.downloads[t.episodes[0].id] >= 1 ? <><Icon name="check" size={18} /> Downloaded</> : <><DlRing p={s.downloads[t.episodes[0].id]} /> Downloading…</>}
            </button>
          </>
        ) : (
          <button className={`fr-btn block ${s.reminders.includes(t.id) ? "grey" : "white"}`} onClick={() => s.toggleRemind(t.id)}><Icon name="bell" size={18} /> {s.reminders.includes(t.id) ? "Reminder set" : `Remind me · ${t.comingSoon}`}</button>
        )}
        <p>{t.synopsis}</p>
        <p className="frm-muted">Starring: {t.cast.join(", ")}</p>
        <div className="frm-t-actions">
          <button onClick={() => toast(s.toggleList(t.id) ? "Added to My List" : "Removed", { icon: "check" })}><Icon name={s.list.includes(t.id) ? "check" : "plus"} size={24} />My List</button>
          <button onClick={() => s.toggleLike(t.id)} aria-pressed={s.likes.includes(t.id)}><Icon name="heart" size={24} fill={s.likes.includes(t.id)} />Rate</button>
          <button onClick={() => toast("Link copied", { icon: "share" })}><Icon name="share" size={24} />Share</button>
        </div>
        {t.episodes.length > 1 && (
          <>
            <h2 className="frm-h2">Episodes</h2>
            {t.episodes.map((e) => {
              const h = s.history[e.id];
              const d = s.downloads[e.id];
              return (
                <div className="frm-ep" key={e.id}>
                  <button className="frm-ep-main" onClick={() => play(e.id)}>
                    <span className="frm-ep-img"><img src={e.still} alt="" /><i><Icon name="play" size={18} fill /></i>{h && <ProgressLine value={h.done ? 1 : h.at / e.dur} />}</span>
                    <span><b>{e.n}. {e.title}</b><small>{e.dur}s</small></span>
                  </button>
                  <button className="frm-ep-dl" onClick={() => download(e.id)} aria-label={`Download episode ${e.n}`}>
                    {d == null ? <Icon name="download" size={22} /> : d >= 1 ? <Icon name="check" size={22} /> : <DlRing p={d} />}
                  </button>
                  <p>{e.desc}</p>
                </div>
              );
            })}
          </>
        )}
        <h2 className="frm-h2">More like this</h2>
        <div className="frm-more">
          {titles.filter((x) => x.id !== t.id && s.visible(x)).slice(0, 6).map((x) => (
            <button key={x.id} onClick={() => nav.push("title", { id: x.id })}><Poster t={x} /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchScreen({ nav }: { nav: Nav }) {
  const s = useFrame();
  const [q, setQ] = useState("");
  const list = titles.filter(s.visible).filter((t) => !q || (t.name + t.genres.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="ph-pad-top">
      <div className="frm-search">
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <div><Icon name="search" size={18} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shows, films, genres" aria-label="Search" /></div>
      </div>
      <h2 className="frm-h2 pad">{q ? `Results` : "Recommended"}</h2>
      <div className="frm-search-list">
        {list.map((t) => (
          <button key={t.id} onClick={() => nav.push("title", { id: t.id })}>
            <img src={t.still} alt="" />
            <span>{t.name}</span>
            <Icon name="play" size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}

function MyTab({ nav }: { nav: Nav }) {
  const s = useFrame();
  const [notif, setNotif] = useState(false);
  return (
    <div className="ph-pad-top">
      <div className="frm-my">
        <span className="frm-my-av" style={{ background: s.me!.color }} />
        <strong>{s.me!.name}</strong>
        <button className="fr-btn grey" onClick={() => s.setProfile(null)}>Switch profiles</button>
      </div>
      <div className="ph-list frm-list">
        <button className="ph-row" onClick={() => setNotif(true)}><Icon name="bell" /><span className="grow">Notifications<small>{s.reminders.length} reminders</small></span><Icon name="next" size={18} /></button>
        <button className="ph-row" onClick={() => nav.tab("downloads")}><Icon name="download" /><span className="grow">Downloads<small>{Object.keys(s.downloads).length} items</small></span><Icon name="next" size={18} /></button>
        <button className="ph-row" onClick={() => s.setCaptions(!s.captions)}><Icon name="cc" /><span className="grow">Captions<small>{s.captions ? "On" : "Off"}</small></span></button>
      </div>
      <h2 className="frm-h2 pad">My List</h2>
      <div className="frm-more pad">
        {s.list.map(T).filter(s.visible).map((t) => <button key={t.id} onClick={() => nav.push("title", { id: t.id })}><Poster t={t} /></button>)}
      </div>
      {!s.list.length && <Empty icon="plus" title="Nothing in My List" />}
      <Sheet open={notif} onClose={() => setNotif(false)} title="Notifications">
        {s.reminders.length ? s.reminders.map((id) => <div key={id} className="ph-row"><Icon name="bell" /><span className="grow">{T(id).name}<small>Arrives {T(id).comingSoon}</small></span></div>) : <p className="frm-muted">Tap “Remind me” on upcoming titles in New & Hot.</p>}
      </Sheet>
    </div>
  );
}

export default function FrameMobile() {
  const s = useFrame();
  const nav = useNav({ name: "home" });
  const [playing, setPlaying] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  if (!s.me)
    return (
      <div className="frame ph-app frm" style={{ "--status-ink": "#fff" } as React.CSSProperties}>
        <ProfileGate onPick={s.setProfile} compact />
      </div>
    );
  const tabs = [["home", "home", "Home"], ["new", "film", "New & Hot"], ["clips", "play", "Clips"], ["downloads", "download", "Downloads"], ["my", "user", "My FRAME"]];
  return (
    <div className="frame ph-app frm" style={{ "--status-ink": "#fff" } as React.CSSProperties}>
      <div className={`ph-scroll ${nav.screen === "clips" ? "no-scroll" : ""}`} ref={scroller}>
        <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir} className={nav.screen === "clips" ? "full" : ""}>
          {nav.screen === "home" && <HomeTab nav={nav} play={setPlaying} />}
          {nav.screen === "new" && <NewTab nav={nav} />}
          {nav.screen === "clips" && <ClipsTab nav={nav} />}
          {nav.screen === "downloads" && <DownloadsTab nav={nav} />}
          {nav.screen === "my" && <MyTab nav={nav} />}
          {nav.screen === "title" && <TitleScreen nav={nav} play={setPlaying} />}
          {nav.screen === "search" && <SearchScreen nav={nav} />}
        </Screen>
      </div>
      <nav className="ph-tabs" aria-label="FRAME">
        {tabs.map(([k, i, l]) => (
          <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)}>
            <Icon name={i} size={22} fill={nav.root === k && (i === "home" || i === "play")} />
            {l}
            {k === "downloads" && Object.values(s.downloads).some((p) => p < 1) && <span className="ph-badge">↓</span>}
          </button>
        ))}
      </nav>
      <AnimatePresence>{playing && <Player key="p" epId={playing} onClose={() => setPlaying(null)} rotated />}</AnimatePresence>
    </div>
  );
}
