# toChithi

Write an email as a চিঠি: a page from a ruled letter notebook. You write in a rich text editor,
choose the stationery, and copy the finished letter into Gmail, Outlook or any other email.

Everything runs in the browser. There is no server and nothing you write is uploaded.

## Run it

Needs Node.js 20 or newer (only for the local server and the tests; the site itself is static files).

```bash
npm start            # http://localhost:4173
npm test             # letter builder and config tests
npm run test:browser # the whole page in a real browser
```

The browser tests need Playwright once: `npm install`, then `npx playwright install chromium`.

## Deploy

The site is the `public/` folder exactly as it is. There is no build step.

| Host | What to do |
| --- | --- |
| Netlify | "Add new site" → "Import an existing project" → pick this repository. `netlify.toml` sets the folder and the security headers. |
| Vercel | "Add New" → "Project" → import this repository. `vercel.json` sets the folder and the security headers. |
| No git | Drag the `public/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop). This skips the security headers, so use it for a quick look only. |

After the first import, every push to the main branch redeploys.

## How a letter is built

```
editor content ──► builder.js ──► email HTML ──► clipboard / image / HTML code
(typed pieces)     (escapes, picks from          (inline-styled tables)
                    fixed lists, paginates)
```

`public/builder.js` is the only code that writes email markup. It never touches the page, so it is
tested on its own in Node. `public/app.js` is the editor, the stationery panel and the preview.

### Rules that keep a pasted letter intact

Email editors strip stylesheets, classes and scripts when you paste. The builder works within that:

- **Inline styles on plain tables only.** No classes, no `<style>`, no media queries. The layout is fluid by construction.
- **Every block repeats its own font, size, colour and line height**, so the text survives if an editor rewraps or drops a parent element.
- **Ruled lines and grids are CSS gradients, written as self-contained stripes.** If an editor drops `background-size`, the worst case is one faint line, never a filled block. If it drops gradients entirely, the paper colour, margin line and layout remain.
- **Each run of text is its own table row**, so the ruling restarts cleanly after a photo of any height.
- **Airmail and plain papers use only colours and borders**, which every editor keeps.
- **A sheet is never shorter than one page**: short letters are filled out with blank ruled lines.

### Pages

"New page" in the editor starts a sheet wherever the writer wants. "Split into pages" does it
automatically: paragraphs are measured off-screen at the width of the writing column and a
paragraph is never cut in two. Email has no real pages, so sheets are stacked with a gap between them.

## Security

The rule: **nothing a writer types or pastes may become markup, script or style.**

| Risk | What stops it |
| --- | --- |
| HTML or script typed or pasted into a letter | The builder ignores the editor's HTML. It reads the content as typed pieces, escapes every character, and writes its own tags. |
| Dangerous links | Only `http`, `https`, `mailto` and `tel` addresses become links. |
| Dangerous pictures | Only `https` addresses and embedded PNG, JPEG, GIF or WebP. Uploaded photos are redrawn in the browser first, which also drops location data. |
| Colours and sizes used to smuggle CSS | A design is reduced by `normDesign()` to known choices; a colour must be a plain `#RRGGBB` value. |
| Script injection on the hosted page | Content-Security-Policy with `script-src 'self'`: no inline or third-party scripts. Both libraries are vendored in `public/vendor/`. |

`tests/builder.test.mjs` exercises each row with hostile input, and `tests/config.test.mjs` fails if the
headers in `netlify.toml`, `vercel.json` and the local server drift apart.

## Publishing the Claude artifact

`npm run artifact` packs the site into one file, `dist/chithi-artifact.html`, with styles and scripts
inlined and the libraries loaded from a CDN. That file is what is published as the চিঠি artifact.

## Files

```
public/index.html     the page
public/styles.css     all styles, light and dark
public/builder.js     editor content + stationery -> email HTML
public/app.js         editor, stationery panel, preview, copy and export
public/vendor/        Quill 2.0.2 and html2canvas 1.4.1, with their licences
scripts/serve.mjs     local static server with the production headers
scripts/headers.mjs   the security headers, in one place
scripts/build-artifact.mjs
tests/                builder, config and browser tests
netlify.toml, vercel.json
```

## Adding things

- **A language:** add an entry to `LANGS`, a table to `I18N` and a set of letters to `LETTERS` in `app.js`.
- **A ready-made paper:** add an entry to `PRESETS` in `builder.js`, its name to `I18N`, and its id to `PRESET_ORDER` in `app.js`.
- **A colour:** add it to the matching list in `builder.js`.
