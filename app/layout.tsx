import type { Metadata } from "next";
import "./globals.css";
import { route } from "../lib/projects";

const fontRoot = route("/fonts/");
export const metadata: Metadata = {
  title: "Sheikh Robin Emon — Independent Product Designer",
  description:
    "Seven independent product design explorations. Interactive experiences, thoughtful systems and human-centered design.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`@font-face{font-family:Manrope;src:url(${fontRoot}manrope.woff2) format("woff2");font-weight:400 800;font-display:swap}@font-face{font-family:"Space Mono";src:url(${fontRoot}space-mono.woff2) format("woff2");font-weight:400;font-display:swap}`}</style>
        <link
          rel="preload"
          href={fontRoot + "manrope.woff2"}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
