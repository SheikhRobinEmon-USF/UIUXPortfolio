import { useState } from "react";
import { flushSync } from "react-dom";
import { asset } from "../../lib/projects";
import { useLocal } from "./demo-state";
type Post = {
  id: string;
  author: string;
  caption: string;
  community: string;
  likes: number;
  image: string;
  comments: string[];
  own?: boolean;
  flair?: string;
};
const initialPosts: Post[] = [
  {
    id: "p1",
    author: "Mina Park",
    caption: "A little study in color and form. What do you notice first?",
    community: "Art & design",
    flair: "Work in progress",
    likes: 18,
    image: "social.webp",
    comments: ["The palette is beautiful."],
  },
  {
    id: "p2",
    author: "Noah Chen",
    caption: "Weekend sketches from a quiet corner of the city.",
    community: "Photography",
    flair: "Field notes",
    likes: 9,
    image: "stays.webp",
    comments: [],
  },
];
export default function Social({
  screen,
  go,
  notify,
}: {
  screen: string;
  go: (s: string) => void;
  notify: (s: string) => void;
}) {
  const k = "sre:social:";
  const [posts, Posts] = useLocal(k + "posts", initialPosts);
  const [likes, Likes] = useLocal<string[]>(k + "likes", []);
  const [saved, Saved] = useLocal<string[]>(k + "saved", []);
  const [following, Following] = useLocal<string[]>(k + "following", []);
  const [profile, Profile] = useLocal(k + "profile", {
    name: "Robin",
    bio: "Curious about design, technology and everyday life.",
  });
  const [messages, Messages] = useLocal<string[]>(k + "messages", [
    "Mina: Welcome to Common!",
  ]);
  const [joined, setJoined] = useLocal<string[]>(k + "joined", [
    "Art & design",
  ]);
  const [updates, setUpdates] = useLocal<
    { id: string; text: string; read: boolean }[]
  >(k + "updates", [
    { id: "welcome", text: "Mina welcomed you to Common.", read: false },
  ]);
  const [feedOrder, setFeedOrder] = useState("Latest");
  const [flair, setFlair] = useState("Discussion");
  const [followingOnly, setFollowingOnly] = useState(false);
  const [composerTopic, setComposerTopic] = useState("Art & design");
  const [composerError, setComposerError] = useState("");
  const [query, Q] = useState("");
  const [topic, Topic] = useState("All");
  const [caption, Caption] = useState("");
  const [image, Image] = useState("");
  const [comment, Comment] = useState("");
  const [selected, Select] = useState("p1");
  const [draft, Draft] = useState("");
  const [name, Name] = useState(profile.name);
  const [bio, Bio] = useState(profile.bio);
  const toggle = (id: string, list: string[], set: (v: string[]) => void) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const communities = [
    {
      name: "Art & design",
      description: "Process notes, visual experiments and work in progress.",
      image: "social.webp",
    },
    {
      name: "Photography",
      description: "Light, composition and the stories a frame can tell.",
      image: "stays.webp",
    },
    {
      name: "Music",
      description: "Listening notes, field recordings and new discoveries.",
      image: "streaming.webp",
    },
    {
      name: "Travel",
      description: "Field notes for curious, slow-moving travelers.",
      image: "loft.webp",
    },
  ];
  const topics = communities.map((community) => community.name);
  function update(text: string) {
    setUpdates((old) =>
      [{ id: crypto.randomUUID(), text, read: false }, ...old].slice(0, 30),
    );
  }
  function openPost(id: string, snapshot = false) {
    const show = () => {
      Select(id);
      Comment("");
      go("Post");
    };
    if (
      snapshot &&
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(() => flushSync(show));
    } else show();
  }
  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setComposerError("Write a caption before publishing.");
      return;
    }
    Posts((p) => [
      {
        id: crypto.randomUUID(),
        author: profile.name,
        caption: caption.trim(),
        community: composerTopic,
        flair,
        own: true,
        likes: 0,
        image,
        comments: [],
      },
      ...p,
    ]);
    Caption("");
    Image("");
    Topic("All");
    Q("");
    setFollowingOnly(false);
    setComposerError("");
    setFlair("Discussion");
    update(`You posted in ${composerTopic}.`);
    go("Feed");
    notify("Your post is live in this demo.");
  };
  const details = posts.find((p) => p.id === selected);
  const post = (p: Post) => (
    <article className="post" key={p.id}>
      <div className="post-author">
        <span className="avatar">{p.author.slice(0, 2).toUpperCase()}</span>
        <div>
          <b>{p.own ? profile.name : p.author}</b>
          <small>{p.community} · Creative circle</small>
        </div>
        {!p.own && (
          <button
            aria-pressed={following.includes(p.author)}
            onClick={() => {
              toggle(p.author, following, Following);
              if (!following.includes(p.author))
                update(`You followed ${p.author}.`);
            }}
          >
            {following.includes(p.author) ? "Following" : "Follow"}
          </button>
        )}
      </div>
      {p.image && (
        <button
          className="art-button"
          aria-label={`Open post by ${p.author}`}
          style={{
            viewTransitionName: p.id === selected ? "common-post" : undefined,
          }}
          onClick={() => openPost(p.id, true)}
        >
          <img
            src={p.image.startsWith("data:") ? p.image : asset(p.image)}
            alt="Creative post image"
            loading="lazy"
            decoding="async"
          />
        </button>
      )}
      <p>{p.caption}</p>
      {p.flair && <span className="post-flair">{p.flair}</span>}
      <div className="post-actions">
        <button
          aria-pressed={likes.includes(p.id)}
          onClick={() => {
            toggle(p.id, likes, Likes);
            if (!likes.includes(p.id))
              update(`You liked a post by ${p.author}.`);
          }}
        >
          Like · {p.likes + (likes.includes(p.id) ? 1 : 0)}
        </button>
        <button
          aria-label={`Comments (${p.comments.length})`}
          onClick={() => openPost(p.id)}
        >
          Comments ({p.comments.length})
        </button>
        <button
          aria-pressed={saved.includes(p.id)}
          onClick={() => toggle(p.id, saved, Saved)}
        >
          {saved.includes(p.id) ? "Saved" : "Save"}
        </button>
      </div>
      {screen === "Post" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim()) {
              Posts((old) =>
                old.map((q) =>
                  q.id === p.id
                    ? { ...q, comments: [...q.comments, comment] }
                    : q,
                ),
              );
              Comment("");
              update(`You commented on a post in ${p.community}.`);
            }
          }}
        >
          {p.comments.map((c, i) => (
            <p key={i} className="comment">
              {c}
            </p>
          ))}
          <label>
            Add comment
            <input
              required
              value={comment}
              onChange={(e) => Comment(e.target.value)}
            />
          </label>
          <button className="action">Send comment</button>
        </form>
      )}
    </article>
  );
  if (screen === "Create")
    return (
      <section className="composer panel">
        <h1>Make something worth sharing.</h1>
        <form onSubmit={publish}>
          <label>
            Community
            <select
              value={composerTopic}
              onChange={(e) => setComposerTopic(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Post type
            <select
              value={flair}
              onChange={(event) => setFlair(event.target.value)}
            >
              <option>Discussion</option>
              <option>Work in progress</option>
              <option>Field notes</option>
              <option>Question</option>
            </select>
          </label>
          <label>
            Caption
            <textarea
              required
              maxLength={500}
              value={caption}
              onChange={(e) => Caption(e.target.value)}
              placeholder="What's on your mind?"
            />
          </label>
          <label>
            Choose local image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                Image("");
                setComposerError("");
                if (!file) return;
                if (
                  ![
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "image/gif",
                  ].includes(file.type) ||
                  file.size > 650_000
                ) {
                  setComposerError(
                    "Choose a PNG, JPG, WebP or GIF under 650 KB.",
                  );
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => Image(String(reader.result));
                reader.onerror = () =>
                  setComposerError(
                    "The image could not be read. Try another file.",
                  );
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {image && (
            <>
              <img src={image} alt="Post preview" />
              <button type="button" onClick={() => Image("")}>
                Remove image
              </button>
            </>
          )}
          {composerError && <p role="alert">{composerError}</p>}
          <button className="action">Publish post</button>
        </form>
      </section>
    );
  if (screen === "Post")
    return (
      <section className="social-feed">
        <button onClick={() => go("Feed")}>← Feed</button>
        {details && post(details)}
      </section>
    );
  if (screen === "Messages")
    return (
      <section className="panel">
        <h1>Conversations</h1>
        {messages.map((m, i) => (
          <p className="comment" key={i}>
            {m}
          </p>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              Messages((m) => [...m, profile.name + ": " + draft]);
              Draft("");
              update("You sent a message to Mina.");
              notify("Message sent in this demo.");
            }
          }}
        >
          <label>
            Message to Mina
            <input
              required
              value={draft}
              onChange={(e) => Draft(e.target.value)}
            />
          </label>
          <button className="action">Send message</button>
        </form>
      </section>
    );
  if (screen === "Notifications")
    return (
      <section className="notifications">
        <h1>Activity</h1>
        <p>{updates.filter((item) => !item.read).length} unread updates</p>
        <button
          className="action"
          disabled={updates.every((item) => item.read)}
          onClick={() =>
            setUpdates((list) => list.map((item) => ({ ...item, read: true })))
          }
        >
          Mark all as read
        </button>
        <ul>
          {updates.map((item) => (
            <li key={item.id} className="comment">
              <b>{item.text}</b> <span>{item.read ? "Read" : "New"}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  if (screen === "Communities")
    return (
      <section>
        <h1>Find a circle.</h1>
        <p>
          Join a small community built around what you make, notice and share.
        </p>
        <div className="community-grid">
          {communities.map((item) => (
            <article className="panel" key={item.name}>
              <img src={asset(item.image)} alt="" loading="lazy" />
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <div className="community-actions">
                <button
                  className="action"
                  onClick={() => {
                    Topic(item.name);
                    Q("");
                    go("Explore");
                  }}
                >
                  Explore {item.name}
                </button>
                <button
                  aria-pressed={joined.includes(item.name)}
                  onClick={() => {
                    toggle(item.name, joined, setJoined);
                    if (!joined.includes(item.name))
                      update(`You joined ${item.name}.`);
                  }}
                >
                  {joined.includes(item.name) ? "Joined" : "Join circle"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  if (screen === "Profile" || screen === "Edit profile")
    return (
      <section>
        <h1>{profile.name}.</h1>
        <p>{profile.bio}</p>
        <p>{following.length} following</p>
        {screen === "Profile" ? (
          <>
            <button
              className="action"
              onClick={() => {
                Name(profile.name);
                Bio(profile.bio);
                go("Edit profile");
              }}
            >
              Edit profile
            </button>
            {posts.filter((p) => p.own || p.author === profile.name).map(post)}
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              Profile({ name: name.trim(), bio: bio.trim() });
              notify("Profile updated.");
              go("Profile");
            }}
          >
            <label>
              Name
              <input
                required
                value={name}
                onChange={(e) => Name(e.target.value)}
              />
            </label>
            <label>
              Bio
              <textarea value={bio} onChange={(e) => Bio(e.target.value)} />
            </label>
            <button className="action">Save profile</button>
          </form>
        )}
      </section>
    );
  const shown = posts
    .filter(
      (p) =>
        (screen !== "Saved" || saved.includes(p.id)) &&
        (screen !== "Feed" ||
          !followingOnly ||
          p.own ||
          following.includes(p.author) ||
          joined.includes(p.community)) &&
        (topic === "All" || p.community === topic) &&
        `${p.caption} ${p.author} ${p.community}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((first, second) =>
      feedOrder === "Popular"
        ? second.likes +
          Number(likes.includes(second.id)) -
          first.likes -
          Number(likes.includes(first.id))
        : 0,
    );
  return (
    <section className="social-layout">
      <aside className="social-sidebar">
        <h2>Your circles</h2>
        <button className="action" onClick={() => go("Create")}>
          ＋ Create post
        </button>
        <div className="circle-links">
          {["All", ...topics].map((t) => (
            <button key={t} aria-pressed={topic === t} onClick={() => Topic(t)}>
              <span className="circle-icon" aria-hidden="true">
                {t === "All" ? "◈" : t.slice(0, 1)}
              </span>
              {t === "All" ? "All circles" : t}
            </button>
          ))}
        </div>
        <button className="outline" onClick={() => go("Communities")}>
          Browse circles
        </button>
      </aside>
      <div className="social-feed">
        <div className="section-heading">
          <div>
            <span className="kicker">COMMON COMMUNITY</span>
            <h1>{topic === "All" ? screen : topic}</h1>
          </div>
        </div>
        {screen === "Feed" && (
          <div className="chips">
            <button
              aria-pressed={!followingOnly}
              onClick={() => setFollowingOnly(false)}
            >
              For you
            </button>
            <button
              aria-pressed={followingOnly}
              onClick={() => setFollowingOnly(true)}
            >
              Following & circles
            </button>
          </div>
        )}
        <div className="social-toolbar">
          <label>
            Search
            <input
              type="search"
              value={query}
              onChange={(event) => Q(event.target.value)}
              placeholder="Find a post or creator"
            />
          </label>
          <label>
            Sort
            <select
              value={feedOrder}
              onChange={(event) => setFeedOrder(event.target.value)}
            >
              <option>Latest</option>
              <option>Popular</option>
            </select>
          </label>
        </div>
        {screen === "Feed" && (
          <button className="composer-starter" onClick={() => go("Create")}>
            <span className="avatar" aria-hidden="true">
              {profile.name.slice(0, 2).toUpperCase()}
            </span>
            <span>Share something with your circle</span>
            <b aria-hidden="true">＋</b>
          </button>
        )}
        {shown.length ? (
          shown.map(post)
        ) : (
          <div className="empty">No posts in this view yet.</div>
        )}
      </div>
      <aside className="social-right">
        <div className="social-summary">
          <h2>{profile.name}</h2>
          <p>
            {joined.length} {joined.length === 1 ? "circle" : "circles"} ·{" "}
            {following.length} following
          </p>
          <button onClick={() => go("Profile")}>View profile</button>
        </div>
        <div className="social-summary">
          <h2>Your activity</h2>
          <p>
            {updates.filter((update) => !update.read).length} unread
            notifications
          </p>
          <button onClick={() => go("Notifications")}>Open activity</button>
        </div>
      </aside>
    </section>
  );
}
