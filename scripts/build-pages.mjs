// Writes the two public pages and the files crawlers read: robots.txt, sitemap.xml and llms.txt.
// Run after changing the app markup in public/index.html or anything in scripts/pages.mjs.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { PAGES, buildPage, sitemap, robots, llms } from './pages.mjs';

const at = (name) => new URL(`../public/${name}`, import.meta.url);
const source = await readFile(at('index.html'), 'utf8');

const files = { 'sitemap.xml': sitemap(), 'robots.txt': robots(), 'llms.txt': llms() };
for (const lang of Object.keys(PAGES)) files[PAGES[lang].file] = buildPage(lang, source);

await mkdir(at('bn/'), { recursive: true });
for (const [name, body] of Object.entries(files)) {
  await writeFile(at(name), body);
  console.log(`public/${name}`);
}
