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
    // The one inline <script> allowed is structured data, which browsers never run.
    assert.ok(!/<script(?![^>]*\ssrc="\/(?:vendor\/|builder\.js|app\.js))(?! type="application\/ld\+json")/.test(html), `${page}: every script is a local file`);
    assert.ok(!/\son[a-z]+="/.test(html), `${page}: no inline event handlers`);
  }
});
