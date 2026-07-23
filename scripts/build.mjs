import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const outputRoot = path.join(projectRoot, "dist");
const contactEmail = "info@topundred.com";
const siteOrigin = "https://jellywalk-legal.vercel.app";

const documents = [
  {
    slug: "privacy-policy",
    source: "privacy-policy.md",
    pdf: "privacy-policy.pdf",
    pdfName: "jellywalk-privacy-policy.pdf",
    shortTitle: "Privacy Policy",
    summary: "How Jellywalk collects, uses, protects, and lets you control personal information."
  },
  {
    slug: "terms-of-service",
    source: "terms-of-service.md",
    pdf: "terms-of-service.pdf",
    pdfName: "jellywalk-terms-of-service.pdf",
    shortTitle: "Terms of Service",
    summary: "The rules, responsibilities, and location-based service terms for using Jellywalk."
  }
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const slugify = (value) => String(value)
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "section";

function parseDocument(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error("Document is missing YAML-style metadata.");
  }

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    metadata[key] = value;
  }

  const body = source
    .slice(match[0].length)
    .replace(/<style>[\s\S]*?<\/style>\s*/gi, "")
    .replace(/<div class=["']page-break["']><\/div>\s*/gi, "")
    .replace(/^(#{1,5})(\s+)/gm, "$1#$2");

  return { metadata, body };
}

function createMarkdownRenderer() {
  const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true
  });

  markdown.renderer.rules.heading_open = (tokens, index, options, environment, renderer) => {
    const token = tokens[index];
    const inline = tokens[index + 1];
    const baseId = `section-${slugify(inline?.content ?? "section")}`;
    const seen = environment.seenHeadingIds ?? new Map();
    environment.seenHeadingIds = seen;
    const occurrence = (seen.get(baseId) ?? 0) + 1;
    seen.set(baseId, occurrence);
    const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
    token.attrSet("id", id);

    if (token.tag === "h2") {
      environment.sections.push({ id, label: inline.content });
    }

    return renderer.renderToken(tokens, index, options);
  };

  return markdown;
}

function siteHeader(activeSlug = "") {
  const links = documents.map((document) => {
    const current = document.slug === activeSlug ? ' aria-current="page"' : "";
    return `<a href="/${document.slug}/"${current}>${escapeHtml(document.shortTitle)}</a>`;
  }).join("");

  return `<header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="/" aria-label="Jellywalk legal home">
          <span class="brand-mark" aria-hidden="true">J</span>
          <span class="brand-label">Jellywalk<small>Legal center</small></span>
        </a>
        <nav class="site-nav" aria-label="Legal documents">${links}</nav>
      </div>
    </header>`;
}

function htmlShell({ title, description, slug = "", content }) {
  const canonicalPath = slug ? `/${slug}/` : "/";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="theme-color" content="#321a84">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${siteOrigin}${canonicalPath}">
    <meta property="og:site_name" content="Jellywalk Legal">
    <link rel="canonical" href="${siteOrigin}${canonicalPath}">
    <link rel="stylesheet" href="/assets/styles.css">
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    ${siteHeader(slug)}
    ${content.trim()}
    <footer class="site-footer">
      <div class="shell">© ${new Date().getUTCFullYear()} Topundred Inc. · <a href="mailto:${contactEmail}">${contactEmail}</a></div>
    </footer>
  </body>
</html>
`;
}

function renderHome() {
  const cards = documents.map((document) => `
            <a class="document-card" href="/${document.slug}/">
              <strong>${escapeHtml(document.shortTitle)}</strong>
              <span>${escapeHtml(document.summary)}</span>
              <b aria-hidden="true">→</b>
            </a>`).join("");

  return htmlShell({
    title: "Jellywalk Legal",
    description: "Read Jellywalk's Privacy Policy and Terms of Service.",
    content: `<main id="main-content" class="shell hero" tabindex="-1">
      <section class="hero-card" aria-labelledby="page-title">
        <p class="eyebrow">Jellywalk legal center</p>
        <h1 id="page-title">The policies behind every step.</h1>
        <p class="hero-intro">Read how Jellywalk handles your information and the terms that apply when you use the service.</p>
        <div class="document-cards">${cards}
        </div>
      </section>
    </main>`
  });
}

function renderLegalPage(document, metadata, bodyHtml, sections) {
  const toc = sections.map((section) => `
          <li><a href="#${section.id}">${escapeHtml(section.label)}</a></li>`).join("");

  return htmlShell({
    title: metadata.title,
    description: document.summary,
    slug: document.slug,
    content: `<main class="shell doc-layout">
      <aside class="toc" aria-labelledby="toc-title">
        <h2 id="toc-title">On this page</h2>
        <nav aria-label="${escapeHtml(document.shortTitle)} sections">
          <ul>${toc}
          </ul>
        </nav>
      </aside>
      <article id="main-content" class="legal-document" tabindex="-1">
        <header class="document-header">
          <p class="eyebrow">Topundred Inc.</p>
          <h1>${escapeHtml(metadata.title)}</h1>
          <p class="document-meta">${escapeHtml(metadata.date)}</p>
          <div class="document-actions">
            <a class="button-link" href="/downloads/${document.pdfName}" download>Download PDF</a>
          </div>
        </header>
        <div class="document-copy">${bodyHtml}</div>
        <footer class="document-footer">
          <p>Questions about this document? Email <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
        </footer>
      </article>
    </main>`
  });
}

function renderNotFound() {
  return htmlShell({
    title: "Page not found · Jellywalk Legal",
    description: "The requested Jellywalk legal page could not be found.",
    content: `<main id="main-content" class="shell error-page" tabindex="-1">
      <div>
        <p class="eyebrow">Page not found</p>
        <h1>404</h1>
        <p>The page you requested is not part of the Jellywalk legal center.</p>
        <p><a class="button-link" href="/">Return to the legal center</a></p>
      </div>
    </main>`
  });
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await Promise.all([
    mkdir(path.join(outputRoot, "assets"), { recursive: true }),
    mkdir(path.join(outputRoot, "downloads"), { recursive: true })
  ]);

  await Promise.all([
    copyFile(path.join(projectRoot, "assets", "styles.css"), path.join(outputRoot, "assets", "styles.css")),
    writeFile(path.join(outputRoot, "index.html"), renderHome()),
    writeFile(path.join(outputRoot, "404.html"), renderNotFound()),
    writeFile(path.join(outputRoot, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`),
    writeFile(path.join(outputRoot, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteOrigin}/</loc></url>\n  <url><loc>${siteOrigin}/privacy-policy/</loc></url>\n  <url><loc>${siteOrigin}/terms-of-service/</loc></url>\n</urlset>\n`)
  ]);

  for (const document of documents) {
    const source = await readFile(path.join(projectRoot, document.source), "utf8");
    const { metadata, body } = parseDocument(source);
    const environment = { sections: [] };
    const bodyHtml = createMarkdownRenderer().render(body, environment);
    const pageDirectory = path.join(outputRoot, document.slug);
    await mkdir(pageDirectory, { recursive: true });
    await Promise.all([
      writeFile(path.join(pageDirectory, "index.html"), renderLegalPage(document, metadata, bodyHtml, environment.sections)),
      copyFile(path.join(projectRoot, document.pdf), path.join(outputRoot, "downloads", document.pdfName))
    ]);
  }

  console.log(`Built ${documents.length + 1} pages in ${path.relative(projectRoot, outputRoot)}/`);
}

await build();
