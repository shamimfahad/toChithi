// The two public pages, / (English) and /bn/ (Bangla), and everything search engines and
// link previews read from them: title, description, canonical and language links, social cards,
// structured data, and a short readable description of the tool under the app.
//
// The app markup itself is written once, in public/index.html between <!-- app:start --> and
// <!-- app:end -->. `npm run pages` rebuilds both pages around it; tests/pages.test.mjs fails if a
// page on disk is out of date.

export const SITE = 'https://tochithi.vercel.app';
export const REPO = 'https://github.com/shamimfahad/toChithi';
export const GOOGLE_VERIFICATION = 'VZJyCu79dKcMXCg11ZlkQVG-ZN_z5rk-3ZvDzS_hc6g';
export const UPDATED = '2026-10-12';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const PAGES = {
  en: {
    path: '/',
    file: 'index.html',
    locale: 'en_GB',
    title: 'toChithi — turn an email into a letter on notebook paper',
    description: 'Write a letter on ruled notebook, airmail or graph paper, then paste it into Gmail, Outlook or any email. Free, in English and Bangla. Nothing is uploaded.',
    tagline: 'Write a letter, copy it, and paste it into any email. Nothing you write is uploaded.',
    markLatin: 'Chithi',
    ogImage: '/og-en.png',
    // Fonts the first screen needs: the interface in Latin, and the wordmark (3 KB each).
    preload: ['anek-bangla-latin-wght-normal.woff2', 'tiro-bangla-wordmark-400-normal.woff2', 'tiro-bangla-wordmark-400-italic.woff2'],
    noscript: 'toChithi needs JavaScript to write and copy letters. Turn it on for this site and reload the page.',
    ogAlt: 'A letter on ruled notebook paper, with the words: turn an email into a letter.',
    features: [
      'Rich text editor: bold, italic, underline, highlighter, red pen, headings, quotes and lists',
      'Nine papers: notebook, yellow pad, blue paper, pink pad, graph paper, airmail, plain, kraft and night',
      'Custom stationery: paper colour, ruled lines or grid, margin line, edge, ink and lettering',
      'One-click date, greeting, sign-off and P.S.',
      'Photos shown as taped-on prints',
      'Templates: personal letter, thank-you note, invitation and formal application',
      'Copy into Gmail, Outlook, Yahoo Mail or Apple Mail; save as a PNG image or copy the HTML',
      'English and Bangla',
      'Runs in the browser; nothing is uploaded',
    ],
    about: `<section class="about" lang="en" aria-labelledby="about-title">
  <div class="about-lead">
    <h2 id="about-title">A letter, not just another email</h2>
    <p><strong>toChithi</strong> (<span lang="bn">চিঠি</span> means “letter” in Bangla) turns what you type into a page from a ruled letter notebook: the margin line, the date in the corner, the greeting, your words and your sign-off. Copy it into Gmail, Outlook, Yahoo Mail or Apple Mail and it arrives as a letter, not a block of plain text. The person you write to needs nothing installed.</p>
  </div>
  <div class="about-cols">
    <div>
      <h3>How it works</h3>
      <ol>
        <li><strong>Write.</strong> Format your words and add the date, a greeting, photos and a P.S.</li>
        <li><strong>Choose the paper.</strong> Notebook, yellow pad, blue paper, pink pad, graph paper, airmail, plain, kraft or night, or design your own: lines, margin, edge, ink and lettering.</li>
        <li><strong>Copy and paste</strong> into any email. You can also save the letter as a PNG image, or copy its HTML for a newsletter tool.</li>
      </ol>
    </div>
    <div>
      <h3>For every kind of letter</h3>
      <p>Start from a template: a personal letter, a thank-you note, an invitation or a formal application. Write in English or Bangla; dates and numerals follow the language you choose.</p>
      <h3>Private by design</h3>
      <p>Everything runs in your browser. Nothing you write is uploaded, there is no account to make, and it is free. Your draft stays on your device; save it as a file to carry it to another computer. The <a href="${REPO}" rel="noopener">source code is on GitHub</a>.</p>
    </div>
    <div>
      <h3>Questions</h3>
      <details>
        <summary>Does the letter keep its look in Gmail and Outlook?</summary>
        <p>The letter is built from plain tables with inline styles, which email editors keep when you paste. Ruled lines are the most delicate part: where an email program drops them, the paper colour, margin line and layout remain. Airmail and plain paper use only colours and borders.</p>
      </details>
      <details>
        <summary>Can I send it as an image?</summary>
        <p>Yes. Make a PNG image of the letter and attach it, or share it anywhere a picture goes. An image also keeps handwritten lettering exactly as you see it.</p>
      </details>
      <details>
        <summary>Can I write in Bangla?</summary>
        <p>Yes. Switch the page to <span lang="bn">বাংলা</span>: the sample letter, templates, date and numerals change with it.</p>
      </details>
      <details>
        <summary>Is it really free?</summary>
        <p>Yes, with no sign-up and no adverts. It is a static page with no server behind it, so there is nothing to pay for.</p>
      </details>
    </div>
  </div>
  <p class="about-foot"><a href="/bn/" hreflang="bn" lang="bn">বাংলায় পড়ুন</a></p>
</section>`,
  },

  bn: {
    path: '/bn/',
    file: 'bn/index.html',
    locale: 'bn_BD',
    title: 'চিঠি — ইমেইলে লিখুন খাতার পাতার চিঠি | toChithi',
    description: 'রুল টানা খাতার পাতা, এয়ারমেইল বা ছক কাগজে চিঠি লিখে Gmail, Outlook বা যেকোনো ইমেইলে পেস্ট করুন। বিনামূল্যে, বাংলা ও ইংরেজিতে। আপনার লেখা কোথাও আপলোড হয় না।',
    tagline: 'চিঠি লিখুন, কপি করুন, তারপর যেকোনো ইমেইলে পেস্ট করুন। আপনার লেখা কোথাও আপলোড হয় না।',
    markLatin: '',
    ogImage: '/og-bn.png',
    // The interface and the sample letter are in Bangla here, so both full Bengali fonts are needed at once.
    preload: ['anek-bangla-bengali-wght-normal.woff2', 'tiro-bangla-bengali-400-normal.woff2', 'tiro-bangla-wordmark-400-normal.woff2'],
    noscript: 'চিঠি লিখতে আর কপি করতে জাভাস্ক্রিপ্ট লাগে। এই সাইটের জন্য চালু করে পাতাটি আবার খুলুন।',
    ogAlt: 'রুল টানা খাতার পাতায় একটি চিঠি, পাশে লেখা: ইমেইলে লিখুন খাতার পাতার চিঠি।',
    features: [
      'লেখা সাজানো: মোটা, বাঁকা, নিচে দাগ, হাইলাইটার, লাল কালি, শিরোনাম, উদ্ধৃতি ও তালিকা',
      'নয় রকম কাগজ: খাতার পাতা, হলুদ প্যাড, নীল কাগজ, গোলাপি প্যাড, ছক কাগজ, এয়ারমেইল, সাদা কাগজ, ক্রাফট ও রাতের কাগজ',
      'নিজের মতো সাজানো: কাগজের রং, রুল বা ছক, মার্জিন, কিনারা, কালি ও হরফ',
      'এক ক্লিকে তারিখ, সম্বোধন, ইতি ও পুনশ্চ',
      'টেপ দিয়ে আটকানো প্রিন্টের মতো ছবি',
      'নমুনা: ব্যক্তিগত চিঠি, ধন্যবাদের চিঠি, নিমন্ত্রণপত্র ও দরখাস্ত',
      'Gmail, Outlook, Yahoo Mail বা Apple Mail-এ কপি করুন; PNG ছবি বা HTML কোড হিসেবে নিন',
      'বাংলা ও ইংরেজি',
      'সবকিছু ব্রাউজারে চলে; কিছুই আপলোড হয় না',
    ],
    about: `<section class="about" lang="bn" aria-labelledby="about-title">
  <div class="about-lead">
    <h2 id="about-title">শুধু ইমেইল নয়, একটা চিঠি</h2>
    <p><strong>চিঠি</strong> (toChithi) আপনার লেখাকে রুল টানা চিঠির খাতার একটি পাতায় সাজিয়ে দেয়: মার্জিনের দাগ, কোণে তারিখ, সম্বোধন, আপনার কথা আর শেষে ইতি। কপি করে Gmail, Outlook, Yahoo Mail বা Apple Mail-এ পেস্ট করলেই ইমেইল (ই-মেইল বা বৈদ্যুতিন চিঠি) পৌঁছায় খাতার পাতার চিঠি হয়ে। যাঁকে লিখছেন, তাঁকে কিছুই ইনস্টল করতে হবে না।</p>
  </div>
  <div class="about-cols">
    <div>
      <h3>কীভাবে লিখবেন</h3>
      <ol>
        <li><strong>লিখুন।</strong> লেখা সাজান, তারপর তারিখ, সম্বোধন, ছবি আর পুনশ্চ বসান।</li>
        <li><strong>কাগজ বাছুন।</strong> খাতার পাতা, হলুদ প্যাড, নীল কাগজ, গোলাপি প্যাড, ছক কাগজ, এয়ারমেইল, সাদা কাগজ, ক্রাফট বা রাতের কাগজ। চাইলে রুল, মার্জিন, কিনারা, কালি আর হরফ নিজের মতো সাজান।</li>
        <li><strong>কপি করে পেস্ট করুন</strong> যেকোনো ইমেইলে। চিঠিটি PNG ছবি হিসেবেও রাখতে পারেন, কিংবা নিউজলেটারের জন্য HTML কোড কপি করতে পারেন।</li>
      </ol>
    </div>
    <div>
      <h3>চিঠির অংশগুলো, এক ক্লিকে</h3>
      <p>চেনা নিয়মেই চিঠি সাজানো যায়: ডান কোণে <strong>তারিখ</strong>, তারপর <strong>সম্বোধন</strong> (“প্রিয় মা,”), মাঝে <strong>মূল কথা</strong>, শেষে <strong>বিদায় সম্ভাষণ</strong> (“ইতি,”) আর আপনার নাম, আর পরে মনে পড়া কথার জন্য <strong>পুনশ্চ</strong>।</p>
      <p>নমুনা থেকেও শুরু করা যায়: ব্যক্তিগত চিঠি, ধন্যবাদের চিঠি, নিমন্ত্রণপত্র বা দরখাস্ত (আবেদনপত্র), বাংলা ও ইংরেজিতে। তারিখ আর সংখ্যা বাংলায় লেখা হয়।</p>
      <h3>আপনার লেখা আপনারই</h3>
      <p>সবকিছু আপনার ব্রাউজারেই চলে। আপনার লেখা কোথাও আপলোড হয় না, কোনো অ্যাকাউন্ট খুলতে হয় না, পুরোপুরি বিনামূল্যে। খসড়া আপনার যন্ত্রেই থাকে; ফাইল হিসেবে রেখে অন্য কম্পিউটারেও খোলা যায়। <a href="${REPO}" rel="noopener">সোর্স কোড GitHub-এ আছে</a>।</p>
    </div>
    <div>
      <h3>প্রশ্ন ও উত্তর</h3>
      <details>
        <summary>Gmail আর Outlook-এ কি চিঠির সাজ ঠিক থাকে?</summary>
        <p>চিঠিটি সাধারণ টেবিল আর ইনলাইন স্টাইলে তৈরি, যা পেস্ট করলে ইমেইল এডিটর রেখে দেয়। রুলের দাগই সবচেয়ে নাজুক: কোনো ইমেইল প্রোগ্রাম দাগ বাদ দিলেও কাগজের রং, মার্জিন আর বিন্যাস ঠিক থাকে। এয়ারমেইল আর সাদা কাগজে শুধু রং আর বর্ডার ব্যবহার হয়।</p>
      </details>
      <details>
        <summary>ছবি হিসেবে পাঠানো যায়?</summary>
        <p>হ্যাঁ। চিঠির PNG ছবি বানিয়ে ইমেইলে জুড়ে দিন, বা যেখানে খুশি শেয়ার করুন। ছবিতে হাতের লেখার হরফও হুবহু থাকে।</p>
      </details>
      <details>
        <summary>বাংলায় লিখতে কী লাগবে?</summary>
        <p>শুধু আপনার যন্ত্রের বাংলা কিবোর্ড, যেমন অভ্র বা জিবোর্ড। চাইলে অন্য কোথাও লেখা পেস্টও করতে পারেন। বাংলা ফন্ট পাতাতেই দেওয়া আছে, আলাদা করে ইনস্টল করতে হবে না।</p>
      </details>
      <details>
        <summary>সত্যিই কি বিনামূল্যে?</summary>
        <p>হ্যাঁ। কোনো সাইন-আপ নেই, কোনো বিজ্ঞাপন নেই। এটি সার্ভার ছাড়া চলা একটি পাতা, তাই কোনো খরচও নেই।</p>
      </details>
    </div>
  </div>
  <p class="about-foot"><a href="/" hreflang="en" lang="en">Read in English</a></p>
</section>`,
  },
};

const url = (lang) => SITE + PAGES[lang].path;

function structuredData(lang) {
  const p = PAGES[lang];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'toChithi',
        alternateName: ['চিঠি', 'Chithi'],
        url: `${SITE}/`,
        inLanguage: ['en', 'bn'],
      },
      {
        '@type': 'WebApplication',
        '@id': `${url(lang)}#app`,
        name: lang === 'bn' ? 'চিঠি' : 'toChithi',
        alternateName: lang === 'bn' ? 'toChithi' : 'চিঠি',
        url: url(lang),
        description: p.description,
        inLanguage: lang,
        applicationCategory: 'CommunicationApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: p.features,
        image: SITE + p.ogImage,
        screenshot: SITE + p.ogImage,
        isPartOf: { '@id': `${SITE}/#website` },
        author: { '@type': 'Person', name: 'Shamim Fahad', url: 'https://github.com/shamimfahad' },
      },
    ],
  };
}

function head(lang) {
  const p = PAGES[lang];
  const other = Object.keys(PAGES).filter((l) => l !== lang);
  // "<" in JSON-LD is escaped so no string in it can ever close the script element.
  const json = JSON.stringify(structuredData(lang), null, 2).replace(/</g, '\\u003c');
  return [
    `<title>${esc(p.title)}</title>`,
    // Google Search Console ownership check (URL-prefix property for SITE). Keep it: Google re-checks it.
    `<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">`,
    `<meta name="description" content="${esc(p.description)}">`,
    `<link rel="canonical" href="${url(lang)}">`,
    ...Object.keys(PAGES).map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url('en')}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="toChithi">`,
    `<meta property="og:url" content="${url(lang)}">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.description)}">`,
    `<meta property="og:locale" content="${p.locale}">`,
    ...other.map((l) => `<meta property="og:locale:alternate" content="${PAGES[l].locale}">`),
    `<meta property="og:image" content="${SITE}${p.ogImage}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(p.ogAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(p.title)}">`,
    `<meta name="twitter:description" content="${esc(p.description)}">`,
    `<meta name="twitter:image" content="${SITE}${p.ogImage}">`,
    `<meta name="twitter:image:alt" content="${esc(p.ogAlt)}">`,
    `<script type="application/ld+json">\n${json}\n</script>`,
  ].join('\n');
}

// Builds one whole page. `source` is public/index.html as it is on disk; only the app markup
// is taken from it, so editing the app there and running `npm run pages` updates both pages.
export function buildPage(lang, source) {
  const p = PAGES[lang];
  const start = source.indexOf('<!-- app:start -->');
  const end = source.indexOf('<!-- app:end -->') + '<!-- app:end -->'.length;
  if (start < 0 || end < start) throw new Error('public/index.html has no <!-- app:start --> … <!-- app:end --> block');
  // The brand line is filled in before any script runs, so it is there for crawlers and link previews too.
  const app = source.slice(start, end)
    .replace(/(<p class="tagline" data-t="tagline">)[^<]*(<\/p>)/, `$1${esc(p.tagline)}$2`)
    .replace(/(<span class="mark-latin" id="mark-latin" data-t="markLatin")( hidden)?>[^<]*(<\/span>)/, (m, a, h, b) => `${a}${p.markLatin ? '' : ' hidden'}>${esc(p.markLatin)}${b}`);

  return `<!doctype html>
<html lang="${lang}"${lang === 'en' ? '' : ` data-page-lang="${lang}"`}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- Made by scripts/pages.mjs. Edit the app markup between app:start and app:end in public/index.html, the rest in scripts/pages.mjs, then run npm run pages. -->
${head(lang)}
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#e4e9ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1e2227" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${p.preload.map((f) => `<link rel="preload" href="/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="/fonts.css">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<noscript><p class="noscript">${esc(p.noscript)}</p></noscript>
${app}
<!-- about:start -->
${p.about}
<!-- about:end -->
<script src="/vendor/quill.js" defer fetchpriority="high"></script>
<script src="/builder.js" defer fetchpriority="high"></script>
<script src="/app.js" defer fetchpriority="high"></script>
</body>
</html>
`;
}

export function sitemap() {
  const alts = Object.keys(PAGES)
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en')}"/>`)
    .join('\n');
  const entries = Object.keys(PAGES).map((l) => `  <url>\n    <loc>${url(l)}</loc>\n    <lastmod>${UPDATED}</lastmod>\n${alts}\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

export function robots() {
  return `# Every crawler is welcome, including AI search and answer engines.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}

// A plain summary for AI tools that read /llms.txt. No search engine is known to rank by it;
// it costs nothing and gives answer engines the facts in one place.
export function llms() {
  return `# toChithi (চিঠি)

> A free web tool that turns an email into a letter on notebook paper. You write in a rich text editor, choose the stationery, and copy the finished letter into Gmail, Outlook, Yahoo Mail or Apple Mail. It runs in the browser; nothing you write is uploaded. English and Bangla.

- [toChithi in English](${url('en')})
- [চিঠি, বাংলায়](${url('bn')})
- [Source code](${REPO})

## What it does

${PAGES.en.features.map((f) => `- ${f}`).join('\n')}

## Good to know

- চিঠি (chithi) means "letter" in Bangla.
- The letter is built from inline-styled tables so it survives pasting into email editors. Ruled lines are the most delicate part; where an email program drops them, the paper colour, margin line and layout remain.
- No account, no server, no cost. Drafts are kept in the browser and can be saved to a file.
`;
}
