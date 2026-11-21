"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser-local state shared between every component (and between the web
 * and mobile versions of a product) that uses the same key. Writes are
 * broadcast with a custom event so two mounted readers stay in sync.
 */
const EVENT = "sre:store";
type Detail = { key: string; value: unknown };

function read<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw) as T;
  } catch {}
  return initial;
}

export function useStore<T>(app: string, name: string, initial: T) {
  const key = `sre:${app}:${name}`;
  // Read synchronously on first render (prototypes are client-only), so a
  // freshly mounted screen sees records written moments ago by another one.
  const [value, setValue] = useState<T>(() => (typeof window === "undefined" ? initial : read(key, initial)));
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    setValue(read(key, initial));
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<Detail>).detail;
      if (detail.key === key) setValue(detail.value as T);
    };
    const onReset = () => setValue(initial);
    window.addEventListener(EVENT, onChange);
    window.addEventListener(`sre:reset:${app}`, onReset);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener(`sre:reset:${app}`, onReset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (current: T) => T)(latest.current)
          : next;
      latest.current = resolved;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {}
      window.dispatchEvent(
        new CustomEvent<Detail>(EVENT, { detail: { key, value: resolved } }),
      );
    },
    [key],
  );

  return [value, update] as const;
}

export function resetApp(app: string) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(`sre:${app}:`)) localStorage.removeItem(k);
    }
  } catch {}
  window.dispatchEvent(new Event(`sre:reset:${app}`));
}

/** A tiny navigation stack for in-app screens, with push/pop direction. */
export type Route = { name: string; params?: Record<string, any> };
export function useNav(initial: Route) {
  const [stack, setStack] = useState<Route[]>([initial]);
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const current = stack[stack.length - 1];
  const push = useCallback((name: string, params?: Record<string, any>) => {
    setDir(1);
    setStack((s) => [...s, { name, params }]);
  }, []);
  const back = useCallback(() => {
    setDir(-1);
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  /** Switch tabs / top-level destinations: resets the stack. */
  const tab = useCallback((name: string, params?: Record<string, any>) => {
    setDir(0);
    setStack([{ name, params }]);
  }, []);
  const replace = useCallback(
    (name: string, params?: Record<string, any>) => {
      setDir(1);
      setStack((s) => [...s.slice(0, -1), { name, params }]);
    },
    [],
  );
  return {
    route: current,
    screen: current.name,
    params: current.params || {},
    depth: stack.length,
    root: stack[0].name,
    dir,
    push,
    back,
    tab,
    replace,
  };
}
export type Nav = ReturnType<typeof useNav>;

export const fmt = {
  money: (n: number, digits = 2) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n),
  num: (n: number, digits = 0) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(n),
  date: (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
    new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("en-US", opts),
};

export const TODAY = "2026-11-21";
export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}
