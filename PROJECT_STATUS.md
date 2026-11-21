# Project status · 21 November 2026

| Phase | Status and evidence |
| --- | --- |
| 0 · Reference and plan | The nine case studies were reviewed through indexed text. Four also exposed full content in the live browser. The reference homepage errored, so implementation used the behavior specified in the brief. |
| 1 · Portfolio foundation | Next.js static export, project registry, 17 routes, scoped prototype code and browser-local state. |
| 2 · Cinematic homepage | Seven original project previews, perspective stack, direct selector, keyboard, wheel, touch, history and reduced motion. |
| 3 · ATELIER | Browse, gallery, variants and size, wishlist, bag, promo, checkout and order history. |
| 4 · COMMON | Feed, explore, circles, local-image composer, posting, comments, profile, messaging and activity. |
| 5 · FRAME | Browse and shelves, title detail, viewer selection, watchlist, history, playback and episode captions. |
| 6 · VITAL | Dated activity, sleep and nutrition logs, habits, goals, trend controls, journal and preferences. |
| 7 · MONETA | Fictional accounts, transactions, analytics, budgets, recurring expenses, savings and local transfers. |
| 8 · CRAVE | Restaurant discovery, menus, meal options, cart, local checkout, tracked events and reorder. |
| 9 · ROAM | Destination browse, filters, linked map/list, property detail, date and capacity validation, booking and trip management. |
| 10 · Case studies | Seven studies. Each includes the implemented journey, references, design rationale and two actual prototype captures. |
| 11 · Portfolio polish | About and Contact, shared-element motion, responsive project picker and previous/next navigation. |
| 12 · Validation | Production build, static checks and 17 Playwright tests. Axe results, nine mobile Lighthouse audits and captured motion are recorded in [validation](docs/VALIDATION.md). |

## Known limits

- Five of the nine measured routes exceeded the 2.5-second simulated-mobile LCP target. Their scores and metrics are recorded in the validation report.
- The reference homepage rendered an error. The separate “UI UX Portfolio Links” chat and reference screenshot were unavailable in this session.
- The prototypes use synthetic data and in-browser simulations. Case study hypotheses and personas are illustrative. No recruited usability sessions or business outcomes were reported.

## Reproduction

Run `npm ci`, `npm run build`, `npm run test:static`, and `npm test` after installing Playwright Chromium. The browser suite captures portfolio documentation images. Rebuild the static export to incorporate new captures. Use `npm run audit` for repeatable lab metrics. Source and hosting settings live in this repository, with `.openai/hosting.json` identifying the owner-private Sites project.
