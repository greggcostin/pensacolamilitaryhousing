// Shared, accessible article next steps and first-party event labels for both sites.
// No form values, personal data, referrer strings, query strings or monetary estimates.
import { existsSync } from "node:fs";
import { SITES } from "./blog-lib.mjs";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function journeyFor(spec, site) {
  const slug = spec.slug, text = (slug + " " + spec.category).toLowerCase();
  if (site === "gc") {
    if (/insurance/.test(text)) return { goal: "property-cost-review", prompt: "Before comparing homes, collect insurance questions for each property.", tool: "/resources/florida-home-insurance", toolLabel: "Use the Florida insurance guide", bridge: "https://pensacolamilitaryhousing.com/pensacola-flood-zones-homebuyers", bridgeLabel: "Check flood-zone questions before you make an offer" };
    if (/tax/.test(text)) return { goal: "property-cost-review", prompt: "Compare tax rules with the address and ownership plan you are considering.", tool: "/resources/florida-homestead-exemption", toolLabel: "Review homestead requirements", bridge: "https://pensacolamilitaryhousing.com/blog/florida-veteran-property-tax-county-guide", bridgeLabel: "Veteran buyer? See the county tax guide" };
    return { goal: "buyer-planning", prompt: "Use this guide to prepare the questions for your own purchase.", tool: "/resources/first-time-home-buyer", toolLabel: "Plan your next home purchase", bridge: "https://pensacolamilitaryhousing.com/va-loan-guide", bridgeLabel: "Using a VA loan? Review the VA buyer guide" };
  }
  if (/tax|homestead/.test(text)) return { goal: "property-cost-review", prompt: "Apply the checklist to a specific address before relying on an advertised monthly payment.", tool: "/va-disability-property-tax-florida", toolLabel: "Review veteran property-tax rules", bridge: "https://greggcostin.com/resources/florida-homestead-exemption", bridgeLabel: "Compare Florida homestead requirements" };
  if (/bah|concession|assumption/.test(text)) return { goal: "purchase-budget", prompt: "Compare the full payment, cash needed and ownership plan for the home you are considering.", tool: "/mortgage-calculators", toolLabel: "Work through a purchase budget", bridge: "https://greggcostin.com/blog/closing-costs-florida-buyers", bridgeLabel: "Include Florida closing costs in your plan" };
  if (/personal-property|pcs-to/.test(text)) return { goal: "relocation-planning", prompt: "Turn your moving timeline into a housing search plan.", tool: "/pcs-guide", toolLabel: "Use the PCS planning guide", bridge: "https://greggcostin.com/neighborhoods", bridgeLabel: "Explore local community guides for the whole household" };
  return { goal: "home-shortlist", prompt: "Build a shortlist around your commute, property costs and housing needs.", tool: "/pcs-home-search", toolLabel: "Plan a local home search", bridge: "https://greggcostin.com/neighborhoods", bridgeLabel: "Compare the local community guides" };
}

function verifyDestination(href, site, root) {
  const u = new URL(href, SITES[site].origin);
  const dest = Object.values(SITES).find((s) => s.origin === u.origin);
  if (!dest || u.search || u.hash) throw new Error("Journey destination must be a clean first-party URL");
  const path = u.pathname === "/" ? "/index" : u.pathname;
  const spa = dest.key === "pmh" && ["/pcs-guide", "/mortgage-calculators", "/contact"].includes(path);
  if (!spa && !existsSync(root + dest.siteDir + path + ".html")) throw new Error("Missing journey destination: " + href);
}

export function journeyHtml(spec, site, root) {
  const j = journeyFor(spec, site);
  for (const h of [j.tool, j.bridge]) verifyDestination(h, site, root);
  return '<section class="article-next" aria-labelledby="article-next-title" data-article-journey>' +
    '<h2 id="article-next-title">Put this guide to work</h2><p>' + esc(j.prompt) + '</p>' +
    '<ul><li><a data-blog-next="tool" href="' + esc(j.tool) + '">' + esc(j.toolLabel) + '</a></li>' +
    '<li><a data-blog-next="companion" href="' + esc(j.bridge) + '">' + esc(j.bridgeLabel) + '</a></li></ul>' +
    '<p><a href="/contact" data-inquiry-open data-inquiry-type="General Question" data-blog-next="inquiry">Ask Gregg about your own move</a></p>' +
    '<div class="article-share"><button type="button" data-blog-share hidden>Share this guide</button> ' +
    '<button type="button" data-blog-copy hidden>Copy guide link</button> <a href="' + esc(SITES[site].origin + "/blog/" + spec.slug) + '">Permanent link</a>' +
    '<span data-blog-share-status role="status" aria-live="polite"></span></div></section>';
}

export function articleRuntime(config) {
  if (window.__costinArticle) return;
  window.__costinArticle = true;
  const doc = document, nav = navigator, main = doc.querySelector("main");
  const panel = doc.querySelector("[data-article-journey]");
  if (!main || !panel) return;
  const seen = new Set();
  const emit = (name, data = {}, once = false) => {
    if (nav.globalPrivacyControl === true || nav.doNotTrack === "1" || typeof window.gtag !== "function") return;
    if (once && seen.has(name)) return;
    if (once) seen.add(name);
    window.gtag("event", name, { content_type: "article", content_id: config.slug, article_site: config.site, article_goal: config.goal, ...data });
  };
  doc.addEventListener("click", (e) => {
    const a = e.target.closest?.("[data-blog-next]");
    if (!a) return;
    emit("blog_next_step", { step_type: a.getAttribute("data-blog-next") });
  });
  doc.addEventListener("costin:lead-success", () => emit("blog_inquiry_success", { method: "accepted_form" }, true));
  const share = panel.querySelector("[data-blog-share]"), copy = panel.querySelector("[data-blog-copy]"), status = panel.querySelector("[data-blog-share-status]");
  if (share && typeof nav.share === "function") {
    share.hidden = false;
    share.addEventListener("click", async () => {
      try {
        await nav.share({ title: config.title, url: config.url });
        status.textContent = "Sharing finished.";
        emit("share", { method: "native" });
      } catch (e) { if (e.name !== "AbortError") status.textContent = "Use Copy guide link or the permanent link."; }
    });
  }
  if (copy && nav.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      try { await nav.clipboard.writeText(config.url); status.textContent = "Guide link copied."; emit("blog_link_copy", { method: "clipboard" }); }
      catch { status.textContent = "Use the permanent link to copy this guide's address."; }
    });
  }
  let visibleSeconds = 0;
  const timer = window.setInterval(() => {
    if (doc.visibilityState === "hidden") return;
    visibleSeconds += 5;
    const rect = main.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, rect.height)));
    if (visibleSeconds >= 30 && progress >= 0.5) {
      emit("blog_read", { active_seconds: visibleSeconds, depth_threshold: 50 }, true);
      window.clearInterval(timer);
    }
  }, 5000);
  window.addEventListener("pagehide", () => window.clearInterval(timer), { once: true });
}

export function wireJourney(html, spec, site) {
  if (html.includes('id="costin-article-runtime"')) return html;
  const marker = "if(res.ok&&res.j.success){";
  // Instrument the existing confirmed success branch, never a click or attempted submit.
  if (!html.includes("costin:lead-success") && html.includes(marker)) html = html.replace(marker, marker + "document.dispatchEvent(new CustomEvent('costin:lead-success'));");
  const config = { slug: spec.slug, title: spec.h1, site, goal: journeyFor(spec, site).goal, url: SITES[site].origin + "/blog/" + spec.slug };
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  const style = '<style id="article-journey-style">.article-next{max-width:760px;margin:2rem auto;padding:1.2rem;border:1px solid var(--gold-line,#7c692f);border-radius:10px}.article-next h2{margin-top:0}.article-share{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.article-share button{padding:10px 14px;min-height:44px;border:1px solid #9b8445;border-radius:6px;color:inherit;background:transparent;font:inherit;cursor:pointer}.article-share [hidden]{display:none}.article-share button:focus-visible{outline:3px solid #C9A84C;outline-offset:3px}.article-share [role=status]{display:block;width:100%;font-size:14px}</style>';
  return html.replace("</head>", style + "</head>").replace("</body>", '<script id="costin-article-runtime">(' + articleRuntime.toString() + ')(' + json + ');</script>\n</body>');
}
