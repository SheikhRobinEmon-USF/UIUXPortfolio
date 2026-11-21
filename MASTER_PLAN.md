# Portfolio implementation plan

Build a standalone portfolio for Sheikh Robin Emon in `SheikhRobinEmon-USF/UIUXPortfolio`. It presents seven independent products through a common project index and separate case-study and prototype routes.

1. Inspect Robin Noguier’s portfolio and the supplied brief. Record live observations, indexed evidence and inferences in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md).
2. Build the static Next.js route structure and a project registry. Use an editorial index with a perspective stack, direct selection and responsive interaction.
3. Implement ATELIER, COMMON, FRAME, VITAL, MONETA, CRAVE and ROAM. Use each app’s own navigation and presentation, with deterministic seed data and a resettable storage namespace.
4. Document each project’s design decisions, assumptions, primary user flow, information architecture and visual system. Include footage or screenshots from the implemented products.
5. Run static, Playwright, axe and Lighthouse checks. Inspect the seven target widths from 320 to 1920 pixels.
6. Version the source and publish a private review site through Sites. Keep the delivery status and any limits in [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Architecture

- `app/` owns the portfolio, about, contact, case study and prototype routes.
- `components/Home.tsx` handles homepage selection and motion.
- `components/Prototype.tsx` provides return navigation, status announcements and reset. It loads independent catalog, community and ledger modules on demand.
- `components/prototypes/` contains workflows and reusable product components. The shared storage utility scopes records by app.
- `lib/projects.ts` and `lib/case-studies.ts` contain the registry and editorial content.
- `public/media/` holds original artwork, sample clips, captions and browser captures.
- `tests/` and `scripts/` verify the production export and generate evidence.
