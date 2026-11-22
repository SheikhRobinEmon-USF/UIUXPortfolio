"use client";

import { useEffect } from "react";

type NavigationTransitionEvent = Event & {
  activation?: { entry?: { url?: string }; from?: { url?: string } };
  viewTransition?: ViewTransition;
};

export default function PortfolioTransitions({
  nextPath,
}: {
  nextPath?: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function leaving(raw: Event) {
      const event = raw as NavigationTransitionEvent;
      if (!event.viewTransition) return;
      if (motion.matches) {
        event.viewTransition.skipTransition();
        return;
      }
      const destination = event.activation?.entry?.url;
      if (
        destination &&
        nextPath &&
        new URL(destination).pathname === nextPath
      ) {
        root.dataset.portfolioTransition = "next";
      }
    }

    function entering(raw: Event) {
      delete root.dataset.portfolioTransition;
      if (motion.matches)
        (raw as NavigationTransitionEvent).viewTransition?.skipTransition();
    }

    window.addEventListener("pageswap", leaving);
    window.addEventListener("pagereveal", entering);
    window.addEventListener("pageshow", entering);
    return () => {
      window.removeEventListener("pageswap", leaving);
      window.removeEventListener("pagereveal", entering);
      window.removeEventListener("pageshow", entering);
      delete root.dataset.portfolioTransition;
    };
  }, [nextPath]);

  return null;
}
