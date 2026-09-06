// Local preview with Cloudflare-style clean HTML URLs. Production analytics loaders are omitted.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('civilian-site');
const port = Number(process.env.CIVILIAN_PREVIEW_PORT || 4174);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function previewHtml(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script => {
    if (/data-costin-tracker|googletagmanager\.com\/gtag\/|clarity\.ms\/tag\/|widgetbe\.com\/agent|static\.cloudflareinsights\.com\/beacon/.test(script)) return '<!-- Production analytics loader omitted in local preview. -->';
    return script;
  });
}
createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname === '/about') { res.writeHead(302, { Location: '/team' }).end(); return; }
  if (pathname === '/assets/costin-meta-config.js') {
    res.writeHead(200, { 'Content-Type':'text/javascript', 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex' });
    res.end('window.COSTIN_META = { enabled: false, pixelId: "" };'); return;
  }
  let file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  if (!extname(file)) file += '.html';
  const found = existsSync(file) && statSync(file).isFile();
  if (!found) file = resolve(root, '404.html');
  res.writeHead(found ? 200 : 404, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
  if (req.method === 'HEAD') res.end(); else res.end(extname(file) === '.html' ? previewHtml(readFileSync(file,'utf8')) : readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`Civilian preview: http://127.0.0.1:${port}`));
