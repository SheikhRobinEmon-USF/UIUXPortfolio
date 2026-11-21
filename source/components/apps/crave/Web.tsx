"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Drawer, Modal, Qty, Segmented, useToast, ease, spring, Empty, Reveal } from "../../kit/ui";
import { addresses, cuisines, dishById, PROMO, rest, restaurants, stages, usd, useCrave, type Dish, type Order, type Restaurant } from "./data";
import { Cover, Customizer, DishImg, StageList, Stars, TrackMap, etaFor } from "./shared";

type Page = { name: "home" } | { name: "restaurant"; id: string } | { name: "checkout" } | { name: "track"; id: string } | { name: "orders" };

function Header({ go, openCart, mode, setMode, openAddr }: { go: (p: Page) => void; openCart: () => void; mode: string; setMode: (m: "delivery" | "pickup") => void; openAddr: () => void }) {
  const s = useCrave();
  const a = addresses.find((x) => x.id === s.addr)!;
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const hits = q ? restaurants.filter((r) => (r.name + r.cuisine + r.tags.join(" ") + r.menu.flatMap((m) => m.dishes.map((d) => d.name)).join(" ")).toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <header className="cr-header">
      <button className="cr-logo" onClick={() => go({ name: "home" })} aria-label="CRAVE home">
        crave<i />
      </button>
      <Segmented label="Order type" className="cr-mode" value={mode as "delivery" | "pickup"} onChange={setMode} options={[{ value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }]} />
      <button className="cr-addr" onClick={openAddr}>
        <Icon name="pin" size={18} />
        <span>
          <small>{mode === "delivery" ? "Deliver to" : "Pick up near"}</small>
          {a.label} · {a.line}
        </span>
        <Icon name="down" size={16} />
      </button>
      <div className="cr-search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder="Search restaurants or dishes" aria-label="Search restaurants or dishes" />
        <AnimatePresence>
          {focus && q && (
            <motion.div className="cr-search-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {hits.length ? (
                hits.map((r) => (
                  <button key={r.id} onMouseDown={() => { go({ name: "restaurant", id: r.id }); setQ(""); }}>
                    <Cover r={r} className="mini" />
                    <span>
                      <strong>{r.name}</strong>
                      {r.cuisine} · {r.eta[0]}–{r.eta[1]} min
                    </span>
                  </button>
                ))
              ) : (
                <p>No matches for “{q}”.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button className="cr-head-link" onClick={() => go({ name: "orders" })}>
        <Icon name="receipt" size={18} /> Orders
      </button>
      <motion.button className="cr-cart-btn" onClick={openCart} whileTap={{ scale: 0.95 }} aria-label={`Cart, ${s.count} items`}>
        <Icon name="bag" size={18} />
        <AnimatePresence mode="popLayout">
          <motion.span key={s.count} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}>
            {s.count}
          </motion.span>
        </AnimatePresence>
        {s.count > 0 && <b>{usd(s.subtotal)}</b>}
      </motion.button>
    </header>
  );
}

function RCard({ r, go, i = 0 }: { r: Restaurant; go: (p: Page) => void; i?: number }) {
  const s = useCrave();
  const fav = s.favs.includes(r.id);
  return (
    <motion.article layout className="cr-rcard" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease, delay: i * 0.04 }}>
      <button className="cr-rcard-img" onClick={() => go({ name: "restaurant", id: r.id })} aria-label={`Open ${r.name}`}>
        <Cover r={r} />
        {r.offer && <span className="cr-offer">{r.offer}</span>}
        <span className="cr-eta-pill">{r.eta[0]}–{r.eta[1]} min</span>
      </button>
      <button className={`cr-fav ${fav ? "on" : ""}`} aria-pressed={fav} aria-label={`Favourite ${r.name}`} onClick={() => s.toggleFav(r.id)}>
        <motion.span key={String(fav)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={spring}>
          <Icon name="heart" size={18} fill={fav} />
        </motion.span>
      </button>
      <div className="cr-rcard-info">
        <h3>{r.name}</h3>
        <span className="cr-rating"><Icon name="star" size={13} fill /> {r.rating}</span>
      </div>
      <p>
        {r.cuisine} · {r.price} · {r.distance} · {r.fee ? `${usd(r.fee)} delivery` : <b className="cr-free">Free delivery</b>}
      </p>
    </motion.article>
  );
}

function Home({ go }: { go: (p: Page) => void }) {
  const s = useCrave();
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [flags, setFlags] = useState<string[]>([]);
  const list = useMemo(() => {
    let l = restaurants.filter((r) => cuisine === "All" || r.cuisine === cuisine);
    if (flags.includes("Free delivery")) l = l.filter((r) => r.fee === 0);
    if (flags.includes("Under 25 min")) l = l.filter((r) => r.eta[0] < 20);
    if (flags.includes("4.8+")) l = l.filter((r) => r.rating >= 4.8);
    if (flags.includes("Offers")) l = l.filter((r) => r.offer);
    if (sort === "Fastest") l = [...l].sort((a, b) => a.eta[0] - b.eta[0]);
    if (sort === "Top rated") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [cuisine, sort, flags]);
  const last = s.orders.find((o) => o.stage === 4);
  const promos = [
    { t: "20% off your first Fuoco order", s: "Wood-fired, 25 min away", bg: "#d6361f", fg: "#fff", id: "fuoco", img: rest("fuoco").cover },
    { t: "Free delivery all week", s: "Good Buns & Taquería Luz", bg: "#ffd66b", fg: "#1e1410", id: "buns", img: rest("buns").cover },
    { t: "$5 off with CRAVE5", s: "On orders over $15", bg: "#2f7d4f", fg: "#fff", id: "kumo", img: rest("kumo").cover },
  ];
  return (
    <div className="cr-home">
      {s.active && (
        <motion.button className="cr-live" onClick={() => go({ name: "track", id: s.active!.id })} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <span className="cr-live-dot" />
          <strong>{stages[s.active.stage].name}</strong> · {rest(s.active.rid).name} · arriving in ~{etaFor(s.active.stage)} min
          <span className="grow" />
          Track order <Icon name="next" size={16} />
        </motion.button>
      )}
      <section className="cr-promos">
        {promos.map((p, i) => (
          <motion.button key={p.t} className="cr-promo" style={{ background: p.bg, color: p.fg }} onClick={() => go({ name: "restaurant", id: p.id })} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.7, ease }} whileHover={{ y: -4 }}>
            <div>
              <strong>{p.t}</strong>
              <span>{p.s}</span>
              <em>Order now →</em>
            </div>
            <img src={p.img} alt="" />
          </motion.button>
        ))}
      </section>

      <section className="cr-cuisines" aria-label="Cuisines">
        {cuisines.map((c) => (
          <button key={c.name} aria-pressed={cuisine === c.name} onClick={() => setCuisine(c.name)}>
            <motion.span whileHover={{ rotate: -8, scale: 1.08 }}>
              <Icon name={c.icon} size={26} stroke={1.6} />
            </motion.span>
            {c.name}
          </button>
        ))}
      </section>

      {last && cuisine === "All" && (
        <section className="cr-again">
          <h2>Order again</h2>
          <div className="cr-again-card">
            <Cover r={rest(last.rid)} />
            <div className="grow">
              <strong>{rest(last.rid).name}</strong>
              <span>{last.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</span>
            </div>
            <button className="cr-btn" onClick={() => { s.reorder(last); go({ name: "checkout" }); }}>
              Reorder · {usd(last.lines.reduce((a, l) => a + l.unit * l.qty, 0))}
            </button>
          </div>
        </section>
      )}

      <section className="cr-all">
        <div className="cr-all-head">
          <h2>{cuisine === "All" ? "All restaurants" : cuisine} <small>{list.length}</small></h2>
          <div className="cr-filters">
            {["Free delivery", "Under 25 min", "4.8+", "Offers"].map((f) => (
              <button key={f} aria-pressed={flags.includes(f)} onClick={() => setFlags(flags.includes(f) ? flags.filter((x) => x !== f) : [...flags, f])}>
                {flags.includes(f) && <Icon name="check" size={14} stroke={2.4} />} {f}
              </button>
            ))}
            <label className="cr-sort">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Recommended</option>
                <option>Fastest</option>
                <option>Top rated</option>
              </select>
            </label>
          </div>
        </div>
        <motion.div layout className="cr-grid">
          <AnimatePresence mode="popLayout">
            {list.map((r, i) => (
              <RCard key={r.id} r={r} go={go} i={i} />
            ))}
          </AnimatePresence>
        </motion.div>
        {!list.length && <Empty icon="search" title="No restaurants match" text="Try removing a filter." action={<button className="cr-btn" onClick={() => { setFlags([]); setCuisine("All"); }}>Clear filters</button>} />}
      </section>
    </div>
  );
}

function RestaurantPage({ id, go, openDish, openCart }: { id: string; go: (p: Page) => void; openDish: (d: Dish) => void; openCart: () => void }) {
  const r = rest(id);
  const s = useCrave();
  const [active, setActive] = useState(r.menu[0].section);
  const secRefs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive((vis.target as HTMLElement).dataset.section!);
      },
      { rootMargin: "-160px 0px -55% 0px" },
    );
    Object.values(secRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [r]);
  const popular = r.menu.flatMap((m) => m.dishes).filter((d) => d.popular);
  const fav = s.favs.includes(r.id);
  const inCart = s.cartRid === r.id;
  return (
    <div className="cr-rest">
      <div className="cr-rest-hero">
        <Cover r={r} className="hero" />
        <div className="cr-rest-hero-copy">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}>
            {r.name}
          </motion.h1>
          <p>{r.tags.join(" · ")}</p>
        </div>
        <button className="cr-back" onClick={() => go({ name: "home" })} aria-label="Back to restaurants">
          <Icon name="back" />
        </button>
      </div>
      <div className="cr-rest-stats">
        <div><strong><Icon name="star" size={15} fill /> {r.rating}</strong><span>{r.ratings} ratings</span></div>
        <div><strong>{r.eta[0]}–{r.eta[1]} min</strong><span>Delivery time</span></div>
        <div><strong>{r.fee ? usd(r.fee) : "Free"}</strong><span>Delivery fee</span></div>
        <div><strong>{r.distance}</strong><span>Distance</span></div>
        <button className={`cr-fav-btn ${fav ? "on" : ""}`} onClick={() => s.toggleFav(r.id)} aria-pressed={fav}>
          <Icon name="heart" size={17} fill={fav} /> {fav ? "Saved" : "Save"}
        </button>
      </div>
      {r.offer && <div className="cr-rest-offer"><Icon name="tag" size={16} /> {r.offer}</div>}
      <div className="cr-rest-body">
        <nav className="cr-menu-nav" aria-label="Menu sections">
          {r.menu.map((m) => (
            <button key={m.section} aria-current={active === m.section ? "true" : undefined} onClick={() => secRefs.current[m.section]?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {m.section}
              {active === m.section && <motion.span layoutId="cr-menu-pill" className="cr-menu-pill" transition={spring} />}
            </button>
          ))}
        </nav>
        <div className="cr-menu">
          {popular.length > 0 && (
            <section className="cr-popular">
              <h2>Popular</h2>
              <div className="cr-pop-row">
                {popular.map((d) => (
                  <motion.button key={d.id} className="cr-pop" onClick={() => openDish(d)} whileHover={{ y: -4 }}>
                    <DishImg d={d} />
                    <strong>{d.name}</strong>
                    <span>{usd(d.price)}</span>
                    <span className="cr-plus"><Icon name="plus" size={18} /></span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}
          {r.menu.map((m) => (
            <section key={m.section} data-section={m.section} ref={(el) => { secRefs.current[m.section] = el; }} className="cr-menu-sec">
              <h2>{m.section}</h2>
              <div className="cr-dishes">
                {m.dishes.map((d) => (
                  <Reveal key={d.id}>
                    <button className="cr-dish" onClick={() => openDish(d)}>
                      <div className="grow">
                        <strong>{d.name}</strong>
                        {d.tags && <span className="cr-tags">{d.tags.map((t) => <em key={t}>{t}</em>)}</span>}
                        <p>{d.desc}</p>
                        <b>{usd(d.price)}{d.groups ? "+" : ""}</b>
                      </div>
                      <div className="cr-dish-media">
                        <DishImg d={d} />
                        <span className="cr-plus"><Icon name="plus" size={18} /></span>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="cr-side-cart">
          <h3>Your order</h3>
          {inCart ? (
            <>
              {s.cart.map((l) => (
                <div key={l.key} className="cr-side-line">
                  <span className="cr-side-qty">{l.qty}×</span>
                  <span className="grow">{l.name}{l.choices.length > 0 && <small>{l.choices.join(", ")}</small>}</span>
                  <span>{usd(l.unit * l.qty)}</span>
                </div>
              ))}
              <div className="cr-side-total"><span>Subtotal</span><strong>{usd(s.subtotal)}</strong></div>
              <button className="cr-btn block" onClick={openCart}>Review cart</button>
            </>
          ) : (
            <p className="cr-muted">{s.cart.length ? `Your cart has items from ${rest(s.cartRid!).name}. Adding here will start a new cart.` : "Add dishes to start an order."}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function CartBody({ go, close }: { go: (p: Page) => void; close: () => void }) {
  const s = useCrave();
  const toast = useToast();
  if (!s.cart.length) return <Empty icon="bag" title="Your cart is empty" text="Hungry? Pick a restaurant to start." action={<button className="cr-btn" onClick={() => { close(); go({ name: "home" }); }}>Browse restaurants</button>} />;
  const r = rest(s.cartRid!);
  const upsell = r.menu.flatMap((m) => m.dishes).filter((d) => !d.groups && !s.cart.some((l) => l.dishId === d.id)).slice(0, 3);
  return (
    <div className="cr-cartbody">
      <div className="cr-cart-rest">
        <Cover r={r} className="mini" />
        <div>
          <strong>{r.name}</strong>
          <span>{r.eta[0]}–{r.eta[1]} min · {r.distance}</span>
        </div>
      </div>
      <ul className="cr-lines">
        <AnimatePresence initial={false}>
          {s.cart.map((l) => (
            <motion.li key={l.key} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
              <DishImg d={l} className="sm" />
              <div className="grow">
                <strong>{l.name}</strong>
                {l.choices.length > 0 && <small>{l.choices.join(" · ")}</small>}
                {l.note && <small className="cr-noteline">“{l.note}”</small>}
                <span>{usd(l.unit * l.qty)}</span>
              </div>
              <Qty value={l.qty} onChange={(n) => { s.setQty(l.key, n); if (!n) toast(`${l.name} removed`); }} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {upsell.length > 0 && (
        <div className="cr-upsell">
          <h4>Goes well with</h4>
          <div>
            {upsell.map((d) => (
              <button key={d.id} onClick={() => { s.add(r.id, d, [], d.price, 1); toast(`${d.name} added`, { icon: "check" }); }}>
                <DishImg d={d} className="sm" />
                <span>{d.name}<b>+{usd(d.price)}</b></span>
                <Icon name="plus" size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="cr-cart-foot">
        <div className="cr-side-total"><span>Subtotal</span><strong>{usd(s.subtotal)}</strong></div>
        <button className="cr-btn block" onClick={() => { close(); go({ name: "checkout" }); }}>
          Go to checkout <Icon name="next" size={16} />
        </button>
      </div>
    </div>
  );
}

function Checkout({ go, mode, setMode }: { go: (p: Page) => void; mode: "delivery" | "pickup"; setMode: (m: "delivery" | "pickup") => void }) {
  const s = useCrave();
  const toast = useToast();
  const [when, setWhen] = useState("ASAP");
  const [tipPct, setTipPct] = useState<number | "custom">(15);
  const [custom, setCustom] = useState("3");
  const [pay, setPay] = useState("visa");
  const [code, setCode] = useState("");
  const [instr, setInstr] = useState("Leave at the door, please ring.");
  const [placing, setPlacing] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  if (!s.cart.length) return <div className="cr-page-pad"><Empty icon="bag" title="Nothing to check out" action={<button className="cr-btn" onClick={() => go({ name: "home" })}>Find food</button>} /></div>;
  const tip = mode === "pickup" ? 0 : tipPct === "custom" ? Math.max(0, Number(custom) || 0) : Math.round(s.subtotal * (tipPct / 100) * 100) / 100;
  const f = s.fees(mode, tip);
  const r = rest(s.cartRid!);
  const slots = ["ASAP", "7:00–7:30 PM", "7:30–8:00 PM", "8:00–8:30 PM"];
  return (
    <div className="cr-checkout">
      <div className="cr-co-main">
        <button className="cr-link" onClick={() => go({ name: "restaurant", id: r.id })}>← Back to {r.name}</button>
        <h1>Checkout</h1>
        <section className="cr-co-sec">
          <h2>1. How do you want it?</h2>
          <Segmented label="Order type" value={mode} onChange={setMode} options={[{ value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }]} />
          <AnimatePresence mode="wait">
            {mode === "delivery" ? (
              <motion.div key="d" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="cr-addr-cards">
                  {addresses.map((a) => (
                    <button key={a.id} aria-pressed={s.addr === a.id} onClick={() => s.setAddr(a.id)}>
                      <Icon name={a.id === "home" ? "home" : "pin"} />
                      <span><strong>{a.label}</strong>{a.line}, {a.city}</span>
                    </button>
                  ))}
                </div>
                <label className="cr-field">
                  <span>Instructions for the courier</span>
                  <input value={instr} onChange={(e) => setInstr(e.target.value)} />
                </label>
              </motion.div>
            ) : (
              <motion.p key="p" className="cr-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Pick up at {r.name}, {r.distance} away. No delivery fee or tip.
              </motion.p>
            )}
          </AnimatePresence>
        </section>
        <section className="cr-co-sec">
          <h2>2. When?</h2>
          <div className="cr-slots">
            {slots.map((t) => (
              <button key={t} aria-pressed={when === t} onClick={() => setWhen(t)}>
                {t === "ASAP" ? <><strong>ASAP</strong><small>{r.eta[0]}–{r.eta[1]} min</small></> : <><strong>Today</strong><small>{t}</small></>}
              </button>
            ))}
          </div>
        </section>
        {mode === "delivery" && (
          <section className="cr-co-sec">
            <h2>3. Tip your courier</h2>
            <p className="cr-muted">100% of the tip goes to Marco. You can change it for an hour after delivery.</p>
            <div className="cr-tips">
              {[10, 15, 20].map((p) => (
                <button key={p} aria-pressed={tipPct === p} onClick={() => setTipPct(p)}>
                  <strong>{p}%</strong>
                  <small>{usd(Math.round(s.subtotal * (p / 100) * 100) / 100)}</small>
                  {p === 15 && <em>Most common</em>}
                </button>
              ))}
              <button aria-pressed={tipPct === "custom"} onClick={() => setTipPct("custom")}>
                <strong>Custom</strong>
                {tipPct === "custom" ? <input autoFocus aria-label="Custom tip in dollars" value={custom} inputMode="decimal" onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ""))} onClick={(e) => e.stopPropagation()} /> : <small>Any amount</small>}
              </button>
            </div>
          </section>
        )}
        <section className="cr-co-sec">
          <h2>{mode === "delivery" ? "4" : "3"}. Payment</h2>
          <div className="cr-pay">
            {[["visa", "card", "Visa ending 4242", "Expires 08/29"], ["apple", "apple", "Apple Pay", "Default device"], ["cash", "wallet", "Pay at the door", mode === "pickup" ? "Pay at counter" : "Card or cash"]].map(([k, i, t, sub]) => (
              <button key={k} aria-pressed={pay === k} onClick={() => setPay(k)}>
                <Icon name={i} fill={i === "apple"} />
                <span className="grow"><strong>{t}</strong><small>{sub}</small></span>
                <span className={`cr-radio ${pay === k ? "on" : ""}`} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <aside className="cr-co-sum">
        <div className="cr-cart-rest">
          <Cover r={r} className="mini" />
          <div><strong>{r.name}</strong><span>{s.count} items · {when === "ASAP" ? `${r.eta[0]}–${r.eta[1]} min` : when}</span></div>
        </div>
        {s.cart.map((l) => (
          <div key={l.key} className="cr-side-line">
            <span className="cr-side-qty">{l.qty}×</span>
            <span className="grow">{l.name}{l.choices.length > 0 && <small>{l.choices.join(", ")}</small>}</span>
            <span>{usd(l.unit * l.qty)}</span>
          </div>
        ))}
        <form className="cr-promo-form" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (PROMO[c]) { s.setPromo(c); toast(`${c} applied`, { icon: "tag" }); } else toast("Code not valid — try CRAVE5"); }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={s.promo ? `${s.promo} applied` : "Promo code"} aria-label="Promo code" />
          <button type="submit">Apply</button>
        </form>
        <dl className="cr-fees">
          {[
            ["Subtotal", f.tax * 0 + s.subtotal, null],
            ...(mode === "delivery" ? [["Delivery fee", f.delivery, "Set by distance. Free from some restaurants."]] : []),
            ["Service fee", f.service, "8% of subtotal. Supports customer care and app operations."],
            ["Estimated tax", f.tax, null],
            ...(mode === "delivery" ? [["Courier tip", f.tip, null]] : []),
            ...(f.discount ? [["Promo", -f.discount, null]] : []),
          ].map(([k, v, why]) => (
            <div key={k as string}>
              <dt>
                {k as string}
                {why && (
                  <button type="button" className="cr-why" aria-label={`About ${k}`} onClick={() => setInfo(info === k ? null : (k as string))}>
                    <Icon name="info" size={14} />
                  </button>
                )}
              </dt>
              <dd>{(v as number) < 0 ? "−" + usd(-(v as number)) : (v as number) === 0 ? "Free" : usd(v as number)}</dd>
              <AnimatePresence>{info === k && <motion.p className="cr-why-pop" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{why as string}</motion.p>}</AnimatePresence>
            </div>
          ))}
          <div className="total">
            <dt>Total</dt>
            <dd>{usd(f.total)}</dd>
          </div>
        </dl>
        <motion.button
          className="cr-btn block big"
          disabled={placing}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setPlacing(true);
            setTimeout(() => {
              const o = s.place(mode, tip);
              go({ name: "track", id: o.id });
            }, 1100);
          }}
        >
          {placing ? <span className="cr-spin" /> : <>Place order · {usd(f.total)}</>}
        </motion.button>
        <p className="cr-fine">Simulated order — nothing is charged.</p>
      </aside>
    </div>
  );
}

function Track({ id, go }: { id: string; go: (p: Page) => void }) {
  const s = useCrave();
  const toast = useToast();
  const o = s.orders.find((x) => x.id === id);
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hi! I'm Marco, I'll be bringing your order 🚲" }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!o || o.stage >= 4 || !auto) return;
    const t = setTimeout(() => s.advance(o.id), 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o?.stage, auto]);
  if (!o) return null;
  const r = rest(o.rid);
  function send() {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { me: true, t: draft }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { me: false, t: o!.stage < 2 ? "Waiting at the restaurant — food's almost ready!" : "Got it, see you in a few minutes 👍" }]);
    }, 1600);
  }
  return (
    <div className="cr-track">
      <div className="cr-track-map">
        <TrackMap stage={o.stage} />
        <div className="cr-track-eta">
          <AnimatePresence mode="wait">
            <motion.strong key={o.stage} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              {o.stage === 4 ? "Delivered" : `${etaFor(o.stage)} min`}
            </motion.strong>
          </AnimatePresence>
          <span>{o.stage === 4 ? "Enjoy your meal!" : `Estimated arrival ${new Date(o.placed + (28 - etaFor(o.stage)) * 60000 + etaFor(o.stage) * 60000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</span>
        </div>
      </div>
      <div className="cr-track-panel">
        <span className="cr-kicker">Order {o.id} · {r.name}</span>
        <h1>{stages[o.stage].name}</h1>
        <div className="cr-progress-bar"><motion.i animate={{ width: `${(o.stage / 4) * 100}%` }} transition={{ duration: 1, ease }} /></div>
        <StageList stage={o.stage} />
        <div className="cr-track-tools">
          <button className="cr-btn ghost" onClick={() => s.advance(o.id)} disabled={o.stage >= 4}>Simulate next step</button>
          <label className="cr-auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-advance</label>
        </div>
        {o.stage >= 2 && o.stage < 4 && (
          <motion.div className="cr-courier" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <span className="cr-courier-av">M</span>
            <div className="grow"><strong>Marco</strong><span>E-bike · 4.98 ★ · 2,140 deliveries</span></div>
            <button className="kit-icon-btn" aria-label="Call courier" onClick={() => toast("Calling Marco (simulated)", { icon: "phone" })}><Icon name="phone" /></button>
            <button className="kit-icon-btn" aria-label="Message courier" onClick={() => setChat(true)}><Icon name="chat" /></button>
          </motion.div>
        )}
        {o.stage === 4 && !o.rating && (
          <motion.div className="cr-rate-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
            <h2>How was {r.name}?</h2>
            <Stars value={stars} onChange={setStars} />
            <AnimatePresence>
              {stars > 0 && (
                <motion.div className="cr-rate-tags" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  {(stars >= 4 ? ["Hot & fresh", "Great portions", "Fast delivery", "Well packed"] : ["Arrived cold", "Missing item", "Late", "Wrong order"]).map((t) => (
                    <button key={t} aria-pressed={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <button className="cr-btn block" disabled={!stars} onClick={() => { s.rate(o.id, stars); toast("Thanks for the feedback!", { icon: "heart" }); }}>Submit rating</button>
          </motion.div>
        )}
        {o.rating && <p className="cr-rated"><Icon name="check" size={16} /> You rated this order {o.rating}★. <button className="cr-link" onClick={() => go({ name: "orders" })}>See all orders</button></p>}
        <details className="cr-details">
          <summary>Order details · {usd(o.total)}</summary>
          {o.lines.map((l) => (
            <div key={l.key} className="cr-side-line"><span className="cr-side-qty">{l.qty}×</span><span className="grow">{l.name}</span><span>{usd(l.unit * l.qty)}</span></div>
          ))}
          <p className="cr-muted">{o.mode === "delivery" ? `Delivering to ${o.address}` : "Pickup"} · Tip {usd(o.tip)}</p>
        </details>
      </div>
      <Drawer open={chat} onClose={() => setChat(false)} title="Marco · Courier" width={400} className="cr-chat">
        <div className="cr-msgs">
          {msgs.map((m, i) => (
            <motion.p key={i} className={m.me ? "me" : ""} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>{m.t}</motion.p>
          ))}
          {typing && <p className="cr-typing"><i /><i /><i /></p>}
        </div>
        <div className="cr-quick">
          {["I'm downstairs", "Please call when here", "Thank you!"].map((q) => <button key={q} onClick={() => setDraft(q)}>{q}</button>)}
        </div>
        <form className="cr-compose" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message Marco" aria-label="Message" />
          <button aria-label="Send"><Icon name="send" size={18} /></button>
        </form>
      </Drawer>
    </div>
  );
}

function Orders({ go }: { go: (p: Page) => void }) {
  const s = useCrave();
  const toast = useToast();
  return (
    <div className="cr-orders">
      <h1>Your orders</h1>
      {s.orders.map((o: Order, i) => {
        const r = rest(o.rid);
        return (
          <Reveal key={o.id} delay={i * 0.05}>
            <div className="cr-order">
              <Cover r={r} className="mini" />
              <div className="grow">
                <strong>{r.name}</strong>
                <span>{new Date(o.placed).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {o.lines.reduce((a, l) => a + l.qty, 0)} items · {usd(o.total)}</span>
                <small>{o.lines.map((l) => l.name).join(", ")}</small>
              </div>
              <span className={`cr-status ${o.stage === 4 ? "done" : "live"}`}>{o.stage === 4 ? (o.rating ? `Rated ${o.rating}★` : "Delivered") : stages[o.stage].name}</span>
              {o.stage < 4 ? (
                <button className="cr-btn" onClick={() => go({ name: "track", id: o.id })}>Track</button>
              ) : (
                <button className="cr-btn ghost" onClick={() => { s.reorder(o); toast("Added to cart", { icon: "bag" }); go({ name: "checkout" }); }}>Reorder</button>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export default function CraveWeb() {
  const s = useCrave();
  const toast = useToast();
  const [page, setPage] = useState<Page>({ name: "home" });
  const [cart, setCart] = useState(false);
  const [dish, setDish] = useState<{ d: Dish; rid: string } | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [conflict, setConflict] = useState<null | (() => void)>(null);
  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const rid = page.name === "restaurant" ? page.id : "";
  return (
    <div className="crave cr-web">
      <Header go={go} openCart={() => setCart(true)} mode={mode} setMode={setMode} openAddr={() => setAddrOpen(true)} />
      <AnimatePresence mode="wait">
        <motion.main key={JSON.stringify(page)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}>
          {page.name === "home" && <Home go={go} />}
          {page.name === "restaurant" && <RestaurantPage id={page.id} go={go} openDish={(d) => setDish({ d, rid: page.id })} openCart={() => setCart(true)} />}
          {page.name === "checkout" && <Checkout go={go} mode={mode} setMode={setMode} />}
          {page.name === "track" && <Track id={page.id} go={go} />}
          {page.name === "orders" && <Orders go={go} />}
        </motion.main>
      </AnimatePresence>
      <footer className="cr-footer">
        <span className="cr-logo small">crave<i /></span>
        <span>Concept by Sheikh Robin Emon · Orders, couriers and payments are simulated.</span>
      </footer>
      <Drawer open={cart} onClose={() => setCart(false)} title="Your cart" className="cr-drawer">
        <CartBody go={go} close={() => setCart(false)} />
      </Drawer>
      <Modal open={!!dish} onClose={() => setDish(null)} label={dish ? dish.d.name : "Dish"} className="cr-dish-modal">
        {dish && (
          <div className="cr-dm">
            <DishImg d={dish.d} className="hero" />
            <div className="cr-dm-body">
              <h2>{dish.d.name}</h2>
              <p>{dish.d.desc}</p>
              <Customizer
                d={dish.d}
                onAdd={(choices, unit, qty, note) => {
                  const doAdd = () => {
                    s.add(dish.rid, dish.d, choices, unit, qty, note);
                    toast(`${qty}× ${dish.d.name} added`, { icon: "bag", action: { label: "View cart", run: () => setCart(true) } });
                    setDish(null);
                  };
                  if (s.cart.length && s.cartRid !== dish.rid) setConflict(() => doAdd);
                  else doAdd();
                }}
              />
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!conflict} onClose={() => setConflict(null)} label="Start a new cart?" className="cr-confirm">
        <div className="cr-confirm-body">
          <h2>Start a new cart?</h2>
          <p>Your cart has items from {s.cartRid ? rest(s.cartRid).name : ""}. Adding this will clear it.</p>
          <div>
            <button className="cr-btn ghost" onClick={() => setConflict(null)}>Keep current cart</button>
            <button className="cr-btn" onClick={() => { conflict?.(); setConflict(null); }}>New cart</button>
          </div>
        </div>
      </Modal>
      <Modal open={addrOpen} onClose={() => setAddrOpen(false)} label="Delivery address" className="cr-confirm">
        <div className="cr-confirm-body">
          <h2>Where should we deliver?</h2>
          <div className="cr-addr-cards">
            {addresses.map((a) => (
              <button key={a.id} aria-pressed={s.addr === a.id} onClick={() => { s.setAddr(a.id); setAddrOpen(false); toast(`Delivering to ${a.label}`, { icon: "pin" }); }}>
                <Icon name={a.id === "home" ? "home" : "pin"} />
                <span><strong>{a.label}</strong>{a.line}, {a.city}</span>
              </button>
            ))}
          </div>
          <p className="cr-muted">Restaurants, fees and times update for the selected address.</p>
        </div>
      </Modal>
      {rid && s.count > 0 && s.cartRid === rid && (
        <motion.button className="cr-float-cart" onClick={() => setCart(true)} initial={{ y: 80 }} animate={{ y: 0 }}>
          View cart · {s.count} · {usd(s.subtotal)}
        </motion.button>
      )}
    </div>
  );
}
