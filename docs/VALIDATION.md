# Validation · 21 November 2026

The production export builds all 17 requested routes. The static checks verify that case studies link to their matching demos, each demo links back, each study includes two browser captures, and all twelve FRAME clips include local captions.

Playwright exercises seven primary product journeys, local persistence and reset, checkout and input validation, empty states, browser history, keyboard input, reduced motion, and the homepage swipe-to-open interaction. The case studies and prototypes were checked for horizontal overflow at 320, 375, 430, 768, 1024, 1440 and 1920 px. Axe found zero WCAG 2.0 and 2.1 A/AA violations on the 17 initial route states. Automated scans cover detectable rules and sampled states.

## Baseline mobile Lighthouse

Lighthouse 13.6.0, Chromium 156, default simulated mobile settings, and the compressed localhost production export. The nine audits include the homepage, a representative case study and every prototype landing screen.

| Route | Performance | Accessibility | Best practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 91 | 100 | 100 | 100 | 2724 | 0.000 | 282 |
| `/work/ecommerce/` | 93 | 100 | 100 | 100 | 2455 | 0.000 | 236 |
| `/play/ecommerce/` | 95 | 100 | 100 | 100 | 2639 | 0.000 | 154 |
| `/play/social/` | 99 | 100 | 100 | 100 | 906 | 0.000 | 93 |
| `/play/streaming/` | 95 | 100 | 100 | 100 | 2935 | 0.000 | 87 |
| `/play/health/` | 96 | 100 | 100 | 100 | 2308 | 0.000 | 150 |
| `/play/finance/` | 99 | 100 | 100 | 100 | 903 | 0.005 | 146 |
| `/play/food/` | 94 | 100 | 100 | 100 | 2904 | 0.000 | 110 |
| `/play/stays/` | 94 | 100 | 100 | 100 | 2942 | 0.000 | 90 |

All nine routes met the performance score, accessibility, best-practices, SEO and CLS targets. The 2.5-second LCP target was met on four routes. The five remaining LCP measurements were 2.64–2.94 seconds. The homepage measured 2.72 seconds.

A separate mobile Chromium interaction sample used a 412 × 823 viewport, 1.75 device pixel ratio and 4× CPU slowdown. All seven project-selector taps produced Event Timing entries, with a slowest observed interaction of 120 ms. Field INP requires real visitor measurements.

## Evidence

- [Desktop homepage](home-desktop.jpg)
- [Mobile homepage](home-mobile.jpg)
- [Homepage and product-detail transition recording](project-transitions.webm)
- Two screenshots in each published case study show the actual prototype landing screen and a related task screen.

See the [local commands and audit options](../README.md#verification) to reproduce the checks.


## Gallery and prototype revision

The full 17-test suite passed on the revised portfolio. After the final adjustments to the gallery controls and chart rendering, the homepage, touch navigation, VITAL, MONETA and the 17-route axe scan passed again. The new motion recording shows a wheel gesture, a direct project selection, the case-study handoff and the next-project transition. The case studies include refreshed screenshots of the demos.

The same default mobile Lighthouse profile was used. The homepage, VITAL and MONETA were measured again after the final adjustments.

| Route | Performance | Accessibility | Best practices | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 96 | 100 | 100 | 100 | 2514 | 0.000 | 148 |
| `/work/ecommerce/` | 92 | 100 | 100 | 100 | 2419 | 0.000 | 276 |
| `/play/ecommerce/` | 96 | 100 | 100 | 100 | 2726 | 0.000 | 104 |
| `/play/social/` | 100 | 100 | 100 | 100 | 907 | 0.000 | 72 |
| `/play/streaming/` | 93 | 100 | 100 | 100 | 3128 | 0.000 | 112 |
| `/play/health/` | 98 | 100 | 100 | 100 | 2335 | 0.000 | 100 |
| `/play/finance/` | 98 | 100 | 100 | 100 | 906 | 0.005 | 178 |
| `/play/food/` | 96 | 100 | 100 | 100 | 2775 | 0.000 | 81 |
| `/play/stays/` | 94 | 100 | 100 | 100 | 2976 | 0.000 | 106 |

All nine audited routes scored 92–100 for Performance and 100 for Accessibility, Best Practices and SEO. Five routes exceeded the 2.5-second LCP target. Homepage LCP measured 2.51 seconds. All audited routes stayed within the CLS target.
