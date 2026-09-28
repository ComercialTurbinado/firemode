import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2];
if (!dist) {
  console.error("uso: node scripts/check-agent-readiness.mjs <dist>");
  process.exit(1);
}

const errors = [];
function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  const path = join(dist, rel);
  if (!existsSync(path)) {
    fail(`ausente: ${rel}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headings(html) {
  const without = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const out = [];
  for (const match of without.matchAll(/<h([1-6])\b[^>]*>/gi)) out.push(Number(match[1]));
  return out;
}

function assertSequential(rel, html) {
  const levels = headings(html);
  if (!levels.includes(1)) fail(`${rel}: sem H1`);
  let prev = 0;
  for (const level of levels) {
    if (prev && level > prev + 1) fail(`${rel}: hierarquia pula de H${prev} para H${level}`);
    prev = level;
  }
}

function assertLong(rel, html, min = 500) {
  const text = visibleText(html);
  if (text.length < min) fail(`${rel}: ${text.length} caracteres visíveis (mínimo ${min})`);
}

const home = read("index.html");
assertSequential("index.html", home);
assertLong("index.html", home, 500);
if (home.includes("99999-9999") || home.includes("seu@email.com")) fail("index.html ainda tem contato fictício");
if (!home.includes('rel="alternate"') || !home.includes("index.md")) fail("index.html sem alternate Markdown");

const blocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]));
const orgs = [];
function walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(walk);
  if (node["@type"] === "Organization") orgs.push(node);
  for (const value of Object.values(node)) walk(value);
}
blocks.forEach(walk);
const org = orgs.find((item) => item.contactPoint && item.address && item.url);
if (!org) fail("JSON-LD Organization sem contactPoint, address e url");
else {
  const point = org.contactPoint;
  const address = org.address;
  if (!point.email || !point.telephone || !point.contactType) fail("contactPoint incompleto");
  if (address["@type"] !== "PostalAddress" || !address.addressCountry) fail("address não é PostalAddress");
  if (!org.logo && !org.sameAs) fail("Organization sem logo ou sameAs");
  if (!org.description && !orgs.some((item) => item.description)) fail("Organization sem description");
}

for (const rel of ["about/index.html", "contact/index.html", "privacy/index.html"]) {
  const html = read(rel);
  assertSequential(rel, html);
  assertLong(rel, html, 500);
}

const missing = read("404.html");
const missingText = visibleText(missing);
if (missingText.length < 20) fail("404.html curto demais");
if (!missing.includes("/llms.txt") || !missing.includes("/sitemap.xml")) fail("404.html sem link para llms.txt ou sitemap");
assertSequential("404.html", missing);

const llms = read("llms.txt");
if (!/^#\s+\S/m.test(llms)) fail("llms.txt sem título");
if (!llms.includes("## When to use this")) fail("llms.txt sem seção When to use this");
if (!llms.includes("https://wa.me/5511982195839")) fail("llms.txt sem canal de chamada");
if (llms.length < 400) fail("llms.txt genérico demais");

const markdown = read("index.md");
if (!markdown.startsWith("# ") || markdown.trim().length < 200) fail("index.md vazio");

const sitemap = read("sitemap.xml");
if (!sitemap.includes("<urlset") || !sitemap.includes("<lastmod>")) fail("sitemap.xml inválido");
for (const loc of [
  "https://firemode.com.br/",
  "https://firemode.com.br/about/",
  "https://firemode.com.br/contact/",
  "https://firemode.com.br/privacy/",
]) {
  if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`sitemap sem ${loc}`);
}
if (Buffer.byteLength(sitemap) > 50 * 1024 * 1024) fail("sitemap acima de 50MB");

const robots = read("robots.txt");
if (!robots.includes("Sitemap: https://firemode.com.br/sitemap.xml")) fail("robots.txt sem sitemap");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("agent-readiness ok");
