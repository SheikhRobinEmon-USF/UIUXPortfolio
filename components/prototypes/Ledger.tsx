import { useState } from "react";
import { projectArtwork, type Project } from "../../lib/projects";
import { useLocal, money, today } from "./demo-state";
type Entry = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
};
const habitsList = [
  "Drink water",
  "Take a walk",
  "Read for 10 minutes",
  "Wind down",
];
const units: Record<string, string> = {
  Activity: "min",
  Sleep: "hr",
  Nutrition: "kcal",
};
const wellnessReference: Record<string, number> = {
  Activity: 45,
  Sleep: 8,
  Nutrition: 2200,
};
const day = 86_400_000;
function relativeDate(iso: string, days: number) {
  return new Date(Date.parse(iso || today) + days * day)
    .toISOString()
    .slice(0, 10);
}
const seeds: Record<string, Entry[]> = {
  health: [
    {
      id: "1",
      name: "Morning walk",
      category: "Activity",
      amount: 28,
      date: today,
    },
    {
      id: "2",
      name: "Restful night",
      category: "Sleep",
      amount: 7.5,
      date: today,
    },
    {
      id: "3",
      name: "Lunch bowl",
      category: "Nutrition",
      amount: 480,
      date: today,
    },
    {
      id: "4",
      name: "Evening wind-down",
      category: "Sleep",
      amount: 7,
      date: "2026-11-20",
    },
    {
      id: "5",
      name: "Chickpea salad",
      category: "Nutrition",
      amount: 390,
      date: "2026-11-20",
    },
    {
      id: "6",
      name: "Lakeside walk",
      category: "Activity",
      amount: 37,
      date: "2026-11-18",
    },
    {
      id: "7",
      name: "Evening journal and rest",
      category: "Sleep",
      amount: 8,
      date: "2026-11-18",
    },
  ],
  finance: [
    {
      id: "1",
      name: "Market grocery",
      category: "Food",
      amount: 82,
      date: "2026-11-20",
    },
    {
      id: "2",
      name: "Studio rent",
      category: "Home",
      amount: 950,
      date: "2026-11-01",
    },
    {
      id: "3",
      name: "Coffee & co.",
      category: "Food",
      amount: 18,
      date: "2026-11-19",
    },
    {
      id: "4",
      name: "Metro pass",
      category: "Transport",
      amount: 51,
      date: "2026-11-17",
    },
    {
      id: "5",
      name: "Cloud Music",
      category: "Subscriptions",
      amount: 12,
      date: "2026-11-18",
    },
  ],
};
export default function Ledger({
  p,
  screen,
  go,
  notify,
}: {
  p: Project;
  screen: string;
  go: (x: string) => void;
  notify: (s: string) => void;
}) {
  const health = p.slug === "health";
  const k = "sre:" + p.slug + ":";
  const cats = health
    ? ["Activity", "Sleep", "Nutrition"]
    : ["Food", "Home", "Transport", "Subscriptions"];
  const [entries, Entries] = useLocal(k + "entries", seeds[p.slug]);
  const [habits, Habits] = useLocal<Record<string, boolean>>(k + "habits", {});
  const [budgets, Budgets] = useLocal<Record<string, number>>(k + "budgets", {
    Food: 300,
    Home: 1000,
    Transport: 100,
    Subscriptions: 50,
  });
  const [goals, Goals] = useLocal<
    { name: string; amount: number; progress?: number }[]
  >(k + "goals", [
    {
      name: health ? "Daily activity" : "Weekend getaway",
      amount: health ? 30 : 500,
    },
  ]);
  const [journal, Journal] = useLocal<Record<string, string> | string>(
    k + "journal",
    {},
  );
  const [transfers, setTransfers] = useLocal<
    { date: string; amount: number; direction: string }[]
  >(k + "transfers", []);
  const [paused, setPaused] = useLocal<string[]>(
    k + "paused-subscriptions",
    [],
  );
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDirection, setTransferDirection] = useState(
    "Checking to savings",
  );
  const [activeGoal, setActiveGoal] = useState<number | null>(null);
  const [contribution, setContribution] = useState("");
  const [formError, setFormError] = useState("");
  const [prefs, Prefs] = useLocal(k + "prefs", true);
  const [query, Q] = useState("");
  const [category, C] = useState("All");
  const [range, R] = useState(health ? "Day" : "Month");
  const [date, D] = useState(today);
  const [entryName, N] = useState("");
  const [amount, A] = useState("");
  const [entryCat, EC] = useState(cats[0]);
  const [edit, Edit] = useState("");
  const [goalName, GN] = useState("");
  const [goalAmount, GA] = useState("");
  const [selected, Selected] = useState<Entry | null>(null);
  const periodEnd = health ? date || today : today;
  const periodStart =
    range === "Day"
      ? periodEnd
      : range === "Week"
        ? relativeDate(periodEnd, -6)
        : range === "All time"
          ? "0000-01-01"
          : periodEnd.slice(0, 7) + "-01";
  const withinPeriod = (entry: Entry) =>
    entry.date >= periodStart && entry.date <= periodEnd;
  const current = entries.filter(
    (entry) =>
      withinPeriod(entry) &&
      (category === "All" || entry.category === category) &&
      entry.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const value = (entry: Entry) =>
    health ? `${entry.amount} ${units[entry.category]}` : money(entry.amount);
  const sum = (name: string) =>
    current
      .filter((entry) => entry.category === name)
      .reduce((sum, entry) => sum + entry.amount, 0);
  const total = current.reduce((sum, entry) => sum + entry.amount, 0);
  const monthExpenses = entries.filter((entry) =>
    entry.date.startsWith(today.slice(0, 7)),
  );
  const monthlySpend = (name: string) =>
    monthExpenses
      .filter((entry) => entry.category === name)
      .reduce((sum, entry) => sum + entry.amount, 0);
  const habitsDone = habitsList.filter((habit) => habits[date + habit]).length;
  const transferNet = transfers.reduce(
    (sum, item) =>
      sum +
      (item.direction === "Checking to savings" ? item.amount : -item.amount),
    0,
  );
  const checking =
    4200 - entries.reduce((sum, entry) => sum + entry.amount, 0) - transferNet;
  const savings = 2500 + transferNet;
  const dateField = (
    <label>
      Wellness date
      <input
        type="date"
        required
        value={date}
        onChange={(event) => D(event.target.value || today)}
      />
    </label>
  );
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !entryName.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      setFormError("Enter a name and a number greater than zero.");
      return;
    }
    setFormError("");
    const row = {
      id: edit || crypto.randomUUID(),
      name: entryName.trim(),
      category:
        health && cats.includes(screen)
          ? screen
          : screen === "Subscriptions"
            ? "Subscriptions"
            : entryCat,
      amount: Number(amount),
      date,
    };
    Entries((prev) =>
      edit ? prev.map((x) => (x.id === edit ? row : x)) : [row, ...prev],
    );
    N("");
    A("");
    Edit("");
    Q("");
    if (!health) C("All");
    notify("Entry saved.");
  };
  const editRow = (e: Entry) => {
    Edit(e.id);
    N(e.name);
    A(String(e.amount));
    EC(e.category);
    D(e.date);
    go(health ? e.category : "Transactions");
  };
  const list = (rows: Entry[]) => (
    <div>
      {rows.length ? (
        rows.map((e) => (
          <article className="entry" key={e.id}>
            <button
              className="plain-title"
              onClick={() => {
                Selected(e);
                go("Entry details");
              }}
            >
              {e.name}
              <small>
                {e.category} · {e.date}
              </small>
            </button>
            <b>{value(e)}</b>
            <button onClick={() => editRow(e)}>Edit</button>
            <button
              aria-label={"Remove " + e.name}
              onClick={() => Entries((old) => old.filter((x) => x.id !== e.id))}
            >
              ×
            </button>
          </article>
        ))
      ) : (
        <div className="empty">
          No entries match. Add one or change the filters.
        </div>
      )}
    </div>
  );
  const form = (
    <form className="entry-form panel" onSubmit={add}>
      <h3>{edit ? "Edit entry" : "Add entry"}</h3>
      <label>
        Name
        <input required value={entryName} onChange={(e) => N(e.target.value)} />
      </label>
      {(!health || !cats.includes(screen)) && screen !== "Subscriptions" && (
        <label>
          Category
          <select value={entryCat} onChange={(event) => EC(event.target.value)}>
            {cats.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        {health
          ? `Value (${units[cats.includes(screen) ? screen : entryCat]})`
          : "Amount ($)"}
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => A(e.target.value)}
        />
      </label>
      <label>
        Date
        <input
          type="date"
          required
          value={date}
          onChange={(e) => D(e.target.value)}
        />
      </label>
      {formError && <p role="alert">{formError}</p>}
      <button className="action">Save entry</button>
      {edit && (
        <button
          type="button"
          onClick={() => {
            Edit("");
            N("");
            A("");
            setFormError("");
          }}
        >
          Cancel edit
        </button>
      )}
    </form>
  );
  const chart = (
    <div className="chart" aria-label="Category totals">
      {cats.map((c) => (
        <button
          key={c}
          className="bar-row"
          onClick={() => C(category === c ? "All" : c)}
          aria-pressed={category === c}
        >
          <span>{c}</span>
          <span className="bar-track">
            <i
              style={{
                width: `${Math.min(100, (sum(c) / (health ? wellnessReference[c] * (range === "Day" ? 1 : range === "Week" ? 7 : Number(periodEnd.slice(-2))) : Math.max(...cats.map(sum), 1))) * 100)}%`,
              }}
            />
          </span>
          <strong>{health ? `${sum(c)} ${units[c]}` : money(sum(c))}</strong>
        </button>
      ))}
    </div>
  );
  if (screen === "Entry details" && selected)
    return (
      <section>
        <h1>{selected.name}</h1>
        <p>
          {selected.category} · {selected.date}
        </p>
        <h2>{value(selected)}</h2>
        <button className="action" onClick={() => editRow(selected)}>
          Edit entry
        </button>
      </section>
    );
  if (screen === "Habits")
    return (
      <section>
        <h1>Small wins.</h1>
        <p>Choose what you want to practice.</p>
        {dateField}
        {habitsList.map((h) => (
          <label className="habit" key={h}>
            <input
              type="checkbox"
              checked={!!habits[date + h]}
              onChange={(e) =>
                Habits((old) => ({ ...old, [date + h]: e.target.checked }))
              }
            />
            {h}
          </label>
        ))}
        <p>{habitsDone} of 4 complete</p>
      </section>
    );
  if (screen === "Goals")
    return (
      <section>
        <h1>Your goals.</h1>
        {goals.length === 0 && (
          <p className="empty">Create a goal to start tracking progress.</p>
        )}
        {goals.map((goal, index) => {
          const progress = health
            ? entries
                .filter(
                  (entry) =>
                    entry.date === date && entry.category === "Activity",
                )
                .reduce((sum, entry) => sum + entry.amount, 0)
            : goal.progress || 0;
          return (
            <article className="goal-card panel" key={index}>
              <h2>{goal.name}</h2>
              <p>
                {health
                  ? `${progress} of ${goal.amount} min`
                  : `${money(progress)} of ${money(goal.amount)} saved`}
              </p>
              <progress
                value={Math.min(progress, goal.amount)}
                max={goal.amount}
                aria-label={`${goal.name} progress`}
              />
              {!health && (
                <button
                  onClick={() => {
                    setActiveGoal(index);
                    setContribution("");
                  }}
                >
                  Log mock savings
                </button>
              )}
              <button
                onClick={() => {
                  setActiveGoal(null);
                  Goals((old) =>
                    old.filter((_, position) => position !== index),
                  );
                }}
              >
                Remove goal
              </button>
              {activeGoal === index && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (Number(contribution) <= 0) return;
                    Goals((old) =>
                      old.map((item, position) =>
                        position === index
                          ? {
                              ...item,
                              progress:
                                (item.progress || 0) + Number(contribution),
                            }
                          : item,
                      ),
                    );
                    setActiveGoal(null);
                    notify("Mock savings recorded.");
                  }}
                >
                  <label>
                    Contribution ($)
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={contribution}
                      onChange={(event) => setContribution(event.target.value)}
                    />
                  </label>
                  <button className="action">Record savings</button>
                </form>
              )}
            </article>
          );
        })}
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (goalName.trim() && +goalAmount > 0) {
              Goals((g) => [...g, { name: goalName, amount: +goalAmount }]);
              GN("");
              GA("");
            }
          }}
        >
          <label>
            Goal name
            <input
              required
              value={goalName}
              onChange={(e) => GN(e.target.value)}
            />
          </label>
          <label>
            {health ? "Daily target (minutes)" : "Target ($)"}
            <input
              required
              type="number"
              min="1"
              value={goalAmount}
              onChange={(e) => GA(e.target.value)}
            />
          </label>
          <button className="action">Create goal</button>
        </form>
      </section>
    );
  if (screen === "Journal")
    return (
      <section>
        <h1>A moment to reflect.</h1>
        {dateField}
        <label>
          Daily journal
          <textarea
            value={
              typeof journal === "string"
                ? date === today
                  ? journal
                  : ""
                : journal[date] || ""
            }
            onChange={(event) => {
              const text = event.target.value;
              Journal((old) => ({
                ...(typeof old === "string" ? { [today]: old } : old),
                [date]: text,
              }));
            }}
            placeholder="How did today feel?"
          />
        </label>
        <p>Saved on this device as you type.</p>
      </section>
    );
  if (screen === "Settings")
    return (
      <section>
        <h1>Preferences</h1>
        <label className="habit">
          <input
            type="checkbox"
            checked={prefs}
            onChange={(e) => Prefs(e.target.checked)}
          />{" "}
          Show encouraging insights
        </label>
        <p>
          {health
            ? "Wellness entries and preferences stay in this browser."
            : "Account balances and preferences are local sample data."}
        </p>
      </section>
    );
  if (screen === "Budgets")
    return (
      <section>
        <h1>Make a plan.</h1>
        {cats.map((c) => (
          <article key={c} className="panel budget">
            <h2>{c}</h2>
            <label>
              Monthly budget ($)
              <input
                type="number"
                min="0"
                value={budgets[c] || 0}
                onChange={(e) =>
                  Budgets((old) => ({
                    ...old,
                    [c]: Math.max(0, +e.target.value),
                  }))
                }
              />
            </label>
            <p>
              Spent {money(monthlySpend(c))} · Remaining{" "}
              {money((budgets[c] || 0) - monthlySpend(c))}
            </p>
            <progress
              value={Math.min(monthlySpend(c), budgets[c] || 1)}
              max={budgets[c] || 1}
              aria-label={`${c} budget used`}
            />
          </article>
        ))}
      </section>
    );
  if (screen === "Accounts")
    return (
      <section>
        <h1>Accounts.</h1>
        <div className="account-grid">
          <div className="panel">
            <small>CHECKING · DEMO</small>
            <h2>{money(checking)}</h2>
          </div>
          <div className="panel">
            <small>SAVINGS · DEMO</small>
            <h2>{money(savings)}</h2>
          </div>
        </div>
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(transferAmount);
            if (
              !Number.isFinite(amount) ||
              amount <= 0 ||
              amount >
                (transferDirection === "Checking to savings"
                  ? checking
                  : savings)
            ) {
              setFormError(
                "Enter an amount within the available sample balance.",
              );
              return;
            }
            setTransfers((old) => [
              { date: today, amount, direction: transferDirection },
              ...old,
            ]);
            setTransferAmount("");
            setFormError("");
            notify("Simulated transfer recorded.");
          }}
        >
          <h2>Move sample funds</h2>
          <label>
            Direction
            <select
              value={transferDirection}
              onChange={(event) => setTransferDirection(event.target.value)}
            >
              <option>Checking to savings</option>
              <option>Savings to checking</option>
            </select>
          </label>
          <label>
            Transfer amount ($)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={transferAmount}
              onChange={(event) => setTransferAmount(event.target.value)}
            />
          </label>
          {formError && <p role="alert">{formError}</p>}
          <button className="action">Record simulated transfer</button>
        </form>
        <h2>Transfer history</h2>
        {transfers.length ? (
          transfers.map((item, index) => (
            <article className="entry" key={index}>
              <b>{item.direction}</b>
              <span>{item.date}</span>
              <b>{money(item.amount)}</b>
            </article>
          ))
        ) : (
          <p className="empty">No simulated transfers yet.</p>
        )}
      </section>
    );
  if (screen === "Subscriptions")
    return (
      <section>
        <h1>Recurring expenses.</h1>
        <p>
          Projected next cycle{" "}
          {money(
            entries
              .filter(
                (entry) =>
                  entry.category === "Subscriptions" &&
                  !paused.includes(entry.id),
              )
              .reduce((sum, entry) => sum + entry.amount, 0),
          )}
        </p>
        {entries
          .filter((entry) => entry.category === "Subscriptions")
          .map((entry) => (
            <article className="entry" key={entry.id}>
              <b>{entry.name}</b>
              <span>
                {money(entry.amount)} ·{" "}
                {paused.includes(entry.id) ? "Paused" : "Monthly"}
              </span>
              <button
                onClick={() =>
                  setPaused((old) =>
                    old.includes(entry.id)
                      ? old.filter((id) => id !== entry.id)
                      : [...old, entry.id],
                  )
                }
              >
                {paused.includes(entry.id) ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => {
                  editRow(entry);
                  go("Subscriptions");
                }}
              >
                Edit
              </button>
            </article>
          ))}
        {form}
      </section>
    );
  if (screen === "Transactions" || cats.includes(screen))
    return (
      <section>
        <h1>{screen}</h1>
        <div className="filters">
          <label>
            Search
            <input value={query} onChange={(e) => Q(e.target.value)} />
          </label>
          {health ? (
            dateField
          ) : (
            <>
              <label>
                Category
                <select
                  value={category}
                  onChange={(event) => C(event.target.value)}
                >
                  {["All", ...cats].map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label>
                Range
                <select
                  value={range}
                  onChange={(event) => R(event.target.value)}
                >
                  <option>Month</option>
                  <option>Week</option>
                  <option>All time</option>
                </select>
              </label>
            </>
          )}
        </div>
        <div className="checkout-grid">
          {list(
            health
              ? entries.filter(
                  (entry) =>
                    entry.category === screen &&
                    entry.date === date &&
                    entry.name
                      .toLowerCase()
                      .includes(query.trim().toLowerCase()),
                )
              : current,
          )}
          {form}
        </div>
      </section>
    );
  return (
    <section>
      <div
        className={`ledger-heading ${health && screen === "Today" ? "wellness-cover" : ""}`}
      >
        {health && screen === "Today" && (
          <img
            {...projectArtwork("health")}
            sizes="(max-width: 780px) 74vw, 59vw"
            alt=""
            fetchPriority="high"
          />
        )}
        <div>
          <span className="kicker">
            {health ? "YOUR WELLNESS SPACE" : "YOUR FINANCIAL SPACE"}
          </span>
          <h1>
            {screen === "Today"
              ? "Good morning, Robin."
              : screen === "Overview"
                ? "Your money, in focus."
                : screen}
          </h1>
          <p>
            {health
              ? "Every small step counts."
              : "A clearer view of where your money goes."}
          </p>
        </div>
        <label>
          {health ? "Date" : "Range"}
          {health ? (
            <input
              type="date"
              value={date}
              onChange={(e) => D(e.target.value)}
            />
          ) : (
            <select value={range} onChange={(e) => R(e.target.value)}>
              <option>Month</option>
              <option>Week</option>
              <option>All time</option>
            </select>
          )}
        </label>
        {health && (
          <label>
            Range
            <select value={range} onChange={(e) => R(e.target.value)}>
              <option>Day</option>
              <option>Week</option>
              <option>Month</option>
            </select>
          </label>
        )}
      </div>
      <div className="stat-grid">
        {cats.map((c) => (
          <button
            key={c}
            className="stat"
            onClick={() => {
              if (!health) C(c);
              go(
                health
                  ? c
                  : c === "Subscriptions"
                    ? "Subscriptions"
                    : "Transactions",
              );
            }}
          >
            <small>{c}</small>
            <strong>{health ? sum(c) : money(sum(c))}</strong>
            <span>
              {health
                ? c === "Activity"
                  ? "min"
                  : c === "Sleep"
                    ? "hours"
                    : "kcal"
                : "spent"}{" "}
              ↗
            </span>
          </button>
        ))}
      </div>
      <div className="ledger-grid">
        <div className="panel">
          <h2>{health ? "Daily rhythm" : "Spending breakdown"}</h2>
          <label>
            Category
            <select value={category} onChange={(e) => C(e.target.value)}>
              {["All", ...cats].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {chart}
          {!health && <h3>Total spending {money(total)}</h3>}
        </div>
        <div className="panel">
          <h2>{health ? "Your habits" : "Budget snapshot"}</h2>
          {health ? (
            <>
              <strong className="big-number">
                {habitsDone}
                /4
              </strong>
              <p>Habits completed on {date}</p>
              <button className="action" onClick={() => go("Habits")}>
                Track habits
              </button>
            </>
          ) : (
            <>
              <strong className="big-number">
                {money(
                  Object.values(budgets).reduce((s, n) => s + n, 0) -
                    monthExpenses.reduce((s, e) => s + e.amount, 0),
                )}
              </strong>
              <p>Remaining across monthly budgets</p>
              <button className="action" onClick={() => go("Budgets")}>
                Manage budgets
              </button>
            </>
          )}
        </div>
      </div>
      <h2>{health ? "Daily timeline" : "Recent transactions"}</h2>
      {health ? (
        <div className="wellness-timeline">
          {list(
            current
              .slice()
              .sort((first, second) => second.date.localeCompare(first.date)),
          )}
        </div>
      ) : (
        list(current)
      )}
      {prefs && (
        <p className="insight">
          {health
            ? habitsDone
              ? `You checked in with ${habitsDone} of your four habits on this day.`
              : "A small check-in is enough to begin."
            : total
              ? `Your selected period includes ${current.length} transactions totaling ${money(total)}.`
              : "Your current filters have no transactions."}{" "}
          Synthetic data; no professional advice.
        </p>
      )}
    </section>
  );
}
