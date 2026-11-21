"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Modal, useToast, ease, spring, Empty } from "../../kit/ui";
import { C, U, circles, events, fmtK, shrink, stories, timeAgo, users, useCommon, type Post } from "./data";
import { Artwork, Av, LikeButton, Media, Onboarding, Poll, StoryViewer, critiqueTags } from "./shared";

type Page = { name: "home" } | { name: "explore" } | { name: "circles"; id?: string } | { name: "messages"; id?: string } | { name: "notifications" } | { name: "saved" } | { name: "profile"; id?: string };

function PostCard({ p, open, go, i = 0 }: { p: Post; open: (id: string) => void; go: (pg: Page) => void; i?: number }) {
  const s = useCommon();
  const toast = useToast();
  const liked = s.likes.includes(p.id);
  const [burst, setBurst] = useState(false);
  const c = C(p.circle);
  return (
    <motion.article layout className={`cm-post ${p.kind}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.55, ease, delay: Math.min(i, 5) * 0.05 }}>
      <header className="cm-post-head">
        <button className="cm-post-author" onClick={() => go({ name: "profile", id: p.by })}>
          <Av id={p.by} size={42} />
          <span>
            <strong>{p.by === "me" ? s.me.name : U(p.by).name}</strong>
            <small>@{U(p.by).handle} · {p.ts ? timeAgo(p.ts) : p.ago}</small>
          </span>
        </button>
        <button className="cm-circle-chip" style={{ background: c.color, color: c.ink }} onClick={() => go({ name: "circles", id: c.id })}>
          {c.name}
        </button>
        {p.by === "me" && (
          <button className="cm-icon" aria-label="Delete post" onClick={() => { s.remove(p.id); toast("Post deleted", { icon: "trash" }); }}><Icon name="trash" size={18} /></button>
        )}
      </header>
      {p.kind === "critique" && (
        <div className="cm-critique-banner">
          <Icon name="sparkle" size={16} /> Feedback wanted on <b>{p.focus?.join(" & ")}</b>
        </div>
      )}
      <p className={`cm-post-text ${p.kind === "text" ? "big" : ""}`}>{p.text}</p>
      {p.kind === "poll" && <Poll p={p} />}
      {(p.img || (p.art != null && p.kind !== "poll")) && (
        <div
          className="cm-post-media"
          onDoubleClick={() => {
            s.like(p.id, true);
            setBurst(true);
            setTimeout(() => setBurst(false), 900);
          }}
          onClick={() => open(p.id)}
        >
          <Media p={p} />
          <AnimatePresence>
            {burst && (
              <motion.span className="cm-dbl" initial={{ scale: 0, opacity: 0, rotate: -15 }} animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1], rotate: 0 }} exit={{ scale: 1.6, opacity: 0, y: -40 }} transition={{ duration: 0.5 }}>
                <Icon name="heart" size={96} fill stroke={0} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
      <footer className="cm-post-actions">
        <LikeButton on={liked} count={p.likes + (liked ? 1 : 0)} onClick={() => s.like(p.id)} />
        <button className="cm-act" onClick={() => open(p.id)}><Icon name="chat" size={20} /> {p.comments.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0)}</button>
        <button className="cm-act" onClick={() => toast("Link copied", { icon: "share" })}><Icon name="share" size={20} /></button>
        <span className="grow" />
        <button className={`cm-act ${s.saved.includes(p.id) ? "saved" : ""}`} onClick={() => toast(s.save(p.id) ? "Saved" : "Removed from saved", { icon: "bookmark" })} aria-label="Save" aria-pressed={s.saved.includes(p.id)}>
          <Icon name="bookmark" size={20} fill={s.saved.includes(p.id)} />
        </button>
      </footer>
      {p.comments[0] && (
        <button className="cm-preview-comment" onClick={() => open(p.id)}>
          <b>{p.comments[0].by === "me" ? s.me.name.split(" ")[0] : U(p.comments[0].by).name.split(" ")[0]}</b> {p.comments[0].text}
          {p.comments.length > 1 && <small>View all {p.comments.length} comments</small>}
        </button>
      )}
    </motion.article>
  );
}

function PostModal({ id, onClose, go }: { id: string | null; onClose: () => void; go: (p: Page) => void }) {
  const s = useCommon();
  const p = s.posts.find((x) => x.id === id);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setText("");
    setTag(undefined);
    setReplyTo(null);
    setFilter(null);
  }, [id]);
  return (
    <Modal open={!!p} onClose={onClose} label="Post" className="cm-modal">
      {p && (
        <div className={`cm-detail ${p.img || p.art != null ? "" : "text-only"}`}>
          {(p.img || p.art != null) && p.kind !== "poll" && (
            <div className="cm-detail-media">
              <Media p={p} />
            </div>
          )}
          <div className="cm-detail-side">
            <header className="cm-post-head">
              <button className="cm-post-author" onClick={() => { onClose(); go({ name: "profile", id: p.by }); }}>
                <Av id={p.by} size={40} />
                <span><strong>{p.by === "me" ? s.me.name : U(p.by).name}</strong><small>{C(p.circle).name}</small></span>
              </button>
            </header>
            <p className="cm-post-text">{p.text}</p>
            {p.kind === "poll" && <Poll p={p} />}
            {p.kind === "critique" && (
              <div className="cm-tagfilter">
                <span>Filter feedback</span>
                {critiqueTags.map((t) => (
                  <button key={t} aria-pressed={filter === t} onClick={() => setFilter(filter === t ? null : t)}>{t} {p.comments.filter((c) => c.tag === t).length || ""}</button>
                ))}
              </div>
            )}
            <div className="cm-comments">
              <AnimatePresence initial={false}>
                {p.comments.filter((c) => !filter || c.tag === filter).map((c) => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cm-comment">
                    <Av id={c.by} size={32} />
                    <div className="grow">
                      <p><b>{c.by === "me" ? s.me.name : U(c.by).name}</b> {c.tag && <em className="cm-tag">{c.tag}</em>} {c.text}</p>
                      <div className="cm-comment-meta">
                        <span>{c.ago}</span>
                        <button onClick={() => s.likeComment(c.id)} className={s.cLikes.includes(c.id) ? "on" : ""}>{c.likes + (s.cLikes.includes(c.id) ? 1 : 0)} likes</button>
                        <button onClick={() => { setReplyTo(c.id); input.current?.focus(); }}>Reply</button>
                      </div>
                      {c.replies?.map((r) => (
                        <motion.div key={r.id} className="cm-comment reply" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                          <Av id={r.by} size={26} />
                          <div className="grow"><p><b>{r.by === "me" ? s.me.name : U(r.by).name}</b> {r.text}</p><div className="cm-comment-meta"><span>{r.ago}</span></div></div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!p.comments.length && <p className="cm-muted">No comments yet — start the conversation.</p>}
            </div>
            <div className="cm-detail-actions">
              <LikeButton on={s.likes.includes(p.id)} count={p.likes + (s.likes.includes(p.id) ? 1 : 0)} onClick={() => s.like(p.id)} />
              <button className={`cm-act ${s.saved.includes(p.id) ? "saved" : ""}`} onClick={() => s.save(p.id)} aria-label="Save"><Icon name="bookmark" size={20} fill={s.saved.includes(p.id)} /></button>
            </div>
            <form
              className="cm-reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                s.addComment(p.id, text.trim(), replyTo ? undefined : tag, replyTo || undefined);
                setText("");
                setReplyTo(null);
              }}
            >
              {p.kind === "critique" && !replyTo && (
                <div className="cm-tagpick">
                  {critiqueTags.map((t) => <button type="button" key={t} aria-pressed={tag === t} onClick={() => setTag(tag === t ? undefined : t)}>{t}</button>)}
                </div>
              )}
              {replyTo && <div className="cm-replying">Replying to {U(p.comments.find((c) => c.id === replyTo)!.by).name} <button type="button" onClick={() => setReplyTo(null)}>Cancel</button></div>}
              <div className="cm-reply-row">
                <Av id="me" size={30} />
                <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder={p.kind === "critique" ? "Give specific, kind feedback…" : "Add a comment…"} aria-label="Comment" />
                <button disabled={!text.trim()}>Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Composer({ open, onClose, defaultCircle }: { open: boolean; onClose: () => void; defaultCircle?: string }) {
  const s = useCommon();
  const toast = useToast();
  const [kind, setKind] = useState<Post["kind"]>("image");
  const [text, setText] = useState("");
  const [circle, setCircle] = useState(defaultCircle || s.joined[0] || "illo");
  const [img, setImg] = useState<string | undefined>();
  const [art, setArt] = useState<number | undefined>(17);
  const [focus, setFocus] = useState<string[]>(["Composition"]);
  const [opts, setOpts] = useState(["", ""]);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) {
      setErr("");
      if (defaultCircle) setCircle(defaultCircle);
    }
  }, [open, defaultCircle]);
  function submit() {
    if (text.trim().length < 3) return setErr("Write a few words first.");
    if (kind === "poll" && opts.filter((o) => o.trim()).length < 2) return setErr("Add at least two poll options.");
    if (kind === "critique" && !focus.length) return setErr("Pick what you want feedback on.");
    s.publish({
      kind,
      text: text.trim(),
      circle,
      img: kind === "image" || kind === "critique" ? img : undefined,
      art: kind === "image" || kind === "critique" ? (img ? undefined : art) : kind === "poll" ? art : undefined,
      poll: kind === "poll" ? { options: opts.filter((o) => o.trim()), votes: opts.filter((o) => o.trim()).map(() => 0) } : undefined,
      focus: kind === "critique" ? focus : undefined,
    });
    toast(`Posted to ${C(circle).name}`, { icon: "check" });
    setText("");
    setImg(undefined);
    setOpts(["", ""]);
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} label="Create a post" className="cm-modal cm-compose-modal">
      <div className="cm-compose">
        <h2>Create</h2>
        <div className="cm-kinds" role="tablist">
          {([["image", "image", "Share work"], ["critique", "sparkle", "Ask for critique"], ["poll", "chart", "Poll"], ["text", "edit", "Thought"]] as [Post["kind"], string, string][]).map(([k, i, l]) => (
            <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>
              {kind === k && <motion.span layoutId="cm-kind" className="cm-kind-bg" transition={spring} />}
              <Icon name={i} size={18} /> {l}
            </button>
          ))}
        </div>
        <div className="cm-compose-grid">
          <div>
            <label className="cm-field">
              <span>Post to</span>
              <select value={circle} onChange={(e) => setCircle(e.target.value)}>
                {circles.map((c) => <option key={c.id} value={c.id}>{c.name}{s.joined.includes(c.id) ? "" : " (not joined)"}</option>)}
              </select>
            </label>
            <label className="cm-field">
              <span>{kind === "critique" ? "Context for reviewers" : kind === "poll" ? "Question" : "Caption"}</span>
              <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} rows={4} maxLength={400} placeholder={kind === "critique" ? "What is it, who's it for, and what are you unsure about?" : kind === "poll" ? "Ask your circle something…" : "Say something about it…"} />
              <small>{text.length}/400</small>
            </label>
            {kind === "critique" && (
              <div className="cm-field">
                <span>Feedback wanted on</span>
                <div className="cm-tagpick">{critiqueTags.map((t) => <button type="button" key={t} aria-pressed={focus.includes(t)} onClick={() => setFocus(focus.includes(t) ? focus.filter((x) => x !== t) : [...focus, t])}>{t}</button>)}</div>
              </div>
            )}
            {kind === "poll" && (
              <div className="cm-field">
                <span>Options</span>
                {opts.map((o, i) => (
                  <div className="cm-opt-row" key={i}>
                    <input value={o} onChange={(e) => setOpts(opts.map((x, k) => (k === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} aria-label={`Option ${i + 1}`} maxLength={40} />
                    {opts.length > 2 && <button type="button" className="cm-icon" onClick={() => setOpts(opts.filter((_, k) => k !== i))} aria-label="Remove option"><Icon name="close" size={16} /></button>}
                  </div>
                ))}
                {opts.length < 4 && <button type="button" className="cm-link" onClick={() => setOpts([...opts, ""])}>+ Add option</button>}
              </div>
            )}
          </div>
          {(kind === "image" || kind === "critique") && (
            <div className="cm-media-pick">
              <div className="cm-media-preview">
                {img ? <img src={img} alt="Your upload" /> : <Artwork seed={art || 1} />}
                {img && <button className="cm-icon light" onClick={() => setImg(undefined)} aria-label="Remove image"><Icon name="close" size={16} /></button>}
              </div>
              <label className="cm-upload">
                <Icon name="image" size={18} /> Upload an image
                <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImg(await shrink(f)); }} />
              </label>
              <div className="cm-art-pick">
                <span>or remix a sketch</span>
                {[17, 23, 31, 42].map((n) => <button key={n} aria-pressed={!img && art === n} onClick={() => { setImg(undefined); setArt(n); }} aria-label={`Sketch ${n}`}><Artwork seed={n} /></button>)}
              </div>
            </div>
          )}
        </div>
        {err && <p className="cm-err" role="alert">{err}</p>}
        <div className="cm-compose-foot">
          <span className="cm-muted"><Icon name="people" size={15} /> Visible to {fmtK(C(circle).members)} members of {C(circle).name}</span>
          <button className="cm-btn" onClick={submit}>Publish</button>
        </div>
      </div>
    </Modal>
  );
}

function Feed({ go, open, compose, story }: { go: (p: Page) => void; open: (id: string) => void; compose: () => void; story: (i: number) => void }) {
  const s = useCommon();
  const [scope, setScope] = useState<"for" | "following" | "circles">("for");
  const [sort, setSort] = useState<"latest" | "top">("latest");
  const list = useMemo(() => {
    let l = s.posts.filter((p) => (scope === "following" ? s.following.includes(p.by) || p.by === "me" : scope === "circles" ? s.joined.includes(p.circle) : true));
    l = [...l].sort((a, b) => (sort === "top" ? b.likes - a.likes : b.ts - a.ts));
    return l;
  }, [s.posts, scope, sort, s.following, s.joined]);
  return (
    <div className="cm-feed">
      <div className="cm-stories">
        <button className="cm-story-btn" onClick={compose}><span className="cm-av add"><Icon name="plus" size={22} /></span><small>Your story</small></button>
        {stories.map((st, i) => (
          <motion.button key={st.by} className="cm-story-btn" onClick={() => story(i)} whileHover={{ y: -3 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, ...spring }}>
            <Av id={st.by} size={58} ring seen={s.seenStories.includes(st.by)} />
            <small>{U(st.by).name.split(" ")[0]}</small>
          </motion.button>
        ))}
      </div>
      <button className="cm-compose-prompt" onClick={compose}>
        <Av id="me" size={40} />
        <span>Share work in progress, ask for critique, or start a poll…</span>
        <span className="cm-btn sm">Create</span>
      </button>
      <div className="cm-feed-bar">
        <div className="cm-scope" role="tablist">
          {([["for", "For you"], ["following", "Following"], ["circles", "My circles"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={scope === k} onClick={() => setScope(k)}>
              {l}
              {scope === k && <motion.span layoutId="cm-scope" className="cm-scope-line" transition={spring} />}
            </button>
          ))}
        </div>
        <div className="cm-sort">
          {(["latest", "top"] as const).map((k) => <button key={k} aria-pressed={sort === k} onClick={() => setSort(k)}>{k === "latest" ? "Latest" : "Top"}</button>)}
        </div>
      </div>
      <motion.div layout className="cm-posts">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => <PostCard key={p.id} p={p} open={open} go={go} i={i} />)}
        </AnimatePresence>
      </motion.div>
      {!list.length && <Empty icon="people" title={scope === "circles" ? "Join a circle to fill this view" : "Nothing here yet"} action={<button className="cm-btn" onClick={() => go({ name: "circles" })}>Browse circles</button>} />}
    </div>
  );
}

function RightRail({ go }: { go: (p: Page) => void }) {
  const s = useCommon();
  const toast = useToast();
  return (
    <aside className="cm-rail">
      <section className="cm-card">
        <h3>Upcoming in your circles</h3>
        {events.slice(0, 3).map((e) => (
          <div key={e.id} className="cm-event">
            <span className="cm-event-date" style={{ background: C(e.circle).color, color: C(e.circle).ink }}>
              <small>{e.when.split(",")[1].trim().split(" ")[0]}</small>
              <b>{e.when.split(",")[1].trim().split(" ")[1]}</b>
            </span>
            <div className="grow"><strong>{e.title}</strong><small>{e.when.split("·")[1]} · {e.going + (s.rsvps.includes(e.id) ? 1 : 0)} going</small></div>
            <button className={`cm-mini ${s.rsvps.includes(e.id) ? "on" : ""}`} onClick={() => { s.rsvp(e.id); toast(s.rsvps.includes(e.id) ? "RSVP removed" : "You're going!", { icon: "calendar" }); }}>{s.rsvps.includes(e.id) ? "Going" : "RSVP"}</button>
          </div>
        ))}
      </section>
      <section className="cm-card">
        <h3>Creators to know</h3>
        {users.filter((u) => u.id !== "me").slice(0, 4).map((u) => (
          <div key={u.id} className="cm-person">
            <button className="cm-person-link" onClick={() => go({ name: "profile", id: u.id })}>
              <Av id={u.id} size={40} />
              <span><strong>{u.name}</strong><small>{u.role}</small></span>
            </button>
            <motion.button className={`cm-mini ${s.following.includes(u.id) ? "on" : ""}`} onClick={() => s.follow(u.id)} whileTap={{ scale: 0.9 }}>{s.following.includes(u.id) ? "Following" : "Follow"}</motion.button>
          </div>
        ))}
      </section>
      <section className="cm-card">
        <h3>Trending</h3>
        <div className="cm-trends">
          {["#sketchalong", "#portra400", "#kerningcrimes", "#emptystates", "#glazetest"].map((t, i) => <button key={t} style={{ rotate: `${(i % 3) - 1}deg` }} onClick={() => go({ name: "explore" })}>{t}</button>)}
        </div>
      </section>
    </aside>
  );
}

function Explore({ open, go }: { open: (id: string) => void; go: (p: Page) => void }) {
  const s = useCommon();
  const [q, setQ] = useState("");
  const posts = s.posts.filter((p) => !q || (p.text + C(p.circle).name + U(p.by).name).toLowerCase().includes(q.toLowerCase()));
  const people = users.filter((u) => u.id !== "me" && (!q || (u.name + u.role).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="cm-page">
      <h1 className="cm-h1">Explore</h1>
      <div className="cm-search"><Icon name="search" size={20} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts, people and circles" aria-label="Search" /></div>
      {people.length > 0 && (
        <div className="cm-people-row">
          {people.map((u) => (
            <button key={u.id} onClick={() => go({ name: "profile", id: u.id })} className="cm-person-card">
              <Av id={u.id} size={56} />
              <strong>{u.name}</strong>
              <small>{u.role}</small>
            </button>
          ))}
        </div>
      )}
      <div className="cm-masonry">
        {posts.map((p, i) => (
          <motion.button key={p.id} className="cm-tile" onClick={() => open(p.id)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }}>
            {p.img || p.art != null ? <Media p={p} /> : <div className="cm-tile-text" style={{ background: C(p.circle).color, color: C(p.circle).ink }}>“{p.text}”</div>}
            <span className="cm-tile-meta"><Icon name="heart" size={14} fill /> {fmtK(p.likes)} · {C(p.circle).name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Circles({ id, go, open, compose }: { id?: string; go: (p: Page) => void; open: (id: string) => void; compose: (c?: string) => void }) {
  const s = useCommon();
  const toast = useToast();
  const [tab, setTab] = useState<"posts" | "events" | "about">("posts");
  if (id) {
    const c = C(id);
    const joined = s.joined.includes(id);
    return (
      <div className="cm-page">
        <div className="cm-circle-hero" style={{ background: c.color, color: c.ink }}>
          <Artwork seed={c.art} className="cm-circle-art" />
          <div>
            <button className="cm-link" onClick={() => go({ name: "circles" })} style={{ color: c.ink }}>← All circles</button>
            <h1>{c.name}</h1>
            <p>{c.desc}</p>
            <div className="cm-circle-meta">
              <span className="cm-faces">{users.slice(1, 5).map((u) => <Av key={u.id} id={u.id} size={28} />)}</span>
              {fmtK(c.members + (joined ? 1 : 0))} members
              <motion.button className={`cm-btn ${joined ? "ghost" : "dark"}`} onClick={() => { s.join(id); toast(joined ? `Left ${c.name}` : `Welcome to ${c.name}!`, { icon: joined ? "logout" : "people" }); }} whileTap={{ scale: 0.94 }}>{joined ? "Joined ✓" : "Join circle"}</motion.button>
              {joined && <button className="cm-btn dark" onClick={() => compose(id)}>Post here</button>}
            </div>
          </div>
        </div>
        <div className="cm-scope" role="tablist">
          {(["posts", "events", "about"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{k[0].toUpperCase() + k.slice(1)}{tab === k && <motion.span layoutId="cm-ctab" className="cm-scope-line" transition={spring} />}</button>
          ))}
        </div>
        {tab === "posts" && <div className="cm-posts narrow">{s.posts.filter((p) => p.circle === id).map((p, i) => <PostCard key={p.id} p={p} open={open} go={go} i={i} />)}{!s.posts.some((p) => p.circle === id) && <Empty icon="edit" title="No posts yet" text="Be the first to share something." />}</div>}
        {tab === "events" && (
          <div className="cm-events-list">
            {events.filter((e) => e.circle === id).map((e) => (
              <div key={e.id} className="cm-card cm-event big">
                <span className="cm-event-date" style={{ background: c.color, color: c.ink }}><small>{e.when.split(",")[1].trim().split(" ")[0]}</small><b>{e.when.split(",")[1].trim().split(" ")[1]}</b></span>
                <div className="grow"><strong>{e.title}</strong><small>{e.when} · {e.where} · {e.going + (s.rsvps.includes(e.id) ? 1 : 0)} going</small></div>
                <button className={`cm-btn ${s.rsvps.includes(e.id) ? "ghost" : ""}`} onClick={() => s.rsvp(e.id)}>{s.rsvps.includes(e.id) ? "Going ✓" : "RSVP"}</button>
              </div>
            ))}
            {!events.some((e) => e.circle === id) && <Empty icon="calendar" title="No events scheduled" />}
          </div>
        )}
        {tab === "about" && (
          <div className="cm-card cm-about">
            <h3>Circle guidelines</h3>
            <ol>{c.rules.map((r) => <li key={r}>{r}</li>)}</ol>
            <p className="cm-muted">Moderated by volunteers. Report anything that breaks the guidelines.</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="cm-page">
      <h1 className="cm-h1">Circles</h1>
      <p className="cm-muted">Small, topic-first communities. Join as many as you like.</p>
      <div className="cm-circle-grid">
        {circles.map((c, i) => (
          <motion.div key={c.id} className="cm-circle-card" style={{ background: c.color, color: c.ink }} initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.06, ...spring }} whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}>
            <button className="cm-circle-open" onClick={() => go({ name: "circles", id: c.id })} aria-label={`Open ${c.name}`}>
              <Artwork seed={c.art} />
            </button>
            <div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <div className="cm-circle-foot">
                <span>{fmtK(c.members)} members</span>
                <button className={`cm-mini ${s.joined.includes(c.id) ? "on" : ""}`} onClick={() => s.join(c.id)}>{s.joined.includes(c.id) ? "Joined" : "Join"}</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Messages({ id, go }: { id?: string; go: (p: Page) => void }) {
  const s = useCommon();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const who = id || Object.keys(s.threads)[0];
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (who) s.readDm(who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [s.threads, typing]);
  const thread = s.threads[who] || [];
  return (
    <div className="cm-dm">
      <aside className="cm-dm-list">
        <h2>Messages</h2>
        {users.filter((u) => u.id !== "me").map((u) => {
          const t = s.threads[u.id];
          return (
            <button key={u.id} aria-current={who === u.id ? "true" : undefined} onClick={() => go({ name: "messages", id: u.id })}>
              <Av id={u.id} size={44} />
              <span className="grow"><strong>{u.name}</strong><small>{t ? (t[t.length - 1].me ? "You: " : "") + t[t.length - 1].text : `Say hi to ${u.name.split(" ")[0]}`}</small></span>
              {s.unreadDm.includes(u.id) && <i className="cm-dot" />}
            </button>
          );
        })}
      </aside>
      <section className="cm-chat">
        <header><Av id={who} size={40} /><span><strong>{U(who).name}</strong><small>{U(who).role} · Active now</small></span></header>
        <div className="cm-msgs">
          <AnimatePresence initial={false}>
            {thread.map((m, i) => (
              <motion.p key={i + m.text} className={m.me ? "me" : ""} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}>{m.text}</motion.p>
            ))}
          </AnimatePresence>
          {typing && <p className="cm-typing" aria-label="typing"><i /><i /><i /></p>}
          <div ref={end} />
        </div>
        <form
          className="cm-chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            s.send(who, draft.trim(), () => setTyping(false));
            setDraft("");
            setTimeout(() => setTyping(true), 600);
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${U(who).name.split(" ")[0]}…`} aria-label="Message" />
          <button aria-label="Send" disabled={!draft.trim()}><Icon name="send" size={18} /></button>
        </form>
      </section>
    </div>
  );
}

function Notifications({ go, open }: { go: (p: Page) => void; open: (id: string) => void }) {
  const s = useCommon();
  useEffect(() => {
    const t = setTimeout(s.readAll, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const icon = { like: "heart", comment: "chat", follow: "user", event: "calendar", mention: "sparkle" } as const;
  return (
    <div className="cm-page narrow">
      <div className="cm-h1-row"><h1 className="cm-h1">Activity</h1><button className="cm-link" onClick={s.readAll}>Mark all read</button></div>
      {s.notes.map((n, i) => (
        <motion.button key={n.id} className={`cm-note ${n.read ? "" : "unread"}`} onClick={() => (n.post ? open(n.post) : n.kind === "follow" ? go({ name: "profile", id: n.by }) : go({ name: "circles", id: n.by }))} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
          <span className="cm-note-ico"><Av id={n.by} size={44} /><i className={n.kind}><Icon name={icon[n.kind]} size={12} fill={n.kind === "like"} /></i></span>
          <span className="grow"><b>{U(n.by)?.name || C(n.by)?.name}</b> {n.text}<small>{n.ago}</small></span>
          {n.kind === "follow" && <span className={`cm-mini ${s.following.includes(n.by) ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); s.follow(n.by); }}>{s.following.includes(n.by) ? "Following" : "Follow back"}</span>}
        </motion.button>
      ))}
    </div>
  );
}

function Profile({ id = "me", go, open, saved = false }: { id?: string; go: (p: Page) => void; open: (id: string) => void; saved?: boolean }) {
  const s = useCommon();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(s.me);
  const [tab, setTab] = useState<"posts" | "saved">(saved ? "saved" : "posts");
  const u = U(id);
  const isMe = id === "me";
  const posts = tab === "saved" ? s.posts.filter((p) => s.saved.includes(p.id)) : s.posts.filter((p) => p.by === id);
  return (
    <div className="cm-page">
      <div className="cm-profile-hero">
        <Artwork seed={id.length * 13} className="cm-profile-cover" />
        <div className="cm-profile-info">
          <Av id={id} size={110} />
          <div className="grow">
            <h1>{isMe ? s.me.name : u.name}</h1>
            <small>@{u.handle} · {isMe ? s.me.role : u.role}</small>
            <p>{isMe ? s.me.bio : u.bio}</p>
            <div className="cm-stats">
              <span><b>{s.posts.filter((p) => p.by === id).length}</b> posts</span>
              <span><b>{fmtK(u.followers + (!isMe && s.following.includes(id) ? 1 : 0))}</b> followers</span>
              <span><b>{isMe ? s.following.length : 180}</b> following</span>
              <span><b>{isMe ? s.joined.length : 3}</b> circles</span>
            </div>
          </div>
          {isMe ? (
            <button className="cm-btn ghost" onClick={() => { setForm(s.me); setEdit(true); }}><Icon name="edit" size={16} /> Edit profile</button>
          ) : (
            <div className="cm-profile-btns">
              <motion.button className={`cm-btn ${s.following.includes(id) ? "ghost" : ""}`} onClick={() => s.follow(id)} whileTap={{ scale: 0.94 }}>{s.following.includes(id) ? "Following" : "Follow"}</motion.button>
              <button className="cm-btn ghost" onClick={() => go({ name: "messages", id })}><Icon name="chat" size={16} /> Message</button>
            </div>
          )}
        </div>
      </div>
      {isMe && (
        <div className="cm-scope" role="tablist">
          {(["posts", "saved"] as const).map((k) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{k === "posts" ? "Posts" : "Saved"}{tab === k && <motion.span layoutId="cm-ptab" className="cm-scope-line" transition={spring} />}</button>)}
        </div>
      )}
      <div className="cm-masonry">
        {posts.map((p) => (
          <button key={p.id} className="cm-tile" onClick={() => open(p.id)}>
            {p.img || p.art != null ? <Media p={p} /> : <div className="cm-tile-text" style={{ background: C(p.circle).color, color: C(p.circle).ink }}>“{p.text}”</div>}
          </button>
        ))}
      </div>
      {!posts.length && <Empty icon={tab === "saved" ? "bookmark" : "edit"} title={tab === "saved" ? "Nothing saved yet" : "No posts yet"} />}
      <Modal open={edit} onClose={() => setEdit(false)} label="Edit profile" className="cm-modal cm-small">
        <div className="cm-compose">
          <h2>Edit profile</h2>
          <label className="cm-field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={40} /></label>
          <label className="cm-field"><span>Role</span><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} maxLength={40} /></label>
          <label className="cm-field"><span>Bio</span><textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={160} /><small>{form.bio.length}/160</small></label>
          <div className="cm-compose-foot"><span /><button className="cm-btn" disabled={!form.name.trim()} onClick={() => { s.setMe(form); setEdit(false); toast("Profile updated", { icon: "check" }); }}>Save</button></div>
        </div>
      </Modal>
    </div>
  );
}

export default function CommonWeb() {
  const s = useCommon();
  const [page, setPage] = useState<Page>({ name: "home" });
  const [post, setPost] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ open: boolean; circle?: string }>({ open: false });
  const [story, setStory] = useState<number | null>(null);
  const go = (p: Page) => {
    setPage(p);
    scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const nav: [Page["name"], string, string, number?][] = [
    ["home", "home", "Home"],
    ["explore", "compass", "Explore"],
    ["circles", "people", "Circles"],
    ["messages", "chat", "Messages", s.unreadDm.length],
    ["notifications", "bell", "Activity", s.unreadNotes],
    ["saved", "bookmark", "Saved"],
    ["profile", "user", "Profile"],
  ];
  return (
    <div className="common cm-web">
      <aside className="cm-side">
        <button className="cm-logo" onClick={() => go({ name: "home" })}>common</button>
        <nav aria-label="COMMON">
          {nav.map(([k, i, l, n]) => (
            <button key={k} aria-current={page.name === k ? "page" : undefined} onClick={() => go({ name: k } as Page)}>
              {page.name === k && <motion.span layoutId="cm-nav" className="cm-nav-bg" transition={spring} />}
              <Icon name={i} size={22} fill={page.name === k && ["home", "bookmark", "bell"].includes(i)} />
              <span>{l}</span>
              {n ? <motion.b key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>{n}</motion.b> : null}
            </button>
          ))}
        </nav>
        <motion.button className="cm-btn big cm-create" onClick={() => setCompose({ open: true })} whileHover={{ rotate: -2 }} whileTap={{ scale: 0.95 }}><Icon name="plus" size={20} /> <span>Create</span></motion.button>
        <div className="cm-side-circles">
          <small>Your circles</small>
          {s.joined.map((id) => (
            <button key={id} onClick={() => go({ name: "circles", id })}><i style={{ background: C(id).color }} />{C(id).name}</button>
          ))}
          {!s.joined.length && <button onClick={() => go({ name: "circles" })}>Find circles →</button>}
        </div>
      </aside>
      <main className="cm-main">
        <AnimatePresence mode="wait">
          <motion.div key={JSON.stringify(page)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }}>
            {page.name === "home" && (
              <div className="cm-home">
                <Feed go={go} open={setPost} compose={() => setCompose({ open: true })} story={setStory} />
                <RightRail go={go} />
              </div>
            )}
            {page.name === "explore" && <Explore open={setPost} go={go} />}
            {page.name === "circles" && <Circles id={page.id} go={go} open={setPost} compose={(c) => setCompose({ open: true, circle: c })} />}
            {page.name === "messages" && <Messages id={page.id} go={go} />}
            {page.name === "notifications" && <Notifications go={go} open={setPost} />}
            {page.name === "saved" && <Profile id="me" go={go} open={setPost} saved />}
            {page.name === "profile" && <Profile id={page.id} go={go} open={setPost} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <PostModal id={post} onClose={() => setPost(null)} go={go} />
      <Composer open={compose.open} defaultCircle={compose.circle} onClose={() => setCompose({ open: false })} />
      <StoryViewer start={story} onClose={() => setStory(null)} />
      <Modal open={!s.onboarded} onClose={() => s.setOnboarded(true)} label="Welcome to COMMON" className="cm-modal cm-small">
        <Onboarding onDone={() => go({ name: "home" })} />
      </Modal>
    </div>
  );
}
