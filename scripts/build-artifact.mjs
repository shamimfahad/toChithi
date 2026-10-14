// Packs the site into one self-contained page for publishing as a Claude artifact:
// styles and scripts are inlined and the two libraries come from a CDN instead of /vendor.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../public/${name}`, import.meta.url), 'utf8');
const [html, css, builder, app] = await Promise.all([read('index.html'), read('styles.css'), read('builder.js'), read('app.js')]);

const markup = html.slice(html.indexOf('<!-- app:start -->') + '<!-- app:start -->'.length, html.indexOf('<!-- app:end -->')).trim();
// The hosted site serves its own fonts (public/fonts/); an artifact can only load them from Google Fonts.
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;500;600;700&family=Atma:wght@400;600&family=Kalam:wght@400;700&family=Tiro+Bangla:ital@0;1&display=swap">`;

const page = `<title>চিঠি</title>
${fonts}
<style>
${css.trim()}
</style>

${markup}

<script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
${builder.trim()}
</script>
<script>
${app.trim()}
</script>
`;

await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/chithi-artifact.html', import.meta.url), page);
console.log(`dist/chithi-artifact.html (${Math.round(page.length / 1024)} KB)`);
