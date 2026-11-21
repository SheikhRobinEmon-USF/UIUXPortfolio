import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const slugs = ["ecommerce", "social", "streaming", "health", "finance", "food", "stays"] as const;
const labels = ["E-COMMERCE", "SOCIAL", "STREAMING", "HEALTH", "FINANCE", "FOOD", "STAYS"];
const widths = [320, 375, 430, 768, 1024, 1440, 1920];

async function fresh(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.setItem("sre:intro", "1");
  });
  await page.goto(url);
}

async function noOverflow(page: Page, label: string) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 500 ? 812 : 900 });
    await page.waitForTimeout(150);
    const ok = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    expect(ok, `${label} overflows horizontally at ${width}px`).toBeTruthy();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

const phone = (page: Page) => page.locator(".phone-screen");

test.describe("portfolio", () => {
  test("home: index, keyboard, overview and case-study navigation", async ({ page }) => {
    await fresh(page, "/");
    const index = page.getByRole("navigation", { name: "Project index" });
    for (const [i, label] of labels.entries()) {
      const b = index.getByRole("button", { name: new RegExp(label) });
      await b.click();
      await expect(b).toHaveAttribute("aria-current", "true");
      await expect(page.locator(".home-tag")).toContainText(label);
      await expect(page.getByRole("link", { name: "Web prototype" })).toHaveAttribute("href", `/play/${slugs[i]}/?view=web`);
    }
    await page.keyboard.press("ArrowUp");
    await expect(index.getByRole("button", { name: /FOOD/ })).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: /Overview/ }).click();
    await expect(page.locator(".home")).toHaveClass(/is-grid/);
    await page.keyboard.press("Escape");
    await expect(page.locator(".home")).not.toHaveClass(/is-grid/);
    const cta = page.getByRole("link", { name: "Case study", exact: true });
    await expect(cta).toHaveAttribute("href", "/work/food/");
    await cta.click();
    await expect(page).toHaveURL(/\/work\/food\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "CRAVE" })).toBeVisible();
    await page.getByRole("link", { name: "Index" }).click();
    await expect(page).toHaveURL(/\/\?project=food$/);
    await expect(index.getByRole("button", { name: /FOOD/ })).toHaveAttribute("aria-current", "true");
  });

  test("home and case study have no horizontal overflow and pass axe", async ({ page }) => {
    await fresh(page, "/");
    await noOverflow(page, "home");
    const home = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(home.violations.map((v) => v.id)).toEqual([]);
    await page.goto("/work/stays/");
    await expect(page.getByRole("heading", { level: 1, name: "ROAM" })).toBeVisible();
    await noOverflow(page, "case study");
    // the overview paragraph fades in word by word on scroll, so its resting state is checked separately
    const work = await new AxeBuilder({ page }).include(".c-intro").include(".c-facts").exclude(".c-scrolltext").analyze();
    expect(work.violations.map((v) => v.id)).toEqual([]);
  });

  test("case studies embed both prototypes and hand off to the next project", async ({ page }) => {
    for (const [i, slug] of slugs.entries()) {
      await page.goto(`/work/${slug}/`);
      await expect(page.locator(".c-scrolltext")).toBeVisible();
      await expect(page.getByRole("link", { name: "Open the web prototype" })).toHaveAttribute("href", `/play/${slug}/?view=web`);
      await expect(page.getByRole("link", { name: "Open the mobile app" })).toHaveAttribute("href", `/play/${slug}/?view=mobile`);
      await page.locator(".c-platforms").scrollIntoViewIfNeeded();
      await expect(page.locator(`iframe[src*="/play/${slug}/?view=web&embed=1"]`)).toHaveCount(1);
      await expect(page.locator(`iframe[src*="/play/${slug}/?view=mobile&embed=1"]`)).toHaveCount(1);
      await expect(page.locator(".c-next")).toHaveAttribute("href", `/work/${slugs[(i + 1) % slugs.length]}/`);
    }
  });

  test("about and contact render", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sheikh Robin");
    await page.goto("/contact/");
    await expect(page.getByRole("link", { name: /Email/ })).toBeVisible();
  });
});

test.describe("prototype shell", () => {
  test("switches platforms, keeps state between them, and resets", async ({ page }) => {
    await fresh(page, "/play/ecommerce/?view=mobile");
    const ph = phone(page);
    await ph.locator(".atm-tile-img").first().click();
    await ph.getByRole("button", { name: "Add to bag" }).click();
    await expect(ph.locator(".ph-tabs .ph-badge")).toHaveText("1");
    await page.getByRole("radio", { name: /Web/ }).click();
    await expect(page).toHaveURL(/view=web/);
    await expect(page.getByRole("button", { name: "Bag, 1 items" })).toBeVisible();
    await page.getByRole("button", { name: "Reset demo" }).click();
    await expect(page.getByRole("button", { name: "Bag, 0 items" })).toBeVisible();
  });

  test("defaults to the mobile app on phones and the web on desktops", async ({ browser }) => {
    const small = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await small.goto("/play/finance/");
    await expect(small.locator(".play")).toHaveClass(/view-mobile/);
    await expect(small.locator(".mnm")).toBeVisible();
    await small.close();
    const big = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await big.goto("/play/finance/");
    await expect(big.locator(".play")).toHaveClass(/view-web/);
    await big.close();
  });

  test("web prototypes do not overflow at common widths", async ({ page }) => {
    for (const slug of slugs) {
      await fresh(page, `/play/${slug}/?view=web`);
      if (slug === "social") await page.locator(".cm-onboard .cm-btn").click();
      if (slug === "streaming") await page.locator(".fr-profiles button").first().click();
      await page.waitForTimeout(400);
      await noOverflow(page, `${slug} web`);
    }
  });
});

test.describe("product journeys", () => {
  test("ATELIER: filter, configure, checkout, track and return", async ({ page }) => {
    await fresh(page, "/play/ecommerce/?view=web");
    await page.getByRole("button", { name: "Shop all" }).click();
    await page.getByRole("checkbox", { name: /Lighting/ }).check();
    await expect(page.locator(".at-applied")).toContainText("2 pieces");
    await page.getByRole("button", { name: "Open Luna Table Lamp" }).click();
    await page.locator(".at-add").click();
    await expect(page.getByRole("button", { name: "Bag, 1 items" })).toBeVisible();
    await page.getByRole("button", { name: "Bag, 1 items" }).click();
    await page.getByLabel("Promo code").fill("ATELIER10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator(".at-ok")).toContainText("ATELIER10");
    await page.getByRole("button", { name: /Checkout securely/ }).click();
    await page.getByRole("button", { name: /Continue to delivery/ }).click();
    await page.getByRole("radio", { name: /Express/ }).click();
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await page.getByRole("button", { name: /^Pay/ }).click();
    await expect(page.getByText("Card number must be 16 digits")).toBeVisible();
    await page.getByLabel("Card number").fill("4242424242424242");
    await page.getByLabel("Expiry").fill("0829");
    await page.getByLabel("Security code").fill("123");
    await page.getByRole("button", { name: /^Pay/ }).click();
    await expect(page.getByText("Thank you — it's on its way.")).toBeVisible({ timeout: 6000 });
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Simulate next update" }).click();
    await page.getByRole("button", { name: "View order" }).click();
    await page.getByRole("button", { name: "Start a return" }).click();
    await page.locator(".at-return-item input").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Confirm return" }).click();
    await expect(page.getByText("Return confirmed")).toBeVisible();
  });

  test("COMMON: onboard, critique comment, poll, publish and chat", async ({ page }) => {
    await fresh(page, "/play/social/?view=web");
    await page.getByRole("button", { name: /Join 1 circle/ }).click();
    await page.locator(".cm-post-media").first().click();
    await page.locator(".cm-reply .cm-tagpick").getByRole("button", { name: "Type" }).click();
    await page.getByLabel("Comment").fill("The headline type could be lighter.");
    await page.getByRole("button", { name: "Post", exact: true }).click();
    await expect(page.locator(".cm-comments")).toContainText("The headline type could be lighter.");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Condensed grotesk" }).click();
    await expect(page.getByRole("button", { name: /Condensed grotesk/ })).toHaveAttribute("aria-pressed", "true");
    await page.locator(".cm-create").click();
    await page.getByRole("tab", { name: /Poll/ }).click();
    await page.getByLabel("Question").fill("Sketchbook or tablet?");
    await page.getByLabel("Option 1").fill("Sketchbook");
    await page.getByLabel("Option 2").fill("Tablet");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.locator(".cm-post").first()).toContainText("Sketchbook or tablet?");
    await page.getByRole("button", { name: /Messages/ }).click();
    await page.getByLabel("Message").fill("See you Sunday!");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".cm-msgs")).toContainText("See you Sunday!");
    await expect(page.locator(".cm-msgs p:not(.me)")).toHaveCount(2, { timeout: 5000 });
  });

  test("FRAME: profile, title, player with captions and resume", async ({ page }) => {
    await fresh(page, "/play/streaming/?view=web");
    await page.getByRole("button", { name: "Sam" }).click();
    await page.getByRole("button", { name: /More info/ }).click();
    await page.locator(".fr-eps button").nth(1).click();
    const player = page.getByRole("dialog", { name: /Playing The Quiet Earth, episode 2/ });
    await expect(player).toBeVisible();
    await page.getByRole("button", { name: "Captions" }).click();
    await page.getByRole("button", { name: "Close player" }).click();
    await expect(page.locator(".fr-row").first()).toContainText("Continue watching");
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByLabel("Search titles").fill("orbit");
    await expect(page.locator(".fr-results")).toContainText("Results for");
  });

  test("VITAL: live workout closes rings, habit streak, breathing", async ({ page }) => {
    await fresh(page, "/play/health/?view=web");
    const before = await page.locator(".vt-ring-stats strong").first().innerText();
    await page.getByRole("button", { name: /Start workout/ }).click();
    await page.getByRole("button", { name: /Outdoor run/ }).click();
    await page.waitForTimeout(3500);
    const end = page.getByRole("button", { name: "Hold to end workout" });
    await end.hover();
    await page.mouse.down();
    await page.waitForTimeout(1100);
    await page.mouse.up();
    await page.getByRole("button", { name: "Save workout" }).click();
    await expect(page.locator(".vt-ring-stats strong").first()).not.toHaveText(before, { timeout: 4000 });
    await page.getByRole("button", { name: /Walk outside/ }).click();
    await expect(page.getByRole("button", { name: /Walk outside/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Mindfulness" }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.locator(".vt-orb-label")).toContainText(/Breathe in|Breathe out/);
  });

  test("MONETA: recategorise, budget, cancel subscription, send money", async ({ page }) => {
    await fresh(page, "/play/finance/?view=web");
    await page.locator(".mn-txns .mn-txn").first().click();
    await page.locator(".mn-catgrid").getByRole("button", { name: /Travel/ }).click();
    await expect(page.locator(".mn-catgrid").getByRole("button", { name: /Travel/ })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await page.getByRole("navigation", { name: "MONETA" }).getByRole("button", { name: "Subscriptions" }).click();
    await page.locator(".mn-sub").filter({ hasText: "News Daily" }).getByRole("button", { name: "Cancel" }).click();
    await page.getByRole("button", { name: /I don't use it enough/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Cancel subscription" }).click();
    await expect(page.getByText("News Daily cancelled")).toBeVisible();
    await page.getByRole("button", { name: "Done" }).click();
    await page.getByRole("button", { name: /Send money/ }).click();
    await page.getByRole("button", { name: /Maya Rivera/ }).click();
    await page.getByLabel("Amount in dollars").fill("99999");
    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.locator(".mn-err")).toContainText("more than");
    await page.getByLabel("Amount in dollars").fill("25");
    await page.getByRole("button", { name: "Review" }).click();
    await page.getByRole("button", { name: /Send \$25.00/ }).click();
    await expect(page.getByText("$25.00 sent")).toBeVisible({ timeout: 5000 });
  });

  test("CRAVE: required choice, cart, fees, order and tracking", async ({ page }) => {
    await fresh(page, "/play/food/?view=web");
    await page.getByRole("button", { name: "Open Good Buns" }).click();
    await page.locator(".cr-pop").first().click();
    await page.getByRole("button", { name: /Choose doneness/ }).click();
    await page.getByText("Medium", { exact: true }).click();
    await page.getByText("Bacon").click();
    await expect(page.locator(".cr-custom-foot .cr-btn")).toContainText("$17.00");
    await page.locator(".cr-custom-foot .cr-btn").click();
    await page.getByRole("button", { name: /Cart, 1 items/ }).click();
    await page.getByRole("button", { name: /Go to checkout/ }).click();
    await page.getByRole("button", { name: "About Service fee" }).click();
    await expect(page.getByText(/8% of subtotal/)).toBeVisible();
    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Simulate next step" }).click();
    await expect(page.getByRole("heading", { name: "Delivered" })).toBeVisible();
    await page.getByRole("radio", { name: "5 stars" }).click();
    await page.getByRole("button", { name: "Submit rating" }).click();
    await expect(page.getByText(/You rated this order 5/)).toBeVisible();
  });

  test("ROAM: filters, blocked dates, reserve and cancel", async ({ page }) => {
    await fresh(page, "/play/stays/?view=web");
    await page.getByRole("button", { name: /Filters/ }).click();
    await page.getByRole("button", { name: "Villa" }).click();
    await page.getByRole("button", { name: /Show 1 stays/ }).click();
    await expect(page.locator(".rm-results-title")).toContainText("1 stay");
    await page.getByRole("button", { name: "Open Casa Sol" }).click();
    await expect(page.locator(".rm-breakdown").first()).toContainText("Total");
    await page.getByRole("button", { name: "Reserve" }).click();
    await page.getByRole("button", { name: "Confirm and pay" }).click();
    await expect(page.locator(".rm-err")).toContainText("short message");
    await page.getByLabel("Message to host").fill("Hello! Three of us for a quiet weekend.");
    await page.getByRole("button", { name: "Confirm and pay" }).click();
    await expect(page.getByText(/Your reservation is confirmed/)).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Cancel reservation" }).click();
    await page.getByRole("button", { name: "Cancel trip" }).click();
    await expect(page.locator(".rm-trip-status")).toHaveText("Cancelled");
  });
});

test.describe("mobile app journeys", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("CRAVE mobile: dish sheet, swipe to order, tracking", async ({ page }) => {
    await fresh(page, "/play/food/");
    await page.locator(".crm-rcard-img").first().click();
    await page.locator(".crm-dish").nth(2).click();
    await page.locator(".kit-sheet .cr-btn").click();
    await page.locator(".crm-cartbar").click();
    await page.getByRole("button", { name: /Checkout/ }).click();
    await page.getByRole("button", { name: /Swipe to order/ }).click();
    await expect(page.locator(".crm-track")).toBeVisible({ timeout: 5000 });
  });

  test("MONETA mobile: keypad pay with Face ID", async ({ page }) => {
    await fresh(page, "/play/finance/");
    await page.locator(".ph-tabs").getByRole("button", { name: "Pay" }).click();
    await page.locator(".mnm-recips button").first().click();
    await page.getByRole("button", { name: "4", exact: true }).click();
    await page.getByRole("button", { name: "2", exact: true }).click();
    await page.getByRole("button", { name: /Review \$42.00/ }).click();
    await page.getByRole("button", { name: /Confirm with Face ID/ }).click();
    await expect(page.locator(".mnm-done")).toContainText("$42.00", { timeout: 5000 });
  });

  test("ROAM mobile: map toggle and listing reserve bar", async ({ page }) => {
    await fresh(page, "/play/stays/");
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.locator(".rmm-mapview")).toBeVisible();
    await page.locator(".rmm-mini").first().click();
    await expect(page.locator(".rmm-reserve")).toBeVisible();
  });

  test("COMMON mobile: story viewer and comments sheet", async ({ page }) => {
    await fresh(page, "/play/social/");
    await page.getByRole("button", { name: /Join 1 circle/ }).click();
    await page.locator(".cmm-stories .cm-story-btn").nth(1).click();
    await expect(page.getByRole("dialog", { name: /story/ })).toBeVisible();
    await page.getByRole("button", { name: "Close story" }).click();
    await page.locator(".cmm-post .cm-act").nth(1).click();
    await expect(page.getByRole("dialog", { name: "Comments" })).toBeVisible();
  });

  test("VITAL and FRAME mobile tabs render", async ({ page }) => {
    await fresh(page, "/play/health/");
    await page.locator(".ph-tabs").getByRole("button", { name: "Sleep" }).click();
    await expect(page.locator(".vtm-sleep")).toBeVisible();
    await fresh(page, "/play/streaming/");
    await page.getByRole("button", { name: "Rio" }).click();
    await page.locator(".ph-tabs").getByRole("button", { name: "Clips" }).click();
    await expect(page.locator(".frm-clips")).toBeVisible();
  });
});
