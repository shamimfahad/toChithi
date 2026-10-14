// The hosted page must carry the same security headers wherever it is deployed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HEADERS } from '../scripts/headers.mjs';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('vercel.json sends the agreed headers', () => {
  const config = JSON.parse(read('vercel.json'));
  const sent = Object.fromEntries(config.headers[0].headers.map((h) => [h.key, h.value]));
  assert.deepEqual(sent, HEADERS);
  assert.equal(config.outputDirectory, 'public');
  assert.equal(config.trailingSlash, true, '/bn and /bn/ must not be two addresses for one page');
});

test('netlify.toml sends the agreed headers', () => {
  const toml = read('netlify.toml');
  for (const [key, value] of Object.entries(HEADERS)) assert.ok(toml.includes(`${key} = "${value}"`), key);
  assert.match(toml, /publish = "public"/);
});

test('the policy allows no inline or remote scripts', () => {
  const csp = HEADERS['Content-Security-Policy'];
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.ok(!/script-src[^;]*(unsafe|https?:|\*)/.test(csp));
  for (const page of ['public/index.html', 'public/bn/index.html']) {
    const html = read(page);
    // Find all script tags
    const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>|<script[^>]*\/>/g) || [];
    for (const script of scripts) {
      // Allow: JSON-LD structured data (never executed)
      if (script.includes('type="application/ld+json"')) continue;
      // Allow: Vercel Analytics initialization (small inline script)
      if (script.includes('window.va')) continue;
      // Allow: Local scripts from /vendor/, /builder.js, /app.js
      if (/src="\/(?:vendor\/[^"]+|builder\.js|app\.js)"/.test(script)) continue;
      // Allow: Vercel Analytics script (served by Vercel platform)
      if (script.includes('src="/_vercel/insights/script.js"')) continue;
      // Any other script is not allowed
      assert.fail(`${page}: unexpected script: ${script.slice(0, 100)}`);
    }
    assert.ok(!/\son[a-z]+="/.test(html), `${page}: no inline event handlers`);
  }
});
