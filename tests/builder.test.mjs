// The letter builder on its own: what it lets through, and what it never does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Chithi from '../public/builder.js';

const { buildLetter, normDesign, safeLink, safeImage, DESIGN0, PRESETS, PRESET_KEYS, PAGE_LINES } = Chithi;
const tags = (html) => [...new Set([...html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1].toLowerCase()))].sort();
const count = (html, piece) => html.split(piece).length - 1;
const para = (text, attributes) => [{ insert: text }, attributes ? { insert: '\n', attributes } : { insert: '\n' }];

const HOSTILE = [
  '<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '"><svg/onload=alert(1)>', "'><iframe srcdoc='<script>1</script>'>",
  '</td></tr></table><style>*{display:none}</style>', '<a href="javascript:alert(1)">x</a>', '<!--[if mso]><v:rect href="https://evil.example"/><![endif]-->',
  '` onmouseover=alert(1) `', '&lt;script&gt;', '<base href="//evil.example/">',
];

test('typed markup is shown as text, never as markup', () => {
  for (const payload of HOSTILE) {
    for (const attributes of [undefined, { header: 1 }, { blockquote: true }, { list: 'ordered' }, { list: 'bullet' }, { align: 'right' }]) {
      const { html, text } = buildLetter(para(payload, attributes), {});
      assert.deepEqual(tags(html), ['div', 'table', 'td', 'tr'], payload);
      assert.ok(!/<!--/.test(html) && !/<[^>]*\son[a-z]+\s*=/i.test(html), payload);
      assert.ok(text.includes(payload), 'the plain-text copy keeps the words');
    }
  }
});

test('formats, links and photos come only from known values', () => {
  const ops = [
    { insert: 'word', attributes: { bold: 'x', italic: 1, underline: {}, strike: [], color: 'red;background:url(https://evil.example/x)', background: '"><img src=x onerror=1>', link: 'javascript:alert(1)' } },
    { insert: '\n', attributes: { align: '"><script>x</script>', header: '9" onload="x', list: '<b>', blockquote: '<i>' } },
    { insert: { image: 'javascript:alert(1)' } }, { insert: { image: 'data:text/html;base64,PHNjcmlwdD4=' } }, { insert: { image: 'http://insecure.example/a.png' } },
    { insert: { image: 'data:image/png;base64,AAAA" onerror="alert(1)' } },
    { insert: { image: 'https://ok.example/a.png?x="><script>1</script>' }, attributes: { width: '100%" onload="alert(1)' } },
    { insert: 'link', attributes: { link: 'https://ok.example/?q="><b>' } }, { insert: '\n' },
    { insert: { video: 'https://evil.example' } }, { insert: { pagebreak: '"><script>' } }, { insert: 42 }, null, { insert: 'ok\n', attributes: 'str' },
  ];
  const { html } = buildLetter(ops, {});
  assert.deepEqual(tags(html), ['a', 'b', 'div', 'i', 'img', 's', 'span', 'table', 'td', 'tr', 'u']);
  assert.ok(!/<script|javascript:|evil\.example|insecure\.example|onerror=|onload=/i.test(html.replace(/&[a-z#0-9]+;/g, '')));
  assert.equal(count(html, '<img '), 1, 'only the https photo survives');
  assert.equal(count(html, '<a '), 1, 'only the https link survives');
  assert.match(html, /href="https:\/\/ok\.example\/\?q=%22%3E%3Cb%3E"/);
});

test('addresses: only web, mail and phone links; only https or embedded pictures', () => {
  for (const good of ['https://example.com/a?b=c', 'http://example.com', 'mailto:ma@example.com', 'tel:+8801700000000']) assert.ok(safeLink(good), good);
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'vbscript:x', 'file:///etc/passwd', 'example.com', '', null, 42, 'x'.repeat(3000)]) assert.equal(safeLink(bad), null, String(bad).slice(0, 30));
  assert.ok(safeImage('data:image/jpeg;base64,AAAA'));
  assert.ok(safeImage('https://example.com/p.png'));
  for (const bad of ['data:image/svg+xml;base64,AAAA', 'data:image/png;base64,AA"A', 'http://example.com/p.png', 'blob:https://x/y', 'javascript:1', null]) assert.equal(safeImage(bad), null, String(bad));
});

test('a design is reduced to known choices and plain colours', () => {
  const bad = { paper: 'red;background:url(https://evil.example/x)', line: '#12345g', marginColor: '"><script>alert(1)</script>', ink: 'javascript:alert(1)', edge: '<b>', pattern: '__proto__', margin: 'constructor', width: 'toString', spacing: '1e9', lettering: 'hasOwnProperty', textSize: '__proto__', pages: '<i>', pageSize: 'valueOf', lineAuto: 'yes' };
  assert.deepEqual(normDesign(bad), DESIGN0);
  for (const junk of [null, undefined, 'x', 42, [], () => {}]) assert.deepEqual(normDesign(junk), DESIGN0);
  const { html } = buildLetter(para('hello'), bad);
  assert.ok(!/evil|javascript|url\(|<script|expression/i.test(html));
  const own = buildLetter(para('hello'), { paper: '#abcdef', ink: '#123456', line: '#aabbcc', marginColor: '#0a0b0c' }).html;
  for (const colour of ['#ABCDEF', '#123456', '#AABBCC', '#0A0B0C']) assert.ok(own.includes(colour), colour);
});

test('every ready-made paper builds, and every colour in the markup is a plain hex value', () => {
  for (const [name, preset] of Object.entries(PRESETS)) {
    const design = { ...DESIGN0 };
    for (const key of PRESET_KEYS) design[key] = preset[key];
    if (preset.ink) design.ink = preset.ink;
    assert.deepEqual(normDesign(design), design, `${name} is made of valid choices`);
    const { html } = buildLetter([...para('প্রিয় মা,'), ...para('কেমন আছ?', { blockquote: true }), { insert: 'x', attributes: { background: true, color: true } }, { insert: '\n' }], design);
    const colours = [...html.matchAll(/(?:color|background-color|bgcolor)[:=]"?\s*([^;" ]+)/g)].map((m) => m[1]);
    assert.ok(colours.length > 10 && colours.every((c) => /^#[0-9A-F]{6}$/.test(c)), `${name}: ${colours.filter((c) => !/^#[0-9A-F]{6}$/.test(c))}`);
  }
});

test('ruling, margin and edge choices show up in the markup', () => {
  const build = (design) => buildLetter(para('hello'), design).html;
  assert.ok(!build({ pattern: 'none' }).includes('gradient'));
  assert.ok(build({ pattern: 'lines' }).includes('linear-gradient(to bottom'));
  assert.ok(build({ pattern: 'grid' }).includes('to right'), 'a grid has upright lines too');
  assert.ok(!build({ margin: 'none' }).includes('border-right:2px solid'));
  assert.ok(build({ margin: 'single' }).includes('border-right:2px solid #E4808B'));
  assert.ok(build({ margin: 'double' }).includes('border-right:4px double'));
  assert.ok(build({ margin: 'both' }).includes('border-left:2px solid'));
  assert.ok(build({ edge: 'pad' }).includes('2px dashed'));
  assert.ok(build({ edge: 'airmail' }).includes('7px dashed #25408F'));
  assert.ok(!/border:1px solid/.test(build({ edge: 'none' })));
  // If an email editor drops background-size, each rule must still be a thin stripe, not a filled block.
  assert.match(build({ pattern: 'lines' }), /transparent 31px, #BCD0E8 31px, #BCD0E8 32px, transparent 32px/);
});

test('width: full by default, or capped', () => {
  const open = (design) => buildLetter(para('hello'), design).html.match(/^<table[^>]*>/)[0];
  assert.ok(open({}).includes('width="100%"') && !open({}).includes('max-width'));
  assert.ok(open({ width: 'letter' }).includes('width="600"') && open({ width: 'letter' }).includes('max-width:600px'));
  assert.ok(open({ width: 'wide' }).includes('max-width:780px'));
});

test('a sheet is never shorter than one page', () => {
  const lines = (html) => count(html, 'text-align:');
  for (const size of ['short', 'medium', 'long']) {
    assert.ok(lines(buildLetter([{ insert: '\n' }], { pageSize: size }).html) >= PAGE_LINES[size], `empty letter, ${size}`);
    assert.ok(lines(buildLetter(para('প্রিয় মা,'), { pageSize: size }).html) >= PAGE_LINES[size], `one line, ${size}`);
  }
  const long = Array.from({ length: 60 }, (_, i) => para(`line ${i}`)).flat();
  assert.equal(buildLetter(long, { pages: 'off' }).pages, 1, 'without page splitting a long letter stays one sheet');
  assert.ok(lines(buildLetter(long, { pages: 'off' }).html) >= 60);
});

test('pages: the writer’s own breaks, and automatic splitting', () => {
  const br = { insert: { pagebreak: true } };
  const manual = buildLetter([...para('one'), br, ...para('two'), br, br, ...para('three')], {});
  assert.equal(manual.pages, 3, 'empty pages are dropped');
  assert.equal(count(manual.html, 'height:22px'), 2, 'pages are separated by a gap');
  assert.ok(manual.html.includes('— 2 —') && manual.html.includes('— 3 —'));
  assert.ok(!buildLetter([...para('one'), br, ...para('two')], { pageNumbers: false }).html.includes('— 2 —'));
  assert.ok(!buildLetter(para('one'), {}).html.includes('— 1 —'), 'a single page is not numbered');

  const long = Array.from({ length: 50 }, (_, i) => para(`line ${i}`)).flat();
  assert.equal(buildLetter(long, { pages: 'auto', pageSize: 'short' }).pages, Math.ceil(50 / PAGE_LINES.short));
  assert.equal(buildLetter(long, { pages: 'auto', pageSize: 'long' }).pages, Math.ceil(50 / PAGE_LINES.long));
  const measured = buildLetter(long, { pages: 'auto', pageSize: 'short' }, { measure: (list) => list.map(() => 64) });
  assert.equal(measured.pages, Math.ceil(100 / PAGE_LINES.short), 'measured heights decide the split');
  assert.ok(buildLetter(para('বাংলা'), { pages: 'auto' }, { measure: 'nope', ratio: 7 }).pages === 1, 'bad options are ignored');
});

test('numbered lists keep counting across a page break and use Bangla digits in a Bangla letter', () => {
  const item = (text) => para(text, { list: 'ordered' });
  const { html, text } = buildLetter([...item('এক'), ...item('দুই'), { insert: { pagebreak: true } }, ...item('তিন'), ...para('শেষ'), ...item('আবার')], {});
  for (const mark of ['>১.<', '>২.<', '>৩.<']) assert.ok(html.includes(mark), mark);
  assert.equal(count(html, '>১.<'), 2, 'a new list starts again at one');
  assert.match(text, /১\. এক\n২\. দুই\n\n৩\. তিন\nশেষ\n১\. আবার/);
  assert.ok(buildLetter(item('one'), {}).html.includes('>1.<'));
});

test('a saved draft opens back exactly as it was', () => {
  const photo = 'data:image/png;base64,iVBORw0KGgo=';
  const ops = [
    { insert: 'প্রিয় মা,', attributes: { bold: true } }, { insert: '\n', attributes: { align: 'right' } },
    { insert: { image: photo }, attributes: { width: '75%' } }, { insert: '\n' },
    { insert: { pagebreak: true } }, { insert: 'ইতি\n' },
  ];
  const design = { ...DESIGN0, pattern: 'grid', ink: '#1D5B3F' };
  const file = JSON.parse(JSON.stringify(Chithi.makeDraft(ops, design, 'bn', false)));
  assert.equal(file.format, Chithi.DRAFT_FORMAT);
  const back = Chithi.readDraft(file, { langs: ['en', 'bn'], maxPhotos: 12 });
  assert.deepEqual(back, { ops, design: normDesign(design), lang: 'bn', sample: false });
});

test('an opened file lets in only text, carried photos, page breaks and plain values', () => {
  const read = (d, opts) => Chithi.readDraft(d, { langs: ['en', 'bn'], maxPhotos: 2, ...opts });
  const draft = (ops, extra) => ({ format: Chithi.DRAFT_FORMAT, version: 1, ops, ...extra });
  for (const bad of [null, 'x', [], {}, { format: 'other', version: 1, ops: [] }, draft('x'), draft([]), { ...draft([{ insert: 'a\n' }]), version: 2 }, draft([{ insert: { video: 'x' } }, 7, null])]) {
    assert.equal(read(bad), null, JSON.stringify(bad));
  }
  const photo = 'data:image/jpeg;base64,AAAA';
  const got = read(draft([
    { insert: 'hi', attributes: { bold: true, link: { href: 'x' }, color: ['red'], size: 3, bad: NaN } },
    { insert: { image: 'https://evil.example/x.png' } },
    { insert: { image: 'data:image/svg+xml;base64,PHN2Zz4=' } },
    { insert: { image: 'javascript:alert(1)' } },
    { insert: { image: photo } }, { insert: { image: photo } }, { insert: { image: photo } },
    { insert: { pagebreak: 'yes' } },
    { insert: { formula: 'x' } },
  ], { lang: 'fr', sample: 'true', design: { paper: 'red;x', pattern: '<script>' } }));
  assert.deepEqual(got.ops, [
    { insert: 'hi', attributes: { bold: true, size: 3 } },
    { insert: { image: photo } }, { insert: { image: photo } },
    { insert: '\n' },
  ]);
  assert.equal(got.lang, null);
  assert.equal(got.sample, false);
  assert.deepEqual(got.design, normDesign(null));
});
