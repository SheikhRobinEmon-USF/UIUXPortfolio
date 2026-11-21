# Sheikh Robin Emon · Selected work

A standalone design portfolio with seven independent case studies and working, browser-local prototypes.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Development runs at http://localhost:3000. For a production preview, run `npm run build` and `npm run preview`, then open http://localhost:4173. The static site is generated in `out/`.

| Slug | Project |
| --- | --- |
| ecommerce | ATELIER · Editorial commerce |
| social | COMMON · Creative communities |
| streaming | FRAME · Cinematic discovery |
| health | VITAL · Personal wellness |
| finance | MONETA · Personal finance |
| food | CRAVE · Local food delivery |
| stays | ROAM · Slow travel and stays |

The homepage is `/`. See `/about/` and `/contact/` for the designer profile and contact. Each project has a `/work/<slug>/` case study and a `/play/<slug>/` prototype. Each route supports direct visits and refreshes.

Each prototype uses fictional data and client-side state. **Reset demo data** restores the current prototype. The demos require no accounts or API keys. Purchases, transfers, messages, delivery events and reservations are local simulations.

## Verification

```sh
npm run build
npm run test:static
npx playwright install chromium
npm test
npm run build
```

Playwright verifies the product flows and refresh/persistence behavior, runs axe scans and captures the browser screenshots used by the case studies. The final build incorporates new captures. The seven target widths are 320, 375, 430, 768, 1024, 1440 and 1920 px. Set `CHROMIUM_PATH` if using a system Chromium instead of the Playwright-managed browser.

Run `npm run audit` with `CHROMIUM_PATH` set if needed for the mobile Lighthouse audit. Pass paths to audit particular routes, for example `npm run audit -- / /work/stays/`. Raw reports go to `test-results/lighthouse/` by default.

Run `npm run capture:motion` after installing Playwright Chromium to regenerate the project transition recording in `docs/`.

## Media and hosting

All illustrative photos and graphics are original or generated for the project. FRAME includes twelve short, locally served original motion studies with descriptive English captions. The case-study images are browser captures of working prototypes. Font license files are included under `public/fonts/`.

The ChatGPT Sites manifest deploys the `out/` export. Optional `NEXT_PUBLIC_BASE_PATH=/UIUXPortfolio npm run build` configures static links for subdirectory hosting.

## Documentation

- [Master plan](MASTER_PLAN.md)
- [Reference analysis](REFERENCE_ANALYSIS.md)
- [Design systems](DESIGN_SYSTEM.md)
- [Project status](PROJECT_STATUS.md)
