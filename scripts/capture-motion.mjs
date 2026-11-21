import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { chromium } from "playwright";

const port = process.env.PORTFOLIO_MOTION_PORT || 4181;
const base = `http://localhost:${port}`;
const scratch = "test-results/motion";
const server = spawn(process.execPath, ["tests/server.mjs"], {
  env: { ...process.env, PORT: port },
  stdio: "ignore",
});

let browser;
try {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null)
      throw new Error("Motion capture server exited");
    if (
      await fetch(base)
        .then((response) => response.ok)
        .catch(() => false)
    )
      break;
    if (attempt === 29) throw new Error("Static export is unavailable");
    await setTimeout(200);
  }
  await mkdir("docs", { recursive: true });
  await mkdir(scratch, { recursive: true });
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: scratch, size: { width: 1008, height: 630 } },
  });
  const page = await context.newPage();
  const video = page.video();
  await page.goto(base);
  await page
    .locator(".preview.current img")
    .evaluate((image) => image.decode());
  const deck = await page.locator(".preview.current").boundingBox();
  if (!deck) throw new Error("Project artwork is missing");
  await page.mouse.move(
    deck.x + deck.width * 0.72,
    deck.y + deck.height * 0.44,
  );
  await setTimeout(400);
  await page.mouse.wheel(0, 140);
  await page.getByRole("button", { name: /SOCIAL/ }).waitFor();
  await setTimeout(700);
  await page.getByRole("button", { name: /FINANCE/ }).click();
  await setTimeout(700);
  await page.locator(".preview.current").click();
  await page.waitForURL("**/work/finance/");
  await setTimeout(740);
  const next = page.getByRole("link", { name: /Next project/ });
  await next.scrollIntoViewIfNeeded();
  await setTimeout(400);
  await next.click();
  await page.waitForURL("**/work/food/");
  await setTimeout(740);
  await page
    .getByRole("link", { name: "Explore interactive prototype" })
    .click();
  await page.getByRole("button", { name: "Discover the menu" }).click();
  await page
    .getByRole("heading", { name: "The Green Table", exact: true })
    .waitFor();
  await setTimeout(550);
  await page.getByRole("button", { name: /Customize/ }).first().hover();
  await setTimeout(550);
  await page.goto(`${base}/play/ecommerce/`);
  const card = page.locator(".catalog-results .product-card").first();
  await card.scrollIntoViewIfNeeded();
  await setTimeout(450);
  await card.hover();
  await setTimeout(600);
  await card.getByRole("button", { name: /^Save/ }).click();
  await setTimeout(500);
  await page.goto(`${base}/play/health/`);
  await page.locator(".trend-panel").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /2026-11-18, 37 min/ }).click();
  await setTimeout(500);
  await page.getByRole("button", { name: /2026-11-21, 28 min/ }).click();
  await page.locator(".wellness-timeline").scrollIntoViewIfNeeded();
  await page.locator(".ledger-entry").first().hover();
  await setTimeout(750);
  await page.locator(".ledger-entry").first().getByRole("button", { name: "Edit" }).click();
  await setTimeout(750);
  await context.close();
  await video.saveAs("docs/project-transitions.webm");
} finally {
  await browser?.close();
  server.kill();
  await rm(scratch, { recursive: true, force: true });
}
