const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const input = page.locator('.rs-hero-search input');
  await input.click();
  await page.waitForTimeout(400);

  const header = page.locator('p', { hasText: 'Popular searches' });
  await header.waitFor({ state: 'visible', timeout: 5000 });

  const dropParent = header.locator('xpath=..');
  const d = await dropParent.boundingBox();
  const more = page.locator('button', { hasText: /^More$/ }).first();
  const moreBox = await more.boundingBox();

  await page.screenshot({
    path: 'C:/Users/kingo/.cursor/projects/f-Other-Projects-Favour-buyer-web/assets/dropdown-verify.png',
    clip: { x: 0, y: 80, width: 820, height: 640 },
  });

  const zSearch = await page.locator('.hero-text-4').first().evaluate((el) => getComputedStyle(el).zIndex);

  const elementAtHeader = d
    ? await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el
          ? {
              tag: el.tagName,
              text: (el.innerText || '').slice(0, 80),
              bg: getComputedStyle(el).backgroundColor,
            }
          : null;
      }, { x: d.x + 40, y: d.y + 22 })
    : null;

  const elementAtMoreOverlap = d && moreBox
    ? await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el
          ? {
              tag: el.tagName,
              text: (el.innerText || '').slice(0, 80),
              bg: getComputedStyle(el).backgroundColor,
            }
          : null;
      }, { x: moreBox.x + moreBox.width / 2, y: moreBox.y + moreBox.height / 2 })
    : null;

  console.log(JSON.stringify({
    zSearch,
    dropdown: d,
    moreBox,
    elementAtHeader,
    elementAtMoreOverlap,
  }, null, 2));

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
