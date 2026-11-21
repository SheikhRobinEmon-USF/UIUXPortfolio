"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import { Icon } from "../../kit/icons";
import { Sheet, Qty, Screen, SwipeConfirm, useToast, ease, spring, Empty } from "../../kit/ui";
import { useNav, addDays, TODAY, fmt, type Nav } from "../../kit/store";
import { FREE_OVER, PROMOS, SHIP, colorOf, money, productById, products, reviewsFor, statusSteps, stories, unitPrice, useAtelier, type Product } from "./data";

function Img({ p, color, className }: { p: Product; color?: string; className?: string }) {
  const c = colorOf(p, color || p.colors[0].name);
  return <img className={className} src={c.img} style={{ filter: c.filter }} alt={`${p.name} in ${c.name}`} loading="lazy" />;
}

function Tile({ p, nav, i = 0 }: { p: Product; nav: Nav; i?: number }) {
  const s = useAtelier();
  const saved = s.wish.includes(p.id);
  return (
    <motion.div className="atm-tile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease }}>
      <button className="atm-tile-img" onClick={() => nav.push("product", { id: p.id })} aria-label={`Open ${p.name}`}>
        <Img p={p} />
        {p.badge && <span className="at-badge">{p.badge}</span>}
      </button>
      <button className={`atm-heart ${saved ? "on" : ""}`} aria-pressed={saved} aria-label={`Save ${p.name}`} onClick={() => s.toggleWish(p.id)}>
        <motion.span key={String(saved)} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={spring}>
          <Icon name="heart" fill={saved} size={17} />
        </motion.span>
      </button>
      <strong>{p.name}</strong>
      <span>{money(p.price)}</span>
    </motion.div>
  );
}

function HomeTab({ nav }: { nav: Nav }) {
  const [story, setStory] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const el = rail.current;
      if (!el) return;
      const next = (story + 1) % stories.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(t);
  }, [story]);
  return (
    <div className="ph-pad-top">
      <div className="atm-top">
        <span className="atm-logo">ATELIER</span>
        <button className="kit-icon-btn" aria-label="Notifications"><Icon name="bell" /></button>
      </div>
      <div className="atm-stories" ref={rail} onScroll={(e) => setStory(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {stories.map((st, i) => (
          <button key={st.id} className="atm-story" onClick={() => nav.push("product", { id: ["arc", "arch", "forma"][i] })}>
            <img src={st.img} alt="" />
            <div>
              <small>{st.kicker}</small>
              <strong>{st.title}</strong>
              <span>Shop the story →</span>
            </div>
          </button>
        ))}
      </div>
      <div className="atm-dots" aria-hidden="true">
        {stories.map((_, i) => (
          <motion.i key={i} animate={{ width: i === story ? 22 : 6, opacity: i === story ? 1 : 0.35 }} />
        ))}
      </div>
      <div className="ph-section-title"><h2>Shop by room</h2></div>
      <div className="ph-hscroll">
        {(["Living", "Lighting", "Objects", "Carry"] as const).map((c) => {
          const p = products.find((x) => x.cat === c)!;
          return (
            <button key={c} className="atm-room" onClick={() => nav.push("category", { cat: c })}>
              <Img p={p} />
              <span>{c}</span>
            </button>
          );
        })}
      </div>
      <div className="ph-section-title"><h2>New this season</h2><button onClick={() => nav.push("category", {})}>See all</button></div>
      <div className="atm-grid">
        {products.slice(0, 6).map((p, i) => <Tile key={p.id} p={p} nav={nav} i={i} />)}
      </div>
      <div className="atm-promo">
        <small>First order</small>
        <strong>10% off with ATELIER10</strong>
        <span>Apply it in your bag.</span>
      </div>
    </div>
  );
}

function Category({ nav }: { nav: Nav }) {
  const cat = nav.params.cat as string | undefined;
  const [sort, setSort] = useState("Featured");
  const [sheet, setSheet] = useState(false);
  let list = products.filter((p) => !cat || p.cat === cat);
  if (sort === "Price ↑") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "Price ↓") list = [...list].sort((a, b) => b.price - a.price);
  return (
    <>
      <div className="ph-navbar">
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <strong>{cat || "All pieces"}</strong>
        <button className="kit-icon-btn" onClick={() => setSheet(true)} aria-label="Sort"><Icon name="sliders" /></button>
      </div>
      <p className="atm-count">{list.length} pieces · {sort}</p>
      <div className="atm-grid">
        {list.map((p, i) => <Tile key={p.id} p={p} nav={nav} i={i} />)}
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Sort by">
        {["Featured", "Price ↑", "Price ↓"].map((o) => (
          <button key={o} className="ph-row" onClick={() => { setSort(o); setSheet(false); }}>
            <span className="grow">{o}</span>
            {sort === o && <Icon name="check" />}
          </button>
        ))}
      </Sheet>
    </>
  );
}

function SearchTab({ nav }: { nav: Nav }) {
  const s = useAtelier();
  const [q, setQ] = useState("");
  const res = q ? products.filter((p) => (p.name + p.material + p.cat).toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div className="ph-pad-top">
      <h1 className="atm-title">Search</h1>
      <form className="atm-search" onSubmit={(e) => { e.preventDefault(); s.remember(q); }}>
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Walnut, lamp, bouclé…" aria-label="Search" />
        {q && <button type="button" onClick={() => setQ("")} aria-label="Clear"><Icon name="close" size={16} /></button>}
      </form>
      {!q ? (
        <>
          <div className="ph-section-title"><h2>Recent</h2><button onClick={() => s.setRecent([])}>Clear</button></div>
          <div className="ph-chips">
            {s.recent.map((r) => <button className="ph-chip" key={r} onClick={() => setQ(r)}><Icon name="clock" size={14} />{r}</button>)}
          </div>
          <div className="ph-section-title"><h2>Browse</h2></div>
          <div className="ph-list atm-list">
            {(["Living", "Lighting", "Objects", "Carry"] as const).map((c) => (
              <button key={c} className="ph-row" onClick={() => nav.push("category", { cat: c })}>
                <Img p={products.find((p) => p.cat === c)!} className="atm-row-img" />
                <span className="grow">{c}<small>{products.filter((p) => p.cat === c).length} pieces</small></span>
                <Icon name="next" size={18} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="atm-count">{res.length} results</p>
          <div className="atm-grid">{res.map((p, i) => <Tile key={p.id} p={p} nav={nav} i={i} />)}</div>
          {!res.length && <Empty icon="search" title="No matches" text="Try “lamp” or “walnut”." />}
        </>
      )}
    </div>
  );
}

function ProductScreen({ nav }: { nav: Nav }) {
  const p = productById(nav.params.id);
  const s = useAtelier();
  const toast = useToast();
  const [color, setColor] = useState(p.colors[0].name);
  const [size, setSize] = useState(p.sizes?.[0].name);
  const [shot, setShot] = useState(0);
  const [opts, setOpts] = useState(false);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState<string | null>("Details");
  const c = colorOf(p, color);
  const saved = s.wish.includes(p.id);
  const views = ["50% 50%", "30% 35%", "70% 75%"];
  const price = unitPrice(p, size);
  const add = () => {
    s.add(p.id, color, size);
    setAdded(true);
    toast("Added to bag", { icon: "bag", action: { label: "View", run: () => nav.tab("bag") } });
    setTimeout(() => setAdded(false), 1600);
  };
  return (
    <div className="atm-pdp">
      <div className="atm-gallery">
        <div className="atm-gallery-track" onScroll={(e) => setShot(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {views.map((v, i) => (
            <div className="atm-shot" key={i}>
              <img src={c.img} alt={`${p.name}, view ${i + 1}`} style={{ filter: c.filter, objectPosition: v, transform: i ? `scale(${1.4 + i * 0.3})` : undefined }} />
            </div>
          ))}
        </div>
        <div className="atm-float">
          <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
          <div>
            <button className="kit-icon-btn" aria-label="Share" onClick={() => toast("Link copied", { icon: "share" })}><Icon name="share" /></button>
            <button className={`kit-icon-btn ${saved ? "atm-saved" : ""}`} aria-pressed={saved} aria-label="Save" onClick={() => toast(s.toggleWish(p.id) ? "Saved" : "Removed", { icon: "heart" })}>
              <motion.span key={String(saved)} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={spring}><Icon name="heart" fill={saved} /></motion.span>
            </button>
          </div>
        </div>
        <div className="atm-dots light" aria-hidden="true">
          {views.map((_, i) => <motion.i key={i} animate={{ width: i === shot ? 18 : 6, opacity: i === shot ? 1 : 0.5 }} />)}
        </div>
      </div>
      <div className="atm-info">
        <small>{p.maker}</small>
        <h1>{p.name}</h1>
        <div className="atm-rating"><Icon name="star" size={14} fill /> {p.rating} · {p.reviews} reviews</div>
        <p>{p.blurb}</p>
        <button className="atm-option" onClick={() => setOpts(true)}>
          <span className="atm-option-swatch" style={{ background: c.swatch }} />
          <span className="grow">
            <small>Options</small>
            {color}{size ? ` · ${size}` : ""}
          </span>
          <Icon name="down" size={18} />
        </button>
        {p.stock && <p className="at-stock"><span /> Only {p.stock} left</p>}
        <div className="atm-delivery"><Icon name="truck" size={18} /> Arrives {fmt.date(addDays(TODAY, 4), { weekday: "short", month: "short", day: "numeric" })} · {price >= FREE_OVER ? "Free delivery" : `${money(SHIP.standard.cost)} delivery`}</div>
        {[["Details", p.details.join(" · ")], ["Dimensions", p.dims], ["Returns", "30 days, collected from your door."]].map(([t, d]) => (
          <div className="atm-acc" key={t}>
            <button aria-expanded={open === t} onClick={() => setOpen(open === t ? null : t)}>{t}<motion.span animate={{ rotate: open === t ? 180 : 0 }}><Icon name="down" size={18} /></motion.span></button>
            <AnimatePresence initial={false}>
              {open === t && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{d}</motion.p>}
            </AnimatePresence>
          </div>
        ))}
        <h2 className="atm-h2">Reviews</h2>
        <div className="ph-hscroll atm-reviews">
          {reviewsFor(p).map((r) => (
            <article key={r.name}>
              <div>{"★".repeat(r.rating)}<span>{"★".repeat(5 - r.rating)}</span></div>
              <strong>{r.title}</strong>
              <p>{r.text}</p>
              <small>{r.name}</small>
            </article>
          ))}
        </div>
        <h2 className="atm-h2">You may also like</h2>
        <div className="atm-grid flush">{products.filter((x) => x.id !== p.id).slice(0, 4).map((x, i) => <Tile key={x.id} p={x} nav={nav} i={i} />)}</div>
      </div>
      <div className="ph-cta-bar atm-buybar">
        <div>
          <small>{color}</small>
          <strong>{money(price)}</strong>
        </div>
        <motion.button className="ph-btn" onClick={add} whileTap={{ scale: 0.95 }} animate={{ backgroundColor: added ? "#4b6b3c" : "#2b1d16" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(added)} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
              {added ? <><Icon name="check" size={18} /> Added</> : "Add to bag"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
      <Sheet open={opts} onClose={() => setOpts(false)} title="Choose options">
        <h3 className="atm-sheet-label">Colour · {color}</h3>
        <div className="atm-color-cards">
          {p.colors.map((cw) => (
            <button key={cw.name} aria-pressed={color === cw.name} onClick={() => setColor(cw.name)}>
              <img src={cw.img} style={{ filter: cw.filter }} alt="" />
              <span>{cw.name}</span>
            </button>
          ))}
        </div>
        {p.sizes && (
          <>
            <h3 className="atm-sheet-label">Size</h3>
            <div className="at-sizes">
              {p.sizes.map((sz) => (
                <button key={sz.name} role="radio" aria-checked={size === sz.name} onClick={() => setSize(sz.name)}>
                  {sz.name}{sz.delta > 0 && <small>+{money(sz.delta)}</small>}
                </button>
              ))}
            </div>
          </>
        )}
        <button className="ph-btn block" style={{ marginTop: 18 }} onClick={() => { setOpts(false); add(); }}>Add to bag · {money(price)}</button>
      </Sheet>
    </div>
  );
}

function SwipeLine({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -40, 0], [1, 0.6, 0]);
  return (
    <motion.li className="atm-line-wrap" layout exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div className="atm-line-del" style={{ opacity: bg }}>
        <Icon name="trash" /> Remove
      </motion.div>
      <motion.div
        className="atm-line"
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -110) onDelete();
          else animate(x, 0, spring);
        }}
      >
        {children}
      </motion.div>
    </motion.li>
  );
}

function BagTab({ nav }: { nav: Nav }) {
  const s = useAtelier();
  const toast = useToast();
  const [code, setCode] = useState("");
  const toFree = Math.max(0, FREE_OVER - (s.subtotal - s.discount));
  return (
    <div className="ph-pad-top">
      <h1 className="atm-title">Bag <span>{s.count ? `${s.count} items` : ""}</span></h1>
      {!s.bag.length ? (
        <Empty icon="bag" title="Your bag is empty" text="Find something you'll keep for years." action={<button className="ph-btn" onClick={() => nav.tab("home")}>Start shopping</button>} />
      ) : (
        <>
          <div className="atm-free">
            <span>{toFree ? <>Add <b>{money(toFree)}</b> for free delivery</> : "Free delivery unlocked"}</span>
            <div className="kit-progress"><motion.span animate={{ width: `${Math.min(1, (s.subtotal - s.discount) / FREE_OVER) * 100}%` }} transition={{ duration: 0.8, ease }} /></div>
          </div>
          <p className="atm-hint">Swipe left on an item to remove it</p>
          <ul className="atm-lines">
            <AnimatePresence initial={false}>
              {s.bag.map((l) => {
                const p = productById(l.id);
                return (
                  <SwipeLine key={l.key} onDelete={() => { const copy = { ...l }; s.setQty(l.key, 0); toast("Removed", { action: { label: "Undo", run: () => s.add(copy.id, copy.color, copy.size, copy.qty) } }); }}>
                    <Img p={p} color={l.color} />
                    <div className="grow">
                      <strong>{p.name}</strong>
                      <small>{l.color}{l.size ? ` · ${l.size}` : ""}</small>
                      <b>{money(unitPrice(p, l.size) * l.qty)}</b>
                    </div>
                    <Qty value={l.qty} min={1} onChange={(n) => s.setQty(l.key, n)} />
                  </SwipeLine>
                );
              })}
            </AnimatePresence>
          </ul>
          <form className="atm-promo-row" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (PROMOS[c]) { s.setPromo(c); toast(`${c} applied`, { icon: "tag" }); } else toast("Code not recognised"); }}>
            <Icon name="tag" size={18} />
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={s.promo ? `${s.promo} applied` : "Promo code"} aria-label="Promo code" />
            <button type="submit">Apply</button>
          </form>
          <div className="atm-sum">
            <div><span>Subtotal</span><span>{money(s.subtotal)}</span></div>
            {s.discount > 0 && <div><span>Discount</span><span>−{money(s.discount)}</span></div>}
            <div className="big"><span>Total</span><span>{money(s.subtotal - s.discount)}</span></div>
          </div>
          <div className="ph-cta-bar"><button className="ph-btn block" onClick={() => nav.push("checkout")}>Checkout</button></div>
        </>
      )}
    </div>
  );
}

function CheckoutScreen({ nav }: { nav: Nav }) {
  const s = useAtelier();
  const [ship, setShip] = useState<keyof typeof SHIP>("standard");
  const [pay, setPay] = useState("apple");
  const [addrSheet, setAddrSheet] = useState(false);
  const [address, setAddress] = useState("214 Bayview Ave, Tampa FL 33602");
  const [processing, setProcessing] = useState(false);
  const after = s.subtotal - s.discount;
  const shipCost = after >= FREE_OVER && ship === "standard" ? 0 : SHIP[ship].cost;
  const tax = Math.round(after * 0.07);
  const total = after + shipCost + tax;
  return (
    <div className="atm-checkout">
      <div className="ph-navbar">
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <strong>Checkout</strong>
        <span />
      </div>
      <section className="atm-co-sec">
        <h2>Deliver to</h2>
        <button className="atm-co-card" onClick={() => setAddrSheet(true)}>
          <Icon name="pin" />
          <span className="grow"><strong>Maya Rivera</strong><small>{address}</small></span>
          <span className="atm-edit">Edit</span>
        </button>
      </section>
      <section className="atm-co-sec">
        <h2>Delivery</h2>
        <div className="atm-ship">
          {(Object.keys(SHIP) as (keyof typeof SHIP)[]).map((k) => (
            <button key={k} aria-pressed={ship === k} onClick={() => setShip(k)}>
              <strong>{SHIP[k].label}</strong>
              <small>{SHIP[k].note}</small>
              <b>{after >= FREE_OVER && k === "standard" ? "Free" : money(SHIP[k].cost)}</b>
            </button>
          ))}
        </div>
      </section>
      <section className="atm-co-sec">
        <h2>Payment</h2>
        <div className="ph-list atm-pay">
          {[["apple", "Apple Pay", "apple"], ["card", "Visa •••• 4242", "card"]].map(([k, l, i]) => (
            <button key={k} className="ph-row" onClick={() => setPay(k)} aria-pressed={pay === k}>
              <Icon name={i} fill={i === "apple"} />
              <span className="grow">{l}</span>
              <span className={`atm-radio ${pay === k ? "on" : ""}`} />
            </button>
          ))}
        </div>
      </section>
      <section className="atm-co-sec">
        <h2>Summary · {s.count} items</h2>
        <div className="atm-sum">
          <div><span>Subtotal</span><span>{money(s.subtotal)}</span></div>
          {s.discount > 0 && <div><span>Discount</span><span>−{money(s.discount)}</span></div>}
          <div><span>Delivery</span><span>{shipCost ? money(shipCost) : "Free"}</span></div>
          <div><span>Tax</span><span>{money(tax)}</span></div>
          <div className="big"><span>Total</span><span>{money(total)}</span></div>
        </div>
      </section>
      <div className="ph-cta-bar">
        <SwipeConfirm
          label={`Swipe to pay ${money(total)}`}
          done="Processing…"
          onConfirm={() => {
            setProcessing(true);
            setTimeout(() => {
              const o = s.place(ship, address);
              nav.replace("success", { id: o.id });
            }, 1200);
          }}
        />
      </div>
      <AnimatePresence>
        {processing && (
          <motion.div className="atm-processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <p>Confirming with {pay === "apple" ? "Apple Pay" : "your bank"}…</p>
          </motion.div>
        )}
      </AnimatePresence>
      <Sheet open={addrSheet} onClose={() => setAddrSheet(false)} title="Delivery address">
        {["214 Bayview Ave, Tampa FL 33602", "88 Harbour St, Apt 4, Tampa FL 33606"].map((a) => (
          <button key={a} className="ph-row" onClick={() => { setAddress(a); setAddrSheet(false); }}>
            <Icon name="pin" />
            <span className="grow">{a.split(",")[0]}<small>{a.split(",").slice(1).join(",")}</small></span>
            {address === a && <Icon name="check" />}
          </button>
        ))}
      </Sheet>
    </div>
  );
}

function Success({ nav }: { nav: Nav }) {
  const s = useAtelier();
  const o = s.orders.find((x) => x.id === nav.params.id);
  if (!o) return null;
  return (
    <div className="atm-success ph-pad-top">
      <motion.div className="atm-burst" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.1 }}>
        <Icon name="check" size={40} stroke={2.4} />
      </motion.div>
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.i key={i} className="atm-confetti" style={{ background: ["#a5512f", "#d7c5a9", "#2b1d16", "#6c6b3f"][i % 4] }} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(i) * 160, y: Math.sin(i * 1.7) * 160 - 40, opacity: 0, rotate: i * 40 }} transition={{ duration: 1.3, ease: "easeOut", delay: 0.2 }} />
      ))}
      <h1>Order placed</h1>
      <p>{o.id} · {money(o.total)}</p>
      <div className="atm-success-card">
        <span>Estimated arrival</span>
        <strong>{fmt.date(addDays(TODAY, 4), { weekday: "long", month: "long", day: "numeric" })}</strong>
      </div>
      <button className="ph-btn block" onClick={() => { nav.tab("account"); setTimeout(() => nav.push("order", { id: o.id }), 0); }}>Track order</button>
      <button className="ph-btn ghost block" onClick={() => nav.tab("home")}>Keep browsing</button>
    </div>
  );
}

function AccountTab({ nav }: { nav: Nav }) {
  const s = useAtelier();
  return (
    <div className="ph-pad-top">
      <div className="atm-profile">
        <span className="atm-avatar">MR</span>
        <div>
          <strong>Maya Rivera</strong>
          <small>Member since 2024 · {s.orders.length} orders</small>
        </div>
      </div>
      <div className="ph-section-title"><h2>Orders</h2></div>
      <div className="ph-list atm-list">
        {s.orders.map((o) => (
          <button key={o.id} className="ph-row" onClick={() => nav.push("order", { id: o.id })}>
            <img className="atm-row-img" src={o.lines[0].img} style={{ filter: o.lines[0].filter }} alt="" />
            <span className="grow">{o.id}<small>{o.returned?.length ? "Return started" : statusSteps[o.status]} · {money(o.total)}</small></span>
            <Icon name="next" size={18} />
          </button>
        ))}
      </div>
      <div className="ph-section-title"><h2>Settings</h2></div>
      <div className="ph-list atm-list">
        {[["pin", "Addresses"], ["card", "Payment methods"], ["bell", "Notifications"], ["info", "Help & returns"]].map(([i, l]) => (
          <button key={l} className="ph-row"><Icon name={i} /><span className="grow">{l}</span><Icon name="next" size={18} /></button>
        ))}
      </div>
    </div>
  );
}

function OrderScreen({ nav }: { nav: Nav }) {
  const s = useAtelier();
  const toast = useToast();
  const o = s.orders.find((x) => x.id === nav.params.id)!;
  const [ret, setRet] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [reason, setReason] = useState("Doesn't fit my space");
  return (
    <>
      <div className="ph-navbar">
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <strong>{o.id}</strong>
        <span />
      </div>
      <div className="atm-order">
        <div className="atm-track">
          {statusSteps.map((st, i) => (
            <div key={st} className={i <= o.status ? "done" : ""}>
              <motion.span animate={{ scale: i === o.status ? [1, 1.3, 1] : 1 }}>{i <= o.status && <Icon name="check" size={12} stroke={2.5} />}</motion.span>
              <div><strong>{st}</strong><small>{i <= o.status ? fmt.date(addDays(o.date, i), { weekday: "short", month: "short", day: "numeric" }) : "Pending"}</small></div>
            </div>
          ))}
        </div>
        {o.status < 3 && <button className="ph-btn ghost block" onClick={() => s.advance(o.id)}>Simulate next update</button>}
        <h2 className="atm-h2">Items</h2>
        {o.lines.map((l) => (
          <div className="atm-order-line" key={l.key}>
            <img src={l.img} style={{ filter: l.filter }} alt="" />
            <span className="grow">{l.name}<small>{l.color} × {l.qty}{o.returned?.includes(l.key) ? " · Return started" : ""}</small></span>
            <b>{money(l.price * l.qty)}</b>
          </div>
        ))}
        {o.status === 3 && o.lines.some((l) => !o.returned?.includes(l.key)) && <button className="ph-btn block" onClick={() => setRet(true)}>Return items</button>}
      </div>
      <Sheet open={ret} onClose={() => setRet(false)} title="Return items">
        {o.lines.filter((l) => !o.returned?.includes(l.key)).map((l) => (
          <label key={l.key} className="ph-row">
            <input type="checkbox" checked={keys.includes(l.key)} onChange={() => setKeys(keys.includes(l.key) ? keys.filter((k) => k !== l.key) : [...keys, l.key])} />
            <span className="grow">{l.name}<small>{l.color}</small></span>
          </label>
        ))}
        <div className="ph-field" style={{ marginTop: 12 }}>
          <label htmlFor="atm-reason">Reason</label>
          <select id="atm-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {["Doesn't fit my space", "Colour differs from photos", "Arrived damaged", "Changed my mind"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="ph-btn block" disabled={!keys.length} onClick={() => { s.returnItems(o.id, keys); setRet(false); toast("Pickup booked for " + fmt.date(addDays(TODAY, 2), { weekday: "short" }), { icon: "truck" }); }}>
          Book free pickup
        </button>
      </Sheet>
    </>
  );
}

function WishTab({ nav }: { nav: Nav }) {
  const s = useAtelier();
  return (
    <div className="ph-pad-top">
      <h1 className="atm-title">Saved <span>{s.wish.length}</span></h1>
      {s.wish.length ? <div className="atm-grid">{s.wish.map((id, i) => <Tile key={id} p={productById(id)} nav={nav} i={i} />)}</div> : <Empty icon="heart" title="Nothing saved" text="Tap the heart on any piece." />}
    </div>
  );
}

export default function AtelierMobile() {
  const nav = useNav({ name: "home" });
  const s = useAtelier();
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  const tabs = [
    ["home", "home", "Home"],
    ["search", "search", "Search"],
    ["wish", "heart", "Saved"],
    ["bag", "bag", "Bag"],
    ["account", "user", "Account"],
  ];
  const hideTabs = ["checkout", "success"].includes(nav.screen);
  const darkStatus = nav.screen === "product";
  return (
    <div className="atelier ph-app atm" style={{ "--status-ink": darkStatus ? "#fff" : "#2b1d16" } as React.CSSProperties}>
      <div className="ph-scroll" ref={scroller}>
          <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir}>
            {nav.screen === "home" && <HomeTab nav={nav} />}
            {nav.screen === "search" && <SearchTab nav={nav} />}
            {nav.screen === "wish" && <WishTab nav={nav} />}
            {nav.screen === "bag" && <BagTab nav={nav} />}
            {nav.screen === "account" && <AccountTab nav={nav} />}
            {nav.screen === "category" && <Category nav={nav} />}
            {nav.screen === "product" && <ProductScreen nav={nav} />}
            {nav.screen === "checkout" && <CheckoutScreen nav={nav} />}
            {nav.screen === "success" && <Success nav={nav} />}
            {nav.screen === "order" && <OrderScreen nav={nav} />}
          </Screen>
      </div>
      {!hideTabs && (
        <nav className="ph-tabs" aria-label="ATELIER">
          {tabs.map(([k, i, l]) => (
            <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)}>
              <Icon name={i} size={23} fill={nav.root === k && k !== "search"} stroke={nav.root === k ? 1.4 : 1.7} />
              {l}
              {k === "bag" && s.count > 0 && (
                <motion.span key={s.count} className="ph-badge" initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={spring}>
                  {s.count}
                </motion.span>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
