# Design systems

The portfolio frame uses Instrument Serif for display, Manrope for text and Space Mono for indexes, on a near-black stage tinted by the active project's colour. Each product then has its own system so the seven read as different companies. The same tokens are rendered live on every case study.

| Product | Palette | Type | Shape & motion | Mobile app personality |
| --- | --- | --- | --- | --- |
| ATELIER | Cream `#F4EEE4`, espresso `#241812`, clay `#A5512F`, sand `#D7C5A9` | Instrument Serif / Inter Tight | Square corners, slow gallery easing, image flies into bag | Rounded 14 px, story carousel, option sheet, swipe-to-pay |
| COMMON | Paper `#F6F5F0`, ink `#14171A`, lime `#D7F25C`, lilac `#B9A6FF`, coral `#FF7A59` | Space Grotesk | Ink outlines, offset “sticker” shadows, springy hearts | Stories with progress bars, centre create tab |
| FRAME | Midnight `#08090C`, slate `#141821`, lilac `#A7A3F0`, signal `#F05A4F` | Syne / Inter Tight | Poster type, hover-to-preview, controls fade on idle | Vertical clips, downloads rings, landscape player |
| VITAL | Sage `#EEF2EA`, pine `#173D35`, move `#FF6B4A`, lime `#B8E04A`, sky `#58C4F0` | DM Sans | 24–28 px radii, rings fill on launch, paced breathing | Night palette for sleep, full-screen workout |
| MONETA | Fog `#F3F5FA`, navy `#0F1B3D`, cobalt `#3A5EF0`, mint `#2BC48A`, alert `#E5484D` | Manrope / JetBrains Mono figures | Tabular numbers, scrub charts, review + biometric step | Dark navy app, keypad, card carousel |
| CRAVE | Cream `#FFF8EF`, chili `#D6361F`, tangerine `#FF8A3D`, basil `#2F7D4F` | Bricolage Grotesque | Pill buttons, bouncy add-to-cart, courier on route | Collapsing header, floating cart bar, draggable map sheet |
| ROAM | Linen `#F7F3EA`, bark `#2E2820`, terracotta `#C66A43`, moss `#5B6B4A`, sky `#A9C2C9` | Fraunces / DM Sans | Generous space, pins lift, galleries glide | Stepped search, map rail, sticky reserve bar |

Shared rules: visible focus, labelled icon buttons, native inputs where practical, `prefers-reduced-motion` respected (WebGL slider falls back to DOM, transitions shorten), every destructive or financial action has a review or undo.
