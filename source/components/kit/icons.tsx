import type { CSSProperties } from "react";

/* A small, consistent 24px stroke icon set shared by the seven products. */
const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4",
  heart:
    "M12 20s-7.5-4.6-9.2-9.1C1.6 7.6 3.8 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.3 0 5.5 3.1 4.3 6.4C19.5 15.4 12 20 12 20z",
  bag: "M5 8h14l-1 12H6zm3 0V7a4 4 0 0 1 8 0v1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c.8-3.9 4-6 8-6s7.2 2.1 8 6",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zm4 4h4",
  chat: "M4 5h16v11H9l-5 4z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  back: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  down: "M6 9l6 6 6-6",
  up: "M6 15l6-6 6 6",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z",
  filter: "M4 6h16M7 12h10M10 18h4",
  sliders:
    "M4 7h9m4 0h3M4 17h3m4 0h9M15 5v4M9 15v4",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zm0 0v14m6-12v14",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  grid: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
  calendar: "M4 6h16v14H4zm0 4h16M8 3v4m8-4v4",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 2",
  play: "M7 4.5v15l13-7.5z",
  pause: "M7 5h3.5v14H7zm6.5 0H17v14h-3.5z",
  download: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  check: "M5 12.5l4.5 4.5L19 7",
  share: "M12 3v12m-5-7 5-5 5 5M5 14v6h14v-6",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8 3-.1-1.3 2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.2-1.3L15 2h-4l-.4 2.4a8 8 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6L6 12l.1 1.3-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.2 1.3L11 22h4l.4-2.4a8 8 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6z",
  wallet: "M4 7h15a1 1 0 0 1 1 1v11H5a1 1 0 0 1-1-1zm0 0 12-3v3m-1 7h2",
  card: "M3 6h18v12H3zm0 4h18M6 15h4",
  send: "M4 12 20 4l-6 16-3-7z",
  out: "M7 17 17 7m-8 0h8v8",
  in: "M17 7 7 17m8 0H7V9",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  flame: "M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6z",
  moon: "M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z",
  drop: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  pulse: "M3 12h4l2-5 4 10 2-5h6",
  leaf: "M5 19C5 9 11 5 20 4c0 9-4 15-14 15zm0 0 8-8",
  film: "M4 4h16v16H4zM8 4v16M16 4v16M4 8h4m8 0h4M4 16h4m8 0h4M4 12h16",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 8v5m0-8h.01",
  lock: "M6 11h12v9H6zm2 0V8a4 4 0 0 1 8 0v3",
  pin: "M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5z",
  image: "M4 5h16v14H4zm0 11 5-5 4 4 2-2 5 5M15 9h.01",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0m-6 6v4",
  volume: "M4 9h4l5-4v14l-5-4H4zm12-1a5 5 0 0 1 0 8m2.5-10.5a8.5 8.5 0 0 1 0 13",
  mute: "M4 9h4l5-4v14l-5-4H4zm12 0 5 6m0-6-5 6",
  expand: "M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5",
  fwd: "M5 5v14l8-7zm8 0v14l8-7z",
  rew: "M19 5v14l-8-7zm-8 0v14l-8-7z",
  cc: "M3 6h18v12H3zm7 4.5a2 2 0 1 0 0 3m7-3a2 2 0 1 0 0 3",
  trash: "M5 7h14M10 7V4h4v3m-7 0 1 13h8l1-13",
  edit: "M4 20h4L19 9l-4-4L4 16zm9-13 4 4",
  refresh: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  gift: "M4 10h16v10H4zm-1-3h18v3H3zm9 0v13M12 7c-1-3-5-4-5-1.5S12 7 12 7zm0 0c1-3 5-4 5-1.5S12 7 12 7z",
  truck: "M3 6h11v10H3zm11 4h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zm3 5h6m-6 4h6m-6 4h3",
  chart: "M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeoff: "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.1 6.2C3.6 8 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-1",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  tag: "M3 12V4h8l10 10-8 8zm5-4h.01",
  bike: "M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15l4-7h5l3 7M9 8h3m3 0 1-3h2",
  scan: "M4 8V4h4m8 0h4v4m0 8v4h-4m-8 0H4v-4M8 12h8",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9c.6-3.4 3-5 6-5s5.4 1.6 6 5m1-9a3 3 0 1 0 0-6m2 15c-.3-2-1.3-3.4-2.8-4.2",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  bed: "M3 18V7m0 6h18v5M3 13V11a2 2 0 0 1 2-2h5v4m11 0v-2a2 2 0 0 0-2-2h-9",
  wifi: "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  car: "M5 11l2-5h10l2 5v6H5zm0 6v2m14-2v2M7.5 14h.01m9 0h.01",
  pool: "M2 18c2.5 0 2.5-1.5 5-1.5s2.5 1.5 5 1.5 2.5-1.5 5-1.5 2.5 1.5 5 1.5M7 15V5a2 2 0 0 1 4 0m2 10V5a2 2 0 0 1 4 0M7 9h6",
  coffee: "M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm13 1h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3m4-3v3",
  key: "M15 9a5 5 0 1 1-4.5 2.8L3 19v2h3v-2h2v-2h2l1.5-1.5",
  fork: "M7 3v8a2 2 0 0 0 2 2v8m0-18v6m4-6v8a2 2 0 0 1-2 2M17 3c-2 2-2 7 0 9v9",
  bowl: "M3 11h18a9 9 0 0 1-18 0zm4-4c0-1 1-2 2-2m3 2c0-1 1-2 2-2",
  smile: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h3m-4 13h7a3 3 0 0 0 3-3V9",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  apple: "M15.5 3.5c-1 .1-2.2.8-2.8 1.6-.6.7-1.1 1.8-.9 2.8 1.1 0 2.2-.6 2.8-1.4.7-.8 1.1-1.9.9-3zM18.8 16.6c-.5 1.2-.8 1.7-1.5 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.8.9-1.6 0-2.8-1.6-3.7-3C.4 15.5.1 11 1.7 8.6c1.1-1.7 2.9-2.7 4.6-2.7 1.7 0 2.8.9 4.2.9 1.4 0 2.2-.9 4.2-.9 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3-.1 8.5z",
  logout: "M10 4H5v16h5m4-12 4 4-4 4m4-4H9",
  repeat: "M4 11V9a3 3 0 0 1 3-3h12l-3-3m3 3-3 3M20 13v2a3 3 0 0 1-3 3H5l3 3m-3-3 3-3",
  split: "M6 3v6a6 6 0 0 0 6 6v6M18 3v6a6 6 0 0 1-6 6M3 6l3-3 3 3m6 0 3-3 3 3",
  snow: "M12 2v20M4 6l16 12M20 6 4 18",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z",
  water: "M7 3h10l-1.5 17h-7zm.5 6h9",
  stairs: "M4 20h4v-4h4v-4h4V8h4V4",
  run: "M13 4.5a1.5 1.5 0 1 0 0-.01M7 21l3-6 3 2v4m-2-8 1.5-5L9 9l-2 3m5.5-4 3.5 3 3 .5",
  yoga: "M12 5.5a1.5 1.5 0 1 0 0-.01M4 20h16M7 17l5-3 5 3M12 14V8m-6 2 6-2 6 2",
  brain: "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1",
  scale: "M5 4h14v16H5zm4 5a3 3 0 0 1 6 0zm3 0-1-2",
};

export type IconName = keyof typeof paths | string;

export function Icon({
  name,
  size = 20,
  stroke = 1.7,
  fill = false,
  className,
  style,
  label,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"icon " + (className || "")}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={paths[name] || paths.info} />
    </svg>
  );
}
