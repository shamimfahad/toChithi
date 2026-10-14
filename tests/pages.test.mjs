// What search engines, link previews and AI tools read: both pages must be up to date with
// scripts/pages.mjs, describe themselves fully in plain HTML, and point at each other.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGES, SITE, buildPage, sitemap, robots, llms } from '../scripts/pages.mjs';

const read = (name) => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
const source = read('index.html');
const langs = Object.keys(PAGES);
const attr = (html, re) => (html.match(re) || [])[1];

test('every generated file matches scripts/pages.mjs (run npm run pages)', () => {
  for (const lang of langs) assert.equal(read(PAGES[lang].file), buildPage(lang, source), PAGES[lang].file);
  assert.equal(read('sitemap.xml'), sitemap());
  assert.equal(read('robots.txt'), robots());
  assert.equal(read('llms.txt'), llms());
});

test('the app markup is the same on both pages', () => {
  const app = (html) => html.slice(html.indexOf('<!-- app:start -->'), html.indexOf('<!-- app:end -->'))
    .replace(/<p class="tagline"[^]*?<\/p>/, '').replace(/<span class="mark-latin"[^]*?<\/span>/, '');
  assert.equal(app(read('bn/index.html')), app(source));
});

for (const lang of langs) {
  const p = PAGES[lang];
  test(`${p.path}: title, description, language and canonical`, () => {
    const html = read(p.file);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    const title = attr(html, /<title>([^<]+)<\/title>/);
    assert.ok(title && title.length <= 65, `title is ${title?.length} characters`);
    const desc = attr(html, /<meta name="description" content="([^"]+)"/);
    assert.ok(desc && desc.length >= 70 && desc.length <= 170, `description is ${desc?.length} characters`);
    assert.equal(attr(html, /<link rel="canonical" href="([^"]+)"/), SITE + p.path);
    assert.equal(html.match(/<link rel="canonical"/g).length, 1);
  });

  test(`${p.path}: language links point both ways`, () => {
    const html = read(p.file);
    for (const other of langs) assert.ok(html.includes(`<link rel="alternate" hreflang="${other}" href="${SITE}${PAGES[other].path}">`), other);
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${SITE}/">`));
  });

  test(`${p.path}: the share image exists and is 1200 × 630`, () => {
    const html = read(p.file);
    const img = attr(html, /<meta property="og:image" content="([^"]+)"/);
    assert.ok(img.startsWith(SITE + '/'), 'og:image is an absolute address');
    const png = readFileSync(new URL(`../public${img.slice(SITE.length)}`, import.meta.url));
    assert.equal(png.toString('latin1', 1, 4), 'PNG');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
    assert.equal(attr(html, /<meta name="twitter:image" content="([^"]+)"/), img);
  });

  test(`${p.path}: structured data is valid JSON and describes a free web app`, () => {
    const html = read(p.file);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)];
    assert.equal(blocks.length, 1);
    const data = JSON.parse(blocks[0][1]);
    const app = data['@graph'].find((n) => n['@type'] === 'WebApplication');
    const site = data['@graph'].find((n) => n['@type'] === 'WebSite');
    assert.equal(app.url, SITE + p.path);
    assert.equal(app.offers.price, '0');
    assert.equal(site.url, `${SITE}/`);
    // No ratings or reviews: there are none yet, and made-up ones break Google's rules.
    assert.ok(!('aggregateRating' in app) && !('review' in app));
  });

  test(`${p.path}: the brand line and the about section are in the HTML before any script runs`, () => {
    const html = read(p.file);
    const tagline = attr(html, /<p class="tagline" data-t="tagline">([^<]+)<\/p>/);
    assert.equal(tagline, p.tagline);
    // The words must be the app's own, or the page would change as soon as the script starts.
    const app = read('app.js');
    const at = app.indexOf(`\n    ${lang}: {\n`);
    const table = app.slice(at, app.indexOf("\n    }", at + 1));
    assert.ok(table.includes(`tagline: '${p.tagline}'`), 'tagline matches I18N in app.js');
    assert.ok(table.includes(`markLatin: '${p.markLatin}'`), 'markLatin matches I18N in app.js');
    assert.match(html, new RegExp(`<section class="about" lang="${lang}"[^>]*>\\s*<div class="about-lead">\\s*<h2`));
  });
}

test('the sitemap lists both pages with their language links, and robots.txt points to it', () => {
  const xml = read('sitemap.xml');
  for (const lang of langs) assert.ok(xml.includes(`<loc>${SITE}${PAGES[lang].path}</loc>`));
  assert.equal(xml.match(/hreflang="x-default"/g).length, langs.length);
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${SITE}/sitemap.xml`));
  assert.doesNotMatch(read('robots.txt'), /Disallow: \//);
});

test('every font the pages name is on the site, and nothing loads from another site', () => {
  const css = read('fonts.css');
  const files = [...css.matchAll(/url\(fonts\/([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(files.length > 10);
  for (const lang of langs) {
    const html = read(PAGES[lang].file);
    for (const m of html.matchAll(/<link rel="preload" href="\/fonts\/([^"]+)"/g)) assert.ok(files.includes(m[1]), `${m[1]} is preloaded but not in fonts.css`);
    // Only links (canonical, language, social) may name another site: no script, style or font.
    assert.doesNotMatch(html, /<(?:script|link rel="(?:stylesheet|preload|preconnect)")[^>]+https?:\/\//, PAGES[lang].file);
  }
  for (const f of files) assert.ok(readFileSync(new URL(`../public/fonts/${f}`, import.meta.url)).length > 1000, f);
});
