/*
 * toChithi: the page. The editor, the stationery panel, the preview and the ways out.
 * It never writes email markup itself; that is builder.js.
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var own = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  var STORE = 'chithi-converter-v1';

  // The letter builder (builder.js) owns the stationery lists and everything that produces email HTML.
  var C = window.Chithi;
  var BN_FONTS = C.BN_FONTS;
  var LETTERINGS = C.LETTERINGS;
  var PAPER_COLORS = C.PAPER_COLORS;
  var LINE_COLORS = C.LINE_COLORS;
  var MARGIN_COLORS = C.MARGIN_COLORS;
  var INK_COLORS = C.INK_COLORS;
  var PRESETS = C.PRESETS;
  var PRESET_KEYS = C.PRESET_KEYS;
  var DESIGN0 = C.DESIGN0;
  var WIDTHS = C.WIDTHS;
  var WIDE_GUESS = C.WIDE_GUESS;
  var AIR_RED = C.AIR_RED;
  var AIR_BLUE = C.AIR_BLUE;
  var hex = C.hex;
  var mix = C.mix;
  var contrast = C.contrast;
  var isDark = C.isDark;
  var makeDraft = C.makeDraft;
  var readDraft = C.readDraft;
  var autoRule = C.autoRule;
  var normDesign = C.normDesign;
  var safeLink = C.safeLink;
  var buildLetter = C.buildLetter;

  // ===========================================================================
  // 0. Languages. To add one: add an entry to LANGS, a table to I18N and a set
  //    of letters to LETTERS. Nothing else in the page names a language.
  // ===========================================================================
  var LANGS = {
    en: { name: 'English', locale: 'en-GB', write: "Georgia,'Times New Roman'," + BN_FONTS + ",serif", glyphs: { b: 'B', i: 'I', u: 'U', s: 'S', a: 'A', ol: '1.' } },
    bn: { name: 'বাংলা', locale: 'bn-BD', write: BN_FONTS + ",Georgia,serif", glyphs: { b: 'ক', i: 'ক', u: 'ক', s: 'ক', a: 'ক', ol: '১.' } }
  };

  var I18N = {
    en: {
      markLatin: 'Chithi',
      tagline: 'Write a letter, copy it, and paste it into any email. Nothing you write is uploaded.',
      language: 'Language', source: 'Source code on GitHub', panels: 'Panels', tabWrite: 'Write', tabLetter: 'Letter',
      padLabel: 'Writing pad', letterLabel: 'Finished letter', formatLabel: 'Formatting', insertLabel: 'Add to the letter',
      undo: 'Undo', redo: 'Redo', bold: 'Bold', italic: 'Italic', underline: 'Underline', strike: 'Strikethrough',
      highlight: 'Highlighter', red: 'Red pen', h1: 'Heading', h2: 'Subheading', quote: 'Quote',
      bullets: 'Bulleted list', numbers: 'Numbered list', left: 'Align left', center: 'Centre', right: 'Align right',
      insert: 'Add', date: 'Date', greeting: 'Greeting', signoff: 'Sign-off', ps: 'P.S.', divider: 'Divider', photo: 'Photo', link: 'Link',
      dateTip: 'Add today’s date', greetingTip: 'Add “Dear …,”', signoffTip: 'Add a closing and your name', psTip: 'Add a postscript',
      greetingText: 'Dear …,', signoff1: 'Yours sincerely,', signoff2: '…', psText: 'P.S. ', place: 'Dhaka',
      starter: 'Start from a template', starterPick: 'Start from…',
      s_personal: 'A personal letter', s_thanks: 'A thank-you note', s_invite: 'An invitation', s_formal: 'A formal application',
      replaceAsk: 'This replaces what you have written.', replaceYes: 'Use the template', replaceNo: 'Keep my letter',
      linkLabel: 'Link address', linkSave: 'Add link', linkRemove: 'Remove link', cancel: 'Cancel',
      photoSize: 'Photo size', small: 'Small', medium: 'Medium', large: 'Large', photoRemove: 'Remove photo',
      sampleNote: 'This is a sample letter. Type over it.',
      words: '{n} words', words_one: '{n} word',
      fresh: 'New letter', freshAsk: 'This clears everything you have written.', freshYes: 'Clear the letter', freshNo: 'Keep it',
      save: 'Save', open: 'Open draft', saveTitle: 'Save your letter',
      saveDraft: 'Save draft (.chithi.json)',
      saveDraftNote: 'To keep writing later. Everything is kept: the words, photos, paper and language. Open it with “Open draft”, on this device or any other.',
      saveLetter: 'Save letter (.html)',
      saveLetterNote: 'The finished letter as a web page, to open in a browser or keep. It cannot be opened again for editing.',
      saved: 'Saved.', saveFail: 'The file could not be saved.',
      openAsk: 'Opening the draft replaces what you have written.', openYes: 'Open the draft', opened: 'Draft opened.',
      openBad: 'That file is not a toChithi draft. Choose a file made with “Save draft”.',
      openBig: 'That file is too large to be a draft.',
      paper: 'Paper', ink: 'Ink', lettering: 'Lettering', l_book: 'Book', l_type: 'Typewriter', l_hand: 'Handwritten',
      paper_khata: 'Notebook', paper_holud: 'Yellow pad', paper_neel: 'Blue paper', paper_airmail: 'Airmail', paper_plain: 'Plain',
      ink_neel: 'Blue ink', ink_kalo: 'Black ink', ink_sobuj: 'Green ink', ink_beguni: 'Violet ink',
      handHint: 'Handwritten lettering is kept when you make an image. Pasted as text, an email shows it only where the reader’s device has the font.',
      view: 'Preview as', wide: 'Computer', phone: 'Phone',
      copy: 'Copy letter', asImage: 'Make image', asCode: 'HTML code',
      copied: 'Now open your email and paste it into the message{key}.',
      selected: 'The letter is selected. Copy it{key}, then paste it into your email.',
      needSelection: 'Select the words the link should sit on first.',
      badLink: 'That address is not valid. Enter one that starts with https://',
      notImage: 'That file is not a picture. Choose a PNG, JPG, GIF or WebP.',
      tooMany: 'A letter can hold up to {n} photos.',
      photosNotKept: 'The photos are too big to keep in this browser. Your words are kept, but the photos will be gone if you reload. Use Save, then “Save draft”, to keep them.',
      tooLarge: 'That photo is over 25 MB. Choose a smaller one.',
      unreadable: 'That photo could not be read. Try another one.',
      placeholder: 'Dear …,\nStart writing here.', editorLabel: 'Write your letter',
      loadFail: 'The writing pad did not load. Check your connection and reopen the page.',
      imageTitle: 'Your letter as an image', imageAlt: 'The finished letter as an image',
      imageNote: 'An image looks exactly like this in every email. Copy it and paste it into your message, or right-click it (press and hold on a phone) to copy or save.',
      imageCopy: 'Copy image', imageSave: 'Save image', close: 'Close',
      imageCopied: 'Image copied. Paste it into your email.',
      imageManual: 'Copying is not available here. Right-click the image (press and hold on a phone) to copy it.',
      imageSaved: 'Image saved.', imageSaveFail: 'The image could not be saved. Right-click it to save.',
      making: 'Making the image…', imageLib: 'The image maker did not load. Reopen the page and try again.',
      imageFail: 'The image could not be made. If the letter has a photo from a web address, remove it and try again.',
      codeTitle: 'HTML code', codeNote: 'Paste this into tools that accept HTML, such as newsletter tools and email templates.',
      codeCopy: 'Copy code', codeCopied: 'Code copied.', codeSelected: 'The code is selected. Copy it{key}.',
      tabDesign: 'Design', modeLabel: 'Left pane', modeWrite: 'Write', modeDesign: 'Stationery', customize: 'Customise',
      d_presets: 'Ready-made', d_paper: 'Paper', d_pattern: 'Ruling', d_margin: 'Margin line', d_edge: 'Edge', d_ink: 'Ink',
      d_width: 'Width', d_pages: 'Pages', d_color: 'Colour', d_kind: 'Style', d_spacing: 'Line gap', d_size: 'Size',
      d_pageSize: 'Page length', d_pageNo: 'Numbers',
      none: 'None', auto: 'Match paper', ownColor: 'Your own colour', show: 'Show', hide: 'Hide',
      p_lines: 'Lines', p_grid: 'Grid', sp_tight: 'Tight', sp_loose: 'Loose',
      m_single: 'Single', m_double: 'Double', m_both: 'Both sides',
      e_thin: 'Thin line', e_pad: 'Tear-off pad', e_bar: 'Top bar',
      w_letter: 'Letter', w_wide: 'Wide', w_full: 'Full width',
      widthNote: 'Full width stretches the letter to fill the reader’s screen, whatever its size.',
      pg_off: 'One long page', pg_auto: 'Split into pages', ps_short: 'Short', ps_long: 'Long',
      pagesNote: 'Use “New page” in the Write tab to start a page wherever you like. Pages are stacked one under another in the email.',
      pageBreak: 'New page', pageBreakTip: 'Start a new page here',
      pages: '{n} pages', pages_one: '{n} page',
      paper_golapi: 'Pink pad', paper_graph: 'Graph paper', paper_kraft: 'Kraft', paper_raat: 'Night',
      lowContrast: 'The ink and the paper are very close in colour, so the letter may be hard to read.',
      sendHint: 'Then paste it into Gmail, Outlook or any other email.', copiedShort: 'Copied',
      photoWord: '[photo]'
    },
    bn: {
      markLatin: '',
      tagline: 'চিঠি লিখুন, কপি করুন, তারপর যেকোনো ইমেইলে পেস্ট করুন। আপনার লেখা কোথাও আপলোড হয় না।',
      language: 'ভাষা', source: 'GitHub-এ সোর্স কোড', panels: 'প্যানেল', tabWrite: 'লিখুন', tabLetter: 'চিঠি',
      padLabel: 'লেখার প্যাড', letterLabel: 'তৈরি চিঠি', formatLabel: 'লেখা সাজানো', insertLabel: 'চিঠিতে বসান',
      undo: 'আগের অবস্থায় ফিরুন', redo: 'আবার করুন', bold: 'মোটা', italic: 'বাঁকা', underline: 'নিচে দাগ', strike: 'কেটে দেওয়া',
      highlight: 'হাইলাইটার', red: 'লাল কালি', h1: 'শিরোনাম', h2: 'উপশিরোনাম', quote: 'উদ্ধৃতি',
      bullets: 'বুলেট তালিকা', numbers: 'সংখ্যা দেওয়া তালিকা', left: 'বাঁ দিকে', center: 'মাঝখানে', right: 'ডান দিকে',
      insert: 'বসান', date: 'তারিখ', greeting: 'সম্বোধন', signoff: 'ইতি', ps: 'পুনশ্চ', divider: 'বিভাজক', photo: 'ছবি', link: 'লিংক',
      dateTip: 'আজকের তারিখ বসান', greetingTip: '“প্রিয় …,” বসান', signoffTip: 'বিদায় সম্ভাষণ ও নাম বসান', psTip: 'পুনশ্চ বসান',
      greetingText: 'প্রিয় …,', signoff1: 'ইতি,', signoff2: 'তোমার …', psText: 'পুনশ্চ: ', place: 'ঢাকা',
      starter: 'নমুনা থেকে শুরু করুন', starterPick: 'নমুনা থেকে শুরু…',
      s_personal: 'ব্যক্তিগত চিঠি', s_thanks: 'ধন্যবাদের চিঠি', s_invite: 'নিমন্ত্রণপত্র', s_formal: 'দরখাস্ত',
      replaceAsk: 'আপনার লেখা মুছে এই নমুনাটি বসবে।', replaceYes: 'নমুনা বসান', replaceNo: 'আমার লেখা থাক',
      linkLabel: 'লিংকের ঠিকানা', linkSave: 'লিংক বসান', linkRemove: 'লিংক সরান', cancel: 'থাক',
      photoSize: 'ছবির মাপ', small: 'ছোট', medium: 'মাঝারি', large: 'বড়', photoRemove: 'ছবি সরান',
      sampleNote: 'এটি একটি নমুনা চিঠি। মুছে নিজের কথা লিখুন।',
      words: '{n}টি শব্দ', words_one: '{n}টি শব্দ',
      fresh: 'নতুন চিঠি', freshAsk: 'সব লেখা মুছে যাবে।', freshYes: 'মুছে ফেলুন', freshNo: 'থাক',
      save: 'সেভ', open: 'খসড়া খুলুন', saveTitle: 'চিঠি সেভ করুন',
      saveDraft: 'খসড়া সেভ করুন (.chithi.json)',
      saveDraftNote: 'পরে আবার লেখার জন্য। লেখা, ছবি, কাগজ আর ভাষা, সবই থাকবে। এই বা অন্য যেকোনো ডিভাইসে “খসড়া খুলুন” দিয়ে খুলুন।',
      saveLetter: 'চিঠি সেভ করুন (.html)',
      saveLetterNote: 'তৈরি চিঠিটি একটি ওয়েব পেজ হিসেবে, ব্রাউজারে খোলা বা রেখে দেওয়ার জন্য। এটি আবার খুলে সম্পাদনা করা যাবে না।',
      saved: 'সেভ হয়েছে।', saveFail: 'ফাইলটি সেভ করা যায়নি।',
      openAsk: 'খসড়া খুললে আপনার এখনকার লেখা মুছে যাবে।', openYes: 'খসড়া খুলুন', opened: 'খসড়া খোলা হয়েছে।',
      openBad: 'এটি toChithi-র খসড়া ফাইল নয়। “খসড়া সেভ করুন” দিয়ে রাখা ফাইলটি বেছে নিন।',
      openBig: 'ফাইলটি খসড়া হওয়ার জন্য অনেক বড়।',
      paper: 'কাগজ', ink: 'কালি', lettering: 'হরফ', l_book: 'ছাপা', l_type: 'টাইপরাইটার', l_hand: 'হাতের লেখা',
      paper_khata: 'খাতার পাতা', paper_holud: 'হলুদ প্যাড', paper_neel: 'নীল কাগজ', paper_airmail: 'এয়ারমেইল', paper_plain: 'সাদা কাগজ',
      ink_neel: 'নীল কালি', ink_kalo: 'কালো কালি', ink_sobuj: 'সবুজ কালি', ink_beguni: 'বেগুনি কালি',
      handHint: 'হাতের লেখার হরফ ছবিতে হুবহু থাকে। লেখা হিসেবে পেস্ট করলে পাঠকের ডিভাইসে হরফটি থাকলে তবেই তা দেখা যাবে।',
      view: 'পর্দা', wide: 'কম্পিউটার', phone: 'ফোন',
      copy: 'চিঠি কপি করুন', asImage: 'ছবি বানান', asCode: 'HTML কোড',
      copied: 'এবার ইমেইল খুলে লেখার জায়গায় পেস্ট করুন{key}।',
      selected: 'চিঠিটি বাছাই করা আছে। কপি করুন{key}, তারপর ইমেইলে পেস্ট করুন।',
      needSelection: 'আগে লেখার যে অংশে লিংক বসবে, সেটি বাছাই করুন।',
      badLink: 'ঠিকানাটি সঠিক নয়। https:// দিয়ে শুরু হওয়া একটি ঠিকানা দিন।',
      notImage: 'এই ফাইলটি ছবি নয়। PNG, JPG, GIF বা WebP ছবি দিন।',
      tooMany: 'একটি চিঠিতে সর্বোচ্চ {n}টি ছবি দেওয়া যায়।',
      photosNotKept: 'ছবিগুলো এই ব্রাউজারে রাখার জন্য অনেক বড়। লেখা রাখা আছে, কিন্তু পেজ রিলোড করলে ছবিগুলো থাকবে না। ছবিসহ রাখতে “সেভ” থেকে “খসড়া সেভ করুন” বেছে নিন।',
      tooLarge: 'ছবিটি ২৫ এমবির বেশি। ছোট একটি ছবি দিন।',
      unreadable: 'ছবিটি পড়া যায়নি। অন্য একটি ছবি দিয়ে চেষ্টা করুন।',
      placeholder: 'প্রিয় …,\nএখানে লিখতে শুরু করুন।', editorLabel: 'চিঠি লিখুন',
      loadFail: 'লেখার প্যাডটি লোড হয়নি। ইন্টারনেট সংযোগ দেখে পাতাটি আবার খুলুন।',
      imageTitle: 'চিঠির ছবি', imageAlt: 'তৈরি চিঠির ছবি',
      imageNote: 'ছবিটি সব ইমেইলে হুবহু এ রকম দেখাবে। কপি করে ইমেইলে পেস্ট করুন, অথবা ছবির ওপর ডান-ক্লিক করে (ফোনে চেপে ধরে) কপি বা সেভ করুন।',
      imageCopy: 'ছবি কপি করুন', imageSave: 'ছবি সেভ করুন', close: 'বন্ধ করুন',
      imageCopied: 'ছবি কপি হয়েছে। এবার ইমেইলে পেস্ট করুন।',
      imageManual: 'এখানে সরাসরি কপি করা গেল না। ছবির ওপর ডান-ক্লিক করে (ফোনে চেপে ধরে) কপি করুন।',
      imageSaved: 'ছবি সেভ হয়েছে।', imageSaveFail: 'ছবি সেভ করা যায়নি। ছবির ওপর ডান-ক্লিক করে সেভ করুন।',
      making: 'ছবি তৈরি হচ্ছে…', imageLib: 'ছবি বানানোর অংশটি লোড হয়নি। পাতাটি আবার খুলে চেষ্টা করুন।',
      imageFail: 'ছবি তৈরি করা যায়নি। ওয়েব ঠিকানা থেকে আনা কোনো ছবি থাকলে সেটি সরিয়ে আবার চেষ্টা করুন।',
      codeTitle: 'HTML কোড', codeNote: 'যেসব টুলে HTML বসানো যায় (নিউজলেটার টুল, ইমেইল টেমপ্লেট), সেখানে এই কোড পেস্ট করুন।',
      codeCopy: 'কোড কপি করুন', codeCopied: 'কোড কপি হয়েছে।', codeSelected: 'কোডটি বাছাই করা আছে। কপি করুন{key}।',
      tabDesign: 'সাজান', modeLabel: 'বাঁ দিকের অংশ', modeWrite: 'লেখা', modeDesign: 'সাজসজ্জা', customize: 'নিজের মতো সাজান',
      d_presets: 'তৈরি নকশা', d_paper: 'কাগজ', d_pattern: 'দাগ', d_margin: 'মার্জিন', d_edge: 'কিনারা', d_ink: 'কালি',
      d_width: 'চওড়া', d_pages: 'পাতা', d_color: 'রং', d_kind: 'ধরন', d_spacing: 'লাইনের ফাঁক', d_size: 'মাপ',
      d_pageSize: 'পাতার মাপ', d_pageNo: 'পাতার নম্বর',
      none: 'নেই', auto: 'কাগজের সঙ্গে মিলিয়ে', ownColor: 'নিজের রং', show: 'দেখান', hide: 'লুকান',
      p_lines: 'লাইন', p_grid: 'ছক', sp_tight: 'ঘন', sp_loose: 'ফাঁকা',
      m_single: 'একটি', m_double: 'জোড়া', m_both: 'দুই পাশে',
      e_thin: 'সরু রেখা', e_pad: 'ছেঁড়া প্যাড', e_bar: 'মোটা মাথা',
      w_letter: 'চিঠির মাপ', w_wide: 'চওড়া', w_full: 'পুরো পর্দা',
      widthNote: 'পুরো পর্দা বাছলে পাঠকের পর্দা যত চওড়াই হোক, চিঠি পুরোটা জুড়ে থাকবে।',
      pg_off: 'একটানা', pg_auto: 'পাতায় ভাগ', ps_short: 'ছোট', ps_long: 'লম্বা',
      pagesNote: 'যেখান থেকে খুশি নতুন পাতা শুরু করতে “লিখুন” অংশের “নতুন পাতা” চাপুন। ইমেইলে পাতাগুলো একটির নিচে আরেকটি থাকে।',
      pageBreak: 'নতুন পাতা', pageBreakTip: 'এখান থেকে নতুন পাতা শুরু করুন',
      pages: '{n}টি পাতা', pages_one: '{n}টি পাতা',
      paper_golapi: 'গোলাপি প্যাড', paper_graph: 'ছক কাগজ', paper_kraft: 'ক্রাফট', paper_raat: 'রাতের কাগজ',
      lowContrast: 'কালি আর কাগজের রং খুব কাছাকাছি, তাই চিঠিটা পড়তে কষ্ট হতে পারে।',
      sendHint: 'তারপর Gmail, Outlook বা অন্য যেকোনো ইমেইলে পেস্ট করুন।', copiedShort: 'কপি হয়েছে',
      photoWord: '[ছবি]'
    }
  };

  var state = { lang: 'en', design: null, view: 'wide', sample: false };

  function t(key, vars) {
    var table = own(I18N, state.lang) ? I18N[state.lang] : I18N.en;
    var s = own(table, key) ? table[key] : own(I18N.en, key) ? I18N.en[key] : key;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) { return own(vars, name) ? vars[name] : m; });
  }
  function num(n) {
    try { return new Intl.NumberFormat(LANGS[state.lang].locale, { useGrouping: false }).format(n); } catch (e) { return String(n); }
  }
  function today() {
    try {
      return new Intl.DateTimeFormat(LANGS[state.lang].locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    } catch (e) {
      return new Date().toLocaleDateString();
    }
  }
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var mac = /Mac|iPhone|iPad/.test(navigator.platform || '');
  function keyHint(letter) { return coarse ? '' : ' (' + (mac ? '⌘' : 'Ctrl+') + letter + ')'; }

  var said = $('said');
  var say = function (key, vars) {
    said.textContent = key ? t(key, vars) : t('sendHint');
    said.classList.toggle('is-idle', !key);
  };

  function forClipboard(html) {
    return '<meta charset="utf-8"><div style="margin:0;padding:8px 0;">' + html + '</div><div><br></div>';
  }

  function asDocument(html) {
    var lang = own(LANGS, state.lang) ? state.lang : 'en';
    return '<!doctype html>\n<html lang="' + lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>চিঠি</title>\n</head>\n<body style="margin:0;padding:24px 10px;background-color:#E3E7EB;">\n' + html + '\n</body>\n</html>\n';
  }

  // ===========================================================================
  // 2. Letters that ship with the page: the sample and the templates, per language.
  //    A letter is a list of lines: [text or runs, line format]. A run is [text, format].
  // ===========================================================================
  var MARKER = '#ffee8c';
  var PEN = '#c62f2f';
  var R = { align: 'right' };
  var C = { align: 'center' };

  function compose(lines) {
    var ops = [];
    lines.forEach(function (line) {
      var runs = Array.isArray(line[0]) ? line[0] : [[line[0]]];
      runs.forEach(function (run) {
        if (run[0] === '') return;
        ops.push(run[1] ? { insert: run[0], attributes: run[1] } : { insert: run[0] });
      });
      ops.push(line[1] ? { insert: '\n', attributes: line[1] } : { insert: '\n' });
    });
    return ops;
  }

  // A small painted "photograph" for the sample letter, so nothing is fetched.
  var samplePhotoUrl = '';
  function samplePhoto() {
    // Painting and encoding it takes a noticeable moment on a phone, so it is done once per visit.
    if (samplePhotoUrl) return samplePhotoUrl;
    var c = document.createElement('canvas');
    c.width = 880; c.height = 540;
    var x = c.getContext('2d');
    var sky = x.createLinearGradient(0, 0, 0, 330);
    sky.addColorStop(0, '#7fb2d9'); sky.addColorStop(0.7, '#f3c98f'); sky.addColorStop(1, '#f6a96b');
    x.fillStyle = sky; x.fillRect(0, 0, 880, 330);
    x.fillStyle = '#fbe9b0'; x.beginPath(); x.arc(640, 250, 54, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.85)';
    [[150, 90, 60], [215, 80, 44], [270, 98, 50], [520, 60, 40], [570, 70, 34]].forEach(function (p) { x.beginPath(); x.ellipse(p[0], p[1], p[2], p[2] * 0.42, 0, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#3f6b4c'; x.beginPath(); x.moveTo(0, 330); x.bezierCurveTo(200, 292, 420, 318, 880, 300); x.lineTo(880, 340); x.lineTo(0, 340); x.fill();
    var river = x.createLinearGradient(0, 330, 0, 540);
    river.addColorStop(0, '#e9a877'); river.addColorStop(0.35, '#7d9fb8'); river.addColorStop(1, '#3d6485');
    x.fillStyle = river; x.fillRect(0, 332, 880, 208);
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2;
    for (var i = 0; i < 9; i++) { x.beginPath(); x.moveTo(60 + i * 95, 380 + (i % 3) * 44); x.lineTo(130 + i * 95, 380 + (i % 3) * 44); x.stroke(); }
    x.fillStyle = '#2b2622'; x.beginPath(); x.moveTo(300, 420); x.quadraticCurveTo(410, 462, 540, 420); x.lineTo(520, 440); x.quadraticCurveTo(410, 470, 322, 440); x.fill();
    x.strokeStyle = '#2b2622'; x.lineWidth = 4; x.beginPath(); x.moveTo(420, 430); x.lineTo(420, 300); x.stroke();
    x.fillStyle = '#f4ead2'; x.beginPath(); x.moveTo(424, 304); x.quadraticCurveTo(510, 350, 424, 418); x.fill();
    x.strokeStyle = '#f7f3e6'; x.lineWidth = 3;
    for (var k = 0; k < 14; k++) { var bx = 20 + k * 22; x.beginPath(); x.moveTo(bx, 540); x.quadraticCurveTo(bx + 6, 470, bx + 22 + (k % 4) * 4, 430 + (k % 3) * 16); x.stroke(); }
    samplePhotoUrl = c.toDataURL('image/jpeg', 0.86);
    return samplePhotoUrl;
  }

  var LETTERS = {
    en: {
      sample: function () {
        return [
          ['Dhaka, ' + today(), R],
          ['Dear Ma,'],
          [[['How are you? It has been far too long since I wrote you a proper letter. '], ['Autumn skies', { bold: true }], [' have arrived here, and '], ['from the roof you can watch white clouds drift past', { background: MARKER }], ['. Last Friday I went down to the river and took a photograph for you.']]],
          [[[{ image: samplePhoto() }, { width: '75%', alt: t('photo') }]]],
          ['When I was small you always used to say:'],
          ['Look after a thing and it turns to treasure.', { blockquote: true }],
          ['What I am bringing when I come home:'],
          ['A shawl for you', { list: 'ordered' }],
          ['A case for Baba’s glasses', { list: 'ordered' }],
          ['A storybook for Choton', { list: 'ordered' }],
          [[['P.S. Keep some coconut naru ready for me!', { color: PEN }]]],
          [''],
          ['Yours always,', R],
          ['Khoka', R]
        ];
      },
      personal: function () {
        return [
          [today(), R],
          ['Dear …,'],
          ['It has been a while since I last wrote, and there is a lot to tell you.'],
          [''],
          ['Write soon and tell me how everyone is.'],
          [''],
          ['With love,', R],
          ['…', R]
        ];
      },
      thanks: function () {
        return [
          [today(), R],
          ['Dear …,'],
          ['Thank you for …. It meant a great deal to me, and I wanted to say so properly.'],
          [''],
          ['I hope to return the kindness soon.'],
          [''],
          ['Gratefully,', R],
          ['…', R]
        ];
      },
      invite: function () {
        return [
          ['You are invited', { header: 1, align: 'center' }],
          ['to …', C],
          ['• • •', C],
          [[['Date: ', { bold: true }], ['…']], C],
          [[['Time: ', { bold: true }], ['…']], C],
          [[['Place: ', { bold: true }], ['…']], C],
          [''],
          ['Please let us know by … whether you can come.', C],
          [''],
          ['With warm regards,', R],
          ['…', R]
        ];
      },
      formal: function () {
        return [
          [today()],
          [''],
          ['To'],
          ['The Head Teacher'],
          ['… School'],
          [''],
          [[['Subject: Application for …', { bold: true }]]],
          [''],
          ['Dear Sir or Madam,'],
          ['With due respect, I would like to state that …'],
          [''],
          ['I therefore request that you kindly …'],
          [''],
          ['Yours faithfully,'],
          ['…']
        ];
      }
    },
    bn: {
      sample: function () {
        return [
          ['ঢাকা, ' + today(), R],
          ['প্রিয় মা,'],
          [[['কেমন আছ? অনেক দিন তোমাকে চিঠি লেখা হয় না। এখানে '], ['শরতের আকাশ', { bold: true }], [' দেখা দিয়েছে, '], ['ছাদ থেকে সাদা মেঘের ভেলা দেখা যায়', { background: MARKER }], ['। গত শুক্রবার নদীর ধারে গিয়েছিলাম, তোমার জন্য একটা ছবি তুলে এনেছি।']]],
          [[[{ image: samplePhoto() }, { width: '75%', alt: t('photo') }]]],
          ['ছোটবেলায় তুমি সব সময় বলতে:'],
          ['যত্ন করলে রত্ন মেলে।', { blockquote: true }],
          ['বাড়ি আসার সময় যা যা আনব:'],
          ['তোমার জন্য একটা শাল', { list: 'ordered' }],
          ['বাবার চশমার খাপ', { list: 'ordered' }],
          ['ছোটনের গল্পের বই', { list: 'ordered' }],
          [[['পুনশ্চ: নারকেলের নাড়ু বানিয়ে রেখো!', { color: PEN }]]],
          [''],
          ['ইতি,', R],
          ['তোমার খোকা', R]
        ];
      },
      personal: function () {
        return [
          [today(), R],
          ['প্রিয় …,'],
          ['আশা করি ভালো আছ। অনেক দিন তোমার কোনো খবর পাই না, তাই লিখতে বসলাম।'],
          [''],
          ['চিঠির উত্তর দিও। বাড়ির সবাইকে আমার ভালোবাসা জানিও।'],
          [''],
          ['ইতি,', R],
          ['তোমার …', R]
        ];
      },
      thanks: function () {
        return [
          [today(), R],
          ['প্রিয় …,'],
          ['… জন্য তোমাকে অনেক ধন্যবাদ। এটা আমার কাছে অনেক বড় পাওয়া, তাই চিঠি লিখে জানাতে ইচ্ছে হলো।'],
          [''],
          ['খুব শিগগিরই দেখা হবে, আশা করি।'],
          [''],
          ['কৃতজ্ঞতাসহ,', R],
          ['…', R]
        ];
      },
      invite: function () {
        return [
          ['নিমন্ত্রণ', { header: 1, align: 'center' }],
          ['… উপলক্ষে আপনাকে সাদর আমন্ত্রণ।', C],
          ['• • •', C],
          [[['তারিখ: ', { bold: true }], ['…']], C],
          [[['সময়: ', { bold: true }], ['…']], C],
          [[['স্থান: ', { bold: true }], ['…']], C],
          [''],
          ['আপনার উপস্থিতি আমাদের আনন্দ বাড়িয়ে দেবে।', C],
          [''],
          ['বিনীত,', R],
          ['…', R]
        ];
      },
      formal: function () {
        return [
          ['তারিখ: ' + today()],
          [''],
          ['বরাবর'],
          ['প্রধান শিক্ষক'],
          ['… বিদ্যালয়'],
          [''],
          [[['বিষয়: … জন্য আবেদন।', { bold: true }]]],
          [''],
          ['জনাব,'],
          ['সবিনয় নিবেদন এই যে, …'],
          [''],
          ['অতএব, মহোদয়ের নিকট আকুল আবেদন, …'],
          [''],
          ['বিনীত নিবেদক,'],
          ['…']
        ];
      }
    }
  };
  var STARTERS = ['personal', 'thanks', 'invite', 'formal'];

  function letterFor(kind) {
    var set = own(LETTERS, state.lang) ? LETTERS[state.lang] : LETTERS.en;
    return compose((own(set, kind) ? set[kind] : set.sample)());
  }

  // ===========================================================================
  // 3. The editor
  // ===========================================================================
  if (!window.Quill) {
    $('editor').textContent = I18N.en.loadFail + ' / ' + I18N.bn.loadFail;
    return;
  }

  var built = { html: '', text: '', pages: 1 };
  var MAX_PHOTOS = 12;
  var MAX_DRAFT = 40 * 1024 * 1024; // twelve photos at the size they are kept come to a few MB

  // A page break is a line of its own in the editor.
  var BlockEmbed = window.Quill.import('blots/block/embed');
  function PageBreak() { return Reflect.construct(BlockEmbed, arguments, PageBreak); }
  PageBreak.prototype = Object.create(BlockEmbed.prototype);
  PageBreak.prototype.constructor = PageBreak;
  Object.setPrototypeOf(PageBreak, BlockEmbed);
  PageBreak.blotName = 'pagebreak';
  PageBreak.tagName = 'div';
  PageBreak.className = 'page-break';
  PageBreak.create = function () {
    var node = BlockEmbed.create.call(this);
    node.setAttribute('contenteditable', 'false');
    return node;
  };
  PageBreak.value = function () { return true; };
  window.Quill.register(PageBreak, true);

  var quill = new window.Quill('#editor', {
    formats: ['bold', 'italic', 'underline', 'strike', 'background', 'color', 'link', 'header', 'blockquote', 'list', 'align', 'image', 'pagebreak'],
    placeholder: '',
    modules: {
      toolbar: false,
      history: { delay: 600, maxStack: 200, userOnly: true },
      uploader: {
        mimetypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        handler: function (range, files) { addPhotos(files, range ? range.index : quill.getLength()); }
      }
    }
  });
  quill.root.setAttribute('spellcheck', 'false');

  // ---- Draft kept in this browser only
  var photosDropped = false;
  function save() {
    var draft = { ops: quill.getContents().ops, design: state.design, lang: state.lang, sample: state.sample };
    try {
      localStorage.setItem(STORE, JSON.stringify(draft));
      photosDropped = false;
    } catch (e) {
      // Photos can outgrow the few MB a browser keeps; keep the words rather than an older draft.
      draft.ops = draft.ops.filter(function (op) { return !(op.insert && typeof op.insert === 'object' && op.insert.image); });
      try {
        localStorage.setItem(STORE, JSON.stringify(draft));
        if (!photosDropped) say('photosNotKept');
        photosDropped = true;
      } catch (e2) { /* storage unavailable: the draft just is not kept */ }
    }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (saved && Array.isArray(saved.ops)) return saved;
    } catch (e) { /* damaged draft */ }
    return null;
  }

  // A draft saved by an earlier version named its paper and ink; turn those into a design.
  function designFrom(saved) {
    if (saved && saved.design && typeof saved.design === 'object') return normDesign(saved.design);
    var d = normDesign(null);
    if (!saved) return d;
    var old = typeof saved.paper === 'string' && own(PRESETS, saved.paper) ? PRESETS[saved.paper] : null;
    if (old) PRESET_KEYS.forEach(function (key) { d[key] = old[key]; });
    var inks = { neel: '#1F2F7A', kalo: '#23252B', sobuj: '#1D5B3F', beguni: '#4B2C82' };
    if (typeof saved.ink === 'string' && own(inks, saved.ink)) d.ink = inks[saved.ink];
    if (typeof saved.lettering === 'string' && own(LETTERINGS, saved.lettering)) d.lettering = saved.lettering;
    return d;
  }

  // ---- Preview
  // Page breaks need to know how tall each paragraph is, so they are measured off-screen
  // at the width of the writing column.
  function measure(htmlList, width) {
    var box = $('measure');
    box.style.width = width + 'px';
    box.innerHTML = htmlList.map(function (h) { return '<div>' + h + '</div>'; }).join('');
    var heights = Array.prototype.map.call(box.children, function (el) { return el.getBoundingClientRect().height; });
    box.innerHTML = '';
    return heights;
  }
  // A photo's height/width, learnt once it has loaded. Until then pages are laid out with a guess,
  // and the letter gives the photo no height (exactRatio is 0), so a guess never stretches it.
  var ratios = {};
  function exactRatio(src) {
    var key = src.length + ':' + src.slice(-48);
    if (own(ratios, key)) return ratios[key];
    ratios[key] = 0;
    var img = new Image();
    img.onload = function () {
      if (img.naturalWidth) { ratios[key] = img.naturalHeight / img.naturalWidth; renderSoon(); }
    };
    img.src = src;
    return 0;
  }
  function photoRatio(src) { return exactRatio(src) || 0.62; }

  var timer = 0;
  function render() {
    built = buildLetter(quill.getContents().ops, state.design, { photoWord: t('photoWord'), measure: measure, ratio: photoRatio, exactRatio: exactRatio });
    $('letter').innerHTML = built.html;
    countWords();
  }
  function renderSoon() {
    clearTimeout(timer);
    timer = setTimeout(function () { render(); save(); }, 140);
  }

  function countWords() {
    var words = quill.getText().trim().split(/\s+/).filter(function (w) { return /[^\s•….,;:!?।-]/.test(w); }).length;
    var facts = t(words === 1 ? 'words_one' : 'words', { n: num(words) });
    if (built.pages > 1) facts += ' · ' + t('pages', { n: num(built.pages) });
    $('word-count').textContent = facts;
  }

  function setSample(on) {
    state.sample = on;
    $('sample-note').hidden = !on;
  }

  // ---- Toolbar state
  function refreshTools() {
    var range = quill.getSelection();
    var f = range ? quill.getFormat(range) : {};
    document.querySelectorAll('[data-inline]').forEach(function (b) { b.setAttribute('aria-pressed', f[b.dataset.inline] ? 'true' : 'false'); });
    document.querySelectorAll('[data-block]').forEach(function (b) {
      var current = f[b.dataset.block];
      var want = b.dataset.value;
      var on = b.dataset.block === 'align' ? (current || '') === want : String(current === undefined ? '' : current) === want;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('tool-link').setAttribute('aria-pressed', f.link ? 'true' : 'false');
  }

  document.querySelectorAll('[data-inline]').forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.dataset.inline;
      var range = quill.getSelection(true);
      var on = Boolean(quill.getFormat(range)[name]);
      var value = name === 'background' ? MARKER : name === 'color' ? PEN : true;
      quill.format(name, on ? false : value, 'user');
      refreshTools();
    });
  });

  document.querySelectorAll('[data-block]').forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.dataset.block;
      var raw = button.dataset.value;
      var range = quill.getSelection(true);
      var current = quill.getFormat(range)[name];
      var value = name === 'header' ? Number(raw) : name === 'blockquote' ? true : raw || false;
      var same = name === 'align' ? (current || false) === value : current === value;
      quill.format(name, same && name !== 'align' ? false : value, 'user');
      refreshTools();
    });
  });

  $('tool-undo').addEventListener('click', function () { quill.history.undo(); quill.focus(); });
  $('tool-redo').addEventListener('click', function () { quill.history.redo(); quill.focus(); });

  // ---- Parts of a letter: each goes on a line of its own
  function insertLine(text, align) {
    var range = quill.getSelection(true);
    var found = quill.getLine(range.index);
    var line = found[0];
    var start = range.index - found[1];
    var at = start;
    if (line && line.length() > 1) {
      at = start + line.length();
      quill.insertText(at, text, 'user');
      quill.insertText(at + text.length, '\n', 'user');
    } else {
      quill.insertText(at, text, 'user');
    }
    quill.formatText(at, text.length, { bold: false, italic: false, underline: false, strike: false, color: false, background: false, link: false }, 'user');
    quill.formatLine(at, 1, { header: false, blockquote: false, list: false, align: align }, 'user');
    quill.setSelection(at + text.length, 0, 'user');
  }
  $('tool-date').addEventListener('click', function () { insertLine(today(), 'right'); });
  $('tool-greeting').addEventListener('click', function () { insertLine(t('greetingText'), false); });
  $('tool-signoff').addEventListener('click', function () { insertLine(t('signoff1'), 'right'); insertLine(t('signoff2'), 'right'); });
  $('tool-ps').addEventListener('click', function () { insertLine(t('psText'), false); });
  $('tool-rule').addEventListener('click', function () { insertLine('• • •', 'center'); });
  $('tool-page').addEventListener('click', function () {
    var range = quill.getSelection(true);
    var found = quill.getLine(range.index);
    var start = range.index - found[1];
    var at = found[0] && found[0].length() > 1 ? start + found[0].length() : start;
    quill.insertEmbed(at, 'pagebreak', true, 'user');
    quill.setSelection(at + 1, 0, 'user');
  });

  // ---- Templates
  var pendingStarter = '';
  function isBlank() {
    return quill.getText().trim() === '' && quill.getContents().ops.every(function (op) { return typeof op.insert === 'string'; });
  }
  function useStarter(kind) {
    quill.history.cutoff();
    quill.setContents(letterFor(kind), 'user');
    quill.history.cutoff();
    setSample(false);
    $('starter-strip').hidden = true;
    pendingStarter = '';
    quill.setSelection(0, 0, 'silent');
    quill.focus();
  }
  $('starter').addEventListener('change', function (e) {
    var kind = e.target.value;
    e.target.value = '';
    if (STARTERS.indexOf(kind) < 0) return;
    if (state.sample || isBlank()) { useStarter(kind); return; }
    pendingStarter = kind;
    $('open-strip').hidden = true;
    $('link-strip').hidden = true;
    $('photo-strip').hidden = true;
    $('starter-strip').hidden = false;
    $('starter-yes').focus();
  });
  $('starter-yes').addEventListener('click', function () { if (pendingStarter) useStarter(pendingStarter); });
  $('starter-no').addEventListener('click', function () { pendingStarter = ''; $('starter-strip').hidden = true; quill.focus(); });

  // ---- Links
  var linkRange = null;
  $('tool-link').addEventListener('click', function () {
    var range = quill.getSelection(true);
    var current = quill.getFormat(range).link;
    if (!current && range.length === 0) {
      say('needSelection');
      return;
    }
    linkRange = range;
    $('link-url').value = typeof current === 'string' ? current : '';
    $('link-remove').hidden = !current;
    $('photo-strip').hidden = true;
    $('starter-strip').hidden = true;
    $('open-strip').hidden = true;
    $('link-strip').hidden = false;
    $('link-url').focus();
  });
  function closeLink() {
    $('link-strip').hidden = true;
    if (linkRange) quill.setSelection(linkRange.index, linkRange.length, 'silent');
    linkRange = null;
  }
  function applyLink() {
    var typed = $('link-url').value.trim();
    var href = safeLink(/^[a-z][a-z0-9+.-]*:/i.test(typed) ? typed : 'https://' + typed);
    if (!typed || !href || !linkRange) {
      say('badLink');
      return;
    }
    var range = linkRange;
    if (range.length === 0) {
      // Cursor inside an existing link: widen to the whole link.
      var leaf = quill.getLeaf(range.index)[0];
      var blot = leaf && leaf.parent;
      while (blot && blot.statics && blot.statics.blotName !== 'link' && blot.parent) blot = blot.parent;
      if (blot && blot.statics && blot.statics.blotName === 'link') range = { index: quill.getIndex(blot), length: blot.length() };
    }
    quill.formatText(range.index, range.length, 'link', href, 'user');
    say('');
    closeLink();
  }
  $('link-save').addEventListener('click', applyLink);
  $('link-url').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
    if (e.key === 'Escape') closeLink();
  });
  $('link-cancel').addEventListener('click', closeLink);
  $('link-remove').addEventListener('click', function () {
    if (linkRange) {
      var range = linkRange;
      if (range.length === 0) {
        var found = quill.getLine(range.index);
        range = { index: range.index - found[1], length: found[0] ? found[0].length() : 0 };
      }
      quill.formatText(range.index, range.length, 'link', false, 'user');
    }
    closeLink();
  });

  // ---- Photos: shrunk and re-encoded in the browser (this also drops location data).
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 1100 / img.naturalWidth);
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * scale));
        c.height = Math.max(1, Math.round(img.naturalHeight * scale));
        var x = c.getContext('2d');
        x.fillStyle = '#ffffff';
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }

  function photoCount() {
    return quill.getContents().ops.filter(function (op) { return op.insert && typeof op.insert === 'object' && typeof op.insert.image === 'string'; }).length;
  }

  function addPhotos(fileList, index) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return /^image\/(png|jpeg|gif|webp)$/.test(f.type); });
    if (!files.length) { say('notImage'); return; }
    var room = MAX_PHOTOS - photoCount();
    if (room <= 0) { say('tooMany', { n: num(MAX_PHOTOS) }); return; }
    var at = index;
    files.slice(0, room).reduce(function (chain, file) {
      return chain.then(function () {
        if (file.size > 25 * 1024 * 1024) throw new Error('large');
        return shrink(file);
      }).then(function (dataUrl) {
        var found = quill.getLine(at);
        if (found[0] && found[1] > 0) { quill.insertText(at, '\n', 'user'); at += 1; }
        quill.insertEmbed(at, 'image', dataUrl, 'user');
        // Named for screen readers in the writing pad; the letter itself marks photos as decorative.
        quill.formatText(at, 1, 'alt', t('photo'), 'user');
        quill.insertText(at + 1, '\n', 'user');
        at += 2;
        quill.setSelection(at, 0, 'silent');
        say('');
      }).catch(function (err) {
        say(err && err.message === 'large' ? 'tooLarge' : 'unreadable');
      });
    }, Promise.resolve());
  }

  $('tool-photo').addEventListener('click', function () { $('photo-input').click(); });
  $('photo-input').addEventListener('change', function (e) {
    var range = quill.getSelection(true);
    addPhotos(e.target.files, range ? range.index : quill.getLength());
    e.target.value = '';
  });

  var photoAt = -1;
  function showPhotoStrip(index) {
    photoAt = index;
    var width = quill.getFormat(index, 1).width || '100%';
    document.querySelectorAll('[data-photo-size]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.photoSize === width ? 'true' : 'false'); });
    $('link-strip').hidden = true;
    $('starter-strip').hidden = true;
    $('open-strip').hidden = true;
    $('photo-strip').hidden = false;
  }
  quill.root.addEventListener('click', function (e) {
    if (e.target && e.target.tagName === 'IMG') {
      var blot = window.Quill.find(e.target);
      if (blot) {
        var index = quill.getIndex(blot);
        quill.setSelection(index, 1, 'silent');
        showPhotoStrip(index);
      }
    } else {
      $('photo-strip').hidden = true;
    }
  });
  document.querySelectorAll('[data-photo-size]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (photoAt < 0) return;
      quill.formatText(photoAt, 1, 'width', button.dataset.photoSize, 'user');
      showPhotoStrip(photoAt);
    });
  });
  $('photo-remove').addEventListener('click', function () {
    if (photoAt >= 0) quill.deleteText(photoAt, 1, 'user');
    photoAt = -1;
    $('photo-strip').hidden = true;
  });

  // ---- Stationery: ready-made papers, and a panel to change every part of the design
  var PRESET_ORDER = ['khata', 'holud', 'neel', 'golapi', 'graph', 'airmail', 'plain', 'kraft', 'raat'];

  // Draws a small picture of a design on a button.
  function paintChip(el, p) {
    var s = el.style;
    s.backgroundColor = p.paper;
    s.backgroundImage = 'none';
    s.border = '1px solid ' + mix(p.paper, isDark(p.paper) ? '#FFFFFF' : '#5F6B7A', 0.35);
    if (p.pattern === 'lines') {
      s.backgroundImage = 'linear-gradient(transparent 7px, ' + p.line + ' 7px)';
      s.backgroundSize = '100% 8px';
    } else if (p.pattern === 'grid') {
      s.backgroundImage = 'linear-gradient(transparent 5px, ' + p.line + ' 5px), linear-gradient(to right, transparent 5px, ' + p.line + ' 5px)';
      s.backgroundSize = '6px 6px';
    }
    if (p.margin !== 'none') s.borderLeft = (p.margin === 'double' ? '5px double ' : '4px solid ') + p.marginColor;
    if (p.margin === 'both') s.borderRight = '4px solid ' + p.marginColor;
    if (p.edge === 'bar') s.borderTop = '4px solid ' + (p.ink || '#1F2F7A');
    if (p.edge === 'airmail') {
      s.border = '4px dashed ' + AIR_BLUE;
      s.background = 'linear-gradient(' + p.paper + ',' + p.paper + ') padding-box, ' + AIR_RED + ' border-box';
    }
  }

  function button(className, data) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    Object.keys(data || {}).forEach(function (key) { b.dataset[key] = data[key]; });
    return b;
  }

  // Quick picks above the letter
  PRESET_ORDER.forEach(function (id) {
    var b = button('chip', { preset: id });
    paintChip(b, PRESETS[id]);
    $('papers').appendChild(b);
  });
  Object.keys(LANGS).forEach(function (id) {
    var b = button('seg-btn', { lang: id });
    b.lang = id;
    b.textContent = LANGS[id].name;
    $('langs').appendChild(b);
  });

  // The stationery panel, built from this list. `seg` rows are choices; `colors` rows are swatches.
  var CONTROLS = [
    { title: 'd_paper', rows: [
      { name: 'd_color', key: 'paper', colors: PAPER_COLORS }
    ] },
    { title: 'd_pattern', rows: [
      { name: 'd_kind', key: 'pattern', seg: [['none', 'none'], ['lines', 'p_lines'], ['grid', 'p_grid']] },
      { name: 'd_color', key: 'line', colors: LINE_COLORS, auto: true, when: function (d) { return d.pattern !== 'none'; } },
      { name: 'd_spacing', key: 'spacing', seg: [['28', 'sp_tight'], ['32', 'medium'], ['38', 'sp_loose']] }
    ] },
    { title: 'd_margin', rows: [
      { name: 'd_kind', key: 'margin', seg: [['none', 'none'], ['single', 'm_single'], ['double', 'm_double'], ['both', 'm_both']] },
      { name: 'd_color', key: 'marginColor', colors: MARGIN_COLORS, when: function (d) { return d.margin !== 'none'; } }
    ] },
    { title: 'd_edge', rows: [
      { name: 'd_kind', key: 'edge', seg: [['none', 'none'], ['thin', 'e_thin'], ['pad', 'e_pad'], ['bar', 'e_bar'], ['airmail', 'paper_airmail']] }
    ] },
    { title: 'd_ink', rows: [
      { name: 'd_color', key: 'ink', colors: INK_COLORS }
    ], note: 'lowContrast', noteWhen: function (d) { return contrast(d.ink, d.paper) < 3; } },
    { title: 'lettering', rows: [
      { name: 'd_kind', key: 'lettering', seg: [['book', 'l_book'], ['type', 'l_type'], ['hand', 'l_hand']] },
      { name: 'd_size', key: 'textSize', seg: [['small', 'small'], ['normal', 'medium'], ['large', 'large']] }
    ], note: 'handHint', noteWhen: function (d) { return d.lettering === 'hand'; } },
    { title: 'd_width', rows: [
      { name: 'd_kind', key: 'width', seg: [['letter', 'w_letter'], ['wide', 'w_wide'], ['full', 'w_full']] }
    ], note: 'widthNote', noteWhen: function (d) { return d.width === 'full'; } },
    { title: 'd_pages', rows: [
      { name: 'd_kind', key: 'pages', seg: [['off', 'pg_off'], ['auto', 'pg_auto']] },
      { name: 'd_pageSize', key: 'pageSize', seg: [['short', 'ps_short'], ['medium', 'medium'], ['long', 'ps_long']] },
      { name: 'd_pageNo', key: 'pageNumbers', seg: [['true', 'show'], ['false', 'hide']] }
    ], note: 'pagesNote', noteWhen: function () { return true; } }
  ];
  var conditional = [];

  function el(tag, className, tKey) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (tKey) node.dataset.t = tKey;
    return node;
  }

  (function buildPanel() {
    var panel = $('design');
    var first = el('section', 'set');
    first.appendChild(el('h2', 'set-title', 'd_presets'));
    var grid = el('div', 'presets');
    PRESET_ORDER.forEach(function (id) {
      var b = button('preset', { preset: id });
      var chip = el('span', 'chip');
      paintChip(chip, PRESETS[id]);
      b.appendChild(chip);
      b.appendChild(el('span', '', 'paper_' + id));
      grid.appendChild(b);
    });
    first.appendChild(grid);
    panel.appendChild(first);

    CONTROLS.forEach(function (group) {
      var set = el('section', 'set');
      set.appendChild(el('h2', 'set-title', group.title));
      group.rows.forEach(function (rowDef) {
        var name = el('span', 'set-name', rowDef.name);
        var ctl = el('div', 'set-ctl');
        ctl.setAttribute('role', 'group');
        if (rowDef.seg) {
          var seg = el('div', 'seg');
          rowDef.seg.forEach(function (pair) {
            var b = button('seg-btn', { key: rowDef.key, val: pair[0] });
            b.dataset.t = pair[1];
            seg.appendChild(b);
          });
          ctl.appendChild(seg);
        } else {
          if (rowDef.auto) {
            var auto = button('btn', { key: rowDef.key, val: 'auto' });
            auto.dataset.t = 'auto';
            ctl.appendChild(auto);
          }
          rowDef.colors.forEach(function (color) {
            var b = button('sw', { key: rowDef.key, val: color.c });
            b.style.backgroundColor = color.c;
            b.dataset.en = color.en;
            b.dataset.bn = color.bn;
            ctl.appendChild(b);
          });
          var own_ = el('label', 'sw sw-own');
          own_.dataset.own = rowDef.key;
          own_.dataset.tip = 'ownColor';
          var input = document.createElement('input');
          input.type = 'color';
          input.id = 'own-' + rowDef.key;
          input.dataset.color = rowDef.key;
          own_.appendChild(input);
          ctl.appendChild(own_);
        }
        set.appendChild(name);
        set.appendChild(ctl);
        if (rowDef.when) conditional.push({ when: rowDef.when, nodes: [name, ctl] });
      });
      if (group.note) {
        var note = el('p', 'set-note', group.note);
        set.appendChild(note);
        conditional.push({ when: group.noteWhen, nodes: [note] });
      }
      panel.appendChild(set);
    });
  })();

  function matchPreset(d) {
    for (var i = 0; i < PRESET_ORDER.length; i++) {
      var p = PRESETS[PRESET_ORDER[i]];
      var same = PRESET_KEYS.every(function (key) { return p[key] === d[key]; });
      if (same) return PRESET_ORDER[i];
    }
    return '';
  }

  function frameWidth() {
    if (state.view === 'phone') return 340;
    return WIDTHS[state.design.width] || 0;
  }

  function showOptions() {
    var d = state.design;
    var preset = matchPreset(d);
    document.querySelectorAll('[data-preset]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.preset === preset ? 'true' : 'false'); });
    document.querySelectorAll('[data-key]').forEach(function (b) {
      var isLine = b.dataset.key === 'line';
      var on = isLine && b.dataset.val === 'auto' ? d.lineAuto : String(d[b.dataset.key]) === b.dataset.val && !(isLine && d.lineAuto);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // The "your own colour" swatch lights up when the colour in use is not one of the listed ones.
    document.querySelectorAll('[data-own]').forEach(function (label) {
      var key = label.dataset.own;
      var listed = Boolean(document.querySelector('.sw[data-key="' + key + '"][data-val="' + d[key] + '"]')) || (key === 'line' && d.lineAuto);
      label.classList.toggle('is-set', !listed);
      label.style.setProperty('--own', d[key]);
      label.firstChild.value = d[key].toLowerCase();
    });
    conditional.forEach(function (c) {
      var show = c.when(d);
      c.nodes.forEach(function (node) { node.hidden = !show; });
    });
    press('[data-view]', 'view', state.view);
    press('[data-lang]', 'lang', state.lang);
    var low = contrast(d.ink, d.paper) < 3;
    $('design-hint').hidden = !low;
    $('design-hint').textContent = low ? t('lowContrast') : '';
    var w = frameWidth();
    $('frame').style.maxWidth = w ? w + 'px' : 'none';
  }
  function press(selector, key, value) {
    document.querySelectorAll(selector).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset[key] === value ? 'true' : 'false'); });
  }

  function setDesign(key, raw) {
    var d = state.design;
    var next = {};
    Object.keys(d).forEach(function (k) { next[k] = d[k]; });
    if (key === 'line' && raw === 'auto') {
      next.lineAuto = true;
      next.line = autoRule(next.paper);
    } else if (key === 'pageNumbers') {
      next.pageNumbers = raw === 'true';
    } else {
      next[key] = raw;
      if (key === 'line') next.lineAuto = false;
      if (key === 'paper' && next.lineAuto) next.line = autoRule(hex(raw, d.paper));
    }
    state.design = normDesign(next);
    afterDesign();
  }

  function usePreset(id) {
    if (!own(PRESETS, id)) return;
    var p = PRESETS[id];
    var next = {};
    Object.keys(state.design).forEach(function (k) { next[k] = state.design[k]; });
    PRESET_KEYS.forEach(function (key) { next[key] = p[key]; });
    next.lineAuto = false;
    // A paper that comes with its own ink brings it; otherwise keep the ink unless it would vanish on the new paper.
    if (p.ink) next.ink = p.ink;
    else if (contrast(next.ink, next.paper) < 3) next.ink = DESIGN0.ink;
    state.design = normDesign(next);
    afterDesign();
  }

  function afterDesign() {
    showOptions();
    clearTimeout(timer);
    render();
    save();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-preset],[data-key],[data-view]') : null;
    if (!b) return;
    if (b.dataset.preset) { usePreset(b.dataset.preset); return; }
    if (b.dataset.key) { setDesign(b.dataset.key, b.dataset.val); return; }
    state.view = b.dataset.view === 'phone' ? 'phone' : 'wide';
    showOptions();
  });
  $('design').addEventListener('input', function (e) {
    var key = e.target && e.target.dataset ? e.target.dataset.color : '';
    if (key) setDesign(key, e.target.value);
  });

  // ---- Language
  function applyLang() {
    var L = LANGS[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.style.setProperty('--write', L.write);
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-tip]').forEach(function (el) { var s = t(el.dataset.tip); el.title = s + (el.dataset.key ? keyHint(el.dataset.key) : ''); el.setAttribute('aria-label', s); });
    document.querySelectorAll('[data-title]').forEach(function (el) { el.title = t(el.dataset.title); });
    document.querySelectorAll('[data-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.aria)); });
    document.querySelectorAll('[data-alt]').forEach(function (el) { el.alt = t(el.dataset.alt); });
    document.querySelectorAll('[data-glyph]').forEach(function (el) { el.textContent = L.glyphs[el.dataset.glyph]; });
    document.querySelectorAll('.chip[data-preset]').forEach(function (b) { var s = t('paper_' + b.dataset.preset); b.title = s; b.setAttribute('aria-label', s); });
    document.querySelectorAll('[data-en]').forEach(function (b) { var s = own(b.dataset, state.lang) ? b.dataset[state.lang] : b.dataset.en; b.title = s; b.setAttribute('aria-label', s); });
    document.documentElement.style.setProperty('--break-label', JSON.stringify(t('pageBreak')));
    $('mark-latin').hidden = !t('markLatin');
    quill.root.dataset.placeholder = t('placeholder');
    quill.root.setAttribute('aria-label', t('editorLabel'));

    var select = $('starter');
    select.textContent = '';
    var first = document.createElement('option');
    first.value = '';
    first.textContent = t('starterPick');
    select.appendChild(first);
    STARTERS.forEach(function (kind) {
      var o = document.createElement('option');
      o.value = kind;
      o.textContent = t('s_' + kind);
      select.appendChild(o);
    });

    say('');
    showOptions();
    countWords();
    $('copy-label').textContent = t('copy');
  }
  $('langs').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-lang]') : null;
    if (!b || !own(LANGS, b.dataset.lang) || b.dataset.lang === state.lang) return;
    state.lang = b.dataset.lang;
    if (state.sample) {
      // An untouched sample follows the language; a letter you have written is never changed.
      quill.setContents(letterFor('sample'), 'silent');
      quill.history.clear();
    }
    applyLang();
    render();
    save();
  });

  // ---- Tabs. On a computer the left pane switches between writing and stationery while the
  //      letter stays in view; on a phone there are three tabs.
  function showTab(which) {
    var tab = which === 'design' || which === 'letter' ? which : 'write';
    document.querySelector('.work').dataset.tab = tab;
    ['write', 'design', 'letter'].forEach(function (name) {
      $('tab-' + name).setAttribute('aria-selected', name === tab ? 'true' : 'false');
    });
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', (b.dataset.mode === 'design') === (tab === 'design') ? 'true' : 'false');
    });
    $('customize').setAttribute('aria-pressed', tab === 'design' ? 'true' : 'false');
    clearTimeout(timer);
    render();
  }
  ['write', 'design', 'letter'].forEach(function (name) {
    $('tab-' + name).addEventListener('click', function () { showTab(name); });
  });
  document.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.mode); });
  });
  $('customize').addEventListener('click', function () {
    showTab(document.querySelector('.work').dataset.tab === 'design' ? 'write' : 'design');
  });

  // ---- New letter (confirmed in the page; no browser dialogs)
  function askFresh(asking) {
    $('fresh-ask').hidden = asking;
    $('fresh-confirm').hidden = !asking;
  }
  $('fresh-ask').addEventListener('click', function () {
    if (isBlank()) { quill.focus(); return; }
    askFresh(true);
    $('fresh-yes').focus();
  });
  $('fresh-no').addEventListener('click', function () { askFresh(false); });
  $('fresh-yes').addEventListener('click', function () {
    quill.history.cutoff();
    quill.setContents([{ insert: '\n' }], 'user');
    quill.history.cutoff();
    setSample(false);
    askFresh(false);
    quill.focus();
  });

  // ===========================================================================
  // 4. Getting the letter out
  // ===========================================================================
  function selectNode(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Older route: answer the browser's own "copy" event with our HTML.
  function copyByEvent(html, text) {
    var done = false;
    var onCopy = function (e) {
      if (!e.clipboardData) return;
      e.clipboardData.setData('text/html', html);
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
      e.stopImmediatePropagation();
      done = true;
    };
    document.addEventListener('copy', onCopy, true);
    try {
      selectNode($('letter'));
      document.execCommand('copy');
    } catch (e) { /* not allowed here */ }
    document.removeEventListener('copy', onCopy, true);
    return done;
  }

  function copyRich(html, text) {
    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      var item = new window.ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      });
      return navigator.clipboard.write([item]).then(function () { return true; }, function () { return copyByEvent(html, text); });
    }
    return Promise.resolve(copyByEvent(html, text));
  }

  var doneTimer = 0;
  $('copy').addEventListener('click', function () {
    clearTimeout(timer);
    render();
    copyRich(forClipboard(built.html), built.text).then(function (ok) {
      if (ok) {
        window.getSelection().removeAllRanges();
        say('copied', { key: keyHint('V') });
        $('copy').classList.add('is-done');
        $('copy-label').textContent = t('copiedShort');
        clearTimeout(doneTimer);
        doneTimer = setTimeout(function () {
          $('copy').classList.remove('is-done');
          $('copy-label').textContent = t('copy');
        }, 2400);
      } else {
        selectNode($('letter'));
        say('selected', { key: keyHint('C') });
      }
    });
  });

  function copyPlain(text, field, note) {
    var fallback = function () {
      field.focus();
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* not allowed here */ }
      note.textContent = ok ? t('codeCopied') : t('codeSelected', { key: keyHint('C') });
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { note.textContent = t('codeCopied'); }, fallback);
    } else {
      fallback();
    }
  }

  $('as-code').addEventListener('click', function () {
    clearTimeout(timer);
    render();
    $('code').value = asDocument(built.html);
    $('code-said').textContent = '';
    $('code-veil').hidden = false;
    $('code-copy').focus();
  });
  $('code-copy').addEventListener('click', function () { copyPlain($('code').value, $('code'), $('code-said')); });
  $('code-close').addEventListener('click', function () { $('code-veil').hidden = true; $('as-code').focus(); });

  // ---- As a picture
  var shotBlob = null;
  var shotUrl = '';
  var saver = null; // set when the host page lets us hand over a file
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (ns) {
      if (ns) { saver = ns; $('image-save').hidden = false; $('save-ask').hidden = false; }
    }, function () { /* saving is not offered here */ });
  } else {
    // opened as an ordinary web page
    $('image-save').hidden = false;
    $('save-ask').hidden = false;
  }
  function saveFile(name, blob) {
    if (saver) return saver.save({ filename: name, data: blob });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    return Promise.resolve();
  }

  // The image maker is a large library that most visits never use, so it is fetched on the first click.
  var imageLib = null;
  function loadImageLib() {
    if (window.html2canvas) return Promise.resolve();
    if (!imageLib) {
      imageLib = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = '/vendor/html2canvas.min.js';
        s.onload = function () { if (window.html2canvas) resolve(); else reject(new Error('missing')); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
      imageLib.catch(function () { imageLib = null; });
    }
    return imageLib;
  }

  $('as-image').addEventListener('click', function () {
    clearTimeout(timer);
    render();
    say('making');
    var off = $('offstage');
    loadImageLib().then(function () {
      off.style.width = (WIDTHS[state.design.width] || WIDE_GUESS) + 'px';
      off.innerHTML = built.html;
      var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      ready.then(function () {
        return window.html2canvas(off, { scale: 2, backgroundColor: built.pages > 1 ? '#ffffff' : null, useCORS: true, logging: false });
      }).then(function (canvas) {
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) { if (blob) resolve(blob); else reject(new Error('empty')); }, 'image/png');
        });
      }).then(function (blob) {
        off.innerHTML = '';
        shotBlob = blob;
        if (shotUrl) URL.revokeObjectURL(shotUrl);
        shotUrl = URL.createObjectURL(blob);
        $('shot').src = shotUrl;
        $('image-said').textContent = '';
        $('image-veil').hidden = false;
        $('image-copy').focus();
        say('');
      }).catch(function () {
        off.innerHTML = '';
        say('imageFail');
      });
    }, function () { say('imageLib'); });
  });
  $('image-copy').addEventListener('click', function () {
    var note = $('image-said');
    var manual = function () { note.textContent = t('imageManual'); };
    if (shotBlob && navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      navigator.clipboard.write([new window.ClipboardItem({ 'image/png': shotBlob })]).then(function () {
        note.textContent = t('imageCopied');
      }, manual);
    } else {
      manual();
    }
  });
  $('image-save').addEventListener('click', function () {
    var note = $('image-said');
    if (!shotBlob) return;
    saveFile('chithi.png', shotBlob).then(function () {
      if (saver) note.textContent = t('imageSaved');
    }, function (err) {
      note.textContent = err && err.code === 'declined' ? '' : t('imageSaveFail');
    });
  });
  $('image-close').addEventListener('click', function () { $('image-veil').hidden = true; $('as-image').focus(); });

  // ---- Save: a draft to finish later, or the finished letter as a web page
  function fileDate() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function saveAs(name, body, type) {
    var note = $('save-said');
    saveFile(name, new Blob([body], { type: type })).then(function () {
      note.textContent = t('saved');
    }, function (err) {
      note.textContent = err && err.code === 'declined' ? '' : t('saveFail');
    });
  }
  $('save-ask').addEventListener('click', function () {
    $('save-said').textContent = '';
    $('save-veil').hidden = false;
    $('save-draft').focus();
  });
  $('save-draft').addEventListener('click', function () {
    var draft = makeDraft(quill.getContents().ops, state.design, state.lang, state.sample);
    saveAs('chithi-' + fileDate() + '.chithi.json', JSON.stringify(draft), 'application/json');
  });
  $('save-letter').addEventListener('click', function () {
    clearTimeout(timer);
    render();
    saveAs('chithi-' + fileDate() + '.html', asDocument(built.html), 'text/html');
  });
  $('save-close').addEventListener('click', function () { $('save-veil').hidden = true; $('save-ask').focus(); });

  // ---- Open a saved draft (confirmed in the page before it replaces a letter)
  // Messages about opening are shown in the writing pane, which is the one in view on a phone.
  function tellOpen(key) { $('open-said').textContent = key ? t(key) : ''; }
  var pendingDraft = null;
  // An opened draft is a fresh start, like a page load: there is nothing to undo back into.
  function useDraft(draft) {
    $('open-strip').hidden = true;
    pendingDraft = null;
    var lang = state.lang;
    if (draft.lang) state.lang = draft.lang;
    try {
      quill.setContents(draft.sample ? letterFor('sample') : draft.ops, 'silent');
    } catch (e) {
      state.lang = lang;
      tellOpen('openBad');
      return;
    }
    quill.history.clear();
    state.design = draft.design;
    setSample(draft.sample);
    applyLang();
    refreshTools();
    afterDesign();
    tellOpen(photosDropped ? 'photosNotKept' : 'opened');
  }
  function readText(file) {
    if (typeof file.text === 'function') return file.text();
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result)); };
      r.onerror = function () { reject(r.error); };
      r.readAsText(file);
    });
  }
  $('open-ask').addEventListener('click', function () { tellOpen(''); $('draft-input').click(); });
  $('draft-input').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_DRAFT) { tellOpen('openBig'); return; }
    Promise.resolve(file).then(readText).then(function (text) {
      return readDraft(JSON.parse(text), { langs: Object.keys(LANGS), maxPhotos: MAX_PHOTOS });
    }).catch(function () { return null; }).then(function (draft) {
      if (!draft) { tellOpen('openBad'); return; }
      if (state.sample || isBlank()) { useDraft(draft); return; }
      pendingDraft = draft;
      $('link-strip').hidden = true;
      $('photo-strip').hidden = true;
      $('starter-strip').hidden = true;
      $('open-strip').hidden = false;
      $('open-yes').focus();
    });
  });
  $('open-yes').addEventListener('click', function () { if (pendingDraft) useDraft(pendingDraft); });
  $('open-no').addEventListener('click', function () { pendingDraft = null; $('open-strip').hidden = true; quill.focus(); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('image-veil').hidden) $('image-close').click();
    if (!$('code-veil').hidden) $('code-close').click();
    if (!$('save-veil').hidden) $('save-close').click();
  });
  ['image-veil', 'code-veil', 'save-veil'].forEach(function (id) {
    $(id).addEventListener('click', function (e) { if (e.target === $(id)) $(id).hidden = true; });
  });

  // ===========================================================================
  // 5. Start
  // ===========================================================================
  function firstLang() {
    var wanted = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
    for (var i = 0; i < wanted.length; i++) {
      var code = String(wanted[i]).toLowerCase().split('-')[0];
      if (own(LANGS, code)) return code;
    }
    return 'en';
  }

  var saved = load();
  // A page made for one language (/bn/) opens in it. The main page follows the saved draft, then the browser.
  var pageLang = document.documentElement.getAttribute('data-page-lang');
  state.lang = own(LANGS, pageLang) ? pageLang : saved && own(LANGS, saved.lang) ? saved.lang : saved ? 'bn' : firstLang();
  state.design = designFrom(saved);
  if (saved) {
    quill.setContents(saved.sample ? letterFor('sample') : saved.ops, 'silent');
    setSample(Boolean(saved.sample));
  } else {
    quill.setContents(letterFor('sample'), 'silent');
    setSample(true);
  }
  quill.history.clear();
  applyLang();
  // The panes are hidden until now (styles.css): showing them half-built would make everything jump
  // as labels and papers arrive. Photos in the writing pad are decoded and the fonts in use loaded
  // first, so text and photos appear at their size; after 1.5 s the page is shown regardless. The letter is laid out
  // just after: it sits in a fixed, scrolling frame, so arriving a moment later moves nothing, and the
  // writing pad appears sooner (on a phone the letter is on another tab anyway).
  var decoded = Array.prototype.map.call(document.querySelectorAll('#editor img'), function (img) {
    return img.decode ? img.decode().catch(function () {}) : null;
  });
  if (document.fonts && document.fonts.ready) decoded.push(document.fonts.ready);
  Promise.race([Promise.all(decoded), new Promise(function (resolve) { setTimeout(resolve, 1500); })]).then(function () {
    $('app').classList.add('is-ready');
    setTimeout(render, 0);
  });
  // Page breaks depend on how wide the letters are, so lay the letter out again once the fonts are in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { render(); });

  // A reload or closed tab within the save delay would lose the last few keystrokes.
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });

  quill.on('text-change', function (delta, old, source) {
    if (source === 'user' && state.sample) setSample(false);
    if (source === 'user') tellOpen('');
    renderSoon();
    refreshTools();
  });
  quill.on('selection-change', function (range) {
    if (range) refreshTools();
    if (range && !(range.length === 1 && range.index === photoAt)) $('photo-strip').hidden = true;
  });
})();
