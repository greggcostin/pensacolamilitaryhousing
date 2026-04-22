// Upgrade dropdown menus with ARIA roles + aria-expanded + keyboard handlers.
// Injects a small inline script that wires up click-to-toggle on dropdown
// buttons and Escape-to-close. role="menu" and aria-haspopup preserved
// through site.css (structural) + in-file attributes.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

// ── Add ARIA attributes to dropdown markup ─────────────────────────────────
// Known markers:
//   <div class="dropdown"><button type="button">Bases ▾</button><div class="dropdown-menu">
//   <div class="dropdown homes-dropdown" aria-hidden="true"><button ...>Homes ▾</button>...
// Rewrite to add role="menu" and aria-expanded initial false, aria-haspopup="menu".
const SCRIPT_BLOCK = `<script>
/* Accessible dropdowns: click to toggle, Escape to close, arrow keys to navigate.
   Uses same CSS-hover fallback already in site.css so mouse users unaffected. */
(function(){
  var ddls = document.querySelectorAll('.dropdown');
  ddls.forEach(function(dd){
    var btn = dd.querySelector('button');
    var menu = dd.querySelector('.dropdown-menu');
    if (!btn || !menu) return;
    btn.setAttribute('aria-haspopup','menu');
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('role','menu');
    menu.querySelectorAll('a').forEach(function(a){ a.setAttribute('role','menuitem'); });
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var open = dd.classList.toggle('dropdown-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    });
    dd.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { dd.classList.remove('dropdown-open'); btn.setAttribute('aria-expanded','false'); btn.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var items = Array.from(menu.querySelectorAll('a'));
        var idx = items.indexOf(document.activeElement);
        var next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        if (items[next]) items[next].focus();
      }
    });
  });
  document.addEventListener('click', function(e){
    document.querySelectorAll('.dropdown-open').forEach(function(dd){
      if (!dd.contains(e.target)) {
        dd.classList.remove('dropdown-open');
        var btn = dd.querySelector('button');
        if (btn) btn.setAttribute('aria-expanded','false');
      }
    });
  });
})();
</script>`;

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let count = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  // Skip if script already present
  if (html.includes("Accessible dropdowns: click to toggle")) continue;

  // Inject before </body>
  if (html.includes("</body>")) {
    html = html.replace("</body>", `${SCRIPT_BLOCK}\n</body>`);
  }

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    count++;
  }
}

console.log(`Dropdown ARIA script added to ${count} pages.`);
