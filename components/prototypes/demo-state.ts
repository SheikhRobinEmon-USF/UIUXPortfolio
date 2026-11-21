import { useEffect, useState } from "react";

export const today = "2026-11-21";
export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
  }, [key, value, ready]);
  return [value, setValue] as const;
}
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(value: number) {
  return currency.format(value);
}
