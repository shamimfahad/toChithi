/*
 * toChithi letter builder.
 *
 * Turns the editor's content (a list of typed pieces) and a set of stationery choices into the
 * HTML that is pasted into an email. This file has no access to the page: it only builds strings,
 * so it can be tested on its own (see tests/builder.test.mjs).
 *
 * The rule that keeps the output safe: nothing from the editor's own HTML is reused. Every
 * character is escaped; every size, font and address comes from the fixed lists below; a colour
 * is either one of the listed ones or a plain #RRGGBB value the writer picked.
 */
(function (root) {
  'use strict';

  var own = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  var BN_FONTS = "'Tiro Bangla','Noto Serif Bengali','Kohinoor Bangla','Bangla MN','Noto Sans Bengali','Nirmala UI','Vrinda'";

  // Lettering: each is a fixed font stack and size. `bangla` is used when the letter contains Bangla.
  var LETTERINGS = {
    book: { size: 18, latin: "Georgia,'Times New Roman'," + BN_FONTS + ",serif", bangla: BN_FONTS + ",Georgia,serif" },
    type: { size: 17, latin: "'Courier New',Courier," + BN_FONTS + ",monospace", bangla: "'Courier New',Courier," + BN_FONTS + ",monospace" },
    hand: { size: 19, latin: "'Kalam','Segoe Print','Bradley Hand','Atma'," + BN_FONTS + ",cursive", bangla: "'Atma','Kalam'," + BN_FONTS + ",cursive" }
  };

  // Colours offered in the stationery panel. The writer may also pick any colour;
  // whatever arrives is accepted only if it is a plain #RRGGBB value.
  var PAPER_COLORS = [
    { c: '#FFFFFF', en: 'White', bn: 'সাদা' },
    { c: '#FDFDF7', en: 'Notebook white', bn: 'খাতার সাদা' },
    { c: '#FBF8EE', en: 'Ivory', bn: 'ঘিয়ে' },
    { c: '#FFF7C2', en: 'Yellow', bn: 'হলুদ' },
    { c: '#FFEAD9', en: 'Peach', bn: 'পিচ' },
    { c: '#FDEBEF', en: 'Pink', bn: 'গোলাপি' },
    { c: '#EFEAFA', en: 'Lavender', bn: 'ল্যাভেন্ডার' },
    { c: '#E9F2FB', en: 'Blue', bn: 'নীল' },
    { c: '#E8F4E4', en: 'Green', bn: 'সবুজ' },
    { c: '#EEF0F2', en: 'Grey', bn: 'ধূসর' },
    { c: '#E3CFA5', en: 'Kraft', bn: 'ক্রাফট' },
    { c: '#1F2A44', en: 'Night', bn: 'রাত' }
  ];
  var LINE_COLORS = [
    { c: '#BCD0E8', en: 'Blue', bn: 'নীল' },
    { c: '#C9CDD3', en: 'Grey', bn: 'ধূসর' },
    { c: '#B5D8BF', en: 'Green', bn: 'সবুজ' },
    { c: '#EBBAC6', en: 'Pink', bn: 'গোলাপি' },
    { c: '#D9C79A', en: 'Sand', bn: 'বালি' }
  ];
  var MARGIN_COLORS = [
    { c: '#E4808B', en: 'Red', bn: 'লাল' },
    { c: '#6F9BD8', en: 'Blue', bn: 'নীল' },
    { c: '#6DB58A', en: 'Green', bn: 'সবুজ' },
    { c: '#B58BD6', en: 'Violet', bn: 'বেগুনি' },
    { c: '#A7ADB8', en: 'Grey', bn: 'ধূসর' }
  ];
  var INK_COLORS = [
    { c: '#1F2F7A', en: 'Blue', bn: 'নীল' },
    { c: '#23252B', en: 'Black', bn: 'কালো' },
    { c: '#1D5B3F', en: 'Green', bn: 'সবুজ' },
    { c: '#4B2C82', en: 'Violet', bn: 'বেগুনি' },
    { c: '#7A1F2B', en: 'Maroon', bn: 'খয়েরি' },
    { c: '#5B3A1E', en: 'Sepia', bn: 'বাদামি' },
    { c: '#0F5E6B', en: 'Teal', bn: 'ফিরোজা' },
    { c: '#F4F1E6', en: 'White', bn: 'সাদা' }
  ];

  // Ready-made stationery. Each sets the paper, ruling, margin line and edge in one go.
  var PRESETS = {
    khata:   { paper: '#FDFDF7', pattern: 'lines', line: '#BCD0E8', margin: 'single', marginColor: '#E4808B', edge: 'pad' },
    holud:   { paper: '#FFF7C2', pattern: 'lines', line: '#A8C6D6', margin: 'single', marginColor: '#DE6C78', edge: 'pad' },
    neel:    { paper: '#E9F2FB', pattern: 'lines', line: '#AFC6E2', margin: 'single', marginColor: '#D8687A', edge: 'pad' },
    golapi:  { paper: '#FDEBEF', pattern: 'lines', line: '#EBBAC6', margin: 'double', marginColor: '#B58BD6', edge: 'thin' },
    graph:   { paper: '#FFFFFF', pattern: 'grid', line: '#B5D8BF', margin: 'none', marginColor: '#6DB58A', edge: 'thin' },
    airmail: { paper: '#FBF8EE', pattern: 'none', line: '#C9CDD3', margin: 'none', marginColor: '#E4808B', edge: 'airmail' },
    plain:   { paper: '#FBFAF5', pattern: 'none', line: '#C9CDD3', margin: 'none', marginColor: '#E4808B', edge: 'bar' },
    kraft:   { paper: '#E3CFA5', pattern: 'none', line: '#C9B27F', margin: 'none', marginColor: '#A7ADB8', edge: 'thin', ink: '#5B3A1E' },
    raat:    { paper: '#1F2A44', pattern: 'lines', line: '#3A4A70', margin: 'single', marginColor: '#6F9BD8', edge: 'thin', ink: '#F4F1E6' }
  };
  var PRESET_KEYS = ['paper', 'pattern', 'line', 'margin', 'marginColor', 'edge'];

  var DESIGN0 = {
    paper: '#FDFDF7', pattern: 'lines', line: '#BCD0E8', lineAuto: false, spacing: 32,
    margin: 'single', marginColor: '#E4808B', edge: 'pad', ink: '#1F2F7A',
    lettering: 'book', textSize: 'normal', width: 'full', pages: 'off', pageSize: 'medium', pageNumbers: true
  };
  var WIDTHS = { letter: 600, wide: 780, full: 0 };   // 0 = as wide as the reader's screen
  var WIDE_GUESS = 900;                               // a typical reading width, used to lay out pages and images
  var PAGE_LINES = { short: 16, medium: 24, long: 34 };
  var TEXT_SIZES = { small: -2, normal: 0, large: 2 };
  var AIR_RED = '#C8283C';
  var AIR_BLUE = '#25408F';
  var GUTTER = 38;
  var TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
  var SIZES = { '50%': 50, '75%': 75, '100%': 100 };
  var BANGLA = new RegExp('[' + String.fromCharCode(0x0980) + '-' + String.fromCharCode(0x09FF) + ']');
  var HEX = /^#[0-9a-fA-F]{6}$/;
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

  function esc(text) {
    return String(text).replace(/[&<>"'`]/g, function (ch) { return ESC[ch]; });
  }
  function hex(value, fallback) {
    return typeof value === 'string' && HEX.test(value) ? value.toUpperCase() : fallback;
  }
  function oneOf(value, list, fallback) {
    return list.indexOf(value) >= 0 ? value : fallback;
  }

  // Whatever is stored or passed in becomes a design made only of known choices and plain colours.
  function normDesign(d) {
    d = d && typeof d === 'object' ? d : {};
    return {
      paper: hex(d.paper, DESIGN0.paper),
      pattern: oneOf(d.pattern, ['none', 'lines', 'grid'], DESIGN0.pattern),
      line: hex(d.line, DESIGN0.line),
      lineAuto: d.lineAuto === true,
      spacing: oneOf(Number(d.spacing), [28, 32, 38], DESIGN0.spacing),
      margin: oneOf(d.margin, ['none', 'single', 'double', 'both'], DESIGN0.margin),
      marginColor: hex(d.marginColor, DESIGN0.marginColor),
      edge: oneOf(d.edge, ['none', 'thin', 'pad', 'bar', 'airmail'], DESIGN0.edge),
      ink: hex(d.ink, DESIGN0.ink),
      lettering: typeof d.lettering === 'string' && own(LETTERINGS, d.lettering) ? d.lettering : DESIGN0.lettering,
      textSize: typeof d.textSize === 'string' && own(TEXT_SIZES, d.textSize) ? d.textSize : DESIGN0.textSize,
      width: typeof d.width === 'string' && own(WIDTHS, d.width) ? d.width : DESIGN0.width,
      pages: oneOf(d.pages, ['off', 'auto'], DESIGN0.pages),
      pageSize: typeof d.pageSize === 'string' && own(PAGE_LINES, d.pageSize) ? d.pageSize : DESIGN0.pageSize,
      pageNumbers: d.pageNumbers !== false
    };
  }

  function bnDigits(n) {
    return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(Number(d)); });
  }

  // Blend two #RRGGBB colours.
  function mix(a, b, t) {
    var out = '#';
    for (var i = 1; i < 7; i += 2) {
      var v = Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t);
      out += (v < 16 ? '0' : '') + v.toString(16);
    }
    return out.toUpperCase();
  }
  function lum(c) {
    var v = [1, 3, 5].map(function (i) {
      var x = parseInt(c.substr(i, 2), 16) / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrast(a, b) {
    var x = lum(a);
    var y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function isDark(c) { return lum(c) < 0.25; }
  // A ruling colour that suits a paper colour.
  function autoRule(paper) {
    return isDark(paper) ? mix(paper, '#9DB4E6', 0.26) : mix(paper, '#4F86C9', 0.3);
  }

  function safeLink(value) {
    if (typeof value !== 'string' || value.length > 2000) return null;
    try {
      var url = new URL(value.trim());
      if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:') return url.href;
    } catch (e) { /* not an address */ }
    return null;
  }

  function safeImage(value) {
    if (typeof value !== 'string') return null;
    if (/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+\/]+=*$/.test(value)) return value;
    try {
      var url = new URL(value);
      if (url.protocol === 'https:') return url.href;
    } catch (e) { /* not an address */ }
    return null;
  }

  function cleanText(text) {
    return String(text).replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '').replace(/\t/g, '    ');
  }

  // Editor content -> lines of runs. A line is { runs: [...], a: {block formats} }.
  function toLines(ops) {
    var lines = [];
    var runs = [];
    (ops || []).forEach(function (op) {
      var a = op && op.attributes && typeof op.attributes === 'object' ? op.attributes : {};
      if (op && typeof op.insert === 'string') {
        var parts = cleanText(op.insert).split('\n');
        parts.forEach(function (part, i) {
          if (part) runs.push({ text: part, a: a });
          if (i < parts.length - 1) {
            lines.push({ runs: runs, a: a });
            runs = [];
          }
        });
      } else if (op && op.insert && typeof op.insert === 'object') {
        if (typeof op.insert.image === 'string') runs.push({ image: op.insert.image, a: a });
        else if (own(op.insert, 'pagebreak')) runs.push({ pagebreak: true, a: a });
      }
    });
    if (runs.length) lines.push({ runs: runs, a: {} });
    return lines;
  }

  // Lines -> blocks. A photo and a page break always stand alone; text around them becomes its own line.
  function toBlocks(lines) {
    var blocks = [];
    lines.forEach(function (line) {
      var text = [];
      var hadOther = false;
      var flush = function () {
        if (text.length) blocks.push({ runs: text, a: line.a });
        text = [];
      };
      line.runs.forEach(function (run) {
        if (run.pagebreak) {
          flush();
          hadOther = true;
          blocks.push({ pagebreak: true });
        } else if (run.image !== undefined) {
          flush();
          hadOther = true;
          var src = safeImage(run.image);
          if (src) blocks.push({ image: src, size: own(SIZES, run.a.width) ? SIZES[run.a.width] : 100 });
        } else {
          text.push(run);
        }
      });
      if (text.length || !hadOther) blocks.push({ runs: text, a: line.a });
    });
    while (blocks.length && blocks[blocks.length - 1].runs && blocks[blocks.length - 1].runs.length === 0) blocks.pop();
    // Numbered lists count across page breaks, so a list that runs onto the next page keeps its numbers.
    var n = 0;
    blocks.forEach(function (b) {
      if (b.runs && b.a.list === 'ordered') { n += 1; b.n = n; } else if (!b.pagebreak) n = 0;
    });
    return blocks;
  }

  function inline(runs, look) {
    return runs.map(function (run) {
      var a = run.a;
      var html = esc(run.text).replace(/ {2}/g, ' &nbsp;');
      var href = a.link ? safeLink(a.link) : null;
      if (a.bold) html = '<b>' + html + '</b>';
      if (a.italic) html = '<i>' + html + '</i>';
      if (a.underline) html = '<u>' + html + '</u>';
      if (a.strike) html = '<s>' + html + '</s>';
      if (a.color) html = '<span style="color:' + look.red + ';">' + html + '</span>';
      if (a.background) html = '<span style="background-color:' + look.marker + ';' + (look.markerInk ? 'color:' + look.markerInk + ';' : '') + '">' + html + '</span>';
      if (href) {
        html = '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" style="color:' + (a.color ? look.red : look.ink) + ';text-decoration:underline;">' + html + '</a>';
      }
      return html;
    }).join('');
  }

  function plain(runs) {
    return runs.map(function (run) { return run.text; }).join('');
  }

  // Every block repeats its own font, size, colour and line height, so the
  // letter keeps its shape even if an email editor rewraps or drops a parent.
  function textStyle(look, extra) {
    return 'margin:0;padding:0;font-family:' + look.font + ';font-size:' + look.size + 'px;line-height:' + look.line + 'px;color:' + look.ink + ';' + (extra || '');
  }

  function lineDiv(block, look, quoted) {
    var a = block.a;
    var extra = '';
    if (a.header === 1) extra = 'font-size:' + (look.size + 7) + 'px;font-weight:bold;';
    else if (a.header) extra = 'font-size:' + (look.size + 2) + 'px;font-weight:bold;';
    if (quoted) extra += 'font-style:italic;color:' + look.soft + ';';
    if (block.soft) extra += 'font-size:' + (look.size - 3) + 'px;color:' + look.soft + ';';
    var align = a.align === 'center' || a.align === 'right' ? a.align : 'left';
    return '<div style="' + textStyle(look, extra) + 'text-align:' + align + ';">' + (inline(block.runs, look) || '&nbsp;') + '</div>';
  }

  function textGroup(blocks, look) {
    var html = '';
    var i = 0;
    while (i < blocks.length) {
      var a = blocks[i].a;
      var j = i;
      if (a.blockquote) {
        var quoted = '';
        while (j < blocks.length && blocks[j].a.blockquote) quoted += lineDiv(blocks[j++], look, true);
        html += '<table ' + TABLE + ' width="100%" style="width:100%;border-collapse:separate;border-spacing:0;"><tr>' +
          '<td width="10" style="width:10px;font-size:0;line-height:0;">&nbsp;</td>' +
          '<td style="padding:0 0 0 12px;border-left:3px solid ' + look.bar + ';' + textStyle(look, 'font-style:italic;color:' + look.soft + ';') + '">' + quoted + '</td>' +
          '</tr></table>';
      } else if (a.list) {
        var ordered = a.list === 'ordered';
        var rows = '';
        while (j < blocks.length && blocks[j].a.list && (blocks[j].a.list === 'ordered') === ordered) {
          var count = blocks[j].n || 1;
          var mark = ordered ? (look.bangla ? bnDigits(count) : String(count)) + '.' : '&bull;';
          rows += '<tr><td width="34" valign="top" align="right" style="width:34px;padding:0 8px 0 0;white-space:nowrap;text-align:right;vertical-align:top;' + textStyle(look).replace('padding:0;', '') + '">' + mark + '</td>' +
            '<td valign="top" style="vertical-align:top;' + textStyle(look) + '">' + lineDiv(blocks[j++], look, false) + '</td></tr>';
        }
        html += '<table ' + TABLE + ' width="100%" style="width:100%;border-collapse:separate;border-spacing:0;">' + rows + '</table>';
      } else {
        html += lineDiv(blocks[i], look, false);
        j = i + 1;
      }
      i = j;
    }
    return html;
  }

  function photo(block, look) {
    var pixels = Math.round(5 * block.size);
    return '<table ' + TABLE + ' align="center" width="' + block.size + '%" style="width:' + block.size + '%;margin:0 auto;border-collapse:separate;border-spacing:0;">' +
      '<tr><td align="center" style="padding:0;font-size:0;line-height:0;">' +
        '<table ' + TABLE + ' align="center" style="margin:0 auto;"><tr><td width="74" height="15" bgcolor="' + look.tape + '" style="width:74px;height:15px;font-size:0;line-height:0;background-color:' + look.tape + ';">&nbsp;</td></tr></table>' +
      '</td></tr>' +
      '<tr><td bgcolor="#FFFFFF" style="padding:7px;background-color:#FFFFFF;border:1px solid ' + look.tape + ';font-size:0;line-height:0;">' +
        '<img src="' + esc(block.image) + '" width="' + pixels + '"' + (block.ratio ? ' height="' + Math.round(pixels * block.ratio) + '"' : '') + ' alt="" style="display:block;width:100%;max-width:100%;height:auto;border:0;outline:none;">' +
      '</td></tr></table>';
  }

  // The shape of a page for a design: which gutters it has and how wide the writing column is.
  function layout(d, width) {
    var bw = d.margin === 'double' ? 4 : 2;
    var left = d.margin !== 'none';
    var right = d.margin === 'both';
    var padL = left ? 14 : 26;
    var padR = right ? 14 : left ? 20 : 26;
    var frame = d.edge === 'airmail' ? 14 : d.edge === 'none' ? 0 : 2;
    var column = width - frame - (left ? GUTTER + bw : 0) - (right ? GUTTER + bw : 0) - padL - padR;
    return { bw: bw, left: left, right: right, padL: padL, padR: padR, column: Math.max(120, column) };
  }

  // Splits the blocks into pages. A sheet is never shorter than the chosen page length: a short
  // letter is filled out with blank ruled lines, the way a real page would be. Without "auto"
  // only the writer's own page breaks start a new sheet, and a long page simply grows. With it,
  // a page holds a set number of lines; a paragraph is never cut in two.
  function paginate(blocks, d, look, column, opts) {
    var auto = d.pages === 'auto';
    var cap = PAGE_LINES[d.pageSize];
    var pages = [];
    var cur = { blocks: [], used: 0, forced: true };
    var next = function (forced) {
      pages.push(cur);
      cur = { blocks: [], used: 0, forced: forced };
    };
    var isBlank = function (b) { return Boolean(b.runs) && b.runs.length === 0; };

    var texts = blocks.filter(function (b) { return b.runs; });
    var heights = opts.measure ? opts.measure(texts.map(function (b) { return textGroup([b], look); }), column) : null;
    var k = 0;
    blocks.forEach(function (b) {
      if (b.pagebreak) { next(true); return; }
      var lines;
      if (b.image) {
        lines = (57 + Math.max(0, column * b.size / 100 - 16) * opts.ratio(b.image)) / look.line;
      } else {
        var h = heights ? heights[k] : Math.ceil(plain(b.runs).length / Math.max(8, column / (look.size * 0.52))) * look.line;
        k += 1;
        lines = Math.max(1, Math.round(h / look.line));
      }
      if (auto) {
        var room = lines + (b.runs && b.a.header ? 1 : 0); // a heading keeps at least one line with it
        if (cur.used > 0 && cur.used + room > cap) next(false);
        if (isBlank(b) && cur.used === 0 && !cur.forced) return; // no blank line at the top of a page that simply overflowed
      }
      cur.blocks.push(b);
      cur.used += lines;
    });
    next(true);

    var kept = pages.filter(function (p) { return p.blocks.length > 0; });
    if (!kept.length) kept = [{ blocks: [], used: 0 }];
    kept.forEach(function (p) {
      while (p.blocks.length && isBlank(p.blocks[p.blocks.length - 1])) { p.blocks.pop(); p.used -= 1; }
      p.fill = Math.max(auto ? 1 : 2, Math.ceil(cap - p.used));
    });
    return kept;
  }

  function pageHtml(page, d, look, lay, number, total) {
    var P = d.paper;
    var L = look.line;
    var cells = 1 + (lay.left ? 1 : 0) + (lay.right ? 1 : 0);
    var empty = { runs: [], a: {} };
    var blocks = page.blocks.slice();
    if (!blocks.length) blocks = [empty];

    // Runs of text share a row; each photo gets a row of its own.
    var groups = [];
    blocks.forEach(function (block) {
      var last = groups[groups.length - 1];
      if (block.image) groups.push({ photo: block });
      else if (last && last.text) last.text.push(block);
      else groups.push({ text: [block] });
    });
    if (!groups[groups.length - 1].text) groups.push({ text: [] });
    var tail = groups[groups.length - 1].text;
    for (var f = 0; f < page.fill; f++) tail.push(empty);
    if (total > 1 && d.pageNumbers) {
      tail.push({ runs: [{ text: '— ' + (look.bangla ? bnDigits(number) : number) + ' —', a: {} }], a: { align: 'center' }, soft: true });
    }

    // Each rule is a self-contained stripe, so if an email editor drops
    // background-size the worst case is one faint line, never a filled block.
    var off = Math.round(L * 0.22);
    var plainBg = 'background-color:' + P + ';';
    var stripe = function (dir, size) {
      return 'linear-gradient(to ' + dir + ', transparent ' + (size - 1) + 'px, ' + d.line + ' ' + (size - 1) + 'px, ' + d.line + ' ' + size + 'px, transparent ' + size + 'px)';
    };
    var ruling = function (shift) {
      if (d.pattern === 'lines') {
        return plainBg + 'background-image:' + stripe('bottom', L) + ';background-size:100% ' + L + 'px;background-position:0 -' + off + 'px;background-repeat:repeat;';
      }
      if (d.pattern === 'grid') {
        var g = L / 2;
        return plainBg + 'background-image:' + stripe('bottom', g) + ', ' + stripe('right', g) + ';background-size:' + g + 'px ' + g + 'px;background-position:-' + (shift % g) + 'px -' + off + 'px;background-repeat:repeat;';
      }
      return plainBg;
    };
    var rule = (lay.bw === 4 ? '4px double ' : '2px solid ') + d.marginColor;
    var gutter = function (side, bg, height) {
      return '<td width="' + GUTTER + '" bgcolor="' + P + '"' + (height ? ' height="' + height + '"' : '') + ' style="width:' + GUTTER + 'px;' + (height ? 'height:' + height + 'px;' : '') + 'font-size:0;line-height:0;border-' + (side === 'left' ? 'right' : 'left') + ':' + rule + ';' + bg + '">&nbsp;</td>';
    };
    var row = function (bg, shiftBg, inner, height) {
      return '<tr>' + (lay.left ? gutter('left', bg, height) : '') + inner + (lay.right ? gutter('right', shiftBg, height) : '') + '</tr>';
    };
    var shift = lay.left ? GUTTER + lay.bw : 0;
    var cut = 'word-break:break-word;overflow-wrap:anywhere;';

    // The blank strip at the top of a sheet. On graph paper the grid runs through it.
    var headHeight = d.pattern === 'grid' ? L : d.pattern === 'lines' ? 38 : 28;
    var headBg = d.pattern === 'grid' ? ruling(shift) : plainBg;
    var head = row(d.pattern === 'grid' ? ruling(0) : plainBg, headBg,
      '<td height="' + headHeight + '" bgcolor="' + P + '" style="height:' + headHeight + 'px;font-size:0;line-height:0;' + headBg + '">&nbsp;</td>', headHeight);

    var rows = groups.map(function (group) {
      if (group.photo) {
        // A photo sits on a blank strip of ruled paper; on graph paper the grid carries on behind it.
        var under = d.pattern === 'grid' ? ruling : function () { return plainBg; };
        return row(under(0), under(shift), '<td align="center" bgcolor="' + P + '" style="padding:12px ' + lay.padR + 'px 14px ' + lay.padL + 'px;' + under(shift) + '">' + photo(group.photo, look) + '</td>');
      }
      return row(ruling(0), ruling(shift), '<td align="left" valign="top" bgcolor="' + P + '" style="padding:0 ' + lay.padR + 'px 0 ' + lay.padL + 'px;vertical-align:top;text-align:left;' + cut + textStyle(look).replace('padding:0;', '') + ruling(shift) + '">' + textGroup(group.text, look) + '</td>');
    }).join('');

    var border = '';
    if (d.edge === 'thin' || d.edge === 'pad') border = 'border:1px solid ' + look.edge + ';';
    if (d.edge === 'bar') border = 'border:1px solid ' + look.edge + ';border-top:5px solid ' + look.ink + ';';
    var tear = d.edge === 'pad'
      ? '<tr><td colspan="' + cells + '" height="14" bgcolor="' + P + '" style="height:14px;font-size:0;line-height:0;border-bottom:2px dashed ' + look.edge + ';' + plainBg + '">&nbsp;</td></tr>'
      : '';
    var sheet = '<table ' + TABLE + ' width="100%" bgcolor="' + P + '" style="width:100%;border-collapse:separate;border-spacing:0;' + border + plainBg + '">' + tear + head + rows + '</table>';
    if (d.edge !== 'airmail') return sheet;
    // Airmail: only colours and borders, which every email editor keeps.
    return '<table ' + TABLE + ' width="100%" style="width:100%;border-collapse:separate;border-spacing:0;"><tr>' +
      '<td bgcolor="' + AIR_RED + '" style="padding:0;background-color:' + AIR_RED + ';border:7px dashed ' + AIR_BLUE + ';">' + sheet + '</td></tr></table>';
  }

  /**
   * Builds the letter. Returns { html, text, pages }.
   * `ops` is the editor's content list. `design` is a set of stationery choices; it is passed
   * through normDesign(), so only known choices and plain #RRGGBB colours ever reach the markup.
   * `opts.photoWord` stands in for a photo in the plain-text copy. `opts.measure(htmlList, width)`
   * returns rendered heights and `opts.ratio(src)` a photo's height/width; both are only used to
   * decide where pages break, and sensible estimates are used without them.
   */
  function buildLetter(ops, design, opts) {
    opts = opts && typeof opts === 'object' ? opts : {};
    var d = normDesign(design);
    var lettering = LETTERINGS[d.lettering];
    var blocks = toBlocks(toLines(ops));
    var allText = blocks.map(function (b) { return b.runs ? plain(b.runs) : ''; }).join('');
    var bangla = BANGLA.test(allText);
    var dark = isDark(d.paper);
    var yellowish = !dark && parseInt(d.paper.substr(1, 2), 16) - parseInt(d.paper.substr(5, 2), 16) > 40 && parseInt(d.paper.substr(3, 2), 16) > 215;
    var soft = mix(d.ink, d.paper, 0.32);
    var look = {
      ink: d.ink,
      soft: soft,
      bar: d.margin === 'none' ? soft : d.marginColor,
      red: dark ? '#FF8A84' : '#C62F2F',
      marker: dark ? '#FFE66B' : yellowish ? '#FFC9D6' : '#FFEE8C',
      markerInk: dark ? '#1B2233' : '',
      tape: mix(d.paper, dark ? '#FFFFFF' : '#8A7A4A', 0.3),
      edge: mix(d.paper, dark ? '#FFFFFF' : '#5F6B7A', 0.24),
      bangla: bangla,
      font: bangla ? lettering.bangla : lettering.latin,
      size: lettering.size + TEXT_SIZES[d.textSize],
      line: d.spacing
    };
    var measure = { measure: typeof opts.measure === 'function' ? opts.measure : null, ratio: typeof opts.ratio === 'function' ? opts.ratio : function () { return 0.62; } };
    // A photo whose true shape is known also gets a height, so it keeps its shape where an email
    // program sizes images from their attributes (Outlook on Windows) and before it has loaded.
    if (typeof opts.exactRatio === 'function') {
      blocks.forEach(function (b) {
        if (!b.image) return;
        var r = Number(opts.exactRatio(b.image));
        if (isFinite(r) && r > 0.05 && r < 20) b.ratio = r;
      });
    }

    var maxWidth = WIDTHS[d.width];
    var lay = layout(d, maxWidth || WIDE_GUESS);
    var pages = paginate(blocks, d, look, lay.column, measure);
    var gap = '<tr><td height="22" style="height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>';
    var html = '<table ' + TABLE + ' align="center" width="' + (maxWidth || '100%') + '" style="width:100%;' + (maxWidth ? 'max-width:' + maxWidth + 'px;' : '') + 'margin:0 auto;border-collapse:separate;border-spacing:0;">' +
      pages.map(function (page, i) {
        return '<tr><td style="padding:0;">' + pageHtml(page, d, look, lay, i + 1, pages.length) + '</td></tr>';
      }).join(gap) + '</table>';

    // Plain-text twin for editors that accept text only.
    var text = [];
    blocks.forEach(function (block) {
      if (block.pagebreak) { text.push(''); return; }
      if (block.image) { text.push(typeof opts.photoWord === 'string' ? opts.photoWord : '[photo]'); return; }
      var line = plain(block.runs);
      if (block.a.list === 'ordered') line = (look.bangla ? bnDigits(block.n) : block.n) + '. ' + line;
      else if (block.a.list) line = '• ' + line;
      else if (block.a.blockquote) line = '> ' + line;
      text.push(line);
    });

    return { html: html, text: text.join('\n').replace(/\n+$/, '') + '\n', pages: pages.length };
  }

  // ---- Draft files: what the writer saves to finish later, and what is let back in when they open one.
  var DRAFT_FORMAT = 'tochithi-draft';
  var DRAFT_VERSION = 1;
  var PHOTO_DATA = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+\/]+=*$/;

  function makeDraft(ops, design, lang, sample) {
    return { format: DRAFT_FORMAT, version: DRAFT_VERSION, savedAt: new Date().toISOString(), lang: lang, sample: sample === true, design: normDesign(design), ops: ops };
  }

  // An opened file is someone else's data until proven otherwise: only plain text, photos carried
  // inside the file, page breaks and simple format values come through. Anything else means null.
  function readDraft(d, opts) {
    opts = opts || {};
    if (!d || typeof d !== 'object' || d.format !== DRAFT_FORMAT || d.version !== DRAFT_VERSION || !Array.isArray(d.ops)) return null;
    var maxPhotos = typeof opts.maxPhotos === 'number' ? opts.maxPhotos : Infinity;
    var photos = 0;
    var ops = [];
    d.ops.forEach(function (op) {
      if (!op || typeof op !== 'object') return;
      var insert = null;
      if (typeof op.insert === 'string') insert = op.insert;
      else if (op.insert && typeof op.insert === 'object') {
        if (typeof op.insert.image === 'string' && PHOTO_DATA.test(op.insert.image) && photos < maxPhotos) { photos += 1; insert = { image: op.insert.image }; }
        else if (op.insert.pagebreak === true) insert = { pagebreak: true };
      }
      if (insert === null || insert === '') return;
      var out = { insert: insert };
      if (op.attributes && typeof op.attributes === 'object' && !Array.isArray(op.attributes)) {
        var a = {};
        Object.keys(op.attributes).forEach(function (k) {
          var v = op.attributes[k];
          if (typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && isFinite(v))) a[k] = v;
        });
        if (Object.keys(a).length) out.attributes = a;
      }
      ops.push(out);
    });
    if (!ops.length) return null;
    var last = ops[ops.length - 1];
    if (typeof last.insert !== 'string' || last.insert.slice(-1) !== '\n') ops.push({ insert: '\n' });
    var langs = Array.isArray(opts.langs) ? opts.langs : [];
    return {
      ops: ops,
      design: normDesign(d.design),
      lang: langs.indexOf(d.lang) >= 0 ? d.lang : null,
      sample: d.sample === true
    };
  }

  var api = {
    BN_FONTS: BN_FONTS,
    LETTERINGS: LETTERINGS,
    PAPER_COLORS: PAPER_COLORS,
    LINE_COLORS: LINE_COLORS,
    MARGIN_COLORS: MARGIN_COLORS,
    INK_COLORS: INK_COLORS,
    PRESETS: PRESETS,
    PRESET_KEYS: PRESET_KEYS,
    DESIGN0: DESIGN0,
    WIDTHS: WIDTHS,
    WIDE_GUESS: WIDE_GUESS,
    PAGE_LINES: PAGE_LINES,
    AIR_RED: AIR_RED,
    AIR_BLUE: AIR_BLUE,
    hex: hex,
    mix: mix,
    contrast: contrast,
    isDark: isDark,
    autoRule: autoRule,
    normDesign: normDesign,
    safeLink: safeLink,
    safeImage: safeImage,
    buildLetter: buildLetter,
    DRAFT_FORMAT: DRAFT_FORMAT,
    makeDraft: makeDraft,
    readDraft: readDraft
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Chithi = api;
})(typeof window !== 'undefined' ? window : globalThis);
