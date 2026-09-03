import { Fragment, useState, useEffect, useReducer, useId, useRef } from "react";
import { BAH_DATA } from "./bahData.js";
import { COMMUNITY_LINKS } from "./communitiesData.js";
import { INSTALLATIONS, NEIGHBORHOOD_ROWS, PCS_CHECKLIST, FL_BENEFITS, PCS_FAQS } from "./pcsGuideData.js";
import { META_BY_PAGE, SITE } from "./routeMeta.js";
import { IMAGE_VARIANTS } from "./imageVariants.js";

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const C = {
  ink: "#0A0F1A", panel: "#121823", elevated: "#1A2332",
  hairline: "rgba(255,255,255,0.08)",
  gold: "#C9A84C", goldSoft: "#D4B768",
  goldTint: "rgba(201,168,76,0.10)", goldLine: "rgba(201,168,76,0.35)",
  text: "#E8E6DF", muted: "#A5A496", mutedD: "#8f8e83",
};
const GOLD = C.gold;
const BLACK = C.ink;
const DARK = "#1A1A1A";
const CHARCOAL = "#2A2A2A";
const CREAM = "#F5F1E8";
const WARM_GRAY = C.muted;
const LIGHT = "#F2F0EA";
const SF = "'Playfair Display', Georgia, serif";
const SS = "'Inter', 'DM Sans', system-ui, sans-serif";

const pages = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Me" },
  { id: "pcs", label: "PCS Guide" },
  { id: "nas", label: "NAS Pensacola" },
  { id: "whiting", label: "Whiting Field" },
  { id: "corry", label: "Corry Station" },
  { id: "eglin", label: "Eglin AFB" },
  { id: "hurlburt", label: "Hurlburt Field" },
  { id: "neighborhoods", label: "Neighborhoods" },
  { id: "contact", label: "Contact" },
];

const BASES_LINKS = [
  { label: "NAS Pensacola", href: "/bases/nas-pensacola", blurb: "The Cradle of Naval Aviation. Flight training, Blue Angels, and the #1 PCS destination for Naval Aviators and Combat Systems Officers." },
  { label: "Corry Station", href: "/bases/corry-station", blurb: "The Navy's premier information warfare, cryptology, and cyber training base." },
  { label: "Saufley Field", href: "/bases/saufley-field", blurb: "NETPDC, the Navy Advancement Center, and NOSC Pensacola. Education-and-support tenant field of NAS Pensacola." },
  { label: "NAS Whiting Field", href: "/bases/whiting-field", blurb: "The Navy's primary helicopter training base and one of the busiest airfields in the world." },
  { label: "Hurlburt Field", href: "/bases/hurlburt-field", blurb: "Headquarters of Air Force Special Operations Command. AC-130s, MC-130s, CV-22s, and the special tactics community." },
  { label: "Eglin AFB", href: "/bases/eglin-afb", blurb: "33rd Fighter Wing (F-35A training), 96th Test Wing, 7th SFG, and the largest forested Air Force installation in the US." },
  { label: "Duke Field", href: "/bases/duke-field", blurb: "Home of the 919th Special Operations Wing (AFRC). C-146A Wolfhound ops, adjacent to Crestview." },
];

// Items that live under the PCS Guide dropdown (planning-stage essentials).
const PCS_LINKS = [
  { label: "PCS Guide", href: "/pcs-guide" },
  { label: "PCS Checklist", href: "/pcs-checklist" },
  { label: "PCS Schools by Base", href: "/pcs-schools-by-base" },
  { label: "2026 BAH Rates", href: "/bah-rates" },
  { label: "FL Home Insurance", href: "/florida-home-insurance-military" },
  { label: "FL Homestead (Military)", href: "/florida-homestead-exemption-military" },
];

// Items that live under the VA Loan Guide dropdown (financing essentials).
const VA_LINKS = [
  { label: "VA Loan Guide", href: "/va-loan-guide" },
  { label: "VA Certificate of Eligibility", href: "/va-coe-guide" },
  { label: "BAH to Mortgage Guide", href: "/bah-to-mortgage-guide" },
  { label: "VA IRRRL Refi Guide", href: "/va-irrrl-guide" },
  { label: "VA Funding Fee 2026", href: "/va-funding-fee-2026" },
  { label: "VA Closing Costs (FL)", href: "/va-loan-closing-costs-florida" },
  { label: "Assumable VA Loans", href: "/assumable-va-loans-pensacola" },
  { label: "Zero-Down Loans Compared", href: "/zero-down-home-loans" },
];

const RESOURCE_LINKS = [
  { label: "First-Time Military Homebuyer", href: "/first-time-military-homebuyer" },
  { label: "Flight School Housing", href: "/flight-school-housing-pensacola" },
  { label: "Rent or Sell When You PCS", href: "/rent-or-sell-pcs-pensacola" },
  { label: "Cash Offer vs Listing", href: "/cash-offer-pensacola" },
  { label: "New Construction Guide", href: "/new-construction-pensacola" },
  { label: "Buying Sight-Unseen", href: "/buying-sight-unseen-pcs-pensacola" },
  { label: "Pensacola Flood Zones", href: "/pensacola-flood-zones-homebuyers" },
  { label: "VA Loans for Condos", href: "/va-approved-condos-pensacola" },
  { label: "Dual-Military Homes", href: "/dual-military-homes" },
  { label: "Military Divorce Housing", href: "/military-divorce-housing" },
  { label: "Military Rental Property", href: "/military-rental-property-management" },
  { label: "Military PCS Tax Deductions", href: "/military-pcs-tax-deductions" },
  { label: "Disabled Veteran Benefits (FL)", href: "/disabled-veteran-benefits-florida" },
  { label: "VA Disability Tax (FL)", href: "/va-disability-property-tax-florida" },
  { label: "Military School Zones", href: "/school-zones-military-families" },
  { label: "NAS Pensacola vs Hurlburt", href: "/nas-pensacola-vs-hurlburt-field" },
  { label: "Gulf Breeze vs Navarre", href: "/gulf-breeze-vs-navarre" },
  { label: "Niceville vs Crestview", href: "/niceville-vs-crestview" },
  { label: "On vs Off-Base: NAS Pensacola", href: "/on-base-vs-off-base-nas-pensacola" },
  { label: "On vs Off-Base: Corry Station", href: "/on-base-vs-off-base-corry-station" },
  { label: "On vs Off-Base: Saufley Field", href: "/on-base-vs-off-base-saufley-field" },
  { label: "On vs Off-Base: Whiting Field", href: "/on-base-vs-off-base-nas-whiting-field" },
  { label: "On vs Off-Base: Hurlburt Field", href: "/on-base-vs-off-base-hurlburt-field" },
  { label: "On vs Off-Base: Eglin AFB", href: "/on-base-vs-off-base-eglin-afb" },
  { label: "On vs Off-Base: Duke Field", href: "/on-base-vs-off-base-duke-field" },
  { label: "FAQ", href: "/faq" },
  { label: "Reviews", href: "/reviews" },
];


const IMG = {
  heroWindow: "/images/hero-window.jpg",
  window: "/images/hero-window.jpg",
  office: "/images/office.jpg",
  navyNoTie: "/images/gregg-navy-no-tie.jpg",
  grayNoTie: "/images/gregg-gray-no-tie.jpg",
  navyTie: "/images/gregg-navy-tie.jpg",
  logoStacked: "/images/logo-stacked.png",
  logoHoriz: "/images/logo-horizontal.png",
  logoH: "/images/logo-horizontal.png",
  logo08: "/images/logo-08-sm.png",
  logoLrr: "/images/logo-lrr.png",
  ocpPortrait: "/images/mil-ocp-portrait.jpg",
  deployedCrew: "/images/mil-deployed-crew.jpg",
  familyAwacs: "/images/mil-family-awacs.jpg",
  closingDay: "/images/office.jpg",
  closing4196: "/images/gregg-4196.jpg",
  closing4197: "/images/gregg-4197.jpg",
  flightsuitAwacs: "/images/mil-flightsuit-awacs.jpg",
  promotion: "/images/mil-promotion.jpg",
  kidsCockpit: "/images/mil-kids-cockpit.jpg",
  flightlineWalk: "/images/mil-flightline-walk.jpg",
  cockpitSolo: "/images/mil-cockpit-solo.jpg",
  dressBlues: "/images/mil-dress-blues.jpg",
  awacsRefuel: "/images/mil-awacs-refuel.jpg",
  awacsReflection: "/images/mil-awacs-reflection.jpg",
  t6Cockpit: "/images/mil-t6-cockpit.jpg",
  vetHandshake: "/images/mil-vet-handshake.jpg",
  serviceBlues: "/images/mil-service-blues.jpg",
  awacsFlightline: "/images/mil-awacs-flightline.jpg",
  flightlineOCPs: "/images/mil-flightline-ocps.jpg",
  aboutAwacsFlightline: "/images/about-awacs-flightline.jpg",
  aboutFlightsuitAwacs: "/images/about-flightsuit-awacs.jpg",
  aboutDeployedCrew: "/images/about-deployed-crew.jpg",
  aboutServiceBlues: "/images/about-service-blues.jpg",
  aboutPromotion: "/images/about-promotion.jpg",
  aboutAwacsFoggy: "/images/about-awacs-foggy.jpg",
  aboutFlightlineOCPs: "/images/about-flightline-ocps.jpg",
  aboutCockpitTanker: "/images/about-cockpit-tanker.jpg",
  aboutFlightsuitMom: "/images/about-flightsuit-mom.jpg",
  storyOcpSelfie: "/images/story-ocp-selfie.jpg",
};

// Google Business Profile, same destination the reviews page uses for "read the Google reviews".
const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd";

// Rendered-width hints per layout context: <Pic> hands these to the browser so it can pick a
// rung of the 480/768/1200 width ladder instead of the full-size file. Mirrors the SIZES
// presets in scripts/apply-responsive-images.mjs, which does the same job for the static pages.
const PIC_SIZES = {
  default: "(max-width: 940px) 92vw, 900px",
  storyTile: "(max-width: 480px) calc(100vw - 64px), (max-width: 820px) 46vw, 300px",
  closing: "(max-width: 768px) 62vw, 400px",
  heroPortrait: "(max-width: 820px) calc(100vw - 64px), 400px",
  careerWide: "(max-width: 820px) calc(100vw - 64px), 510px",
  careerTile: "(max-width: 480px) calc(100vw - 64px), (max-width: 820px) calc(50vw - 36px), 250px",
  halfBand: "(max-width: 712px) calc(100vw - 64px), 616px",
  pcsPortrait: "(max-width: 948px) 45vw, 400px",
  contactRound: "(max-width: 408px) calc(100vw - 48px), 360px",
  communityCard: "(max-width: 680px) calc(100vw - 48px), (max-width: 948px) calc(50vw - 32px), 442px",
};

// <Pic> renders a <picture> element with AVIF + WebP + original sources for any
// /images/*.jpg|png path, with width descriptors whenever width variants exist. The variants
// come from scripts/generate-responsive-images.mjs, which also writes the src/imageVariants.js
// manifest imported above: the component cannot check the disk, so it only ever offers
// candidates the manifest lists. That matters because an avif or webp variant is deleted when
// it is not smaller than the jpg at the same width, so the ladders are ragged per format.
// An image with no manifest entry (the logos, the partner marks) keeps the old
// single-candidate markup, and a non-/images/ src (or a remote URL) still falls through to a
// plain <img>. A "?v=" cache-buster is split off before matching and re-appended to every
// candidate, so the query keeps busting the original and never breaks the lookup.
const Pic = ({ src, alt = "", loading = "lazy", sizes, style, className, ...rest }) => {
  const [path, query] = src ? src.split(/(\?.*)$/) : ["", ""];
  const m = path && /^\/images\/.+\.(jpe?g|png)$/i.exec(path);
  if (!m) return <img src={src} alt={alt} loading={loading} style={style} className={className} {...rest} />;
  const q = query || "";
  const base = path.replace(/\.(jpe?g|png)$/i, "");
  const v = IMAGE_VARIANTS[path];
  if (!v) return (
    <picture>
      <source srcSet={`${base}.avif${q}`} type="image/avif" />
      <source srcSet={`${base}.webp${q}`} type="image/webp" />
      <img src={src} alt={alt} loading={loading} style={style} className={className} {...rest} />
    </picture>
  );
  const ext = /\.png$/i.test(path) ? "png" : "jpg";
  const sz = sizes || PIC_SIZES.default;
  const srcSetFor = (fmt) => {
    const list = v[fmt];
    if (!list || !list.length) return "";
    return list.map((w) => `${w === v.w ? (fmt === ext ? path : `${base}.${fmt}`) : `${base}-${w}.${fmt}`}${q} ${w}w`).join(", ");
  };
  const avif = srcSetFor("avif"), webp = srcSetFor("webp"), fallback = srcSetFor(ext);
  return (
    <picture>
      {avif ? <source srcSet={avif} sizes={sz} type="image/avif" /> : null}
      {webp ? <source srcSet={webp} sizes={sz} type="image/webp" /> : null}
      <img src={src} alt={alt} loading={loading} {...(fallback ? { srcSet: fallback, sizes: sz } : {})} style={style} className={className} {...rest} />
    </picture>
  );
};

const Nav = ({ current, go }) => {
  const [scrolled, setScrolled] = useState(false);
  const [basesOpen, setBasesOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [pcsOpen, setPcsOpen] = useState(false);
  const [vaOpen, setVaOpen] = useState(false);
  // Mobile drawer (audit 2026-09-02, mob-01/02/07): under 900px the tab bar lives in a
  // full-height panel behind a hamburger; dropdown headers toggle instead of navigating.
  const [menuOpen, setMenuOpen] = useState(false);
  const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
  useEffect(() => { setMenuOpen(false); setPcsOpen(false); setBasesOpen(false); setCommsOpen(false); setResourcesOpen(false); setVaOpen(false); }, [current]);
  useEffect(() => {
    document.body.classList.toggle("drawer-open", menuOpen);
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const tabStyle = (active) => ({
    background: active ? "rgba(201,168,76,0.15)" : "transparent",
    border: "none",
    color: active ? C.gold : "rgba(255,255,255,0.8)",
    padding: "6px 10px",
    fontSize: 11,
    cursor: "pointer",
    borderRadius: 4,
    fontWeight: active ? 700 : 500,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    fontFamily: SS,
    textDecoration: "none",
    display: "inline-block",
  });

  const Tab = ({ id, label }) => (
    <button onClick={() => go(id)} style={tabStyle(current === id)}>{label}</button>
  );

  const ExtTab = ({ href, label }) => (
    <a href={href} style={tabStyle(false)}>{label}</a>
  );

  const DropItem = ({ href, label }) => (
    <a href={href} style={{ display: "block", width: "100%", textAlign: "left", textDecoration: "none", color: "rgba(255,255,255,0.85)", padding: "11px 16px", fontSize: 12, borderRadius: 4, fontFamily: SS, fontWeight: 500 }}>{label}</a>
  );

  const basesActiveIds = ["nas", "whiting", "corry", "eglin", "hurlburt"];
  const basesActive = basesActiveIds.includes(current);
  const commsActive = current === "neighborhoods";

  return (
    <nav className="spa-nav" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(10,15,26,0.95)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "all .3s ease" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "10px 16px 0", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
        <div style={{ justifySelf: "start", cursor: "pointer" }} onClick={() => go("home")}>
          <Pic loading="eager" width={834} height={472} src={IMG.logoLrr} alt="Levin Rinke Realty" style={{ height: 108, objectFit: "contain" }} />
        </div>
        <div style={{ justifySelf: "center", cursor: "pointer" }} onClick={() => go("home")}>
          <Pic loading="eager" width={480} height={196} src={IMG.logo08} alt="The Costin Team" style={{ height: 108, objectFit: "contain" }} />
        </div>
        <div style={{ justifySelf: "end", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <a href="tel:8502665005" style={{ color: C.gold, fontSize: 20, fontWeight: 700, textDecoration: "none", letterSpacing: 0.5, fontFamily: SS, whiteSpace: "nowrap" }}>(850) 266-5005</a>
          <a href="mailto:Gregg.Costin@gmail.com" style={{ color: C.gold, fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: 0.3, fontFamily: SS, whiteSpace: "nowrap" }}>Gregg.Costin@gmail.com</a>
        </div>
        <button type="button" className="nav-toggle" aria-controls="spa-drawer" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>
        </button>
      </div>

      <div id="spa-drawer" className={"spa-drawer" + (menuOpen ? " open" : "")}>
      <div className="tabbar" style={{ maxWidth: 1320, margin: "0 auto", padding: "6px 12px 10px", overflowX: "visible", display: "flex", gap: 2, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <Tab id="home" label="Home" />
        <Tab id="about" label="About Me" />
        <ExtTab href="/buy" label="Buy" />
        <ExtTab href="/sell" label="Sell" />
        <ExtTab href="/pcs-home-search" label="Search Homes" />

        <div className="spa-drop" style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => { if (!isPhone()) setPcsOpen(true); }}
          onMouseLeave={() => { if (!isPhone()) setPcsOpen(false); }}>
          <button onClick={() => { if (isPhone()) { setPcsOpen((o) => !o); } else { go("pcs"); setPcsOpen(false); } }} aria-haspopup="true" aria-expanded={pcsOpen} style={tabStyle(current === "pcs")}>PCS Guide ▾</button>
          {pcsOpen && (
            <div className="spa-dropmenu" style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 240, boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              {PCS_LINKS.map(c => <DropItem key={c.href} href={c.href} label={c.label} />)}
            </div>
          )}
        </div>

        <div className="spa-drop" style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => { if (!isPhone()) setBasesOpen(true); }}
          onMouseLeave={() => { if (!isPhone()) setBasesOpen(false); }}>
          <button onClick={() => setBasesOpen(!basesOpen)} aria-haspopup="true" aria-expanded={basesOpen} style={tabStyle(basesActive)}>Bases ▾</button>
          {basesOpen && (
            <div className="spa-dropmenu" style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 220, boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              {BASES_LINKS.map(b => <DropItem key={b.href} href={b.href} label={b.label} />)}
            </div>
          )}
        </div>

        <div className="spa-drop" style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => { if (!isPhone()) setCommsOpen(true); }}
          onMouseLeave={() => { if (!isPhone()) setCommsOpen(false); }}>
          <button onClick={() => { if (isPhone()) { setCommsOpen((o) => !o); } else { go("neighborhoods"); setCommsOpen(false); } }} aria-haspopup="true" aria-expanded={commsOpen} style={tabStyle(commsActive)}>Communities ▾</button>
          {commsOpen && (
            <div className="spa-dropmenu" style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 240, maxHeight: 440, overflowY: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              <button onClick={() => { go("neighborhoods"); setCommsOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: commsActive ? "rgba(201,168,76,0.12)" : "transparent", border: "none", color: C.gold, padding: "10px 16px", fontSize: 11, cursor: "pointer", borderRadius: 4, fontFamily: SS, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${C.hairline}`, marginBottom: 4 }}>All Communities Overview</button>
              {COMMUNITY_LINKS.map(c => <DropItem key={c.href} href={c.href} label={c.label} />)}
            </div>
          )}
        </div>

        <div className="spa-drop" style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => { if (!isPhone()) setResourcesOpen(true); }}
          onMouseLeave={() => { if (!isPhone()) setResourcesOpen(false); }}>
          <button onClick={() => setResourcesOpen(!resourcesOpen)} aria-haspopup="true" aria-expanded={resourcesOpen} style={tabStyle(false)}>Resources ▾</button>
          {resourcesOpen && (
            <div className="spa-dropmenu" style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 260, maxHeight: 440, overflowY: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              {RESOURCE_LINKS.map(c => <DropItem key={c.href} href={c.href} label={c.label} />)}
            </div>
          )}
        </div>

        <div className="spa-drop" style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => { if (!isPhone()) setVaOpen(true); }}
          onMouseLeave={() => { if (!isPhone()) setVaOpen(false); }}>
          <a href="/va-loan-guide" onClick={(e) => { if (isPhone()) { e.preventDefault(); setVaOpen((o) => !o); } else setVaOpen(false); }} aria-haspopup="true" aria-expanded={vaOpen} style={tabStyle(false)}>VA Loan Guide ▾</a>
          {vaOpen && (
            <div className="spa-dropmenu" style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 240, boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              {VA_LINKS.map(c => <DropItem key={c.href} href={c.href} label={c.label} />)}
            </div>
          )}
        </div>
        <Tab id="calculator" label="Calculators" />
        <ExtTab href="/blog" label="Blog" />
        <ExtTab href="/reviews" label="Reviews" />
        <Tab id="contact" label="Contact" />
        <button
          type="button"
          onClick={() => { const d = document.getElementById("search-modal"); if (d && d.showModal) d.showModal(); }}
          aria-label="Search the site"
          style={{ background: "transparent", border: `1px solid ${C.gold}66`, color: C.gold, cursor: "pointer", padding: "5px 10px", fontSize: 11, fontWeight: 500, letterSpacing: ".5px", textTransform: "uppercase", fontFamily: "inherit", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 4 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search</span>
        </button>
      </div>
      </div>
    </nav>
  );
};

/* ═══════════════ PRIMITIVES ═══════════════ */
const Eyebrow = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
    <span style={{ height: 1, width: 32, background: C.goldLine }} />
    <span style={{ color: C.gold, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", fontFamily: SS }}>{children}</span>
  </div>
);
const H2 = ({ children, align = "left" }) => (
  <h2 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.15, color: "#fff", textAlign: align, marginTop: 48, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${C.goldLine}` }}>{children}</h2>
);
const H3 = ({ children }) => <h3 style={{ fontSize: 20, color: C.gold, marginTop: 34, marginBottom: 12, fontWeight: 700, fontFamily: SF }}>{children}</h3>;
const H3G = H3;
const Body = ({ children }) => <p style={{ color: C.text, fontSize: 17, lineHeight: 1.75, marginBottom: 16, fontWeight: 400 }}>{children}</p>;
const P = ({ children }) => <p style={{ color: "#bbb", fontSize: 15, lineHeight: 1.85, marginBottom: 16 }}>{children}</p>;
const Li = ({ children }) => <li style={{ color: "#bbb", fontSize: 15, lineHeight: 1.85, marginBottom: 8, paddingLeft: 4 }}>{children}</li>;
const BtnP = ({ children, onClick, href }) => {
  const s = { display: "inline-flex", alignItems: "center", gap: 10, background: C.gold, color: C.ink, border: "none", padding: "16px 30px", fontSize: 12, fontWeight: 600, letterSpacing: 2.2, textTransform: "uppercase", cursor: "pointer", textDecoration: "none", fontFamily: SS };
  return href ? <a href={href} style={s}>{children} →</a> : <button onClick={onClick} style={s}>{children} →</button>;
};
const BtnG = ({ children, onClick, href }) => {
  const s = { display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "15px 28px", fontSize: 12, fontWeight: 500, letterSpacing: 2.2, textTransform: "uppercase", cursor: "pointer", textDecoration: "none", fontFamily: SS };
  return href ? <a href={href} style={s}>{children}</a> : <button onClick={onClick} style={s}>{children}</button>;
};
const Section = ({ children, bg = C.ink }) => (
  <section style={{ background: bg, padding: "120px 32px" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>{children}</div>
  </section>
);
// GA4 event helpers — no-op if gtag isn't present (SSR/prerender/ad-block).
function track(event, params) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params || {});
  }
}
// First-touch attribution (audit 2026-09-02, analytics-02): index.html stores utm_* / landing
// page / referrer in localStorage 'costin_attr'; every lead payload carries it plus the GA4
// client id so the contact worker can tag the Follow Up Boss person.
function withAttribution(payload) {
  let attr = {};
  try { attr = JSON.parse(localStorage.getItem("costin_attr") || "{}"); } catch {}
  let gaClientId = "";
  try { const m = document.cookie.match(/(?:^|; )_ga=GA\d\.\d\.(\d+\.\d+)/); if (m) gaClientId = m[1]; } catch {}
  return { ...payload, ...attr, ga_client_id: gaClientId, page_path: window.location.pathname, sourceUrl: window.location.href };
}

function trackPageView(path) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "page_view", { page_path: path, page_location: window.location.origin + path, page_title: document.title });
  }
}
// FollowUpBoss loads once per visit (deferred in index.html); without this, SPA route
// changes never reach the CRM's visitor timeline.
function trackFUBPageView() {
  if (typeof window !== "undefined" && typeof window.widgetTracker === "function") {
    window.widgetTracker("send", "pageview");
  }
}
const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${CHARCOAL}` }}>
      <button onClick={() => { if (!open) track("faq_expand", { event_category: "engagement", event_label: typeof q === "string" ? q.slice(0, 100) : "faq" }); setOpen(!open); }} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "18px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, paddingRight: 16, fontFamily: SF }}>{q}</span>
        <span style={{ color: C.gold, fontSize: 20, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 0 18px", color: C.muted, fontSize: 14, lineHeight: 1.8 }}>{a}</div>}
    </div>
  );
};
const InfoBox = ({ title, children }) => (
  <div style={{ background: C.goldTint, border: `1px solid ${C.goldLine}`, borderRadius: 10, padding: 24, marginTop: 24, marginBottom: 24 }}>
    {title && <div style={{ color: C.gold, fontSize: 14, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>}
    <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </div>
);
const ComparisonTable = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", marginTop: 16, marginBottom: 24 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr>{headers.map((h, i) => <th key={i} style={{ background: C.elevated, color: C.gold, padding: "12px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: .5, borderBottom: `2px solid ${C.goldLine}` }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: "10px 14px", color: "#bbb", borderBottom: `1px solid ${CHARCOAL}` }}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
);
const PageWrapper = ({ children }) => (
  <div className="page-wrap" style={{ background: C.ink, minHeight: "100vh", paddingTop: 200 }}>{children}</div>
);
const PageHero = ({ title, subtitle, breadcrumb }) => (
  <section style={{ background: `linear-gradient(135deg, ${C.panel}, #1a2332)`, paddingTop: 72, paddingBottom: 72, paddingLeft: 24, paddingRight: 24, borderBottom: `1px solid ${C.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <div style={{ maxWidth: 900, width: "100%" }}>
      {breadcrumb && <div style={{ color: C.muted, fontSize: 12, marginBottom: 16, letterSpacing: 1, textAlign: "center" }}>{breadcrumb}</div>}
      <h1 style={{ fontFamily: SF, fontSize: "clamp(28px,4vw,42px)", color: "#fff", lineHeight: 1.2, marginTop: 0, marginBottom: 12, fontWeight: 500, textAlign: "center" }}>{title}</h1>
      {subtitle && <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>{subtitle}</p>}
    </div>
  </section>
);
const Content = ({ children }) => (
  <section style={{ padding: "48px 24px" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
  </section>
);

/* ═══════════════ HERO ═══════════════ */
const Hero = ({ go }) => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  return (
  <section className="hero-section" style={{ position: "relative", minHeight: "100vh", background: C.ink, overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 180 }}>
    <div className="hero-bg-image" style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0 }}>
      {/* perf-08 / media-09: sizing and cropping live in src/index.css plus the index.html media queries.
          Keep sizes identical to imagesizes on the index.html hero preload. This srcset is hand-written:
          scripts/apply-responsive-images.mjs only rewrites HTML pages, never JSX. */}
      <picture>
        <source type="image/avif" srcSet="/images/hero-window-480.avif 480w, /images/hero-window-768.avif 768w, /images/hero-window-1200.avif 1200w, /images/hero-window.avif 2000w" sizes="(max-width: 900px) 100vw, 900px" />
        <source type="image/webp" srcSet="/images/hero-window-480.webp 480w, /images/hero-window-768.webp 768w, /images/hero-window-1200.webp 1200w, /images/hero-window.webp 2000w" sizes="(max-width: 900px) 100vw, 900px" />
        <img src="/images/hero-window.jpg" srcSet="/images/hero-window-480.jpg 480w, /images/hero-window-768.jpg 768w, /images/hero-window-1200.jpg 1200w, /images/hero-window.jpg 2000w" sizes="(max-width: 900px) 100vw, 900px" width="2000" height="2000" alt="Morning light through the front window of a Pensacola home" fetchPriority="high" decoding="async" />
      </picture>
    </div>
    <div className="hero-gradient-h" style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0, background: `linear-gradient(90deg,${C.ink} 0%,${C.ink} 30%,rgba(10,15,26,0.75) 55%,rgba(10,15,26,0.25) 80%,rgba(10,15,26,0.1) 100%)` }} />
    <div className="hero-gradient-v" style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg,transparent 0%,transparent 70%,${C.ink} 100%)` }} />
    <div className="hero-glow" style={{ position: "absolute", top: "20%", right: "5%", width: 500, height: 500, background: `radial-gradient(circle,${C.goldTint} 0%,transparent 70%)`, pointerEvents: "none" }} />
    <div className="hero-content" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1280, margin: "0 auto", padding: "40px 32px 120px" }}>
      <div style={{ maxWidth: 720 }}>
        <Eyebrow>Retired USAF Combat Systems Officer · E-3 AWACS</Eyebrow>
        <h1 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(40px,5.2vw,68px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
          Pensacola's <span style={{ fontSize: "1.2em", fontWeight: 700 }}>#1</span><br />
          <span style={{ fontStyle: "italic", color: C.gold, fontWeight: 400 }}>military relocation</span><br />
          REALTOR&reg;
        </h1>
        <p style={{ marginTop: 28, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", maxWidth: 580, fontWeight: 300 }}>
          PCS and VA loan expertise for active duty, veterans, and military families buying, selling, and building wealth across the Florida Panhandle and Gulf Coast.
        </p>
        <p style={{ marginTop: 16, fontSize: 13, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
          NAS Pensacola · Corry Station · Whiting Field · Eglin AFB · Hurlburt Field
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <BtnP onClick={() => { if (hasSubmittedInquiry()) { window.location.href = "/pcs-home-search"; } else { setInquiryOpen(true); } }}>Start Your PCS Search</BtnP>
          <BtnG href="/pcs-home-search">Browse Live MLS Listings</BtnG>
          <BtnG href="tel:8502665005">Call 850-266-5005</BtnG>
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "MRP®", href: "https://www.nar.realtor/education/designations-and-certifications/military-relocation-professional-mrp", title: "Military Relocation Professional: NAR designation" },
            { label: "ABR®", href: "https://www.nar.realtor/education/designations-and-certifications/accredited-buyers-representative-abr", title: "Accredited Buyer's Representative: NAR designation" },
            { label: "SRS®", href: "https://www.nar.realtor/education/designations-and-certifications/seller-representative-specialist-srs", title: "Seller Representative Specialist: NAR designation" },
            { label: "RENE®", href: "https://www.nar.realtor/education/designations-and-certifications/real-estate-negotiation-expert-rene", title: "Real Estate Negotiation Expert: NAR designation" },
            { label: "FMS®", href: "https://www.floridarealtors.org/education", title: "Florida Military Specialist: Florida Realtors designation" },
          ].map(({ label, href, title }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener"
              title={title} className="hero-pill"
              style={{ border: `1px solid ${C.goldLine}`, padding: "8px 16px", color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, fontFamily: SS, textDecoration: "none", display: "inline-block", transition: "background .2s, border-color .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.10)"; e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.goldLine; }}
            >{label}</a>
          ))}
        </div>
      </div>
    </div>
    <div className="hero-stats" style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, borderTop: `1px solid ${C.hairline}`, background: "rgba(10,15,26,0.85)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "22px 44px", textAlign: "center" }}>
        {[["USAF", "Prior Enlisted, Retired Combat Systems Officer", "/about"], ["11", "Personal PCS Moves", "/about"], ["Top 0.8%", "Pensacola Agents", "/reviews"], ["5.0 ★", "Zillow Premier Agent", "https://www.zillow.com/profile/GreggCostin"], ["5.0 ★", "Google Reviews", GOOGLE_REVIEWS_URL]].map(([n, l, href]) => {
          const inner = (
            <>
              <div style={{ fontFamily: SF, fontSize: 32, color: C.gold, fontWeight: 500, lineHeight: 1 }}>{n}</div>
              <div style={{ marginTop: 8, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: C.muted, fontFamily: SS }}>{l}</div>
            </>
          );
          const external = href && href.startsWith("http");
          return href
            ? <a key={l} href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})} style={{ textDecoration: "none", display: "block", cursor: "pointer" }}>{inner}</a>
            : <div key={l}>{inner}</div>;
        })}
      </div>
    </div>
    {inquiryOpen && <InquiryModal onClose={() => setInquiryOpen(false)} />}
  </section>
  );
};

const InquiryModal = ({ onClose }) => {
  const dialogRef = useRef(null);
  const headingId = useId();
  useEffect(() => {
    track("inquiry_open", { cta_location: "spa-modal", page_path: window.location.pathname });
    const prevFocus = document.activeElement;
    const node = dialogRef.current;
    const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => node ? Array.from(node.querySelectorAll(sel)) : [];
    const firstEl = focusables()[0];
    if (firstEl) firstEl.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(10,15,26,0.92)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 20px 40px", overflowY: "auto" }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId} onClick={e => e.stopPropagation()} style={{ background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "40px 32px 32px", width: "100%", maxWidth: 560, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 14, background: "transparent", border: "none", color: "#999", fontSize: 28, lineHeight: 1, cursor: "pointer", padding: 6 }}>×</button>
        <h2 id={headingId} style={{ fontFamily: SF, fontSize: 26, color: "#fff", margin: "0 0 8px", textAlign: "center", fontWeight: 500 }}>Start Your PCS Search</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 8px", textAlign: "center" }}>Tell me a bit about your move. I respond within 2 hours during business hours.</p>
        <InquiryForm />
      </div>
    </div>
  );
};

const TrustBar = () => (
  <section className="trust-bar" style={{ background: C.ink, borderBottom: `1px solid ${C.hairline}`, padding: "40px 32px" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ textAlign: "center", color: C.gold, fontSize: 18, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", fontFamily: SS, marginBottom: 32, textDecoration: "underline", textUnderlineOffset: 6, textDecorationThickness: 2 }}>Preferred Agent</div>
      <div className="trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 48, alignItems: "start" }}>
        {[
          { name: "VeteranPCS", logo: "/images/partner-veteranpcs.png" },
          { name: "TIER 1 PCS", logo: "/images/partner-tier1.png" },
          { name: "M.O.R.E. Network", logo: "/images/partner-more.png" },
          { name: "Levin Rinke Realty", logo: "/images/partner-lrr.png" },
          { name: "Forbes Global Properties", logo: "/images/partner-forbes.png" },
        ].map(({ name, logo }) => (
          <a key={name} href="/about" aria-label={`${name}: see Gregg's credentials`} className="trust-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textDecoration: "none", cursor: "pointer" }}>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: SS, textAlign: "center" }}>{name}</div>
            <div style={{ width: 200, height: 135, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Pic loading="lazy" src={logo} alt={name} style={{ maxHeight: 135, maxWidth: 200, objectFit: "contain", display: "block", opacity: 0.9 }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

const Services = ({ go }) => (
  <Section>
    <div style={{ textAlign: "center", marginBottom: 72, maxWidth: 640, margin: "0 auto 72px" }}>
      <Eyebrow>How I Serve</Eyebrow>
      <H2 align="center">Built for Military Families</H2>
      <p style={{ fontSize: 17, lineHeight: 1.75, maxWidth: 620, color: C.muted, fontWeight: 300 }}>
        Whether you're PCSing in, selling before your next assignment, or investing in Gulf Coast real estate, every engagement starts with strategy and ends with results.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 1, background: C.hairline, border: `1px solid ${C.hairline}` }}>
      {[
        { title: "PCS Relocation", link: "pcs", desc: "Complete relocation support for military families moving to the Florida Panhandle. Virtual tours, closing coordination across time zones, and deep knowledge of every base community." },
        { title: "VA Home Loans", link: "__external:/va-loan-guide", desc: "Expert guidance through the VA loan process. Zero down payment, no PMI, competitive rates. I've helped hundreds of military families leverage their earned benefit to build real wealth." },
        { title: "Sell Your Home", link: "__external:/sell", desc: "PCSing out? I'll get your home sold fast and for top dollar with aggressive marketing, professional photography, and pricing strategy backed by real market data." },
      ].map(({ title, desc, link }) => (
        <div key={title} onClick={() => { if (link.startsWith("__external:")) { window.location.href = link.slice(11); } else { go(link); } }} style={{ background: C.ink, padding: "48px 40px", cursor: "pointer", minHeight: 320, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: SF, color: "#fff", fontSize: 26, fontWeight: 500, margin: "0 0 16px" }}>{title}</h3>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, fontWeight: 300, flex: 1 }}>{desc}</p>
          <div style={{ marginTop: 24, color: C.gold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: SS }}>Learn More →</div>
        </div>
      ))}
    </div>
  </Section>
);

const MilitaryStory = ({ go }) => (
  <Section bg={C.panel}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
      <div>
        <Eyebrow>A Full USAF Career: Enlisted to Officer</Eyebrow>
        <H2>I didn't just study the military lifestyle. I lived it.</H2>
        <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted, fontWeight: 300, marginBottom: 24 }}>
          I am a Prior-Enlisted, Retired USAF Combat Systems Officer on the E-3 AWACS. 11 PCS moves. Deployments to combat zones. I know what it feels like to house-hunt from 6,000 miles away with a family counting on you to get it right.
        </p>
        <p style={{ fontSize: 15.5, lineHeight: 1.85, color: C.text, fontWeight: 300, marginBottom: 32 }}>
          That experience drives everything I do as a Realtor. When you call me 90 days before PCS, I already know the questions you haven't thought to ask yet, because I've been in your exact seat.
        </p>
        <BtnP onClick={() => go("about")}>Read My Full Story</BtnP>
      </div>
      <div className="home-story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <Pic loading="lazy" sizes={PIC_SIZES.storyTile} src={IMG.aboutDeployedCrew} alt="Deployed crew with E-3 AWACS and Canadian flag" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
        <div style={{ background: C.ink }}>
          <Pic loading="lazy" sizes={PIC_SIZES.storyTile} src={IMG.storyOcpSelfie} alt="In OCPs on deployment" style={{ width: "100%", height: 220, objectFit: "contain", objectPosition: "center", display: "block" }} />
        </div>
        <div>
          <Pic loading="lazy" sizes={PIC_SIZES.storyTile} src={IMG.aboutServiceBlues} alt="Service Dress blues at commissioning" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
        <div>
          <Pic loading="lazy" sizes={PIC_SIZES.storyTile} src={IMG.aboutPromotion} alt="Promotion ceremony: Always With Honor" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
      </div>
    </div>
  </Section>
);

const SocialProof = ({ go }) => (
  <Section>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <Pic loading="eager" sizes={PIC_SIZES.closing} src={IMG.closing4196} alt="Gregg Costin with happy clients at closing: Home Sweet Home" style={{ width: "65%", aspectRatio: "1600 / 1220", objectFit: "cover", display: "block" }} />
        <Pic loading="eager" sizes={PIC_SIZES.closing} src={IMG.closing4197} alt="Another great closing with Gregg Costin and clients" style={{ width: "65%", aspectRatio: "1600 / 1220", objectFit: "cover", display: "block" }} />
        <p style={{ color: C.mutedD, fontSize: 11, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>Closing Days: Serving Clients Across the Florida Panhandle</p>
      </div>
      <div>
        <Eyebrow>Results</Eyebrow>
        <H2>The mission doesn't end at the offer.</H2>
        <div style={{ marginTop: 24 }}>
          {[
            { text: "Relocating our family all the way from Washington State to Florida felt like a massive, overwhelming task, but Gregg was an absolute lifesaver. He is truly a professional who went above and beyond for us every step of the way.", from: "Eric Johnson, Relocated from Washington State" },
            { text: "From the very beginning, he set himself apart by taking the time to meet with us, understand our situation, and tailor his approach specifically to our needs as a military family.", from: "Joshua Slavens, Military Family" },
            { text: "We were extremely fortunate to meet Gregg by chance during our home search journey. He provided much more than we ever expected from a realtor. As a Veteran I cannot recommend him more highly.", from: "Darin Vazquez, Veteran" },
          ].map((r, i) => (
            <div key={i} style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 24, marginBottom: 16 }}>
              <div style={{ color: C.gold, fontSize: 16, marginBottom: 8 }}>★★★★★</div>
              <p style={{ color: C.text, fontSize: 14.5, lineHeight: 1.8, fontStyle: "italic", marginBottom: 10, fontWeight: 300 }}>"{r.text}"</p>
              <p style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>{r.from}</p>
            </div>
          ))}
        </div>
        <BtnG href="/reviews">Read All Reviews</BtnG>
      </div>
    </div>
  </Section>
);

const CtaBanner = ({ go }) => (
  <section style={{ position: "relative", padding: "100px 32px", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/mil-family-awacs.webp)", backgroundSize: "cover", backgroundPosition: "center center" }} />
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,15,26,0.82)" }} />
    <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(28px,3.5vw,48px)", lineHeight: 1.1, color: "#fff", marginBottom: 20 }}>
        PCS orders in hand?<br />
        <span style={{ color: C.gold, fontStyle: "italic" }}>Let's find your next home.</span>
      </h2>
      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px", fontWeight: 300 }}>
        Whether you're 90 days out or boots-on-ground tomorrow, I respond to every inquiry within 2 hours during business hours.
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <BtnP href="tel:8502665005">Call 850-266-5005</BtnP>
        <BtnG href="/book-pcs-call">Book a 15-Min Strategy Call</BtnG>
        <BtnG onClick={() => go("contact")}>Send a Message</BtnG>
      </div>
    </div>
  </section>
);

const BasesAndCommunitiesSection = () => {
  const cardStyle = { background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 20, textDecoration: "none", display: "block", transition: "border-color 0.2s" };
  const cardHover = e => (e.currentTarget.style.borderColor = C.goldLine);
  const cardLeave = e => (e.currentTarget.style.borderColor = C.hairline);
  const colTitleStyle = { color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, marginTop: 0, fontFamily: SS };
  return (
    <section id="bases-communities" style={{ background: C.panel, padding: "96px 32px", borderTop: `1px solid ${C.hairline}` }}>
      <div id="bases"></div>
      <div id="neighborhoods"></div>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Eyebrow>Bases &amp; Communities</Eyebrow>
        <h2 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.15, color: "#fff", marginTop: 0, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${C.goldLine}` }}>Bases &amp; Communities We Serve</h2>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 780, fontWeight: 300 }}>Full PCS and housing guides for every installation and every neighborhood across the Pensacola and Fort Walton Beach Military Housing Areas. Click any card for the complete built-out guide.</p>

        <h3 style={colTitleStyle}>Bases</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 48 }}>
          {BASES_LINKS.map(b => (
            <a key={b.href} href={b.href} style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
              <div style={{ fontFamily: SF, color: "#fff", fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{b.label}</div>
              <div style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>{b.blurb}</div>
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginTop: 12, fontFamily: SS }}>Read Guide →</div>
            </a>
          ))}
        </div>

        <h3 style={colTitleStyle}>Communities</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {COMMUNITY_LINKS.map(c => (
            <a key={c.href} href={c.href} style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
              <div style={{ fontFamily: SF, color: "#fff", fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{c.label}</div>
              <div style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>{c.blurb}</div>
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginTop: 12, fontFamily: SS }}>Read Guide →</div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/faq" style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "12px 24px", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontFamily: SS }}>Full PCS FAQ →</a>
          <a href="/reviews" style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "12px 24px", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontFamily: SS }}>Client Reviews →</a>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ go }) => {
  const footerLinkStyle = { display: "block", background: "none", border: "none", color: C.muted, padding: "5px 0", fontSize: 13, cursor: "pointer", textAlign: "left", textDecoration: "none", fontFamily: SS };
  return (
    <footer style={{ background: C.ink, borderTop: `1px solid ${C.hairline}`, padding: "64px 32px 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <Pic loading="lazy" src={IMG.logoStacked} alt="The Costin Team" style={{ height: 160, marginBottom: 16 }} />
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>Levin Rinke Realty<br />220 W. Garden St., Pensacola, FL 32502<br />Licensed in Florida & Alabama</p>
          </div>
          <div>
            <div style={{ color: C.gold, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: SS }}>Quick Links</div>
            {["pcs", "neighborhoods", "contact"].map(id => {
              const p = pages.find(x => x.id === id);
              return <button key={id} onClick={() => go(id)} style={footerLinkStyle}>{p.label}</button>;
            })}
            <a href="/florida-homestead-exemption-military" style={footerLinkStyle}>Homestead</a>
            <a href="/reviews" style={footerLinkStyle}>Reviews</a>
            <a href="/buy" style={footerLinkStyle}>Buy a Home</a>
            <a href="/sell" style={footerLinkStyle}>Sell Your Home</a>
            <a href="/va-loan-guide" style={footerLinkStyle}>VA Loan Guide</a>
            <a href="/faq" style={footerLinkStyle}>PCS FAQ</a>
          </div>
          <div>
            <div style={{ color: C.gold, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: SS }}>Bases</div>
            {BASES_LINKS.map(b => <a key={b.href} href={b.href} style={footerLinkStyle}>{b.label}</a>)}
          </div>
          <div>
            <div style={{ color: C.gold, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: SS }}>Communities</div>
            {COMMUNITY_LINKS.map(c => <a key={c.href} href={c.href} style={footerLinkStyle}>{c.label}</a>)}
          </div>
          <div>
            <div style={{ color: C.gold, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: SS }}>Contact</div>
            <a href="tel:8502665005" style={{ color: "#fff", fontSize: 40, fontWeight: 600, textDecoration: "none", display: "block", marginBottom: 8, fontFamily: SF, whiteSpace: "nowrap" }}>(850) 266-5005</a>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}><a href="mailto:Gregg.Costin@gmail.com" style={{ color: C.muted, textDecoration: "none" }}>Gregg.Costin@gmail.com</a><br />Instagram: <a href="https://www.instagram.com/greggcostinrealtor/" target="_blank" rel="noopener" style={{ color: C.muted, textDecoration: "none" }}>@greggcostinrealtor</a><br />Facebook: <a href="https://www.facebook.com/greggcostin/" target="_blank" rel="noopener" style={{ color: C.muted, textDecoration: "none" }}>@greggcostin</a></p>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p data-costin-sites style={{ color: C.mutedD, fontSize: 11 }}>© 2026 The Costin Team. All rights reserved. | PensacolaMilitaryHousing.com for military &amp; PCS families · <a href="https://greggcostin.com" style={{ color: C.mutedD }}>GreggCostin.com</a> for civilian buying &amp; selling</p>
          <p style={{ color: C.mutedD, fontSize: 11 }}>Gregg Costin, Realtor® · MRP® · ABR® · SRS® · RENE® · FMS® · <a href="/privacy" style={{ color: C.mutedD }}>Privacy</a> · <a href="/accessibility" style={{ color: C.mutedD }}>Accessibility</a></p>
        </div>
        <p style={{ color: C.mutedD, fontSize: 10.5, fontStyle: "italic", lineHeight: 1.6, marginTop: 16, textAlign: "center", maxWidth: 1100, marginLeft: "auto", marginRight: "auto" }}>
          <strong>Disclaimer.</strong> Gregg Costin is a Florida- and Alabama-licensed Real Estate Agent with Levin Rinke Realty (220 W. Garden St., Pensacola, FL 32502). Information on this site (including BAH figures, VA loan terms, funding fees, tax rules, homestead and disability benefits, school zoning, and rental/investment commentary) is provided for general informational purposes only and is not legal, tax, financial, mortgage, lending, or investment advice. Real estate, lending, tax, and benefits rules change frequently and depend on individual circumstances; verify current figures with official sources (DoD BAH calculator, VA, IRS, your county property appraiser) and consult a licensed attorney, CPA, or NMLS-licensed loan officer for guidance specific to your situation. Gregg Costin is not a mortgage lender, attorney, tax professional, or financial advisor, and is not affiliated with, endorsed by, or representing the U.S. Department of Defense, Department of Veterans Affairs, or any branch of the U.S. military. Use of this site does not create an agency or fiduciary relationship; representation begins only upon a signed brokerage agreement. Equal Housing Opportunity.
        </p>
      </div>
    </footer>
  );
};

const AboutPage = ({ go }) => (
  <div>
    <section style={{ position: "relative", padding: "200px 32px 80px", background: C.ink }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 48, alignItems: "center" }}>
        <div>
          <Eyebrow>About Gregg Costin</Eyebrow>
          <h1 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", lineHeight: 1.05, color: "#fff", margin: "0 0 24px" }}>
            From the flight deck to your <span style={{ color: C.gold, fontStyle: "italic" }}>front door.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted, fontWeight: 300, maxWidth: 540 }}>
            I completed a full USAF career, starting as a prior-enlisted Staff Sergeant (E-5) and retiring as a Captain (O-3) serving as a Combat Systems Officer on the E-3 AWACS. Along the way I completed 11 PCS moves and multiple combat deployments. That experience is the foundation of everything I bring to real estate.
          </p>
        </div>
        <div className="about-hero-right" style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          <Pic className="about-hero-portrait" loading="lazy" sizes={PIC_SIZES.heroPortrait} src={IMG.navyNoTie} alt="Gregg Costin" style={{ flex: "1 1 auto", maxWidth: 400, height: 480, objectFit: "cover", objectPosition: "center top", display: "block" }} />
          <div className="about-hero-badges" style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            {[
              ["USAF Retired", "SSgt → Captain"],
              ["Prior Enlisted E-5", "2M0 AFSC"],
              ["11", "PCS Moves"],
              ["Combat Veteran", "OIF / OEF / GWOT"],
              ["E-3 AWACS", "Combat Systems Officer"],
            ].map(([big, small]) => (
              <div key={small} style={{ background: C.gold, padding: "14px 18px", minWidth: 150, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: SF, fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{big}</div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: C.ink, fontFamily: SS, marginTop: 6, fontWeight: 600 }}>{small}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <Section bg={C.panel}>
      <Eyebrow>Military Career</Eyebrow>
      <H2>Combat Systems Officer · E-3 AWACS</H2>
      <div className="about-career-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8, marginBottom: 40 }}>
        <div className="about-career-wide" style={{ gridColumn: "span 2" }}>
          <Pic loading="lazy" sizes={PIC_SIZES.careerWide} src={IMG.aboutAwacsFlightline} alt="E-3 AWACS on the flightline" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center", display: "block" }} />
          <p style={{ color: C.mutedD, fontSize: 11, marginTop: 6, letterSpacing: 1 }}>E-3 AWACS on the flightline</p>
        </div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutFlightsuitAwacs} alt="In flightsuit with E-3 AWACS" style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutDeployedCrew} alt="Deployed crew" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center 40%", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutServiceBlues} alt="Service Dress blues" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center 20%", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutPromotion} alt="Promotion ceremony" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center 30%", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutAwacsFoggy} alt="AWACS on a foggy flightline" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutFlightlineOCPs} alt="On the flightline in OCPs" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center top", display: "block" }} /></div>
        <div><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutCockpitTanker} alt="In cockpit with KC-135 tanker" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /></div>
        <div className="about-career-mom" style={{ background: C.ink }}><Pic loading="lazy" sizes={PIC_SIZES.careerTile} src={IMG.aboutFlightsuitMom} alt="In flightsuit with mom" style={{ width: "100%", height: 220, objectFit: "contain", objectPosition: "center", display: "block" }} /></div>
      </div>
      <H2>My Story: From Global Strategy to Local Real Estate Excellence</H2>
      <Body>My journey into real estate didn't start with a lifelong passion for houses; it started with a vow.</Body>
      <Body>When I bought my very first home early in my career, I was completely burned by a horrible agent. The experience left such a deep mark on me that I made a promise right then and there: I would self-educate to the absolute highest level so I would never have to rely on another real estate agent again. As I bought and sold properties across the entire United States during every military PCS move, I mastered the process from the ground up. I have experienced firsthand what it's like to have a terrible agent, which means I know exactly what it takes to be an exceptional one.</Body>
      <Body>My promise to you as a client is simple: to be better than anyone else out there in the local market. I bring that same relentless drive and determination to your transaction so you can completely avoid the pitfalls and mistakes I once faced. I aspire to be a cut above anyone else you come in contact with, delivering the absolute best in customer service, market knowledge, expertise, and fierce negotiation skills.</Body>
      <H2>Forged by Military Discipline</H2>
      <Body>That standard of excellence is rooted deeply in my military background. Over the course of my career in the United States Air Force, I evolved from hands-on technical expertise to high-level strategic planning.</Body>
      <Body>I began at the tip of the spear in nuclear deterrence as a 2M0 cruise missile technician, ensuring the readiness of payloads on the B-52 Stratofortress. After earning a prestigious double B.S. and B.A. degree from the University of Tampa, I commissioned as an officer and took to the skies. As a Navigator and Combat Systems Officer (CSO) aboard the E-3 AWACS, I managed complex tactical routing and electronic warfare across multiple deployments to combat zones including Iraq, Afghanistan, and Syria, as well as strategic hubs across the Middle East and the Pacific.</Body>
      <Body>My career culminated in the senior echelons of military strategy as the Chief of Integrated Air and Missile Defense (IAMD) Plans for CENTCOM A5, where I architected theater-wide defense strategies to protect our forward-deployed forces.</Body>
      <H2>The Gregg Costin Team Promise</H2>
      <Body>Today, I combine the precision, strategic planning, and unwavering discipline of a military war planner with my hard-earned real estate expertise. When you work with me, you aren't just getting an agent. You are getting an aggressively educated advocate who will fight for your best interests every single step of the way.</Body>
    </Section>

    <Section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 48, alignItems: "center" }}>
        <div>
          <Pic className="about-family-img" loading="lazy" sizes={PIC_SIZES.halfBand} src={IMG.kidsCockpit} alt="Family in AWACS cockpit" style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
          <p style={{ color: C.mutedD, fontSize: 11, marginTop: 6, letterSpacing: 1 }}>Sharing the mission with the next generation</p>
        </div>
        <div>
          <Eyebrow>Family Man</Eyebrow>
          <H2>11 PCS moves. I get it.</H2>
          <Body>When I say I understand the stress of a PCS move, I mean it. My family and I have lived it: packing up, finding homes from overseas, navigating schools and neighborhoods sight-unseen. Now I channel that experience into making your transition as smooth as possible.</Body>
          <Body>I am the preferred real estate agent for VeteranPCS, TIER 1 PCS, and the M.O.R.E. Network, three of the most respected military relocation organizations in the country. I'm also recognized as a Zillow Premier Agent in the top 5% of Pensacola-area Realtors with a perfect 5-star rating.</Body>
        </div>
      </div>
    </Section>

    <Section bg={C.panel}>
      <H2 align="center">Credentials & Recognition</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, marginTop: 40 }}>
        {[
          { title: "Military Relocation Professional (MRP®)", desc: "NAR certification for agents specializing in serving current and former military service members." },
          { title: "Florida Military Specialist (FMS®)", desc: "Florida Realtors (Florida Association of Realtors) certification for agents trained on Florida-specific military and veteran housing, VA loan, and PCS-relocation issues." },
          { title: "Accredited Buyer's Representative (ABR®)", desc: "NAR advanced buyer-representation training: negotiation, market analysis, and fiduciary advocacy." },
          { title: "Seller Representative Specialist (SRS®)", desc: "NAR premier seller-representation certification covering pricing, marketing, and listing strategy." },
          { title: "Real Estate Negotiation Expert (RENE®)", desc: "NAR certification for advanced offer and counter-offer negotiation techniques across all transaction types." },
          { title: "Forbes Global Properties · Rookie of the Year 2025", desc: "Recognized for outstanding transactions, sales volume, and market impact in first year." },
          { title: "Zillow Premier Agent · Top 0.8%", desc: "Perfect 5-star rating. Recognized among the top-performing agents in the Pensacola metro area." },
          { title: "Licensed FL + AL", desc: "Dual-licensed to serve military families across the Florida Panhandle and coastal Alabama markets." },
        ].map(c => (
          <div key={c.title} style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 28 }}>
            <h4 style={{ fontFamily: SF, color: C.gold, fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{c.title}</h4>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
    <CtaBanner go={go} />
  </div>
);

// Self-contained inquiry form, used inline on content pages (PCS guide,
// VA loan, etc.) without the surrounding ContactPage hero + contact-detail
// column. Keeps the same webhook and validation as the /contact page so
// leads land in the same inbox regardless of origin.
// localStorage flag so repeat visitors aren't asked for the same info twice.
const INQUIRY_KEY = "pmh-inquiry-submitted";
const hasSubmittedInquiry = () => { try { return localStorage.getItem(INQUIRY_KEY) === "1"; } catch { return false; } };
const markInquirySubmitted = () => { try { localStorage.setItem(INQUIRY_KEY, "1"); } catch {} };

const InquiryForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", inquiryType: "PCS / Relocation — Buying", message: "", honeypot: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const uid = useId();
  const WEBHOOK_URL = "https://costin-contact.gregg-costin.workers.dev";
  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    if (!formData.name.trim() || !formData.email.trim()) { setStatus("error"); setErrorMsg("Name and email are required."); return; }
    try {
      // The contact worker requires `message` and reads the honeypot from `_gotcha`.
      const payload = withAttribution({ name: formData.name, email: formData.email, phone: formData.phone, inquiryType: formData.inquiryType, message: formData.message.trim() || `Inquiry from ${window.location.pathname} (no message text)`, _gotcha: formData.honeypot });
      const response = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        markInquirySubmitted();
        track("inquiry_submit", { inquiry_type: formData.inquiryType, cta_location: "spa-inquiry-form", page_path: window.location.pathname });
        setFormData({ name: "", email: "", phone: "", inquiryType: "PCS / Relocation — Buying", message: "", honeypot: "" });
      } else { setStatus("error"); setErrorMsg(data.error || "Something went wrong. Please call (850) 266-5005."); }
    } catch (err) { setStatus("error"); setErrorMsg("Connection error. Please call (850) 266-5005 directly."); }
  };
  return (
    <div style={{ marginTop: 32 }}>
      <H3>Send a Message</H3>
      {status === "success" ? (
        <div style={{ background: "#1a3a1a", border: "2px solid #3aa03a", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <h4 style={{ color: "#6adf6a", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Message Received</h4>
          <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Thanks for reaching out. I've received your message and will respond within 2 hours during business hours.</p>
          <button onClick={() => setStatus("idle")} style={{ marginTop: 16, background: "transparent", border: `1px solid ${GOLD}55`, color: GOLD, padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Send Another Message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" name="website" value={formData.honeypot} onChange={handleChange("honeypot")} style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div>
            <label htmlFor={`${uid}-name`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Full Name *</label>
            <input id={`${uid}-name`} type="text" value={formData.name} onChange={handleChange("name")} required disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Email Address *</label>
            <input id={`${uid}-email`} type="email" value={formData.email} onChange={handleChange("email")} required disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor={`${uid}-phone`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Phone Number</label>
            <input id={`${uid}-phone`} type="tel" value={formData.phone} onChange={handleChange("phone")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor={`${uid}-type`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>What Can I Help With?</label>
            <select id={`${uid}-type`} value={formData.inquiryType} onChange={handleChange("inquiryType")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none" }}>
              <option>PCS / Relocation — Buying</option>
              <option>PCS / Relocation — Selling</option>
              <option>VA Loan Questions</option>
              <option>Investment Property</option>
              <option>General Question</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-message`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Message</label>
            <textarea id={`${uid}-message`} rows={4} value={formData.message} onChange={handleChange("message")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          {status === "error" && (
            <div style={{ background: "#3a1a1a", border: "1px solid #a03a3a", borderRadius: 8, padding: 12, color: "#ff9999", fontSize: 13 }}>
              ⚠ {errorMsg}
            </div>
          )}
          <button type="submit" disabled={status === "submitting"} style={{ background: status === "submitting" ? `${GOLD}66` : GOLD, color: BLACK, border: "none", padding: "14px 28px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: status === "submitting" ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: .5, marginTop: 8 }}>
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 4, textAlign: "center" }}>By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.</p>
        </form>
      )}
    </div>
  );
};

const PCSPage = ({ go }) => {
  // Opt-in only (audit 2026-09-02, cro-03): the in-body "Get My PCS Plan" strip opens the form.
  // An on-load interstitial on the canonical PCS landing page hid the guide behind five fields.
  const [gateOpen, setGateOpen] = useState(false);
  return (
  <PageWrapper>
    {gateOpen && <InquiryModal onClose={() => setGateOpen(false)} />}
    <PageHero title="PCS to Pensacola: The Complete Guide for Military Families (2026)" subtitle="Everything you need to know about buying a home, finding the right neighborhood, navigating VA loans, and settling your family into life on the Gulf Coast." />
    <Content>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.03))", border: `1px solid ${C.goldLine}`, borderRadius: 12, padding: "16px 20px", marginBottom: 28 }}>
        <div style={{ flex: "1 1 300px", minWidth: 0, color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>
          <strong style={{ color: C.gold }}>PCS orders in hand?</strong> Tell me your rank, family size, and report date. I'll send a tailored housing game plan within one business day. No pressure, no spam.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setGateOpen(true)} style={{ background: C.gold, color: C.ink, border: "none", padding: "12px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: SS, letterSpacing: .3 }}>Get My PCS Plan →</button>
          <a href="sms:+18502665005?&body=Hi%20Gregg%2C%20I%27m%20PCSing%20to%20Pensacola%20%E2%80%94%20can%20you%20send%20me%20a%20housing%20game%20plan%3F" style={{ display: "inline-flex", alignItems: "center", padding: "12px 18px", borderRadius: 8, border: `1px solid ${C.goldLine}`, color: C.gold, textDecoration: "none", fontWeight: 600, fontSize: 13.5, fontFamily: SS }}>Text Gregg</a>
        </div>
      </div>
      <H2>Military Installations in the Pensacola Area</H2>
      <P>The greater Pensacola area is home to several major military installations, each serving different branches and mission sets. Understanding which base you're reporting to is the first step in narrowing your housing search.</P>
      <ComparisonTable
        headers={["Installation", "Branch", "Primary Mission", "Nearest Neighborhoods"]}
        rows={INSTALLATIONS}
      />
      <H2>Pensacola Real Estate Market Snapshot</H2>
      <P>As of early 2026, the Pensacola metro area market looks like this: median home price around $305,000, median 71 days on market, approximately 2,300+ active listings, and a 97% sale-to-list ratio. This is a balanced market: not the frenzy of 2021-2022, but not a buyer's paradise either. There is room to negotiate, especially on homes that have been sitting, but well-priced properties in desirable neighborhoods still move quickly.</P>
      <P>Prices vary dramatically by neighborhood. Northeast Pensacola runs around $255,000 median, while Downtown Pensacola is closer to $696,000 and Perdido Key averages above $580,000. Your BAH and household budget will determine which neighborhoods are realistic targets.</P>
      <H2>Neighborhood Comparison Guide</H2>
      <ComparisonTable
        headers={["Neighborhood", "Median Price", "Commute to NAS", "Schools", "Lifestyle"]}
        rows={NEIGHBORHOOD_ROWS}
      />
      <H2>Your PCS Timeline Checklist</H2>
      {PCS_CHECKLIST.map((c) => (
        <Fragment key={c.label}>
          <H3>{c.label}</H3>
          <ul style={{ paddingLeft: 20 }}>
            {c.items.map((it) => <Li key={it}>{it}</Li>)}
          </ul>
        </Fragment>
      ))}
      <H2>VA Loan Basics for Pensacola</H2>
      <P>The VA loan is the single most powerful financial tool available to military homebuyers. Zero down payment, no private mortgage insurance, competitive interest rates, and more flexible underwriting than conventional loans. In Pensacola's market, where the median home is around $305,000, a VA loan means you can buy a home with essentially just closing costs out of pocket, and even those can often be negotiated as seller concessions.</P>
      <P>Key Pensacola-specific VA considerations: Florida requires a Wood Destroying Organism (WDO/termite) inspection on VA purchases. Flood zone determination matters: parts of Pensacola, especially waterfront areas, fall in flood zones that require separate flood insurance. And VA appraisals in this market have been coming in at or near purchase price, which means fewer appraisal gap issues than in overheated markets.</P>
      <a href="/va-loan-guide" style={{ display: "inline-block", background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Read the Complete VA Loan Guide →</a>
      <H2>2026 BAH Rates for Pensacola (MHA FL064)</H2>
      <P>These are the 2026 Basic Allowance for Housing monthly rates for service members assigned to NAS Pensacola, NTTC Corry Station, and NAS Whiting Field (Military Housing Area <strong style={{ color: "#fff" }}>FL064</strong>). The "With Dependents" column applies to any service member with authorized dependents (spouse, children, or qualifying family members); "Without Dependents" is the single or unaccompanied rate. Prior-enlisted commissioned officer rates (O-1E, O-2E, O-3E) appear at the top of the officer table. Always verify your exact rate at the official DoD BAH calculator before signing an offer or lease.</P>
      <BAHTable title="Enlisted (E-1 through E-9)" rows={[["E-1 through E-4", BAH_DATA.FL064.enlisted[0][1], BAH_DATA.FL064.enlisted[0][2]], ...BAH_DATA.FL064.enlisted.filter(([g]) => !["E-1","E-2","E-3","E-4"].includes(g))]} />
      <BAHTable title="Warrant Officer (W-1 through W-5)" rows={BAH_DATA.FL064.warrant} />
      <BAHTable title="Officer (O-1 through O-6, including Prior-Enlisted O-1E, O-2E, O-3E)" rows={BAH_DATA.FL064.officer.filter(([g]) => g !== "O-7")} />
      <P style={{ fontSize: 14, color: WARM_GRAY, marginTop: 12 }}><em>Source: DoD 2026 BAH tables for MHA FL064 ({BAH_DATA.FL064.yoyChange}). E-1 through E-4 share a single "junior enlisted" rate by DoD convention, which is why they're collapsed into one row above. Fort Walton Beach (Eglin AFB, Hurlburt Field, Duke Field) falls under MHA FL023 (different rates). For FL023 or any other MHA, use the <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener" style={{ color: GOLD }}>official DoD BAH calculator</a>.</em></P>
      <button onClick={() => go("calculator")} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Run Your BAH Through the Mortgage Calculators →</button>
      <H2>Florida Benefits for Military Families</H2>
      <ul style={{ paddingLeft: 20 }}>
        {FL_BENEFITS.map((b) => <Li key={b.title}><strong style={{ color: "#fff" }}>{b.title}</strong> {b.text}</Li>)}
      </ul>
      <a href="/florida-homestead-exemption-military" style={{ display: "inline-block", background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Read the Homestead Exemption Guide →</a>
      <H2>Why Work With a Military Relocation Specialist?</H2>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,400px) 1fr", gap: 40, alignItems: "center", marginTop: 16 }}>
        <Pic loading="eager" sizes={PIC_SIZES.pcsPortrait} src={IMG.grayNoTie} alt="Gregg Costin" style={{ width: "100%", borderRadius: 10, objectFit: "cover", aspectRatio: "3/4", border: `2px solid ${GOLD}22` }} />
        <div>
          <p style={{ color: "#ddd", fontSize: 19, lineHeight: 1.75, marginBottom: 20 }}>Not every Realtor understands PCS timelines. Not every Realtor knows how to structure a VA offer that wins. Not every Realtor has sat in the seat you're sitting in: staring at orders to a new base, trying to figure out where to live, how to finance it, and how to make it all work on a military timeline.</p>
          <p style={{ color: "#ddd", fontSize: 19, lineHeight: 1.75, marginBottom: 0 }}>I have. <strong style={{ color: "#fff" }}>Eleven times.</strong> And now I help military families do the same thing I had to figure out the hard way. With better information, better strategy, and better results.</p>
        </div>
      </div>
      <div style={{ maxWidth: 560, margin: "48px auto 0" }}>
        <InquiryForm />
      </div>
      <H2>Frequently Asked Questions</H2>
      {PCS_FAQS.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
      <InfoBox title="Ready to Start?">Call or text me at (850) 266-5005, or send me a message through the contact page. I respond to every inquiry within 2 hours during business hours. Let's talk about your PCS and find you the right home.</InfoBox>
    </Content>
  </PageWrapper>
  );
};

const fmt = (n) => "$" + n.toLocaleString("en-US");

const BAHTable = ({ title, rows }) => (
  <div style={{ marginBottom: 28 }}>
    <h4 style={{ fontFamily: SF, color: GOLD, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{title}</h4>
    <div style={{ overflowX: "auto", border: `1px solid #333`, borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
        <thead>
          <tr style={{ background: BLACK }}>
            <th style={{ color: WARM_GRAY, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "left", borderBottom: `1px solid ${GOLD}44` }}>Pay Grade</th>
            <th style={{ color: WARM_GRAY, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${GOLD}44` }}>With Dependents</th>
            <th style={{ color: WARM_GRAY, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${GOLD}44` }}>Without Dependents</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([grade, withDep, woDep], i) => (
            <tr key={grade} style={{ background: i % 2 === 0 ? "transparent" : "#1F1F1F" }}>
              <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", borderBottom: "1px solid #2a2a2a" }}>{grade}</td>
              <td style={{ color: GOLD, fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: "1px solid #2a2a2a" }}>{fmt(withDep)}</td>
              <td style={{ color: "#ccc", fontSize: 14, padding: "10px 14px", textAlign: "right", borderBottom: "1px solid #2a2a2a" }}>{fmt(woDep)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BAHGrid = ({ mha, baseLabel, zip }) => {
  const d = BAH_DATA[mha];
  if (!d) return null;
  return (
    <div style={{ background: "#181818", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "28px 24px", marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${GOLD}22` }}>
        <div>
          <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>2026 Monthly BAH Rates</p>
          <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>{baseLabel} &middot; Duty ZIP {zip}</p>
          <p style={{ color: WARM_GRAY, fontSize: 12, margin: 0 }}>MHA {d.mhaCode} &middot; {d.mhaName} &middot; {d.yoyChange}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: WARM_GRAY, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 2px" }}>Effective</p>
          <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>Jan 1, 2026</p>
        </div>
      </div>
      <BAHTable title="Enlisted" rows={d.enlisted} />
      <BAHTable title="Warrant Officer" rows={d.warrant} />
      <BAHTable title="Officer (including Prior-Enlisted O-1E/O-2E/O-3E)" rows={d.officer} />
      <div style={{ background: BLACK, border: "1px solid #2a2a2a", borderRadius: 8, padding: "14px 18px", marginTop: 8 }}>
        <p style={{ color: WARM_GRAY, fontSize: 12, lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: "#ccc" }}>Verify before acting:</strong> Rates shown are 2026 monthly BAH for the {d.mhaName} Military Housing Area. Confirm your individual rate at the Defense Travel Management Office (travel.dod.mil).
        </p>
      </div>
    </div>
  );
};

const BaseGuide = ({ base, go }) => {
  const data = {
    nas: {
      title: "NAS Pensacola Housing Guide",
      subtitle: "The Cradle of Naval Aviation, where student pilots, instructor pilots, NATTC students, and support personnel find their Gulf Coast home.",
      mission: "Naval Air Station Pensacola is the primary training base for all U.S. Navy, Marine Corps, and Coast Guard student naval aviators and naval flight officers. It's home to the Naval Aviation Technical Training Center (NATTC), the Naval Education and Training Command (NETC), and the Blue Angels flight demonstration team. The base supports roughly 23,000 personnel and is the largest employer in the Pensacola metro area.",
      neighborhoods: [
        ["East Pensacola Heights","$280-380K","5-10 min","Good","Historic, walkable, close to base, character homes"],
        ["Gulf Breeze","$380-480K","15-20 min","A-rated (SRSD)","Top schools, waterfront community, family favorite"],
        ["Perdido Key","$450-700K+","20-25 min","A-rated","Beach lifestyle, investment potential, condos available"],
        ["Warrington","$180-260K","5-8 min","Varies","Most affordable, closest to main gate, older housing stock"],
        ["West Pensacola","$220-310K","10-15 min","Good","Middle ground on price and commute, improving area"],
        ["Pensacola Downtown","$320-550K+","8-12 min","Varies","Walkable, restaurants, historic homes"],
      ],
      bahMha: "FL064", bahLabel: "NAS Pensacola", bahZip: "32508",
      bahNote: "Student aviators on short 12-18 month pipelines should weigh a rent-vs-buy decision carefully. Instructor pilots and permanent party typically benefit from buying.",
      tips: "Student aviators on a 1-2 year training pipeline should seriously consider renting unless they plan to keep the property as an investment. For instructor pilots and permanent party with 3+ year assignments, buying makes strong financial sense. Gulf Breeze is the perennial favorite for families with children due to Santa Rosa School District's consistent A-ratings."
    },
    whiting: {
      title: "Whiting Field Housing Guide",
      subtitle: "Where Navy and Marine Corps student aviators earn their wings in the T-6B Texan II and TH-73A.",
      mission: "Naval Air Station Whiting Field is located in Milton, Florida, approximately 30 miles northeast of Pensacola. It's home to Training Wing Five (TW-5), conducting primary and advanced helicopter flight training. Student aviators typically spend 12-18 months at Whiting Field.",
      neighborhoods: [
        ["Pace","$270-340K","15-20 min","Strong (SRSD)","Best value, new construction, family-friendly"],
        ["Milton","$250-320K","5-15 min","Good (SRSD)","Small town, closest to base, historic downtown"],
        ["East Milton","$220-290K","5-10 min","Good","Most affordable, rural feel, larger lots"],
        ["Gulf Breeze","$380-480K","35-40 min","A-rated","Premium schools, longer commute, waterfront"],
        ["Pensacola (East)","$260-340K","25-30 min","Good","More amenities, moderate commute"],
      ],
      bahMha: "FL064", bahLabel: "NAS Whiting Field", bahZip: "32570",
      bahNote: "Whiting Field uses the same FL064 Pensacola MHA rates as NAS Pensacola and Corry Station.",
      tips: "Most student aviators at Whiting Field should focus on Pace or Milton for the best combination of short commute and value. If you're only going to be at Whiting for 12-18 months, renting in Milton or Pace is likely the smarter financial move unless you're confident about keeping the property as a rental long-term."
    },
    corry: {
      title: "Corry Station Housing Guide",
      subtitle: "Home of the Center for Information Dominance, training the Navy's information warfare, intelligence, and IT professionals.",
      mission: "Naval Technical Training Center Corry Station is located in West Pensacola, just a few miles from NAS Pensacola. It trains sailors and Marines in information warfare, cryptology, intelligence, and information technology.",
      neighborhoods: [
        ["West Pensacola","$220-310K","5-10 min","Good","Closest to base, affordable, improving area"],
        ["Warrington","$180-260K","5-8 min","Varies","Most affordable option, older housing stock"],
        ["Pensacola Proper","$280-400K","10-15 min","Varies","More amenities, restaurants, nightlife"],
        ["Pace","$270-340K","30-35 min","Strong (SRSD)","Better schools, longer commute, new construction"],
        ["Gulf Breeze","$380-480K","25-30 min","A-rated","Premium schools, family favorite"],
      ],
      bahMha: "FL064", bahLabel: "NTTC Corry Station", bahZip: "32511",
      bahNote: "Corry Station sits within the FL064 Pensacola MHA, so rates match NAS Pensacola and Whiting Field. Pipeline length is your biggest decision lever: 3-6 month C-schools favor renting, 18+ month instructor tours favor buying.",
      tips: "Corry Station students are often on shorter pipelines (3-9 months), making renting the default choice. For permanent party staff and instructors with multi-year assignments, buying in West Pensacola or Pensacola proper makes sense."
    },
    eglin: {
      title: "Eglin AFB Housing Guide",
      subtitle: "The largest Air Force installation by area, home to the 96th Test Wing, 33rd Fighter Wing, and 7th Special Forces Group.",
      mission: "Eglin Air Force Base encompasses 724 square miles in the heart of the Florida Panhandle. It hosts developmental test and evaluation, the F-35 training wing, and Army special operations forces.",
      neighborhoods: [
        ["Niceville","$330-420K","10-15 min","A-rated","Family favorite, Bluewater Bay, top schools"],
        ["Crestview","$260-330K","25-30 min","Good","Most affordable, growing rapidly, newer homes"],
        ["Fort Walton Beach","$300-400K","5-15 min","Good","Close to base and beach, mixed housing"],
        ["Valparaiso","$280-360K","5-10 min","Good","Small town adjacent to base, quiet, affordable"],
        ["Destin","$400-600K+","25-30 min","Good","Beach lifestyle, higher price point"],
        ["Navarre","$350-450K","35-40 min","A-rated","Beach community, between Eglin and Hurlburt"],
      ],
      bahMha: "FL023", bahLabel: "Eglin AFB", bahZip: "32542",
      bahNote: "Eglin falls under the FL023 Fort Walton Beach MHA, with meaningfully higher rates than Pensacola due to the Emerald Coast beach premium.",
      tips: "Niceville (especially Bluewater Bay) is the gold standard for Eglin families with kids: top schools, newer inventory, and a 10-minute commute. Crestview is where budget-conscious buyers go, with significantly lower prices and strong new construction inventory."
    },
    hurlburt: {
      title: "Hurlburt Field Housing Guide",
      subtitle: "Home of Air Force Special Operations Command (AFSOC) and the 1st Special Operations Wing.",
      mission: "Hurlburt Field is located in Mary Esther, Florida, just west of Fort Walton Beach. It serves as headquarters for Air Force Special Operations Command and the 1st Special Operations Wing.",
      neighborhoods: [
        ["Mary Esther","$280-360K","5 min","Good","Walking distance to base, small town, affordable"],
        ["Navarre","$350-450K","15-20 min","A-rated (SRSD)","Beach community, great schools, family lifestyle"],
        ["Fort Walton Beach","$300-400K","10-15 min","Good","Close to base, beach access, more amenities"],
        ["Niceville","$330-420K","20-25 min","A-rated","Premium schools, Bluewater Bay"],
        ["Gulf Breeze","$380-480K","45-50 min","A-rated","Long commute but top-tier community"],
        ["Crestview","$260-330K","35-40 min","Good","Budget-friendly, newer homes"],
      ],
      bahMha: "FL023", bahLabel: "Hurlburt Field", bahZip: "32544",
      bahNote: "Hurlburt is FL023 Fort Walton Beach MHA, with the same rates as Eglin AFB.",
      tips: "Navarre is the overwhelming favorite for Hurlburt families: it combines beautiful beaches, excellent Santa Rosa School District schools, a family-friendly community, and a reasonable 15-20 minute commute. Mary Esther is the closest option and most affordable."
    },
  };
  const d = data[base];
  if (!d) return null;
  return (
    <PageWrapper>
      <PageHero title={d.title} subtitle={d.subtitle} breadcrumb={`Home > ${d.title}`} />
      <Content>
        <H2>Base Overview</H2>
        <P>{d.mission}</P>
        <H2>Top Neighborhoods</H2>
        <ComparisonTable headers={["Neighborhood","Price Range","Commute","Schools","Notes"]} rows={d.neighborhoods} />
        <H2>BAH Reference</H2>
        <BAHGrid mha={d.bahMha} baseLabel={d.bahLabel} zip={d.bahZip} />
        <InfoBox title="BAH as a Foundation, Not a Ceiling">BAH was designed to cover roughly 95% of median local housing costs for your rank and dependency status. It is NOT designed to cover 100% of your PITI. {d.bahNote}</InfoBox>
        <H2>Insider Tips</H2>
        <P>{d.tips}</P>
        <H2>Ready to Find Your Home?</H2>
        <P>I serve military families at every installation across the Florida Panhandle. Whether you're 90 days out from PCS or already boots-on-ground, call me at (850) 266-5005 and let's find your next home.</P>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
          <a href="tel:8502665005" style={{ background: GOLD, color: BLACK, border: "none", padding: "14px 28px", fontSize: 14, fontWeight: 700, borderRadius: 8, textDecoration: "none", textTransform: "uppercase" }}>Call 850-266-5005</a>
          <button onClick={() => go("pcs")} style={{ background: "transparent", color: GOLD, border: `1px solid ${GOLD}44`, padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: "pointer" }}>Read the Full PCS Guide →</button>
        </div>
      </Content>
    </PageWrapper>
  );
};

const runAmortSchedule = ({ P, mRate, N, basePmt, extras }) => {
  const freqExtraPerMonth = extras.freq === "monthly" ? 0 : basePmt / 12;
  const applyCustom = (month) => {
    const amt = Number(extras.customAmt) || 0;
    if (amt === 0) return 0;
    const start = Math.max(1, Math.round(Number(extras.customStart) || 1));
    if (month < start) return 0;
    const cf = extras.customFreq;
    if (cf === "onetime") return month === start ? amt : 0;
    if (cf === "weekly") return amt * (52 / 12);
    if (cf === "monthly") return amt;
    if (cf === "quarterly") return (month - start) % 3 === 0 ? amt : 0;
    if (cf === "annual") return (month - start) % 12 === 0 ? amt : 0;
    return 0;
  };
  let bal = P, totalInt = 0;
  const schedule = [];
  let month = 0;
  while (bal > 0.005 && month < N + 24) {
    month++;
    const interest = bal * mRate;
    let extraPrincipal = (Number(extras.monthly) || 0) + freqExtraPerMonth + applyCustom(month);
    if (month % 12 === 1 && (Number(extras.annual) || 0) > 0) extraPrincipal += Number(extras.annual);
    let principalPaid = basePmt - interest + extraPrincipal;
    if (principalPaid > bal) principalPaid = bal;
    bal -= principalPaid;
    totalInt += interest;
    schedule.push({ month, interest, principal: principalPaid, balance: bal });
  }
  const byYear = [];
  let cur = null;
  schedule.forEach(r => {
    const y = Math.ceil(r.month / 12);
    if (!cur || cur.year !== y) {
      if (cur) byYear.push(cur);
      cur = { year: y, principal: 0, interest: 0, balance: r.balance };
    }
    cur.principal += r.principal;
    cur.interest += r.interest;
    cur.balance = r.balance;
  });
  if (cur) byYear.push(cur);
  return { schedule, byYear, totalInterest: totalInt, totalMonths: schedule.length, basePmt };
};

const AmortizationAnalyzer = ({ principal, annualRate, years, basePayment }) => {
  const [freq, setFreq] = useState("monthly");
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [extraAnnual, setExtraAnnual] = useState(0);
  const [customAmt, setCustomAmt] = useState(0);
  const [customFreq, setCustomFreq] = useState("onetime");
  const [customStart, setCustomStart] = useState(12);
  const [hover, setHover] = useState(null);

  const P = Number(principal) || 0;
  const R = Number(annualRate) / 100;
  const N = Math.round(Number(years) * 12);
  const mRate = R / 12;
  const basePmt = basePayment && isFinite(basePayment) ? basePayment : (mRate === 0 ? P / N : P * (mRate * Math.pow(1 + mRate, N)) / (Math.pow(1 + mRate, N) - 1));

  const baseline = runAmortSchedule({ P, mRate, N, basePmt, extras: { monthly: 0, annual: 0, customAmt: 0, customFreq: "onetime", customStart: 1, freq: "monthly" } });
  const accelerated = runAmortSchedule({ P, mRate, N, basePmt, extras: { monthly: Number(extraMonthly) || 0, annual: Number(extraAnnual) || 0, customAmt, customFreq, customStart, freq } });

  const interestSaved = Math.max(0, baseline.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, baseline.totalMonths - accelerated.totalMonths);
  const yrsSaved = Math.floor(monthsSaved / 12);
  const moSaved = monthsSaved % 12;
  const baselineRatio = P > 0 ? (baseline.totalInterest / P) * 100 : 0;
  const accelRatio = P > 0 ? (accelerated.totalInterest / P) * 100 : 0;
  const baselineAnnualized = P > 0 && baseline.totalMonths > 0 ? (baseline.totalInterest / P) / (baseline.totalMonths / 12) * 100 : 0;
  const accelAnnualized = P > 0 && accelerated.totalMonths > 0 ? (accelerated.totalInterest / P) / (accelerated.totalMonths / 12) * 100 : 0;

  const fmt = (n) => "$" + Math.round(Number(n || 0)).toLocaleString("en-US");

  // SVG chart of balance over time (baseline vs. accelerated)
  const chartW = 720, chartH = 300, padL = 56, padR = 16, padT = 16, padB = 36;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxMonth = Math.max(baseline.totalMonths, accelerated.totalMonths, 1);
  const maxBal = P || 1;
  const scaleX = (m) => padL + (m / maxMonth) * plotW;
  const scaleY = (b) => padT + plotH - (b / maxBal) * plotH;
  const sampleBalances = (byYear, total) => {
    const pts = [[0, P]];
    byYear.forEach(r => pts.push([r.year * 12, r.balance]));
    if (pts[pts.length - 1][1] > 0.01) pts.push([total, 0]);
    return pts;
  };
  const ptsBase = sampleBalances(baseline.byYear, baseline.totalMonths);
  const ptsAccel = sampleBalances(accelerated.byYear, accelerated.totalMonths);
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`).join(" ");

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: scaleY(t * maxBal), val: fmt(t * maxBal) }));
  // X-axis ticks (every 5 years or so)
  const maxYears = Math.ceil(maxMonth / 12);
  const tickStep = maxYears > 20 ? 5 : (maxYears > 10 ? 2 : 1);
  const xTicks = [];
  for (let y = 0; y <= maxYears; y += tickStep) {
    xTicks.push({ x: scaleX(y * 12), label: y + "y" });
  }

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 16, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  return (
    <div style={{ marginTop: 72, marginBottom: 32 }}>
      <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 48 }}>
        <Eyebrow>Amortization & Payoff Analyzer</Eyebrow>
        <H2>Run the Numbers on Extra Payments</H2>
        <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginBottom: 32 }}>
          Every extra dollar toward principal attacks interest at the front of the loan where interest is highest. Model different payment frequencies and extra-payment strategies below. This uses the <strong style={{ color: C.gold }}>same loan amount, interest rate, and term</strong> from your calculator above. Everything updates live.
        </p>

        <div className="amort-input-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
          <div style={card}>
            <label style={labelStyle}>Payment Frequency</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["monthly", "Monthly"], ["biweekly", "Bi-weekly"], ["weekly", "Weekly"]].map(([id, lbl]) => (
                <button key={id} onClick={() => setFreq(id)} style={{ flex: 1, minWidth: 80, padding: "8px 10px", background: freq === id ? C.gold : "transparent", color: freq === id ? C.ink : C.muted, border: `1px solid ${freq === id ? C.gold : "#444"}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SS, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</button>
              ))}
            </div>
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Accelerated bi-weekly or weekly = 13 monthly payments/yr instead of 12.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Extra Monthly Payment ($)</label>
            <input type="number" aria-label="Extra monthly payment in dollars" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Added to every monthly principal payment.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Annual Lump Sum ($)</label>
            <input type="number" aria-label="Annual lump sum in dollars" value={extraAnnual} onChange={e => setExtraAnnual(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>E.g. tax refund or bonus applied once per year.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Custom Extra Payment ($)</label>
            <input type="number" aria-label="Custom extra payment in dollars" value={customAmt} onChange={e => setCustomAmt(e.target.value)} style={inputStyle} min="0" placeholder="0" />
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>Frequency</label>
            <select aria-label="Custom payment frequency" value={customFreq} onChange={e => setCustomFreq(e.target.value)} style={inputStyle}>
              <option value="onetime">One-Time</option>
              <option value="weekly">Every Week</option>
              <option value="monthly">Every Month</option>
              <option value="quarterly">Every Quarter</option>
              <option value="annual">Every Year</option>
            </select>
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>{customFreq === "onetime" ? "Applied at month #" : "Starting at month #"}</label>
            <input type="number" aria-label="Custom payment start month" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} min="1" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 32 }}>
          <div style={{ ...card, borderColor: C.goldLine, background: `linear-gradient(135deg, ${C.goldTint}, transparent)` }}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Interest Saved</div>
            <div style={{ color: C.gold, fontSize: 28, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(interestSaved)}</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>vs. baseline 30-yr schedule</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Time Saved</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{yrsSaved} yr {moSaved} mo</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>Paid off in {Math.floor(accelerated.totalMonths/12)} yr {accelerated.totalMonths%12} mo</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Nominal Rate</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{annualRate}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>Your contract rate (unchanged)</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Effective Cost</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{accelRatio.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of principal paid as interest (vs. {baselineRatio.toFixed(1)}% baseline)</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Balance Over Time</div>
          <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: "#6B7280", display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>Baseline ({years} yr)</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: C.gold, display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>Accelerated</span></div>
          </div>
          <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * chartW;
              if (relX < padL || relX > chartW - padR) { setHover(null); return; }
              const rawMonth = Math.round(((relX - padL) / plotW) * maxMonth);
              const snapped = Math.max(3, Math.min(maxMonth, Math.round(rawMonth / 3) * 3));
              const year = Math.ceil(snapped / 12);
              const monthOfYear = ((snapped - 1) % 12) + 1;
              const quarter = Math.ceil(monthOfYear / 3);
              const baseBal = snapped <= baseline.schedule.length ? baseline.schedule[snapped-1].balance : 0;
              const accelBal = snapped <= accelerated.schedule.length ? accelerated.schedule[snapped-1].balance : 0;
              const baseInt = baseline.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              const accelInt = accelerated.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              setHover({ month: snapped, year, quarter, baseBal, accelBal, baseInt, accelInt });
            }}
            onMouseLeave={() => setHover(null)}>
            {yTicks.map((t, i) => (
              <g key={"y"+i}>
                <line x1={padL} y1={t.y} x2={chartW-padR} y2={t.y} stroke={C.hairline} strokeDasharray="2 4" />
                <text x={padL-8} y={t.y+4} textAnchor="end" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.val}</text>
              </g>
            ))}
            {xTicks.map((t, i) => (
              <text key={"x"+i} x={t.x} y={chartH-12} textAnchor="middle" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.label}</text>
            ))}
            <path d={toPath(ptsBase)} fill="none" stroke="#6B7280" strokeWidth="2" />
            <path d={toPath(ptsAccel)} fill="none" stroke={C.gold} strokeWidth="2.5" />
            {hover && (
              <g>
                <line x1={scaleX(hover.month)} y1={padT} x2={scaleX(hover.month)} y2={chartH-padB} stroke={C.gold} strokeDasharray="3 3" opacity="0.55" />
                <circle cx={scaleX(hover.month)} cy={scaleY(hover.baseBal)} r="5" fill="#6B7280" stroke="#fff" strokeWidth="1.5"/>
                <circle cx={scaleX(hover.month)} cy={scaleY(hover.accelBal)} r="5" fill={C.gold} stroke="#fff" strokeWidth="1.5"/>
              </g>
            )}
          </svg>
          {hover && (
            <div style={{ position: "absolute", top: 8, right: 8, background: C.ink, border: `1px solid ${C.goldLine}`, borderRadius: 8, padding: "12px 16px", fontSize: 12, lineHeight: 1.6, pointerEvents: "none", minWidth: 200, boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Year {hover.year} · Q{hover.quarter}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Month {hover.month}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: "#9CA3AF" }}>Baseline balance</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(hover.baseBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: C.gold }}>Accelerated balance</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(hover.accelBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", borderTop: `1px solid ${C.hairline}`, marginTop: 4 }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Interest paid so far</span>
                <span style={{ color: "#fff", fontSize: 11 }}>{fmt(hover.accelInt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Saved vs baseline</span>
                <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>{fmt(Math.max(0, hover.baseInt - hover.accelInt))}</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Annual Breakdown (Accelerated Schedule)</div>
          <div style={{ overflowX: "auto", border: `1px solid ${C.hairline}`, borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
              <thead>
                <tr style={{ background: C.ink }}>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "left", borderBottom: `1px solid ${C.goldLine}` }}>Year</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Principal</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Interest</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {accelerated.byYear.map((r, i) => (
                  <tr key={r.year} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", borderBottom: `1px solid ${C.hairline}` }}>Year {r.year}</td>
                    <td style={{ color: C.gold, fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.principal)}</td>
                    <td style={{ color: C.text, fontSize: 14, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.interest)}</td>
                    <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: C.mutedD, fontSize: 12, fontStyle: "italic", marginTop: 12, lineHeight: 1.6 }}>
            <strong>How to read this:</strong> "Effective Cost" is the total interest you pay divided by the amount you borrowed, a more honest measure of mortgage cost than the nominal rate. Annual payments in bi-weekly/weekly mode already account for the extra month's payment you make per year.
          </p>
        </div>
      </div>
    </div>
  );
};

const computeLoanProduct = (loan) => {
  const hp = Number(loan.price) || 0;
  const dp = Number(loan.downPct) || 0;
  const downPayment = hp * dp / 100;
  const baseLoan = Math.max(0, hp - downPayment);

  let upfrontFee = 0;
  let upfrontLabel = "";
  if (loan.type === "va" && !loan.vaExempt) {
    let pct;
    if (dp < 5) pct = loan.firstUse ? 2.15 : 3.3;
    else if (dp < 10) pct = 1.5;
    else pct = 1.25;
    upfrontFee = baseLoan * pct / 100;
    upfrontLabel = `VA Funding Fee ${pct}%`;
  } else if (loan.type === "fha") {
    upfrontFee = baseLoan * 0.0175;
    upfrontLabel = "FHA Upfront MIP 1.75%";
  }
  const totalLoan = baseLoan + upfrontFee;

  const R = Number(loan.rate) / 100;
  const N = Math.round(Number(loan.years) * 12);
  const mRate = R / 12;
  const basePmt = mRate === 0 ? totalLoan / N : totalLoan * (mRate * Math.pow(1 + mRate, N)) / (Math.pow(1 + mRate, N) - 1);

  let miMonthly = 0;
  let miLabel = "";
  const ltv = hp > 0 ? (totalLoan / hp) * 100 : 0;
  if (loan.type === "fha") {
    miMonthly = totalLoan * 0.0055 / 12;
    miLabel = "FHA Annual MIP 0.55%";
  } else if (loan.type === "conv" && dp < 20) {
    miMonthly = totalLoan * 0.006 / 12;
    miLabel = "Conv PMI ~0.6%";
  }

  const sched = runAmortSchedule({ P: totalLoan, mRate, N, basePmt, extras: { monthly: Number(loan.extra) || 0, annual: 0, customAmt: 0, customFreq: "onetime", customStart: 1, freq: "monthly" } });

  let pmiMonths = 0;
  if (loan.type === "fha") {
    pmiMonths = sched.totalMonths;
  } else if (loan.type === "conv" && dp < 20) {
    const removalIdx = sched.schedule.findIndex(r => r.balance / hp <= 0.78);
    pmiMonths = removalIdx >= 0 ? removalIdx + 1 : sched.totalMonths;
  }
  const totalMI = miMonthly * pmiMonths;

  return { sched, basePmt, miMonthly, miLabel, upfrontFee, upfrontLabel, totalLoan, baseLoan, downPayment, ltv, pmiMonths, totalMI };
};

const LoanComparison = () => {
  const [a, setA] = useState({ label: "Loan A: VA, 0% down", type: "va", price: 375000, downPct: 0, rate: 6.25, years: 30, extra: 0, firstUse: true, vaExempt: false });
  const [b, setB] = useState({ label: "Loan B: FHA, 3.5% down", type: "fha", price: 375000, downPct: 3.5, rate: 6.5, years: 30, extra: 0, firstUse: true, vaExempt: false });
  const [compareHover, setCompareHover] = useState(null);

  const rA = computeLoanProduct(a);
  const rB = computeLoanProduct(b);
  const fmt = (n) => "$" + Math.round(Number(n || 0)).toLocaleString("en-US");

  const totalMonthlyA = rA.basePmt + rA.miMonthly;
  const totalMonthlyB = rB.basePmt + rB.miMonthly;
  const ratioA = a.price > 0 ? (rA.sched.totalInterest / rA.totalLoan) * 100 : 0;
  const ratioB = b.price > 0 ? (rB.sched.totalInterest / rB.totalLoan) * 100 : 0;
  const intDelta = Math.abs(rA.sched.totalInterest - rB.sched.totalInterest);
  const winnerInt = rA.sched.totalInterest < rB.sched.totalInterest ? "A" : "B";
  const pmtDelta = Math.abs(totalMonthlyA - totalMonthlyB);
  const winnerPmt = totalMonthlyA < totalMonthlyB ? "A" : "B";
  const outOfPocketA = rA.downPayment;
  const outOfPocketB = rB.downPayment;
  const totalCostOfBorrowA = rA.sched.totalInterest + rA.totalMI + rA.upfrontFee;
  const totalCostOfBorrowB = rB.sched.totalInterest + rB.totalMI + rB.upfrontFee;

  const chartW = 720, chartH = 260, padL = 56, padR = 16, padT = 16, padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxMonth = Math.max(rA.sched.totalMonths, rB.sched.totalMonths, 1);
  const maxBal = Math.max(rA.totalLoan || 0, rB.totalLoan || 0, 1);
  const scaleX = (m) => padL + (m / maxMonth) * plotW;
  const scaleY = (v) => padT + plotH - (v / maxBal) * plotH;
  const pointsOf = (r) => {
    const pts = [[0, r.totalLoan]];
    r.sched.byYear.forEach(y => pts.push([y.year * 12, y.balance]));
    if (pts[pts.length - 1][1] > 0.01) pts.push([r.sched.totalMonths, 0]);
    return pts;
  };
  const pathOf = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`).join(" ");
  const ptsA = pointsOf(rA);
  const ptsB = pointsOf(rB);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: scaleY(t * maxBal), val: fmt(t * maxBal) }));
  const maxYears = Math.ceil(maxMonth / 12);
  const tickStep = maxYears > 20 ? 5 : (maxYears > 10 ? 2 : 1);
  const xTicks = [];
  for (let y = 0; y <= maxYears; y += tickStep) xTicks.push({ x: scaleX(y * 12), label: y + "y" });

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 16, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  const typeDesc = {
    va: "VA loan: zero down allowed, no monthly PMI, VA funding fee financed into loan (unless exempt).",
    fha: "FHA loan: 3.5% min down (580+ FICO), 1.75% upfront MIP + 0.55% annual MIP for life of loan (<10% down).",
    conv: "Conventional: typically 3-5% down, 0.6% annual PMI if LTV > 80% (auto-removed at 78% LTV).",
  };

  const LoanForm = ({ loan, setLoan, color }) => (
    <div style={{ ...card, borderColor: color, borderWidth: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: color, display: "inline-block", flexShrink: 0 }} />
        <input aria-label="Loan name" value={loan.label} onChange={e => setLoan({ ...loan, label: e.target.value })} style={{ ...inputStyle, fontWeight: 700, fontSize: 16, padding: "8px 10px" }} />
      </div>
      <label style={labelStyle}>Loan Product</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["va","VA"],["fha","FHA"],["conv","Conventional"]].map(([id,lbl]) => (
          <button key={id} aria-pressed={loan.type === id} onClick={() => {
            const defaultRate = { va: 6.25, fha: 6.5, conv: 6.75 }[id];
            const defaultDown = { va: 0, fha: 3.5, conv: 5 }[id];
            setLoan({ ...loan, type: id, rate: defaultRate, downPct: defaultDown });
          }} style={{ flex: 1, padding: "8px 10px", background: loan.type === id ? color : "transparent", color: loan.type === id ? C.ink : C.muted, border: `1px solid ${loan.type === id ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</button>
        ))}
      </div>
      <p style={{ color: C.mutedD, fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>{typeDesc[loan.type]}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Home Price ($)</label><input type="number" aria-label="Home price in dollars" value={loan.price} onChange={e => setLoan({ ...loan, price: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Rate (%)</label><input type="number" step="0.125" aria-label="Interest rate percent" value={loan.rate} onChange={e => setLoan({ ...loan, rate: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Term (Years)</label><input type="number" aria-label="Loan term in years" value={loan.years} onChange={e => setLoan({ ...loan, years: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Extra Monthly ($)</label><input type="number" aria-label="Extra monthly payment in dollars" value={loan.extra} onChange={e => setLoan({ ...loan, extra: e.target.value })} style={inputStyle} /></div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Down Payment</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {(loan.type === "va" ? [0, 5, 10] : loan.type === "fha" ? [3.5, 5, 10, 20] : [5, 10, 20]).map(dp => (
            <button key={dp} aria-pressed={Number(loan.downPct) === dp} onClick={() => setLoan({ ...loan, downPct: dp })} style={{ flex: "1 1 60px", padding: "6px 8px", background: Number(loan.downPct) === dp ? color : "transparent", color: Number(loan.downPct) === dp ? C.ink : C.muted, border: `1px solid ${Number(loan.downPct) === dp ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1 }}>{dp}%</button>
          ))}
          <input type="number" step="0.1" aria-label="Custom down payment percent" value={loan.downPct} onChange={e => setLoan({ ...loan, downPct: e.target.value })} style={{ ...inputStyle, flex: "1 1 70px", maxWidth: 90, padding: "6px 8px", fontSize: 16 }} placeholder="Custom" />
        </div>
      </div>
      {loan.type === "va" && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(201,168,76,0.08)", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontSize: 12, color: C.muted }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>VA Funding Fee: {loan.vaExempt ? "0% (exempt)" : (Number(loan.downPct) < 5 ? (loan.firstUse ? "2.15%" : "3.3%") : Number(loan.downPct) < 10 ? "1.5%" : "1.25%") + (loan.firstUse ? " (first use)" : " (subsequent use)")}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={loan.firstUse} onChange={e => setLoan({ ...loan, firstUse: e.target.checked })} /> First-time VA use
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={loan.vaExempt} onChange={e => setLoan({ ...loan, vaExempt: e.target.checked })} /> Exempt (10%+ VA disability / Purple Heart)
            </label>
          </div>
          <div style={{ marginTop: 6, color: C.muted, fontSize: 11 }}>No monthly PMI: VA loans never require mortgage insurance.</div>
        </div>
      )}
      {loan.type === "fha" && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(201,168,76,0.08)", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontSize: 12, color: C.muted }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>FHA MIP Required (lifetime for &lt;10% down)</div>
          <div>1.75% upfront MIP financed into the loan + 0.55% annual MIP paid monthly. FHA minimum down is 3.5%. Unlike conventional PMI, FHA MIP does not auto-remove at 78% LTV when down payment is under 10%.</div>
        </div>
      )}
      {loan.type === "conv" && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: Number(loan.downPct) >= 20 ? "rgba(16,185,129,0.08)" : "rgba(201,168,76,0.08)", border: `1px solid ${Number(loan.downPct) >= 20 ? "#10B981" : C.goldLine}`, borderRadius: 6, fontSize: 12, color: C.muted }}>
          <div style={{ color: Number(loan.downPct) >= 20 ? "#10B981" : C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            {Number(loan.downPct) >= 20 ? "No PMI Required" : "PMI Required (~0.6% annual)"}
          </div>
          <div>{Number(loan.downPct) >= 20 ? "20%+ down clears the 80% LTV threshold: no monthly PMI ever." : "Conventional PMI is required while LTV > 80%. It auto-removes at 78% LTV of the original home value (Homeowners Protection Act of 1998), approximately when you've paid the loan down to 78% of the purchase price."}</div>
        </div>
      )}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.ink, borderRadius: 6, fontSize: 12 }}>
        <span style={{ color: C.muted }}>Base loan (price − down)</span>
        <span style={{ color: "#fff", fontWeight: 700 }}>{fmt((Number(loan.price)||0) - (Number(loan.price)||0)*(Number(loan.downPct)||0)/100)}</span>
      </div>
    </div>
  );

  const ResultSummary = ({ r, loan, color }) => (
    <div style={{ ...card, borderColor: color }}>
      <div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{loan.label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
        <span style={{ color: C.muted }}>Down payment ({loan.downPct}%)</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.downPayment)}</span>
      </div>
      {r.upfrontFee > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
          <span style={{ color: C.muted }}>{r.upfrontLabel}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.upfrontFee)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderTop: `1px solid ${C.hairline}`, marginTop: 6 }}>
        <span style={{ color: C.muted }}>Financed total</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.totalLoan)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
        <span style={{ color: C.muted }}>Monthly P&amp;I</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.basePmt)}</span>
      </div>
      {r.miMonthly > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
          <span style={{ color: C.muted }}>{r.miLabel}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.miMonthly)}/mo</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 15, borderTop: `1px solid ${C.goldLine}`, marginTop: 8, fontWeight: 700 }}>
        <span style={{ color: color }}>Total monthly</span>
        <span style={{ color: color }}>{fmt(r.basePmt + r.miMonthly)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
        <span style={{ color: C.mutedD }}>Total interest paid</span>
        <span style={{ color: "#fff" }}>{fmt(r.sched.totalInterest)}</span>
      </div>
      {r.totalMI > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
          <span style={{ color: C.mutedD }}>Total MI/PMI paid</span>
          <span style={{ color: "#fff" }}>{fmt(r.totalMI)}{r.pmiMonths > 0 && r.pmiMonths < r.sched.totalMonths ? ` (${Math.ceil(r.pmiMonths/12)}-yr until auto-removal)` : ""}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: 64, marginBottom: 32 }}>
      <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 48 }}>
        <Eyebrow>Side-by-Side Loan Comparison</Eyebrow>
        <H2>Compare Two Loans Head-to-Head</H2>
        <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginBottom: 28 }}>
          Pit two scenarios against each other (different loan amounts, rates, terms, or extra-payment strategies) and see which one saves you more in monthly cash flow, lifetime interest, and effective interest-rate cost.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 16, marginBottom: 24 }}>
          {LoanForm({ loan: a, setLoan: setA, color: C.gold })}
          {LoanForm({ loan: b, setLoan: setB, color: "#6B7280" })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 24 }}>
          {ResultSummary({ r: rA, loan: a, color: C.gold })}
          {ResultSummary({ r: rB, loan: b, color: "#6B7280" })}
        </div>

        <div className="amort-input-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 28 }}>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Total Monthly Savings</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(pmtDelta)}/mo</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>{winnerPmt === "A" ? a.label : b.label} is {fmt(pmtDelta)} cheaper monthly (P&amp;I + MI)</div>
          </div>
          <div style={{ ...card, borderColor: C.goldLine, background: `linear-gradient(135deg, ${C.goldTint}, transparent)` }}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Lifetime Interest Delta</div>
            <div style={{ color: C.gold, fontSize: 26, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(intDelta)}</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>{winnerInt === "A" ? a.label : b.label} pays {fmt(intDelta)} less in interest over life</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Effective Cost (A)</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioA.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Effective Cost (B)</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioB.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Balance Over Time: Both Loans</div>
          <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: C.gold, display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>{a.label}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: "#6B7280", display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>{b.label}</span></div>
          </div>
          <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * chartW;
              if (relX < padL || relX > chartW - padR) { setCompareHover(null); return; }
              const rawMonth = Math.round(((relX - padL) / plotW) * maxMonth);
              const snapped = Math.max(3, Math.min(maxMonth, Math.round(rawMonth / 3) * 3));
              const year = Math.ceil(snapped / 12);
              const monthOfYear = ((snapped - 1) % 12) + 1;
              const quarter = Math.ceil(monthOfYear / 3);
              const aBal = snapped <= rA.sched.schedule.length ? rA.sched.schedule[snapped-1].balance : 0;
              const bBal = snapped <= rB.sched.schedule.length ? rB.sched.schedule[snapped-1].balance : 0;
              const aInt = rA.sched.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              const bInt = rB.sched.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              setCompareHover({ month: snapped, year, quarter, aBal, bBal, aInt, bInt });
            }}
            onMouseLeave={() => setCompareHover(null)}>
            {yTicks.map((t, i) => (
              <g key={"y"+i}>
                <line x1={padL} y1={t.y} x2={chartW-padR} y2={t.y} stroke={C.hairline} strokeDasharray="2 4" />
                <text x={padL-8} y={t.y+4} textAnchor="end" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.val}</text>
              </g>
            ))}
            {xTicks.map((t, i) => (
              <text key={"x"+i} x={t.x} y={chartH-12} textAnchor="middle" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.label}</text>
            ))}
            <path d={pathOf(ptsB)} fill="none" stroke="#6B7280" strokeWidth="2" />
            <path d={pathOf(ptsA)} fill="none" stroke={C.gold} strokeWidth="2.5" />
            {compareHover && (
              <g>
                <line x1={scaleX(compareHover.month)} y1={padT} x2={scaleX(compareHover.month)} y2={chartH-padB} stroke={C.gold} strokeDasharray="3 3" opacity="0.55" />
                <circle cx={scaleX(compareHover.month)} cy={scaleY(compareHover.bBal)} r="5" fill="#6B7280" stroke="#fff" strokeWidth="1.5"/>
                <circle cx={scaleX(compareHover.month)} cy={scaleY(compareHover.aBal)} r="5" fill={C.gold} stroke="#fff" strokeWidth="1.5"/>
              </g>
            )}
          </svg>
          {compareHover && (
            <div style={{ position: "absolute", top: 8, right: 8, background: C.ink, border: `1px solid ${C.goldLine}`, borderRadius: 8, padding: "12px 16px", fontSize: 12, lineHeight: 1.6, pointerEvents: "none", minWidth: 220, boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Year {compareHover.year} · Q{compareHover.quarter}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Month {compareHover.month}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: C.gold }}>{a.label.length > 22 ? a.label.slice(0, 22) + "…" : a.label}</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(compareHover.aBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: "#9CA3AF" }}>{b.label.length > 22 ? b.label.slice(0, 22) + "…" : b.label}</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(compareHover.bBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", borderTop: `1px solid ${C.hairline}`, marginTop: 4 }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Balance delta</span>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{fmt(Math.abs(compareHover.aBal - compareHover.bBal))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Interest paid so far</span>
                <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>A: {fmt(compareHover.aInt)} · B: {fmt(compareHover.bInt)}</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <div style={{ marginTop: 28, overflowX: "auto", border: `1px solid ${C.hairline}`, borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
            <thead>
              <tr style={{ background: C.ink }}>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "left", borderBottom: `1px solid ${C.goldLine}` }}>Metric</th>
                <th style={{ color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>{a.label}</th>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>{b.label}</th>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Loan Product", { va: "VA", fha: "FHA", conv: "Conventional" }[a.type], { va: "VA", fha: "FHA", conv: "Conventional" }[b.type], a.type === b.type ? "-" : "different"],
                ["Home Price", fmt(a.price), fmt(b.price), fmt(Math.abs((Number(a.price)||0) - (Number(b.price)||0)))],
                ["Down Payment", fmt(rA.downPayment) + " (" + a.downPct + "%)", fmt(rB.downPayment) + " (" + b.downPct + "%)", fmt(Math.abs(rA.downPayment - rB.downPayment))],
                ["Upfront Fee/MIP", rA.upfrontFee > 0 ? `${fmt(rA.upfrontFee)} (${rA.upfrontLabel})` : "-", rB.upfrontFee > 0 ? `${fmt(rB.upfrontFee)} (${rB.upfrontLabel})` : "-", fmt(Math.abs(rA.upfrontFee - rB.upfrontFee))],
                ["Financed Total (base + fee)", fmt(rA.totalLoan), fmt(rB.totalLoan), fmt(Math.abs(rA.totalLoan - rB.totalLoan))],
                ["Nominal Rate", a.rate + "%", b.rate + "%", Math.abs(Number(a.rate) - Number(b.rate)).toFixed(2) + "%"],
                ["Term", a.years + " yr", b.years + " yr", Math.abs(Number(a.years) - Number(b.years)) + " yr"],
                ["Monthly P&I", fmt(rA.basePmt), fmt(rB.basePmt), fmt(Math.abs(rA.basePmt - rB.basePmt))],
                ["Monthly PMI/MIP", rA.miMonthly > 0 ? fmt(rA.miMonthly) : "-", rB.miMonthly > 0 ? fmt(rB.miMonthly) : "-", fmt(Math.abs(rA.miMonthly - rB.miMonthly))],
                ["Total Monthly Payment", fmt(rA.basePmt + rA.miMonthly), fmt(rB.basePmt + rB.miMonthly), fmt(pmtDelta)],
                ["Payoff Time", `${Math.floor(rA.sched.totalMonths/12)} yr ${rA.sched.totalMonths%12} mo`, `${Math.floor(rB.sched.totalMonths/12)} yr ${rB.sched.totalMonths%12} mo`, Math.abs(rA.sched.totalMonths - rB.sched.totalMonths) + " mo"],
                ["Total Interest Paid", fmt(rA.sched.totalInterest), fmt(rB.sched.totalInterest), fmt(intDelta)],
                ["Total PMI/MIP Paid", rA.totalMI > 0 ? fmt(rA.totalMI) : "-", rB.totalMI > 0 ? fmt(rB.totalMI) : "-", fmt(Math.abs(rA.totalMI - rB.totalMI))],
                ["Effective Cost (Int/Financed)", ratioA.toFixed(1) + "%", ratioB.toFixed(1) + "%", Math.abs(ratioA - ratioB).toFixed(1) + "%"],
                ["Total Cost of Borrowing", fmt(totalCostOfBorrowA), fmt(totalCostOfBorrowB), fmt(Math.abs(totalCostOfBorrowA - totalCostOfBorrowB))],
                ["Cash to Close (est.)", fmt(outOfPocketA), fmt(outOfPocketB), fmt(Math.abs(outOfPocketA - outOfPocketB))],
              ].map(([lbl, av, bv, diff], i) => (
                <tr key={lbl} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", borderBottom: `1px solid ${C.hairline}` }}>{lbl}</td>
                  <td style={{ color: C.gold, fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{av}</td>
                  <td style={{ color: C.text, fontSize: 14, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{bv}</td>
                  <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.mutedD, fontSize: 12, fontStyle: "italic", marginTop: 14, lineHeight: 1.6 }}>
          Edit any field above (amount, rate, term, or extra monthly) and everything recalculates live. Useful for comparing VA vs FHA vs Conventional, or "pay extra $200/mo" vs "refinance to a lower rate," or 30-yr vs 15-yr.
        </p>
      </div>
    </div>
  );
};

const LoanCalculator = () => {
  const [loanType, setLoanType] = useState("va");
  const [homePrice, setHomePrice] = useState(375000);
  const [downPct, setDownPct] = useState(0);
  const [termYears, setTermYears] = useState(30);
  const [rate, setRate] = useState(6.25);
  const [taxRate, setTaxRate] = useState(0.85);
  const [insuranceAnnual, setInsuranceAnnual] = useState(2500);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [vaFirstUse, setVaFirstUse] = useState(true);
  const [vaExempt, setVaExempt] = useState(false);
  const calcUsedRef = useRef(false);
  useEffect(() => { track("calculator_open", { event_category: "engagement", event_label: "loan_calculator" }); }, []);
  const markCalcUsed = () => { if (!calcUsedRef.current) { calcUsedRef.current = true; track("calculator_use", { event_category: "engagement", event_label: "loan_calculator" }); } };

  const rateDefaults = { va: 6.25, fha: 6.5, conv: 6.75 };
  const downDefaults = { va: 0, fha: 3.5, conv: 5 };

  const setLoan = (type) => {
    setLoanType(type);
    setRate(rateDefaults[type]);
    setDownPct(downDefaults[type]);
  };

  const hp = Number(homePrice) || 0;
  const dp = Number(downPct) || 0;
  const downPayment = hp * (dp / 100);
  const baseLoan = Math.max(0, hp - downPayment);

  let upfrontFee = 0;
  let upfrontLabel = "";
  if (loanType === "va" && !vaExempt) {
    let pct;
    if (dp < 5) pct = vaFirstUse ? 2.15 : 3.3;
    else if (dp < 10) pct = 1.5;
    else pct = 1.25;
    upfrontFee = baseLoan * (pct / 100);
    upfrontLabel = `VA Funding Fee (${pct}%)`;
  } else if (loanType === "fha") {
    upfrontFee = baseLoan * 0.0175;
    upfrontLabel = "FHA Upfront MIP (1.75%)";
  }
  const totalLoan = baseLoan + upfrontFee;

  const monthRate = (Number(rate) / 100) / 12;
  const numPmts = Number(termYears) * 12;
  const pi = monthRate === 0 ? totalLoan / numPmts : totalLoan * (monthRate * Math.pow(1 + monthRate, numPmts)) / (Math.pow(1 + monthRate, numPmts) - 1);

  const taxMonthly = (hp * (Number(taxRate) / 100)) / 12;
  const insMonthly = Number(insuranceAnnual) / 12;
  const hoaM = Number(hoaMonthly) || 0;

  let miMonthly = 0;
  let miLabel = "";
  const ltv = hp > 0 ? (totalLoan / hp) * 100 : 0;
  if (loanType === "fha") {
    miMonthly = (totalLoan * 0.0055) / 12;
    miLabel = "FHA Annual MIP (0.55%)";
  } else if (loanType === "conv" && dp < 20) {
    miMonthly = (totalLoan * 0.006) / 12;
    miLabel = "Conventional PMI (~0.6%)";
  }

  const totalMonthly = pi + taxMonthly + insMonthly + miMonthly + hoaM;
  const totalInterest = pi * numPmts - totalLoan;

  const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmt2 = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 16, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.hairline}` };

  const loanTypeInfo = {
    va: { title: "VA Loan", desc: "Zero down, no PMI, funded by the Department of Veterans Affairs. Available to eligible service members, veterans, and surviving spouses." },
    fha: { title: "FHA Loan", desc: "Federal Housing Administration loan. 3.5% minimum down (with 580+ credit score), backed by HUD. Good fit when VA isn't available." },
    conv: { title: "Conventional Loan", desc: "Fannie Mae / Freddie Mac standard loan. 3-5% down typical; 20% down avoids PMI. Most common for second homes and investment properties." },
  };

  return (
    <PageWrapper>
      <PageHero title="Loan Calculator: VA, FHA, and Conventional" subtitle={<>Prefilled with 2026 Pensacola-area market defaults. Every input is editable.<br />Estimates only*. Confirm with a VA-literate lender before offer.</>} breadcrumb="Home > Loan Calculator" />
      <Content>
        <div onChange={markCalcUsed} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.elevated, padding: 4, borderRadius: 8 }}>
              {[{id:"va",label:"VA Loan"},{id:"fha",label:"FHA"},{id:"conv",label:"Conventional"}].map(t => (
                <button key={t.id} aria-pressed={loanType === t.id} onClick={() => setLoan(t.id)} style={{
                  flex: 1, padding: "10px 12px",
                  background: loanType === t.id ? C.gold : "transparent",
                  color: loanType === t.id ? C.ink : "rgba(255,255,255,0.75)",
                  border: "none", borderRadius: 6,
                  fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                  cursor: "pointer", fontFamily: SS,
                }}>{t.label}</button>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>{loanTypeInfo[loanType].desc}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Home Price</label>
              <input type="number" aria-label="Home price" value={homePrice} onChange={e=>setHomePrice(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Down Payment %</label>
                <input type="number" step="0.5" aria-label="Down payment percent" value={downPct} onChange={e=>setDownPct(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Down Payment $</label>
                <div style={{ ...inputStyle, color: C.gold, display: "flex", alignItems: "center" }}>{fmt(downPayment)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Interest Rate %</label>
                <input type="number" step="0.125" aria-label="Interest rate percent" value={rate} onChange={e=>setRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Loan Term (yrs)</label>
                <select aria-label="Loan term in years" value={termYears} onChange={e=>setTermYears(Number(e.target.value))} style={inputStyle}>
                  <option value={30}>30</option>
                  <option value={20}>20</option>
                  <option value={15}>15</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Property Tax Rate %</label>
                <input type="number" step="0.05" aria-label="Property tax rate percent" value={taxRate} onChange={e=>setTaxRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Home Insurance /yr</label>
                <input type="number" step="100" aria-label="Home insurance per year" value={insuranceAnnual} onChange={e=>setInsuranceAnnual(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>HOA (monthly, optional)</label>
              <input type="number" step="10" aria-label="HOA monthly optional" value={hoaMonthly} onChange={e=>setHoaMonthly(e.target.value)} style={inputStyle} />
            </div>

            {loanType === "va" && (
              <div style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 16, borderRadius: 8, marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 13, cursor: "pointer", marginBottom: 10 }}>
                  <input type="checkbox" checked={vaFirstUse} onChange={e=>setVaFirstUse(e.target.checked)} /> First-time VA loan use
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={vaExempt} onChange={e=>setVaExempt(e.target.checked)} /> Funding fee exempt (Purple Heart or 10%+ VA disability)
                </label>
              </div>
            )}
          </div>

          <div>
            <div style={{ background: C.elevated, border: `2px solid ${C.goldLine}`, borderRadius: 12, padding: 28, marginBottom: 16 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: SS }}>Estimated Monthly Payment</div>
              <div style={{ fontFamily: SF, color: "#fff", fontSize: 44, fontWeight: 500, marginBottom: 20, lineHeight: 1 }}>{fmt2(totalMonthly)}</div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 14 }}>Principal &amp; Interest</span>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{fmt2(pi)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 14 }}>Property Tax</span>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{fmt2(taxMonthly)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 14 }}>Home Insurance</span>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{fmt2(insMonthly)}</span>
              </div>
              {miMonthly > 0 && (
                <div style={rowStyle}>
                  <span style={{ color: C.muted, fontSize: 14 }}>{miLabel}</span>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{fmt2(miMonthly)}</span>
                </div>
              )}
              {hoaM > 0 && (
                <div style={rowStyle}>
                  <span style={{ color: C.muted, fontSize: 14 }}>HOA</span>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{fmt2(hoaM)}</span>
                </div>
              )}
            </div>

            <div style={{ background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: SS }}>Loan Summary</div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Home Price</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(hp)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Down Payment ({dp}%)</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(downPayment)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Base Loan Amount</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(baseLoan)}</span>
              </div>
              {upfrontFee > 0 && (
                <div style={rowStyle}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{upfrontLabel}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(upfrontFee)}</span>
                </div>
              )}
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Total Financed</span>
                <span style={{ color: C.gold, fontSize: 14, fontWeight: 700 }}>{fmt(totalLoan)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Loan-to-Value</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{ltv.toFixed(1)}%</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={{ color: C.muted, fontSize: 13 }}>Total Interest ({termYears} yrs)</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(201,168,76,0.08)", border: `2px solid ${GOLD}55`, borderRadius: 12, padding: "18px 22px", margin: "16px 0 24px" }}>
          <p style={{ color: GOLD, fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing: 0.5 }}>⚠️ BAH IS A FOUNDATION, NOT A CEILING</p>
          <p style={{ color: "#ddd", fontSize: 14, lineHeight: 1.75, margin: 0 }}>The purchase-price estimates above assume BAH covers 100% of your PITI payment. In reality, many military families invest $200-$500/month above BAH to secure a home in a better-graded school zone, newer construction, or a shorter drive to base. I model specific scenarios for every buyer. Call <a href="tel:+18502665005" style={{ color: GOLD, fontWeight: 600 }}>(850) 266-5005</a> and we will run your numbers together.</p>
        </div>

        <InfoBox title="Estimates Only: Confirm With a Lender">
          This calculator uses 2026 Pensacola-area defaults: property tax 0.85% (Escambia/Santa Rosa/Okaloosa county median), homeowners insurance $2,500/yr (inland; coastal flood zones run meaningfully higher), and prevailing 30-year rates as of 2026 (VA 6.25%, FHA 6.5%, Conventional 6.75%). Your actual numbers depend on credit score, debt-to-income, flood zone, insurance quotes, and your specific lender's pricing.<br /><br />
          <strong>VA funding fee:</strong> First use &lt;5% down 2.15%, subsequent use &lt;5% down 3.3%, 5-9.99% down 1.5%, 10%+ down 1.25%. Exempt for Purple Heart recipients and veterans with 10%+ service-connected disability.<br />
          <strong>FHA MIP:</strong> 1.75% upfront (financed) plus 0.55% annual for most 30-year loans.<br />
          <strong>Conventional PMI:</strong> Assumed 0.6% annual when LTV &gt; 80%. Actual PMI varies by credit score, DTI, and coverage.
        </InfoBox>

        <AmortizationAnalyzer principal={totalLoan} annualRate={Number(rate)} years={Number(termYears)} basePayment={pi} />

        <LoanComparison />

        <p style={{ color: C.mutedD, fontSize: 11, fontStyle: "italic", marginTop: 40, padding: "10px 14px", border: `1px dashed ${C.goldLine}`, borderRadius: 6, lineHeight: 1.65 }}>
          <strong style={{ color: C.gold, fontStyle: "normal" }}>Disclaimer:</strong> All loan products, interest rates, fees (VA funding fee, FHA upfront and annual MIP, conventional PMI), and projected savings shown on this page are estimates using 2026 Pensacola-area market assumptions. Your actual loan terms, rate lock, pricing adjustments, MI rates, closing costs, and eligibility depend on your credit profile, debt-to-income ratio, property specifics, and the lender's underwriting. <strong style={{ color: "#fff", fontStyle: "normal" }}>Always verify every product, payment, and cost figure with your licensed mortgage loan officer before making any decision.</strong>
        </p>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.7, marginBottom: 24, maxWidth: 640, margin: "0 auto 24px" }}>Ready to turn a calculation into an offer? I connect you with VA-literate lenders who specialize in military buyers and match the home to your exact BAH and goals.</p>
          <BtnP href="tel:8502665005">Call 850-266-5005</BtnP>
        </div>
      </Content>
    </PageWrapper>
  );
};

const NeighborhoodsPage = ({ go }) => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  return (
  <PageWrapper>
    <PageHero title="Pensacola Area Communities &amp; Neighborhood Guides" subtitle="From Gulf-front beach living on Perdido Key to A-rated Santa Rosa schools in Gulf Breeze to starter homes minutes from the NAS Pensacola main gate: the complete guide to every community we serve." breadcrumb="Home > Communities" />
    <Content>
      <P>Thirteen distinct communities across the Pensacola and Fort Walton Beach Military Housing Areas. Each has its own BAH fit, school zoning, commute profile, and character. Click any card below for the full built-out guide with facts, sub-neighborhoods, BAH math, schools, hurricane considerations, and FAQ.</P>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, marginTop: 24 }}>
        {COMMUNITY_LINKS.map(n => {
          const slug = n.href.split("/").pop();
          return (
          <a key={n.href} href={n.href} style={{
            background: CHARCOAL, border: `1px solid #333`, borderRadius: 12,
            textDecoration: "none", display: "block", overflow: "hidden",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
            {/* Photo header: drops in /images/communities/<slug>.jpg when present; branded gradient until then */}
            <div style={{ height: 158, background: "linear-gradient(135deg,#1A2332,#2C3A4F)", position: "relative" }}>
              <Pic src={`/images/communities/${slug}.jpg?v=2`} alt={`${n.label}, Florida: community near Pensacola`} loading="lazy" width={1600} height={900} sizes={PIC_SIZES.communityCard}
                onError={e => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ padding: 24 }}>
              <h3 style={{ fontFamily: SF, color: "#fff", fontSize: 20, margin: "0 0 10px", fontWeight: 500 }}>{n.label}</h3>
              <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{n.blurb}</p>
              <div style={{ color: GOLD, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, fontFamily: SS }}>Read {n.label} Guide →</div>
            </div>
          </a>
          );
        })}
      </div>
      <InfoBox title="Need Help Choosing?">Every family has different priorities: schools, commute, budget, lifestyle, investment potential. Call me at (850) 266-5005 and we'll narrow it down together in a 15-minute conversation. No pressure, no obligation.</InfoBox>
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <BtnP onClick={() => setInquiryOpen(true)}>Request a Consultation</BtnP>
      </div>
    </Content>
    {inquiryOpen && <InquiryModal onClose={() => setInquiryOpen(false)} />}
  </PageWrapper>
  );
};


const CALENDLY_URL = "https://calendly.com/Greggcostin?hide_gdpr_banner=1&background_color=121823&text_color=e8e6df&primary_color=c9a84c";
const CalendlyEmbed = () => {
  const ref = useRef(null);
  useEffect(() => {
    const init = () => {
      if (window.Calendly && ref.current && !ref.current.querySelector("iframe")) {
        window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: ref.current });
      }
    };
    let script = document.querySelector("script[data-calendly-loader]");
    if (window.Calendly) init();
    else if (script) script.addEventListener("load", init);
    else {
      script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.setAttribute("data-calendly-loader", "1");
      script.addEventListener("load", init);
      document.body.appendChild(script);
    }
    const onMsg = (e) => {
      if (e.origin && e.origin.indexOf("calendly.com") > -1 && e.data && e.data.event === "calendly.event_scheduled" && window.gtag) {
        window.gtag("event", "strategy_call_booked", { event_category: "conversion" });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (
    <div>
      <div style={{ background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 12, overflow: "hidden" }}>
        <div ref={ref} style={{ minWidth: 300, height: 660 }} />
      </div>
      <p style={{ color: C.mutedD, fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>
        Calendar not loading? <a href="https://calendly.com/Greggcostin" target="_blank" rel="noopener" style={{ color: C.gold }}>Open it directly</a> or call/text <a href="tel:+18502665005" style={{ color: C.gold }}>(850) 266-5005</a>.
      </p>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", inquiryType: "PCS / Relocation — Buying", message: "", honeypot: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const uid = useId();
  const WEBHOOK_URL = "https://costin-contact.gregg-costin.workers.dev";

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    if (!formData.name.trim() || !formData.email.trim()) { setStatus("error"); setErrorMsg("Name and email are required."); return; }
    try {
      // The contact worker requires `message` and reads the honeypot from `_gotcha`.
      const payload = withAttribution({ name: formData.name, email: formData.email, phone: formData.phone, inquiryType: formData.inquiryType, message: formData.message.trim() || `Inquiry from ${window.location.pathname} (no message text)`, _gotcha: formData.honeypot });
      const response = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        track("inquiry_submit", { inquiry_type: formData.inquiryType, cta_location: "spa-contact-page", page_path: window.location.pathname });
        setFormData({ name: "", email: "", phone: "", inquiryType: "PCS / Relocation — Buying", message: "", honeypot: "" });
      } else { setStatus("error"); setErrorMsg(data.error || "Something went wrong. Please call (850) 266-5005."); }
    } catch (err) { setStatus("error"); setErrorMsg("Connection error. Please call (850) 266-5005 directly."); }
  };

  return (
    <PageWrapper>
      <PageHero title="Contact Gregg Costin" subtitle="Whether you're 90 days from PCS or boots-on-ground tomorrow, I respond to every inquiry within 2 hours during business hours." />
      <Content>
        <div style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.03))", border: `1px solid ${C.goldLine}`, borderRadius: 14, padding: "24px 24px 20px", marginBottom: 36 }}>
          <h3 style={{ fontFamily: SF, fontSize: 22, color: "#fff", margin: "0 0 8px", fontWeight: 500 }}>Fastest option: book a 15-minute call</h3>
          <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 16px" }}>
            Pick any open slot below and it's confirmed instantly. The calendar shows times in <strong style={{ color: C.gold }}>your</strong> time zone, so it works from Ramstein or Yokosuka as easily as from downtown Pensacola. Prefer email or a message? The form below works too.
          </p>
          <CalendlyEmbed />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 32 }}>
          <div style={{ maxWidth: 420, margin: "0 auto", width: "100%" }}>
            <h3 style={{ fontSize: 18, color: C.gold, marginTop: 32, marginBottom: 12, fontWeight: 700, fontFamily: SF, textAlign: "center" }}>Direct Contact</h3>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Pic loading="lazy" sizes={PIC_SIZES.contactRound} src={IMG.navyTie} alt="Gregg Costin" style={{ width: 360, height: 360, maxWidth: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "center -30px", border: `3px solid ${GOLD}44`, display: "block", marginLeft: "auto", marginRight: "auto" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ color: "#fff", fontSize: 26, fontWeight: 600, fontFamily: SF, margin: "0 0 6px", letterSpacing: .2, textAlign: "center" }}>Gregg Costin, Realtor<sup style={{ fontSize: "0.55em", verticalAlign: "top", marginLeft: 1 }}>®</sup></p>
              <p style={{ color: GOLD, fontSize: 11, fontWeight: 600, margin: "0 0 16px", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>MRP<sup style={{ fontSize: "0.8em" }}>®</sup> &middot; ABR<sup style={{ fontSize: "0.8em" }}>®</sup> &middot; SRS<sup style={{ fontSize: "0.8em" }}>®</sup> &middot; RENE<sup style={{ fontSize: "0.8em" }}>®</sup> &middot; FMS<sup style={{ fontSize: "0.8em" }}>®</sup></p>
              <a href="tel:8502665005" style={{ color: GOLD, fontSize: 24, fontWeight: 700, textDecoration: "none", textAlign: "center", display: "block" }}>(850) 266-5005</a>
              <p style={{ color: "#888", fontSize: 13, marginTop: 4, textAlign: "center" }}>Call or text: this is my direct line</p>
            </div>
            <div style={{ background: "rgba(10,15,26,0.4)", border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 10, overflow: "hidden", marginTop: 12, boxShadow: "0 4px 18px rgba(0,0,0,0.25)" }}>
              <div style={{ background: `linear-gradient(135deg, ${C.panel}, ${C.elevated})`, color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "10px 16px", borderBottom: `1px solid rgba(201,168,76,0.25)`, textAlign: "center" }}>Social &amp; Web</div>
              <div style={{ padding: "4px 16px" }}>
                {[
                  ["Instagram", "@greggcostinrealtor", "https://www.instagram.com/greggcostinrealtor/"],
                  ["Facebook", "@greggcostin", "https://www.facebook.com/greggcostin/"],
                  ["LinkTree", "linktr.ee/Greggcostin", "https://linktr.ee/Greggcostin"],
                ].map(([label, value, href]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 12 }}>
                    <span style={{ color: "#bbb", fontSize: 12, letterSpacing: 0.5 }}>{label}</span>
                    <a href={href} target="_blank" rel="noopener" style={{ color: GOLD, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "right", wordBreak: "break-word" }}>{value}</a>
                  </div>
                ))}
              </div>
              <div style={{ background: `linear-gradient(135deg, ${C.panel}, ${C.elevated})`, color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "10px 16px", borderTop: `1px solid rgba(201,168,76,0.25)`, borderBottom: `1px solid rgba(201,168,76,0.25)`, textAlign: "center" }}>Email</div>
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <a href="mailto:gregg.costin@gmail.com" style={{ color: GOLD, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>gregg.costin@gmail.com</a>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${C.panel}, ${C.elevated})`, color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "10px 16px", borderTop: `1px solid rgba(201,168,76,0.25)`, borderBottom: `1px solid rgba(201,168,76,0.25)`, textAlign: "center" }}>Levin Rinke Realty Offices</div>
              <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, textAlign: "center" }}>
                <div>
                  <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>Downtown</div>
                  <div style={{ color: "#bbb", fontSize: 12.5, lineHeight: 1.55, textAlign: "center" }}>220 W. Garden Street<br />Pensacola, FL 32502</div>
                </div>
                <div>
                  <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>Perdido Key</div>
                  <div style={{ color: "#bbb", fontSize: 12.5, lineHeight: 1.55, textAlign: "center" }}>13575 Perdido Key Dr<br />Pensacola, FL 32507</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <H3>Send a Message</H3>
            {status === "success" ? (
              <div style={{ background: "#1a3a1a", border: "2px solid #3aa03a", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <h4 style={{ color: "#6adf6a", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Message Received</h4>
                <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Thanks for reaching out. I've received your message and will respond within 2 hours during business hours.</p>
                <button onClick={() => setStatus("idle")} style={{ marginTop: 16, background: "transparent", border: `1px solid ${GOLD}55`, color: GOLD, padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <input type="text" name="website" value={formData.honeypot} onChange={handleChange("honeypot")} style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div>
                  <label htmlFor={`${uid}-name`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Full Name *</label>
                  <input id={`${uid}-name`} type="text" value={formData.name} onChange={handleChange("name")} required disabled={status === "submitting"} style={{ width: "100%", padding: "18px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Email Address *</label>
                  <input id={`${uid}-email`} type="email" value={formData.email} onChange={handleChange("email")} required disabled={status === "submitting"} style={{ width: "100%", padding: "18px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label htmlFor={`${uid}-phone`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Phone Number</label>
                  <input id={`${uid}-phone`} type="tel" value={formData.phone} onChange={handleChange("phone")} disabled={status === "submitting"} style={{ width: "100%", padding: "18px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label htmlFor={`${uid}-type`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>What Can I Help With?</label>
                  <select id={`${uid}-type`} value={formData.inquiryType} onChange={handleChange("inquiryType")} disabled={status === "submitting"} style={{ width: "100%", padding: "18px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none" }}>
                    <option>PCS / Relocation — Buying</option>
                    <option>PCS / Relocation — Selling</option>
                    <option>VA Loan Questions</option>
                    <option>Investment Property</option>
                    <option>General Question</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                  <label htmlFor={`${uid}-message`} style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Message</label>
                  <textarea id={`${uid}-message`} rows={12} value={formData.message} onChange={handleChange("message")} disabled={status === "submitting"} style={{ width: "100%", padding: "18px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none", resize: "vertical", boxSizing: "border-box", flex: 1, minHeight: 200 }} />
                </div>
                {status === "error" && (
                  <div style={{ background: "#3a1a1a", border: "1px solid #a03a3a", borderRadius: 8, padding: 12, color: "#ff9999", fontSize: 13 }}>
                    ⚠ {errorMsg}
                  </div>
                )}
                <button type="submit" disabled={status === "submitting"} style={{ background: status === "submitting" ? `${GOLD}66` : GOLD, color: BLACK, border: "none", padding: "14px 28px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: status === "submitting" ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: .5, marginTop: 8 }}>
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </button>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 4, textAlign: "center" }}>By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.</p>
              </form>
            )}
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <InfoBox title="Response Time">I respond to every inquiry within 2 hours during business hours (8am-8pm CT, 7 days a week). After hours messages receive a response by 8am the next morning. If your situation is urgent, call directly. I answer my phone.</InfoBox>
        </div>
      </Content>
    </PageWrapper>
  );
};

const PAGE_TO_SLUG = {
  home: "/",
  about: "/about",
  pcs: "/pcs-guide",
  neighborhoods: "/communities",
  calculator: "/mortgage-calculators",
  contact: "/contact",
};
const SLUG_TO_PAGE = Object.fromEntries(Object.entries(PAGE_TO_SLUG).map(([k, v]) => [v, k]));

const resolvePageFromPath = (pathname) => {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (SLUG_TO_PAGE[clean]) return SLUG_TO_PAGE[clean];
  if (clean === "/") return "home";
  // Unknown path (audit 2026-09-02, idx-01). The server now returns public/404.html with a
  // real 404 status; this branch only fires for client-side history states.
  try { if (typeof window.gtag === "function") window.gtag("event", "page_not_found", { page_path: clean, page_referrer: document.referrer || "" }); } catch {}
  return "notfound";
};

const NotFoundPage = ({ go }) => (
  <PageWrapper>
    <PageHero title="Page not found" subtitle="That address does not exist on this site. The pages military families use most are one tap away." />
    <Content>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <BtnP onClick={() => go("home")}>Home</BtnP>
        <BtnG onClick={() => go("pcs")}>PCS Guide</BtnG>
        <BtnG href="/bah-rates">2026 BAH Rates</BtnG>
        <BtnG href="/va-loan-guide">VA Loan Guide</BtnG>
        <BtnG onClick={() => go("neighborhoods")}>Communities</BtnG>
        <BtnG onClick={() => go("contact")}>Contact</BtnG>
      </div>
    </Content>
  </PageWrapper>
);

export default function App() {
  const [page, setPage] = useState(() => typeof window !== "undefined" ? resolvePageFromPath(window.location.pathname) : "home");

  const go = (id) => {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
    const slug = PAGE_TO_SLUG[id] || "/";
    if (window.location.pathname !== slug) {
      history.pushState({ page: id }, "", slug);
    }
    setPage(id);
    window.scrollTo(0, 0);
    const m = META_BY_PAGE[id] || META_BY_PAGE.home;
    if (m) document.title = m.title; // set before page_view so GA4 logs the right title
    trackPageView(slug);
    trackFUBPageView();
  };

  useEffect(() => {
    const onPopState = () => {
      const id = resolvePageFromPath(window.location.pathname);
      setPage(id);
      window.scrollTo(0, 0);
      const m = META_BY_PAGE[id] || META_BY_PAGE.home;
      if (m) document.title = m.title;
      trackPageView(window.location.pathname);
      trackFUBPageView();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Per-route head sync (audit 2.15): keep document.title + canonical + og in step
  // with the current SPA page, from the SAME source as the prerendered shells.
  useEffect(() => {
    const m = META_BY_PAGE[page] || META_BY_PAGE.home;
    const canon = SITE + (m.slug || "/");
    document.title = m.title;
    const set = (sel, attr, val) => { const el = document.head.querySelector(sel); if (el && val != null) el.setAttribute(attr, val); };
    set('link[rel="canonical"]', "href", canon);
    set('meta[name="description"]', "content", m.description);
    set('meta[property="og:url"]', "content", canon);
    set('meta[property="og:title"]', "content", m.title);
    set('meta[property="og:description"]', "content", m.description);
    set('meta[name="twitter:url"]', "content", canon);
    set('meta[name="twitter:title"]', "content", m.title);
    set('meta[name="twitter:description"]', "content", m.description);
    const og = m.shell ? `${SITE}/og/${m.file}.png` : `${SITE}/og/home.png`;
    set('meta[property="og:image"]', "content", og);
    set('meta[name="twitter:image"]', "content", og);
  }, [page]);

  useEffect(() => {
    const HASH_TO_PAGE = { "calculator": "calculator", "bah-calculator": "calculator" };
    const handleHash = () => {
      const id = window.location.hash.substring(1);
      if (!id) return;
      if (HASH_TO_PAGE[id]) {
        setPage(HASH_TO_PAGE[id]);
        window.scrollTo(0, 0);
        return;
      }
      const tryScroll = (attempts = 10) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts > 0) {
          setTimeout(() => tryScroll(attempts - 1), 80);
        }
      };
      tryScroll();
    };
    if (window.location.hash) handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [page]);

  return (
    <div style={{ fontFamily: SS, margin: 0, padding: 0, background: C.ink, minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <style>{`
        /* perf-01: fonts are preloaded from the index.html head. Never re-add an @import here:
           inside a React-rendered style block it is only discovered after the JS bundle executes. */
        .tabbar::-webkit-scrollbar { display: none; }
        .tabbar { -ms-overflow-style: none; scrollbar-width: none; }
        [id] { scroll-margin-top: 100px; }
        .skip-link { position: absolute; left: -9999px; top: 0; z-index: 3000; background: ${C.gold}; color: ${C.ink}; padding: 10px 16px; font-weight: 700; text-decoration: none; border-radius: 0 0 6px 0; }
        .skip-link:focus { left: 0; }
        /* ── mobile header: 57px bar + hamburger drawer (<=900px), audit 2026-09-02 ── */
        .nav-toggle { display: none; }
        @media (max-width: 900px) {
          .spa-nav > div:first-of-type { grid-template-columns: auto 1fr auto !important; padding: 6px 12px !important; gap: 10px !important; min-height: 57px; align-items: center; }
          .spa-nav > div:first-of-type > div:nth-child(1) { display: none !important; }
          .spa-nav > div:first-of-type > div:nth-child(2) { justify-self: start !important; }
          .spa-nav img { height: 40px !important; }
          .spa-nav > div:first-of-type > div:nth-child(3) { flex-direction: row !important; justify-self: end !important; gap: 0 !important; }
          .spa-nav a[href^="tel:"] { display: inline-flex !important; align-items: center; min-height: 44px; padding: 0 8px; font-size: 15px !important; white-space: nowrap; }
          .spa-nav a[href^="mailto:"] { display: none !important; }
          /* Phones: every tab stays visible on phones (owner preference, Sep 2026); the drawer markup stays but is inert. */
          .spa-nav { position: sticky !important; top: 0 !important; }
          .nav-toggle { display: none !important; }
          .spa-drawer { display: block !important; position: static !important; top: auto !important; background: none !important; padding: 0 !important; overflow: visible !important; z-index: auto !important; }
          .spa-nav .tabbar { flex-direction: row !important; flex-wrap: wrap !important; align-items: center !important; justify-content: center !important; gap: 2px !important; padding: 4px 6px 8px !important; overflow: visible !important; }
          .spa-nav .tabbar > button, .spa-nav .tabbar > a, .spa-nav .tabbar .spa-drop > button, .spa-nav .tabbar .spa-drop > a { display: inline-flex !important; align-items: center; justify-content: center; width: auto !important; min-height: 30px; margin: 0 !important; padding: 5px 8px !important; font-size: 11px !important; letter-spacing: .3px !important; line-height: 1.1; text-align: center !important; border-bottom: none !important; border-radius: 6px !important; }
          .spa-nav .spa-drop { position: relative !important; padding: 0 !important; width: auto !important; }
          .spa-nav .spa-dropmenu { position: absolute !important; padding: 6px 0 !important; min-width: 200px !important; }
          body.drawer-open { overflow: auto !important; }
          .hero-section { min-height: auto !important; padding-top: 0 !important; }
          .page-wrap { padding-top: 0 !important; }
          .hero-bg-image, .hero-gradient-h, .hero-gradient-v { top: 0 !important; }
          .hero-gradient-h { background: linear-gradient(90deg, #0A0F1A 0%, rgba(10,15,26,0.85) 55%, rgba(10,15,26,0.6) 100%) !important; }
          .hero-content { padding: 24px 20px 64px !important; }
          [id] { scroll-margin-top: 72px; }
          footer a, footer button { display: inline-block; padding: 10px 6px; min-height: 44px; line-height: 24px; }
          /* mob-08: the hero designation pills are 31px chips on desktop; on phones they need a 44px target. */
          .hero-pill { min-height: 44px; display: inline-flex !important; align-items: center; }
        }
        @media (max-width: 640px) {
          .spa-nav .tabbar { padding-bottom: 12px !important; }
        }
        .sticky-mobile-cta { display: none; }
        @media (max-width: 800px) {
          body { padding-bottom: calc(76px + env(safe-area-inset-bottom)); }
          .sticky-mobile-cta { display: flex; gap: 10px; position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 9999; }
          .sticky-mobile-cta a { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 48px; padding: 12px 14px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: .2px; font-family: ${SS}; box-shadow: 0 6px 20px rgba(0,0,0,.45); }
          .sticky-mobile-cta .smc-call { background: #C9A84C; color: #0A0F1A; }
          .sticky-mobile-cta .smc-text { background: #1A2332; color: #fff; border: 1px solid #C9A84C; }
          .sticky-mobile-cta .smc-email { background: #1A2332; color: #fff; border: 1px solid #C9A84C; }
          .sticky-mobile-cta a:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
          iframe[name="widgetCta"] { display: none !important; }
        }
      `}</style>
      <Nav current={page} go={go} />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
      {page === "home" && <>
        <Hero go={go} />
        <TrustBar />
        <div id="services"></div>
        <div id="va-loans"></div>
        <div id="pcs-guide"></div>
        <Services go={go} />
        <div id="about-gregg"></div>
        <MilitaryStory go={go} />
        <SocialProof go={go} />
        <BasesAndCommunitiesSection />
        <div id="contact"></div>
        <div id="bah-calculator"></div>
        <CtaBanner go={go} />
      </>}
      {page === "about" && <AboutPage go={go} />}
      {page === "pcs" && <PCSPage go={go} />}
      {page === "calculator" && <LoanCalculator />}
      {page === "nas" && <BaseGuide base="nas" go={go} />}
      {page === "whiting" && <BaseGuide base="whiting" go={go} />}
      {page === "corry" && <BaseGuide base="corry" go={go} />}
      {page === "eglin" && <BaseGuide base="eglin" go={go} />}
      {page === "hurlburt" && <BaseGuide base="hurlburt" go={go} />}
      {page === "neighborhoods" && <NeighborhoodsPage go={go} />}
      {page === "contact" && <ContactPage />}
      {page === "notfound" && <NotFoundPage go={go} />}
      </main>
      <Footer go={go} />
      <div className="sticky-mobile-cta" role="group" aria-label="Contact Gregg Costin">
        <a className="smc-call" href="tel:+18502665005" aria-label="Call Gregg Costin at 850-266-5005" data-cta="sticky-call">📞 Call</a>
        <a className="smc-text" href="sms:+18502665005?&body=Hi%20Gregg%2C%20I%20have%20a%20question%20about%20PCSing%20to%20Pensacola." aria-label="Text Gregg Costin at 850-266-5005" data-cta="sticky-text">💬 Text</a>
        <a className="smc-email" href="mailto:gregg.costin@gmail.com?subject=Question%20from%20PensacolaMilitaryHousing.com" aria-label="Email Gregg Costin at gregg.costin@gmail.com" data-cta="sticky-email">✉️ Email</a>
      </div>
    </div>
  );
}
