# toChithi — project overview

_Last updated: 12 October 2026_

## What it is
toChithi turns an email into a চিঠি: a letter on notebook, graph, airmail or plain paper, with the date in the corner, a greeting, the letter, and a sign-off. The recipient needs nothing installed.

## Current direction: the free converter
A free, serverless tool. You write in a rich text editor, design the paper, see the letter, and copy it into any email service. The aim is a polished, classic tool that brings back the feel of letter writing: professional yet personal.

- **Languages:** English and বাংলা, switched from the app bar. The first visit follows the browser's language. Dates, numerals, the sample letter and the templates follow the chosen language. Adding a language means adding one entry each to `LANGS`, `I18N` and `LETTERS` in `app.js`; nothing else names a language. Other languages come later.
- **Look:** a flat application frame. App bar, a left pane and a desk pane. Cool blue-grey in light mode, One Dark style in dark mode, post-box red for the primary action only. No shadows or decorative gradients.
- **Layout:** the left pane switches between writing (toolbar, editor, status line) and the stationery panel, while the letter stays in view on the right. On a phone there are three tabs (write, design, letter); in the design tab the letter is pinned on top. A toggle previews the letter at computer or phone width.
- **Formats:** undo/redo, bold, italic, underline, strike, highlighter, red pen, two heading sizes, quotes, bullet and numbered lists, alignment, links.
- **Parts of a letter:** one-click date, greeting, sign-off, P.S., divider and new page.
- **Templates:** personal letter, thank-you note, invitation, formal application (দরখাস্ত), in both languages.
- **Photos:** add, paste or drop; small, medium or large; shown as a taped-on print and resized in the browser.
- **Stationery:** nine ready-made papers (notebook, yellow pad, blue paper, pink pad, graph paper, airmail, plain, kraft, night) and a panel that controls each part:
  - paper colour (twelve, or any colour)
  - ruling: none, lines or grid, with its own colour and three line gaps
  - margin line: none, single, double or both sides, in any colour
  - edge: none, thin line, tear-off pad, top bar or airmail stripes
  - ink (eight, or any colour), with a warning when ink and paper are too close to read
  - lettering (book, typewriter, handwritten) and text size
- **Width:** full width by default (the letter fills the reader's screen); a 600px letter size and a 780px wide size are the alternatives.
- **Pages:** a sheet is never shorter than one page; short letters are filled out with blank ruled lines. "New page" starts a sheet anywhere; "split into pages" does it automatically at a chosen page length, with optional page numbers. Sheets are stacked with a gap, since email has no real pages. A paragraph is never cut in two.
- **Ways out:** copy as rich text (for Gmail, Outlook, Yahoo), make a PNG image, or copy the raw HTML for newsletter tools. One red copy button, two quiet buttons, and the next step shown beside them.
- **Save and open:** "Save" offers a draft (`.chithi.json`: words, formats, photos, stationery and language, opened again with "Open draft" on any device) or the finished letter as an `.html` page. An opened draft is checked like anything typed: only text, photos carried inside the file, page breaks and plain format values come through (`readDraft` in `builder.js`).
- **Built to survive pasting:** inline styles on plain tables, no media queries. Ruled lines and grids are gradients written as self-contained stripes; where an email editor drops them, the paper colour, margin line and layout remain. Airmail and plain paper use only colours and borders. Ruled lines are confirmed to survive a paste into Gmail's compose window.
- **Speed:** Lighthouse desktop 98–99 performance, 100 for accessibility, best practices, SEO and agentic browsing. Fonts are self-hosted, scripts deferred, the image library loads on first use, and the panes are revealed only once built, so nothing shifts.
- **Search and sharing:** two addresses, `/` (English) and `/bn/` (Bangla), linked with `hreflang`. Each has its own title, description, share card and structured data, plus a short readable description of the tool under the app, so crawlers that don't run scripts still see what it is. Sitemap, robots.txt and llms.txt. All of it comes from `scripts/pages.mjs` via `npm run pages`.
- **Privacy:** everything runs in the browser, nothing is uploaded; the draft autosaves locally, and can be saved to a file to keep photos too big for the browser's storage.
- **Stack:** static files, no build step. Quill 2.0.2 (editor) and html2canvas 1.4.1 (image export), vendored. Fonts: Tiro Bangla and Anek Bangla, Kalam and Atma for handwriting.

## Code and deployment
The converter is now a small repository, `tochithi`, ready to push:

- `public/` is the site: `index.html`, `styles.css`, `builder.js` (the only code that writes email markup, testable on its own), `app.js` (editor, stationery panel, preview, copy and export) and `vendor/`.
- `netlify.toml` and `vercel.json` publish `public/` with no build step and set the security headers (Content-Security-Policy with `script-src 'self'`).
- `npm test` runs 15 builder and config tests; `npm run test:browser` runs 10 Playwright tests against the site served with the production headers.
- `npm run artifact` packs the site into one file for the চিঠি artifact, which is published from it.
- **Status:** committed locally; not yet pushed or deployed. Pushing needs a GitHub repository; deploying needs the repository imported once in Netlify or Vercel.

## Earlier build: Gmail-sending app (kept, independent)
A Node/Express app that signs in with Google and sends the letter from the user's own Gmail. Delivered as `chithi.zip` with a README. It is not part of the `tochithi` repository.

- Google OAuth with PKCE, send-only `gmail.send` scope, no refresh token.
- The browser sends plain text and a paper name only; the server writes all markup, escapes every typed character, and builds the MIME message without a From header.
- CSRF protection, rate limits, per-account send limits, optional sign-in allowlist, in-memory sessions (single instance).
- Links blocked by default (`LINK_POLICY`), web font off by default (`WEB_FONT`).
- 30+ automated tests, plus an independent security review whose two findings were fixed.
- Not yet sent through real Gmail: needs Google OAuth credentials.

## Security principle (both builds)
Nothing a writer types may become executable code, markup, or extra email headers. The rendering code owns every tag and attribute; user content only ever lands as text or as vetted values. In the converter, lettering, sizes and layout choices are names looked up in fixed lists, and a colour must be a plain `#RRGGBB` value.

## Open items
- Push the repository and deploy it (Netlify or Vercel).
- Grid paper and multi-page letters have not yet been pasted into real Gmail or Outlook; ruled lines have, in Gmail.
- Handwritten lettering is exact only in the image; pasted as text, readers see it only if their device has the font.
- Typewriter and handwritten lettering are designed for Latin text; Bangla falls back to a plainer face in both.
- Gmail app has only run against a mocked Google.
- More languages to add.
