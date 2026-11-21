# Reference analysis — 21 November 2026

Reference: https://robin-noguier.com/

## Observed and unavailable

The reference homepage's indexed text identifies Robin Noguier and About. Opening it in a live browser returned “Oops … An error occurred” against a near-black background with oversized serif text. A repeat live visit returned the same error. The interactive homepage, menu, hover, input behaviors and responsive layouts could not be directly examined. This project follows the supplied brief's description of a vertical selector, perspective previews, dominant active artwork and cinematic transitions. These are implementation choices, not claims about observed reference implementation. The earlier screenshot was described in the brief but was not attached to this execution; the description guided composition.

## Case-study pages

| Page | Directly observed page content | Design inference for this portfolio |
|---|---|---|
| [Fun](https://robin-noguier.com/project/fun/) | Video dating, role/date/client, prototype link, four-profile grid, opening-animation heading | Explain product interaction decisions and link to functional concepts. |
| [Esperanto](https://robin-noguier.com/project/esperanto/) | Self-initiated editorial project, interviews and photography, date, external site | Give each case a narrative and honest project scope. |
| [Blurr](https://robin-noguier.com/project/blurr/) | Social marketplace framing, insights and problems, role list | Document friction before proposing solutions. |
| [Ueno](https://robin-noguier.com/project/ueno/) | Agency narrative, brand, typography and color tokens | Show distinct visual identities. |
| [Airbnb](https://robin-noguier.com/project/airbnb/) | Olympic credit redemption flow, visual identity, separate account states | Explain branching paths and constraints. |
| [Google](https://robin-noguier.com/project/google/) | Voice shopping trial landing page, role/date, brand rules, four setup steps | Pair concise task explanations with interactive demonstrations. |
| [SnickSnack](https://robin-noguier.com/project/snicksnack/) | Media-first group messaging, playful identity, prototypes | Give social concept a distinct voice and interaction. |
| [Iv-Skaya](https://robin-noguier.com/project/iv-skaya/) | Photographer portfolio, image-first layout, serif type, muted palette | Let visual content breathe without duplicating original artwork. |
| [Eagle Films](https://robin-noguier.com/project/eagle-films/) | Premium film distribution identity, color palette, loader mention | Use a cinematic streaming design with original media. |

The indexed content was available for all nine links. The live browser rendered full case content for Fun, Blurr, Ueno and Iv-Skaya during inspection. Their browser trees showed an introduction, role/client/date metadata, themed sections, media captions and the Back Home / About controls. The bottom of Fun included an invitation to scroll or click to advance to the next project. Several other live pages exposed only an introductory state or failed to finish loading in the available browser. Their rows above are based on indexed text.

Motion captions describe the designer’s intended behavior. They do not confirm the behavior of the homepage or autoplay. The new project index, editable prototype state, responsive breakpoints and reduced-motion fallback are original design decisions. The separate “UI UX Portfolio Links” chat and screenshot were unavailable in this session.

## Motion review · 21 November 2026

The live home route again showed an application error in Chromium. The live Fun case study did render, including a prompt to continue to the next project. I inspected frame sequences from the creator’s five Dribbble recordings and a third-party full-page recording. These show the published design at the time of capture.

| Evidence | Observed behavior | Portfolio application |
| --- | --- | --- |
| [Home Slider](https://dribbble.com/shots/14413496--Home-Slider) and [Fast Navigation](https://dribbble.com/shots/14413738--Fast-Navigation) | One artwork stays dominant while nearby tilted frames remain visible. The title and scene color change as the next frame takes focus. Fast index jumps use the same visual language. | Keep the existing editorial index and original images. Coordinate the rail marker, accent, title and artwork. Use gentle frame depth and pointer response. |
| [Developer walkthrough](https://lorenzocadamuro.medium.com/how-to-build-a-creative-portfolio-with-react-js-and-webgl-a697869f78c5) | Lorenzo Cadamuro describes separating intent from wheel inertia, sharing page-change progress across layers, and binding light position to pointer movement. | Recognize a fresh wheel gesture separately from its decaying tail. Use stylesheet-composited image motion and a pointer highlight. |
| [Portfolio Mobile](https://dribbble.com/shots/14414009-Portfolio-Mobile) | The handset shows artwork moving horizontally above its accompanying project information. | Add an image-first horizontal gesture that follows the finger, permits vertical page scrolling, and settles into a discrete selection. |
| [Case To Case](https://dribbble.com/shots/14413934-Case-To-Case) and [Case Study](https://dribbble.com/shots/14413804-Case-Study) | The next case is introduced at the bottom of the previous one. The upcoming artwork carries forward as the header and palette change. Case studies return to normal reading. | Give the footer’s outgoing title and image the destination’s shared transition names. Keep reading progress tied to native scroll and preserve normal link navigation. |
| [Full-site recording](https://www.landing.love/sites/robin-noguier/) and [dated opening capture](https://swipefile.design/ref/personal-robin-noguier/) | Independent records show the full-screen work stage, nearby project artwork, and clear access to the case study. | Add movement to the portfolio’s own layout, artwork, dark palette and controls. |

The reference uses a WebGL canvas that spans the routes. This implementation uses CSS and progressive enhancement with the browser’s View Transition API. Touch, wheel, keyboard, direct links and reduced motion are verified on the implemented portfolio.

The later review compared Sheikh Robin Emon’s existing portfolio with the recorded Noguier slider and case handoffs. The existing portfolio uses a long-form page with section navigation, filterable case cards, and role-based views. The new site applies the reference’s more continuous pacing to its own gallery through an opening reveal, a stronger pointer response, moving captions, and case media that responds as it enters the viewport. Noguier’s home introduction rendered briefly before the same live error returned. [Existing portfolio](https://sheikhrobinemon-usf.github.io/Portfolio/) · [Noguier home slider recording](https://dribbble.com/shots/14413496--Home-Slider) · [Noguier case transition recording](https://dribbble.com/shots/14413934-Case-To-Case)
