import type { Metadata, Viewport } from "next";
import "./globals.css";
import { route } from "../lib/projects";

const f = route("/fonts/");
const faces = [
  ["Manrope", "manrope", "400 800", "normal"],
  ["Space Mono", "space-mono", "400", "normal"],
  ["Instrument Serif", "instrument-serif", "400", "normal"],
  ["Instrument Serif", "instrument-serif-italic", "400", "italic"],
  ["Fraunces", "fraunces", "100 900", "normal"],
  ["Fraunces", "fraunces-italic", "100 900", "italic"],
  ["Bricolage Grotesque", "bricolage", "200 800", "normal"],
  ["Space Grotesk", "space-grotesk", "300 700", "normal"],
  ["DM Sans", "dm-sans", "100 1000", "normal"],
  ["Inter Tight", "inter-tight", "100 900", "normal"],
  ["JetBrains Mono", "jetbrains-mono", "400", "normal"],
  ["Syne", "syne", "400 800", "normal"],
]
  .map(
    ([family, file, weight, style]) =>
      `@font-face{font-family:"${family}";src:url(${f}${file}.woff2) format("woff2");font-weight:${weight};font-style:${style};font-display:swap}`,
  )
  .join("");

export const metadata: Metadata = {
  title: "Sheikh Robin Emon — Product Designer",
  description:
    "Seven product design case studies — each with a complete, interactive web and mobile prototype.",
};
export const viewport: Viewport = {
  themeColor: "#0e0e0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{faces}</style>
        <link rel="preload" href={f + "manrope.woff2"} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={f + "instrument-serif.woff2"} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
