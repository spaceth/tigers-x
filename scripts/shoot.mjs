// Development-only visual check: drives a local Chrome through the story and saves
// screenshots plus a console report.
//
//   node scripts/shoot.mjs [baseUrl] [preset] [outDir]
//   presets: desktop | mobile | reduced | nowebgl | story (every beat, desktop) | storymobile
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] ?? 'http://localhost:5180/';
const preset = process.argv[3] ?? 'desktop';
const outDir = process.argv[4] ?? '/tmp/tigers-shots';
fs.mkdirSync(outDir, { recursive: true });

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
const log = [];
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && log.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => log.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => log.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));

const mobile = preset === 'mobile' || preset === 'storymobile';
await page.setViewport(mobile ? viewports.mobile : viewports.desktop);
if (preset === 'reduced') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const url = preset === 'nowebgl' ? `${base}?nowebgl` : base;
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(name) {
  await wait(700);
  await page.screenshot({ path: path.join(outDir, `${preset}-${name}.jpg`), type: 'jpeg', quality: 72 });
}
async function scrollToY(y) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await wait(250);
}
async function scrollToId(id) {
  await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: 'instant' }), id);
  await wait(250);
}

// Wait for the model (or a fallback) before capturing story states.
await page.waitForFunction(
  () =>
    document.querySelector('.stage-fallback') ||
    [...document.querySelectorAll('button')].some((b) => b.textContent?.trim() === 'Explore the hardware'),
  { timeout: 60000 },
).catch(() => log.push('[shoot] stage never became ready'));

if (preset === 'interact') {
  // Deep link: load straight into the chip chapter.
  await page.goto(`${base}#chip`, { waitUntil: 'networkidle0' });
  await wait(1500);
  await shot('deeplink-chip');
  log.push(`[check] deep link active nav: ${await page.$eval('.chapter-list a[aria-current]', (e) => e.textContent).catch(() => 'none')}`);

  const button = await page.waitForSelector('button::-p-text(Explore the hardware)', { timeout: 30000 });
  await button.evaluate((b) => b.scrollIntoView({ block: 'center' }));
  await wait(800);
  await button.click();
  await wait(1200);
  await shot('explore-open');
  log.push(`[check] dialog open: ${await page.$eval('[role="dialog"]', (d) => d.getAttribute('aria-modal')).catch(() => 'missing')}`);
  log.push(`[check] focus inside dialog: ${await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))}`);
  const pick = await page.$('[role="dialog"] button[aria-pressed]');
  if (pick) {
    await pick.click();
    await wait(1200);
    await shot('explore-selected');
  }
  await page.keyboard.press('Escape');
  await wait(1200);
  log.push(`[check] dialog closed: ${await page.evaluate(() => !document.querySelector('[role="dialog"]') && !document.documentElement.classList.contains('is-exploring'))}`);
  log.push(`[check] focus returned to: ${await page.evaluate(() => `${document.activeElement?.tagName} "${document.activeElement?.textContent?.trim().slice(0, 40)}"`)}`);
  await shot('explore-closed');
} else if (preset === 'story' || preset === 'storymobile') {
  // Settle on each beat at the point where its copy is centred on the reading line.
  const count = await page.evaluate(() => document.querySelectorAll('.beat').length);
  for (let i = 0; i < count; i++) {
    const y = await page.evaluate((k) => {
      const el = document.querySelectorAll('.beat')[k];
      const r = el.getBoundingClientRect();
      const copy = el.querySelector('.beat-copy').getBoundingClientRect();
      const narrow = innerWidth <= 860;
      const line = narrow ? innerHeight * 0.72 : innerHeight * 0.5;
      return scrollY + copy.top + Math.min(copy.height, 200) / 2 - line + (narrow ? 0 : 0) + 0 * r.top;
    }, i);
    await scrollToY(y);
    await shot(`beat-${String(i).padStart(2, '0')}`);
  }
  // Reverse pass to a few beats to confirm states restore cleanly.
  for (const i of [6, 2, 0]) {
    const y = await page.evaluate((k) => {
      const el = document.querySelectorAll('.beat')[k].querySelector('.beat-copy');
      return scrollY + el.getBoundingClientRect().top - innerHeight * 0.4;
    }, i);
    await scrollToY(y);
    await shot(`reverse-${String(i).padStart(2, '0')}`);
  }
} else {
  await scrollToY(0);
  await shot('00-top');
  for (const id of ['payload', 'subsystems', 'chip', 'mission', 'station', 'record', 'documentation']) {
    await scrollToId(id);
    await shot(id);
  }
}

const state = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  overflowX: document.documentElement.scrollWidth > innerWidth,
}));
fs.writeFileSync(path.join(outDir, `${preset}-report.txt`), [JSON.stringify(state), ...log].join('\n'));
console.log(JSON.stringify(state));
console.log(log.length ? log.join('\n') : 'no console errors or warnings');
await Promise.race([browser.close(), wait(5000)]);
process.exit(0);
