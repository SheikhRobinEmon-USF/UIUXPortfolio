"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Modal, Toggle, useToast, ease, spring, Empty, Reveal } from "../../kit/ui";
import { TODAY, addDays } from "../../kit/store";
import { L, available, categories, destinations, fmtRange, listings, nights, quote, refundFor, usd, useRoam, type Listing } from "./data";
import { Calendar, Guests, Heart, Lightbox, PriceRange, StayMap } from "./shared";

type Page = { name: "explore" } | { name: "listing"; id: string } | { name: "book"; id: string } | { name: "trips"; id?: string } | { name: "wishlists"; id?: string };

function SearchBar({ go }: { go: (p: Page) => void }) {
  const s = useRoam();
  const [open, setOpen] = useState<null | "where" | "when" | "who">(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", f);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", f);
      document.removeEventListener("keydown", k);
    };
  }, []);
  const seg = (k: "where" | "when" | "who", label: string, value: string) => (
    <button className={`rm-seg ${open === k ? "on" : ""}`} onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k}>
      {open === k && <motion.span layoutId="rm-seg-bg" className="rm-seg-bg" transition={spring} />}
      <small>{label}</small>
      <span>{value}</span>
    </button>
  );
  const g = s.guests;
  return (
    <div className={`rm-search ${open ? "active" : ""}`} ref={ref}>
      <div className="rm-search-bar">
        {seg("where", "Where", s.search.where)}
        {seg("when", "When", fmtRange(s.search.start, s.search.end))}
        {seg("who", "Who", g ? `${g} guest${g > 1 ? "s" : ""}${s.search.infants ? `, ${s.search.infants} infant` : ""}` : "Add guests")}
        <motion.button className="rm-search-go" onClick={() => { setOpen(null); go({ name: "explore" }); }} aria-label="Search" layout>
          <Icon name="search" size={18} stroke={2.2} />
          {open && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Search</motion.span>}
        </motion.button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className={`rm-pop ${open}`} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            {open === "where" && (
              <div className="rm-dests">
                {destinations.map((d) => (
                  <button key={d.name} aria-pressed={s.search.where === d.name} onClick={() => { s.setSearch({ ...s.search, where: d.name }); setOpen("when"); }}>
                    <span><Icon name={d.icon} size={22} /></span>
                    <strong>{d.name}</strong>
                    <small>{d.sub}</small>
                  </button>
                ))}
              </div>
            )}
            {open === "when" && (
              <Calendar start={s.search.start} end={s.search.end} onChange={(a, b) => { s.setSearch({ ...s.search, start: a, end: b }); if (a && b) setTimeout(() => setOpen("who"), 250); }} />
            )}
            {open === "who" && <Guests s={s.search} set={s.setSearch} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ l, go, active, setActive, i, onSave }: { l: Listing; go: (p: Page) => void; active: boolean; setActive: (id: string | null) => void; i: number; onSave: (id: string) => void }) {
  const s = useRoam();
  const [photo, setPhoto] = useState(0);
  const q = quote(l, s.search.start, s.search.end);
  const free = available(l, s.search.start, s.search.end);
  return (
    <motion.article
      layout
      className={`rm-card ${active ? "on" : ""}`}
      onMouseEnter={() => setActive(l.id)}
      onMouseLeave={() => setActive(null)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease, delay: i * 0.05 }}
    >
      <div className="rm-card-photos">
        <button className="rm-card-open" onClick={() => go({ name: "listing", id: l.id })} aria-label={`Open ${l.title}`}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img key={photo} src={l.photos[photo]} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} />
          </AnimatePresence>
        </button>
        <Heart on={s.saved(l.id)} onClick={() => onSave(l.id)} label={`Save ${l.title}`} />
        {l.rating >= 4.9 && <span className="rm-badge">Guest favourite</span>}
        <button className="rm-ph-arrow l" onClick={() => setPhoto((photo - 1 + l.photos.length) % l.photos.length)} aria-label="Previous photo"><Icon name="back" size={16} /></button>
        <button className="rm-ph-arrow r" onClick={() => setPhoto((photo + 1) % l.photos.length)} aria-label="Next photo"><Icon name="next" size={16} /></button>
        <div className="rm-ph-dots" aria-hidden="true">{l.photos.map((_, k) => <i key={k} className={k === photo ? "on" : ""} />)}</div>
      </div>
      <div className="rm-card-info">
        <div className="rm-card-top">
          <strong>{l.place}</strong>
          <span><Icon name="star" size={13} fill /> {l.rating}</span>
        </div>
        <span>{l.title} · {l.type}</span>
        <span>{l.guests} guests · {l.beds} bed{l.beds > 1 ? "s" : ""}</span>
        <p className="rm-card-price">
          {q.n ? (
            free ? (
              <><b>{usd(q.total)}</b> total <small>for {q.n} nights</small></>
            ) : (
              <span className="rm-unavail">Unavailable for your dates</span>
            )
          ) : (
            <><b>{usd(l.nightly)}</b> night</>
          )}
        </p>
      </div>
    </motion.article>
  );
}

function SaveModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const s = useRoam();
  const toast = useToast();
  const [name, setName] = useState("");
  return (
    <Modal open={!!id} onClose={onClose} label="Save to a wishlist" className="rm-modal sm">
      {id && (
        <div className="rm-modal-body">
          <h2>Save to wishlist</h2>
          <div className="rm-wl-pick">
            {s.wishes.map((w) => (
              <button key={w.id} onClick={() => { s.toggleSave(id, w.id); toast(`Saved to ${w.name}`, { icon: "heart" }); onClose(); }}>
                <span className="rm-wl-cover">{w.ids[0] ? <img src={L(w.ids[0]).photos[0]} alt="" /> : <Icon name="heart" />}</span>
                <span><strong>{w.name}</strong><small>{w.ids.length} saved</small></span>
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; const w = s.newList(name.trim(), id); toast(`Saved to ${w.name}`, { icon: "heart" }); setName(""); onClose(); }} className="rm-wl-new">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Create a new wishlist" aria-label="New wishlist name" maxLength={40} />
            <button className="rm-btn" disabled={!name.trim()}>Create</button>
          </form>
        </div>
      )}
    </Modal>
  );
}

function Explore({ go, onSave }: { go: (p: Page) => void; onSave: (id: string) => void }) {
  const s = useRoam();
  const [cat, setCat] = useState("all");
  const [active, setActive] = useState<string | null>(null);
  const [filters, setFilters] = useState(false);
  const [price, setPrice] = useState<[number, number]>([100, 400]);
  const [types, setTypes] = useState<string[]>([]);
  const [amen, setAmen] = useState<string[]>([]);
  const [instant, setInstant] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const regionDest = s.search.where;
  const list = useMemo(
    () =>
      listings.filter(
        (l) =>
          (cat === "all" || l.category === cat) &&
          (regionDest === "Anywhere" || l.region === regionDest) &&
          l.guests >= s.guests &&
          l.nightly >= price[0] &&
          (price[1] >= 400 || l.nightly <= price[1]) &&
          (!types.length || types.includes(l.type)) &&
          amen.every((a) => l.amenities.includes(a)) &&
          (!instant || l.instant),
      ),
    [cat, regionDest, s.guests, price, types, amen, instant],
  );
  const count = (types.length ? 1 : 0) + (amen.length ? 1 : 0) + (instant ? 1 : 0) + (price[0] > 100 || price[1] < 400 ? 1 : 0);
  return (
    <div className="rm-explore">
      <div className="rm-cats">
        {categories.map((c) => (
          <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            <Icon name={c.icon} size={22} stroke={1.5} />
            {c.label}
            {cat === c.id && <motion.span layoutId="rm-cat-line" className="rm-cat-line" transition={spring} />}
          </button>
        ))}
        <button className="rm-filter-btn" onClick={() => setFilters(true)}>
          <Icon name="sliders" size={18} /> Filters {count > 0 && <b>{count}</b>}
        </button>
        <span className="rm-toggle-label">
          Map <Toggle on={showMap} onChange={setShowMap} label="Show map" />
        </span>
      </div>
      <p className="rm-note-price">
        <Icon name="info" size={15} /> Prices include all fees{s.search.start && s.search.end ? ` for ${nights(s.search.start, s.search.end)} nights` : ""} before taxes are itemised at checkout.
      </p>
      <div className={`rm-results ${showMap ? "with-map" : ""}`}>
        <div>
          <h1 className="rm-results-title">
            {list.length} stay{list.length === 1 ? "" : "s"} {regionDest === "Anywhere" ? "you'll love" : `in ${regionDest}`}
          </h1>
          <motion.div layout className="rm-grid">
            <AnimatePresence mode="popLayout">
              {list.map((l, i) => (
                <Card key={l.id} l={l} go={go} active={active === l.id} setActive={setActive} i={i} onSave={onSave} />
              ))}
            </AnimatePresence>
          </motion.div>
          {!list.length && <Empty icon="search" title="No exact matches" text="Try changing your dates, guests or filters." action={<button className="rm-btn" onClick={() => { setCat("all"); setTypes([]); setAmen([]); setInstant(false); setPrice([100, 400]); s.setSearch({ ...s.search, where: "Anywhere" }); }}>Reset search</button>} />}
        </div>
        {showMap && (
          <div className="rm-map-wrap">
            <StayMap items={list} active={active} setActive={setActive} open={(id) => go({ name: "listing", id })} search={s.search} />
          </div>
        )}
      </div>
      <Modal open={filters} onClose={() => setFilters(false)} label="Filters" className="rm-modal">
        <div className="rm-modal-body rm-filters">
          <h2>Filters</h2>
          <section>
            <h3>Price per night</h3>
            <PriceRange min={100} max={400} value={price} onChange={setPrice} />
          </section>
          <section>
            <h3>Type of place</h3>
            <div className="rm-chips">
              {["Cabin", "Loft", "Villa", "Glasshouse", "Cottage"].map((t) => (
                <button key={t} aria-pressed={types.includes(t)} onClick={() => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])}>{t}</button>
              ))}
            </div>
          </section>
          <section>
            <h3>Amenities</h3>
            <div className="rm-chips">
              {["Fast wifi", "Kitchen", "Wood stove", "Pool", "Hot tub", "Washer", "Free parking", "Dedicated workspace"].map((t) => (
                <button key={t} aria-pressed={amen.includes(t)} onClick={() => setAmen(amen.includes(t) ? amen.filter((x) => x !== t) : [...amen, t])}>{t}</button>
              ))}
            </div>
          </section>
          <section className="rm-row-toggle">
            <div><h3>Instant Book</h3><p className="rm-muted">Book without waiting for the host to respond.</p></div>
            <Toggle on={instant} onChange={setInstant} label="Instant Book" />
          </section>
          <div className="rm-modal-foot">
            <button className="rm-link" onClick={() => { setTypes([]); setAmen([]); setInstant(false); setPrice([100, 400]); }}>Clear all</button>
            <button className="rm-btn" onClick={() => setFilters(false)}>Show {list.length} stays</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ListingPage({ id, go, onSave }: { id: string; go: (p: Page) => void; onSave: (id: string) => void }) {
  const l = L(id);
  const s = useRoam();
  const toast = useToast();
  const [lb, setLb] = useState<number | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [amenAll, setAmenAll] = useState(false);
  const q = quote(l, s.search.start, s.search.end);
  const free = available(l, s.search.start, s.search.end);
  const tooMany = s.guests > l.guests;
  const canBook = q.n > 0 && free && !tooMany;
  return (
    <div className="rm-listing">
      <div className="rm-l-head">
        <button className="rm-link" onClick={() => go({ name: "explore" })}>← All stays</button>
        <h1>{l.title}</h1>
        <div className="rm-l-sub">
          <span><Icon name="star" size={14} fill /> {l.rating} · <u>{l.reviews} reviews</u> · {l.place}</span>
          <span className="rm-l-actions">
            <button onClick={() => toast("Link copied", { icon: "share" })}><Icon name="share" size={16} /> Share</button>
            <button onClick={() => onSave(l.id)}><Icon name="heart" size={16} fill={s.saved(l.id)} /> {s.saved(l.id) ? "Saved" : "Save"}</button>
          </span>
        </div>
      </div>
      <div className="rm-mosaic">
        {l.photos.slice(0, 5).map((p, i) => (
          <motion.button key={i} className={`rm-mosaic-${i}`} onClick={() => setLb(i)} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease, delay: i * 0.06 }} aria-label={`Open photo ${i + 1}`}>
            <img src={p} alt="" />
          </motion.button>
        ))}
        <button className="rm-show-all" onClick={() => setLb(0)}><Icon name="grid" size={16} /> Show all photos</button>
      </div>
      <div className="rm-l-body">
        <div className="rm-l-main">
          <div className="rm-l-host">
            <div>
              <h2>{l.type} hosted by {l.host.name}</h2>
              <p>{l.guests} guests · {l.beds} bedroom{l.beds > 1 ? "s" : ""} · {l.baths} bath</p>
            </div>
            <span className="rm-host-av">{l.host.name[0]}{l.host.superhost && <i><Icon name="star" size={10} fill /></i>}</span>
          </div>
          <ul className="rm-highlights">
            {l.highlights.map(([i, t, d]) => (
              <Reveal as="li" key={t}>
                <Icon name={i} size={26} stroke={1.4} />
                <div><strong>{t}</strong><span>{d}</span></div>
              </Reveal>
            ))}
          </ul>
          <p className="rm-desc">{l.desc}</p>
          <section className="rm-l-sec">
            <h2>What this place offers</h2>
            <div className="rm-amen">
              {l.amenities.slice(0, amenAll ? 99 : 6).map((a) => <span key={a}><Icon name="check" size={16} /> {a}</span>)}
            </div>
            {l.amenities.length > 6 && <button className="rm-btn ghost" onClick={() => setAmenAll(!amenAll)}>{amenAll ? "Show fewer" : `Show all ${l.amenities.length} amenities`}</button>}
          </section>
          <section className="rm-l-sec">
            <h2>{q.n ? `${q.n} nights in ${l.place.split(",")[0]}` : "Select check-in date"}</h2>
            <p className="rm-muted">{fmtRange(s.search.start, s.search.end)}</p>
            <Calendar start={s.search.start} end={s.search.end} blocked={l.blocked} onChange={(a, b) => s.setSearch({ ...s.search, start: a, end: b })} />
          </section>
          <section className="rm-l-sec">
            <h2><Icon name="star" size={22} fill /> {l.rating} · {l.reviews} reviews</h2>
            <div className="rm-scores">
              {Object.entries(l.scores).map(([k, v], i) => (
                <div key={k}>
                  <span>{k}</span>
                  <span className="rm-score-bar"><motion.i initial={{ width: 0 }} whileInView={{ width: `${(v / 5) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: i * 0.05 }} /></span>
                  <b>{v.toFixed(1)}</b>
                </div>
              ))}
            </div>
            <div className="rm-reviews">
              {[["Hannah", "October 2026", "Even more peaceful than the photos. The host thought of everything — we didn't want to leave."], ["Marcus", "September 2026", "Perfect for a reset weekend. Clear check-in instructions, spotless, and the location is unreal."], ["Priya", "August 2026", "Beautifully designed. Bring layers for the evenings, and plan to cook — the kitchen is great."]].map(([n, d, t]) => (
                <Reveal key={n} className="rm-review">
                  <span className="rm-host-av sm">{n[0]}</span>
                  <div><strong>{n}</strong><small>{d}</small><p>{t}</p></div>
                </Reveal>
              ))}
            </div>
          </section>
          <section className="rm-l-sec">
            <h2>Where you'll be</h2>
            <div className="rm-l-map">
              <StayMap items={[l]} active={l.id} setActive={() => {}} open={() => {}} search={s.search} compact />
            </div>
            <p className="rm-muted">{l.place} · exact location shared after booking.</p>
          </section>
        </div>
        <aside className="rm-reserve">
          <div className="rm-reserve-card">
            <div className="rm-reserve-price">
              {q.n ? <><b>{usd(q.total)}</b> <span>total</span></> : <><b>{usd(l.nightly)}</b> <span>night</span></>}
            </div>
            <div className="rm-reserve-fields">
              <button onClick={() => { setCalOpen(!calOpen); setGuestOpen(false); }}>
                <small>Check-in</small>{s.search.start ? new Date(s.search.start + "T12:00:00").toLocaleDateString("en-US") : "Add date"}
              </button>
              <button onClick={() => { setCalOpen(!calOpen); setGuestOpen(false); }}>
                <small>Checkout</small>{s.search.end ? new Date(s.search.end + "T12:00:00").toLocaleDateString("en-US") : "Add date"}
              </button>
              <button className="wide" onClick={() => { setGuestOpen(!guestOpen); setCalOpen(false); }}>
                <small>Guests</small>{s.guests} guest{s.guests > 1 ? "s" : ""}{s.search.infants ? `, ${s.search.infants} infant` : ""}
                <Icon name={guestOpen ? "up" : "down"} size={16} />
              </button>
            </div>
            <AnimatePresence>
              {calOpen && (
                <motion.div className="rm-reserve-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Calendar months={1} start={s.search.start} end={s.search.end} blocked={l.blocked} onChange={(a, b) => { s.setSearch({ ...s.search, start: a, end: b }); if (a && b) setCalOpen(false); }} />
                </motion.div>
              )}
              {guestOpen && (
                <motion.div className="rm-reserve-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Guests s={s.search} set={s.setSearch} max={l.guests} />
                </motion.div>
              )}
            </AnimatePresence>
            {!free && <p className="rm-warn"><Icon name="info" size={15} /> Those dates include nights that are booked. Pick different dates.</p>}
            {tooMany && <p className="rm-warn"><Icon name="info" size={15} /> This place fits up to {l.guests} guests.</p>}
            <motion.button className="rm-btn block big" disabled={!canBook} onClick={() => go({ name: "book", id: l.id })} whileTap={{ scale: 0.98 }}>
              {q.n ? (l.instant ? "Reserve" : "Request to book") : "Check availability"}
            </motion.button>
            {canBook && <p className="rm-muted center">You won't be charged yet</p>}
            <AnimatePresence>
              {q.n > 0 && free && (
                <motion.dl className="rm-breakdown" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div><dt>{usd(l.nightly)} × {q.n} nights</dt><dd>{usd(q.base)}</dd></div>
                  {q.weekly > 0 && <div className="good"><dt>Weekly stay discount</dt><dd>−{usd(q.weekly)}</dd></div>}
                  <div><dt>Cleaning fee</dt><dd>{usd(q.cleaning)}</dd></div>
                  <div><dt>Service fee</dt><dd>{usd(q.service)}</dd></div>
                  <div><dt>Taxes</dt><dd>{usd(q.tax)}</dd></div>
                  <div className="total"><dt>Total</dt><dd>{usd(q.total)}</dd></div>
                </motion.dl>
              )}
            </AnimatePresence>
          </div>
          {q.n > 0 && q.n < 7 && <p className="rm-tip"><Icon name="tag" size={15} /> Stay 7 nights and save 10%.</p>}
        </aside>
      </div>
      <Lightbox photos={l.photos} index={lb} onClose={() => setLb(null)} title={l.title} />
    </div>
  );
}

function Book({ id, go }: { id: string; go: (p: Page) => void }) {
  const l = L(id);
  const s = useRoam();
  const [msg, setMsg] = useState("");
  const [pay, setPay] = useState("card");
  const [split, setSplit] = useState("full");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const q = quote(l, s.search.start, s.search.end);
  if (!q.n) return <div className="rm-pad"><Empty icon="calendar" title="Choose dates first" action={<button className="rm-btn" onClick={() => go({ name: "listing", id })}>Back to listing</button>} /></div>;
  const freeCancel = addDays(s.search.start!, -14);
  return (
    <div className="rm-book">
      <div className="rm-book-main">
        <button className="rm-link" onClick={() => go({ name: "listing", id })}>← Back</button>
        <h1>{l.instant ? "Confirm and pay" : "Request to book"}</h1>
        <section>
          <h2>Your trip</h2>
          <div className="rm-book-row"><div><strong>Dates</strong><span>{fmtRange(s.search.start, s.search.end)}, 2026</span></div><button className="rm-link" onClick={() => go({ name: "listing", id })}>Edit</button></div>
          <div className="rm-book-row"><div><strong>Guests</strong><span>{s.guests} guest{s.guests > 1 ? "s" : ""}</span></div><button className="rm-link" onClick={() => go({ name: "listing", id })}>Edit</button></div>
        </section>
        <section>
          <h2>Choose how to pay</h2>
          <div className="rm-radio-cards">
            <button aria-pressed={split === "full"} onClick={() => setSplit("full")}><span className="grow"><strong>Pay {usd(q.total)} now</strong><small>Done in one payment.</small></span><span className={`rm-radio ${split === "full" ? "on" : ""}`} /></button>
            <button aria-pressed={split === "part"} onClick={() => setSplit("part")}><span className="grow"><strong>Pay part now, part later</strong><small>{usd(Math.round(q.total / 2))} now, {usd(q.total - Math.round(q.total / 2))} on {new Date(freeCancel + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}. No extra fees.</small></span><span className={`rm-radio ${split === "part" ? "on" : ""}`} /></button>
          </div>
        </section>
        <section>
          <h2>Pay with</h2>
          <div className="rm-radio-cards">
            {[["card", "card", "Visa •••• 4242"], ["apple", "apple", "Apple Pay"]].map(([k, i, t]) => (
              <button key={k} aria-pressed={pay === k} onClick={() => setPay(k)}><Icon name={i} fill={i === "apple"} /><span className="grow"><strong>{t}</strong></span><span className={`rm-radio ${pay === k ? "on" : ""}`} /></button>
            ))}
          </div>
        </section>
        <section>
          <h2>Message the host</h2>
          <p className="rm-muted">Let {l.host.name} know a little about your trip and who's coming.</p>
          <div className="rm-host-msg">
            <span className="rm-host-av sm">{l.host.name[0]}</span>
            <div><strong>{l.host.name}</strong><small>Hosting for {l.host.years} years</small></div>
          </div>
          <textarea className={err ? "err" : ""} value={msg} onChange={(e) => { setMsg(e.target.value); setErr(""); }} rows={4} placeholder={`Hi ${l.host.name}! We're coming for a quiet weekend away…`} aria-invalid={!!err} aria-label="Message to host" />
          {err && <small className="rm-err" role="alert">{err}</small>}
        </section>
        <section>
          <h2>Cancellation policy</h2>
          <p>Free cancellation before {new Date(freeCancel + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Cancel up to 7 days before check-in for a 50% refund.</p>
        </section>
        <motion.button
          className="rm-btn big"
          disabled={busy}
          onClick={() => {
            if (msg.trim().length < 10) {
              setErr("Please write a short message to the host (at least 10 characters).");
              return;
            }
            setBusy(true);
            setTimeout(() => {
              const t = s.book(l.id, msg);
              go({ name: "trips", id: t.id });
            }, 1300);
          }}
        >
          {busy ? <span className="rm-spin" /> : l.instant ? "Confirm and pay" : "Request to book"}
        </motion.button>
      </div>
      <aside className="rm-book-sum">
        <div className="rm-book-card">
          <div className="rm-book-listing">
            <img src={l.photos[0]} alt="" />
            <div><strong>{l.title}</strong><span>{l.type} · <Icon name="star" size={12} fill /> {l.rating}</span></div>
          </div>
          <dl className="rm-breakdown">
            <div><dt>{usd(l.nightly)} × {q.n} nights</dt><dd>{usd(q.base)}</dd></div>
            {q.weekly > 0 && <div className="good"><dt>Weekly discount</dt><dd>−{usd(q.weekly)}</dd></div>}
            <div><dt>Cleaning fee</dt><dd>{usd(q.cleaning)}</dd></div>
            <div><dt>Service fee</dt><dd>{usd(q.service)}</dd></div>
            <div><dt>Taxes</dt><dd>{usd(q.tax)}</dd></div>
            <div className="total"><dt>Total (USD)</dt><dd>{usd(q.total)}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Trips({ id, go }: { id?: string; go: (p: Page) => void }) {
  const s = useRoam();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const t = id ? s.trips.find((x) => x.id === id) : null;
  if (t) {
    const l = L(t.lid);
    const days = nights(TODAY, t.start);
    const refund = refundFor(t);
    return (
      <div className="rm-trip">
        <button className="rm-link" onClick={() => go({ name: "trips" })}>← All trips</button>
        <div className="rm-trip-hero">
          <motion.img src={l.photos[0]} alt="" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease }} />
          <div>
            <span className={`rm-trip-status ${t.status}`}>{t.status === "upcoming" ? (days > 0 ? `In ${days} days` : "Today") : t.status === "cancelled" ? "Cancelled" : "Completed"}</span>
            <h1>{l.title}</h1>
            <p>{l.place} · {fmtRange(t.start, t.end)} · {t.guests} guests</p>
          </div>
        </div>
        {t.status === "upcoming" && (
          <motion.div className="rm-confirmed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Icon name="check" size={20} /> {l.instant ? "Your reservation is confirmed." : `Request sent — ${l.host.name} usually replies within an hour.`} Confirmation {t.id}.
          </motion.div>
        )}
        <div className="rm-trip-grid">
          <div className="rm-trip-card">
            <h2>Itinerary</h2>
            <ol className="rm-itin">
              {[["key", `Check-in · ${new Date(t.start + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`, "After 3:00 PM · Smart lock, code sent 24h before"], ["wifi", "Wifi", "Network: " + l.title.split(" ")[0] + "_guest · password shown on arrival day"], ["route", "Getting there", `${l.place} · parking for 2 cars`], ["logout", `Checkout · ${new Date(t.end + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`, "Before 11:00 AM · Start the dishwasher, take out trash"]].map(([i, a, b], k) => (
                <motion.li key={a} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + k * 0.08 }}>
                  <span><Icon name={i} size={18} /></span>
                  <div><strong>{a}</strong><small>{b}</small></div>
                </motion.li>
              ))}
            </ol>
          </div>
          <div className="rm-trip-card">
            <h2>Messages</h2>
            <div className="rm-thread">
              {t.message && <p className="me">{t.message}</p>}
              <p>Hi! So glad you're coming. Let me know if you need anything — I'll send the door code the day before. — {l.host.name}</p>
            </div>
            <h2>Payment</h2>
            <p className="rm-muted">{usd(t.total)} · Visa •••• 4242</p>
            {t.status === "upcoming" && <button className="rm-btn ghost" onClick={() => setCancelOpen(true)}>Cancel reservation</button>}
          </div>
        </div>
        <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} label="Cancel reservation" className="rm-modal sm">
          <div className="rm-modal-body">
            <h2>Cancel your trip?</h2>
            <p>You're {days} days from check-in. Based on the policy, you'll be refunded:</p>
            <div className="rm-refund"><b>{usd(refund)}</b><span>of {usd(t.total)}</span></div>
            <div className="rm-modal-foot">
              <button className="rm-link" onClick={() => setCancelOpen(false)}>Keep reservation</button>
              <button className="rm-btn danger" onClick={() => { s.cancel(t.id); setCancelOpen(false); toast("Reservation cancelled", { icon: "info" }); }}>Cancel trip</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
  const up = s.trips.filter((x) => x.status === "upcoming");
  const rest = s.trips.filter((x) => x.status !== "upcoming");
  return (
    <div className="rm-trips">
      <h1>Trips</h1>
      {!up.length && <div className="rm-trips-empty"><h2>No trips booked… yet</h2><p className="rm-muted">Time to dust off your bags and start planning your next adventure.</p><button className="rm-btn" onClick={() => go({ name: "explore" })}>Start searching</button></div>}
      {up.length > 0 && <h2>Upcoming</h2>}
      <div className="rm-trip-list">
        {up.map((t) => (
          <button key={t.id} className="rm-trip-row" onClick={() => go({ name: "trips", id: t.id })}>
            <img src={L(t.lid).photos[0]} alt="" />
            <div><strong>{L(t.lid).title}</strong><span>{fmtRange(t.start, t.end)} · in {nights(TODAY, t.start)} days</span></div>
          </button>
        ))}
      </div>
      {rest.length > 0 && <h2>Where you've been</h2>}
      <div className="rm-trip-list">
        {rest.map((t) => (
          <button key={t.id} className="rm-trip-row past" onClick={() => go({ name: "trips", id: t.id })}>
            <img src={L(t.lid).photos[0]} alt="" />
            <div><strong>{L(t.lid).place.split(",")[0]}</strong><span>{t.status === "cancelled" ? "Cancelled" : `Hosted by ${L(t.lid).host.name}`} · {fmtRange(t.start, t.end)}</span></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Wishlists({ id, go, onSave }: { id?: string; go: (p: Page) => void; onSave: (id: string) => void }) {
  const s = useRoam();
  const w = id ? s.wishes.find((x) => x.id === id) : null;
  if (w)
    return (
      <div className="rm-trips">
        <button className="rm-link" onClick={() => go({ name: "wishlists" })}>← Wishlists</button>
        <h1>{w.name}</h1>
        <div className="rm-grid">
          <AnimatePresence mode="popLayout">
            {w.ids.map((lid, i) => <Card key={lid} l={L(lid)} go={go} active={false} setActive={() => {}} i={i} onSave={onSave} />)}
          </AnimatePresence>
        </div>
        {!w.ids.length && <Empty icon="heart" title="Nothing saved here yet" text="Tap the heart on any stay to add it." />}
      </div>
    );
  return (
    <div className="rm-trips">
      <h1>Wishlists</h1>
      <div className="rm-wl-grid">
        {s.wishes.map((x, i) => (
          <Reveal key={x.id} delay={i * 0.06}>
            <button className="rm-wl" onClick={() => go({ name: "wishlists", id: x.id })}>
              <div className="rm-wl-mosaic">
                {[0, 1, 2].map((k) => (x.ids[k] ? <img key={k} src={L(x.ids[k]).photos[0]} alt="" /> : <span key={k} />))}
              </div>
              <strong>{x.name}</strong>
              <small>{x.ids.length} saved</small>
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function RoamWeb() {
  const s = useRoam();
  const toast = useToast();
  const [page, setPage] = useState<Page>({ name: "explore" });
  const [saveFor, setSaveFor] = useState<string | null>(null);
  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const onSave = (id: string) => {
    if (s.saved(id)) {
      s.toggleSave(id);
      toast("Removed from wishlists", { icon: "heart" });
    } else setSaveFor(id);
  };
  const upcoming = s.trips.filter((t) => t.status === "upcoming").length;
  return (
    <div className="roam rm-web">
      <header className="rm-header">
        <button className="rm-logo" onClick={() => go({ name: "explore" })} aria-label="ROAM home">
          roam<i>.</i>
        </button>
        <SearchBar go={go} />
        <nav className="rm-nav" aria-label="Account">
          <button aria-current={page.name === "wishlists" ? "page" : undefined} onClick={() => go({ name: "wishlists" })}><Icon name="heart" size={18} /> Wishlists</button>
          <button aria-current={page.name === "trips" ? "page" : undefined} onClick={() => go({ name: "trips" })}><Icon name="calendar" size={18} /> Trips {upcoming > 0 && <b>{upcoming}</b>}</button>
          <span className="rm-me">C</span>
        </nav>
      </header>
      <AnimatePresence mode="wait">
        <motion.main key={JSON.stringify(page)} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }}>
          {page.name === "explore" && <Explore go={go} onSave={onSave} />}
          {page.name === "listing" && <ListingPage id={page.id} go={go} onSave={onSave} />}
          {page.name === "book" && <Book id={page.id} go={go} />}
          {page.name === "trips" && <Trips id={page.id} go={go} />}
          {page.name === "wishlists" && <Wishlists id={page.id} go={go} onSave={onSave} />}
        </motion.main>
      </AnimatePresence>
      <footer className="rm-footer">
        <span className="rm-logo small">roam<i>.</i></span>
        <span>Concept by Sheikh Robin Emon · Listings, hosts and bookings are fictional.</span>
      </footer>
      <SaveModal id={saveFor} onClose={() => setSaveFor(null)} />
    </div>
  );
}
