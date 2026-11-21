# Design systems

The parent portfolio uses near-black #111210, warm white, oversized tight sans-serif headlines, tiny widely tracked captions, a 24/56/20 desktop composition and a mobile touch-friendly selector. CSS perspective and transform transitions respect reduced-motion settings. The project registry owns the seven accent/ink tokens.

| Project | Color / ink | Typography and grid | Components and navigation | Interaction |
|---|---|---|---|---|
| ATELIER | #D7C5A9 / #302B23 | Georgia editorial, four-column catalogue, square corners | product, variant, gallery, bag, order history | detail reveal and zoom |
| COMMON | #E5ED82 / #182B26 | Sans, central feed with topic sidebar | post, composer, profile, messages, community filters | immediate publishing and reaction feedback |
| FRAME | #252B42 / #E4E4EE | Wide cinematic hero, portrait poster grid | title, episode menu, video controls, watchlist | title reveal and native playback |
| VITAL | #AFCEB3 / #173D35 | Sans, spacious rounded dashboard | daily time-range controls, habits, journal, timeline | live activity summary and habit feedback |
| MONETA | #BDC8ED / #172947 | Numerical hierarchy, compact dashboard | budgets, category bars, transactions, goals | linked category/range summaries |
| CRAVE | #F3A45D / #4A2319 | Bold sans, generous rounded warm catalogue | restaurant cards, customization, cart, timeline | priced extras and simulated delivery milestones |
| ROAM | #E0C4AC / #352D23 | Serif travel headlines, three-column listings | property, illustrative map, dates, booking summary | marker select and date-aware totals |

Spacing: 8px rhythm; dense controls may use 4px increments; responsive grid gaps 9–35px. Icons are text symbols paired with meaningful labels; wordmarks are original typography. Prototype CSS class scopes prevent cross-app token leakage. Layouts adapt at 950/600px; home at 840px. Inputs have labels, focus indicators, current/pressed states, and controls remain native where possible. Accessibility and exact contrast targets require browser verification. Original vector illustrations are local, reproducible assets, not photographs or captured product screenshots. The short sample video is original generated abstract motion.
