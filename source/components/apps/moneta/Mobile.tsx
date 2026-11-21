"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { LineChart, Progress } from "../../kit/charts";
import { CountUp, Screen, Sheet, Toggle, useToast, ease, spring, Empty } from "../../kit/ui";
import { useNav, type Nav } from "../../kit/store";
import { C, TODAY, addDays, cats, contacts, dLabel, usd, useMoneta, type Txn } from "./data";
import { AmountDisplay, CardFace, CatIcon, ContactAv, FaceId, Keypad, TxnRow, groupByDate } from "./shared";

function HomeTab({ nav, openTxn }: { nav: Nav; openTxn: (t: Txn) => void }) {
  const s = useMoneta();
  const toast = useToast();
  const hist = s.history(30);
  const [at, setAt] = useState<number | null>(null);
  const change = hist[hist.length - 1] - hist[0];
  return (
    <div className="ph-pad-top mnm-home">
      <div className="mnm-top">
        <span className="mnm-me">TK</span>
        <div className="mnm-top-r">
          <button className="kit-icon-btn" onClick={() => s.setHidden(!s.hidden)} aria-label={s.hidden ? "Show balances" : "Hide balances"}><Icon name={s.hidden ? "eyeoff" : "eye"} size={18} /></button>
          <button className="kit-icon-btn" aria-label="Notifications"><Icon name="bell" size={18} /></button>
        </div>
      </div>
      <div className="mnm-bal">
        <small>{at != null ? dLabel(addDays(TODAY, at - 29)) : "Net worth"}</small>
        <div className="mnm-bal-v">{s.hidden ? "••••••" : <CountUp value={at != null ? hist[at] : s.netWorth} format={(n) => usd(n)} />}</div>
        <span className={`mn-delta ${change >= 0 ? "up" : "down"}`}><Icon name={change >= 0 ? "out" : "in"} size={13} /> {usd(Math.abs(change), false)} this month</span>
      </div>
      <div className="mnm-chart"><LineChart data={hist} color="#7c97ff" height={110} onScrub={setAt} label="Net worth, 30 days" format={(n) => usd(n, false)} /></div>
      <div className="mnm-actions">
        {[["send", "Send", () => nav.tab("pay")], ["in", "Request", () => toast("Request link copied", { icon: "share" })], ["repeat", "Transfer", () => nav.push("transfer")], ["plus", "Add", () => toast("Add money via bank (simulated)", { icon: "plus" })]].map(([i, l, f]) => (
          <motion.button key={l as string} onClick={f as () => void} whileTap={{ scale: 0.9 }}>
            <span><Icon name={i as string} size={20} /></span>
            {l as string}
          </motion.button>
        ))}
      </div>
      <div className="ph-hscroll mnm-accts">
        {s.accounts.map((a, i) => (
          <motion.div key={a.id} className="mnm-acct" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <span className="mn-acct-dot" style={{ background: a.color }} />
            <small>{a.kind}</small>
            <strong>{a.name}</strong>
            <b className={a.balance < 0 ? "neg" : ""}>{s.hidden ? "•••" : usd(a.balance)}</b>
          </motion.div>
        ))}
      </div>
      <div className="mnm-insight"><Icon name="sparkle" size={16} /> You're {usd(54, false)} under your dining budget — want to move it to Lisbon?<button onClick={() => { s.contribute("g1", 54); toast("$54 moved to Lisbon trip", { icon: "target" }); }}>Move</button></div>
      <div className="ph-section-title"><h2>Recent</h2><button onClick={() => nav.tab("activity")}>See all</button></div>
      <div className="mnm-list">{s.txns.slice(0, 6).map((t) => <TxnRow key={t.id} t={t} onClick={() => openTxn(t)} hidden={s.hidden} />)}</div>
    </div>
  );
}

function ActivityTab({ openTxn }: { openTxn: (t: Txn) => void }) {
  const s = useMoneta();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const list = s.txns.filter((t) => (cat === "all" || t.cat === cat) && (!q || t.merchant.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="ph-pad-top">
      <h1 className="mnm-title">Activity</h1>
      <div className="mnm-search"><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search transactions" /></div>
      <div className="ph-chips mnm-chips">
        {["all", "dining", "groceries", "transport", "shopping", "subs", "income"].map((c) => <button key={c} className="ph-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c === "all" ? "All" : C(c).name}</button>)}
      </div>
      {groupByDate(list.slice(0, 60)).map((g) => (
        <div key={g.date}>
          <div className="mn-day"><span>{g.label}</span><span>{usd(g.items.reduce((a, t) => a + t.amount, 0))}</span></div>
          <div className="mnm-list">{g.items.map((t) => <TxnRow key={t.id} t={t} onClick={() => openTxn(t)} hidden={s.hidden} />)}</div>
        </div>
      ))}
      {!list.length && <Empty icon="search" title="Nothing found" />}
    </div>
  );
}

function PayTab({ nav, internal = false }: { nav: Nav; internal?: boolean }) {
  const s = useMoneta();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const [memo, setMemo] = useState("");
  const from = s.accounts.find((a) => a.id === "chk")!;
  const n = Number(amount) || 0;
  const recips = internal ? s.accounts.filter((a) => a.id !== "chk" && a.kind !== "Credit").map((a) => ({ id: a.id, name: a.name })) : contacts.map((c) => ({ id: c.id, name: c.name }));
  function next() {
    if (!n || n > from.balance) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      if (n > from.balance) toast(`Only ${usd(from.balance)} available`, { icon: "info" });
      return;
    }
    setSheet(true);
  }
  if (done)
    return (
      <div className="mnm-done ph-pad-top">
        <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={spring}><Icon name="check" size={44} stroke={2.4} /></motion.span>
        <h1>{usd(n)}</h1>
        <p>{internal ? "moved to" : "sent to"} {recips.find((r) => r.id === to)?.name}</p>
        {memo && <p className="mnm-memo">“{memo}”</p>}
        <button className="mnm-btn" onClick={() => { setDone(false); setAmount(""); setTo(null); setMemo(""); if (internal) nav.back(); else nav.tab("home"); }}>Done</button>
      </div>
    );
  return (
    <div className="mnm-pay ph-pad-top">
      <div className="mnm-pay-top">
        {internal ? <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button> : <span />}
        <strong>{internal ? "Transfer" : "Pay"}</strong>
        <span />
      </div>
      <div className="ph-hscroll mnm-recips">
        {recips.map((r) => (
          <button key={r.id} aria-pressed={to === r.id} onClick={() => setTo(r.id)}>
            {internal ? <span className="mn-acct-dot big" style={{ background: s.accounts.find((a) => a.id === r.id)?.color }} /> : <ContactAv id={r.id} size={52} />}
            <small>{r.name.split(" ")[0]}</small>
          </button>
        ))}
      </div>
      <AmountDisplay value={amount} shake={shake} />
      <p className="mnm-from">From Everyday ·· {from.mask} · {s.hidden ? "•••" : usd(from.balance)}</p>
      <Keypad value={amount} onChange={setAmount} />
      <div className="mnm-pay-cta">
        <button className="mnm-btn" disabled={!to || !n} onClick={next}>{!to ? `Choose ${internal ? "an account" : "someone"}` : `Review ${n ? usd(n) : ""}`}</button>
      </div>
      <Sheet open={sheet} onClose={() => { if (!confirm) setSheet(false); }} title="Review">
        <div className="mnm-review">
          {!internal && to && <ContactAv id={to} size={64} />}
          <h3>{usd(n)}</h3>
          <p>to {recips.find((r) => r.id === to)?.name}</p>
          {!internal && <input className="mnm-memo-in" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Add a note (optional)" aria-label="Note" maxLength={40} />}
          <dl>
            <div><dt>From</dt><dd>Everyday ·· {from.mask}</dd></div>
            <div><dt>Fee</dt><dd>Free</dd></div>
            <div><dt>Arrives</dt><dd>{internal ? "Instantly" : "In minutes"}</dd></div>
          </dl>
          <AnimatePresence>{confirm && <FaceId onDone={() => { if (internal) s.move("chk", to!, n); else s.send(to!, n, "chk", memo); setConfirm(false); setSheet(false); setDone(true); }} />}</AnimatePresence>
          {!confirm && <button className="mnm-btn block" onClick={() => setConfirm(true)}><Icon name="scan" size={18} /> Confirm with Face ID</button>}
        </div>
      </Sheet>
    </div>
  );
}

function CardsTab() {
  const s = useMoneta();
  const toast = useToast();
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const c = s.cards[Math.min(i, s.cards.length - 1)];
  return (
    <div className="ph-pad-top">
      <h1 className="mnm-title">Cards</h1>
      <div className="mnm-cards" onScroll={(e) => { const k = Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth * 0.84)); if (k !== i) { setI(k); setRevealed(false); } }}>
        {s.cards.map((x, k) => (
          <div key={x.id} className="mnm-card-slot">
            <CardFace c={x} revealed={revealed && k === i} onFlip={() => k === i && setRevealed(!revealed)} small />
          </div>
        ))}
        <div className="mnm-card-slot">
          <button className="mnm-newcard" onClick={() => { s.newCard(`Virtual ${s.cards.length}`); toast("Virtual card created", { icon: "card" }); }}><Icon name="plus" size={26} /> New virtual card</button>
        </div>
      </div>
      <div className="mnm-dots">{s.cards.map((_, k) => <motion.i key={k} animate={{ width: k === i ? 18 : 6, opacity: k === i ? 1 : 0.4 }} />)}</div>
      <div className="mnm-card-actions">
        <button onClick={() => setRevealed(!revealed)} aria-pressed={revealed}><span><Icon name={revealed ? "eyeoff" : "eye"} size={20} /></span>{revealed ? "Hide" : "Details"}</button>
        <button onClick={() => { s.freeze(c.id); toast(c.frozen ? "Unfrozen" : "Frozen", { icon: "snow" }); }} aria-pressed={c.frozen}><span><Icon name="snow" size={20} /></span>{c.frozen ? "Unfreeze" : "Freeze"}</button>
        <button onClick={() => toast("Added to Apple Wallet (simulated)", { icon: "apple" })}><span><Icon name="wallet" size={20} /></span>Wallet</button>
      </div>
      <div className="mnm-panel">
        <div className="mn-ctl-row col">
          <span className="grow"><strong>Monthly limit · {usd(c.limit, false)}</strong><small>{usd(c.spent)} spent</small></span>
          <input type="range" min={100} max={10000} step={100} value={c.limit} onChange={(e) => s.cardLimit(c.id, Number(e.target.value))} aria-label="Monthly limit" className="mn-range" />
          <Progress value={c.spent / c.limit} color="#7c97ff" label="Limit used" />
        </div>
        <div className="mn-ctl-row"><Icon name="globe" /><span className="grow"><strong>Online payments</strong></span><Toggle on={!c.frozen} onChange={() => s.freeze(c.id)} label="Online payments" /></div>
      </div>
    </div>
  );
}

function PlanTab({ nav }: { nav: Nav }) {
  const s = useMoneta();
  const toast = useToast();
  const [goal, setGoal] = useState<string | null>(null);
  const [amt, setAmt] = useState("50");
  const [cancel, setCancel] = useState<string | null>(null);
  const pace = Number(TODAY.slice(8)) / 30;
  return (
    <div className="ph-pad-top">
      <h1 className="mnm-title">Plan</h1>
      <div className="ph-section-title"><h2>Goals</h2></div>
      <div className="ph-hscroll mnm-goals">
        {s.goals.map((g) => (
          <button key={g.id} className="mnm-goal" onClick={() => { setGoal(g.id); setAmt("50"); }}>
            <span className="mnm-goal-ico" style={{ background: g.color }}><Icon name={g.icon} size={18} /></span>
            <strong>{g.name}</strong>
            <small>{usd(g.saved, false)} of {usd(g.target, false)}</small>
            <Progress value={g.saved / g.target} color={g.color} label={`${g.name} progress`} />
          </button>
        ))}
      </div>
      <div className="ph-section-title"><h2>Budgets</h2></div>
      <div className="mnm-list padded">
        {s.budgets.map((b) => {
          const spent = s.spentBy(b.cat);
          const r = spent / b.limit;
          return (
            <div key={b.cat} className="mnm-budget">
              <CatIcon cat={b.cat} size={36} />
              <div className="grow">
                <div className="mnm-budget-top"><strong>{C(b.cat).name}</strong><span className={r > 1 ? "over" : ""}>{usd(Math.max(0, b.limit - spent), false)} left</span></div>
                <div className="mn-budget-bar"><Progress value={r} color={r > 1 ? "#e5484d" : r > pace + 0.08 ? "#f2994a" : C(b.cat).color} label={`${C(b.cat).name}`} /><span className="mn-pace" style={{ left: `${pace * 100}%` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ph-section-title"><h2>Subscriptions</h2></div>
      <div className="mnm-list padded">
        {s.subs.map((x) => (
          <div key={x.id} className={`mnm-sub ${x.status}`}>
            <span className="mn-sub-logo" style={{ background: x.color }}>{x.name[0]}</span>
            <div className="grow"><strong>{x.name}</strong><small>{x.status === "cancelled" ? "Cancelled" : x.used}</small></div>
            <b>{usd(x.amount)}</b>
            {x.status === "active" ? <button className="mnm-mini" onClick={() => setCancel(x.id)}>Cancel</button> : <button className="mnm-mini on" onClick={() => s.resumeSub(x.id)}>Resume</button>}
          </div>
        ))}
      </div>
      <div style={{ height: 20 }} />
      <Sheet open={!!goal} onClose={() => setGoal(null)} title={goal ? `Add to ${s.goals.find((g) => g.id === goal)!.name}` : ""}>
        <AmountDisplay value={amt} />
        <Keypad value={amt} onChange={setAmt} max={5000} />
        <button className="mnm-btn block" disabled={!Number(amt)} onClick={() => { s.contribute(goal!, Number(amt)); toast(`${usd(Number(amt), false)} saved`, { icon: "target" }); setGoal(null); }}>Add {usd(Number(amt) || 0, false)}</button>
      </Sheet>
      <Sheet open={!!cancel} onClose={() => setCancel(null)} title="Cancel subscription?">
        {cancel && (() => {
          const x = s.subs.find((y) => y.id === cancel)!;
          return (
            <div className="mnm-review">
              <span className="mn-sub-logo big" style={{ background: x.color }}>{x.name[0]}</span>
              <h3>{x.name}</h3>
              <p>Access until {new Date(x.next + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}. You'll save <b>{usd(x.cycle === "mo" ? x.amount * 12 : x.amount, false)}/yr</b>.</p>
              <button className="mnm-btn block danger" onClick={() => { s.cancelSub(x.id); setCancel(null); toast(`${x.name} cancelled`, { icon: "check" }); }}>Cancel subscription</button>
              <button className="mnm-link" onClick={() => setCancel(null)}>Keep it</button>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}

export default function MonetaMobile() {
  const s = useMoneta();
  const toast = useToast();
  const nav = useNav({ name: "home" });
  const [txn, setTxn] = useState<Txn | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  const live = txn ? s.txns.find((t) => t.id === txn.id) || txn : null;
  const tabs: [string, string, string][] = [["home", "home", "Home"], ["activity", "list", "Activity"], ["pay", "send", "Pay"], ["cards", "card", "Cards"], ["plan", "target", "Plan"]];
  return (
    <div className="moneta ph-app mnm" style={{ "--status-ink": "#fff" } as React.CSSProperties}>
      <div className="ph-scroll" ref={scroller}>
        <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir}>
          {nav.screen === "home" && <HomeTab nav={nav} openTxn={setTxn} />}
          {nav.screen === "activity" && <ActivityTab openTxn={setTxn} />}
          {nav.screen === "pay" && <PayTab nav={nav} />}
          {nav.screen === "transfer" && <PayTab nav={nav} internal />}
          {nav.screen === "cards" && <CardsTab />}
          {nav.screen === "plan" && <PlanTab nav={nav} />}
        </Screen>
      </div>
      {nav.screen !== "transfer" && (
        <nav className="ph-tabs mnm-tabs" aria-label="MONETA">
          {tabs.map(([k, i, l]) => (
            <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)} className={k === "pay" ? "mnm-paytab" : ""}>
              {k === "pay" ? <span><Icon name={i} size={22} /></span> : <Icon name={i} size={22} />}
              {l}
            </button>
          ))}
        </nav>
      )}
      <Sheet open={!!live} onClose={() => setTxn(null)} title="Transaction">
        {live && (
          <div className="mnm-txd">
            <CatIcon cat={live.cat} size={56} />
            <h3>{live.merchant}</h3>
            <div className={`mn-txd-amt ${live.amount > 0 ? "pos" : ""}`}>{usd(live.amount)}</div>
            <p className="mn-muted">{dLabel(live.date)}{live.pending ? " · Pending" : ""}</p>
            <h4>Category</h4>
            <div className="mn-catgrid compact">
              {cats.filter((c) => c.id !== "income").map((c) => (
                <button key={c.id} aria-pressed={live.cat === c.id} onClick={() => { s.recat(live.id, c.id); toast(`Moved to ${c.name}`, { icon: c.icon }); }}>
                  <CatIcon cat={c.id} size={28} />
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
            {live.amount < 0 && (
              <button className="mnm-btn ghost block" onClick={() => { s.split(live.id, live.split ? "" : "maya", live.split ? 1 : 0.5); toast(live.split ? "Split removed" : `Requested ${usd(-live.amount / 2)} from Maya`, { icon: "split" }); }}>
                <Icon name="split" size={18} /> {live.split ? "Remove split" : "Split with Maya"}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
