import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const slugs = [
  "ecommerce",
  "social",
  "streaming",
  "health",
  "finance",
  "food",
  "stays",
];
test("all intended static routes exist and reference working links", () => {
  for (const slug of slugs) {
    const caseHtml = fs.readFileSync(`out/work/${slug}/index.html`, "utf8");
    const playHtml = fs.readFileSync(`out/play/${slug}/index.html`, "utf8");
    assert.ok(caseHtml.includes(`/play/${slug}/`));
    assert.ok(playHtml.includes(`/work/${slug}/`));
    assert.ok(playHtml.includes("Reset demo data"));
    assert.ok(fs.existsSync(`out/media/${slug}.webp`));
    assert.ok(fs.existsSync(`out/media/${slug}-mobile.webp`));
    assert.ok(fs.existsSync(`out/media/${slug}-tablet.webp`));
    for (const view of ["screen", "detail"]) {
      const file = `${slug}-${view}.jpg`;
      assert.ok(
        caseHtml.includes(file),
        `Missing case-study capture for ${slug}`,
      );
      assert.ok(fs.statSync(`out/media/${file}`).size > 10_000);
    }
  }
  for (const p of ["index.html", "about/index.html", "contact/index.html"])
    assert.ok(fs.existsSync(`out/${p}`));
});
test("all 7 project menus and accessible landmarks render in homepage", () => {
  const html = fs.readFileSync("out/index.html", "utf8");
  for (const label of [
    "E-COMMERCE",
    "SOCIAL",
    "STREAMING",
    "HEALTH",
    "FINANCE",
    "FOOD",
    "STAYS",
  ])
    assert.ok(html.includes(label));
  assert.ok(html.includes("Skip to content"));
  assert.ok(html.includes("Previous project"));
  assert.ok(html.includes("Next project"));
});
test("local original media included", () => {
  for (const file of [
    "chair",
    "vase",
    "bag",
    "lamp",
    "bowl",
    "rice",
    "pizza",
    "burger",
    "cabin",
    "house",
    "loft",
    "villa",
    "earth",
    "rain",
    "orbit",
    "blue",
  ])
    assert.ok(
      fs.readFileSync(`out/media/${file}.svg`, "utf8").includes("<svg"),
    );
  for (const title of ["earth", "rain", "orbit", "blue"]) {
    for (const episode of [0, 1, 2]) {
      assert.ok(fs.statSync(`out/media/${title}-${episode}.mp4`).size > 5000);
      assert.ok(
        fs
          .readFileSync(`out/media/${title}-${episode}.vtt`, "utf8")
          .startsWith("WEBVTT"),
      );
    }
  }
});
