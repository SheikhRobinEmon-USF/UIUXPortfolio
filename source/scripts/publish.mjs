// Builds the static site and publishes it to the repository root, where
// GitHub Pages ("Deploy from a branch → main / (root)") serves it.
//
//   npm run publish            → https://<user>.github.io/UIUXPortfolio/
//   BASE_PATH=/other npm run publish
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const basePath = process.env.BASE_PATH ?? "/UIUXPortfolio";
const root = path.resolve("..");
const manifestFile = path.join(root, ".site-files.json");
const protectedNames = new Set(["source", "docs", ".git", ".github", "README.md", "LICENSE", ".gitignore", ".site-files.json", ".nojekyll", ".openai"]);

const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
});
if (build.status !== 0) process.exit(build.status ?? 1);

// Remove what the previous publish wrote (and only that).
const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : [];
for (const name of previous) {
  if (protectedNames.has(name) || name.includes("/") || name.startsWith("..")) continue;
  fs.rmSync(path.join(root, name), { recursive: true, force: true });
}

const entries = fs.readdirSync("out");
for (const name of entries) {
  if (protectedNames.has(name)) throw new Error(`Refusing to overwrite ${name}`);
  fs.cpSync(path.join("out", name), path.join(root, name), { recursive: true });
}
fs.writeFileSync(path.join(root, ".nojekyll"), "");
fs.writeFileSync(manifestFile, JSON.stringify(entries.sort(), null, 2) + "\n");
console.log(`Published ${entries.length} entries to the repository root with base path ${basePath || "/"}.`);
