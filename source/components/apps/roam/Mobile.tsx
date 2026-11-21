"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Sheet, Screen, SwipeConfirm, useToast, ease, spring, Empty } from "../../kit/ui";
import { useNav, TODAY, type Nav } from "../../kit/store";
import { L, available, categories, destinations, fmtRange, listings, nights, quote, usd, useRoam, type Listing } from "./data";
import { Calendar, Guests, Heart, StayMap } from "./shared";

function Swiper({ photos, h = 300, radius = 18, onTap }: { photos: string[]; h?: number; radius?: number; onTap?: () => void }) {
  const [i, setI] = useState(0);
  return (
    <div className="rmm-swiper" style={{ height: h, borderRadius: radius }}>
      <div className="rmm-swiper-track" onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} onClick={onTap}>
        {photos.map((p, k) => <img key={k} src={p} alt="" loading={k ? "lazy" : "eager"} />)}
      </div>
      <div className="rmm-dots" aria-hidden="true">{photos.map((_, k) => <motion.i key={k} animate={{ scale: k === i ? 1.3 : 1, opacity: k === i ? 1 : 0.55 }} />)}</div>
    </div>
  );
}

function ListCard({ l, nav, onSave }: { l: Listing; nav: Nav; onSave: (id: string) => void }) {
  const s = useRoam();
  const q = quote(l, s.search.start, s.search.end);
  return (
    <motion.article className="rmm-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
      <div className="rmm-card-media">
        <Swiper photos={l.photos} h={290} onTap={() => nav.push("listing", { id: l.id })} />
        <Heart on={s.saved(l.id)} onClick={() => onSave(l.id)} label={`Save ${l.title}`} />
        {l.rating >= 4.9 && <span className="rm-badge">Guest favourite</span>}
      </div>
      <button className="rmm-card-info" onClick={() => nav.push("listing", { id: l.id })}>
        <span className="rm-card-top"><strong>{l.place}</strong><span><Icon name="star" size={12} fill /> {l.rating}</span></span>
        <span>{l.title}</span>
        <span>{fmtRange(s.search.start, s.search.end)}</span>
        <span className="rm-card-price">{q.n ? (available(l, s.search.start, s.search.end) ? <><b>{usd(q.total)}</b> total</> : <span className="rm-unavail">Unavailable for your dates</span>) : <><b>{usd(l.nightly)}</b> night</>}</span>
      </button>
    </motion.article>
  );
}

function SearchFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useRoam();
  const [step, setStep] = useState<"where" | "when" | "who">("where");
  useEffect(() => {
    if (open) setStep("where");
  }, [open]);
  const card = (k: "where" | "when" | "who", label: string, value: string, body: React.ReactNode) => (
    <motion.div layout className={`rmm-step ${step === k ? "open" : ""}`} transition={{ duration: 0.4, ease }}>
      {step !== k ? (
        <button className="rmm-step-head" onClick={() => setStep(k)}>
          <span>{label}</span>
          <strong>{value}</strong>
        </button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2>{k === "where" ? "Where to?" : k === "when" ? "When's your trip?" : "Who's coming?"}</h2>
          {body}
        </motion.div>
      )}
    </motion.div>
  );
  return (
    <Sheet open={open} onClose={onClose} full className="rmm-search">
      <div className="rmm-search-body">
        {card(
          "where",
          "Where",
          s.search.where,
          <div className="rmm-dests">
            {destinations.map((d) => (
              <button key={d.name} aria-pressed={s.search.where === d.name} onClick={() => { s.setSearch({ ...s.search, where: d.name }); setStep("when"); }}>
                <span><Icon name={d.icon} size={22} /></span>
                <strong>{d.name}</strong>
              </button>
            ))}
          </div>,
        )}
        {card("when", "When", fmtRange(s.search.start, s.search.end), <div className="rmm-cal"><Calendar stacked start={s.search.start} end={s.search.end} onChange={(a, b) => s.setSearch({ ...s.search, start: a, end: b })} /></div>)}
        {card("who", "Who", `${s.guests} guest${s.guests > 1 ? "s" : ""}`, <Guests s={s.search} set={s.setSearch} />)}
      </div>
      <div className="rmm-search-foot">
        <button className="rm-link" onClick={() => s.setSearch({ where: "Anywhere", start: null, end: null, adults: 1, children: 0, infants: 0, pets: 0 })}>Clear all</button>
        {step !== "who" ? (
          <button className="rm-btn" onClick={() => setStep(step === "where" ? "when" : "who")}>Next</button>
        ) : (
          <button className="rm-btn" onClick={onClose}><Icon name="search" size={16} /> Search</button>
        )}
      </div>
    </Sheet>
  );
}

function Explore({ nav, onSave }: { nav: Nav; onSave: (id: string) => void }) {
  const s = useRoam();
  const [cat, setCat] = useState("all");
  const [map, setMap] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const list = listings.filter((l) => (cat === "all" || l.category === cat) && (s.search.where === "Anywhere" || l.region === s.search.where) && l.guests >= s.guests);
  useEffect(() => {
    if (!map || !active || !rail.current) return;
    const i = list.findIndex((l) => l.id === active);
    rail.current.scrollTo({ left: i * (rail.current.clientWidth * 0.86 + 10), behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, map]);
  return (
    <div className="rmm-explore">
      <div className="rmm-top">
        <button className="rmm-pill" onClick={() => setSearching(true)}>
          <Icon name="search" size={20} stroke={2} />
          <span><strong>{s.search.where === "Anywhere" ? "Where to?" : s.search.where}</strong><small>{fmtRange(s.search.start, s.search.end)} · {s.guests} guests</small></span>
          <span className="rmm-pill-f"><Icon name="sliders" size={16} /></span>
        </button>
        <div className="rmm-cats">
          {categories.map((c) => (
            <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              <Icon name={c.icon} size={20} stroke={1.5} />
              {c.label}
              {cat === c.id && <motion.span layoutId="rmm-cat" className="rm-cat-line" transition={spring} />}
            </button>
          ))}
        </div>
      </div>
      {!map ? (
        <div className="rmm-list">
          <p className="rmm-count">{list.length} stays · total price incl. fees</p>
          {list.map((l) => <ListCard key={l.id} l={l} nav={nav} onSave={onSave} />)}
          {!list.length && <Empty icon="search" title="No matches" text="Try a different destination or fewer guests." />}
        </div>
      ) : (
        <div className="rmm-mapview">
          <StayMap items={list} active={active} setActive={(id) => id && setActive(id)} open={(id) => nav.push("listing", { id })} search={s.search} compact />
          <div className="rmm-map-rail" ref={rail} onScroll={(e) => { const i = Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth * 0.86 + 10)); if (list[i] && list[i].id !== active) setActive(list[i].id); }}>
            {list.map((l) => {
              const q = quote(l, s.search.start, s.search.end);
              return (
                <button key={l.id} className={`rmm-mini ${active === l.id ? "on" : ""}`} onClick={() => nav.push("listing", { id: l.id })}>
                  <img src={l.photos[0]} alt="" />
                  <span><strong>{l.title}</strong><small>{l.place.split(",")[0]} · ★ {l.rating}</small><b>{q.n ? `${usd(q.total)} total` : `${usd(l.nightly)} night`}</b></span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <motion.button className="rmm-mapbtn" onClick={() => { setMap(!map); setActive(list[0]?.id || null); }} whileTap={{ scale: 0.94 }} layout>
        {map ? <><Icon name="list" size={16} /> List</> : <><Icon name="map" size={16} /> Map</>}
      </motion.button>
      <SearchFlow open={searching} onClose={() => setSearching(false)} />
    </div>
  );
}

function ListingScreen({ nav, onSave }: { nav: Nav; onSave: (id: string) => void }) {
  const l = L(nav.params.id);
  const s = useRoam();
  const toast = useToast();
  const [dates, setDates] = useState(false);
  const q = quote(l, s.search.start, s.search.end);
  const ok = q.n > 0 && available(l, s.search.start, s.search.end) && s.guests <= l.guests;
  return (
    <div className="rmm-listing">
      <div className="rmm-l-media">
        <Swiper photos={l.photos} h={330} radius={0} />
        <div className="rmm-float">
          <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
          <div>
            <button className="kit-icon-btn" aria-label="Share" onClick={() => toast("Link copied", { icon: "share" })}><Icon name="share" /></button>
            <Heart on={s.saved(l.id)} onClick={() => onSave(l.id)} label={`Save ${l.title}`} />
          </div>
        </div>
      </div>
      <div className="rmm-l-body">
        <h1>{l.title}</h1>
        <p className="rm-muted">{l.type} in {l.place}</p>
        <p>{l.guests} guests · {l.beds} bedroom{l.beds > 1 ? "s" : ""} · {l.baths} bath</p>
        <div className="rmm-rating">
          <div><b>{l.rating}</b><span>★★★★★</span></div>
          {l.rating >= 4.9 && <div className="fav"><Icon name="sparkle" size={18} />Guest<br />favourite</div>}
          <div><b>{l.reviews}</b><span>Reviews</span></div>
        </div>
        <div className="rmm-host">
          <span className="rm-host-av">{l.host.name[0]}</span>
          <div><strong>Hosted by {l.host.name}</strong><small>{l.host.superhost ? "Superhost · " : ""}{l.host.years} years hosting</small></div>
        </div>
        <ul className="rm-highlights">
          {l.highlights.map(([i, t, d]) => (
            <li key={t}><Icon name={i} size={24} stroke={1.4} /><div><strong>{t}</strong><span>{d}</span></div></li>
          ))}
        </ul>
        <p className="rm-desc">{l.desc}</p>
        <h2>What this place offers</h2>
        <div className="rm-amen">{l.amenities.slice(0, 6).map((a) => <span key={a}><Icon name="check" size={16} /> {a}</span>)}</div>
        <h2>{q.n ? `${q.n} nights` : "Select dates"}</h2>
        <p className="rm-muted">{fmtRange(s.search.start, s.search.end)}</p>
        <Calendar months={1} start={s.search.start} end={s.search.end} blocked={l.blocked} onChange={(a, b) => s.setSearch({ ...s.search, start: a, end: b })} />
        <h2>★ {l.rating} · {l.reviews} reviews</h2>
        <div className="ph-hscroll rmm-reviews">
          {[["Hannah", "Even more peaceful than the photos. The host thought of everything."], ["Marcus", "Perfect for a reset weekend. Spotless, and the location is unreal."], ["Priya", "Beautifully designed and so calm. We'll be back."]].map(([n, t]) => (
            <article key={n}><p>“{t}”</p><span className="rm-host-av sm">{n[0]}</span> <strong>{n}</strong></article>
          ))}
        </div>
        <div style={{ height: 30 }} />
      </div>
      <div className="rmm-reserve">
        <button onClick={() => setDates(true)}>
          {q.n ? <><b>{usd(q.total)}</b> total</> : <><b>{usd(l.nightly)}</b> night</>}
          <small><u>{fmtRange(s.search.start, s.search.end)}</u></small>
        </button>
        <motion.button className="rm-btn" whileTap={{ scale: 0.95 }} onClick={() => (ok ? nav.push("book", { id: l.id }) : setDates(true))}>
          {ok ? "Reserve" : "Check dates"}
        </motion.button>
      </div>
      <Sheet open={dates} onClose={() => setDates(false)} title="Your trip">
        <Calendar months={1} start={s.search.start} end={s.search.end} blocked={l.blocked} onChange={(a, b) => s.setSearch({ ...s.search, start: a, end: b })} />
        <Guests s={s.search} set={s.setSearch} max={l.guests} />
        {!available(l, s.search.start, s.search.end) && <p className="rm-warn">Some of those nights are booked.</p>}
        <button className="rm-btn block" disabled={!ok} onClick={() => { setDates(false); nav.push("book", { id: l.id }); }}>
          {ok ? `Reserve · ${usd(q.total)}` : "Choose available dates"}
        </button>
      </Sheet>
    </div>
  );
}

function BookScreen({ nav }: { nav: Nav }) {
  const l = L(nav.params.id);
  const s = useRoam();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const q = quote(l, s.search.start, s.search.end);
  return (
    <div className="rmm-book">
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>{l.instant ? "Confirm and pay" : "Request to book"}</strong><span /></div>
      <div className="rmm-book-body">
        <div className="rm-book-listing">
          <img src={l.photos[0]} alt="" />
          <div><strong>{l.title}</strong><span>{l.type} · ★ {l.rating}</span></div>
        </div>
        <h3>Your trip</h3>
        <div className="rm-book-row"><div><strong>Dates</strong><span>{fmtRange(s.search.start, s.search.end)}</span></div></div>
        <div className="rm-book-row"><div><strong>Guests</strong><span>{s.guests}</span></div></div>
        <h3>Price details</h3>
        <dl className="rm-breakdown">
          <div><dt>{usd(l.nightly)} × {q.n} nights</dt><dd>{usd(q.base)}</dd></div>
          <div><dt>Cleaning fee</dt><dd>{usd(q.cleaning)}</dd></div>
          <div><dt>Service fee</dt><dd>{usd(q.service)}</dd></div>
          <div><dt>Taxes</dt><dd>{usd(q.tax)}</dd></div>
          <div className="total"><dt>Total</dt><dd>{usd(q.total)}</dd></div>
        </dl>
        <h3>Message {l.host.name}</h3>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Say hello and share why you're coming" aria-label="Message to host" />
        <p className="rm-muted small">Free cancellation for 48 hours. Pay with Apple Pay · Visa 4242.</p>
      </div>
      <div className="ph-cta-bar">
        {msg.trim().length < 5 ? (
          <button className="rm-btn block" disabled>Write a short message to continue</button>
        ) : (
          <SwipeConfirm label={`Swipe to ${l.instant ? "book" : "request"} · ${usd(q.total)}`} done="Confirming…" onConfirm={() => { setBusy(true); setTimeout(() => { const t = s.book(l.id, msg); nav.tab("trips"); nav.push("trip", { id: t.id }); }, 900); }} />
        )}
      </div>
      {busy && <div className="rmm-busy"><span className="rm-spin dark" /></div>}
    </div>
  );
}

function TripsTab({ nav }: { nav: Nav }) {
  const s = useRoam();
  const up = s.trips.filter((t) => t.status === "upcoming");
  const past = s.trips.filter((t) => t.status !== "upcoming");
  return (
    <div className="ph-pad-top">
      <h1 className="rmm-title">Trips</h1>
      {!up.length && <div className="rmm-empty-trip"><Icon name="compass" size={30} /><strong>No trips booked yet</strong><span>Time to start planning.</span><button className="rm-btn" onClick={() => nav.tab("explore")}>Start searching</button></div>}
      {up.map((t) => (
        <motion.button key={t.id} className="rmm-trip" onClick={() => nav.push("trip", { id: t.id })} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <img src={L(t.lid).photos[0]} alt="" />
          <span className="rmm-trip-badge">In {nights(TODAY, t.start)} days</span>
          <div><strong>{L(t.lid).place.split(",")[0]}</strong><small>{L(t.lid).title} · {fmtRange(t.start, t.end)}</small></div>
        </motion.button>
      ))}
      {past.length > 0 && <h2 className="rmm-h2">Where you've been</h2>}
      <div className="ph-list rmm-plist">
        {past.map((t) => (
          <button key={t.id} className="ph-row" onClick={() => nav.push("trip", { id: t.id })}>
            <img className="rmm-row-img" src={L(t.lid).photos[0]} alt="" />
            <span className="grow">{L(t.lid).place.split(",")[0]}<small>{t.status === "cancelled" ? "Cancelled" : fmtRange(t.start, t.end)}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TripScreen({ nav }: { nav: Nav }) {
  const s = useRoam();
  const toast = useToast();
  const t = s.trips.find((x) => x.id === nav.params.id)!;
  const l = L(t.lid);
  const [cancel, setCancel] = useState(false);
  return (
    <div>
      <div className="rmm-trip-hero">
        <img src={l.photos[0]} alt="" />
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <div><span className={`rm-trip-status ${t.status}`}>{t.status === "upcoming" ? `In ${nights(TODAY, t.start)} days` : t.status}</span><h1>{l.title}</h1></div>
      </div>
      <div className="rmm-trip-body">
        {t.status === "upcoming" && <div className="rm-confirmed"><Icon name="check" size={18} /> Confirmed · {t.id}</div>}
        <div className="rmm-cin">
          <div><small>Check-in</small><strong>{new Date(t.start + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong><span>3:00 PM</span></div>
          <div><small>Checkout</small><strong>{new Date(t.end + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong><span>11:00 AM</span></div>
        </div>
        <div className="ph-list rmm-plist">
          {[["key", "Check-in method", "Smart lock — code arrives 24h before"], ["wifi", "Wifi details", "Available on arrival day"], ["route", "Directions", l.place], ["list", "House manual", "Stove, kayaks, trash day"], ["chat", `Message ${l.host.name}`, "Usually replies within an hour"]].map(([i, a, b]) => (
            <button key={a} className="ph-row" onClick={() => toast(a, { icon: i })}><Icon name={i} /><span className="grow">{a}<small>{b}</small></span><Icon name="next" size={16} /></button>
          ))}
        </div>
        {t.status === "upcoming" && <button className="rm-btn ghost block" onClick={() => setCancel(true)}>Cancel reservation</button>}
      </div>
      <Sheet open={cancel} onClose={() => setCancel(false)} title="Cancel trip?">
        <p>You'll be refunded according to the host's policy. This can't be undone.</p>
        <button className="rm-btn danger block" onClick={() => { s.cancel(t.id); setCancel(false); toast("Trip cancelled"); }}>Cancel trip</button>
      </Sheet>
    </div>
  );
}

function WishTab({ nav }: { nav: Nav }) {
  const s = useRoam();
  return (
    <div className="ph-pad-top">
      <h1 className="rmm-title">Wishlists</h1>
      <div className="rmm-wl">
        {s.wishes.map((w) => (
          <button key={w.id} onClick={() => nav.push("wish", { id: w.id })}>
            <div className="rm-wl-mosaic">{[0, 1, 2].map((k) => (w.ids[k] ? <img key={k} src={L(w.ids[k]).photos[0]} alt="" /> : <span key={k} />))}</div>
            <strong>{w.name}</strong>
            <small>{w.ids.length} saved</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function WishScreen({ nav, onSave }: { nav: Nav; onSave: (id: string) => void }) {
  const s = useRoam();
  const w = s.wishes.find((x) => x.id === nav.params.id)!;
  return (
    <div>
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>{w.name}</strong><span /></div>
      <div className="rmm-list">{w.ids.map((id) => <ListCard key={id} l={L(id)} nav={nav} onSave={onSave} />)}</div>
      {!w.ids.length && <Empty icon="heart" title="Nothing saved yet" />}
    </div>
  );
}

function InboxTab() {
  const s = useRoam();
  const threads = s.trips.map((t) => L(t.lid));
  return (
    <div className="ph-pad-top">
      <h1 className="rmm-title">Inbox</h1>
      <div className="ph-list rmm-plist">
        {threads.map((l, i) => (
          <div key={i} className="ph-row">
            <span className="rm-host-av">{l.host.name[0]}</span>
            <span className="grow"><strong>{l.host.name}</strong><small>“So glad you're coming — door code arrives the day before.”</small></span>
            {i === 0 && <span className="rmm-unread" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoamMobile() {
  const nav = useNav({ name: "explore" });
  const s = useRoam();
  const toast = useToast();
  const scroller = useRef<HTMLDivElement>(null);
  const [saveFor, setSaveFor] = useState<string | null>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  const onSave = (id: string) => {
    if (s.saved(id)) {
      s.toggleSave(id);
      toast("Removed from wishlist", { icon: "heart" });
    } else setSaveFor(id);
  };
  const tabs = [["explore", "search", "Explore"], ["wishes", "heart", "Wishlists"], ["trips", "compass", "Trips"], ["inbox", "chat", "Inbox"]];
  const hideTabs = ["listing", "book"].includes(nav.screen);
  return (
    <div className="roam ph-app rmm" style={{ "--status-ink": ["listing", "trip"].includes(nav.screen) ? "#fff" : "#2e2820" } as React.CSSProperties}>
      <div className="ph-scroll" ref={scroller}>
        <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir}>
          {nav.screen === "explore" && <Explore nav={nav} onSave={onSave} />}
          {nav.screen === "wishes" && <WishTab nav={nav} />}
          {nav.screen === "wish" && <WishScreen nav={nav} onSave={onSave} />}
          {nav.screen === "trips" && <TripsTab nav={nav} />}
          {nav.screen === "trip" && <TripScreen nav={nav} />}
          {nav.screen === "inbox" && <InboxTab />}
          {nav.screen === "listing" && <ListingScreen nav={nav} onSave={onSave} />}
          {nav.screen === "book" && <BookScreen nav={nav} />}
        </Screen>
      </div>
      {!hideTabs && (
        <nav className="ph-tabs" aria-label="ROAM">
          {tabs.map(([k, i, l]) => (
            <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)}>
              <Icon name={i} size={23} />
              {l}
              {k === "trips" && s.trips.some((t) => t.status === "upcoming") && <span className="ph-badge">{s.trips.filter((t) => t.status === "upcoming").length}</span>}
            </button>
          ))}
        </nav>
      )}
      <Sheet open={!!saveFor} onClose={() => setSaveFor(null)} title="Save to wishlist">
        {s.wishes.map((w) => (
          <button key={w.id} className="ph-row" onClick={() => { s.toggleSave(saveFor!, w.id); toast(`Saved to ${w.name}`, { icon: "heart" }); setSaveFor(null); }}>
            <span className="rm-wl-cover">{w.ids[0] ? <img src={L(w.ids[0]).photos[0]} alt="" /> : <Icon name="heart" />}</span>
            <span className="grow">{w.name}<small>{w.ids.length} saved</small></span>
          </button>
        ))}
        <button className="ph-row" onClick={() => { const w = s.newList("Trip ideas", saveFor!); toast(`Saved to ${w.name}`, { icon: "heart" }); setSaveFor(null); }}>
          <span className="rm-wl-cover"><Icon name="plus" /></span>
          <span className="grow">Create “Trip ideas”</span>
        </button>
      </Sheet>
    </div>
  );
}
