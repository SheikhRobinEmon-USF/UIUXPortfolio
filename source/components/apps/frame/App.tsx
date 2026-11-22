"use client";

import type { AppProps } from "../../play/PlayShell";
import Web from "./Web";
import Mobile from "./Mobile";
import "./frame.css";

export default function App({ view }: AppProps) {
  return view === "web" ? <Web /> : <Mobile />;
}
