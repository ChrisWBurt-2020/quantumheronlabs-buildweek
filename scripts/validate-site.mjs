import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

// validate-site.mjs — root + platform release checks.
// Rewritten 2026-11-10 (platform modernization): the previous version read
// only the root page and asserted July 2026 Build Week content on it
// (judge mode, guided context handoffs, July capture manifests), so it
// failed on the contracting root and never opened platform/index.html at
// all. This version checks each page for what that page is supposed to be:
//   root     = the contracting headline (services, pilot, proof)
//   platform = the ancillary showcase (honest status lines, no false
//              LIVE claims, no judge funnel, demos with sample data,
//              and a contracting close back to /#services and /#pilot)
// It also acts as the root+platform shared-file regression check: both
// pages are parsed and must carry the current cache-bust version, so an
// edit to shared files (styles.css, script.js, …) that breaks either
// page fails here.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const CACHE_BUST = "20261110a";
const BUILD_STAMP = "2026.11.10.1";

async function load(rel) {
  try {
    return await readFile(path.join(root, rel), "utf8");
  } catch {
    errors.push(`missing required file: ${rel}`);
    return "";
  }
}

function structuralChecks(label, html) {
  const count = (pattern) => (html.match(pattern) || []).length;
  if (count(/<article\b/g) !== count(/<\/article>/g)) errors.push(`${label}: article tags are unbalanced`);
  if (count(/<section\b/g) !== count(/<\/section>/g)) errors.push(`${label}: section tags are unbalanced`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dupes.length) errors.push(`${label}: duplicate IDs: ${dupes.join(", ")}`);
  return ids;
}

function mustInclude(label, html, needle, why) {
  if (!html.includes(needle)) errors.push(`${label}: missing ${why} (expected: ${needle})`);
}
function mustExclude(label, html, needle, why) {
  if (html.includes(needle)) errors.push(`${label}: forbidden ${why} present (found: ${needle})`);
}

// ---------------------------------------------------------------- root
const home = await load("index.html");
structuralChecks("root", home);
for (const [needle, why] of [
  ['id="services"', "services section"],
  ['id="pilot"', "pilot section"],
  ["$5,000", "fixed pilot price"],
  ["Task Fabric", "Task Fabric proof line"],
  ['href="platform/"', "link to the platform showcase"],
  ["tailnet only", "honest private status for Learn on root"],
]) mustInclude("root", home, needle, why);
mustInclude("root", home, 'href="landing.css?v=' + CACHE_BUST + '"', "external landing stylesheet (the live CSP blocks inline styles)");
mustExclude("root", home, "<style", "inline style block on root (blocked by the live CSP; use landing.css)");
mustExclude("root", home, ' style="', "inline style attribute on root (blocked by the live CSP)");
mustExclude("root", home, "audience=judge", "retired judge funnel");
mustExclude("root", home, 'id="judge"', "retired judge section");

// ------------------------------------------------------------ platform
const platform = await load("platform/index.html");
structuralChecks("platform", platform);
for (const [needle, why] of [
  ['id="now"', "since-July lead surfaces section"],
  ['id="original"', "original surfaces section"],
  ['id="build-week"', "Build Week history section"],
  ['id="demos"', "public demos section"],
  ['id="contracting"', "contracting close section"],
  ['href="/#services"', "contracting close link to services"],
  ['href="/#pilot"', "contracting close link to pilot"],
  ["57M+", "local corpora scale line"],
  ["23 live personas, human-gated, routed to 6 outputs", "personas line"],
  ['href="learn/"', "link to the Learn sample demo"],
  ['href="graph/"', "link to the Graph sample demo"],
  ["sample data", "sample-data labelling for the public demos"],
  [`BUILD ${BUILD_STAMP}`, "current platform build stamp"],
  [`styles.css?v=${CACHE_BUST}`, "current shared stylesheet cache-bust"],
  [`script.js?v=${CACHE_BUST}`, "current shared script cache-bust"],
  [`platform.css?v=${CACHE_BUST}`, "platform-only stylesheet (external; the live CSP blocks inline styles)"],
]) mustInclude("platform", platform, needle, why);
for (const [needle, why] of [
  ["learn.quantumheronlabs.com", "dead Learn subdomain claim (404; real Study Loop is private)"],
  ["d06a5735", "hard-coded July judge trace ID"],
  ["heron_guide", "retired judge/guide funnel parameters"],
  ["Your first three minutes", "retired judge first-three-minutes funnel"],
  ["companion/bootstrap", "404 companion bootstrap"],
  ["data-heron-companion", "companion SDK bootstrap (removed from platform)"],
  ["assets/brand/surfaces/", "removed unprovenanced July surface icon set"],
  ["Captured from the live app", "July fixture captures presented as current"],
  ["GPT-5.6", "retired single-model centre (routing/governor story instead)"],
  ["<style", "inline style block (blocked by the live CSP; use platform.css)"],
]) mustExclude("platform", platform, needle, why);

// ------------------------------------------------------- public demos
for (const demo of ["learn", "graph"]) {
  const html = await load(`platform/${demo}/index.html`);
  if (!html) continue;
  structuralChecks(`platform/${demo}`, html);
  mustInclude(`platform/${demo}`, html, "Demo — sample data", "visible sample-data label");
  mustInclude(`platform/${demo}`, html, "private", "honest private status for the real surface");
  mustExclude(`platform/${demo}`, html, "learn.quantumheronlabs.com", "dead Learn subdomain");
  mustExclude(`platform/${demo}`, html, "graph.quantumheronlabs.com", "private Graph subdomain presented as public");
  mustExclude(`platform/${demo}`, html, "fetch(", "backend calls from a static dummy demo");
  // The live site CSP (script-src/style-src 'self') blocks inline code:
  // demo CSS/JS must live in external files or the demos render inert.
  // (Regression guard for the 2026-11-10 live defect: Graph drew 0 nodes
  // and the Learn quiz never ran because both shipped inline.)
  mustInclude(`platform/${demo}`, html, 'href="styles.css"', "external demo stylesheet");
  mustInclude(`platform/${demo}`, html, 'src="demo.js"', "external demo script");
  mustExclude(`platform/${demo}`, html, "<style", "inline style block (blocked by the live CSP)");
  mustExclude(`platform/${demo}`, html, ' style="', "inline style attribute (blocked by the live CSP)");
  mustExclude(`platform/${demo}`, html, "<script>", "inline script block (blocked by the live CSP)");
  const demoJs = await load(`platform/${demo}/demo.js`);
  mustExclude(`platform/${demo}/demo.js`, demoJs, "fetch(", "backend calls from a static dummy demo");
}

// ------------------------------------------------------ required files
for (const file of [
  "styles.css", "landing.css", "script.js", "heron-mascot.js", "heron-particles.js",
  "manifest.webmanifest", "robots.txt", "sitemap.xml", "favicon.png",
  "assets/brand/quantum-heron.png", "assets/brand/heron-og-20260719.png",
  "platform/index.html", "platform/learn/index.html", "platform/graph/index.html",
  "platform/platform.css",
  "platform/learn/styles.css", "platform/learn/demo.js",
  "platform/graph/styles.css", "platform/graph/demo.js",
]) {
  try { await access(path.join(root, file)); } catch { errors.push(`missing required asset: ${file}`); }
}

// The unprovenanced July icon set stays removed (one image system).
for (const surface of ["watch", "feed", "graph", "learn", "client"]) {
  try {
    await access(path.join(root, `assets/brand/surfaces/heron-${surface}.png`));
    errors.push(`assets/brand/surfaces/heron-${surface}.png must be removed (unprovenanced July set)`);
  } catch { /* expected: absent */ }
}

// ------------------------------------------- fresh capture manifests
// Watch + Feed were recaptured 2026-11-10 from their public surfaces.
// Their manifests must be dated, complete, and hash-true. The July 2026
// manifests for graph/learn/client remain in the repo as an archive and
// are deliberately NOT checked here — those captures are not presented
// on the platform page as current.
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const surface of ["watch", "feed"]) {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(root, `assets/product/${surface}/manifest.json`), "utf8"));
  } catch (error) {
    errors.push(`${surface} capture manifest is invalid: ${error.message}`);
    continue;
  }
  if (!String(manifest.capturedAt || "").startsWith("2026-11-10")) errors.push(`${surface} manifest is not the 2026-11-10 recapture`);
  if (!Array.isArray(manifest.captures) || manifest.captures.length !== 2) errors.push(`${surface} manifest must contain desktop and mobile captures`);
  for (const capture of manifest.captures || []) {
    if (!capture.asset || !capture.outputSha256) { errors.push(`${surface} ${capture.kind || "capture"} is missing asset/outputSha256`); continue; }
    try {
      const bytes = await readFile(path.join(root, capture.asset.replace(/^\//, "")));
      if (sha256(bytes) !== capture.outputSha256) errors.push(`${surface} ${capture.kind} output hash does not match its manifest`);
    } catch { errors.push(`${surface} ${capture.kind} asset cannot be read`); }
  }
}

// ------------------------------------------- Dockerfile serve check
// The image COPYs root files by explicit allowlist (platform/, assets/,
// and privacy/ go wholesale). A required root-level file missing from
// the COPY line builds green and then 404s live — exactly what happened
// to landing.css on its first deploy (2026-11-10). Guard it here.
const dockerfile = await load("Dockerfile");
const copyLine = dockerfile.split("\n").find((line) => line.startsWith("COPY index.html")) || "";
for (const file of [
  "styles.css", "landing.css", "script.js", "heron-mascot.js", "heron-particles.js",
  "manifest.webmanifest", "robots.txt", "sitemap.xml", "favicon.png",
]) {
  if (!copyLine.includes(` ${file} `) && !copyLine.includes(` ${file}`)) {
    errors.push(`Dockerfile: required root file ${file} is not on the image COPY allowlist (would 404 live)`);
  }
}

// ------------------------------------------------------------- sitemap
const sitemap = await load("sitemap.xml");
mustInclude("sitemap", sitemap, "<loc>https://quantumheronlabs.com/platform/</loc>", "platform entry");
mustInclude("sitemap", sitemap, "<lastmod>2026-11-10</lastmod>", "refreshed lastmod");

if (errors.length) {
  console.error("Site validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Validated root (contracting), platform (showcase, honest status, no judge funnel), Learn + Graph sample demos, shared-file cache-busts, and sitemap.");
