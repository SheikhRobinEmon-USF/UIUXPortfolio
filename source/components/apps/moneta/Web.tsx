"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Donut, LineChart, Progress, Spark } from "../../kit/charts";
import { CountUp, Drawer, Modal, Segmented, Toggle, useToast, ease, spring, Empty, Reveal } from "../../kit/ui";
import { C, TODAY, addDays, cats, contacts, dLabel, usd, useMoneta, type Sub, type Txn } from "./data";
import { AmountDisplay, CardFace, CatIcon, ContactAv, FaceId, TxnRow, groupByDate } from "./shared";

type Page = "overview" | "accounts" | "transactions" | "budgets" | "subscriptions" | "goals" | "cards";

function Money({ v, hidden, cents = true }: { v: number; hidden: boolean; cents?: boolean }) {
  return hidden ? <span className="mn-hidden">••••••</span> : <CountUp value={v} format={(n) => usd(n, cents)} />;
}

function Overview({ go, openTxn, send }: { go: (p: Page) => void; openTxn: (t: Txn) => void; send: () => void }) {
  const s = useMoneta();
  const [range, setRange] = useState<"30" | "60">("30");
  const [at, setAt] = useState<number | null>(null);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const hist = s.history(Number(range));
  const labels = hist.map((_, i) => dLabel(addDays(TODAY, i - hist.length + 1)));
  const change = hist[hist.length - 1] - hist[0];
  const spendCats = cats.filter((c) => !["income", "transfer"].includes(c.id)).map((c) => ({ c, v: s.spentBy(c.id) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const upcoming = s.subs.filter((x) => x.status === "active").sort((a, b) => (a.next < b.next ? -1 : 1)).slice(0, 4);
  return (
    <div className="mn-grid">
      <section className="mn-card mn-net span2">
        <div className="mn-net-head">
          <div>
            <small>Net worth {at != null ? `· ${labels[at]}` : ""}</small>
            <div className="mn-net-val"><Money v={at != null ? hist[at] : s.netWorth} hidden={s.hidden} /></div>
            <span className={`mn-delta ${change >= 0 ? "up" : "down"}`}>
              <Icon name={change >= 0 ? "out" : "in"} size={14} /> {usd(Math.abs(change))} ({((change / hist[0]) * 100).toFixed(1)}%) past {range} days
            </span>
          </div>
          <div className="mn-net-actions">
            <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "30", label: "1M" }, { value: "60", label: "2M" }]} />
            <button className="mn-btn" onClick={send}><Icon name="send" size={16} /> Send</button>
          </div>
        </div>
        <LineChart data={hist} labels={labels} color="#3a5ef0" height={200} onScrub={setAt} label="Net worth over time" format={(n) => usd(n, false)} />
      </section>
      <section className="mn-card">
        <header className="mn-head"><h2>Accounts</h2><button className="mn-link" onClick={() => go("accounts")}>All →</button></header>
        {s.accounts.map((a, i) => (
          <motion.button key={a.id} className="mn-acct" onClick={() => go("accounts")} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <span className="mn-acct-dot" style={{ background: a.color }} />
            <span className="grow"><strong>{a.name}</strong><small>{a.kind} ·· {a.mask}</small></span>
            <b className={a.balance < 0 ? "neg" : ""}>{s.hidden ? "•••" : usd(a.balance)}</b>
          </motion.button>
        ))}
      </section>
      <section className="mn-card">
        <header className="mn-head"><h2>Spending · November</h2><button className="mn-link" onClick={() => go("budgets")}>Budgets →</button></header>
        <div className="mn-donut-row">
          <Donut size={150} width={20} label="Spending by category" active={activeCat} onSelect={setActiveCat} segments={spendCats.map((x) => ({ value: x.v, color: x.c.color, label: x.c.name }))}>
            <small>{activeCat != null ? spendCats[activeCat].c.name : "Spent"}</small>
            <b>{s.hidden ? "•••" : usd(activeCat != null ? spendCats[activeCat].v : s.spending, false)}</b>
          </Donut>
          <ul className="mn-legend">
            {spendCats.slice(0, 6).map((x, i) => (
              <li key={x.c.id} onMouseEnter={() => setActiveCat(i)} onMouseLeave={() => setActiveCat(null)} className={activeCat === i ? "on" : ""}>
                <i style={{ background: x.c.color }} />
                <span>{x.c.name}</span>
                <b>{s.hidden ? "•••" : usd(x.v, false)}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mn-card">
        <header className="mn-head"><h2>Cash flow</h2></header>
        <div className="mn-flow">
          <div><small>In</small><b className="pos">{s.hidden ? "•••" : usd(s.income, false)}</b></div>
          <div><small>Out</small><b>{s.hidden ? "•••" : usd(s.spending, false)}</b></div>
          <div><small>Net</small><b className={s.income - s.spending < 0 ? "neg" : "pos"}>{s.hidden ? "•••" : usd(s.income - s.spending, false)}</b></div>
        </div>
        <div className="mn-flow-bar">
          <motion.i className="in" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, ease }} />
          <motion.i className="out" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (s.spending / Math.max(1, s.income)) * 100)}%` }} transition={{ duration: 1, ease, delay: 0.2 }} />
        </div>
        <div className="mn-insight"><Icon name="sparkle" size={16} /> Dining is 18% lower than October. Nice — that's {usd(54, false)} toward Lisbon.</div>
      </section>
      <section className="mn-card">
        <header className="mn-head"><h2>Upcoming</h2><button className="mn-link" onClick={() => go("subscriptions")}>Manage →</button></header>
        {upcoming.map((x) => (
          <div key={x.id} className="mn-up">
            <span className="mn-sub-logo" style={{ background: x.color }}>{x.name[0]}</span>
            <span className="grow"><strong>{x.name}</strong><small>{new Date(x.next + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small></span>
            <b>{usd(x.amount)}</b>
          </div>
        ))}
      </section>
      <section className="mn-card span2">
        <header className="mn-head"><h2>Recent activity</h2><button className="mn-link" onClick={() => go("transactions")}>All transactions →</button></header>
        <div className="mn-txns">{s.txns.slice(0, 6).map((t) => <TxnRow key={t.id} t={t} onClick={() => openTxn(t)} hidden={s.hidden} />)}</div>
      </section>
    </div>
  );
}

function Accounts({ move }: { move: () => void }) {
  const s = useMoneta();
  const groups = ["Checking", "Savings", "Credit", "Investments"] as const;
  return (
    <div className="mn-grid">
      {groups.map((g, gi) => {
        const list = s.accounts.filter((a) => a.kind === g);
        return (
          <motion.section key={g} className="mn-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.06 }}>
            <header className="mn-head"><h2>{g}</h2><b>{s.hidden ? "•••" : usd(list.reduce((a, x) => a + x.balance, 0))}</b></header>
            {list.map((a) => {
              const hist = s.txns.filter((t) => t.account === a.id).slice(0, 20).map((t) => t.amount).reverse();
              let run = a.balance;
              const series = hist.map((v) => (run -= v)).reverse();
              return (
                <div key={a.id} className="mn-acct-big">
                  <div><strong>{a.name}</strong><small>{a.bank} ·· {a.mask}</small></div>
                  <Spark data={series.length > 2 ? series : [1, 2, 1.5, 2.2]} color={a.color} width={120} height={36} />
                  <b className={a.balance < 0 ? "neg" : ""}>{s.hidden ? "•••" : usd(a.balance)}</b>
                </div>
              );
            })}
            {g === "Savings" && <p className="mn-muted small">4.20% APY · earned {usd(43.68)} this month</p>}
            {g === "Credit" && <p className="mn-muted small">Statement due Dec 4 · autopay on</p>}
          </motion.section>
        );
      })}
      <section className="mn-card span2 mn-move">
        <div><h2>Move money between accounts</h2><p className="mn-muted">Instant between Moneta accounts. No fees.</p></div>
        <button className="mn-btn" onClick={move}><Icon name="repeat" size={16} /> Transfer</button>
      </section>
    </div>
  );
}

function Transactions({ openTxn }: { openTxn: (t: Txn) => void }) {
  const s = useMoneta();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [acct, setAcct] = useState("all");
  const [range, setRange] = useState<"7" | "30" | "60">("30");
  const list = useMemo(() => s.txns.filter((t) => t.date >= addDays(TODAY, -Number(range)) && (cat === "all" || t.cat === cat) && (acct === "all" || t.account === acct) && (!q || (t.merchant + (t.note || "")).toLowerCase().includes(q.toLowerCase()))), [s.txns, q, cat, acct, range]);
  const total = list.reduce((a, t) => a + t.amount, 0);
  const groups = groupByDate(list);
  return (
    <div className="mn-card mn-tx-page">
      <div className="mn-filters">
        <div className="mn-search"><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchants or notes" aria-label="Search transactions" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={acct} onChange={(e) => setAcct(e.target.value)} aria-label="Account">
          <option value="all">All accounts</option>
          {s.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <Segmented label="Date range" value={range} onChange={setRange} options={[{ value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "60", label: "60d" }]} />
      </div>
      <div className="mn-tx-sum"><span>{list.length} transactions</span><b className={total > 0 ? "pos" : ""}>Net {usd(total)}</b></div>
      <div className="mn-tx-groups">
        {groups.map((g) => (
          <div key={g.date}>
            <div className="mn-day"><span>{g.label}</span><span>{usd(g.items.reduce((a, t) => a + t.amount, 0))}</span></div>
            {g.items.map((t) => <TxnRow key={t.id} t={t} onClick={() => openTxn(t)} hidden={s.hidden} />)}
          </div>
        ))}
        {!list.length && <Empty icon="search" title="No transactions match" text="Try a different search or date range." />}
      </div>
    </div>
  );
}

function TxnDrawer({ t, onClose }: { t: Txn | null; onClose: () => void }) {
  const s = useMoneta();
  const toast = useToast();
  const live = t ? s.txns.find((x) => x.id === t.id) || t : null;
  const [noteText, setNoteText] = useState("");
  return (
    <Drawer open={!!live} onClose={onClose} title="Transaction" className="mn-drawer" width={420}>
      {live && (
        <div className="mn-txd">
          <CatIcon cat={live.cat} size={60} />
          <h3>{live.merchant}</h3>
          <div className={`mn-txd-amt ${live.amount > 0 ? "pos" : ""}`}>{usd(live.amount)}</div>
          <p className="mn-muted">{dLabel(live.date)} · {s.accounts.find((a) => a.id === live.account)?.name}{live.pending ? " · Pending" : ""}</p>
          <h4>Category</h4>
          <div className="mn-catgrid">
            {cats.map((c) => (
              <button key={c.id} aria-pressed={live.cat === c.id} onClick={() => { s.recat(live.id, c.id); toast(`Moved to ${c.name}`, { icon: c.icon }); }}>
                <CatIcon cat={c.id} size={30} />
                {c.name}
              </button>
            ))}
          </div>
          {live.amount < 0 && (
            <>
              <h4>Split with</h4>
              <div className="mn-split-row">
                {contacts.slice(0, 4).map((c) => (
                  <button key={c.id} aria-pressed={live.split?.with === c.id} onClick={() => { if (live.split?.with === c.id) { s.split(live.id, "", 1); toast("Split removed"); } else { s.split(live.id, c.id, 0.5); toast(`Requested ${usd(-live.amount / 2)} from ${c.name.split(" ")[0]}`, { icon: "split" }); } }}>
                    <ContactAv id={c.id} size={36} />
                    {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              {live.split && <p className="mn-muted small">You'll count {usd(live.amount * live.split.share)} toward your budget.</p>}
            </>
          )}
          <h4>Note</h4>
          <form className="mn-note" onSubmit={(e) => { e.preventDefault(); s.note(live.id, noteText); setNoteText(""); toast("Note saved", { icon: "edit" }); }}>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={live.note || "Add a note"} aria-label="Note" />
            <button className="mn-btn sm" disabled={!noteText.trim()}>Save</button>
          </form>
          <button className="mn-link danger" onClick={() => toast("Dispute started (simulated)", { icon: "shield" })}>Report a problem</button>
        </div>
      )}
    </Drawer>
  );
}

function Budgets() {
  const s = useMoneta();
  const toast = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [val, setVal] = useState(0);
  const dayOfMonth = Number(TODAY.slice(8));
  const pace = dayOfMonth / 30;
  const totalLimit = s.budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = s.budgets.reduce((a, b) => a + s.spentBy(b.cat), 0);
  const unbudgeted = cats.filter((c) => !["income", "transfer"].includes(c.id) && !s.budgets.some((b) => b.cat === c.id));
  return (
    <div className="mn-grid">
      <section className="mn-card span2 mn-budget-sum">
        <div>
          <small>Left to spend in November</small>
          <div className="mn-net-val">{usd(Math.max(0, totalLimit - totalSpent), false)}</div>
          <span className="mn-muted">{usd(totalSpent, false)} of {usd(totalLimit, false)} · {30 - dayOfMonth} days left</span>
        </div>
        <div className="mn-budget-bar">
          <Progress value={totalSpent / totalLimit} color={totalSpent / totalLimit > pace ? "#f2994a" : "#3a5ef0"} label="Total budget used" />
          <span className="mn-pace" style={{ left: `${pace * 100}%` }}>Today</span>
        </div>
      </section>
      {s.budgets.map((b, i) => {
        const spent = s.spentBy(b.cat);
        const ratio = spent / b.limit;
        const status = ratio > 1 ? "over" : ratio > pace + 0.08 ? "fast" : "ok";
        return (
          <Reveal key={b.cat} delay={i * 0.04} className="mn-card mn-budget">
            <header>
              <CatIcon cat={b.cat} />
              <div className="grow"><strong>{C(b.cat).name}</strong><small className={`mn-status ${status}`}>{status === "over" ? `Over by ${usd(spent - b.limit, false)}` : status === "fast" ? "Spending faster than usual" : "On track"}</small></div>
              <button className="kit-icon-btn" aria-label={`Edit ${C(b.cat).name} budget`} onClick={() => { setEditing(b.cat); setVal(b.limit); }}><Icon name="edit" size={16} /></button>
            </header>
            <div className="mn-budget-nums"><b>{usd(spent, false)}</b><span>of {usd(b.limit, false)}</span></div>
            <div className="mn-budget-bar">
              <Progress value={ratio} color={status === "over" ? "#e5484d" : status === "fast" ? "#f2994a" : C(b.cat).color} label={`${C(b.cat).name} budget used`} />
              <span className="mn-pace" style={{ left: `${pace * 100}%` }} />
            </div>
            <AnimatePresence>
              {editing === b.cat && (
                <motion.div className="mn-edit" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <input type="range" min={20} max={1000} step={10} value={val} onChange={(e) => setVal(Number(e.target.value))} aria-label="Monthly limit" />
                  <div><b>{usd(val, false)}/mo</b><button className="mn-link" onClick={() => setEditing(null)}>Cancel</button><button className="mn-btn sm" onClick={() => { s.setLimit(b.cat, val); setEditing(null); toast(`${C(b.cat).name} budget set to ${usd(val, false)}`, { icon: "check" }); }}>Save</button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        );
      })}
      {unbudgeted.length > 0 && (
        <section className="mn-card span2">
          <h2 className="mn-h2">Add a budget</h2>
          <div className="mn-add-budget">
            {unbudgeted.map((c) => (
              <button key={c.id} onClick={() => { s.setLimit(c.id, Math.max(50, Math.round(s.spentBy(c.id) / 10) * 10 + 50)); toast(`Budget created for ${c.name}`, { icon: "plus" }); }}>
                <CatIcon cat={c.id} size={32} /> {c.name} <small>{usd(s.spentBy(c.id), false)} spent</small>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Subscriptions() {
  const s = useMoneta();
  const toast = useToast();
  const [cancel, setCancel] = useState<{ sub: Sub; step: number; reason: string } | null>(null);
  const monthly = s.subs.filter((x) => x.status === "active").reduce((a, x) => a + (x.cycle === "mo" ? x.amount : x.amount / 12), 0);
  return (
    <div className="mn-grid">
      <section className="mn-card span2 mn-budget-sum">
        <div><small>Recurring spend</small><div className="mn-net-val">{usd(monthly)}<span className="mn-per">/mo</span></div><span className="mn-muted">{usd(monthly * 12, false)} a year across {s.subs.filter((x) => x.status === "active").length} subscriptions</span></div>
        <div className="mn-insight"><Icon name="sparkle" size={16} /> 2 subscriptions look unused. Cancelling them saves {usd((8 + 42) * 12, false)}/year.</div>
      </section>
      <section className="mn-card span2">
        {s.subs.map((x) => {
          const stale = /\d{2} days ago/.test(x.used) && Number(x.used.match(/(\d+) days/)?.[1]) > 20;
          return (
            <motion.div key={x.id} layout className={`mn-sub ${x.status}`}>
              <span className="mn-sub-logo big" style={{ background: x.color }}>{x.name[0]}</span>
              <div className="grow">
                <strong>{x.name}</strong>
                <small>{x.status === "cancelled" ? "Cancelled · access until " + new Date(x.next + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Renews ${new Date(x.next + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} · <span className={stale ? "mn-stale" : ""}>{x.used}</span></small>
              </div>
              <b>{usd(x.amount)}<small>/{x.cycle}</small></b>
              {x.status === "active" ? (
                <button className="mn-btn ghost sm" onClick={() => setCancel({ sub: x, step: 0, reason: "" })}>Cancel</button>
              ) : (
                <button className="mn-btn sm" onClick={() => { s.resumeSub(x.id); toast(`${x.name} resumed`, { icon: "refresh" }); }}>Resume</button>
              )}
            </motion.div>
          );
        })}
      </section>
      <Modal open={!!cancel} onClose={() => setCancel(null)} label="Cancel subscription" className="mn-modal">
        {cancel && (
          <div className="mn-modal-body">
            <div className="mn-steps">{[0, 1, 2].map((i) => <i key={i} className={i <= cancel.step ? "on" : ""} />)}</div>
            <AnimatePresence mode="wait">
              <motion.div key={cancel.step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {cancel.step === 0 && (
                  <>
                    <h2>Why cancel {cancel.sub.name}?</h2>
                    <div className="mn-reasons">
                      {["I don't use it enough", "It's too expensive", "Switching to something else", "Just a pause"].map((r) => (
                        <button key={r} aria-pressed={cancel.reason === r} onClick={() => setCancel({ ...cancel, reason: r })}><span className="mn-radio" />{r}</button>
                      ))}
                    </div>
                    <div className="mn-modal-foot"><button className="mn-link" onClick={() => setCancel(null)}>Keep it</button><button className="mn-btn" disabled={!cancel.reason} onClick={() => setCancel({ ...cancel, step: 1 })}>Continue</button></div>
                  </>
                )}
                {cancel.step === 1 && (
                  <>
                    <h2>Confirm cancellation</h2>
                    <div className="mn-confirm-box">
                      <div><small>You'll keep access until</small><b>{new Date(cancel.sub.next + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}</b></div>
                      <div><small>You'll save</small><b className="pos">{usd(cancel.sub.cycle === "mo" ? cancel.sub.amount * 12 : cancel.sub.amount, false)}/yr</b></div>
                    </div>
                    <p className="mn-muted small">Moneta will block future charges from this merchant on your card. You can resume anytime.</p>
                    <div className="mn-modal-foot"><button className="mn-link" onClick={() => setCancel({ ...cancel, step: 0 })}>← Back</button><button className="mn-btn danger" onClick={() => { s.cancelSub(cancel.sub.id); setCancel({ ...cancel, step: 2 }); }}>Cancel subscription</button></div>
                  </>
                )}
                {cancel.step === 2 && (
                  <div className="mn-done">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}><Icon name="check" size={34} stroke={2.4} /></motion.span>
                    <h2>{cancel.sub.name} cancelled</h2>
                    <p className="mn-muted">We'll remind you a day before access ends.</p>
                    <button className="mn-btn" onClick={() => setCancel(null)}>Done</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Goals() {
  const s = useMoneta();
  const toast = useToast();
  const [add, setAdd] = useState<string | null>(null);
  const [amt, setAmt] = useState(100);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", target: 1500 });
  return (
    <div className="mn-grid">
      {s.goals.map((g, i) => {
        const p = g.saved / g.target;
        const months = Math.max(1, Math.round((new Date(g.due).getTime() - new Date(TODAY).getTime()) / (30 * 864e5)));
        const perMonth = Math.max(0, (g.target - g.saved) / months);
        return (
          <Reveal key={g.id} delay={i * 0.06} className="mn-card mn-goal">
            <div className="mn-goal-ring">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="10" />
                <motion.circle cx="60" cy="60" r="52" fill="none" stroke={g.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={327} initial={{ strokeDashoffset: 327 }} animate={{ strokeDashoffset: 327 * (1 - Math.min(1, p)) }} transform="rotate(-90 60 60)" transition={{ duration: 1.2, ease }} />
              </svg>
              <span style={{ color: g.color }}><Icon name={g.icon} size={26} /></span>
            </div>
            <h3>{g.name}</h3>
            <div className="mn-goal-nums"><b>{usd(g.saved, false)}</b> of {usd(g.target, false)} · {Math.round(p * 100)}%</div>
            <p className="mn-muted small">Save {usd(perMonth, false)}/mo to reach it by {new Date(g.due).toLocaleDateString("en-US", { month: "short", year: "numeric" })}.</p>
            {p >= 1 ? <span className="mn-reached"><Icon name="check" size={14} /> Goal reached</span> : <button className="mn-btn sm" onClick={() => { setAdd(g.id); setAmt(Math.round(perMonth / 10) * 10 || 50); }}>Add money</button>}
          </Reveal>
        );
      })}
      <button className="mn-card mn-goal new" onClick={() => setCreating(true)}><Icon name="plus" size={28} /> New goal</button>
      <Modal open={!!add} onClose={() => setAdd(null)} label="Add to goal" className="mn-modal">
        {add && (
          <div className="mn-modal-body">
            <h2>Add to {s.goals.find((g) => g.id === add)!.name}</h2>
            <AmountDisplay value={String(amt)} />
            <div className="mn-chips">{[25, 50, 100, 250, 500].map((v) => <button key={v} aria-pressed={amt === v} onClick={() => setAmt(v)}>{usd(v, false)}</button>)}</div>
            <input type="range" min={5} max={1000} step={5} value={amt} onChange={(e) => setAmt(Number(e.target.value))} aria-label="Amount" className="mn-range" />
            <p className="mn-muted small">From Everyday ·· 4821 ({usd(s.accounts.find((a) => a.id === "chk")!.balance)} available)</p>
            <div className="mn-modal-foot"><button className="mn-link" onClick={() => setAdd(null)}>Cancel</button><button className="mn-btn" onClick={() => { s.contribute(add, amt); toast(`${usd(amt, false)} added`, { icon: "target" }); setAdd(null); }}>Add {usd(amt, false)}</button></div>
          </div>
        )}
      </Modal>
      <Modal open={creating} onClose={() => setCreating(false)} label="New goal" className="mn-modal">
        <div className="mn-modal-body">
          <h2>New savings goal</h2>
          <label className="mn-field"><span>What are you saving for?</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New bike" /></label>
          <label className="mn-field"><span>Target · {usd(form.target, false)}</span><input type="range" min={200} max={20000} step={100} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></label>
          <div className="mn-modal-foot"><button className="mn-link" onClick={() => setCreating(false)}>Cancel</button><button className="mn-btn" disabled={!form.name.trim()} onClick={() => { s.addGoal({ name: form.name.trim(), target: form.target, due: addDays(TODAY, 365), icon: "star", color: "#c86bf0" }); setCreating(false); setForm({ name: "", target: 1500 }); toast("Goal created", { icon: "target" }); }}>Create goal</button></div>
        </div>
      </Modal>
    </div>
  );
}

function Cards() {
  const s = useMoneta();
  const toast = useToast();
  const [sel, setSel] = useState(s.cards[0].id);
  const [revealed, setRevealed] = useState(false);
  const c = s.cards.find((x) => x.id === sel) || s.cards[0];
  return (
    <div className="mn-cards-page">
      <div className="mn-card-stage">
        <CardFace c={c} revealed={revealed} onFlip={() => setRevealed(!revealed)} />
        <div className="mn-card-pick">
          {s.cards.map((x) => (
            <button key={x.id} aria-pressed={x.id === sel} onClick={() => { setSel(x.id); setRevealed(false); }} style={{ background: `linear-gradient(135deg, ${x.tone[0]}, ${x.tone[1]})` }} aria-label={x.name}>
              <span>•• {x.mask}</span>
            </button>
          ))}
          <button className="mn-card-new" onClick={() => { s.newCard(`Virtual ${s.cards.length}`); toast("Virtual card created", { icon: "card" }); }} aria-label="New virtual card"><Icon name="plus" /></button>
        </div>
      </div>
      <div className="mn-card-ctl">
        <section className="mn-card">
          <div className="mn-ctl-row"><Icon name="eye" /><span className="grow"><strong>Show card details</strong><small>Tap the card to flip</small></span><Toggle on={revealed} onChange={setRevealed} label="Show card details" /></div>
          <div className="mn-ctl-row"><Icon name="snow" /><span className="grow"><strong>Freeze card</strong><small>Blocks new purchases instantly</small></span><Toggle on={c.frozen} onChange={() => { s.freeze(c.id); toast(c.frozen ? "Card unfrozen" : "Card frozen", { icon: "snow" }); }} label="Freeze card" /></div>
          <div className="mn-ctl-row col">
            <span className="grow"><strong>Monthly limit · {usd(c.limit, false)}</strong><small>{usd(c.spent)} spent this month</small></span>
            <input type="range" min={100} max={10000} step={100} value={c.limit} onChange={(e) => s.cardLimit(c.id, Number(e.target.value))} aria-label="Monthly limit" className="mn-range" />
            <Progress value={c.spent / c.limit} color="#3a5ef0" label="Limit used" />
          </div>
        </section>
        <section className="mn-card">
          <h2 className="mn-h2">Recent on this card</h2>
          {s.txns.filter((t) => t.account === "cc").slice(0, 5).map((t) => <TxnRow key={t.id} t={t} hidden={s.hidden} />)}
        </section>
      </div>
    </div>
  );
}

function SendFlow({ open, onClose, internal }: { open: boolean; onClose: () => void; internal?: boolean }) {
  const s = useMoneta();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [to, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("chk");
  const [memo, setMemo] = useState("");
  const [err, setErr] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [txId, setTxId] = useState("");
  const reset = () => {
    setStep(0);
    setTo(null);
    setAmount("");
    setMemo("");
    setErr("");
    setConfirming(false);
  };
  const close = () => {
    onClose();
    setTimeout(reset, 300);
  };
  const acct = s.accounts.find((a) => a.id === from)!;
  const n = Number(amount) || 0;
  const recipients = internal ? s.accounts.filter((a) => a.id !== from && a.kind !== "Credit").map((a) => ({ id: a.id, name: a.name, sub: `${a.kind} ·· ${a.mask}` })) : contacts.map((c) => ({ id: c.id, name: c.name, sub: c.handle }));
  const toName = recipients.find((r) => r.id === to)?.name;
  return (
    <Modal open={open} onClose={close} label={internal ? "Transfer" : "Send money"} className="mn-modal">
      <div className="mn-modal-body">
        {step < 3 && <div className="mn-steps">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }}>
            {step === 0 && (
              <>
                <h2>{internal ? "Move money to" : "Who are you paying?"}</h2>
                <div className="mn-recips">
                  {recipients.map((r) => (
                    <button key={r.id} onClick={() => { setTo(r.id); setStep(1); }}>
                      {internal ? <span className="mn-acct-dot big" style={{ background: s.accounts.find((a) => a.id === r.id)?.color }} /> : <ContactAv id={r.id} />}
                      <span className="grow"><strong>{r.name}</strong><small>{r.sub}</small></span>
                      <Icon name="next" size={18} />
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2>How much to {toName}?</h2>
                <AmountDisplay value={amount} shake={!!err} />
                <input className="mn-amount-input" inputMode="decimal" value={amount} autoFocus onChange={(e) => { setErr(""); setAmount(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")); }} placeholder="0.00" aria-label="Amount in dollars" />
                <div className="mn-chips">{[20, 50, 100, 250].map((v) => <button key={v} onClick={() => setAmount(String(v))}>{usd(v, false)}</button>)}</div>
                <label className="mn-field"><span>From</span>
                  <select value={from} onChange={(e) => setFrom(e.target.value)}>{s.accounts.filter((a) => a.kind !== "Credit" && a.kind !== "Investments" && a.id !== to).map((a) => <option key={a.id} value={a.id}>{a.name} — {usd(a.balance)}</option>)}</select>
                </label>
                {!internal && <label className="mn-field"><span>What's it for?</span><input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Dinner, rent, tickets…" maxLength={40} /></label>}
                {err && <p className="mn-err" role="alert">{err}</p>}
                <div className="mn-modal-foot">
                  <button className="mn-link" onClick={() => setStep(0)}>← Back</button>
                  <button className="mn-btn" disabled={!n} onClick={() => { if (n > acct.balance) return setErr(`That's more than ${usd(acct.balance)} available in ${acct.name}.`); if (n < 1) return setErr("Minimum is $1.00"); setStep(2); }}>Review</button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Review {internal ? "transfer" : "payment"}</h2>
                <dl className="mn-review">
                  <div><dt>To</dt><dd>{toName}</dd></div>
                  <div><dt>From</dt><dd>{acct.name} ·· {acct.mask}</dd></div>
                  <div><dt>Amount</dt><dd className="big">{usd(n)}</dd></div>
                  {memo && <div><dt>Note</dt><dd>{memo}</dd></div>}
                  <div><dt>Arrives</dt><dd>{internal ? "Instantly" : "Within minutes · no fee"}</dd></div>
                  <div><dt>Balance after</dt><dd>{usd(acct.balance - n)}</dd></div>
                </dl>
                <AnimatePresence>{confirming && <FaceId onDone={() => { if (internal) s.move(from, to!, n); else setTxId(s.send(to!, n, from, memo).id); setStep(3); }} />}</AnimatePresence>
                {!confirming && (
                  <div className="mn-modal-foot">
                    <button className="mn-link" onClick={() => setStep(1)}>← Edit</button>
                    <button className="mn-btn" onClick={() => setConfirming(true)}><Icon name="lock" size={16} /> {internal ? "Transfer" : "Send"} {usd(n)}</button>
                  </div>
                )}
              </>
            )}
            {step === 3 && (
              <div className="mn-done">
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={spring}><Icon name="check" size={34} stroke={2.4} /></motion.span>
                <h2>{usd(n)} {internal ? "moved" : "sent"}</h2>
                <p className="mn-muted">{internal ? `to ${toName}` : `to ${toName}${memo ? ` · “${memo}”` : ""}`}</p>
                {txId && <p className="mn-muted small">Reference {txId}</p>}
                <div className="mn-modal-foot center">
                  <button className="mn-btn ghost" onClick={() => { reset(); }}>{internal ? "Another transfer" : "Send another"}</button>
                  <button className="mn-btn" onClick={() => { close(); toast("Payment complete", { icon: "check" }); }}>Done</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}

export default function MonetaWeb() {
  const s = useMoneta();
  const [page, setPage] = useState<Page>("overview");
  const [txn, setTxn] = useState<Txn | null>(null);
  const [send, setSend] = useState<null | "send" | "move">(null);
  const nav: [Page, string, string][] = [
    ["overview", "home", "Overview"],
    ["accounts", "wallet", "Accounts"],
    ["transactions", "list", "Transactions"],
    ["budgets", "target", "Budgets"],
    ["subscriptions", "repeat", "Subscriptions"],
    ["goals", "star", "Goals"],
    ["cards", "card", "Cards"],
  ];
  const go = (p: Page) => {
    setPage(p);
    scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  return (
    <div className="moneta mn-web">
      <aside className="mn-side">
        <div className="mn-logo"><span>m</span>moneta</div>
        <nav aria-label="MONETA">
          {nav.map(([k, i, l]) => (
            <button key={k} aria-current={page === k ? "page" : undefined} onClick={() => go(k)}>
              <Icon name={i} size={19} />
              <span>{l}</span>
              {page === k && <motion.i layoutId="mn-nav" className="mn-nav-bar" transition={spring} />}
            </button>
          ))}
        </nav>
        <div className="mn-side-card">
          <small>Safe to spend today</small>
          <b>{s.hidden ? "•••" : usd(s.budgets.reduce((a, b) => a + Math.max(0, b.limit - s.spentBy(b.cat)), 0) / 9, false)}</b>
          <span>Based on your budgets and 9 days left</span>
        </div>
      </aside>
      <main className="mn-main">
        <header className="mn-top">
          <motion.h1 key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{nav.find((n) => n[0] === page)![2]}</motion.h1>
          <div className="mn-top-actions">
            <button className="kit-icon-btn" onClick={() => s.setHidden(!s.hidden)} aria-pressed={s.hidden} aria-label={s.hidden ? "Show balances" : "Hide balances"}><Icon name={s.hidden ? "eyeoff" : "eye"} size={18} /></button>
            <button className="kit-icon-btn" aria-label="Notifications"><Icon name="bell" size={18} /></button>
            <button className="mn-btn" onClick={() => setSend("send")}><Icon name="send" size={16} /> Send money</button>
            <span className="mn-me">TK</span>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}>
            {page === "overview" && <Overview go={go} openTxn={setTxn} send={() => setSend("send")} />}
            {page === "accounts" && <Accounts move={() => setSend("move")} />}
            {page === "transactions" && <Transactions openTxn={setTxn} />}
            {page === "budgets" && <Budgets />}
            {page === "subscriptions" && <Subscriptions />}
            {page === "goals" && <Goals />}
            {page === "cards" && <Cards />}
          </motion.div>
        </AnimatePresence>
        <footer className="mn-footer">MONETA · Concept by Sheikh Robin Emon · Fictional accounts. No money moves.</footer>
      </main>
      <TxnDrawer t={txn} onClose={() => setTxn(null)} />
      <SendFlow open={send === "send"} onClose={() => setSend(null)} />
      <SendFlow open={send === "move"} onClose={() => setSend(null)} internal />
    </div>
  );
}
