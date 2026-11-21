"use client";

import { asset } from "../../../lib/projects";
import { useStore, uid } from "../../kit/store";

export type User = { id: string; name: string; handle: string; role: string; color: string; bio: string; followers: number };
export type Circle = { id: string; name: string; color: string; ink: string; members: number; desc: string; rules: string[]; tag: string; art: number };
export type Comment = { id: string; by: string; text: string; tag?: string; likes: number; replies?: Comment[]; ago: string };
export type Post = {
  id: string;
  by: string;
  circle: string;
  kind: "image" | "critique" | "poll" | "text";
  text: string;
  img?: string;
  art?: number;
  likes: number;
  comments: Comment[];
  poll?: { options: string[]; votes: number[] };
  focus?: string[];
  ago: string;
  ts: number;
};
export type Event = { id: string; circle: string; title: string; when: string; where: string; going: number };
export type Msg = { me: boolean; text: string; t: number };
export type Note = { id: string; kind: "like" | "comment" | "follow" | "event" | "mention"; by: string; text: string; ago: string; read: boolean; post?: string };

const a = asset;

export const users: User[] = [
  { id: "me", name: "Robin Emon", handle: "robin", role: "Product designer", color: "#b9a6ff", bio: "Designing calm software. Sketching on weekends.", followers: 312 },
  { id: "mina", name: "Mina Park", handle: "minapark", role: "Illustrator", color: "#ff7a59", bio: "Colour, shape, too much gouache.", followers: 4820 },
  { id: "noah", name: "Noah Chen", handle: "noahshoots", role: "Film photographer", color: "#7bc5a5", bio: "Portra 400 and long walks.", followers: 2210 },
  { id: "ama", name: "Ama Mensah", handle: "ama.type", role: "Type designer", color: "#d7f25c", bio: "Drawing letters for a living.", followers: 1650 },
  { id: "kai", name: "Kai Ito", handle: "kai3d", role: "3D artist", color: "#6aa3ff", bio: "Soft materials, hard light.", followers: 3104 },
  { id: "lou", name: "Lou Bernard", handle: "lou.clay", role: "Ceramicist", color: "#e2b07a", bio: "Wheel-thrown, slightly wonky.", followers: 980 },
  { id: "zara", name: "Zara Ali", handle: "zaraux", role: "UX designer", color: "#f2a7c3", bio: "Accessibility first, always.", followers: 2640 },
];

export const circles: Circle[] = [
  { id: "illo", name: "Illustration Club", color: "#ff7a59", ink: "#2a0f06", members: 12400, desc: "Daily prompts, process threads and gentle critique for illustrators of every level.", rules: ["Credit references", "Critique the work, not the person", "No AI-generated work"], tag: "illustration", art: 3 },
  { id: "type", name: "Type Nerds", color: "#d7f25c", ink: "#1b2205", members: 6800, desc: "Letterforms, specimens, kerning crimes and the people who commit them.", rules: ["Share font licences", "Specimens over screenshots"], tag: "typography", art: 7 },
  { id: "film", name: "Film Photo", color: "#7bc5a5", ink: "#052117", members: 21300, desc: "Analog photography: rolls, scans, labs and light leaks.", rules: ["Note your film stock", "No heavy edits"], tag: "photography", art: 11 },
  { id: "clay", name: "Clay Studio", color: "#e2b07a", ink: "#2b1a08", members: 4100, desc: "Throwing, glazing and firing. Wonky pots welcome.", rules: ["Share glaze recipes when asked"], tag: "ceramics", art: 5 },
  { id: "ux", name: "UX Critique", color: "#b9a6ff", ink: "#160b3b", members: 9300, desc: "Structured feedback on flows, screens and prototypes.", rules: ["State what feedback you want", "Be specific and kind"], tag: "ux", art: 9 },
];

export const events: Event[] = [
  { id: "e1", circle: "illo", title: "Sunday sketch-along: shapes only", when: "Sun, Nov 23 · 11:00 AM", where: "Live room", going: 214 },
  { id: "e2", circle: "film", title: "Photo walk: Tampa Riverwalk", when: "Sat, Nov 29 · 4:30 PM", where: "Curtis Hixon Park", going: 38 },
  { id: "e3", circle: "ux", title: "Portfolio review night", when: "Wed, Dec 3 · 7:00 PM", where: "Live room", going: 96 },
  { id: "e4", circle: "type", title: "Kerning game tournament", when: "Thu, Dec 4 · 6:00 PM", where: "Live room", going: 57 },
];

const now = Date.now();
export const seedPosts: Post[] = [
  { id: "p1", by: "mina", circle: "illo", kind: "critique", text: "New editorial piece for a short story about reading in winter. I'm unsure about the background — does the green fight with the burgundy?", img: a("social.webp"), focus: ["Colour", "Composition"], likes: 184, ago: "2h", ts: now - 2 * 36e5, comments: [
    { id: "c1", by: "zara", text: "The green actually makes the dress glow. I'd keep it but darken the window light so the face reads first.", tag: "Colour", likes: 24, ago: "1h", replies: [{ id: "c1r", by: "mina", text: "Ooh, good call on the window. Trying it now.", likes: 6, ago: "52m" }] },
    { id: "c2", by: "kai", text: "Composition is lovely — the book creates a great diagonal.", tag: "Composition", likes: 11, ago: "40m" },
  ] },
  { id: "p2", by: "noah", circle: "film", kind: "image", text: "Lake fog at 6am. Portra 400, pushed one stop. Worth the alarm.", img: a("stays.webp"), likes: 342, ago: "4h", ts: now - 4 * 36e5, comments: [{ id: "c3", by: "lou", text: "The smoke from the chimney! Perfect timing.", likes: 8, ago: "3h" }] },
  { id: "p3", by: "ama", circle: "type", kind: "poll", text: "Settling a studio argument: which feels more ‘editorial’ for a magazine masthead?", art: 7, poll: { options: ["High-contrast serif", "Condensed grotesk", "Mono, all caps"], votes: [128, 74, 31] }, likes: 61, ago: "6h", ts: now - 6 * 36e5, comments: [] },
  { id: "p4", by: "kai", circle: "illo", kind: "image", text: "Material study: walnut, bouclé and a very lazy afternoon light.", img: a("studio.webp"), likes: 227, ago: "9h", ts: now - 9 * 36e5, comments: [] },
  { id: "p5", by: "zara", circle: "ux", kind: "text", text: "Hot take: an empty state is the first screen most people ever see. Design it like a homepage, not an error.", likes: 412, ago: "1d", ts: now - 24 * 36e5, comments: [{ id: "c4", by: "me", text: "Agree — and give it one clear next step.", likes: 19, ago: "20h" }] },
  { id: "p6", by: "lou", circle: "clay", kind: "image", text: "First firing of the season. Iron glaze came out darker than planned and I love it.", img: a("vase.webp"), likes: 96, ago: "1d", ts: now - 30 * 36e5, comments: [] },
];

export const stories: { by: string; frames: { img?: string; art?: number; text: string }[] }[] = [
  { by: "mina", frames: [{ art: 3, text: "Thumbnails for the winter series" }, { img: a("social.webp"), text: "…and the final!" }] },
  { by: "noah", frames: [{ img: a("still-earth-0.webp"), text: "Scanning last week's rolls" }, { img: a("still-earth-2.webp"), text: "Frame 21 is the one" }] },
  { by: "kai", frames: [{ img: a("chair-dark.webp"), text: "Cocoa bouclé render" }] },
  { by: "ama", frames: [{ art: 7, text: "Specimen proofs are in" }] },
  { by: "lou", frames: [{ img: a("vase.webp"), text: "Kiln opening day" }, { img: a("bowl.webp"), text: "(Also, lunch)" }] },
];

export const seedThreads: Record<string, Msg[]> = {
  mina: [{ me: false, text: "Thanks for the feedback on my piece! Are you coming to the sketch-along?", t: now - 3 * 36e5 }],
  zara: [{ me: true, text: "Loved your empty-state post.", t: now - 26 * 36e5 }, { me: false, text: "Thank you! Writing a longer version for the circle.", t: now - 25 * 36e5 }],
  noah: [{ me: false, text: "Which lab do you use for 120?", t: now - 50 * 36e5 }],
};

export const seedNotes: Note[] = [
  { id: "n1", kind: "like", by: "mina", text: "liked your comment", ago: "12m", read: false, post: "p5" },
  { id: "n2", kind: "follow", by: "kai", text: "started following you", ago: "1h", read: false },
  { id: "n3", kind: "event", by: "illo", text: "Sunday sketch-along starts in 2 days", ago: "3h", read: false },
  { id: "n4", kind: "comment", by: "zara", text: "replied: “And one clear next step — yes!”", ago: "20h", read: true, post: "p5" },
  { id: "n5", kind: "mention", by: "ama", text: "mentioned you in Type Nerds", ago: "2d", read: true, post: "p3" },
];

export const replies = [
  "Haha, totally. Let's chat more at the next meetup!",
  "Oh nice — send me a link when it's up 🙌",
  "Yes! I'll save you a spot.",
  "That's a great point, I hadn't thought of it that way.",
];

export const U = (id: string) => users.find((u) => u.id === id)!;
export const C = (id: string) => circles.find((c) => c.id === id)!;

export function useCommon() {
  const [posts, setPosts] = useStore<Post[]>("social", "posts", seedPosts);
  const [likes, setLikes] = useStore<string[]>("social", "likes", ["p4"]);
  const [saved, setSaved] = useStore<string[]>("social", "saved", []);
  const [votes, setVotes] = useStore<Record<string, number>>("social", "votes", {});
  const [following, setFollowing] = useStore<string[]>("social", "following", ["mina", "zara"]);
  const [joined, setJoined] = useStore<string[]>("social", "joined", []);
  const [onboarded, setOnboarded] = useStore<boolean>("social", "onboarded", false);
  const [rsvps, setRsvps] = useStore<string[]>("social", "rsvps", []);
  const [threads, setThreads] = useStore<Record<string, Msg[]>>("social", "threads", seedThreads);
  const [unreadDm, setUnreadDm] = useStore<string[]>("social", "unreadDm", ["mina"]);
  const [notes, setNotes] = useStore<Note[]>("social", "notes", seedNotes);
  const [seenStories, setSeenStories] = useStore<string[]>("social", "seenStories", []);
  const [me, setMe] = useStore<{ name: string; bio: string; role: string }>("social", "me", { name: "Robin Emon", bio: "Designing calm software. Sketching on weekends.", role: "Product designer" });
  const [cLikes, setCLikes] = useStore<string[]>("social", "commentLikes", []);

  const like = (id: string, force?: boolean) => {
    const on = force ?? !likes.includes(id);
    setLikes((l) => (on ? [...new Set([...l, id])] : l.filter((x) => x !== id)));
    return on;
  };
  const save = (id: string) => {
    let on = false;
    setSaved((s) => {
      on = !s.includes(id);
      return on ? [...s, id] : s.filter((x) => x !== id);
    });
    return on;
  };
  const vote = (id: string, i: number) => {
    if (votes[id] != null) return;
    setVotes((v) => ({ ...v, [id]: i }));
    setPosts((ps) => ps.map((p) => (p.id === id && p.poll ? { ...p, poll: { ...p.poll, votes: p.poll.votes.map((n, k) => (k === i ? n + 1 : n)) } } : p)));
  };
  const follow = (id: string) => setFollowing((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const join = (id: string) => setJoined((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));
  const rsvp = (id: string) => setRsvps((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  function addComment(postId: string, text: string, tag?: string, parent?: string) {
    const c: Comment = { id: uid("c"), by: "me", text, tag, likes: 0, ago: "now" };
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== postId
          ? p
          : parent
            ? { ...p, comments: p.comments.map((x) => (x.id === parent ? { ...x, replies: [...(x.replies || []), c] } : x)) }
            : { ...p, comments: [...p.comments, c] },
      ),
    );
  }
  function publish(p: Omit<Post, "id" | "by" | "likes" | "comments" | "ago" | "ts">) {
    const post: Post = { ...p, id: uid("p"), by: "me", likes: 0, comments: [], ago: "now", ts: Date.now() };
    setPosts((ps) => [post, ...ps]);
    return post;
  }
  const remove = (id: string) => setPosts((ps) => ps.filter((p) => p.id !== id));
  function send(to: string, text: string, onReply?: () => void) {
    setThreads((t) => ({ ...t, [to]: [...(t[to] || []), { me: true, text, t: Date.now() }] }));
    setTimeout(() => {
      setThreads((t) => ({ ...t, [to]: [...(t[to] || []), { me: false, text: replies[Math.floor(Math.random() * replies.length)], t: Date.now() }] }));
      onReply?.();
    }, 2200);
  }
  const readDm = (id: string) => setUnreadDm((u) => u.filter((x) => x !== id));
  const readAll = () => setNotes((n) => n.map((x) => ({ ...x, read: true })));
  const seeStory = (id: string) => setSeenStories((s) => [...new Set([...s, id])]);
  const likeComment = (id: string) => setCLikes((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const unreadNotes = notes.filter((n) => !n.read).length;
  return { posts, likes, like, saved, save, votes, vote, following, follow, joined, join, setJoined, onboarded, setOnboarded, rsvps, rsvp, threads, send, unreadDm, readDm, notes, readAll, unreadNotes, seenStories, seeStory, me, setMe, addComment, publish, remove, cLikes, likeComment };
}

/** Downscale an uploaded image to a small data URL so it can be stored locally. */
export function shrink(file: File, max = 720): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.78));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n));
export const timeAgo = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};
