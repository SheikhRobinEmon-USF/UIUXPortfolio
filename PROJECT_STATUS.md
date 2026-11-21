# Project status · 21 November 2026

| Area | Status |
| --- | --- |
| Foundation | Shared UI kit, motion helpers, charts, local store shared across platforms, play shell with Web / Mobile app switch, device frame and live status bar. |
| Homepage | Loader with real texture progress, WebGL slider (inertia, velocity bend, RGB split, pointer ripple), per-project colour, letter-by-letter titles, project index, overview grid (G / Esc), custom cursor, image-expand transition, touch swipe and reduced-motion fallback. |
| Case studies | Smooth scroll, scroll-lit overview, live embedded web + phone prototypes, pinned horizontal journey, captured key screens, wireframes, visual system, outcome and a scroll-to-continue handoff to the next project. |
| ATELIER | Web and mobile complete (see README). |
| COMMON | Web and mobile complete. |
| FRAME | Web and mobile complete. |
| VITAL | Web and mobile complete. |
| MONETA | Web and mobile complete. |
| CRAVE | Web and mobile complete. |
| ROAM | Web and mobile complete. |
| Validation | 19 Playwright tests, static checks, axe, overflow at seven widths, Lighthouse sample — see [validation](docs/VALIDATION.md). |

## Known limits

- robin-noguier.com could not be loaded from the build environment (network blocked); the interaction language follows the recorded analysis in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md).
- All products use fictional data, simulated payments, couriers, heart rate and messaging. Personas and hypotheses are illustrative; no usability study was run.
- Some product imagery is shared or colour-tinted across products because the asset library is small; colourways in ATELIER are CSS tints of one photograph.
- Simulated-mobile LCP is around 3.0–3.5 s on the measured routes (image- and font-heavy pages).
