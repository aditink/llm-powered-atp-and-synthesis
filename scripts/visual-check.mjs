import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.goto("http://127.0.0.1:5173/cleopatra-paper/", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/cleopatra-desktop.png", fullPage: true });
const desktop = await page.evaluate(() => ({
  title: document.title,
  bodyWidth: document.body.scrollWidth,
  viewportWidth: innerWidth,
  images: [...document.images].map((img) => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight })),
}));
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/cleopatra-paper/#prompts", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/cleopatra-mobile.png", fullPage: true });
const mobile = await page.evaluate(() => ({
  bodyWidth: document.body.scrollWidth,
  viewportWidth: innerWidth,
  promptTitle: document.querySelector(".prompt-reader h2")?.textContent,
}));
const pages = {};
for (const route of ["cases", "results", "prompts"]) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:5173/cleopatra-paper/#${route}`, { waitUntil: "networkidle" });
  pages[route] = await page.evaluate((currentRoute) => ({
    heading: document.querySelector("h1")?.textContent,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: innerWidth,
  }), route);
  if (route === "cases") {
    await page.locator(".case-row details summary").first().click();
    await page.locator('[data-case-tab="synthesis"]').first().click();
    pages.cases.synthesisTab = await page.locator(".case-row details[open] h3").first().textContent();
    await page.screenshot({ path: "/tmp/cleopatra-cases.png", fullPage: true });
  }
  if (route === "results") {
    pages.results.tables = await page.locator(".paper-table").count();
    pages.results.rows = await page.locator(".paper-table tbody tr").count();
    await page.locator('[data-result="synthesis"]').click();
    pages.results.synthesisTables = await page.locator(".paper-table").count();
    pages.results.synthesisRows = await page.locator(".paper-table tbody tr").count();
    await page.screenshot({ path: "/tmp/cleopatra-results.png", fullPage: true });
  }
  if (route === "prompts") {
    pages.prompts.traces = await page.locator(".trace-card").count();
    pages.prompts.nonemptyTactics = await page.locator(".trace-card pre").evaluateAll(
      (nodes) => nodes.filter((node) => node.textContent.trim().length > 0).length,
    );
  }
}
await page.goto("http://127.0.0.1:5173/cleopatra-paper/#overview", { waitUntil: "networkidle" });
await page.locator(".hero-citation summary").click();
pages.overview = await page.evaluate(() => ({
  internalArtifactTab: [...document.querySelectorAll(".site-header nav a")].some((link) => link.textContent.trim() === "Artifact"),
  sections: document.querySelectorAll("main > section").length,
  citation: document.querySelector(".hero-citation code")?.textContent,
}));
await page.screenshot({ path: "/tmp/cleopatra-home.png", fullPage: true });
console.log(JSON.stringify({ desktop, mobile, pages, errors }, null, 2));
await browser.close();
