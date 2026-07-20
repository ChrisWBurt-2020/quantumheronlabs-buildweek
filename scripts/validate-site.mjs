import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");
const errors = [];
const count = (pattern) => (html.match(pattern) || []).length;

if (count(/<article\b/g) !== count(/<\/article>/g)) errors.push("article tags are unbalanced");
if (count(/<section\b/g) !== count(/<\/section>/g)) errors.push("section tags are unbalanced");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicates.length) errors.push(`duplicate IDs: ${duplicates.join(", ")}`);

for (const surface of ["feed", "graph", "learn", "client"]) {
  const link = [...html.matchAll(/href="([^"]+)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .find((value) => value.includes(`heron_to=${surface}`));
  if (!link) {
    errors.push(`missing ${surface} context handoff`);
    continue;
  }
  const params = new URL(link).searchParams;
  for (const key of ["heron_v", "heron_from", "heron_to", "trace", "capsule", "object", "source_url", "source_title"]) {
    if (!params.get(key)) errors.push(`${surface} handoff is missing ${key}`);
  }
}

for (const file of [
  "styles.css", "script.js", "manifest.webmanifest", "robots.txt", "sitemap.xml",
  "assets/brand/heron-og-20260719.png",
  ...["feed", "learn", "watch", "client", "graph"].flatMap((surface) => [
    `assets/product/${surface}/heron-${surface}-desktop.webp`,
    `assets/product/${surface}/heron-${surface}-mobile.webp`,
    `assets/product/${surface}/manifest.json`,
  ]),
]) {
  try { await access(path.join(root, file)); } catch { errors.push(`missing required asset: ${file}`); }
}

if (!html.includes('data-audience-link="judge"') || !html.includes('id="judge"')) errors.push("judge mode entry is missing");
if (errors.length) {
  console.error("Landing validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated landing structure, ${ids.length} unique IDs, four context handoffs, and required product assets.`);
