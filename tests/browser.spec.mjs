// The whole page in a real browser, served with the production security headers.
import { test, expect } from '@playwright/test';

const PASTE_BOX = '<!doctype html><meta charset="utf-8"><body><div id="box" contenteditable style="min-height:300px"></div>';

async function open(page) {
  const problems = [];
  page.on('pageerror', (e) => problems.push(`error: ${e.message}`));
  page.on('console', (m) => {
    // Web fonts are optional: a blocked or offline font request is not a fault of the page.
    if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com|net::ERR_/.test(m.text() + m.location().url)) problems.push(`console: ${m.text()}`);
  });
  await page.goto('/');
  await expect(page.locator('#letter table').first()).toBeAttached();
  return problems;
}
const design = (page, key, val) => page.click(`#design [data-key="${key}"][data-val="${val}"]`);
const saved = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('chithi-converter-v1')));

test('loads cleanly under the content security policy', async ({ page }) => {
  const problems = await open(page);
  const response = await page.request.get('/');
  expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
  await expect(page.locator('#letter')).toContainText('প্রিয় মা,');
  expect(await page.locator('#letter img').count()).toBe(1);
  expect(problems).toEqual([]);
});

test('typing appears in the letter as text, with formats applied', async ({ page }) => {
  const problems = await open(page);
  await page.click('#fresh-ask');
  await page.click('#fresh-yes');
  await page.locator('.ql-editor').click();
  await page.keyboard.type('<img src=x onerror=alert(1)> ');
  await page.click('[data-inline="bold"]');
  await page.keyboard.type('মোটা');
  await page.click('[data-inline="bold"]');
  await page.keyboard.press('Enter');
  await page.click('[data-block="list"][data-value="ordered"]');
  await page.keyboard.type('এক');
  await expect(page.locator('#letter')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#letter b')).toHaveText('মোটা');
  await expect(page.locator('#letter')).toContainText('১.');
  expect(await page.locator('#letter img').count()).toBe(0);
  expect(problems).toEqual([]);
});

test('an almost empty letter is still a full sheet', async ({ page }) => {
  await open(page);
  await page.click('#fresh-ask');
  await page.click('#fresh-yes');
  await expect.poll(async () => (await page.locator('#letter').boundingBox()).height).toBeGreaterThan(24 * 32);
});

test('stationery: papers, colours, margin, width and pages', async ({ page }) => {
  const problems = await open(page);
  await page.click('#customize');
  await page.click('#design [data-preset="graph"]');
  expect((await saved(page)).design).toMatchObject({ pattern: 'grid', margin: 'none', paper: '#FFFFFF' });
  await design(page, 'margin', 'double');
  await design(page, 'ink', '#7A1F2B');
  await expect(page.locator('#letter')).toContainText('প্রিয় মা,');
  expect(await page.locator('#letter').innerHTML()).toContain('4px double');

  await page.locator('#own-paper').evaluate((input) => { input.value = '#d8f0e0'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  expect((await saved(page)).design.paper).toBe('#D8F0E0');

  const width = () => page.locator('#letter > table').evaluate((t) => Math.round(t.getBoundingClientRect().width));
  await design(page, 'width', 'letter');
  expect(await width()).toBe(600);
  await design(page, 'width', 'full');
  expect(await width()).toBeGreaterThan(600);

  await design(page, 'pages', 'auto');
  await design(page, 'pageSize', 'short');
  await expect(page.locator('#word-count')).toContainText(/[২-৯]টি পাতা/);
  await expect(page.locator('#letter')).toContainText('— ২ —');

  await page.reload();
  expect((await saved(page)).design).toMatchObject({ pages: 'auto', margin: 'double', paper: '#D8F0E0' });
  expect(problems).toEqual([]);
});

test('a page break typed in the editor starts a new sheet', async ({ page }) => {
  await open(page);
  await page.locator('.ql-editor').click();
  await page.keyboard.press('Control+Home');
  await page.click('#tool-page');
  await expect(page.locator('.ql-editor .page-break')).toHaveCount(1);
  await expect(page.locator('#word-count')).toContainText('২টি পাতা');
});

test('copy puts the letter on the clipboard, and it survives a paste', async ({ page, context }) => {
  await open(page);
  await page.click('#copy');
  await expect(page.locator('#copy-label')).toHaveText('কপি হয়েছে');
  const other = await context.newPage();
  await other.route('**/paste-box', (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: PASTE_BOX }));
  await other.goto('/paste-box');
  await other.click('#box');
  await other.keyboard.press('ControlOrMeta+V');
  await expect(other.locator('#box table').first()).toBeVisible();
  const pasted = await other.locator('#box').evaluate((box) => ({
    images: box.querySelectorAll('img').length,
    ruled: [...box.querySelectorAll('td')].some((td) => /gradient/.test(td.getAttribute('style') || '')),
    scripts: box.querySelectorAll('script').length,
    text: box.innerText,
  }));
  expect(pasted).toMatchObject({ images: 1, ruled: true, scripts: 0 });
  expect(pasted.text).toContain('প্রিয় মা,');
});

test('the letter can be made into an image', async ({ page }) => {
  const problems = await open(page);
  await page.click('#as-image');
  await expect(page.locator('#image-veil')).toBeVisible({ timeout: 15_000 });
  const size = await page.locator('#shot').evaluate((img) => img.decode().then(() => [img.naturalWidth, img.naturalHeight]));
  expect(size[0]).toBeGreaterThan(1000);
  expect(size[1]).toBeGreaterThan(1000);
  expect(problems).toEqual([]);
});

test('on a phone there are three tabs and nothing scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await open(page);
  for (const tab of ['write', 'design', 'letter']) {
    await page.click(`#tab-${tab}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  }
  await expect(page.locator('#copy')).toBeVisible();
});

test('save a draft, start over, open it: the letter comes back with photo, paper and language', async ({ page }) => {
  const problems = await open(page);
  await page.click('[data-lang="en"]');
  await page.click('#fresh-ask');
  await page.click('#fresh-yes');
  await page.locator('.ql-editor').click();
  await page.keyboard.type('Dear Rafi, half written.');
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 8;
    const editor = document.querySelector('#editor').__quill || window.Quill.find(document.querySelector('#editor'));
    editor.insertEmbed(editor.getLength(), 'image', c.toDataURL('image/png'), 'user');
  });
  await page.click('#customize');
  await page.click('#design [data-preset="graph"]');
  await page.click('[data-mode="write"]');

  await page.click('#save-ask');
  await expect(page.locator('#save-veil')).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#save-draft')]);
  expect(download.suggestedFilename()).toMatch(/^chithi-\d{4}-\d{2}-\d{2}\.chithi\.json$/);
  const file = await download.path();
  const [letter] = await Promise.all([page.waitForEvent('download'), page.click('#save-letter')]);
  expect(letter.suggestedFilename()).toMatch(/\.html$/);
  await page.click('#save-close');

  await page.click('[data-lang="bn"]');
  await page.click('[data-mode="design"]');
  await page.click('#design [data-preset="airmail"]');
  await page.click('[data-mode="write"]');
  await page.locator('.ql-editor').click();
  await page.keyboard.type(' more');
  await page.setInputFiles('#draft-input', file);
  await expect(page.locator('#open-strip')).toBeVisible();
  await page.click('#open-yes');
  await expect(page.locator('#open-said')).toBeVisible();

  // Opening is a fresh start: undo does not bring back the letter it replaced.
  await page.locator('.ql-editor').click();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(page.locator('#letter')).toContainText('Dear Rafi, half written.');
  await expect(page.locator('#letter')).not.toContainText('more');
  expect(await page.locator('#letter img').count()).toBe(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect((await saved(page)).design).toMatchObject({ pattern: 'grid', margin: 'none', paper: '#FFFFFF' });
  expect(problems).toEqual([]);
});

test('a file that is not a draft changes nothing, and says so in the writing pane on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.setInputFiles('#draft-input', { name: 'x.chithi.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"nope"}') });
  await expect(page.locator('#open-said')).toBeVisible();
  await expect(page.locator('#open-said')).toContainText(/খসড়া ফাইল নয়|not a toChithi draft/);
  await expect(page.locator('#letter')).toContainText('প্রিয় মা,');
});
