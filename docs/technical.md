# toChithi — technical guide

How toChithi is built, tested, secured and deployed. For what it does, see the [README](../README.md).

## Contents

- [Getting started](#getting-started)
- [Architecture](#architecture)
- [Security](#security)
- [Deployment](#deployment)
- [Search and sharing](#search-and-sharing)
- [Performance](#performance)
- [Project structure](#project-structure)
- [Extending toChithi](#extending-tochithi)

## Getting started

### Prerequisites

- **Node.js 20 or newer** — required only for the local server and the test suites. The site itself is plain static files.

### Run locally

```bash
npm install
npm start              # serves the site at http://localhost:4173
```

### Test

```bash
npm test               # letter builder, configuration and page tests (Node test runner)
npm run test:browser   # end-to-end tests in a real browser (Playwright)
```

Before the first browser test run, install the Playwright browser once:

```bash
npx playwright install chromium
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Local static server with the production security headers and compression |
| `npm test` | Unit and configuration tests |
| `npm run test:browser` | Playwright end-to-end tests |
| `npm run pages` | Regenerate the English and Bangla pages, sitemap, `robots.txt` and `llms.txt` |

## Architecture

```
editor content ──► builder.js ──► email HTML ──► clipboard / image / HTML code
(typed pieces)     (escapes, picks from          (inline-styled tables)
                    fixed lists, paginates)
```

- **`public/builder.js`** is the only code that produces email markup. It has no DOM dependencies and is tested in isolation under Node.
- **`public/app.js`** owns the editor, the stationery panel, the preview and all export paths.

### Email-client compatibility

Email editors strip stylesheets, classes and scripts on paste. The builder is designed around that constraint:

- **Inline styles on plain tables only.** No classes, no `<style>` blocks, no media queries; the layout is fluid by construction.
- **Every block repeats its own typography** (font, size, colour, line height), so text survives if an editor rewraps or drops a parent element.
- **Ruled lines and grids are self-contained CSS gradient stripes.** If `background-size` is dropped, the worst case is a single faint line; if gradients are dropped entirely, the paper colour, margin line and layout remain.
- **Each run of text is its own table row**, so ruling restarts cleanly after a photo of any height.
- **Airmail and plain papers use only colours and borders**, which every editor preserves.
- **A sheet is never shorter than one page**; short letters are padded with blank ruled lines.

### Pagination

"New page" starts a sheet at the cursor. "Split into pages" paginates automatically: paragraphs are measured
off-screen at the width of the writing column, and a paragraph is never split. Since email has no real pages,
sheets are stacked with a gap between them.

## Security

**Core rule: nothing a writer types or pastes may become markup, script or style.**

| Threat | Mitigation |
| --- | --- |
| HTML or script typed or pasted into a letter | The builder ignores the editor's HTML. It reads content as typed pieces, escapes every character and emits its own tags. |
| Malicious links | Only `http`, `https`, `mailto` and `tel` URLs become links. |
| Malicious images | Only `https` URLs and embedded PNG, JPEG, GIF or WebP. Uploaded photos are re-encoded in the browser, which also strips location metadata. |
| CSS smuggled through colours or sizes | `normDesign()` reduces every design to known values; colours must be plain `#RRGGBB`. |
| Untrusted draft files | `readDraft()` accepts only text, embedded images, page breaks and plain format values, and passes the design through `normDesign()`. |
| Script injection on the hosted page | Content-Security-Policy with `script-src 'self'` — no inline or third-party scripts. Libraries are vendored in `public/vendor/`. |

`tests/builder.test.mjs` exercises each threat with hostile input. `tests/config.test.mjs` fails if the
security headers in `netlify.toml`, `vercel.json` and the local server drift apart.

## Deployment

The deployable site is the `public/` directory as-is — there is no build step.

| Host | Steps |
| --- | --- |
| **Vercel** | *Add New → Project* and import this repository. `vercel.json` configures the output directory and security headers. |
| **Netlify** | *Add new site → Import an existing project* and select this repository. `netlify.toml` configures the publish directory and security headers. |
| **Manual (preview only)** | Drag `public/` onto [app.netlify.com/drop](https://app.netlify.com/drop). Security headers are **not** applied, so use this for previews only. |

Once connected, every push to `main` triggers a redeploy.

### Post-deployment checklist

1. **Google Search Console** — add a *URL prefix* property for `https://tochithi.vercel.app/`. `vercel.app`
   domains cannot be verified by DNS, so choose *HTML tag*, add the tag to the `head()` list in
   `scripts/pages.mjs`, run `npm run pages` and redeploy. Then submit `sitemap.xml` and request indexing for
   `/` and `/bn/` via *URL inspection*.
2. **Bing Webmaster Tools** — use *Import from Google Search Console*. Bing's index also serves Yahoo, much of
   DuckDuckGo and ChatGPT search.
3. **Validate** both URLs with the [Rich Results Test](https://search.google.com/test/rich-results) and a
   social share-preview checker.

## Search and sharing

The site ships two pages: `/` (English) and `/bn/` (Bangla). Both are generated by `npm run pages` from a
single source, so the application markup is never duplicated by hand:

- **Application markup** lives in `public/index.html`, between `<!-- app:start -->` and `<!-- app:end -->`.
- **Everything else** — titles, descriptions, language links, share cards, structured data, the "about" copy,
  `sitemap.xml`, `robots.txt` and `llms.txt` — lives in `scripts/pages.mjs`.

Run `npm run pages` after changing either. `tests/pages.test.mjs` fails if a generated page is out of date.
To change the domain, update `SITE` in `scripts/pages.mjs` and regenerate.

| Element | Rationale |
| --- | --- |
| Static copy in the HTML (brand line, about section, FAQ) | AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute JavaScript and Bing does so unreliably; without static copy they would index empty controls. |
| `/bn/` as a separate URL, with reciprocal `hreflang` and `x-default` → `/` | Search engines index one language per URL. `/bn/` always opens in Bangla; `/` follows the saved draft, then the browser language. |
| Per-language title and description | Bangla queries are answered by the Bangla page, in Bangla. |
| Open Graph and Twitter tags, `og-en.png` / `og-bn.png` (1200 × 630) | Rich link previews on Facebook, WhatsApp, LinkedIn, X and Slack. |
| JSON-LD `WebSite` and `WebApplication` | Declares the site name (toChithi / চিঠি) and identifies it as a free web app. No ratings are included, as none exist. |
| `sitemap.xml`, `robots.txt` | Lists both pages with language alternates; allows all crawlers. |
| `llms.txt` | A plain-text summary for AI tools. |
| `"trailingSlash": true` in `vercel.json` | Redirects `/bn` to `/bn/`, so each page has exactly one URL. |

## Performance

Lighthouse on the local server (`npm start`, compressed like production): **98–99 performance** and
**100 accessibility, best practices, SEO and agentic browsing** on desktop, for both pages. Simulated slow
mobile scores are lower (about 80 for English, high 70s for Bangla), driven mainly by editor start-up and
the Bengali fonts (150 KB and 80 KB) required for a Bangla first screen.

- **Zero layout shift.** Panes stay hidden until `app.js` has built them, the writing pad's images have
  decoded and the active fonts have loaded (capped at 1.5 s). The letter is then laid out inside a fixed frame.
  On mobile, the app occupies at least one full screen from first paint.
- **Self-hosted fonts** (`public/fonts.css`, `public/fonts/`, SIL Open Font Licence) — no third-party
  requests. The wordmark uses a 3 KB subset of Tiro Bangla and the English page's Bangla words a 6 KB subset of
  Anek Bangla, so full Bengali fonts load only when needed. Subsets were produced with
  `pyftsubset <font> --text="…" --layout-features='*' --flavor=woff2`.
- **Deferred scripts.** html2canvas (200 KB) loads only on first image export.
- **Explicit image dimensions** once an image's aspect ratio is known, so photos keep their shape in Outlook
  and before they load.

## Project structure

```
public/
├── index.html            English page — application markup is edited here
├── bn/index.html         Bangla page (generated by npm run pages)
├── app.js                Editor, stationery panel, preview, copy and export
├── builder.js            Editor content + stationery → email HTML
├── styles.css            All styles, light and dark
├── fonts.css, fonts/     Self-hosted typefaces, with licences
├── vendor/               Quill 2.0.2 and html2canvas 1.4.1, with licences
├── og-*.png              Social share cards
├── apple-touch-icon.png, favicon.svg
└── sitemap.xml, robots.txt, llms.txt   (generated by npm run pages)
scripts/
├── serve.mjs             Local static server with production headers
├── headers.mjs           Security headers — single source of truth
├── pages.mjs             Page metadata, share cards, structured data, about copy
└── build-pages.mjs       Generates the pages and crawler files
tests/                    Builder, configuration, page and browser tests
docs/overview.md          Product overview and open items
netlify.toml, vercel.json Host configuration
```

## Extending toChithi

- **Add a language:** add an entry to `LANGS`, a string table to `I18N` and a set of letters to `LETTERS` in `public/app.js`.
- **Add a preset paper:** add an entry to `PRESETS` in `public/builder.js`, its name to `I18N`, and its id to `PRESET_ORDER` in `public/app.js`.
- **Add a colour:** add it to the matching list in `public/builder.js`.
