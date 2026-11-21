import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const projects = {
  ecommerce: "E-COMMERCE",
  social: "SOCIAL",
  streaming: "STREAMING",
  health: "HEALTH",
  finance: "FINANCE",
  food: "FOOD",
  stays: "STAYS",
} as const;
const widths = [320, 375, 430, 768, 1024, 1440, 1920];
const names = Object.keys(projects) as (keyof typeof projects)[];

const button = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name, exact: typeof name === "string" });
const link = (page: Page, name: string) =>
  page.getByRole("link", { name, exact: true });
const reset = async (page: Page) => {
  await button(page, "Reset demo data").click();
  await expect(page.getByRole("status").first()).toHaveText("Demo data reset.");
};
const screenshot = async (page: Page, path: string) => {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    );
    await Promise.allSettled(
      Array.from(document.images, (image) =>
        image.loading === "lazy" ? Promise.resolve() : image.decode(),
      ),
    );
  });
  await page.screenshot({
    path,
    type: "jpeg",
    quality: 84,
    animations: "disabled",
  });
};

async function responsive(page: Page, route: string) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${route} horizontal overflow at ${width}px`,
    ).toBeTruthy();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

test("home selector, navigation, responsive layouts and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await screenshot(page, "docs/home-desktop.jpg");
  for (const [slug, label] of Object.entries(projects)) {
    const entry = button(page, new RegExp(label));
    await entry.click();
    await expect(entry).toHaveAttribute("aria-current", "true");
    await expect(link(page, "View case study")).toHaveAttribute(
      "href",
      `/work/${slug}/`,
    );
  }
  await page.keyboard.press("ArrowUp");
  await expect(button(page, /FOOD/)).toHaveAttribute("aria-current", "true");
  await link(page, "View case study").click();
  await expect(page).toHaveURL("/work/food/");
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(button(page, /FOOD/)).toHaveAttribute("aria-current", "true");
  await page.goForward();
  await expect(page).toHaveURL("/work/food/");
  await link(page, "Selected work").click();
  await expect(button(page, /FOOD/)).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".preview.current")).toHaveCSS(
    "view-transition-name",
    "project-artwork",
  );
  await page.mouse.move(350, 450);
  await page.mouse.wheel(0, 150);
  await expect(button(page, /STAYS/)).toHaveAttribute("aria-current", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".preview.current")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await responsive(page, "Home");
  await page.setViewportSize({ width: 375, height: 812 });
  await button(page, /E-COMMERCE/).click();
  await screenshot(page, "docs/home-mobile.jpg");
  await button(page, "Next project").click();
  await expect(button(page, /SOCIAL/)).toHaveAttribute("aria-current", "true");
  await link(page, "About").click();
  await expect(page).toHaveURL("/about/");
  await page.goto("/contact/");
  await expect(
    page.getByRole("link", { name: /Connect on GitHub/ }),
  ).toBeVisible();
});

for (const slug of names) {
  test(`${slug} routes, keyboard, responsive widths, screenshots and reset`, async ({
    page,
  }) => {
    await page.goto(`/work/${slug}/`);
    await responsive(page, `/work/${slug}/`);
    await link(page, "Explore interactive prototype").click();
    await expect(page).toHaveURL(`/play/${slug}/`);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await screenshot(page, `public/media/${slug}-screen.jpg`);
    await responsive(page, `/play/${slug}/`);
    const firstTab = page.getByRole("navigation").getByRole("button").first();
    await firstTab.focus();
    await page.keyboard.press("Enter");
    await expect(firstTab).toHaveAttribute("aria-current", "page");
    await reset(page);
    await expect(
      page.getByRole("link", { name: /Case study/ }),
    ).toHaveAttribute("href", `/work/${slug}/`);
  });
}

test("ATELIER variants, gallery, empty bag, validation, delivery, promo and order history", async ({
  page,
}) => {
  await page.goto("/play/ecommerce/");
  await button(page, "Bag").click();
  await expect(page.getByText("Your cart is empty")).toBeVisible();
  await button(page, "Browse").click();
  await page.getByLabel("Search").fill("not a product");
  await expect(page.getByText("No matches")).toBeVisible();
  await page.getByLabel("Search").fill("Forma");
  await button(page, "Forma chair").click();
  await expect(
    page.getByRole("heading", { name: "Forma chair" }),
  ).toBeVisible();
  await screenshot(page, "public/media/ecommerce-detail.jpg");
  await button(page, "Alternate").click();
  await expect(page.getByRole("img", { name: "Forma chair" })).toHaveAttribute(
    "src",
    /chair-dark/,
  );
  await button(page, "Zoom image").click();
  await expect(page.locator(".zoomed")).toBeVisible();
  await page.getByLabel("Material").selectOption("Premium");
  await page.getByLabel("Size").selectOption("L");
  await button(page, "Add to bag").click();
  await expect(page.getByText("Premium · Size L")).toBeVisible();
  await button(page, "Increase Forma chair").click();
  await page.getByLabel("Promo code (DEMO10)").fill("WRONG");
  await expect(page.getByText("This promo code does not apply.")).toBeVisible();
  await page.getByLabel("Promo code (DEMO10)").fill("DEMO10");
  await page.getByLabel("Delivery").selectOption("Express");
  await expect(page.getByText("Total $458.60")).toBeVisible();
  await button(page, "Continue to checkout").click();
  await button(page, "Confirm demo order").click();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.getByLabel("Email").fill("guest@example.com");
  await page.getByLabel("Demo delivery address").fill("Demo address");
  await button(page, "Confirm demo order").click();
  await expect(
    page.getByRole("heading", { name: "You’re all set!" }),
  ).toBeVisible();
  await page.reload();
  await button(page, "Orders").click();
  await expect(page.getByText(/DEMO-\d+/)).toBeVisible();
  await reset(page);
  await button(page, "Orders").click();
  await expect(page.getByText("No completed orders")).toBeVisible();
});

test("COMMON post composition, comments, local image, activity, profile and reset", async ({
  page,
}) => {
  await page.goto("/play/social/");
  await button(page, "Saved").click();
  await expect(page.getByText("No posts in this view yet.")).toBeVisible();
  await button(page, "＋ Create post").click();
  await page.getByLabel("Caption").fill(" ");
  await button(page, "Publish post").click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Write a caption",
  );
  await page.getByLabel("Caption").fill("A thoughtful demo post");
  await page
    .getByRole("combobox", { name: "Community" })
    .selectOption("Photography");
  await page
    .getByLabel("Choose local image")
    .setInputFiles("public/media/stays.webp");
  await expect(page.getByRole("img", { name: "Post preview" })).toBeVisible();
  await screenshot(page, "public/media/social-detail.jpg");
  await button(page, "Publish post").click();
  const card = page
    .locator(".post")
    .filter({ hasText: "A thoughtful demo post" });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Save", exact: true }).click();
  await card.getByRole("button", { name: /Comments/ }).click();
  await page.getByLabel("Add comment").fill("This is a second thought.");
  await button(page, "Send comment").click();
  await expect(page.getByText("This is a second thought.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("A thoughtful demo post")).toBeVisible();
  await button(page, "Notifications").click();
  await expect(page.getByText("You posted in Photography.")).toBeVisible();
  await button(page, "Mark all as read").click();
  await expect(page.getByText("0 unread updates")).toBeVisible();
  await button(page, "Communities").click();
  await button(page, "Explore Art & design").click();
  await expect(
    page.getByText("A little study", { exact: false }),
  ).toBeVisible();
  await reset(page);
  await expect(page.getByText("A thoughtful demo post")).toHaveCount(0);
});

test("FRAME search, empty watchlist, viewer isolation, captions, actual playback and episode switching", async ({
  page,
}) => {
  await page.goto("/play/streaming/");
  await button(page, "Watchlist").click();
  await expect(page.getByText("Your collection is empty")).toBeVisible();
  await button(page, "Browse").click();
  await page.getByLabel("Search").fill("The Quiet Earth");
  await expect(page.getByText("1 result", { exact: true })).toBeVisible();
  await button(page, "The Quiet Earth").click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Earth" }),
  ).toBeVisible();
  await screenshot(page, "public/media/streaming-detail.jpg");
  await button(page, "♡ Save for later").click();
  await button(page, "▶ Play sample").click();
  const video = page.locator("video");
  await expect(video).toBeVisible();
  await expect(video.locator("track")).toHaveAttribute("src", /earth-0\.vtt/);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.duration))
    .toBeGreaterThan(5);
  await video.evaluate((element: HTMLVideoElement) => {
    element.muted = true;
    return element.play();
  });
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(1);
  await video.evaluate((element: HTMLVideoElement) => element.pause());
  await button(page, "Continue watching").click();
  await expect(button(page, "The Quiet Earth")).toBeVisible();
  await button(page, "The Quiet Earth").click();
  await button(page, "Resume sample").click();
  await page.getByLabel("Episode").selectOption("1");
  await expect(video).toHaveAttribute("src", /earth-1\.mp4/);
  await page.reload();
  await button(page, "Watchlist").click();
  await expect(button(page, "The Quiet Earth")).toBeVisible();
  await button(page, "Profiles").click();
  await button(page, "Guest").click();
  await button(page, "Watchlist").click();
  await expect(page.getByText("Your collection is empty")).toBeVisible();
});

test("VITAL dated wellness entries, validation, habits, journal and reset", async ({
  page,
}) => {
  await page.goto("/play/health/");
  await button(page, "Track habits").click();
  await screenshot(page, "public/media/health-detail.jpg");
  await page.getByLabel("Drink water").check();
  await expect(page.getByText("1 of 4 complete")).toBeVisible();
  await page.getByLabel("Wellness date").fill("2026-11-20");
  await expect(page.getByText("0 of 4 complete")).toBeVisible();
  await button(page, "Activity").click();
  await expect(page.getByText("No entries match.")).toBeVisible();
  await button(page, "Save entry").click();
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Stretch break");
  await page.getByLabel("Value (min)").fill("12");
  await button(page, "Save entry").click();
  await expect(button(page, /^Stretch break/)).toBeVisible();
  await button(page, "Journal").click();
  await page.getByLabel("Daily journal").fill("Feeling rested.");
  await page.getByLabel("Wellness date").fill("2026-11-21");
  await expect(page.getByLabel("Daily journal")).toHaveValue("");
  await button(page, "Today").click();
  await expect(page.getByText("1/4", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("1/4", { exact: true })).toBeVisible();
  await reset(page);
  await expect(page.getByText("0/4", { exact: true })).toBeVisible();
});

test("MONETA filters, edits, empty transactions, budget persistence and a local transfer", async ({
  page,
}) => {
  await page.goto("/play/finance/");
  await page.getByLabel("Range").selectOption("Week");
  await page.getByRole("combobox", { name: "Category" }).selectOption("Food");
  await expect(page.getByText(/Total spending \$/)).toBeVisible();
  await button(page, "Manage budgets").click();
  await screenshot(page, "public/media/finance-detail.jpg");
  await page.getByLabel("Monthly budget ($)").first().fill("450");
  await expect(
    page.getByText("Spent $100.00 · Remaining $350.00"),
  ).toBeVisible();
  await page.reload();
  await button(page, "Manage budgets").click();
  await expect(page.getByLabel("Monthly budget ($)").first()).toHaveValue(
    "450",
  );
  await button(page, "Accounts").click();
  await page.getByLabel("Transfer amount ($)").fill("999999999");
  await button(page, "Record simulated transfer").click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "Enter an amount within the available sample balance.",
  );
  await page.getByLabel("Transfer amount ($)").fill("100");
  await button(page, "Record simulated transfer").click();
  await expect(page.getByRole("heading", { name: "$2,600.00" })).toBeVisible();
  await button(page, "Transactions").click();
  await page.getByLabel("Search").fill("unknown merchant");
  await expect(page.getByText("No entries match.")).toBeVisible();
});

test("CRAVE meal extras, checkout validation, delivery tracking, persistence and reorder", async ({
  page,
}) => {
  await page.goto("/play/food/");
  await button(page, "Tracking").click();
  await expect(page.getByText("No active orders")).toBeVisible();
  await button(page, "Discover").click();
  await button(page, "Discover the menu").click();
  await screenshot(page, "public/media/food-detail.jpg");
  await button(page, "Customize Harvest bowl").click();
  await page.getByLabel("Customize your meal").selectOption("Extra topping");
  await expect(page.getByRole("heading", { name: "$17.00" })).toBeVisible();
  await button(page, "Add to cart").click();
  await button(page, "Continue to checkout").click();
  await button(page, "Confirm demo order").click();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.getByLabel("Email").fill("guest@example.com");
  await page
    .getByLabel("Demo delivery address")
    .selectOption("18 Market Avenue");
  await page
    .getByLabel("Delivery instructions")
    .fill("Leave at the side door.");
  await button(page, "Confirm demo order").click();
  await button(page, "Track your order").click();
  await expect(
    page.getByText(/18 Market Avenue · Leave at the side door/),
  ).toBeVisible();
  await button(page, "Next simulated event").click();
  await expect(page.locator(".timeline .done")).toHaveCount(2);
  await page.reload();
  await button(page, "Tracking").click();
  await expect(page.locator(".timeline .done")).toHaveCount(2);
  await button(page, "Orders").click();
  await button(page, "Reorder").click();
  await expect(page.getByText("Extra topping")).toBeVisible();
});

test("ROAM map/list, no matches, invalid dates, booking and trip management", async ({
  page,
}) => {
  await page.goto("/play/stays/");
  await button(page, "Trips").click();
  await expect(page.getByText("No completed orders")).toBeVisible();
  await button(page, "Browse").click();
  await page.getByLabel("Search").fill("Atlantis");
  await expect(page.getByText("No matches")).toBeVisible();
  await page.getByLabel("Search").fill("");
  await button(page, "Map + list").click();
  await button(page, /Stillwater Loft, \$/).click();
  await expect(button(page, "Stillwater Loft")).toBeFocused();
  await expect(button(page, /Stillwater Loft, \$/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .locator(".product-card")
    .filter({ hasText: "Juniper Hideaway" })
    .getByRole("button", { name: "Show on map" })
    .click();
  await expect(button(page, /Juniper Hideaway, \$/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await screenshot(page, "public/media/stays-detail.jpg");
  await button(page, "View stay").click();
  await page.getByLabel("Check-out").fill("2026-12-01");
  await button(page, "Reserve this stay").click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "Check-out must be after check-in.",
  );
  await page.getByLabel("Check-out").fill("2026-12-04");
  await button(page, "Reserve this stay").click();
  await expect(page.getByText("Total $497.00")).toBeVisible();
  await page.getByLabel("Email").fill("guest@example.com");
  await page.getByLabel("Guest name").fill("Demo guest");
  await button(page, "Confirm demo reservation").click();
  await button(page, "View trip").click();
  await expect(page.getByText(/2026-12-01 to 2026-12-04/)).toBeVisible();
  await page.reload();
  await button(page, "Trips").click();
  await button(page, "Cancel demo trip").click();
  await expect(page.getByText("No completed orders")).toBeVisible();
});

test("homepage touch swipe and case opening at a mobile viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const stack = page.locator(".stack");
    const box = await stack.boundingBox();
    if (!box) throw new Error("Missing mobile project previews");
    const cdp = await context.newCDPSession(page);
    const y = Math.round(box.y + box.height / 2);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 310, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 150, y }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(button(page, /SOCIAL/)).toHaveAttribute(
      "aria-current",
      "true",
    );
    const activePreview = page.locator(".preview.current");
    await activePreview.evaluate((element) =>
      Promise.allSettled(
        element.getAnimations().map((animation) => animation.finished),
      ),
    );
    await activePreview.tap();
    await expect(page).toHaveURL("/work/social/");
  } finally {
    await context.close();
  }
});

test("axe scan of all 17 routes", async ({ page }, info) => {
  test.setTimeout(90_000);
  const results = [];
  for (const path of [
    "/",
    "/about/",
    "/contact/",
    ...names.flatMap((slug) => [`/work/${slug}/`, `/play/${slug}/`]),
  ]) {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = violations.map((item) => ({
      id: item.id,
      targets: item.nodes.map((node) => node.target),
    }));
    results.push({ path, violations: summary });
  }
  await info.attach("axe-results.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  expect(results.filter((item) => item.violations.length)).toEqual([]);
});
