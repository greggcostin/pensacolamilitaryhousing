// Cloudflare Pages' edge cache is holding stale /about.html and /contact.html
// files from an earlier deploy (when these used to be static pages). Removing
// the source files didn't invalidate those cached URL → file mappings, so
// /about and /contact kept serving the OLD static content, and my
// _redirects rewrite rules got converted into 308 redirects to /.
//
// Fix: after Vite builds, duplicate dist/index.html into dist/about.html and
// dist/contact.html. The files are IDENTICAL to index.html (same SPA shell,
// same bundle reference), so when a request hits /about:
//   1. Cloudflare finds dist/about.html and serves it (overriding cache)
//   2. Browser loads the SPA shell
//   3. React reads window.location.pathname = "/about"
//   4. SPA renders the AboutPage React component
//
// Same flow for /contact. URL stays the same. Refresh works. No redirects.

import { copyFileSync, readFileSync } from "node:fs";

const SRC = "dist/index.html";
const ROUTES = ["about", "contact"];

for (const route of ROUTES) {
  const dest = `dist/${route}.html`;
  copyFileSync(SRC, dest);
  console.log(`postbuild: wrote ${dest} (SPA shell for /${route})`);
}
