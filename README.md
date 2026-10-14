# toChithi

Write an email as a চিঠি: a page from a ruled letter notebook. You write in a rich text editor,
choose the stationery, and copy the finished letter into Gmail, Outlook or any other email.

Everything runs in the browser. There is no server and nothing you write is uploaded.

## Run it

Needs Node.js 20 or newer (only for the local server and the tests; the site itself is static files).

```bash
npm start            # http://localhost:4173
npm test             # letter builder, config and page tests
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

## Search and sharing

There are two pages: `/` in English and `/bn/` in Bangla. Both are written by `npm run pages`
from one source, so the app markup is never copied by hand:

- **The app markup** lives in `public/index.html` between `<!-- app:start -->` and `<!-- app:end -->`.
- **Everything else** lives in `scripts/pages.mjs`: titles, descriptions, language links, share cards,
  structured data, the short "about" text under the app, `sitemap.xml`, `robots.txt` and `llms.txt`.

After changing either, run `npm run pages`. `tests/pages.test.mjs` fails if a page is out of date.

What each piece is for:

| Piece | Why |
| --- | --- |
| Words in the HTML itself (brand line, about section, questions) | Google runs the script before indexing, but Bing is less reliable and AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not run scripts at all. Without this they would see empty buttons. |
| `/bn/` as its own address, with `hreflang` both ways and `x-default` → `/` | Search engines index one language per address. A page that only switches language in the browser is found in one language. `/bn/` always opens in Bangla; `/` follows the saved draft, then the browser. |
| Title and description per language | What a search result shows. Bangla searches are answered by the Bangla page, in Bangla. |
| `og:` and `twitter:` tags, `og-en.png` and `og-bn.png` (1200 × 630) | The card shown when the link is shared on Facebook, WhatsApp, LinkedIn, X or Slack. |
| JSON-LD: `WebSite` and `WebApplication` | Gives Google the site name (toChithi, also চিঠি) and says this is a free web app. There is no rating in it: there are no reviews yet, and invented ones break Google's rules. |
| `sitemap.xml`, `robots.txt` | Lists both pages with their language links; lets every crawler in. |
| `llms.txt` | A plain summary for AI tools. No search engine is known to rank by it; it costs nothing. |
| `"trailingSlash": true` in `vercel.json` | `/bn` moves to `/bn/`, so a page never has two addresses. |

To change the domain, edit `SITE` in `scripts/pages.mjs` and run `npm run pages`.

### Speed

Lighthouse on the local server (`npm start`, which compresses like the hosts do): desktop 98–99 for
performance and 100 for accessibility, best practices, SEO and agentic browsing, on both pages.
Simulated slow phones score lower (around 80 in English, high 70s in Bangla), mostly from the editor
library starting up and the Bengali fonts (150 KB and 80 KB) needed for a Bangla first screen.

What keeps it fast and still:

- **Nothing jumps.** The panes stay hidden until `app.js` has built them, the writing pad's photos
  have decoded and the fonts in use have loaded (1.5 s at most). The letter is laid out just after,
  inside its fixed frame. On a phone, the app is at least one screen tall from the first paint.
- **Fonts are served from this site** (`public/fonts.css`, `public/fonts/`, SIL Open Font Licence) — no
  third-party request, and no visitor's address goes to Google. The wordmark uses a 3 KB cut of
  Tiro Bangla; the English page's few Bangla words use a 6 KB cut of Anek Bangla, so the full
  Bengali fonts load only when they are needed. The cuts were made with
  `pyftsubset <font> --text="…" --layout-features='*' --flavor=woff2`.
- **Scripts are deferred**, and html2canvas (200 KB) loads only when someone makes an image.
- **Photos in a letter get a height** once their shape is known, so they keep their shape in Outlook
  and before they load.

### After the first deploy (needs your Google and Microsoft accounts)

1. **Google Search Console** → add a *URL prefix* property for `https://tochithi.vercel.app/`. A
   `vercel.app` address can't be verified by DNS, so choose *HTML tag*, put the tag in the `head()` list in
   `scripts/pages.mjs`, run `npm run pages` and deploy. Then submit `sitemap.xml`, and use *URL inspection*
   → *Request indexing* for `/` and `/bn/`.
2. **Bing Webmaster Tools** → *Import from Google Search Console*. Bing's index also supplies Yahoo and much of DuckDuckGo, and is one of the sources behind ChatGPT search.
3. Paste both addresses into the [Rich Results Test](https://search.google.com/test/rich-results) and a
   share-preview checker to confirm the cards.

Links from other sites matter more than anything on the page. Good places to be mentioned: Product Hunt,
Show HN, r/bangladesh, Bangla tech groups and blogs, and the GitHub README with the site address in the
repository's *About* box.

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
public/index.html     the English page; the app markup is edited here
public/bn/index.html  the Bangla page (made by npm run pages)
public/og-*.png       share cards; apple-touch-icon.png
public/fonts.css, fonts/   the typefaces, self-hosted, with their licences
public/sitemap.xml, robots.txt, llms.txt   for crawlers (made by npm run pages)
public/styles.css     all styles, light and dark
public/builder.js     editor content + stationery -> email HTML
public/app.js         editor, stationery panel, preview, copy and export
public/vendor/        Quill 2.0.2 and html2canvas 1.4.1, with their licences
scripts/serve.mjs     local static server with the production headers
scripts/headers.mjs   the security headers, in one place
scripts/pages.mjs     titles, descriptions, share cards, structured data, about text
scripts/build-pages.mjs  writes the pages and crawler files
scripts/build-artifact.mjs
tests/                builder, config and browser tests
netlify.toml, vercel.json
```

## Adding things

- **A language:** add an entry to `LANGS`, a table to `I18N` and a set of letters to `LETTERS` in `app.js`.
- **A ready-made paper:** add an entry to `PRESETS` in `builder.js`, its name to `I18N`, and its id to `PRESET_ORDER` in `app.js`.
- **A colour:** add it to the matching list in `builder.js`.
