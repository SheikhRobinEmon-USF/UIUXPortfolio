# Portfolio implementation plan

A product-design portfolio for Sheikh Robin Emon with seven independent products, each with a case study, a full web app and a native-style mobile app.

1. Study the reference (robin-noguier.com) and record observations in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md).
2. Build a shared foundation: UI kit (sheets, drawers, modals, toasts, charts, motion helpers), shared browser storage, and a play shell that switches between Web and Mobile app.
3. Rebuild the homepage as a WebGL project slider with a loader, project index, overview grid, custom cursor and an image-expand transition into each case study.
4. Rebuild case studies with smooth scroll, scroll-linked type, live embedded web + phone prototypes, a pinned journey, captured key screens, the visual system and a scroll-to-continue handoff.
5. Build the seven products with distinct visual systems and complete flows on both platforms.
6. Verify with static checks, Playwright journeys, overflow checks, axe and Lighthouse; document results.

## Architecture

All source lives in `source/`; `npm run publish` writes the static site to the repository root for GitHub Pages.

- `app/` — routes: home, about, contact, `work/[slug]`, `play/[slug]`.
- `components/Home.tsx`, `components/home/` — slider, WebGL renderer (`gl.ts`) and cursor.
- `components/case/CaseStudy.tsx` — case-study page.
- `components/play/PlayShell.tsx` — platform switch, device frame, status bar, reset.
- `components/kit/` — icons, UI primitives, charts, shared store (`useStore`, `useNav`).
- `components/apps/<product>/` — `data.ts` (fixtures + store hook), `shared.tsx`, `Web.tsx`, `Mobile.tsx`, CSS.
- `lib/` — project registry, case-study copy, tours (flows per platform) and visual systems.
- `scripts/` — dev wrapper, Lighthouse audit, screen and motion capture.
