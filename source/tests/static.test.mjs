import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const slugs = ["ecommerce", "social", "streaming", "health", "finance", "food", "stays"];

test("every case study and prototype route is exported and cross-linked", () => {
  for (const slug of slugs) {
    const work = fs.readFileSync(`out/work/${slug}/index.html`, "utf8");
    const play = fs.readFileSync(`out/play/${slug}/index.html`, "utf8");
    assert.ok(work.includes(`/play/${slug}/?view=web`), `${slug}: case links to web prototype`);
    assert.ok(work.includes(`/play/${slug}/?view=mobile`), `${slug}: case links to mobile app`);
    assert.ok(play.includes(`/work/${slug}/`), `${slug}: prototype links back to case`);
    assert.ok(fs.existsSync(`out/media/${slug}.webp`));
    for (const shot of ["web-1", "web-2", "mobile-1", "mobile-2", "mobile-3"])
      assert.ok(fs.statSync(`out/media/cases/${slug}-${shot}.jpg`).size > 10_000, `${slug} ${shot} capture`);
  }
  for (const p of ["index.html", "about/index.html", "contact/index.html"]) assert.ok(fs.existsSync(`out/${p}`));
});

test("homepage renders the project index and accessible landmarks", () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  for (const label of ["E-COMMERCE", "SOCIAL", "STREAMING", "HEALTH", "FINANCE", "FOOD", "STAYS"]) assert.ok(html.includes(label));
  assert.ok(html.includes("Skip to content"));
  assert.ok(html.includes("Project index"));
});

test("fonts, captioned clips and stills ship with the export", () => {
  for (const f of ["manrope", "instrument-serif", "fraunces", "bricolage", "space-grotesk", "dm-sans", "inter-tight", "jetbrains-mono", "syne"])
    assert.ok(fs.statSync(`out/fonts/${f}.woff2`).size > 5000, f);
  for (const title of ["earth", "rain", "orbit", "blue"])
    for (const ep of [0, 1, 2]) {
      assert.ok(fs.statSync(`out/media/${title}-${ep}.mp4`).size > 5000);
      assert.ok(fs.readFileSync(`out/media/${title}-${ep}.vtt`, "utf8").startsWith("WEBVTT"));
      assert.ok(fs.existsSync(`out/media/still-${title}-${ep}.webp`));
    }
});
