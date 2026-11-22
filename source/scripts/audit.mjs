import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const port = process.env.PORTFOLIO_AUDIT_PORT || 4180;
const base = `http://localhost:${port}`;
const slugs = [
  "ecommerce",
  "social",
  "streaming",
  "health",
  "finance",
  "food",
  "stays",
];
const paths = process.argv.slice(2);
if (!paths.length)
  paths.push("/", "/work/ecommerce/", ...slugs.map((slug) => `/play/${slug}/`));
const output = resolve(
  process.env.PORTFOLIO_AUDIT_OUTPUT || "test-results/lighthouse",
);
const server = spawn(process.execPath, ["tests/server.mjs"], {
  env: { ...process.env, PORT: port },
  stdio: "ignore",
});

function metric(report, slug, digits) {
  const value = report.audits[slug]?.numericValue;
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

try {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null)
      throw new Error("Static audit server exited during startup");
    if (
      await fetch(base)
        .then((response) => response.ok)
        .catch(() => false)
    )
      break;
    if (attempt === 29)
      throw new Error("Static export did not become available");
    await setTimeout(200);
  }
  await mkdir(output, { recursive: true });
  console.log(
    "| Route | Performance | Accessibility | Best practices | SEO | LCP (ms) | CLS | TBT (ms) |",
  );
  console.log("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const path of paths) {
    const chrome = await launch({
      chromePath: process.env.CHROMIUM_PATH,
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-dev-shm-usage",
      ],
      logLevel: "silent",
    });
    try {
      const result = await lighthouse(new URL(path, base).href, {
        port: chrome.port,
        output: "json",
        logLevel: "silent",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      });
      if (!result?.lhr || result.lhr.runtimeError)
        throw new Error(
          result?.lhr.runtimeError?.message || "Missing Lighthouse report",
        );
      const report = result.lhr;
      const id = path.replace(/^\/|\/$/g, "").replaceAll("/", "-") || "home";
      await writeFile(
        resolve(output, id + ".json"),
        JSON.stringify(report, null, 2),
      );
      const scores = Object.values(report.categories).map((category) =>
        Math.round(category.score * 100),
      );
      console.log(
        `| \`${path}\` | ${scores.join(" | ")} | ${metric(report, "largest-contentful-paint", 0)} | ${metric(report, "cumulative-layout-shift", 3)} | ${metric(report, "total-blocking-time", 0)} |`,
      );
    } finally {
      await chrome.kill();
    }
  }
} finally {
  server.kill();
}
