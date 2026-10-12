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
  const html = read('public/index.html');
  assert.ok(!/<script(?![^>]*\ssrc="(?:vendor\/|builder\.js|app\.js))/.test(html), 'every script is a local file');
  assert.ok(!/\son[a-z]+="/.test(html), 'no inline event handlers');
});
