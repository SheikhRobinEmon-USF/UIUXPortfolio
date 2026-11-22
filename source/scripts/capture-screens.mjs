// Captures key web and mobile screens of every prototype for the case studies.
// Usage: npm run build && npm run preview (in another shell) && node scripts/capture-screens.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://localhost:4173";
const out = "public/media/cases";
fs.mkdirSync(out, { recursive: true });

/** [name, view, steps] — steps are clicks (selector) or waits (ms). */
const plans = {
  ecommerce: [
    ["web-1", "web", []],
    ["web-2", "web", [".at-card-open", 1400]],
    ["mobile-1", "mobile", []],
    ["mobile-2", "mobile", [".atm-tile-img", 1200]],
    ["mobile-3", "mobile", [".atm-tile-img", 1000, ".atm-buybar .ph-btn", 600, ".ph-tabs button:nth-child(4)", 1000]],
  ],
  social: [
    ["web-1", "web", [".cm-onboard .cm-btn", 1200]],
    ["web-2", "web", [".cm-onboard .cm-btn", 900, ".cm-post-media", 1200]],
    ["mobile-1", "mobile", [".cm-onboard .cm-btn", 1200]],
    ["mobile-2", "mobile", [".cm-onboard .cm-btn", 900, ".cmm-stories .cm-story-btn:nth-child(2)", 1400]],
    ["mobile-3", "mobile", [".cm-onboard .cm-btn", 900, ".cmm-post .cm-act:nth-child(2)", 1100]],
  ],
  streaming: [
    ["web-1", "web", [".fr-profiles button", 2600]],
    ["web-2", "web", [".fr-profiles button", 2200, ".fr-hero-btns .ghost", 1400]],
    ["mobile-1", "mobile", [".fr-profiles button", 2200]],
    ["mobile-2", "mobile", [".fr-profiles button", 1800, ".ph-tabs button:nth-child(2)", 1200]],
    ["mobile-3", "mobile", [".fr-profiles button", 1800, ".ph-tabs button:nth-child(3)", 1600]],
  ],
  health: [
    ["web-1", "web", []],
    ["web-2", "web", [".vt-side nav button:nth-child(3)", 1400]],
    ["mobile-1", "mobile", []],
    ["mobile-2", "mobile", [".ph-tabs button:nth-child(3)", 1300]],
    ["mobile-3", "mobile", [".ph-tabs button:nth-child(2)", 900, ".vtm-wtypes button", 3200]],
  ],
  finance: [
    ["web-1", "web", []],
    ["web-2", "web", [".mn-side nav button:nth-child(4)", 1400]],
    ["mobile-1", "mobile", []],
    ["mobile-2", "mobile", [".ph-tabs button:nth-child(3)", 900, ".mnm-recips button", ".mn-keypad button:nth-child(5)", ".mn-keypad button:nth-child(11)", 600]],
    ["mobile-3", "mobile", [".ph-tabs button:nth-child(4)", 1200]],
  ],
  food: [
    ["web-1", "web", []],
    ["web-2", "web", [".cr-rcard-img", 1300]],
    ["mobile-1", "mobile", []],
    ["mobile-2", "mobile", [".crm-rcard-img", 1000, ".crm-dish", 1100]],
    ["mobile-3", "mobile", [".crm-rcard-img", 900, ".crm-dish:nth-of-type(3)", 900, ".kit-sheet .cr-btn", 800, ".crm-cartbar", 800, ".ph-cta-bar .ph-btn", 800, ".kit-swipe-knob", 4200]],
  ],
  stays: [
    ["web-1", "web", []],
    ["web-2", "web", [".rm-card-open", 1500]],
    ["mobile-1", "mobile", []],
    ["mobile-2", "mobile", [".rmm-mapbtn", 1300]],
    ["mobile-3", "mobile", [".rmm-card-info", 1300]],
  ],
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const [slug, shots] of Object.entries(plans)) {
  for (const [name, view, steps] of shots) {
    const mobile = view === "mobile";
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1 });
    await page.goto(`${base}/play/${slug}/?view=${view}&embed=1`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    for (const step of steps) {
      if (typeof step === "number") await page.waitForTimeout(step);
      else await page.locator(step).first().click({ timeout: 6000 }).catch((e) => console.warn(slug, name, step, e.message.split("\n")[0]));
    }
    await page.waitForTimeout(500);
    const file = `${out}/${slug}-${name}.jpg`;
    await page.screenshot({ path: file, type: "jpeg", quality: 80 });
    console.log("captured", file);
    await page.close();
  }
}
await browser.close();
