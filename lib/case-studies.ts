export const caseStudies = {
  ecommerce: {
    concept:
      "A curated shop for furniture and everyday objects, with product detail built around materials, scale and the cost of choosing a variant.",
    opportunity:
      "Let shoppers move from a photograph to an informed purchase without guessing which options affect the price or whether their selection survived checkout.",
    pattern:
      "Baymard's research identifies product imagery, variation selection and checkout as recurring e-commerce usability topics. The outline keeps browsing loose and makes each step after adding to the bag explicit.",
    source: [
      "Baymard Institute · E-commerce UX research",
      "https://baymard.com/research",
    ],
    architecture: [
      "Discover and Browse support open-ended discovery and directed search.",
      "Product detail keeps the gallery, material, size and price together.",
      "Wishlist, Bag and Orders are persistent destinations in the shop navigation.",
    ],
    frames: [
      {
        title: "Collection",
        rows: [
          ["Collection headline", "Feature photo"],
          ["Category", "Search", "Sort"],
          ["Object", "Object", "Object"],
        ],
      },
      {
        title: "Product",
        rows: [
          ["Large product photo", "Name and price"],
          ["Thumbnails", "Material and size"],
          ["Zoom", "Add to bag"],
        ],
      },
      {
        title: "Checkout",
        rows: [
          ["Line items", "Subtotal"],
          ["Quantities", "Delivery and promo"],
          ["Order form", "Total and confirm"],
        ],
      },
    ],
    identity:
      "Warm earth tones and a serif lead support deliberate browsing. Square image tiles and high-contrast selection controls maintain the distinction between editorial content and checkout actions.",
    result:
      "The bag keeps the selected material, size and quantity. A demo promotion and express delivery update the total before checkout. Completed orders remain available after reload.",
    reflection:
      "Test whether shoppers understand that a material can change the price. Compare gallery interactions on touchscreens, and validate how people interpret the demo’s generic sizing across product categories.",
    capture: "Forma chair detail with gallery and purchase options",
  },
  social: {
    concept:
      "A small fictional creative network where people can share work in progress, follow creators and join circles organized around interests.",
    opportunity:
      "Make it easy to find a relevant conversation and contribute before a new member has invested time building a large follow list.",
    pattern:
      "Topic communities and personal feeds serve different tasks. Common pairs named circles with a Following & circles filter and keeps post creation within reach.",
    source: [
      "Nielsen Norman Group · Social media and UX",
      "https://www.nngroup.com/topic/social-media/",
    ],
    architecture: [
      "Feed combines a general view with followed creators and joined circles.",
      "Explore and Communities answer different questions: what is being shared, and where can I participate?",
      "Saved, Messages, Notifications and Profile provide distinct destinations for personal activity.",
    ],
    frames: [
      {
        title: "Community feed",
        rows: [
          ["Circles", "Post stream", "Profile context"],
          ["Create post", "Post image and actions"],
          ["Topic filters", "Second post"],
        ],
      },
      {
        title: "Composer",
        rows: [
          ["Choose a circle"],
          ["Caption"],
          ["Local image preview"],
          ["Publish post"],
        ],
      },
      {
        title: "Discussion",
        rows: [
          ["Author and circle"],
          ["Post and social actions"],
          ["Comments"],
          ["Write a reply"],
        ],
      },
    ],
    identity:
      "Acid green anchors the circle sidebar against paper-green surfaces. Images get the greatest area, with understated author identifiers and clear selected states for reactions.",
    result:
      "Posts, comments, follows, saved content, messages and activity updates persist locally. Circles can be joined and explored. The edited profile name follows posts created in the current demo.",
    reflection:
      "Observe whether creators can tell which audience receives a post. A continuation would explore moderation controls, accessible media descriptions and ways to introduce new members to active conversations.",
    capture: "The post composer with a community and caption",
  },
  streaming: {
    concept:
      "A focused streaming catalog for short original visual studies, with a featured recommendation, browsable collections and per-viewer history.",
    opportunity:
      "Help someone make a quick choice with a manageable collection and keep playback actions where they expect them.",
    pattern:
      "Editorial shelves support open browsing, while title search and genre filters support a specific intent. Native media controls preserve familiar playback, seek, fullscreen and caption behavior.",
    source: [
      "W3C WAI · Making Audio and Video Media Accessible",
      "https://www.w3.org/WAI/media/av/",
    ],
    architecture: [
      "Home prioritizes a single featured recommendation and editorial shelves.",
      "Browse, Watchlist and Continue watching serve distinct retrieval tasks.",
      "Title detail gathers episode choice and saving. Profiles separate local watch activity.",
    ],
    frames: [
      {
        title: "Home",
        rows: [
          ["Featured film and play path"],
          ["Poster", "Poster", "Poster", "Poster"],
          ["Documentary shelf"],
        ],
      },
      {
        title: "Title detail",
        rows: [
          ["Film still", "Title and description"],
          ["Gallery", "Episode picker"],
          ["Play sample", "Save"],
        ],
      },
      {
        title: "Playback",
        rows: [
          ["Player frame"],
          ["Seek · volume · captions · fullscreen"],
          ["Episode selector"],
        ],
      },
    ],
    identity:
      "Wide stills, deep blue-black surfaces and cool high-contrast controls create a theater-like browsing surface. Content shelves scroll using standard browser gestures.",
    result:
      "Four titles each include three distinct local clips with descriptive English captions. The player stores episode position, and the selected viewer controls which watchlist and history are shown.",
    reflection:
      "The short clips test playback and navigation interactions. Longer content would allow usability testing of episode recovery, progress affordances and behavior on slower connections.",
    capture: "FRAME’s title and episode detail",
  },
  health: {
    concept:
      "A daily wellness dashboard for logging movement, sleep and food, and for building routines through habits and a private journal.",
    opportunity:
      "Provide one entry point for a daily check-in while respecting that minutes, sleep hours and nutrition counts carry different meanings.",
    pattern:
      "Plain language and explicit units help reduce interpretation effort. Each chart compares one measure against its own illustrative scale and keeps numeric information available in text.",
    source: ["CDC · Clear Communication Index", "https://www.cdc.gov/ccindex/"],
    architecture: [
      "Today is the dated overview. Activity, Sleep and Nutrition open dedicated entry views.",
      "Habits, Goals and Journal separate planning and reflection from measurement.",
      "Trends connects date ranges and categories. Settings controls the optional insights copy.",
    ],
    frames: [
      {
        title: "Today",
        rows: [
          ["Greeting and date"],
          ["Activity", "Sleep", "Nutrition"],
          ["Rhythm chart", "Habits"],
          ["Daily timeline"],
        ],
      },
      {
        title: "Log activity",
        rows: [
          ["Select day", "Search entries"],
          ["Dated entries", "Name, minutes and date"],
          ["Edit", "Save entry"],
        ],
      },
      {
        title: "Habits",
        rows: [
          ["Date"],
          ["Checkbox and routine"],
          ["Checkbox and routine"],
          ["Progress count"],
        ],
      },
    ],
    identity:
      "Sage, cream and restrained rounded surfaces keep the app calm. Time-series controls use native inputs and outcomes include text that does not depend on a colored chart.",
    result:
      "Logging and editing entries refreshes date-specific totals. Habits and journal entries persist separately by date. Wellness metrics stay in their own units.",
    reflection:
      "Test whether daily and multi-day chart scales are easy to interpret. Ask users which kinds of reminders or summaries feel supportive. The prototype uses synthetic numbers for design exploration.",
    capture: "VITAL’s date-specific habit tracking",
  },
  finance: {
    concept:
      "A personal-finance sandbox that connects spending records, monthly budgets, recurring costs and goals through linked summaries.",
    opportunity:
      "Make it possible to explain why a total changed, then take a small follow-up step such as reclassifying a transaction or changing a budget.",
    pattern:
      "Spending categorization, budgets and saving goals are different planning tools. Moneta keeps monthly budget totals stable while the spending dashboard supports week, month and all-time filters.",
    source: [
      "Consumer Financial Protection Bureau · Your Money, Your Goals",
      "https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/",
    ],
    architecture: [
      "Overview and Spending share the filter model. Transactions exposes underlying records and details.",
      "Accounts displays fictional balances and transfer history independently of spending.",
      "Budgets, Subscriptions and Goals give each type of planning its own screen.",
    ],
    frames: [
      {
        title: "Overview",
        rows: [
          ["Overview and range"],
          ["Food", "Home", "Transit", "Recurring"],
          ["Category chart", "Budget snapshot"],
          ["Recent transactions"],
        ],
      },
      {
        title: "Transaction",
        rows: [["Merchant and amount"], ["Category and date"], ["Edit entry"]],
      },
      {
        title: "Plan",
        rows: [
          ["Budget category", "Monthly amount"],
          ["Spent and remaining"],
          ["Category progress"],
        ],
      },
    ],
    identity:
      "Blue-ink typography and aligned monospaced totals support scanning. Thin borders distinguish functional regions, and chart amounts have visible currency values.",
    result:
      "Range and category choices update summaries. Budget edits change remaining amounts, and an internal mock transfer updates both fictional account balances without appearing as spending.",
    reflection:
      "Test how users distinguish available balance, money spent and money allocated. A follow-up could add multi-month budget rollover and more explicit transfers to savings goals.",
    capture: "MONETA’s editable category budgets",
  },
  food: {
    concept:
      "A warm, quick food-ordering experience that takes people from neighborhood restaurants to a meal, a sample address and a clear status timeline.",
    opportunity:
      "Keep meal details and pricing clear as soon as someone picks a customization, then give them a comprehensible handoff after checkout.",
    pattern:
      "Food menus and cart summaries frequently separate base price, extras and delivery fees. The prototype keeps those decisions visible before a simulated order is placed.",
    source: [
      "Nielsen Norman Group · Visibility of System Status",
      "https://www.nngroup.com/articles/visibility-system-status/",
    ],
    architecture: [
      "Discover includes cuisine filters and delivery-time sorting.",
      "A restaurant leads to its menu, then a focused meal customization screen.",
      "Cart, Tracking and Orders separate active ordering, delivery status and repeat purchases.",
    ],
    frames: [
      {
        title: "Restaurant",
        rows: [
          ["Cover and delivery estimate"],
          ["Dish and description", "Customize"],
          ["Dish and description", "Customize"],
        ],
      },
      {
        title: "Customize",
        rows: [
          ["Dish image", "Meal name"],
          ["Selection", "Updated price"],
          ["Add to cart"],
        ],
      },
      {
        title: "Tracking",
        rows: [
          ["Order number and address"],
          ["Confirmed", "Preparing", "On the way", "Delivered"],
          ["Advance demo event"],
        ],
      },
    ],
    identity:
      "A chili-red action color and full-bleed food photography carry the visual identity. Rows in the menu and order summary keep names and prices aligned, with rounded controls on touchscreens.",
    result:
      "A menu contains multiple meals. Extras and quantities change the total, and submitted instructions stay visible in tracking. A repeat order restores its meal options.",
    reflection:
      "Test how diners interpret the default meal option and whether they can quickly verify an instruction before confirming. Live driver data and real checkout are outside this demo.",
    capture: "CRAVE’s restaurant menu",
  },
  stays: {
    concept:
      "An editorial travel search with a synchronized map and property list, a photo-first detail view and a local reservation flow.",
    opportunity:
      "Keep potential locations and price comparisons in view while the traveler works out whether a place fits their dates and group.",
    pattern:
      "List and map views support complementary comparisons. Direct card-to-marker selection makes the relationship explicit and keyboard-accessible.",
    source: [
      "W3C WAI · Keyboard accessibility",
      "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
    ],
    architecture: [
      "Discover leads with a featured destination. Browse prioritizes destination, date, party size and price filters.",
      "A map/list result keeps the same set of properties in both views.",
      "Saved and Trips hold shortlists and confirmed simulated reservations.",
    ],
    frames: [
      {
        title: "Explore",
        rows: [
          ["Destination, arrival, departure and guests"],
          ["Price filter", "Map toggle"],
          ["Map and markers", "Property list"],
        ],
      },
      {
        title: "Stay",
        rows: [
          ["Gallery", "Name and rate"],
          ["Photo options", "Arrival and departure"],
          ["Capacity", "Reserve"],
        ],
      },
      {
        title: "Booking",
        rows: [
          ["Stay and dates", "Cleaning fee"],
          ["Name and email", "Total"],
          ["Confirm demo reservation"],
        ],
      },
    ],
    identity:
      "An earth-toned palette with large serif display type gives property photography space. Currency, guest counts and selection indicators remain explicit in the browsing and booking controls.",
    result:
      "Map selection and card selection stay synchronized. Guest limits and date ranges are checked, and nightly totals and a one-time fee carry into the saved trip.",
    reflection:
      "The map uses illustrative markers. To test real trip decisions, use representative neighborhoods, drive times and availability, then observe how map density affects browsing.",
    capture: "ROAM’s synchronized map and property results",
  },
} as const;
