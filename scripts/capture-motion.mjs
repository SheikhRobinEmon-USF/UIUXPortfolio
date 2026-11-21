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
  await page.getByRole("button", { name: /SOCIAL/ }).click();
  await setTimeout(750);
  await page.getByRole("button", { name: /E-COMMERCE/ }).click();
  await setTimeout(750);
  await page.locator(".preview.current").click();
  await page.waitForURL("**/work/ecommerce/");
  await setTimeout(750);
  await page
    .getByRole("link", { name: "Explore interactive prototype" })
    .click();
  await page.getByRole("button", { name: "Forma chair", exact: true }).click();
  await page
    .getByRole("heading", { name: "Forma chair", exact: true })
    .waitFor();
  await setTimeout(850);
  await context.close();
  await video.saveAs("docs/project-transitions.webm");
} finally {
  await browser?.close();
  server.kill();
  await rm(scratch, { recursive: true, force: true });
}
