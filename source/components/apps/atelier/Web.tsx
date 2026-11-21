"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useInView } from "motion/react";
import { Icon } from "../../kit/icons";
import { Drawer, Modal, Qty, Reveal, SplitText, useToast, ease, spring, Empty } from "../../kit/ui";
import { addDays, TODAY, fmt } from "../../kit/store";
import {
  FREE_OVER,
  PROMOS,
  SHIP,
  colorOf,
  money,
  productById,
  products,
  reviewsFor,
  statusSteps,
  stories,
  unitPrice,
  useAtelier,
  type Order,
  type Product,
} from "./data";

type Page =
  | { name: "home" }
  | { name: "shop"; cat?: string; q?: string }
  | { name: "product"; id: string }
  | { name: "checkout" }
  | { name: "confirmation"; id: string }
  | { name: "account"; tab?: "orders" | "wishlist" | "profile"; order?: string };

/** Fly a product image into the bag icon. */
function fly(from: HTMLElement | null) {
  const to = document.querySelector<HTMLElement>(".at-bag-btn");
  if (!from || !to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const ghost = from.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, { position: "fixed", left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px", zIndex: "300", borderRadius: "8px", pointerEvents: "none", objectFit: "cover" });
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  ghost
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy - 120}px) scale(.45)`, opacity: 0.9, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0.2 },
      ],
      { duration: 820, easing: "cubic-bezier(.5,0,.2,1)" },
    )
    .finished.then(() => {
      ghost.remove();
      to.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 380 });
    });
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="at-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} fill={i <= Math.round(value)} stroke={1.4} />
      ))}
    </span>
  );
}

function ProductImage({ p, color, className = "", eager = false }: { p: Product; color?: string; className?: string; eager?: boolean }) {
  const c = colorOf(p, color || p.colors[0].name);
  return <img className={className} src={c.img} alt={`${p.name} in ${c.name}`} style={{ filter: c.filter }} loading={eager ? "eager" : "lazy"} />;
}

function Card({ p, go, onQuick, index = 0 }: { p: Product; go: (pg: Page) => void; onQuick: (p: Product) => void; index?: number }) {
  const s = useAtelier();
  const toast = useToast();
  const saved = s.wish.includes(p.id);
  const alt = p.colors[1];
  return (
    <motion.article
      layout
      className="at-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease, delay: index * 0.04 }}
    >
      <div className="at-card-media">
        <button className="at-card-open" onClick={() => go({ name: "product", id: p.id })} aria-label={`Open ${p.name}`}>
          <ProductImage p={p} />
          {alt && <img className="at-card-alt" src={alt.img} style={{ filter: alt.filter }} alt="" aria-hidden="true" loading="lazy" />}
        </button>
        {p.badge && <span className="at-badge">{p.badge}</span>}
        {p.stock && <span className="at-badge low">Only {p.stock} left</span>}
        <button
          className={`at-heart ${saved ? "on" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name}`}
          onClick={() => {
            const added = s.toggleWish(p.id);
            toast(added ? "Saved to wishlist" : "Removed from wishlist", { icon: "heart" });
          }}
        >
          <motion.span key={String(saved)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={spring}>
            <Icon name="heart" fill={saved} size={18} />
          </motion.span>
        </button>
        <button className="at-quick" onClick={() => onQuick(p)}>
          Quick view
        </button>
      </div>
      <div className="at-card-info">
        <div>
          <h3>{p.name}</h3>
          <p>{p.material}</p>
        </div>
        <div className="at-card-price">
          {p.was && <s>{money(p.was)}</s>}
          <strong>{money(p.price)}</strong>
        </div>
      </div>
      <div className="at-card-swatches" aria-label={`${p.colors.length} colours`}>
        {p.colors.map((c) => (
          <span key={c.name} style={{ background: c.swatch }} title={c.name} />
        ))}
      </div>
    </motion.article>
  );
}

/* ---------------- Header, search, bag ---------------- */

function Header({ go, page, openBag, openSearch }: { go: (p: Page) => void; page: Page; openBag: () => void; openSearch: () => void }) {
  const s = useAtelier();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const cat = page.name === "shop" ? page.cat : undefined;
  return (
    <>
      <div className="at-announce" aria-label="Announcements">
        <div className="at-marquee">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1}>
              Free delivery over $250 <i>✦</i> Made-to-order furniture ships in 3 weeks <i>✦</i> 30-day returns, collected from your door <i>✦</i> Use ATELIER10 for 10% off your first order <i>✦</i>
            </span>
          ))}
        </div>
      </div>
      <header className={`at-header ${scrolled ? "scrolled" : ""}`}>
        <nav className="at-nav" aria-label="Shop">
          <button aria-current={page.name === "shop" && !cat ? "page" : undefined} onClick={() => go({ name: "shop" })}>Shop all</button>
          {(["Living", "Lighting", "Objects", "Carry"] as const).map((c) => (
            <button key={c} aria-current={cat === c ? "page" : undefined} onClick={() => go({ name: "shop", cat: c })}>
              {c}
            </button>
          ))}
        </nav>
        <button className="at-logo" onClick={() => go({ name: "home" })} aria-label="ATELIER home">
          ATELIER
        </button>
        <div className="at-tools">
          <button onClick={openSearch} aria-label="Search">
            <Icon name="search" />
          </button>
          <button onClick={() => go({ name: "account", tab: "orders" })} aria-label="Account">
            <Icon name="user" />
          </button>
          <button onClick={() => go({ name: "account", tab: "wishlist" })} aria-label={`Wishlist, ${s.wish.length} items`}>
            <Icon name="heart" />
            {s.wish.length > 0 && <span className="at-count">{s.wish.length}</span>}
          </button>
          <button className="at-bag-btn" onClick={openBag} aria-label={`Bag, ${s.count} items`}>
            <Icon name="bag" />
            <AnimatePresence>
              {s.count > 0 && (
                <motion.span key={s.count} className="at-count dark" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}>
                  {s.count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>
    </>
  );
}

function Search({ open, onClose, go }: { open: boolean; onClose: () => void; go: (p: Page) => void }) {
  const s = useAtelier();
  const [q, setQ] = useState("");
  const results = q.trim() ? products.filter((p) => (p.name + p.material + p.cat + p.maker).toLowerCase().includes(q.toLowerCase())) : [];
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  const submit = (term: string) => {
    s.remember(term);
    go({ name: "shop", q: term });
    onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <div className="kit-layer at-search-layer">
          <motion.div className="kit-scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="at-search" role="dialog" aria-label="Search" initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.6, ease }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) submit(q);
              }}
            >
              <Icon name="search" size={26} />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search walnut, lighting, bouclé…" aria-label="Search products" />
              <button type="button" className="kit-icon-btn" onClick={onClose} aria-label="Close search">
                <Icon name="close" />
              </button>
            </form>
            <div className="at-search-body">
              {!q && (
                <div className="at-search-cols">
                  <div>
                    <h3>Recent</h3>
                    {s.recent.map((r) => (
                      <button key={r} onClick={() => submit(r)}>
                        <Icon name="clock" size={16} /> {r}
                      </button>
                    ))}
                  </div>
                  <div>
                    <h3>Trending</h3>
                    {["bouclé", "travertine", "walnut", "gift under $100"].map((r) => (
                      <button key={r} onClick={() => submit(r.replace("gift under $100", "tote"))}>
                        <Icon name="sparkle" size={16} /> {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {q && (
                <div className="at-search-results">
                  <p>{results.length} result{results.length === 1 ? "" : "s"} for “{q}”</p>
                  <div>
                    {results.map((p, i) => (
                      <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => { s.remember(q); go({ name: "product", id: p.id }); onClose(); }}>
                        <ProductImage p={p} />
                        <span>
                          <strong>{p.name}</strong>
                          {money(p.price)}
                        </span>
                      </motion.button>
                    ))}
                    {!results.length && <p className="at-muted">Try “lamp”, “walnut” or “tote”.</p>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Bag({ open, onClose, go }: { open: boolean; onClose: () => void; go: (p: Page) => void }) {
  const s = useAtelier();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const toFree = Math.max(0, FREE_OVER - (s.subtotal - s.discount));
  return (
    <Drawer open={open} onClose={onClose} title={<>Your bag <span className="at-muted">({s.count})</span></>} className="at-drawer" width={460}>
      {!s.bag.length ? (
        <Empty icon="bag" title="Your bag is empty" text="Pieces you add will wait here — we'll keep them for 30 days." action={<button className="at-btn" onClick={() => { onClose(); go({ name: "shop" }); }}>Explore the collection</button>} />
      ) : (
        <>
          <div className="at-free">
            <p>{toFree > 0 ? <>You're <strong>{money(toFree)}</strong> from free delivery</> : <><Icon name="check" size={16} /> Free standard delivery unlocked</>}</p>
            <div className="kit-progress">
              <motion.span initial={{ width: 0 }} animate={{ width: `${Math.min(1, (s.subtotal - s.discount) / FREE_OVER) * 100}%` }} transition={{ duration: 0.8, ease }} />
            </div>
          </div>
          <ul className="at-lines">
            <AnimatePresence initial={false}>
              {s.bag.map((l) => {
                const p = productById(l.id);
                return (
                  <motion.li key={l.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0, paddingBlock: 0 }} transition={{ duration: 0.4, ease }}>
                    <ProductImage p={p} color={l.color} />
                    <div className="grow">
                      <strong>{p.name}</strong>
                      <span>
                        {l.color}
                        {l.size ? ` · ${l.size}` : ""}
                      </span>
                      <div className="at-line-row">
                        <Qty value={l.qty} min={1} onChange={(n) => s.setQty(l.key, n)} label={`${p.name} quantity`} />
                        <button
                          className="at-link"
                          onClick={() => {
                            const copy = { ...l };
                            s.setQty(l.key, 0);
                            toast(`${p.name} removed`, { action: { label: "Undo", run: () => s.add(copy.id, copy.color, copy.size, copy.qty) } });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <b>{money(unitPrice(p, l.size) * l.qty)}</b>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <form
            className="at-promo"
            onSubmit={(e) => {
              e.preventDefault();
              const c = code.trim().toUpperCase();
              if (PROMOS[c]) {
                s.setPromo(c);
                setErr("");
                toast(`${c} applied — ${PROMOS[c] * 100}% off`, { icon: "tag" });
              } else setErr("That code isn't valid. Try ATELIER10.");
            }}
          >
            <label htmlFor="at-promo">Promo code</label>
            <div>
              <input id="at-promo" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ATELIER10" aria-invalid={!!err} aria-describedby="at-promo-err" />
              <button className="at-btn ghost" type="submit">Apply</button>
            </div>
            {err && <small id="at-promo-err" role="alert">{err}</small>}
            {s.promo && <small className="at-ok">{s.promo} · −{money(s.discount)} <button type="button" className="at-link" onClick={() => s.setPromo("")}>Remove</button></small>}
          </form>
          <div className="at-totals">
            <div><span>Subtotal</span><span>{money(s.subtotal)}</span></div>
            {s.discount > 0 && <div><span>Discount</span><span>−{money(s.discount)}</span></div>}
            <div><span>Delivery</span><span>{toFree > 0 ? "Calculated at checkout" : "Free"}</span></div>
            <div className="big"><span>Estimated total</span><span>{money(s.subtotal - s.discount)}</span></div>
          </div>
          <button className="at-btn block" onClick={() => { onClose(); go({ name: "checkout" }); }}>
            Checkout securely <Icon name="lock" size={16} />
          </button>
          <p className="at-fine">Taxes calculated at checkout. 30-day free returns.</p>
        </>
      )}
    </Drawer>
  );
}

/* ---------------- Pages ---------------- */

function Home({ go, quick }: { go: (p: Page) => void; quick: (p: Product) => void }) {
  const hero = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const rail = useRef<HTMLDivElement>(null);
  return (
    <>
      <section className="at-hero" ref={hero}>
        <motion.img src={stories[0].img} alt="A bouclé chair under an arc lamp in a terracotta room" style={{ scale, y }} initial={{ clipPath: "inset(12% 8% 12% 8%)" }} animate={{ clipPath: "inset(0% 0% 0% 0%)" }} transition={{ duration: 1.4, ease }} />
        <div className="at-hero-copy">
          <motion.span className="at-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>The Autumn Edit · 2026</motion.span>
          <SplitText as="h1" text="Objects for a quieter life." delay={0.3} />
          <motion.div className="at-hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease }}>
            <button className="at-btn light" onClick={() => go({ name: "shop" })}>Shop the edit</button>
            <button className="at-link light" onClick={() => go({ name: "product", id: "arc" })}>The Arc Lounge Set →</button>
          </motion.div>
        </div>
      </section>

      <section className="at-section">
        <div className="at-section-head">
          <SplitText as="h2" text="Shop by room" />
          <button className="at-link" onClick={() => go({ name: "shop" })}>View all pieces →</button>
        </div>
        <div className="at-rooms">
          {[
            { c: "Living", img: "chair", n: 4 },
            { c: "Lighting", img: "lamp", n: 2 },
            { c: "Objects", img: "vase", n: 1 },
            { c: "Carry", img: "bag", n: 1 },
          ].map((r, i) => (
            <Reveal key={r.c} delay={i * 0.08}>
              <button className="at-room" onClick={() => go({ name: "shop", cat: r.c })}>
                <img src={`${productById(products.find((p) => p.cat === r.c)!.id).colors[0].img}`} alt="" loading="lazy" />
                <span>
                  {r.c}
                  <small>{products.filter((p) => p.cat === r.c).length} pieces</small>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="at-section at-new">
        <div className="at-section-head">
          <SplitText as="h2" text="New this season" />
          <div className="at-rail-ctl">
            <button className="kit-icon-btn" aria-label="Scroll left" onClick={() => rail.current?.scrollBy({ left: -420, behavior: "smooth" })}><Icon name="back" /></button>
            <button className="kit-icon-btn" aria-label="Scroll right" onClick={() => rail.current?.scrollBy({ left: 420, behavior: "smooth" })}><Icon name="next" /></button>
          </div>
        </div>
        <div className="at-rail" ref={rail}>
          {products.map((p, i) => (
            <Card key={p.id} p={p} go={go} onQuick={quick} index={i} />
          ))}
        </div>
      </section>

      <section className="at-story">
        <Reveal className="at-story-img">
          <img src={stories[1].img} alt="Walnut stool and fluted side table in afternoon light" loading="lazy" />
        </Reveal>
        <div className="at-story-copy">
          <span className="at-kicker">Maker spotlight</span>
          <SplitText as="h2" text="Holz & Hand carve each piece from a single block of walnut." />
          <Reveal delay={0.2}>
            <p>In a small workshop outside Vienna, three woodworkers turn FSC-certified walnut into furniture that is meant to be inherited. Nothing is veneered; every grain is its own.</p>
            <div className="at-story-actions">
              <button className="at-btn" onClick={() => go({ name: "product", id: "arch" })}>Shop the Arch Stool</button>
              <button className="at-link" onClick={() => go({ name: "product", id: "column" })}>Column Side Table →</button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="at-values">
        {[
          ["truck", "Delivered with care", "Free over $250. White-glove to the room of your choice."],
          ["refresh", "30-day returns", "Changed your mind? We collect from your door."],
          ["leaf", "Made to last", "Solid materials, repairable construction, 10-year frame warranty."],
        ].map(([i, t, d], k) => (
          <Reveal key={t} delay={k * 0.1}>
            <Icon name={i} size={26} stroke={1.3} />
            <h3>{t}</h3>
            <p>{d}</p>
          </Reveal>
        ))}
      </section>

      <section className="at-section">
        <div className="at-section-head">
          <SplitText as="h2" text="Most loved" />
        </div>
        <div className="at-grid cols-4">
          {[...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4).map((p, i) => (
            <Card key={p.id} p={p} go={go} onQuick={quick} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}

const PRICE_BANDS = [
  { label: "Under $100", test: (n: number) => n < 100 },
  { label: "$100 – $500", test: (n: number) => n >= 100 && n <= 500 },
  { label: "Over $500", test: (n: number) => n > 500 },
];

function Shop({ cat, q, go, quick }: { cat?: string; q?: string; go: (p: Page) => void; quick: (p: Product) => void }) {
  const [cats, setCats] = useState<string[]>(cat ? [cat] : []);
  const [bands, setBands] = useState<string[]>([]);
  const [mats, setMats] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");
  const [cols, setCols] = useState(3);
  const [query, setQuery] = useState(q || "");
  useEffect(() => {
    setCats(cat ? [cat] : []);
  }, [cat]);
  useEffect(() => {
    setQuery(q || "");
  }, [q]);
  const materials = ["Walnut", "Bouclé", "Glass", "Clay", "Canvas", "Steel"];
  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (!cats.length || cats.includes(p.cat)) &&
        (!bands.length || bands.some((b) => PRICE_BANDS.find((x) => x.label === b)!.test(p.price))) &&
        (!mats.length || mats.some((m) => (p.material + p.name).toLowerCase().includes(m.toLowerCase().replace("clay", "terracotta").replace("glass", "glass")))) &&
        (!query || (p.name + p.material + p.cat + p.maker).toLowerCase().includes(query.toLowerCase())),
    );
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rated") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [cats, bands, mats, sort, query]);
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const chips = [...cats.map((c) => ["cat", c]), ...bands.map((b) => ["band", b]), ...mats.map((m) => ["mat", m]), ...(query ? [["q", `“${query}”`]] : [])];
  return (
    <div className="at-shop">
      <div className="at-shop-head">
        <span className="at-kicker">{cat ? "Collection" : "The full collection"}</span>
        <SplitText as="h1" key={cat || "all"} text={cat ? cat : "Shop all"} />
      </div>
      <div className="at-shop-body">
        <aside className="at-filters" aria-label="Filters">
          <fieldset>
            <legend>Category</legend>
            {["Living", "Lighting", "Objects", "Carry"].map((c) => (
              <label key={c} className="at-check">
                <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} />
                <span>{c}</span>
                <small>{products.filter((p) => p.cat === c).length}</small>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            {PRICE_BANDS.map((b) => (
              <label key={b.label} className="at-check">
                <input type="checkbox" checked={bands.includes(b.label)} onChange={() => toggle(bands, setBands, b.label)} />
                <span>{b.label}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Material</legend>
            <div className="at-pills">
              {materials.map((m) => (
                <button key={m} aria-pressed={mats.includes(m)} onClick={() => toggle(mats, setMats, m)}>
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
        </aside>
        <div className="at-results">
          <div className="at-toolbar">
            <div className="at-applied">
              <span aria-live="polite">{list.length} pieces</span>
              <AnimatePresence>
                {chips.map(([k, v]) => (
                  <motion.button
                    key={k + v}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="at-chip"
                    onClick={() => {
                      if (k === "cat") toggle(cats, setCats, v);
                      if (k === "band") toggle(bands, setBands, v);
                      if (k === "mat") toggle(mats, setMats, v);
                      if (k === "q") setQuery("");
                    }}
                    aria-label={`Remove filter ${v}`}
                  >
                    {v} <Icon name="close" size={12} />
                  </motion.button>
                ))}
              </AnimatePresence>
              {chips.length > 1 && (
                <button className="at-link" onClick={() => { setCats([]); setBands([]); setMats([]); setQuery(""); }}>
                  Clear all
                </button>
              )}
            </div>
            <div className="at-toolbar-right">
              <label className="at-select">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price, low to high</option>
                  <option value="high">Price, high to low</option>
                  <option value="rated">Top rated</option>
                </select>
              </label>
              <div className="at-density" role="group" aria-label="Grid density">
                {[2, 3, 4].map((n) => (
                  <button key={n} aria-pressed={cols === n} onClick={() => setCols(n)} aria-label={`${n} columns`}>
                    {Array.from({ length: n }).map((_, i) => <i key={i} />)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <motion.div layout className={`at-grid cols-${cols}`}>
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <Card key={p.id} p={p} go={go} onQuick={quick} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
          {!list.length && <Empty icon="search" title="Nothing matches those filters" text="Try removing a filter or searching for a material." action={<button className="at-btn" onClick={() => { setCats([]); setBands([]); setMats([]); setQuery(""); }}>Reset filters</button>} />}
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, open: initial = false }: { title: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="at-acc">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>
        {title}
        <motion.span animate={{ rotate: open ? 45 : 0 }}>
          <Icon name="plus" size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }}>
            <div className="at-acc-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductPage({ id, go, quick }: { id: string; go: (p: Page) => void; quick: (p: Product) => void }) {
  const p = productById(id);
  const s = useAtelier();
  const toast = useToast();
  const [color, setColor] = useState(p.colors[0].name);
  const [size, setSize] = useState(p.sizes?.[0].name);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const [zip, setZip] = useState("33602");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const buyVisible = useInView(buyRef);
  useEffect(() => {
    setColor(p.colors[0].name);
    setSize(p.sizes?.[0].name);
    setShot(0);
    setQty(1);
  }, [p]);
  const c = colorOf(p, color);
  const shots = [
    { pos: "50% 50%", scale: 1 },
    { pos: "30% 40%", scale: 1.8 },
    { pos: "70% 75%", scale: 2.2 },
  ];
  const price = unitPrice(p, size);
  const reviews = reviewsFor(p);
  const dist = [0.78, 0.15, 0.04, 0.02, 0.01];
  function addToBag() {
    setState("adding");
    setTimeout(() => {
      s.add(p.id, color, size, qty);
      fly(imgRef.current);
      setState("added");
      toast(`${p.name} added to bag`, { icon: "bag" });
      setTimeout(() => setState("idle"), 1800);
    }, 450);
  }
  const saved = s.wish.includes(p.id);
  return (
    <div className="at-pdp">
      <nav className="at-crumbs" aria-label="Breadcrumb">
        <button onClick={() => go({ name: "home" })}>Home</button> / <button onClick={() => go({ name: "shop", cat: p.cat })}>{p.cat}</button> / <span>{p.name}</span>
      </nav>
      <div className="at-pdp-grid">
        <div className="at-gallery">
          <div className="at-thumbs" role="tablist" aria-label="Product images">
            {shots.map((sh, i) => (
              <button key={i} role="tab" aria-selected={shot === i} onClick={() => setShot(i)} aria-label={`Image ${i + 1}`}>
                <img src={c.img} alt="" style={{ filter: c.filter, objectPosition: sh.pos, transform: `scale(${sh.scale})` }} />
              </button>
            ))}
          </div>
          <div
            className={`at-stage ${zoom ? "zooming" : ""}`}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onPointerLeave={() => setZoom(null)}
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                ref={imgRef}
                key={c.name + shot}
                src={c.img}
                alt={`${p.name} in ${c.name}, view ${shot + 1}`}
                style={{
                  filter: c.filter,
                  objectPosition: shots[shot].pos,
                  transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
                }}
                initial={{ opacity: 0, scale: shots[shot].scale * 1.05 }}
                animate={{ opacity: 1, scale: zoom ? shots[shot].scale * 1.9 : shots[shot].scale }}
                exit={{ opacity: 0 }}
                transition={{ duration: zoom ? 0.3 : 0.7, ease }}
              />
            </AnimatePresence>
            <span className="at-zoom-hint"><Icon name="search" size={14} /> Hover to zoom</span>
          </div>
        </div>
        <div className="at-buy">
          <span className="at-kicker">{p.maker}</span>
          <h1>{p.name}</h1>
          <button className="at-rating" onClick={() => document.getElementById("at-reviews")?.scrollIntoView({ behavior: "smooth" })}>
            <Stars value={p.rating} /> {p.rating} · {p.reviews} reviews
          </button>
          <div className="at-price">
            <AnimatePresence mode="popLayout">
              <motion.strong key={price} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}>
                {money(price)}
              </motion.strong>
            </AnimatePresence>
            {p.was && <s>{money(p.was)}</s>}
            <span>or 4 interest-free payments of {money(Math.round(price / 4))}</span>
          </div>
          <p className="at-blurb">{p.blurb}</p>
          <div className="at-opt">
            <div className="at-opt-label">
              Colour <strong>{color}</strong>
            </div>
            <div className="at-swatches" role="radiogroup" aria-label="Colour">
              {p.colors.map((cw) => (
                <button key={cw.name} role="radio" aria-checked={color === cw.name} aria-label={cw.name} onClick={() => setColor(cw.name)}>
                  <span style={{ background: cw.swatch }} />
                </button>
              ))}
            </div>
          </div>
          {p.sizes && (
            <div className="at-opt">
              <div className="at-opt-label">
                Size <strong>{size}</strong>
                <span className="at-muted">{p.dims}</span>
              </div>
              <div className="at-sizes" role="radiogroup" aria-label="Size">
                {p.sizes.map((sz) => (
                  <button key={sz.name} role="radio" aria-checked={size === sz.name} onClick={() => setSize(sz.name)}>
                    {sz.name}
                    {sz.delta > 0 && <small>+{money(sz.delta)}</small>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="at-buy-row" ref={buyRef}>
            <Qty value={qty} min={1} max={p.stock || 10} onChange={setQty} />
            <motion.button className={`at-btn block at-add ${state}`} onClick={addToBag} disabled={state !== "idle"} whileTap={{ scale: 0.97 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={state} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.25 }}>
                  {state === "idle" && <>Add to bag — {money(price * qty)}</>}
                  {state === "adding" && <span className="at-dots"><i /><i /><i /></span>}
                  {state === "added" && <><Icon name="check" size={18} /> Added to bag</>}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <button className={`at-wish-btn ${saved ? "on" : ""}`} aria-pressed={saved} aria-label="Save to wishlist" onClick={() => toast(s.toggleWish(p.id) ? "Saved to wishlist" : "Removed from wishlist", { icon: "heart" })}>
              <Icon name="heart" fill={saved} />
            </button>
          </div>
          {p.stock && <p className="at-stock"><span /> Low stock — only {p.stock} left in {color}</p>}
          <div className="at-delivery">
            <Icon name="truck" />
            <div>
              <strong>
                Arrives {fmt.date(addDays(TODAY, 4), { weekday: "short", month: "short", day: "numeric" })} – {fmt.date(addDays(TODAY, 6), { month: "short", day: "numeric" })}
              </strong>
              <span>
                to{" "}
                <input aria-label="Delivery ZIP code" value={zip} inputMode="numeric" maxLength={5} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />{" "}
                · {price >= FREE_OVER ? "Free delivery" : `${money(SHIP.standard.cost)} delivery`}
              </span>
            </div>
          </div>
          <Accordion title="Details" open>
            <ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          </Accordion>
          <Accordion title="Dimensions">
            <p>{p.dims}</p>
          </Accordion>
          <Accordion title="Delivery & returns">
            <p>Standard delivery {money(SHIP.standard.cost)}, free over {money(FREE_OVER)}. Express next business day. White-glove includes room placement and packaging removal. Return within 30 days — we collect.</p>
          </Accordion>
        </div>
      </div>

      <section className="at-reviews" id="at-reviews">
        <div className="at-reviews-summary">
          <h2>Reviews</h2>
          <div className="at-score">
            <strong>{p.rating}</strong>
            <div>
              <Stars value={p.rating} size={18} />
              <span>{p.reviews} verified reviews</span>
            </div>
          </div>
          <div className="at-dist">
            {dist.map((d, i) => (
              <button key={i} aria-pressed={starFilter === 5 - i} onClick={() => setStarFilter(starFilter === 5 - i ? null : 5 - i)}>
                <span>{5 - i}★</span>
                <span className="at-dist-bar"><motion.i initial={{ width: 0 }} whileInView={{ width: `${d * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: i * 0.08 }} /></span>
                <small>{Math.round(d * p.reviews)}</small>
              </button>
            ))}
          </div>
          <div className="at-fit">
            <span>Size runs</span>
            <div className="at-fit-scale"><i style={{ left: "58%" }} /></div>
            <div className="at-fit-labels"><small>Small</small><small>True</small><small>Large</small></div>
          </div>
        </div>
        <div className="at-review-list">
          <AnimatePresence mode="popLayout">
            {reviews.filter((r) => starFilter == null || r.rating === starFilter).map((r) => (
              <motion.article key={r.name} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="at-review-top">
                  <Stars value={r.rating} />
                  <span className="at-muted">{r.date}</span>
                </div>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                <small>
                  {r.name} {r.verified && <span className="at-verified"><Icon name="check" size={12} /> Verified buyer</span>}
                </small>
              </motion.article>
            ))}
          </AnimatePresence>
          {starFilter != null && !reviews.some((r) => r.rating === starFilter) && <p className="at-muted">No written reviews with {starFilter} stars yet.</p>}
        </div>
      </section>

      <section className="at-section">
        <div className="at-section-head">
          <SplitText as="h2" text="Complete the look" />
        </div>
        <div className="at-grid cols-4">
          {products.filter((x) => x.id !== p.id).slice(0, 4).map((x, i) => (
            <Card key={x.id} p={x} go={go} onQuick={quick} index={i} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {!buyVisible && (
          <motion.div className="at-sticky-buy" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ duration: 0.45, ease }}>
            <ProductImage p={p} color={color} />
            <div className="grow">
              <strong>{p.name}</strong>
              <span>{color}{size ? ` · ${size}` : ""} · {money(price)}</span>
            </div>
            <button className="at-btn" onClick={addToBag} disabled={state !== "idle"}>
              {state === "added" ? "Added ✓" : "Add to bag"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickView({ p, onClose, go }: { p: Product | null; onClose: () => void; go: (pg: Page) => void }) {
  const s = useAtelier();
  const toast = useToast();
  const [color, setColor] = useState("");
  const [size, setSize] = useState<string | undefined>();
  useEffect(() => {
    if (p) {
      setColor(p.colors[0].name);
      setSize(p.sizes?.[0].name);
    }
  }, [p]);
  return (
    <Modal open={!!p} onClose={onClose} label={p ? `Quick view: ${p.name}` : "Quick view"} className="at-quickview">
      {p && (
        <div className="at-qv">
          <ProductImage p={p} color={color} eager />
          <div>
            <span className="at-kicker">{p.cat}</span>
            <h2>{p.name}</h2>
            <p className="at-qv-price">{money(unitPrice(p, size))}</p>
            <p>{p.blurb}</p>
            <div className="at-swatches" role="radiogroup" aria-label="Colour">
              {p.colors.map((cw) => (
                <button key={cw.name} role="radio" aria-checked={color === cw.name} aria-label={cw.name} onClick={() => setColor(cw.name)}>
                  <span style={{ background: cw.swatch }} />
                </button>
              ))}
            </div>
            {p.sizes && (
              <div className="at-sizes" role="radiogroup" aria-label="Size">
                {p.sizes.map((sz) => (
                  <button key={sz.name} role="radio" aria-checked={size === sz.name} onClick={() => setSize(sz.name)}>
                    {sz.name}
                  </button>
                ))}
              </div>
            )}
            <button
              className="at-btn block"
              onClick={(e) => {
                s.add(p.id, color, size);
                fly((e.currentTarget.closest(".at-qv") as HTMLElement)?.querySelector("img"));
                toast(`${p.name} added to bag`, { icon: "bag" });
                onClose();
              }}
            >
              Add to bag
            </button>
            <button className="at-link" onClick={() => { onClose(); go({ name: "product", id: p.id }); }}>
              See full details →
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- Checkout ---------------- */

const steps = ["Information", "Delivery", "Payment"] as const;

function Checkout({ go }: { go: (p: Page) => void }) {
  const s = useAtelier();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ email: "maya@example.com", first: "Maya", last: "Rivera", address: "214 Bayview Ave", city: "Tampa", zip: "33602", phone: "" });
  const [ship, setShip] = useState<keyof typeof SHIP>("standard");
  const [card, setCard] = useState({ number: "", name: "Maya Rivera", exp: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const after = s.subtotal - s.discount;
  const shipCost = after >= FREE_OVER && ship === "standard" ? 0 : SHIP[ship].cost;
  const tax = Math.round(after * 0.07);
  if (!s.bag.length && !placing)
    return (
      <div className="at-checkout-empty">
        <Empty icon="bag" title="Your bag is empty" text="Add a piece before checking out." action={<button className="at-btn" onClick={() => go({ name: "shop" })}>Back to the shop</button>} />
      </div>
    );
  function validate() {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!/^\S+@\S+\.\S+$/.test(info.email)) e.email = "Enter a valid email address";
      if (!info.first.trim()) e.first = "Required";
      if (!info.address.trim()) e.address = "Required";
      if (!/^\d{5}$/.test(info.zip)) e.zip = "5-digit ZIP";
    }
    if (step === 2) {
      if (card.number.replace(/\s/g, "").length < 16) e.number = "Card number must be 16 digits";
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.exp = "MM/YY";
      if (card.cvc.length < 3) e.cvc = "3 digits";
    }
    setErrors(e);
    return !Object.keys(e).length;
  }
  function next() {
    if (!validate()) return;
    if (step < 2) setStep(step + 1);
    else {
      setPlacing(true);
      setTimeout(() => {
        const o = s.place(ship, `${info.address}, ${info.city} ${info.zip}`);
        go({ name: "confirmation", id: o.id });
      }, 1400);
    }
  }
  const field = (k: keyof typeof info, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={`at-field ${errors[k] ? "err" : ""}`}>
      <span>{label}</span>
      <input value={info[k]} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <small role="alert">{errors[k]}</small>}
    </label>
  );
  return (
    <div className="at-checkout">
      <div className="at-co-main">
        <ol className="at-steps" aria-label="Checkout progress">
          {steps.map((st, i) => (
            <li key={st} className={i === step ? "on" : i < step ? "done" : ""}>
              <button onClick={() => i < step && setStep(i)} disabled={i > step}>
                <span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
                {st}
              </button>
            </li>
          ))}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease }}>
            {step === 0 && (
              <div className="at-form">
                <div className="at-express">
                  <span>Express checkout</span>
                  <div>
                    <button className="at-pay apple" onClick={() => { setStep(2); setCard({ ...card, number: "4242 4242 4242 4242", exp: "08/29", cvc: "123" }); }}><Icon name="apple" size={18} fill /> Pay</button>
                    <button className="at-pay shop" onClick={() => setStep(1)}>Shop<b>Pay</b></button>
                  </div>
                </div>
                <h2>Contact</h2>
                {field("email", "Email", { type: "email", autoComplete: "email" })}
                <h2>Delivery address</h2>
                <div className="at-row2">
                  {field("first", "First name", { autoComplete: "given-name" })}
                  {field("last", "Last name", { autoComplete: "family-name" })}
                </div>
                {field("address", "Street address", { autoComplete: "street-address" })}
                <div className="at-row2">
                  {field("city", "City")}
                  {field("zip", "ZIP code", { inputMode: "numeric", maxLength: 5 })}
                </div>
                {field("phone", "Phone (for delivery updates, optional)", { type: "tel" })}
              </div>
            )}
            {step === 1 && (
              <div className="at-form">
                <h2>Delivery method</h2>
                <div className="at-ship" role="radiogroup" aria-label="Delivery method">
                  {(Object.keys(SHIP) as (keyof typeof SHIP)[]).map((k, i) => {
                    const cost = after >= FREE_OVER && k === "standard" ? 0 : SHIP[k].cost;
                    return (
                      <button key={k} role="radio" aria-checked={ship === k} onClick={() => setShip(k)}>
                        <span className="at-radio" />
                        <div className="grow">
                          <strong>{SHIP[k].label}</strong>
                          <span>
                            {SHIP[k].note} · by {fmt.date(addDays(TODAY, [5, 1, 9][i]), { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <b>{cost ? money(cost) : "Free"}</b>
                      </button>
                    );
                  })}
                </div>
                <div className="at-ship-to">
                  <Icon name="pin" />
                  <span>
                    Shipping to {info.first} {info.last}, {info.address}, {info.city} {info.zip}
                  </span>
                  <button className="at-link" onClick={() => setStep(0)}>Change</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="at-form">
                <h2>Payment</h2>
                <div className="at-card-preview" aria-hidden="true">
                  <span>ATELIER CARD</span>
                  <strong>{card.number || "•••• •••• •••• ••••"}</strong>
                  <div>
                    <span>{card.name || "NAME"}</span>
                    <span>{card.exp || "MM/YY"}</span>
                  </div>
                </div>
                <label className={`at-field ${errors.number ? "err" : ""}`}>
                  <span>Card number</span>
                  <input inputMode="numeric" autoComplete="cc-number" value={card.number} placeholder="4242 4242 4242 4242" onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} aria-invalid={!!errors.number} />
                  {errors.number && <small role="alert">{errors.number}</small>}
                </label>
                <label className="at-field">
                  <span>Name on card</span>
                  <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" />
                </label>
                <div className="at-row2">
                  <label className={`at-field ${errors.exp ? "err" : ""}`}>
                    <span>Expiry</span>
                    <input placeholder="MM/YY" value={card.exp} inputMode="numeric" onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, exp: v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v }); }} aria-invalid={!!errors.exp} />
                    {errors.exp && <small role="alert">{errors.exp}</small>}
                  </label>
                  <label className={`at-field ${errors.cvc ? "err" : ""}`}>
                    <span>Security code</span>
                    <input placeholder="123" value={card.cvc} inputMode="numeric" onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} aria-invalid={!!errors.cvc} />
                    {errors.cvc && <small role="alert">{errors.cvc}</small>}
                  </label>
                </div>
                <p className="at-fine"><Icon name="lock" size={14} /> Demo only — no payment is processed. Use any 16 digits.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="at-co-actions">
          {step > 0 ? <button className="at-link" onClick={() => setStep(step - 1)}>← Back to {steps[step - 1].toLowerCase()}</button> : <button className="at-link" onClick={() => go({ name: "shop" })}>← Continue shopping</button>}
          <button className="at-btn" onClick={next} disabled={placing}>
            {placing ? <span className="at-dots"><i /><i /><i /></span> : step < 2 ? `Continue to ${steps[step + 1].toLowerCase()}` : `Pay ${money(after + shipCost + tax)}`}
          </button>
        </div>
      </div>
      <aside className="at-co-summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <ul>
          {s.bag.map((l) => {
            const p = productById(l.id);
            return (
              <li key={l.key}>
                <span className="at-co-thumb">
                  <ProductImage p={p} color={l.color} />
                  <b>{l.qty}</b>
                </span>
                <div className="grow">
                  <strong>{p.name}</strong>
                  <span>{l.color}{l.size ? ` · ${l.size}` : ""}</span>
                </div>
                <span>{money(unitPrice(p, l.size) * l.qty)}</span>
              </li>
            );
          })}
        </ul>
        <div className="at-totals">
          <div><span>Subtotal</span><span>{money(s.subtotal)}</span></div>
          {s.discount > 0 && <div><span>Discount ({s.promo})</span><span>−{money(s.discount)}</span></div>}
          <div><span>Delivery · {SHIP[ship].label}</span><span>{shipCost ? money(shipCost) : "Free"}</span></div>
          <div><span>Estimated tax</span><span>{money(tax)}</span></div>
          <div className="big"><span>Total</span><span>{money(after + shipCost + tax)}</span></div>
        </div>
      </aside>
    </div>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <ol className="at-timeline">
      {statusSteps.map((st, i) => (
        <li key={st} className={i <= order.status ? "done" : ""}>
          <motion.span className="at-tl-dot" initial={false} animate={{ scale: i === order.status ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.6 }}>
            {i <= order.status && <Icon name="check" size={12} stroke={2.4} />}
          </motion.span>
          <div>
            <strong>{st}</strong>
            <small>{i <= order.status ? fmt.date(addDays(order.date, i), { weekday: "short", month: "short", day: "numeric" }) : "Pending"}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Confirmation({ id, go }: { id: string; go: (p: Page) => void }) {
  const s = useAtelier();
  const o = s.orders.find((x) => x.id === id);
  if (!o) return null;
  return (
    <div className="at-confirm">
      <motion.div className="at-confirm-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.2 }}>
        <svg viewBox="0 0 52 52" width="72" height="72">
          <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease }} />
          <motion.path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 }} />
        </svg>
      </motion.div>
      <span className="at-kicker">Order {o.id}</span>
      <SplitText as="h1" text={`Thank you — it's on its way.`} delay={0.3} />
      <p>A confirmation is on its way to your inbox. We'll send updates as your pieces are packed and delivered.</p>
      <div className="at-confirm-grid">
        <div className="at-panel">
          <h2>Tracking</h2>
          <Timeline order={o} />
          {o.status < 3 && (
            <button className="at-btn ghost" onClick={() => s.advance(o.id)}>
              Simulate next update
            </button>
          )}
        </div>
        <div className="at-panel">
          <h2>Summary</h2>
          {o.lines.map((l) => (
            <div className="at-mini-line" key={l.key}>
              <img src={l.img} style={{ filter: l.filter }} alt="" />
              <span className="grow">{l.name} × {l.qty}</span>
              <span>{money(l.price * l.qty)}</span>
            </div>
          ))}
          <div className="at-totals"><div className="big"><span>Paid</span><span>{money(o.total)}</span></div></div>
          <p className="at-muted">{o.shipping} to {o.address}</p>
        </div>
      </div>
      <div className="at-confirm-actions">
        <button className="at-btn" onClick={() => go({ name: "account", tab: "orders", order: o.id })}>View order</button>
        <button className="at-link" onClick={() => go({ name: "shop" })}>Continue shopping →</button>
      </div>
    </div>
  );
}

function Account({ tab = "orders", order, go, quick }: { tab?: "orders" | "wishlist" | "profile"; order?: string; go: (p: Page) => void; quick: (p: Product) => void }) {
  const s = useAtelier();
  const toast = useToast();
  const o = order ? s.orders.find((x) => x.id === order) : undefined;
  const [ret, setRet] = useState<{ open: boolean; step: number; keys: string[]; reason: string; method: string }>({ open: false, step: 0, keys: [], reason: "Doesn't fit my space", method: "Pickup" });
  return (
    <div className="at-account">
      <div className="at-account-head">
        <span className="at-kicker">Welcome back</span>
        <h1>Maya Rivera</h1>
        <div className="at-tabs" role="tablist">
          {(["orders", "wishlist", "profile"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => go({ name: "account", tab: t })}>
              {t === "orders" ? `Orders (${s.orders.length})` : t === "wishlist" ? `Wishlist (${s.wish.length})` : "Profile"}
              {tab === t && <motion.span layoutId="at-tab" className="at-tab-line" />}
            </button>
          ))}
        </div>
      </div>
      {tab === "orders" && !o && (
        <div className="at-orders">
          {s.orders.map((x, i) => (
            <Reveal key={x.id} delay={i * 0.05}>
              <button className="at-order-row" onClick={() => go({ name: "account", tab: "orders", order: x.id })}>
                <div className="at-order-imgs">
                  {x.lines.slice(0, 3).map((l) => <img key={l.key} src={l.img} style={{ filter: l.filter }} alt="" />)}
                </div>
                <div className="grow">
                  <strong>{x.id}</strong>
                  <span>{fmt.date(x.date, { month: "long", day: "numeric", year: "numeric" })} · {x.lines.reduce((a, l) => a + l.qty, 0)} items · {money(x.total)}</span>
                </div>
                <span className={`at-status s${x.status}`}>{x.returned?.length ? "Return started" : statusSteps[x.status]}</span>
                <Icon name="next" />
              </button>
            </Reveal>
          ))}
        </div>
      )}
      {tab === "orders" && o && (
        <div className="at-order-detail">
          <button className="at-link" onClick={() => go({ name: "account", tab: "orders" })}>← All orders</button>
          <h2>Order {o.id}</h2>
          <div className="at-confirm-grid">
            <div className="at-panel">
              <h3>Status</h3>
              <Timeline order={o} />
              {o.status < 3 && <button className="at-btn ghost" onClick={() => s.advance(o.id)}>Simulate next update</button>}
            </div>
            <div className="at-panel">
              <h3>Items</h3>
              {o.lines.map((l) => (
                <div className="at-mini-line" key={l.key}>
                  <img src={l.img} style={{ filter: l.filter }} alt="" />
                  <span className="grow">{l.name} · {l.color} × {l.qty}{o.returned?.includes(l.key) && <em className="at-returned">Return in progress</em>}</span>
                  <span>{money(l.price * l.qty)}</span>
                </div>
              ))}
              {o.status === 3 && o.lines.some((l) => !o.returned?.includes(l.key)) && (
                <button className="at-btn" onClick={() => setRet({ ...ret, open: true, step: 0, keys: [] })}>Start a return</button>
              )}
              {o.status < 3 && <p className="at-muted">Returns open once your order is delivered.</p>}
            </div>
          </div>
          <Modal open={ret.open} onClose={() => setRet({ ...ret, open: false })} label="Start a return" className="at-return">
            <div className="at-return-body">
              <span className="at-kicker">Return · step {ret.step + 1} of 3</span>
              <AnimatePresence mode="wait">
                <motion.div key={ret.step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {ret.step === 0 && (
                    <>
                      <h2>Which items?</h2>
                      {o.lines.filter((l) => !o.returned?.includes(l.key)).map((l) => (
                        <label key={l.key} className="at-return-item">
                          <input type="checkbox" checked={ret.keys.includes(l.key)} onChange={() => setRet({ ...ret, keys: ret.keys.includes(l.key) ? ret.keys.filter((k) => k !== l.key) : [...ret.keys, l.key] })} />
                          <img src={l.img} style={{ filter: l.filter }} alt="" />
                          <span className="grow">{l.name}<small>{l.color}</small></span>
                          <b>{money(l.price * l.qty)}</b>
                        </label>
                      ))}
                    </>
                  )}
                  {ret.step === 1 && (
                    <>
                      <h2>Tell us why</h2>
                      <div className="at-reasons" role="radiogroup">
                        {["Doesn't fit my space", "Colour differs from photos", "Arrived damaged", "Changed my mind"].map((r) => (
                          <button key={r} role="radio" aria-checked={ret.reason === r} onClick={() => setRet({ ...ret, reason: r })}><span className="at-radio" />{r}</button>
                        ))}
                      </div>
                      <h2>How should we collect it?</h2>
                      <div className="at-reasons" role="radiogroup">
                        {["Pickup", "Drop-off"].map((m) => (
                          <button key={m} role="radio" aria-checked={ret.method === m} onClick={() => setRet({ ...ret, method: m })}><span className="at-radio" />{m === "Pickup" ? "Free pickup from your door" : "Drop off at a partner store"}</button>
                        ))}
                      </div>
                    </>
                  )}
                  {ret.step === 2 && (
                    <div className="at-return-done">
                      <h2>Return confirmed</h2>
                      <p>{ret.method === "Pickup" ? "A courier will collect on " + fmt.date(addDays(TODAY, 2), { weekday: "long", month: "short", day: "numeric" }) + ", 9am–1pm." : "Show this code at any partner store within 14 days."}</p>
                      <svg className="at-qr" viewBox="0 0 21 21" aria-label="Return QR code">
                        {Array.from({ length: 21 * 21 }).map((_, i) => {
                          const x = i % 21, y = Math.floor(i / 21);
                          const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
                          const on = finder ? (x % 20 === 0 || y % 20 === 0 || x === 6 || y === 6 || x === 14 || y === 14 || ((x > 1 && x < 5) || (x > 15 && x < 19)) && ((y > 1 && y < 5) || (y > 15 && y < 19))) : (x * 7 + y * 13 + x * y) % 3 === 0;
                          return on ? <rect key={i} x={x} y={y} width="1" height="1" /> : null;
                        })}
                      </svg>
                      <p className="at-muted">Refund of {money(o.lines.filter((l) => ret.keys.includes(l.key)).reduce((a, l) => a + l.price * l.qty, 0))} issued when we receive it.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="at-co-actions">
                {ret.step === 1 && <button className="at-link" onClick={() => setRet({ ...ret, step: 0 })}>← Back</button>}
                {ret.step < 2 ? (
                  <button
                    className="at-btn"
                    disabled={!ret.keys.length}
                    onClick={() => {
                      if (ret.step === 1) {
                        s.returnItems(o.id, ret.keys);
                        toast("Return booked", { icon: "check" });
                      }
                      setRet({ ...ret, step: ret.step + 1 });
                    }}
                  >
                    {ret.step === 0 ? "Continue" : "Confirm return"}
                  </button>
                ) : (
                  <button className="at-btn" onClick={() => setRet({ ...ret, open: false })}>Done</button>
                )}
              </div>
            </div>
          </Modal>
        </div>
      )}
      {tab === "wishlist" && (
        <div className="at-grid cols-4">
          <AnimatePresence mode="popLayout">
            {s.wish.map((id, i) => <Card key={id} p={productById(id)} go={go} onQuick={quick} index={i} />)}
          </AnimatePresence>
          {!s.wish.length && <Empty icon="heart" title="No saved pieces yet" text="Tap the heart on anything you love." />}
        </div>
      )}
      {tab === "profile" && (
        <div className="at-profile at-form">
          <label className="at-field"><span>Name</span><input defaultValue="Maya Rivera" /></label>
          <label className="at-field"><span>Email</span><input defaultValue="maya@example.com" /></label>
          <label className="at-field"><span>Default address</span><input defaultValue="214 Bayview Ave, Tampa FL 33602" /></label>
          <label className="at-check"><input type="checkbox" defaultChecked /> <span>Email me about new makers and restocks</span></label>
          <button className="at-btn" onClick={() => toast("Profile saved", { icon: "check" })}>Save changes</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Root ---------------- */

export default function AtelierWeb() {
  const [page, setPage] = useState<Page>({ name: "home" });
  const [bag, setBag] = useState(false);
  const [search, setSearch] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const key = JSON.stringify(page);
  const minimal = page.name === "checkout";
  return (
    <div className="atelier at-web">
      {minimal ? (
        <header className="at-header minimal">
          <button className="at-logo" onClick={() => go({ name: "home" })}>ATELIER</button>
          <span className="at-secure"><Icon name="lock" size={15} /> Secure checkout</span>
        </header>
      ) : (
        <Header go={go} page={page} openBag={() => setBag(true)} openSearch={() => setSearch(true)} />
      )}
      <AnimatePresence mode="wait">
        <motion.main key={key} className="at-page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}>
          {page.name === "home" && <Home go={go} quick={setQuick} />}
          {page.name === "shop" && <Shop cat={page.cat} q={page.q} go={go} quick={setQuick} />}
          {page.name === "product" && <ProductPage id={page.id} go={go} quick={setQuick} />}
          {page.name === "checkout" && <Checkout go={go} />}
          {page.name === "confirmation" && <Confirmation id={page.id} go={go} />}
          {page.name === "account" && <Account tab={page.tab} order={page.order} go={go} quick={setQuick} />}
        </motion.main>
      </AnimatePresence>
      {!minimal && (
        <footer className="at-footer">
          <div className="at-footer-big">ATELIER</div>
          <div className="at-footer-cols">
            <form onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="at-news">Letters from the studio — once a month.</label>
              <div><input id="at-news" placeholder="Email address" type="email" /><button className="at-btn light">Subscribe</button></div>
            </form>
            <nav aria-label="Footer">
              <button onClick={() => go({ name: "shop" })}>Shop</button>
              <button onClick={() => go({ name: "account", tab: "orders" })}>Orders & returns</button>
              <button onClick={() => go({ name: "account", tab: "wishlist" })}>Wishlist</button>
            </nav>
            <p>Concept by Sheikh Robin Emon · All transactions simulated</p>
          </div>
        </footer>
      )}
      <Bag open={bag} onClose={() => setBag(false)} go={go} />
      <Search open={search} onClose={() => setSearch(false)} go={go} />
      <QuickView p={quick} onClose={() => setQuick(null)} go={go} />
    </div>
  );
}
