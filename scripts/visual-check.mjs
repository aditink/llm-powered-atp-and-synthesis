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
for (const route of ["cases", "results", "artifact"]) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:5173/cleopatra-paper/#${route}`, { waitUntil: "networkidle" });
  pages[route] = await page.evaluate((currentRoute) => ({
    heading: document.querySelector("h1")?.textContent,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: innerWidth,
    codeColors: currentRoute === "artifact" ? {
      foreground: getComputedStyle(document.querySelector("pre code")).color,
      background: getComputedStyle(document.querySelector("pre code")).backgroundColor,
      container: getComputedStyle(document.querySelector("pre")).backgroundColor,
    } : undefined,
  }), route);
  if (route === "artifact") {
    await page.screenshot({ path: "/tmp/cleopatra-artifact-page.png", fullPage: true });
  }
}
console.log(JSON.stringify({ desktop, mobile, pages, errors }, null, 2));
await browser.close();
