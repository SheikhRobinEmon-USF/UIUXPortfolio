import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { type Project, asset, projectArtwork } from "../../lib/projects";
import { useLocal, money, today } from "./demo-state";
type Item = {
  id: string;
  name: string;
  cat: string;
  price: number;
  desc: string;
  art: string;
};
const catalogs: Record<string, Item[]> = {
  ecommerce: [
    {
      id: "a",
      name: "Forma chair",
      cat: "Living",
      price: 249,
      desc: "Sculpted ash, soft curves, timeless comfort.",
      art: "chair",
    },
    {
      id: "b",
      name: "Terracotta vessel",
      cat: "Objects",
      price: 68,
      desc: "Hand-finished clay with a tactile matte surface.",
      art: "vase",
    },
    {
      id: "c",
      name: "Everyday carry",
      cat: "Accessories",
      price: 89,
      desc: "A structured canvas tote for wherever the day goes.",
      art: "bag",
    },
    {
      id: "d",
      name: "Luna table lamp",
      cat: "Living",
      price: 129,
      desc: "A warm pool of light for your favorite corner.",
      art: "lamp",
    },
  ],
  food: [
    {
      id: "a",
      name: "The Green Table",
      cat: "Bowls",
      price: 14,
      desc: "Harvest bowl · quinoa, greens, roasted squash · 20 min",
      art: "bowl",
    },
    {
      id: "b",
      name: "Dough & Co.",
      cat: "Pizza",
      price: 18,
      desc: "Margherita · basil, mozzarella, tomato · 30 min",
      art: "pizza",
    },
    {
      id: "c",
      name: "Little Seoul",
      cat: "Asian",
      price: 16,
      desc: "Sesame rice bowl · 25 min",
      art: "rice",
    },
    {
      id: "d",
      name: "Good Buns",
      cat: "Burgers",
      price: 13,
      desc: "House burger · 15 min",
      art: "burger",
    },
  ],
  stays: [
    {
      id: "a",
      name: "Juniper Hideaway",
      cat: "Asheville",
      price: 154,
      desc: "Woodland cabin · 2 guests · quiet retreat",
      art: "cabin",
    },
    {
      id: "b",
      name: "The Sand House",
      cat: "Tampa",
      price: 189,
      desc: "Coastal cottage · 4 guests · beach access",
      art: "house",
    },
    {
      id: "c",
      name: "Stillwater Loft",
      cat: "Austin",
      price: 132,
      desc: "City studio · 2 guests · lakeside views",
      art: "loft",
    },
    {
      id: "d",
      name: "Cypress Retreat",
      cat: "Tampa",
      price: 215,
      desc: "Garden villa · 4 guests · private patio",
      art: "villa",
    },
  ],
  streaming: [
    {
      id: "a",
      name: "The Quiet Earth",
      cat: "Documentary",
      price: 0,
      desc: "A meditative journey through landscapes. Original demo footage.",
      art: "earth",
    },
    {
      id: "b",
      name: "After the Rain",
      cat: "Drama",
      price: 0,
      desc: "An atmospheric story of renewal.",
      art: "rain",
    },
    {
      id: "c",
      name: "In Orbit",
      cat: "Sci-fi",
      price: 0,
      desc: "A visual exploration of distant worlds.",
      art: "orbit",
    },
    {
      id: "d",
      name: "Blue Hour",
      cat: "Documentary",
      price: 0,
      desc: "A study of the stillness between day and night.",
      art: "blue",
    },
  ],
};
type Cart = {
  id: string;
  name: string;
  price: number;
  qty: number;
  option: string;
};
type Order = {
  id: string;
  items: Cart[];
  total: number;
  date: string;
  address?: string;
  instructions?: string;
};
const menuItems: Record<
  string,
  { name: string; price: number; description: string }[]
> = {
  a: [
    {
      name: "Harvest bowl",
      price: 14,
      description: "Quinoa, roasted squash and tahini",
    },
    {
      name: "Lemon lentil bowl",
      price: 12,
      description: "Herbed lentils and preserved lemon",
    },
  ],
  b: [
    {
      name: "Margherita",
      price: 18,
      description: "Tomato, mozzarella and basil",
    },
    {
      name: "Mushroom pie",
      price: 21,
      description: "Roasted mushrooms and fontina",
    },
  ],
  c: [
    {
      name: "Sesame rice bowl",
      price: 16,
      description: "Cucumber, sesame and kimchi",
    },
    {
      name: "Miso noodles",
      price: 17,
      description: "Wheat noodles and roasted greens",
    },
  ],
  d: [
    {
      name: "House burger",
      price: 13,
      description: "Smash patty, pickle and house sauce",
    },
    {
      name: "Crispy mushroom burger",
      price: 15,
      description: "Oyster mushroom and cabbage slaw",
    },
  ],
};
const photos: Record<string, string> = {
  chair: "chair.webp",
  vase: "vase.webp",
  bag: "bag.webp",
  lamp: "lamp.webp",
  bowl: "bowl.webp",
  pizza: "pizza.webp",
  rice: "bowl.webp",
  burger: "food.webp",
  cabin: "stays.webp",
  house: "villa.webp",
  loft: "loft.webp",
  villa: "villa.webp",
  earth: "stays.webp",
  rain: "loft.webp",
  orbit: "streaming.webp",
  blue: "health.webp",
};
const media: Record<string, string> = {
  a: "earth",
  b: "rain",
  c: "orbit",
  d: "blue",
};
const episodes = ["Opening", "Field notes", "Afterlight"];
const day = 86_400_000;
const capacity = (item: Item) =>
  Number(item.desc.match(/(\d+) guests/)?.[1] || 2);

export default function Catalog({
  p,
  screen,
  go,
  notify,
}: {
  p: Project;
  screen: string;
  go: (s: string) => void;
  notify: (s: string) => void;
}) {
  const k = "sre:" + p.slug + ":";
  const items = catalogs[p.slug];
  const food = p.slug === "food",
    stay = p.slug === "stays",
    stream = p.slug === "streaming";
  const [saved, setSaved] = useLocal<string[]>(k + "saved", []);
  const [cart, setCart] = useLocal<Cart[]>(k + "cart", []);
  const [orders, setOrders] = useLocal<Order[]>(k + "orders", []);
  const [history] = useLocal<string[]>(k + "history", []);
  const [progress] = useLocal<Record<string, number>>(k + "progress", {});
  const [profile, setProfile] = useLocal(k + "profile", "Robin");
  const [profileState, setProfileState] = useLocal<
    Record<
      string,
      { saved: string[]; history: string[]; progress: Record<string, number> }
    >
  >(k + "viewers", {});
  const viewing =
    profileState[profile] ||
    (profile === "Robin"
      ? { saved, history, progress }
      : { saved: [], history: [], progress: {} });
  const updateViewing = (patch: Partial<typeof viewing>) =>
    setProfileState((old) => ({
      ...old,
      [profile]: { ...viewing, ...old[profile], ...patch },
    }));
  const visibleSaved = stream ? viewing.saved : saved;
  const [dish, setDish] = useState(0);
  const [maxRate, setMaxRate] = useState("Any rate");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [query, Q] = useState("");
  const [genre, G] = useState("All");
  const [sort, S] = useState("Featured");
  const [selected, Sel] = useState(items[0]);
  const [variant, V] = useState("Standard");
  const [size, Z] = useState("M");
  const [photo, Photo] = useState(0);
  const [zoom, Zoom] = useState(false);
  const [map, MapMode] = useState(false);
  const [dates, D] = useState({
    start: "2026-12-01",
    end: "2026-12-03",
    guests: 2,
  });
  const [promo, P] = useState("");
  const [delivery, Delivery] = useState("Standard");
  const [track, Track] = useLocal(k + "track", 0);
  const [episode, E] = useState(0);
  const [error, ErrorMsg] = useState("");
  const [email, Email] = useState("");
  const [address, Address] = useState("");
  const [instructions, Instructions] = useState("");
  const [loading, Loading] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (screen === "Checkout" || !timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    Loading(false);
  }, [screen]);
  const selectedDish = menuItems[selected.id][dish];
  const viewingKey = `${selected.id}:${episode}`;
  const nights = Math.max(
    0,
    Math.round((Date.parse(dates.end) - Date.parse(dates.start)) / day) || 0,
  );
  const extra = variant === "Premium" || variant === "Extra topping" ? 3 : 0;
  const unit = stay
    ? selected.price * nights
    : (food ? selectedDish.price : selected.price) + extra;
  const subtotal = cart.reduce((sum, c) => sum + c.qty * c.price, 0);
  const serviceFee = stay && cart.length ? 35 : food && cart.length ? 3.49 : 0;
  const discount =
    p.slug === "ecommerce" && promo.trim().toUpperCase() === "DEMO10"
      ? subtotal * 0.1
      : 0;
  const total = Math.max(
    0,
    subtotal -
      discount +
      serviceFee +
      (!stay && !food && cart.length && delivery === "Express" ? 5 : 0),
  );
  function toggle(id: string) {
    const next = visibleSaved.includes(id)
      ? visibleSaved.filter((item) => item !== id)
      : [...visibleSaved, id];
    if (stream) updateViewing({ saved: next });
    else setSaved(next);
  }
  function open(item: Item, snapshot = true) {
    const show = () => {
      Sel(item);
      V("Standard");
      Z("M");
      E(0);
      setDish(0);
      Photo(0);
      Zoom(false);
      ErrorMsg("");
      go(food ? "Menu" : "Detail");
    };
    if (
      snapshot &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.startViewTransition
    ) {
      document.startViewTransition(() => flushSync(show));
    } else show();
  }
  function chooseProperty(item: Item, focusCard = false) {
    Sel(item);
    if (focusCard)
      cardRefs.current[item.id]
        ?.querySelector<HTMLButtonElement>(".plain-title")
        ?.focus({ preventScroll: true });
  }
  function changeDates(
    key: "start" | "end" | "guests",
    value: string | number,
  ) {
    D((old) => ({ ...old, [key]: value }));
    ErrorMsg("");
  }
  const tripFields = (limit = 4) => (
    <div className="form-grid">
      <label>
        Check-in
        <input
          type="date"
          value={dates.start}
          onChange={(event) => changeDates("start", event.target.value)}
        />
      </label>
      <label>
        Check-out
        <input
          type="date"
          min={dates.start}
          value={dates.end}
          onChange={(event) => changeDates("end", event.target.value)}
        />
      </label>
      <label>
        Guests
        <select
          value={dates.guests}
          onChange={(event) =>
            changeDates("guests", Number(event.target.value))
          }
        >
          {Array.from({ length: limit }, (_, index) => index + 1).map(
            (count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ),
          )}
        </select>
      </label>
    </div>
  );
  const add = () => {
    if (
      stay &&
      (nights < 1 || nights > 28 || dates.guests > capacity(selected))
    ) {
      ErrorMsg(
        nights < 1
          ? "Check-out must be after check-in."
          : nights > 28
            ? "Choose a stay of 28 nights or fewer."
            : "Choose fewer guests for this stay.",
      );
      return;
    }
    const option = stay
      ? `${dates.start} to ${dates.end} · ${dates.guests} guests`
      : food
        ? variant
        : `${variant} · Size ${size}`;
    const id = selected.id + (food ? selectedDish.name : "") + option;
    const name = food ? selectedDish.name : selected.name;
    if (stay) {
      setCart([{ id, name, price: unit, qty: 1, option }]);
      go("Checkout");
      return;
    }
    setCart((old) =>
      old.some((c) => c.id === id)
        ? old.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
        : [...old, { id, name, price: unit, qty: 1, option }],
    );
    go(stay ? "Checkout" : food ? "Cart" : "Bag");
    notify("Added to your selection.");
  };
  const qty = (id: string, n: number) =>
    setCart((old) =>
      old
        .map((c) => (c.id === id ? { ...c, qty: c.qty + n } : c))
        .filter((c) => c.qty > 0),
    );
  const purchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (timer.current) return;
    if (!cart.length || !email.includes("@") || !address.trim()) {
      ErrorMsg("Enter a valid email, address and at least one item.");
      return;
    }
    Loading(true);
    ErrorMsg("");
    const order = {
      id: "DEMO-" + Date.now().toString().slice(-6),
      items: cart,
      total,
      date: today,
      address: food ? address : undefined,
      instructions: food ? instructions.trim() : undefined,
    };
    timer.current = setTimeout(() => {
      timer.current = null;
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      Track(0);
      Loading(false);
      go("Confirmation");
      notify("Simulation complete. No payment was processed.");
    }, 450);
  };
  const art = (item: Item, detail = false) => {
    const main = photos[item.art];
    const alternate =
      p.slug === "ecommerce" && item.id === "a"
        ? "chair-dark.webp"
        : `${item.art}.svg`;
    const source =
      detail && (photo === 1 || variant === "Premium") ? alternate : main;
    return (
      <div
        className={`item-art art-${item.art}`}
        data-image={detail ? photo : 0}
        style={{
          viewTransitionName:
            detail || selected.id === item.id ? "prototype-art" : undefined,
        }}
      >
        <img
          key={source}
          src={asset(source)}
          alt={detail ? item.name : ""}
          loading={detail ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  };
  const card = (item: Item) => {
    const i = item;
    return (
      <article
        className="product-card"
        key={i.id}
        ref={(node) => {
          cardRefs.current[i.id] = node;
        }}
        data-focused={stay && map && selected.id === i.id}
      >
        <button
          className="art-button"
          aria-label={`Open ${i.name}`}
          onClick={() => open(i)}
        >
          {art(i)}
        </button>
        <div className="product-info">
          <button className="plain-title" onClick={() => open(i)}>
            {i.name}
          </button>
          <button
            aria-label={
              (visibleSaved.includes(i.id) ? "Unsave " : "Save ") + i.name
            }
            className="heart"
            onClick={() => toggle(i.id)}
          >
            {visibleSaved.includes(i.id) ? "♥" : "♡"}
          </button>
          <p>{i.desc}</p>
          {stay && map && (
            <button
              className="map-show"
              aria-pressed={selected.id === i.id}
              onClick={() => chooseProperty(i)}
            >
              Show on map
            </button>
          )}
          {!stream && (
            <strong>
              {money(i.price)}
              {stay ? " / night" : ""}
            </strong>
          )}
        </div>
      </article>
    );
  };
  const filtered = items
    .filter(
      (i) =>
        (genre === "All" || i.cat === genre) &&
        (!stay ||
          (dates.guests <= capacity(i) &&
            (maxRate === "Any rate" || i.price <= Number(maxRate)))) &&
        `${i.name} ${i.cat} ${i.desc}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "Price: low to high"
        ? a.price - b.price
        : sort === "Price: high to low"
          ? b.price - a.price
          : sort === "Delivery time"
            ? parseInt(a.desc.match(/\d+ min/)?.[0] || "0") -
              parseInt(b.desc.match(/\d+ min/)?.[0] || "0")
            : 0,
    );
  const empty = (s: string) => (
    <div className="empty">
      <h2>{s}</h2>
      <p>Nothing here yet. Explore the collection to get started.</p>
      <button
        className="action"
        onClick={() => {
          Q("");
          G("All");
          setMaxRate("Any rate");
          go(stream ? "Home" : "Discover");
        }}
      >
        Explore collection
      </button>
    </div>
  );
  if (screen === "Menu")
    return (
      <section className="restaurant-menu">
        <button className="back" onClick={() => go("Discover")}>
          Back to restaurants
        </button>
        <div className="catalog-hero">
          <div>
            <span className="kicker">{selected.cat} · Local restaurant</span>
            <h1>{selected.name}</h1>
            <p>{selected.desc.split("·").at(-1)?.trim()} estimated delivery</p>
          </div>
          <img src={asset(photos[selected.art])} alt="" />
        </div>
        <h2>What sounds good?</h2>
        {menuItems[selected.id].map((item, index) => (
          <article className="cart-row" key={item.name}>
            <div>
              <b>{item.name}</b>
              <p>{item.description}</p>
            </div>
            <b>{money(item.price)}</b>
            <button
              className="action"
              onClick={() => {
                setDish(index);
                V("Standard");
                go("Detail");
              }}
            >
              Customize {item.name}
            </button>
          </article>
        ))}
      </section>
    );
  if (screen === "Detail")
    return (
      <section className="detail">
        <button
          className="back"
          onClick={() => go(stream ? "Browse" : food ? "Menu" : "Discover")}
        >
          {food ? "Back to menu" : "Back to discovery"}
        </button>
        <div className="detail-grid">
          <div>
            <button
              className={"art-button zoom " + (zoom ? "zoomed" : "")}
              onClick={() => Zoom(!zoom)}
              aria-label="Zoom image"
            >
              {art(selected, true)}
            </button>
            <div className="chips">
              {[0, 1, 2].map((n) => (
                <button
                  key={n}
                  aria-pressed={photo === n}
                  onClick={() => Photo(n)}
                >
                  {["Photo", "Alternate", "Close-up"][n]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <small className="kicker">{selected.cat}</small>
            <h1>{food ? selectedDish.name : selected.name}</h1>
            <p>{food ? selectedDish.description : selected.desc}</p>
            {stream ? (
              <>
                <p>Original demo • 2026 • All ages</p>
                <label>
                  Episode
                  <select
                    value={episode}
                    onChange={(e) => E(Number(e.target.value))}
                  >
                    {episodes.map((name, index) => (
                      <option key={name} value={index}>
                        {index + 1}. {name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="action"
                  onClick={() => {
                    updateViewing({
                      history: [
                        selected.id,
                        ...viewing.history.filter((id) => id !== selected.id),
                      ],
                    });
                    go("Player");
                  }}
                >
                  {viewing.progress[viewingKey] > 0
                    ? "Resume sample"
                    : "▶ Play sample"}
                </button>
              </>
            ) : (
              <>
                <h2>
                  {money(unit)} {stay && `/ ${nights} nights`}
                </h2>
                {stay ? (
                  <>
                    {tripFields(Math.max(capacity(selected), dates.guests))}
                    <p>
                      {money(selected.price)} per night · up to{" "}
                      {capacity(selected)} guests
                    </p>
                  </>
                ) : (
                  <>
                    <label>
                      {food ? "Customize your meal" : "Material"}
                      <select
                        value={variant}
                        onChange={(e) => V(e.target.value)}
                      >
                        {(food
                          ? ["Standard", "Extra topping", "No sauce"]
                          : ["Standard", "Premium", "Natural"]
                        ).map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    {!food && (
                      <label>
                        Size
                        <select
                          value={size}
                          onChange={(e) => Z(e.target.value)}
                        >
                          {["S", "M", "L"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </>
                )}
                <button className="action" onClick={add}>
                  {stay
                    ? "Reserve this stay"
                    : food
                      ? "Add to cart"
                      : "Add to bag"}
                </button>
              </>
            )}
            <button className="outline" onClick={() => toggle(selected.id)}>
              {visibleSaved.includes(selected.id)
                ? "♥ Saved"
                : "♡ Save for later"}
            </button>
            <p role="alert">{error}</p>
          </div>
        </div>
      </section>
    );
  if (screen === "Player")
    return (
      <section>
        <button className="back" onClick={() => go("Detail")}>
          ← Title details
        </button>
        <h1>
          {selected.name} / {episodes[episode]}
        </h1>
        <video
          key={viewingKey}
          controls
          playsInline
          preload="metadata"
          src={asset(`${media[selected.id]}-${episode}.mp4`)}
          poster={asset(photos[selected.art])}
          onLoadedMetadata={(event) => {
            const element = event.currentTarget;
            const time = viewing.progress[viewingKey] || 0;
            if (time < element.duration - 0.5) element.currentTime = time;
          }}
          onPause={(event) =>
            updateViewing({
              progress: {
                ...viewing.progress,
                [viewingKey]: event.currentTarget.currentTime,
              },
            })
          }
          onSeeked={(event) =>
            updateViewing({
              progress: {
                ...viewing.progress,
                [viewingKey]: event.currentTarget.currentTime,
              },
            })
          }
          onTimeUpdate={(event) => {
            const time = event.currentTarget.currentTime;
            if (Math.abs(time - (viewing.progress[viewingKey] || 0)) >= 1) {
              updateViewing({
                progress: { ...viewing.progress, [viewingKey]: time },
              });
            }
          }}
          onEnded={() =>
            updateViewing({
              progress: { ...viewing.progress, [viewingKey]: 0 },
            })
          }
        >
          <track
            kind="captions"
            label="English"
            srcLang="en"
            src={asset(`${media[selected.id]}-${episode}.vtt`)}
            default
          />
        </video>
        <label>
          Episode
          <select
            value={episode}
            onChange={(event) => E(Number(event.target.value))}
          >
            {episodes.map((name, index) => (
              <option key={name} value={index}>
                {index + 1}. {name}
              </option>
            ))}
          </select>
        </label>
        <p>
          Original visual studies with optional English descriptive captions.
        </p>
      </section>
    );
  if (
    ["Wishlist", "Saved", "Watchlist", "History", "Continue watching"].includes(
      screen,
    )
  ) {
    const ids =
      screen === "History"
        ? viewing.history
        : screen === "Continue watching"
          ? items
              .filter((item) =>
                episodes.some(
                  (_, index) =>
                    (viewing.progress[`${item.id}:${index}`] ||
                      (index === 0 && viewing.progress[item.id]) ||
                      0) > 0,
                ),
              )
              .map((item) => item.id)
          : visibleSaved;
    return (
      <section>
        <h1>{screen}</h1>
        {ids.length ? (
          <div className="product-grid">
            {items.filter((i) => ids.includes(i.id)).map(card)}
          </div>
        ) : (
          empty("Your collection is empty")
        )}
      </section>
    );
  }
  if (screen === "Profiles")
    return (
      <section>
        <h1>Who's watching?</h1>
        {["Robin", "Guest", "Family"].map((x) => (
          <button
            className="outline"
            key={x}
            aria-pressed={profile === x}
            onClick={() => {
              setProfile(x);
              notify("Profile selected: " + x);
              go("Home");
            }}
          >
            {x}
          </button>
        ))}
      </section>
    );
  if (["Bag", "Cart", "Checkout"].includes(screen))
    return (
      <section>
        <h1>{screen}</h1>
        {!cart.length ? (
          empty("Your cart is empty")
        ) : (
          <div className="checkout-grid">
            <div>
              {cart.map((c) => (
                <article className="cart-row" key={c.id}>
                  <div>
                    <strong>{c.name}</strong>
                    <p>{c.option}</p>
                  </div>
                  {!stay && (
                    <div>
                      <button
                        onClick={() => qty(c.id, -1)}
                        aria-label={"Decrease " + c.name}
                      >
                        −
                      </button>{" "}
                      {c.qty}{" "}
                      <button
                        aria-label={"Increase " + c.name}
                        onClick={() => qty(c.id, 1)}
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          setCart((old) =>
                            old.filter((item) => item.id !== c.id),
                          )
                        }
                        aria-label={`Remove ${c.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <b>{money(c.price * c.qty)}</b>
                </article>
              ))}
            </div>
            <aside className="panel">
              <h2>Summary</h2>
              <p>
                Subtotal <b>{money(subtotal)}</b>
              </p>
              {stay || food ? (
                <p>
                  {stay ? "One-time cleaning fee" : "Delivery fee"}{" "}
                  <b>{money(serviceFee)}</b>
                </p>
              ) : (
                <>
                  <label>
                    Promo code (DEMO10)
                    <input
                      value={promo}
                      onChange={(event) => P(event.target.value)}
                    />
                  </label>
                  {!!promo.trim() && (
                    <p role="status">
                      {discount
                        ? `Discount applied: ${money(discount)}`
                        : "This promo code does not apply."}
                    </p>
                  )}
                  <label>
                    Delivery
                    <select
                      value={delivery}
                      onChange={(event) => Delivery(event.target.value)}
                    >
                      <option>Standard</option>
                      <option>Express</option>
                    </select>
                  </label>
                  {delivery === "Express" && (
                    <p>
                      Express delivery <b>$5.00</b>
                    </p>
                  )}
                </>
              )}
              <h2>Total {money(total)}</h2>
              {screen !== "Checkout" ? (
                <button className="action" onClick={() => go("Checkout")}>
                  Continue to checkout
                </button>
              ) : (
                <form onSubmit={purchase}>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => Email(e.target.value)}
                    />
                  </label>
                  {food ? (
                    <label>
                      Demo delivery address
                      <select
                        required
                        value={address}
                        onChange={(event) => Address(event.target.value)}
                      >
                        <option value="">Choose a sample address</option>
                        <option>120 Garden Lane</option>
                        <option>18 Market Avenue</option>
                      </select>
                    </label>
                  ) : (
                    <label>
                      {stay ? "Guest name" : "Demo delivery address"}
                      <input
                        required
                        value={address}
                        onChange={(event) => Address(event.target.value)}
                      />
                    </label>
                  )}
                  {food && (
                    <label>
                      Delivery instructions
                      <input
                        value={instructions}
                        onChange={(e) => Instructions(e.target.value)}
                      />
                    </label>
                  )}
                  <button className="action" disabled={loading}>
                    {loading
                      ? "Processing…"
                      : stay
                        ? "Confirm demo reservation"
                        : "Confirm demo order"}
                  </button>
                  <p role="alert">{error}</p>
                </form>
              )}
            </aside>
          </div>
        )}
      </section>
    );
  if (screen === "Confirmation")
    return (
      <section className="empty">
        <span className="success">✓</span>
        <h1>{stay ? "You’re going places." : "You’re all set!"}</h1>
        <p>
          {orders[0]?.id} · {money(orders[0]?.total || 0)} · Simulation only
        </p>
        <button
          className="action"
          onClick={() => go(food ? "Tracking" : stay ? "Trips" : "Orders")}
        >
          {food ? "Track your order" : stay ? "View trip" : "View order"}
        </button>
      </section>
    );
  if (screen === "Tracking")
    return (
      <section>
        <h1>On its way.</h1>
        {!orders.length ? (
          empty("No active orders")
        ) : (
          <>
            <p>Simulated status · {orders[0].id}</p>
            {orders[0].address && (
              <p>
                Deliver to {orders[0].address}
                {orders[0].instructions && ` · ${orders[0].instructions}`}
              </p>
            )}
            <div className="timeline">
              {["Confirmed", "Preparing", "Out for delivery", "Delivered"].map(
                (t, i) => (
                  <div key={t} className={i <= track ? "done" : ""}>
                    <span>{i <= track ? "✓" : i + 1}</span>
                    {t}
                  </div>
                ),
              )}
            </div>
            <button
              className="action"
              disabled={track === 3}
              onClick={() => Track((t) => Math.min(3, t + 1))}
            >
              Next simulated event
            </button>
          </>
        )}
      </section>
    );
  if (screen === "Orders" || screen === "Trips")
    return (
      <section>
        <h1>{screen}</h1>
        {orders.length
          ? orders.map((o) => (
              <article className="cart-row" key={o.id}>
                <div>
                  <b>{o.id}</b>
                  <p>
                    {o.items.map((i) => `${i.name} · ${i.option}`).join(", ")}
                  </p>
                  <p>{o.date}</p>
                </div>
                <b>{money(o.total)}</b>
                {food && (
                  <button
                    onClick={() => {
                      setCart(o.items);
                      go("Cart");
                    }}
                  >
                    Reorder
                  </button>
                )}
                {stay && (
                  <button
                    onClick={() =>
                      setOrders((s) => s.filter((x) => x.id !== o.id))
                    }
                  >
                    Cancel demo trip
                  </button>
                )}
              </article>
            ))
          : empty("No completed orders")}
      </section>
    );
  return (
    <section>
      {["Home", "Discover"].includes(screen) && (
        <div className="catalog-hero">
          <div>
            <span className="kicker">
              {stream
                ? "CURATED FOR " + profile.toUpperCase()
                : food
                  ? "YOUR NEIGHBORHOOD, DELIVERED"
                  : stay
                    ? "FIND YOUR NEXT ESCAPE"
                    : "THE EVERYDAY EDIT · 01"}
            </span>
            <h1>{p.line}</h1>
            <p>
              {stream
                ? "A small, considered catalog of original short visual studies."
                : food
                  ? "Order from a handful of neighborhood kitchens."
                  : stay
                    ? "Find cabins, lofts and hideaways worth slowing down for."
                    : "A considered collection of furniture and everyday objects."}
            </p>
            <button className="action" onClick={() => open(items[0], false)}>
              {stream
                ? "Explore featured title"
                : stay
                  ? "Explore this stay"
                  : food
                    ? "Discover the menu"
                    : "Shop the collection"}{" "}
            </button>
          </div>
          <img
            {...projectArtwork(p.slug)}
            sizes="(max-width: 800px) 90vw, 52vw"
            alt=""
            fetchPriority="high"
          />
        </div>
      )}
      <div className="section-heading">
        <h2>
          {stream
            ? "Explore the collection"
            : food
              ? "Restaurants near you"
              : stay
                ? "Handpicked stays"
                : "The considered collection"}
        </h2>
        <span>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
      </div>
      {stay && tripFields()}
      <div className="filters">
        <label>
          Search
          <input
            placeholder={
              stay ? "Destination" : stream ? "Titles" : "Search collection"
            }
            value={query}
            onChange={(e) => Q(e.target.value)}
          />
        </label>
        <label>
          Category
          <select value={genre} onChange={(e) => G(e.target.value)}>
            {["All", ...new Set(items.map((i) => i.cat))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {!stream && (
          <label>
            Sort
            <select value={sort} onChange={(e) => S(e.target.value)}>
              <option>Featured</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
              {food && <option>Delivery time</option>}
            </select>
          </label>
        )}
        {stay && (
          <>
            <label>
              Nightly price
              <select
                value={maxRate}
                onChange={(event) => setMaxRate(event.target.value)}
              >
                <option>Any rate</option>
                <option value="150">Up to $150</option>
                <option value="200">Up to $200</option>
              </select>
            </label>
            <button
              className="outline"
              aria-pressed={map}
              onClick={() => MapMode(!map)}
            >
              {map ? "List only" : "Map + list"}
            </button>
          </>
        )}
      </div>
      <div className={stay && map ? "map-results" : undefined}>
        {stay && map && filtered.length > 0 && (
          <div className="map" aria-label="Illustrative property map">
            {filtered.map((i, n) => (
              <button
                style={{
                  left: `${15 + n * 20}%`,
                  top: `${20 + (n % 2) * 45}%`,
                }}
                key={i.id}
                aria-pressed={selected.id === i.id}
                aria-label={`${i.name}, ${money(i.price)} per night`}
                onClick={() => chooseProperty(i, true)}
              >
                {money(i.price)}
              </button>
            ))}
            <p>
              Illustrative map
              {filtered.some((item) => item.id === selected.id) && (
                <>
                  {" "}
                  · {selected.name}{" "}
                  <button onClick={() => open(selected)}>View stay</button>
                </>
              )}
            </p>
          </div>
        )}
        {!filtered.length ? (
          empty("No matches")
        ) : (
          <div className={stream ? "product-grid film-shelf" : "product-grid"}>
            {filtered.map(card)}
          </div>
        )}
      </div>
      {stream && screen === "Home" && (
        <>
          <h2>Documentaries</h2>
          <div className="product-grid film-shelf">
            {items
              .filter((item) => item.cat === "Documentary")
              .map((item) => (
                <article className="product-card" key={item.id}>
                  <button
                    className="art-button"
                    onClick={() => open(item, false)}
                  >
                    <img src={asset(photos[item.art])} alt="" loading="lazy" />
                    <span>{item.name}</span>
                  </button>
                </article>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
