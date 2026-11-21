# Sheikh Robin Emon · Selected work

A product-design portfolio with seven case studies. Every case study ships with a **complete, interactive web app and a native-style mobile app** built from the same local data — add something on the phone and it appears on the web.

## Run locally

Use Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Development runs at http://localhost:3000. For the production export, run `npm run build` and `npm run preview`, then open http://localhost:4173. The static site is generated in `out/`.

| Slug | Product | Web | Mobile app |
| --- | --- | --- | --- |
| ecommerce | ATELIER · Editorial commerce | Shop, filters, product detail, bag, 3-step checkout, tracking, returns | Stories, search, option sheet, swipe-to-pay, orders |
| social | COMMON · Creative communities | Onboarding, feed scopes, critique posts, polls, composer, circles, DMs | Stories, double-tap like, comment sheet, create tab, chat |
| streaming | FRAME · Cinematic discovery | Profiles, autoplay hero, hover previews, episodes, custom player | New & Hot, vertical clips, downloads, landscape player |
| health | VITAL · Personal wellness | Rings, heart, sleep stages, nutrition, breathing, habits, trends, journal | Live workout, breathing, water, habits, night-mode sleep |
| finance | MONETA · Personal finance | Net worth, accounts, transactions, budgets, subscriptions, goals, cards, transfers | Keypad pay with Face ID step, card carousel, plan |
| food | CRAVE · Local food delivery | Discovery, scroll-synced menu, required options, fees, live tracking, chat, rating | Collapsing header, dish sheet, cart bar, swipe to order, map sheet |
| stays | ROAM · Slow travel & stays | Range calendar, linked map/list, price histogram, listing, booking, trips, wishlists | Stepped search, map rail, swipe galleries, reserve bar, trips |

Routes: `/` (WebGL project slider), `/work/<slug>/` (case study), `/play/<slug>/?view=web|mobile` (prototype), `/about/`, `/contact/`. Phones open the mobile app by default; desktops open the web app and show the phone in a device frame beside “flows to try”.

All data is fictional and stored in the browser. **Reset demo** restores a prototype. No accounts, payments or network calls.

## Verification

```sh
npm run build
npm run test:static
npx playwright install chromium   # or set CHROMIUM_PATH
npm test
```

Playwright covers the homepage (index, keyboard, overview, navigation), case studies, the platform switch and shared state, every product's main web journey, five mobile journeys, horizontal overflow at 320–1920 px, and axe scans. `npm run audit -- / /work/food/` runs mobile Lighthouse. `npm run capture:screens` (with `npm run preview` running) regenerates the case-study captures in `public/media/cases/`.

## Stack

Next.js static export, React 19, TypeScript, [Motion](https://motion.dev) for animation and gestures, [Lenis](https://lenis.darkroom.engineering) for case-study smooth scroll, and a small hand-written WebGL renderer for the homepage slider. Fonts are self-hosted OFL families (licences in `public/fonts/`).

## Documentation

- [Master plan](MASTER_PLAN.md)
- [Reference analysis](REFERENCE_ANALYSIS.md)
- [Product design research](docs/PRODUCT_DESIGN_RESEARCH.md)
- [Design systems](DESIGN_SYSTEM.md)
- [Project status](PROJECT_STATUS.md)
- [Validation](docs/VALIDATION.md)
