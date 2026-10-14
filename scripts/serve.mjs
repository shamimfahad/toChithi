// A small static server for local use and for the browser tests. It sends the same
// security headers as the hosted site, so a header that breaks the page shows up here first.
import { createServer } from 'node:http';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HEADERS } from './headers.mjs';

const root = resolve(fileURLToPath(new URL('../public', import.meta.url)));
const port = Number(process.env.PORT) || 4173;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    // A folder asked for without its slash (/bn) moves to the one address it has (/bn/), as on the hosts.
    if (!path.endsWith('/') && (await stat(file)).isDirectory()) {
      res.writeHead(308, { ...HEADERS, Location: `${path}/` }).end();
      return;
    }
    let body = await readFile(file);
    const type = TYPES[extname(file)] || 'application/octet-stream';
    const head = { ...HEADERS, 'Content-Type': type, 'Cache-Control': 'no-cache', Vary: 'Accept-Encoding' };
    // Text is compressed, as Vercel and Netlify do, so a local Lighthouse run measures what visitors download.
    if (/^(text\/|application\/xml|image\/svg)/.test(type)) {
      const accepts = String(req.headers['accept-encoding'] || '');
      if (/\bbr\b/.test(accepts)) { body = brotliCompressSync(body); head['Content-Encoding'] = 'br'; }
      else if (/\bgzip\b/.test(accepts)) { body = gzipSync(body); head['Content-Encoding'] = 'gzip'; }
    }
    res.writeHead(200, head);
    res.end(body);
  } catch {
    res.writeHead(404, { ...HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, () => console.log(`চিঠি is running at http://localhost:${port}`));
