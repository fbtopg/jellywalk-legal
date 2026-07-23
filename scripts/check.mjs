import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const oldEmail = ["info", "seoulsheets.com"].join("@");
const newEmail = "info@topundred.com";

const pages = [
  "dist/index.html",
  "dist/privacy-policy/index.html",
  "dist/terms-of-service/index.html",
  "dist/404.html"
];

const sourceFiles = [
  "README.md",
  "drafts/outline.md",
  "privacy-policy.md",
  "privacy-policy.html",
  "terms-of-service.md",
  "terms-of-service.html"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateAnchors(html, file) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const duplicates = [...html.matchAll(/\sid="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((id, index, all) => all.indexOf(id) !== index);
  assert(duplicates.length === 0, `${file} has duplicate IDs: ${duplicates.join(", ")}`);

  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert(ids.has(match[1]), `${file} links to missing #${match[1]}`);
  }
}

for (const file of [...sourceFiles, ...pages]) {
  const content = await readFile(path.join(projectRoot, file), "utf8");
  assert(!content.includes(oldEmail), `${file} still contains ${oldEmail}`);
}

for (const file of pages) {
  const html = await readFile(path.join(projectRoot, file), "utf8");
  assert(html.includes('<html lang="en">'), `${file} is missing a language declaration`);
  assert(html.includes("<main"), `${file} is missing its main landmark`);
  assert(html.includes('class="skip-link"'), `${file} is missing its skip link`);
  assert(html.includes('/assets/jellywalk-logo.jpg'), `${file} is missing the Jellywalk logo`);
  assert(html.includes(newEmail), `${file} is missing the current contact email`);
  validateAnchors(html, file);
}

for (const file of pages.slice(1, 3)) {
  const html = await readFile(path.join(projectRoot, file), "utf8");
  assert(html.includes("<article"), `${file} is missing the document article`);
  assert(html.includes('aria-label="Legal documents"'), `${file} is missing labeled navigation`);
  assert(html.includes("/downloads/jellywalk-"), `${file} is missing its PDF download`);
}

await Promise.all([
  readFile(path.join(projectRoot, "dist/downloads/jellywalk-privacy-policy.pdf")),
  readFile(path.join(projectRoot, "dist/downloads/jellywalk-terms-of-service.pdf")),
  readFile(path.join(projectRoot, "dist/assets/styles.css")),
  readFile(path.join(projectRoot, "dist/assets/jellywalk-logo.jpg"))
]);

console.log(`Validated ${pages.length} pages, internal anchors, source email replacement, assets, and downloads.`);
