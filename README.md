# Sheikh Robin Emon — Design & Interaction

Independent UI/UX portfolio with seven original frontend concept applications. Not connected to the existing professional portfolio.

## Run locally

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. For a static production build: `npm run build` then `npm run preview` (port 4173).

## Routes

Home `/`, profile `/about/`, contact `/contact/`. Each of the following has a case-study route `/work/<slug>/` and prototype route `/play/<slug>/`:

| Slug | Concept |
|---|---|
| ecommerce | ATELIER — editorial commerce |
| social | COMMON — creative communities |
| streaming | FRAME — cinematic discovery |
| health | VITAL — wellness |
| finance | MONETA — budgeting |
| food | CRAVE — delivery |
| stays | ROAM — travel booking |

All data and transactions are simulated. Prototype namespaced browser local storage persists appropriate demo state; each has a reset option. No accounts, external credentials or paid APIs.

## Validation and deployment

`npm run build` produces a static `out/` directory. `npm test` executes Playwright browser checks (after installing Chromium via `npx playwright install chromium`). It generates actual screenshots for the cases. Rebuild to include them. Optional `NEXT_PUBLIC_BASE_PATH=/UIUXPortfolio npm run build` supports project-site hosting such as GitHub Pages. See PROJECT_STATUS.md for actual validation results and remaining acceptance work.

## Documentation

- [Master plan](MASTER_PLAN.md)
- [Reference analysis](REFERENCE_ANALYSIS.md)
- [Design systems](DESIGN_SYSTEM.md)
- [Project status and outstanding acceptance items](PROJECT_STATUS.md)
