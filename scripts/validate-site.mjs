import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");
const errors = [];
const count = (pattern) => (html.match(pattern) || []).length;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

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
  for (const key of ["heron_v", "heron_from", "heron_to", "trace", "capsule", "object", "learning_domain", "archetype", "source_url", "source_title"]) {
    if (!params.get(key)) errors.push(`${surface} handoff is missing ${key}`);
  }
}

for (const file of [
  "styles.css", "script.js", "manifest.webmanifest", "robots.txt", "sitemap.xml",
  "favicon.png", "assets/brand/quantum-heron.png", "assets/vendor/heron-companion/heron-companion.png",
  "assets/vendor/heron-companion/heron-companion.iife.js", "assets/vendor/heron-companion/heron-companion.css",
  "assets/vendor/heron-companion/heron-companion-v3.webp", "assets/vendor/heron-companion/heron-companion-v3.png",
  "assets/vendor/heron-companion/release-manifest.json",
  "assets/brand/heron-og-20260719.png",
  ...["feed", "learn", "watch", "client", "graph"].map((surface) => `assets/brand/surfaces/heron-${surface}.png`),
  ...["feed", "learn", "watch", "client", "graph"].flatMap((surface) => [
    `assets/product/${surface}/heron-${surface}-desktop.webp`,
    `assets/product/${surface}/heron-${surface}-mobile.webp`,
    `assets/product/${surface}/manifest.json`,
  ]),
]) {
  try { await access(path.join(root, file)); } catch { errors.push(`missing required asset: ${file}`); }
}

const captureHashes = new Set();
for (const surface of ["feed", "learn", "watch", "client", "graph"]) {
  const manifestPath = path.join(root, `assets/product/${surface}/manifest.json`);
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    for (const key of ["surface", "dataset", "sourceRepository", "sourceGitRoot", "sourceCommit", "sourceTreeState", "sourceRoute", "fixtureState", "captureCommand", "capturedAt"]) {
      if (!manifest[key]) errors.push(`${surface} manifest is missing ${key}`);
    }
    if (manifest.surface !== surface) errors.push(`${surface} manifest surface does not match`);
    if (/dirty/i.test(String(manifest.sourceTreeState))) errors.push(`${surface} capture was sourced from a dirty tree`);
    if (manifest.dataset !== "trustworthy-agent-design-v1") errors.push(`${surface} does not use the shared fixture bundle`);
    if (!Array.isArray(manifest.captures) || manifest.captures.length !== 2) errors.push(`${surface} manifest must contain desktop and mobile captures`);
    for (const capture of manifest.captures || []) {
      for (const key of ["kind", "viewport", "sourceArtifact", "sourceSha256", "asset", "outputSha256"]) {
        if (!capture[key]) errors.push(`${surface} ${capture.kind || "capture"} is missing ${key}`);
      }
      if (captureHashes.has(capture.sourceSha256)) errors.push(`duplicate screenshot source hash: ${capture.sourceSha256}`);
      captureHashes.add(capture.sourceSha256);
      if (capture.asset) {
        const assetPath = path.join(root, capture.asset.replace(/^\//, ""));
        try {
          const bytes = await readFile(assetPath);
          if (sha256(bytes) !== capture.outputSha256) errors.push(`${surface} ${capture.kind} output hash does not match`);
        } catch { errors.push(`${surface} ${capture.kind} asset cannot be read`); }
      }
    }
  } catch (error) {
    errors.push(`${surface} manifest is invalid: ${error.message}`);
  }
}
if (captureHashes.size !== 10) errors.push(`expected 10 unique screenshot sources, found ${captureHashes.size}`);
for (const stale of ["welcome screen", "SIGNED-OUT ENTRY", "privacy-safe signed-out welcome state"]) {
  if (html.includes(stale)) errors.push(`stale product capture copy remains: ${stale}`);
}

if (!html.includes('data-audience-link="judge"') || !html.includes('id="judge"')) errors.push("judge mode entry is missing");
if (!html.includes('data-heron-app="quantum"') || !html.includes('data-anonymous="true"')) errors.push("public companion bootstrap is missing");
for (const phrase of ["User-created domains", "Combinable archetypal", "multimodal"]) {
  if (!html.includes(phrase)) errors.push(`landing copy is missing implemented capability: ${phrase}`);
}
if (errors.length) {
  console.error("Landing validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated landing structure, ${ids.length} unique IDs, four context handoffs, ten fresh captures, and five complete manifests.`);
