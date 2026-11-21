"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "../../kit/icons";
import { Sheet, Screen, useToast, ease, spring, Empty } from "../../kit/ui";
import { useNav, type Nav } from "../../kit/store";
import { C, U, circles, events, fmtK, shrink, stories, timeAgo, users, useCommon, type Post } from "./data";
import { Artwork, Av, LikeButton, Media, Onboarding, Poll, StoryViewer, critiqueTags } from "./shared";

function MPost({ p, nav, comments }: { p: Post; nav: Nav; comments: (id: string) => void }) {
  const s = useCommon();
  const toast = useToast();
  const liked = s.likes.includes(p.id);
  const [burst, setBurst] = useState(false);
  const last = useRef(0);
  const c = C(p.circle);
  return (
    <motion.article className="cmm-post" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
      <header>
        <button className="cm-post-author" onClick={() => nav.push("profile", { id: p.by })}>
          <Av id={p.by} size={36} ring={stories.some((x) => x.by === p.by)} seen={s.seenStories.includes(p.by)} />
          <span><strong>{p.by === "me" ? s.me.name : U(p.by).name}</strong><small>{p.ts ? timeAgo(p.ts) : p.ago} · <b style={{ color: c.color === "#d7f25c" ? "#5e6b12" : c.color }}>{c.name}</b></small></span>
        </button>
        <button className="cm-icon" aria-label="More" onClick={() => toast(s.save(p.id) ? "Saved" : "Unsaved", { icon: "bookmark" })}><Icon name="more" /></button>
      </header>
      {p.kind === "critique" && <div className="cm-critique-banner"><Icon name="sparkle" size={14} /> Feedback on <b>{p.focus?.join(" & ")}</b></div>}
      {p.kind !== "poll" && (p.img || p.art != null) && (
        <div
          className="cmm-media"
          onClick={() => {
            const n = Date.now();
            if (n - last.current < 300) {
              s.like(p.id, true);
              setBurst(true);
              setTimeout(() => setBurst(false), 850);
            }
            last.current = n;
          }}
        >
          <Media p={p} />
          <AnimatePresence>
            {burst && (
              <motion.span className="cm-dbl" initial={{ scale: 0, opacity: 0, rotate: -15 }} animate={{ scale: [0, 1.3, 1], opacity: 1, rotate: 0 }} exit={{ scale: 1.5, opacity: 0, y: -30 }} transition={{ duration: 0.45 }}>
                <Icon name="heart" size={88} fill stroke={0} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
      <p className={`cmm-text ${p.kind === "text" ? "big" : ""}`}>{p.text}</p>
      {p.kind === "poll" && <div className="cmm-pad"><Poll p={p} /></div>}
      <footer className="cm-post-actions">
        <LikeButton on={liked} count={p.likes + (liked ? 1 : 0)} onClick={() => s.like(p.id)} />
        <button className="cm-act" onClick={() => comments(p.id)}><Icon name="chat" size={20} /> {p.comments.length}</button>
        <button className="cm-act" onClick={() => toast("Shared to your story", { icon: "share" })}><Icon name="send" size={19} /></button>
        <span className="grow" />
        <button className={`cm-act ${s.saved.includes(p.id) ? "saved" : ""}`} onClick={() => s.save(p.id)} aria-label="Save"><Icon name="bookmark" size={20} fill={s.saved.includes(p.id)} /></button>
      </footer>
      {p.comments[0] && <button className="cm-preview-comment" onClick={() => comments(p.id)}><b>{U(p.comments[0].by).name.split(" ")[0]}</b> {p.comments[0].text}</button>}
    </motion.article>
  );
}

function HomeTab({ nav, comments, story }: { nav: Nav; comments: (id: string) => void; story: (i: number) => void }) {
  const s = useCommon();
  const [scope, setScope] = useState<"for" | "following">("for");
  const list = s.posts.filter((p) => scope === "for" || s.following.includes(p.by) || p.by === "me").sort((a, b) => b.ts - a.ts);
  return (
    <div className="ph-pad-top">
      <div className="cmm-top">
        <span className="cm-logo">common</span>
        <div>
          <button className="kit-icon-btn" aria-label="Messages" onClick={() => nav.push("dms")}>
            <Icon name="chat" />
            {s.unreadDm.length > 0 && <span className="cmm-badge">{s.unreadDm.length}</span>}
          </button>
        </div>
      </div>
      <div className="cmm-stories">
        <button className="cm-story-btn" onClick={() => nav.tab("create")}><span className="cm-av add"><Icon name="plus" size={22} /></span><small>You</small></button>
        {stories.map((st, i) => (
          <button key={st.by} className="cm-story-btn" onClick={() => story(i)}>
            <Av id={st.by} size={60} ring seen={s.seenStories.includes(st.by)} />
            <small>{U(st.by).name.split(" ")[0]}</small>
          </button>
        ))}
      </div>
      <div className="cmm-scope">
        {([["for", "For you"], ["following", "Following"]] as const).map(([k, l]) => (
          <button key={k} aria-selected={scope === k} role="tab" onClick={() => setScope(k)}>
            <span>{l}</span>
          </button>
        ))}
      </div>
      {list.map((p) => <MPost key={p.id} p={p} nav={nav} comments={comments} />)}
    </div>
  );
}

function ExploreTab({ nav }: { nav: Nav }) {
  const s = useCommon();
  const [q, setQ] = useState("");
  const posts = s.posts.filter((p) => !q || (p.text + C(p.circle).name).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="ph-pad-top">
      <div className="cmm-search"><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" /></div>
      <div className="ph-hscroll cmm-circles">
        {circles.map((c) => (
          <button key={c.id} style={{ background: c.color, color: c.ink }} onClick={() => nav.push("circle", { id: c.id })}>
            <Artwork seed={c.art} />
            <strong>{c.name}</strong>
            <small>{fmtK(c.members)} · {s.joined.includes(c.id) ? "Joined" : "Join"}</small>
          </button>
        ))}
      </div>
      <div className="cmm-grid">
        {posts.map((p) => (
          <button key={p.id} onClick={() => nav.push("post", { id: p.id })} className={p.kind === "text" || p.kind === "poll" ? "text" : ""}>
            {p.img || (p.art != null && p.kind !== "poll") ? <Media p={p} /> : <span style={{ background: C(p.circle).color, color: C(p.circle).ink }}>{p.text.slice(0, 70)}…</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function CircleScreen({ nav, comments }: { nav: Nav; comments: (id: string) => void }) {
  const s = useCommon();
  const toast = useToast();
  const c = C(nav.params.id);
  const joined = s.joined.includes(c.id);
  return (
    <div>
      <div className="cmm-circle-hero" style={{ background: c.color, color: c.ink }}>
        <Artwork seed={c.art} className="cmm-circle-art" />
        <button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button>
        <div>
          <h1>{c.name}</h1>
          <p>{c.desc}</p>
          <div className="cmm-circle-row">
            <span>{fmtK(c.members + (joined ? 1 : 0))} members</span>
            <motion.button className={`cm-btn ${joined ? "ghost" : "dark"}`} whileTap={{ scale: 0.92 }} onClick={() => { s.join(c.id); toast(joined ? "Left circle" : `Joined ${c.name}`, { icon: "people" }); }}>{joined ? "Joined ✓" : "Join"}</motion.button>
          </div>
        </div>
      </div>
      {events.filter((e) => e.circle === c.id).map((e) => (
        <div key={e.id} className="cmm-event">
          <span className="cm-event-date" style={{ background: c.color, color: c.ink }}><small>{e.when.split(",")[1].trim().split(" ")[0]}</small><b>{e.when.split(",")[1].trim().split(" ")[1]}</b></span>
          <div className="grow"><strong>{e.title}</strong><small>{e.where} · {e.going + (s.rsvps.includes(e.id) ? 1 : 0)} going</small></div>
          <button className={`cm-mini ${s.rsvps.includes(e.id) ? "on" : ""}`} onClick={() => s.rsvp(e.id)}>{s.rsvps.includes(e.id) ? "Going" : "RSVP"}</button>
        </div>
      ))}
      {s.posts.filter((p) => p.circle === c.id).map((p) => <MPost key={p.id} p={p} nav={nav} comments={comments} />)}
    </div>
  );
}

function PostScreen({ nav, comments }: { nav: Nav; comments: (id: string) => void }) {
  const s = useCommon();
  const p = s.posts.find((x) => x.id === nav.params.id);
  return (
    <div>
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>Post</strong><span /></div>
      {p ? <MPost p={p} nav={nav} comments={comments} /> : <Empty icon="info" title="Post removed" />}
    </div>
  );
}

function CreateTab({ nav }: { nav: Nav }) {
  const s = useCommon();
  const toast = useToast();
  const [kind, setKind] = useState<Post["kind"]>("image");
  const [text, setText] = useState("");
  const [circle, setCircle] = useState(s.joined[0] || "illo");
  const [img, setImg] = useState<string>();
  const [art, setArt] = useState(23);
  const [focus, setFocus] = useState<string[]>(["Colour"]);
  const [opts, setOpts] = useState(["", ""]);
  const ok = text.trim().length > 2 && (kind !== "poll" || opts.filter((o) => o.trim()).length >= 2);
  return (
    <div className="cmm-create ph-pad-top">
      <div className="cmm-create-top">
        <button className="cm-link" onClick={() => nav.tab("home")}>Cancel</button>
        <strong>New post</strong>
        <button
          className="cm-btn sm"
          disabled={!ok}
          onClick={() => {
            s.publish({ kind, text: text.trim(), circle, img: kind === "image" || kind === "critique" ? img : undefined, art: kind === "poll" || !img ? art : undefined, poll: kind === "poll" ? { options: opts.filter((o) => o.trim()), votes: opts.filter((o) => o.trim()).map(() => 0) } : undefined, focus: kind === "critique" ? focus : undefined });
            toast(`Posted to ${C(circle).name}`, { icon: "check" });
            nav.tab("home");
          }}
        >
          Post
        </button>
      </div>
      <div className="ph-chips cmm-kinds">
        {([["image", "Work"], ["critique", "Critique"], ["poll", "Poll"], ["text", "Thought"]] as [Post["kind"], string][]).map(([k, l]) => <button key={k} className="ph-chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}
      </div>
      {(kind === "image" || kind === "critique") && (
        <div className="cmm-create-media">
          {img ? <img src={img} alt="" /> : <Artwork seed={art} />}
          <div className="cmm-create-tools">
            <label className="cm-upload"><Icon name="image" size={18} /> Photo<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImg(await shrink(f)); }} /></label>
            <button className="cm-upload" onClick={() => { setImg(undefined); setArt(Math.floor(Math.random() * 90) + 5); }}><Icon name="refresh" size={18} /> New sketch</button>
          </div>
        </div>
      )}
      <textarea className="cmm-create-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={kind === "critique" ? "What should people look at?" : kind === "poll" ? "Ask a question…" : "Write a caption…"} aria-label="Post text" maxLength={400} />
      {kind === "critique" && <div className="cmm-pad"><div className="cm-tagpick">{critiqueTags.map((t) => <button key={t} aria-pressed={focus.includes(t)} onClick={() => setFocus(focus.includes(t) ? focus.filter((x) => x !== t) : [...focus, t])}>{t}</button>)}</div></div>}
      {kind === "poll" && (
        <div className="cmm-pad cmm-opts">
          {opts.map((o, i) => <input key={i} value={o} onChange={(e) => setOpts(opts.map((x, k) => (k === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} aria-label={`Option ${i + 1}`} />)}
          {opts.length < 4 && <button className="cm-link" onClick={() => setOpts([...opts, ""])}>+ Add option</button>}
        </div>
      )}
      <div className="ph-list cmm-list">
        <label className="ph-row"><Icon name="people" /><span className="grow">Circle</span><select value={circle} onChange={(e) => setCircle(e.target.value)} aria-label="Circle">{circles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      </div>
    </div>
  );
}

function ActivityTab({ nav }: { nav: Nav }) {
  const s = useCommon();
  useEffect(() => {
    const t = setTimeout(s.readAll, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="ph-pad-top">
      <h1 className="cmm-title">Activity</h1>
      {s.notes.map((n) => (
        <button key={n.id} className={`cm-note ${n.read ? "" : "unread"}`} onClick={() => (n.post ? nav.push("post", { id: n.post }) : n.kind === "follow" ? nav.push("profile", { id: n.by }) : nav.push("circle", { id: n.by }))}>
          <Av id={n.by} size={44} />
          <span className="grow"><b>{U(n.by)?.name || C(n.by)?.name}</b> {n.text}<small>{n.ago}</small></span>
          {n.kind === "follow" && <span className={`cm-mini ${s.following.includes(n.by) ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); s.follow(n.by); }}>{s.following.includes(n.by) ? "Following" : "Follow"}</span>}
        </button>
      ))}
    </div>
  );
}

function ProfileTab({ nav }: { nav: Nav }) {
  const s = useCommon();
  const toast = useToast();
  const id = nav.params.id || "me";
  const isMe = id === "me";
  const u = U(id);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(s.me);
  const posts = s.posts.filter((p) => p.by === id);
  return (
    <div className={nav.depth > 1 ? "" : "ph-pad-top"}>
      {nav.depth > 1 && <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>@{u.handle}</strong><span /></div>}
      <div className="cmm-profile">
        <Av id={id} size={86} ring={stories.some((x) => x.by === id)} />
        <div className="cmm-stats">
          <span><b>{posts.length}</b>posts</span>
          <span><b>{fmtK(u.followers + (!isMe && s.following.includes(id) ? 1 : 0))}</b>followers</span>
          <span><b>{isMe ? s.following.length : 180}</b>following</span>
        </div>
      </div>
      <div className="cmm-bio">
        <strong>{isMe ? s.me.name : u.name}</strong>
        <small>{isMe ? s.me.role : u.role}</small>
        <p>{isMe ? s.me.bio : u.bio}</p>
        {isMe ? (
          <button className="cm-btn ghost block" onClick={() => { setForm(s.me); setEdit(true); }}>Edit profile</button>
        ) : (
          <div className="cmm-btns">
            <motion.button className={`cm-btn ${s.following.includes(id) ? "ghost" : ""}`} whileTap={{ scale: 0.94 }} onClick={() => s.follow(id)}>{s.following.includes(id) ? "Following" : "Follow"}</motion.button>
            <button className="cm-btn ghost" onClick={() => nav.push("chat", { id })}>Message</button>
          </div>
        )}
      </div>
      <div className="cmm-grid">
        {posts.map((p) => (
          <button key={p.id} onClick={() => nav.push("post", { id: p.id })} className={p.kind === "text" || p.kind === "poll" ? "text" : ""}>
            {p.img || (p.art != null && p.kind !== "poll") ? <Media p={p} /> : <span style={{ background: C(p.circle).color, color: C(p.circle).ink }}>{p.text.slice(0, 60)}…</span>}
          </button>
        ))}
      </div>
      {!posts.length && <Empty icon="image" title="No posts yet" text={isMe ? "Tap + to share your first piece." : undefined} />}
      <Sheet open={edit} onClose={() => setEdit(false)} title="Edit profile">
        <div className="ph-field"><label htmlFor="cmm-n">Name</label><input id="cmm-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="ph-field"><label htmlFor="cmm-r">Role</label><input id="cmm-r" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        <div className="ph-field"><label htmlFor="cmm-b">Bio</label><textarea id="cmm-b" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        <button className="cm-btn block" onClick={() => { s.setMe(form); setEdit(false); toast("Saved", { icon: "check" }); }}>Save</button>
      </Sheet>
    </div>
  );
}

function DmsScreen({ nav }: { nav: Nav }) {
  const s = useCommon();
  return (
    <div>
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>Messages</strong><span /></div>
      <div className="ph-list cmm-list">
        {users.filter((u) => u.id !== "me").map((u) => {
          const t = s.threads[u.id];
          return (
            <button key={u.id} className="ph-row" onClick={() => nav.push("chat", { id: u.id })}>
              <Av id={u.id} size={48} />
              <span className="grow"><strong>{u.name}</strong><small>{t ? t[t.length - 1].text : "Tap to say hi"}</small></span>
              {s.unreadDm.includes(u.id) && <i className="cm-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatScreen({ nav }: { nav: Nav }) {
  const s = useCommon();
  const who = nav.params.id;
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    s.readDm(who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [s.threads, typing]);
  return (
    <div className="cmm-chat">
      <div className="ph-navbar"><button className="kit-icon-btn" onClick={nav.back} aria-label="Back"><Icon name="back" /></button><strong>{U(who).name}</strong><Av id={who} size={30} /></div>
      <div className="cm-msgs">
        {(s.threads[who] || []).map((m, i) => <motion.p key={i + m.text} className={m.me ? "me" : ""} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}>{m.text}</motion.p>)}
        {typing && <p className="cm-typing"><i /><i /><i /></p>}
        <div ref={end} />
      </div>
      <form className="cm-chat-input" onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; s.send(who, draft.trim(), () => setTyping(false)); setDraft(""); setTimeout(() => setTyping(true), 500); }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message…" aria-label="Message" />
        <button aria-label="Send" disabled={!draft.trim()}><Icon name="send" size={18} /></button>
      </form>
    </div>
  );
}

export default function CommonMobile() {
  const s = useCommon();
  const nav = useNav({ name: "home" });
  const [comments, setComments] = useState<string | null>(null);
  const [story, setStory] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<string>();
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [nav.route]);
  const p = s.posts.find((x) => x.id === comments);
  const tabs: [string, string, string][] = [["home", "home", "Home"], ["explore", "compass", "Explore"], ["create", "plus", ""], ["activity", "heart", "Activity"], ["profile", "user", "Profile"]];
  if (!s.onboarded)
    return (
      <div className="common ph-app cmm">
        <div className="ph-scroll ph-pad-top"><Onboarding onDone={() => nav.tab("home")} /></div>
      </div>
    );
  return (
    <div className="common ph-app cmm">
      <div className="ph-scroll" ref={scroller}>
        <Screen key={nav.screen + JSON.stringify(nav.params) + nav.depth} id={nav.screen} dir={nav.dir}>
          {nav.screen === "home" && <HomeTab nav={nav} comments={setComments} story={setStory} />}
          {nav.screen === "explore" && <ExploreTab nav={nav} />}
          {nav.screen === "create" && <CreateTab nav={nav} />}
          {nav.screen === "activity" && <ActivityTab nav={nav} />}
          {nav.screen === "profile" && <ProfileTab nav={nav} />}
          {nav.screen === "circle" && <CircleScreen nav={nav} comments={setComments} />}
          {nav.screen === "post" && <PostScreen nav={nav} comments={setComments} />}
          {nav.screen === "dms" && <DmsScreen nav={nav} />}
          {nav.screen === "chat" && <ChatScreen nav={nav} />}
        </Screen>
      </div>
      {!["chat", "create"].includes(nav.screen) && (
        <nav className="ph-tabs cmm-tabs" aria-label="COMMON">
          {tabs.map(([k, i, l]) =>
            k === "create" ? (
              <button key={k} className="cmm-plus" onClick={() => nav.tab("create")} aria-label="Create post">
                <motion.span whileTap={{ scale: 0.85, rotate: 90 }}><Icon name="plus" size={26} stroke={2.4} /></motion.span>
              </button>
            ) : (
              <button key={k} aria-current={nav.root === k ? "page" : undefined} onClick={() => nav.tab(k)}>
                <Icon name={i} size={24} fill={nav.root === k && k !== "explore"} />
                {l}
                {k === "activity" && s.unreadNotes > 0 && <span className="ph-badge">{s.unreadNotes}</span>}
              </button>
            ),
          )}
        </nav>
      )}
      <Sheet open={!!p} onClose={() => setComments(null)} title="Comments" className="cmm-comments">
        {p && (
          <>
            {p.kind === "critique" && <p className="cm-critique-banner"><Icon name="sparkle" size={14} /> {p.by === "me" ? "You asked" : `${U(p.by).name.split(" ")[0]} asked`} for feedback on {p.focus?.join(" & ")}</p>}
            {p.comments.map((c) => (
              <div key={c.id} className="cm-comment">
                <Av id={c.by} size={32} />
                <div className="grow">
                  <p><b>{U(c.by).name}</b> {c.tag && <em className="cm-tag">{c.tag}</em>} {c.text}</p>
                  <div className="cm-comment-meta"><span>{c.ago}</span><button onClick={() => s.likeComment(c.id)} className={s.cLikes.includes(c.id) ? "on" : ""}>{c.likes + (s.cLikes.includes(c.id) ? 1 : 0)} likes</button></div>
                  {c.replies?.map((r) => <div key={r.id} className="cm-comment reply"><Av id={r.by} size={24} /><p><b>{U(r.by).name}</b> {r.text}</p></div>)}
                </div>
              </div>
            ))}
            {!p.comments.length && <p className="cm-muted">Be the first to comment.</p>}
            <form className="cm-reply" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; s.addComment(p.id, text.trim(), tag); setText(""); setTag(undefined); }}>
              {p.kind === "critique" && <div className="cm-tagpick">{critiqueTags.map((t) => <button type="button" key={t} aria-pressed={tag === t} onClick={() => setTag(tag === t ? undefined : t)}>{t}</button>)}</div>}
              <div className="cm-reply-row"><Av id="me" size={30} /><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" aria-label="Comment" /><button disabled={!text.trim()}>Post</button></div>
            </form>
          </>
        )}
      </Sheet>
      <StoryViewer start={story} onClose={() => setStory(null)} />
    </div>
  );
}
