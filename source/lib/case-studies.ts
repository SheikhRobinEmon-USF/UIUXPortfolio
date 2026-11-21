type Frame = { title: string; rows: string[][] };
type CaseStudy = {
  concept: string;
  opportunity: string;
  pattern: string;
  source: [string, string];
  architecture: string[];
  frames: Frame[];
  identity: string;
  result: string;
  reflection: string;
};

export const caseStudies: Record<string, CaseStudy> = {
  ecommerce: {
    concept:
      "ATELIER is a curated shop for furniture and everyday objects. It turns a beautiful photograph into a confident purchase — with materials, colourways and the real cost of every option visible before anything goes in the bag.",
    opportunity:
      "Let shoppers move from inspiration to an informed purchase without guessing which option changes the price, whether it fits, or what happens if they change their mind.",
    pattern:
      "Baymard's large-scale testing repeatedly finds that variation selection, applied filters, delivery-cost visibility and checkout field design are where e-commerce usability breaks down. ATELIER keeps browsing loose and editorial, then makes every step after ‘Add to bag’ explicit and reversible.",
    source: ["Baymard Institute · E-commerce UX research", "https://baymard.com/research"],
    architecture: [
      "Web: editorial home → shop with filters, sort and density → product detail (zoom gallery, colourway, size, reviews) → bag drawer → three-step checkout → confirmation and live order timeline → account, wishlist and returns.",
      "Mobile: Home, Search, Saved, Bag and Account tabs. Variants live in a bottom sheet; checkout ends with swipe-to-pay.",
      "Both platforms share the same bag, wishlist and orders, so a session can start on the phone and finish on the desktop.",
    ],
    frames: [
      { title: "Shop", rows: [["Filters", "Applied chips", "Sort · density"], ["Card", "Card", "Card"], ["Card", "Card", "Card"]] },
      { title: "Product", rows: [["Thumbs", "Zoom gallery", "Name · rating · price"], ["Colour", "Size", "Add to bag"], ["Reviews", "Distribution", "Complete the look"]] },
      { title: "Checkout", rows: [["Step 1 · 2 · 3", "Summary"], ["Address / delivery / payment", "Fees and total"], ["Back", "Continue"]] },
    ],
    identity:
      "An editorial palette of cream, espresso and clay with Instrument Serif display type gives the photography room. Square corners and slow easing on the web feel like a gallery; the app softens radii for touch while keeping the same voice.",
    result:
      "The full purchase loop works in both platforms: colour and size update the price live, the bag tracks free-delivery progress and promo codes, checkout validates inline, orders advance through a timeline, and delivered items can be returned with a reason and pickup slot.",
    reflection:
      "Test whether shoppers notice price changes on size selection, whether swipe-to-pay feels safe or slow, and how many people use quick view versus the full product page. Real photography of each colourway would replace the CSS-tinted variants.",
  },
  social: {
    concept:
      "COMMON is a creative community built around small circles instead of follower counts. Members share work in progress, ask for structured critique, run polls and meet up at circle events.",
    opportunity:
      "Make it easy for a new member to find a relevant conversation and get useful feedback before they have an audience — and make feedback specific instead of a pile of hearts.",
    pattern:
      "Community platforms separate interest-based discovery from a personal following, and use topic labels to organise conversations. COMMON starts with interest selection, keeps feed scope and sort as explicit controls, and adds ‘critique’ posts whose comments are tagged by what they address.",
    source: ["Reddit Help · How recommendations and post flair work", "https://support.reddithelp.com/hc/en-us/articles/23511859482388-Reddit-s-Approach-to-Content-Recommendations"],
    architecture: [
      "Web: onboarding → feed (For you / Following / My circles, Latest / Top) → post detail with tagged critique → composer (work, critique, poll, thought) → circles with events → messages → activity → profile and saved.",
      "Mobile: stories with tap/hold navigation, double-tap to like, comments in a sheet, a centre Create tab, circles, chat and an editable profile.",
      "Posts, votes, joins, RSVPs and messages are shared between platforms.",
    ],
    frames: [
      { title: "Feed", rows: [["Nav", "Stories", "Events"], ["", "Composer prompt", "Creators"], ["", "Post · Post", "Trending"]] },
      { title: "Critique", rows: [["Artwork", "Context"], ["", "Feedback filter"], ["", "Tagged comments · reply"]] },
      { title: "Compose", rows: [["Work", "Critique", "Poll", "Thought"], ["Circle", "Caption", "Media"], ["Audience", "Publish"]] },
    ],
    identity:
      "A sticker-like system — lime, lilac and coral on paper with ink outlines and offset shadows — signals a playful, low-pressure space. Space Grotesk keeps it crafty but legible; springy motion rewards participation.",
    result:
      "Members can onboard into circles, post four kinds of content (including uploaded images), vote, comment with critique tags, reply in threads, join circles and RSVP, follow creators, watch stories, and chat with simulated replies.",
    reflection:
      "Validate whether critique tags actually raise feedback quality, whether circles-first onboarding helps new members post sooner, and how moderation tools should appear without dampening the tone.",
  },
  streaming: {
    concept:
      "FRAME is a cinematic streaming service for slow, beautiful stories. It gets people from ‘what should I watch?’ to watching quickly — with previews, honest metadata and a reliable way back to where they left off.",
    opportunity:
      "Reduce decision time by letting the footage speak, and make resuming effortless across devices and profiles.",
    pattern:
      "Streaming discovery surfaces put synopsis, maturity and progress up front, preview on intent rather than everywhere, and keep a ‘continue watching’ row tied to real progress. FRAME adapts those patterns to mouse, keyboard and touch.",
    source: ["Netflix Help · Navigating and playing", "https://help.netflix.com/en/node/321880164349028"],
    architecture: [
      "Web: profile gate → home with autoplaying hero → rows with hover previews and Top 5 → title detail with episodes → full player (captions, speed, skip intro, up next) → search and My List.",
      "Mobile: profiles → Home, New & Hot reminders, vertical Clips, Downloads with progress, My FRAME; the player rotates into landscape.",
      "Watch progress, list, likes, reminders and downloads persist per device and appear on both platforms.",
    ],
    frames: [
      { title: "Home", rows: [["Hero preview · Play · Info"], ["Continue watching"], ["Top 5", "New this week"]] },
      { title: "Title", rows: [["Preview", "Play · List · Like"], ["Synopsis", "Cast · genres"], ["Episodes", "More like this"]] },
      { title: "Player", rows: [["Back", "Title · episode"], ["Skip intro", "Up next"], ["Scrub · controls · CC · speed"]] },
    ],
    identity:
      "Near-black with a lilac glow and a red ‘signal’ accent keeps attention on the image. Syne gives titles a poster-like presence; motion is cinematic — slow fades, hover cards that grow into previews, controls that step aside.",
    result:
      "Original captioned clips play through a custom player that saves progress, offers skip intro and an up-next countdown, and resumes from the right episode. Hover previews, reminders, downloads and kids-profile filtering all work.",
    reflection:
      "Test how often hover previews help versus distract, whether the up-next countdown is too eager, and how download management should behave on limited storage.",
  },
  health: {
    concept:
      "VITAL is a gentle wellness companion. It shows the day at a glance — movement, heart, sleep and fuel — and makes the small things easy: a walk, a glass of water, a minute of breathing, a habit kept.",
    opportunity:
      "Make logging feel encouraging rather than judgemental, and turn raw numbers into a sense of direction.",
    pattern:
      "Health summaries work best with scannable highlights, category drill-down and trends over single readings. VITAL leads with rings and a plain-language insight, keeps every common log one tap away, and frames trends against your own baseline.",
    source: ["Apple · Health app data and trends", "https://support.apple.com/guide/iphone/iphe3d379c32/ios"],
    architecture: [
      "Web: summary dashboard → activity and workout history → sleep stages and consistency → nutrition and water → guided breathing → habit heatmaps → trends → journal.",
      "Mobile: Summary, Activity, Sleep (night mode), Mind and Habits tabs, with a full-screen live workout and bottom-sheet logging.",
      "Workouts, meals, water, habits, mindful minutes and journal entries update both platforms.",
    ],
    frames: [
      { title: "Summary", rows: [["Rings", "Move · Exercise · Stand"], ["Heart", "Sleep"], ["Fuel · water", "Habits"]] },
      { title: "Live workout", rows: [["Type", "Live"], ["Timer"], ["BPM", "kcal", "km"], ["Pause", "Hold to end"]] },
      { title: "Sleep", rows: [["Duration", "Score"], ["Hypnogram"], ["Stage totals"]] },
    ],
    identity:
      "Sage and pine with a ring trio of coral, lime and sky keep the interface calm while data stays vivid. DM Sans and large radii make it friendly; sleep switches to a night palette.",
    result:
      "People can run a live workout (simulated heart rate, energy and distance) that closes rings, log meals and water, check habits with streaks, follow a paced breathing session, inspect any night's sleep stages, scrub trends and journal their mood.",
    reflection:
      "Validate the tone of insights with people who feel judged by fitness apps, test the hold-to-end gesture during real exercise, and review copy with clinicians before any health claims.",
  },
  finance: {
    concept:
      "MONETA brings accounts, spending, budgets and goals together so people can see where money goes — and act on it with confidence.",
    opportunity:
      "Connect every transaction to a budget or goal, make recurring costs visible, and give consequential actions like sending money a clear review and confirmation.",
    pattern:
      "Personal-finance dashboards pair balances with period-based spending, and keep budgets, recurring expenses and editable transactions one step away. MONETA adds a scrub-able net-worth chart, pace markers on budgets and a biometric-style confirmation for transfers.",
    source: ["Monarch Money · Reports and budgeting", "https://help.monarch.com/hc/en-us/articles/21846787088916-Using-Reports"],
    architecture: [
      "Web: overview (net worth, accounts, spending, cash flow, upcoming) → accounts → transactions with detail drawer → budgets → subscriptions with cancel flow → goals → cards → send money and transfers.",
      "Mobile (dark): Home, Activity, Pay (keypad), Cards and Plan tabs; transaction details and confirmations in sheets.",
      "Balances, categories, splits, budgets, goals, cards and transfers stay in sync across platforms.",
    ],
    frames: [
      { title: "Overview", rows: [["Net worth chart", "Send"], ["Accounts", "Spending donut"], ["Cash flow", "Upcoming"]] },
      { title: "Send", rows: [["Recipient"], ["Amount", "From account"], ["Review", "Face ID", "Done"]] },
      { title: "Budgets", rows: [["Left to spend", "Pace"], ["Category · bar · status"], ["Edit limit"]] },
    ],
    identity:
      "Fog and navy with a cobalt action colour and mint/red for gains and alerts. Manrope labels with JetBrains Mono figures keep numbers tabular; the mobile app flips to a deep navy theme with soft-blue accents.",
    result:
      "Users can scrub net worth, recategorise, split and annotate transactions, adjust budgets against a pace marker, cancel and resume subscriptions, create and fund goals, freeze cards and change limits, and send money with validation, review and a simulated Face ID step.",
    reflection:
      "Test whether pace markers are understood without explanation, how people react to the ‘unused subscription’ nudges, and what level of friction feels right before money moves.",
  },
  food: {
    concept:
      "CRAVE is neighbourhood food delivery that is honest about time and cost. It helps hungry people pick quickly, customise confidently and always know where their order is.",
    opportunity:
      "Remove surprises: make required choices obvious, show every fee before the last screen, and keep live status one glance away.",
    pattern:
      "Delivery apps set address context early, separate meal price from fees, and present staged order status with an estimate. CRAVE validates required options in the dish sheet, explains each fee in place, and pairs a live map with a step timeline.",
    source: ["DoorDash Help · Fees and order tracking", "https://help.doordash.com/en-us/consumers/article/what-fees-do-i-pay?langue=en_US"],
    architecture: [
      "Web: address and mode → discovery (promos, cuisines, filters, order again) → restaurant with scroll-synced menu → dish customisation → cart with suggestions → checkout (schedule, tip, payment, promo, fee breakdown) → live tracking with courier chat → rating → orders and reorder.",
      "Mobile: Home, Search, Orders and Account; collapsing restaurant header, floating cart bar, swipe to order, and a draggable tracking sheet over the map.",
      "Cart, favourites, address and orders are shared between platforms.",
    ],
    frames: [
      { title: "Restaurant", rows: [["Cover · rating · ETA · fee"], ["Sections", "Popular", "Your order"], ["", "Dish · Dish", ""]] },
      { title: "Dish", rows: [["Photo", "Required group"], ["", "Optional extras"], ["", "Qty · Add · price"]] },
      { title: "Tracking", rows: [["Map with courier", "ETA"], ["", "Stage timeline"], ["", "Courier · chat · rate"]] },
    ],
    identity:
      "Cream with chili, tangerine and basil — appetising without shouting. Bricolage Grotesque gives a bold, friendly voice; motion is bouncy and quick, and the courier glides along the route.",
    result:
      "A full order works end to end: required choices block adding until satisfied, carts from different restaurants ask before replacing, checkout explains fees and tips, tracking auto-advances with a moving courier, and delivered orders can be rated and reordered.",
    reflection:
      "Test whether fee explanations reduce checkout abandonment, how long people expect a ‘preparing’ stage to last, and whether the mobile draggable sheet hides too much of the map.",
  },
  stays: {
    concept:
      "ROAM is for slow travel — distinctive stays chosen with care. It keeps dates, guests and the total price in view from the first search to the itinerary.",
    opportunity:
      "Let travellers compare places on a map without losing context, and never be surprised by the total at checkout.",
    pattern:
      "Stay search starts with destination, dates and guests, supports linked map and list comparison, and shows the total for the chosen stay early. ROAM carries the total onto map pins and cards, blocks booked nights in the calendar, and keeps the reserve card's breakdown live.",
    source: ["Airbnb · Total price display", "https://news.airbnb.com/total-price-display-is-now-standard-globally"],
    architecture: [
      "Web: where/when/who search with range calendar → categories, list and linked map → filters (price histogram, type, amenities, Instant Book) → listing (photo tour, reviews, location) → reserve card → confirm and pay with host message → trip itinerary and cancellation → wishlists.",
      "Mobile: stepped full-screen search, list/map toggle with a synced card rail, swipe galleries, sticky reserve bar, trips, wishlists and inbox.",
      "Search, wishlists and trips are shared between platforms.",
    ],
    frames: [
      { title: "Results", rows: [["Where · When · Who"], ["Categories", "Filters", "Map"], ["Card · Card", "Pins with totals"]] },
      { title: "Listing", rows: [["Photo mosaic"], ["Host · highlights", "Reserve card"], ["Calendar · reviews", "Breakdown"]] },
      { title: "Trip", rows: [["Hero · countdown"], ["Itinerary", "Messages"], ["Check-in · wifi", "Cancel"]] },
    ],
    identity:
      "Linen, bark and terracotta with moss and sky from the landscapes themselves. Fraunces gives the headlines warmth, DM Sans keeps controls quiet; motion is unhurried — pins lift, galleries glide.",
    result:
      "Travellers can search with a range calendar that respects booked nights, filter by price histogram, compare on a linked map, save to named wishlists, reserve with a live breakdown, book with a host message, and manage or cancel the trip with a calculated refund.",
    reflection:
      "Test whether total-price pins change which listings people open, how the stepped mobile search compares with a single form, and how cancellation-refund previews affect booking confidence.",
  },
};
