import { useState, useEffect } from "react";

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const C = {
  ink: "#0A0F1A", panel: "#121823", elevated: "#1A2332",
  hairline: "rgba(255,255,255,0.08)",
  gold: "#C9A84C", goldSoft: "#D4B768",
  goldTint: "rgba(201,168,76,0.10)", goldLine: "rgba(201,168,76,0.35)",
  text: "#E8E6DF", muted: "#A5A496", mutedD: "#6F6E65",
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
  { id: "va-loan", label: "VA Loans" },
  { id: "homestead", label: "Homestead" },
  { id: "nas", label: "NAS Pensacola" },
  { id: "whiting", label: "Whiting Field" },
  { id: "corry", label: "Corry Station" },
  { id: "eglin", label: "Eglin AFB" },
  { id: "hurlburt", label: "Hurlburt Field" },
  { id: "neighborhoods", label: "Neighborhoods" },
  { id: "blog", label: "Blog" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact" },
];

const BASES_LINKS = [
  { label: "NAS Pensacola", href: "/nas-pensacola.html", blurb: "The Cradle of Naval Aviation. Flight training, Blue Angels, and the #1 PCS destination for Naval Aviators and Combat Systems Officers." },
  { label: "Corry Station", href: "/corry-station.html", blurb: "The Navy's premier information warfare, cryptology, and cyber training base." },
  { label: "Saufley Field", href: "/saufley-field.html", blurb: "NIOC Pensacola, a CIWT detachment, NETSAFA, and DLI Pensacola linguist training. Tenant of NAS Pensacola." },
  { label: "NAS Whiting Field", href: "/nas-whiting-field.html", blurb: "The Navy's primary helicopter training base and one of the busiest airfields in the world." },
  { label: "Hurlburt Field", href: "/hurlburt-field.html", blurb: "Headquarters of Air Force Special Operations Command. AC-130s, MC-130s, CV-22s, and the special tactics community." },
  { label: "Eglin AFB", href: "/eglin-afb.html", blurb: "33rd Fighter Wing (F-35A training), 96th Test Wing, 7th SFG, and the largest forested Air Force installation in the US." },
  { label: "Duke Field", href: "/duke-field.html", blurb: "Home of the 919th Special Operations Wing (AFRC). MC-130J and MQ-9, adjacent to Crestview." },
];

const COMMUNITY_LINKS = [
  { label: "Gulf Breeze", href: "/gulf-breeze.html", blurb: "The #1 family choice for NAS Pensacola. A-rated Santa Rosa schools, 15-min commute, premium pricing." },
  { label: "Navarre", href: "/navarre.html", blurb: "Santa Rosa County beach community between Hurlburt Field and NAS Pensacola. 15-25% cheaper per square foot than Gulf Breeze." },
  { label: "Pace", href: "/pace.html", blurb: "New construction, A-rated schools, best BAH-per-square-foot value in the Pensacola MHA." },
  { label: "Milton", href: "/milton.html", blurb: "Santa Rosa County seat. Historic downtown, 10 minutes to NAS Whiting Field, lowest BAH-supported entry point." },
  { label: "Cantonment", href: "/cantonment.html", blurb: "North Escambia County. Larger lots, new construction, 20-25 minutes to NAS Pensacola." },
  { label: "Perdido Key", href: "/perdido-key.html", blurb: "Gulf-front barrier island. 15 minutes to NAS Pensacola, beach lifestyle, strong rental investment play." },
  { label: "East Pensacola Heights", href: "/east-pensacola-heights.html", blurb: "Historic walkable peninsula. 5-10 minutes to NAS Pensacola. Character bungalows on Bayou Texar." },
  { label: "East Hill", href: "/east-hill.html", blurb: "Historic Craftsman neighborhood, walkable 12th Avenue dining, 10-15 min to NAS Pensacola." },
  { label: "Cordova Park", href: "/cordova-park.html", blurb: "Established mid-century neighborhood near Cordova Mall. Solid Escambia schools, central Pensacola." },
  { label: "Ferry Pass", href: "/ferry-pass.html", blurb: "North Pensacola suburban neighborhoods. Mid-century and 1990s-2000s homes, 20-30 min commute, E-4 friendly pricing." },
  { label: "Bellview/Myrtle Grove", href: "/bellview-myrtle-grove.html", blurb: "West Pensacola working-class neighborhoods. 10-15 min to NAS Pensacola. Strongest E-3 to E-5 starter-home market." },
  { label: "Navy Point/Warrington", href: "/navy-point-warrington.html", blurb: "5 minutes from the NAS Pensacola main gate. Closest off-base housing in the MHA. Historic ties, most affordable entry." },
  { label: "Niceville/Valparaiso/Bluewater Bay", href: "/niceville-valparaiso-bluewater-bay.html", blurb: "Eglin AFB East Gate housing. A-rated Niceville High zone, master-planned Bluewater Bay, 10-minute commute for 33rd FW and 96th TW families." },
  { label: "Fort Walton Beach/Shalimar", href: "/fort-walton-beach-shalimar.html", blurb: "Adjacent to the Eglin AFB West Gate. 5-15 minute commute, Okaloosa schools, broad mix of price points for E-4 to O-5 families." },
  { label: "Destin", href: "/destin.html", blurb: "Gulf-front Okaloosa resort city. Premium beach and condo market, 20 min to Eglin, 10 min to Hurlburt. Strong military investment-rental play." },
  { label: "Crestview", href: "/crestview.html", blurb: "Okaloosa County budget play for Eglin AFB and Duke Field. New construction, strongest FL023 BAH-to-price ratio." },
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
  logo08: "/images/logo-08.png",
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

const Nav = ({ current, go }) => {
  const [scrolled, setScrolled] = useState(false);
  const [basesOpen, setBasesOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);
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
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(10,15,26,0.95)" : "rgba(10,15,26,0.88)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "transparent"}`, transition: "all .3s ease" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "10px 16px 0", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
        <div style={{ justifySelf: "start", cursor: "pointer" }} onClick={() => go("home")}>
          <img loading="lazy" src={IMG.logoLrr} alt="Levin Rinke Realty" style={{ height: 108, objectFit: "contain" }} />
        </div>
        <div style={{ justifySelf: "center", cursor: "pointer" }} onClick={() => go("home")}>
          <img loading="lazy" src={IMG.logo08} alt="The Costin Team" style={{ height: 108, objectFit: "contain" }} />
        </div>
        <div style={{ justifySelf: "end", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <a href="tel:8502665005" style={{ color: C.gold, fontSize: 20, fontWeight: 700, textDecoration: "none", letterSpacing: 0.5, fontFamily: SS, whiteSpace: "nowrap" }}>(850) 266-5005</a>
          <a href="mailto:Gregg.Costin@gmail.com" style={{ color: C.gold, fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: 0.3, fontFamily: SS, whiteSpace: "nowrap" }}>Gregg.Costin@gmail.com</a>
        </div>
      </div>

      <div className="tabbar" style={{ maxWidth: 1320, margin: "0 auto", padding: "6px 12px 10px", overflowX: "visible", display: "flex", gap: 2, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <Tab id="home" label="Home" />
        <Tab id="about" label="About Me" />
        <Tab id="pcs" label="PCS Guide" />

        <div style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => setBasesOpen(true)}
          onMouseLeave={() => setBasesOpen(false)}>
          <button onClick={() => setBasesOpen(!basesOpen)} style={tabStyle(basesActive)}>Bases ▾</button>
          {basesOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 220, boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              {BASES_LINKS.map(b => <DropItem key={b.href} href={b.href} label={b.label} />)}
            </div>
          )}
        </div>

        <div style={{ position: "relative", paddingBottom: 4 }}
          onMouseEnter={() => setCommsOpen(true)}
          onMouseLeave={() => setCommsOpen(false)}>
          <button onClick={() => { go("neighborhoods"); setCommsOpen(false); }} style={tabStyle(commsActive)}>Communities ▾</button>
          {commsOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, background: C.elevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, minWidth: 240, maxHeight: 440, overflowY: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.6)", zIndex: 100 }}>
              <button onClick={() => { go("neighborhoods"); setCommsOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: commsActive ? "rgba(201,168,76,0.12)" : "transparent", border: "none", color: C.gold, padding: "10px 16px", fontSize: 11, cursor: "pointer", borderRadius: 4, fontFamily: SS, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${C.hairline}`, marginBottom: 4 }}>All Communities Overview</button>
              {COMMUNITY_LINKS.map(c => <DropItem key={c.href} href={c.href} label={c.label} />)}
            </div>
          )}
        </div>

        <Tab id="va-loan" label="VA Loans" />
        <Tab id="calculator" label="Mortgage Calculator" />
        <Tab id="homestead" label="Homestead" />
        <ExtTab href="/blog.html" label="Blog" />
        <ExtTab href="/reviews.html" label="Reviews" />
        <ExtTab href="/faq.html" label="FAQ" />
        <Tab id="contact" label="Contact" />
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
const H3 = ({ children }) => <h3 style={{ fontSize: 18, color: C.gold, marginTop: 32, marginBottom: 12, fontWeight: 700, fontFamily: SF }}>{children}</h3>;
const H3G = H3;
const Body = ({ children }) => <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.85, marginBottom: 16, fontWeight: 300 }}>{children}</p>;
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
const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${CHARCOAL}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "18px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
  <div style={{ background: C.ink, minHeight: "100vh", paddingTop: 80 }}>{children}</div>
);
const PageHero = ({ title, subtitle, breadcrumb }) => (
  <section style={{ background: `linear-gradient(135deg, ${C.panel}, #1a2332)`, padding: "60px 24px", borderBottom: `1px solid ${C.hairline}` }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {breadcrumb && <div style={{ color: C.muted, fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>{breadcrumb}</div>}
      <h1 style={{ fontFamily: SF, fontSize: "clamp(28px,4vw,42px)", color: "#fff", lineHeight: 1.2, marginBottom: 12, fontWeight: 500 }}>{title}</h1>
      {subtitle && <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 700 }}>{subtitle}</p>}
    </div>
  </section>
);
const Content = ({ children }) => (
  <section style={{ padding: "48px 24px" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
  </section>
);

/* ═══════════════ HERO ═══════════════ */
const Hero = ({ go }) => (
  <section style={{ position: "relative", minHeight: "100vh", background: C.ink, overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 180 }}>
    <div style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0, backgroundImage: `url(${IMG.heroWindow})`, backgroundSize: "auto 100%", backgroundPosition: "right top", backgroundRepeat: "no-repeat" }} />
    <div style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0, background: `linear-gradient(90deg,${C.ink} 0%,${C.ink} 30%,rgba(10,15,26,0.75) 55%,rgba(10,15,26,0.25) 80%,rgba(10,15,26,0.1) 100%)` }} />
    <div style={{ position: "absolute", top: 180, left: 0, right: 0, bottom: 0, background: `linear-gradient(180deg,transparent 0%,transparent 70%,${C.ink} 100%)` }} />
    <div style={{ position: "absolute", top: "20%", right: "5%", width: 500, height: 500, background: `radial-gradient(circle,${C.goldTint} 0%,transparent 70%)`, pointerEvents: "none" }} />
    <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1280, margin: "0 auto", padding: "40px 32px 120px" }}>
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
          <BtnP onClick={() => go("pcs")}>Start Your PCS Search</BtnP>
          <BtnG href="tel:8502665005">Call 850-266-5005</BtnG>
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["MRP®", "ABR®", "SRS®", "RENE®", "FMS®"].map(d => (
            <div key={d} style={{ border: `1px solid ${C.goldLine}`, padding: "8px 16px", color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, fontFamily: SS }}>{d}</div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, borderTop: `1px solid ${C.hairline}`, background: "rgba(10,15,26,0.85)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
        {[["USAF", "Prior Enlisted, Retired Combat Systems Officer"], ["11", "Personal PCS Moves"], ["Top 5%", "Pensacola Agents"], ["5.0 ★", "Zillow Premier Agent", "https://www.zillow.com/profile/GreggCostin"]].map(([n, l, href]) => {
          const inner = (
            <>
              <div style={{ fontFamily: SF, fontSize: 32, color: C.gold, fontWeight: 500, lineHeight: 1 }}>{n}</div>
              <div style={{ marginTop: 8, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: C.muted, fontFamily: SS }}>{l}</div>
            </>
          );
          return href
            ? <a key={l} href={href} target="_blank" rel="noopener" style={{ textDecoration: "none", display: "block", cursor: "pointer" }}>{inner}</a>
            : <div key={l}>{inner}</div>;
        })}
      </div>
    </div>
  </section>
);

const TrustBar = () => (
  <section style={{ background: C.ink, borderBottom: `1px solid ${C.hairline}`, padding: "40px 32px" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ textAlign: "center", color: C.gold, fontSize: 18, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", fontFamily: SS, marginBottom: 32, textDecoration: "underline", textUnderlineOffset: 6, textDecorationThickness: 2 }}>Preferred Agent</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32, alignItems: "end" }}>
        {[
          { name: "VeteranPCS", logo: "/images/partner-veteranpcs.png" },
          { name: "Tier 1 Group", logo: "/images/partner-tier1.png" },
          { name: "M.O.R.E. Network", logo: "/images/partner-more.png" },
          { name: "Levin Rinke Realty", logo: "/images/partner-lrr.png", scale: 1.5 },
          { name: "Forbes Global Properties", logo: "/images/partner-forbes.png" },
        ].map(({ name, logo, scale = 1 }) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: SS, textAlign: "center" }}>{name}</div>
            <div style={{ width: 200, height: 112, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
              <img loading="lazy" src={logo} alt={name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", display: "block", opacity: 0.9, transform: `scale(${scale})`, transformOrigin: "center" }} />
            </div>
          </div>
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
        Whether you're PCSing in, selling before your next assignment, or investing in Gulf Coast real estate — every engagement starts with strategy and ends with results.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 1, background: C.hairline, border: `1px solid ${C.hairline}` }}>
      {[
        { title: "PCS Relocation", link: "pcs", desc: "Complete relocation support for military families moving to the Florida Panhandle. Virtual tours, closing coordination across time zones, and deep knowledge of every base community." },
        { title: "VA Home Loans", link: "va-loan", desc: "Expert guidance through the VA loan process. Zero down payment, no PMI, competitive rates. I've helped hundreds of military families leverage their earned benefit to build real wealth." },
        { title: "Sell Your Home", link: "contact", desc: "PCSing out? I'll get your home sold fast and for top dollar with aggressive marketing, professional photography, and pricing strategy backed by real market data." },
      ].map(({ title, desc, link }) => (
        <div key={title} onClick={() => go(link)} style={{ background: C.ink, padding: "48px 40px", cursor: "pointer", minHeight: 320, display: "flex", flexDirection: "column" }}>
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
        <Eyebrow>A Full USAF Career — Enlisted to Officer</Eyebrow>
        <H2>I didn't just study the military lifestyle. I lived it.</H2>
        <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted, fontWeight: 300, marginBottom: 24 }}>
          I am a Prior-Enlisted, Retired USAF Combat Systems Officer on the E-3 AWACS. 11 PCS moves. Deployments to combat zones. I know what it feels like to house-hunt from 6,000 miles away with a family counting on you to get it right.
        </p>
        <p style={{ fontSize: 15.5, lineHeight: 1.85, color: C.text, fontWeight: 300, marginBottom: 32 }}>
          That experience drives everything I do as a Realtor. When you call me 90 days before PCS, I already know the questions you haven't thought to ask yet — because I've been in your exact seat.
        </p>
        <BtnP onClick={() => go("about")}>Read My Full Story</BtnP>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <img loading="lazy" src={IMG.aboutDeployedCrew} alt="Deployed crew with E-3 AWACS and Canadian flag" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
        <div style={{ background: C.ink }}>
          <img loading="lazy" src={IMG.storyOcpSelfie} alt="In OCPs on deployment" style={{ width: "100%", height: 220, objectFit: "contain", objectPosition: "center", display: "block" }} />
        </div>
        <div>
          <img loading="lazy" src={IMG.aboutServiceBlues} alt="Service Dress blues at commissioning" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
        <div>
          <img loading="lazy" src={IMG.aboutPromotion} alt="Promotion ceremony — Always With Honor" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
      </div>
    </div>
  </Section>
);

const SocialProof = ({ go }) => (
  <Section>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <img src={IMG.closing4196} alt="Gregg Costin with happy clients at closing — Home Sweet Home" style={{ width: "65%", aspectRatio: "1600 / 1220", objectFit: "cover", display: "block" }} />
        <img src={IMG.closing4197} alt="Another great closing with Gregg Costin and clients" style={{ width: "65%", aspectRatio: "1600 / 1220", objectFit: "cover", display: "block" }} />
        <p style={{ color: C.mutedD, fontSize: 11, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>Closing Days — Serving Clients Across the Florida Panhandle</p>
      </div>
      <div>
        <Eyebrow>Results</Eyebrow>
        <H2>The mission doesn't end at the offer.</H2>
        <div style={{ marginTop: 24 }}>
          {[
            { text: "Gregg is hands-down the best Realtor we've ever worked with. He made the entire buying process feel effortless — always available, endlessly patient, and truly invested.", from: "USAF Veteran — Gulf Breeze" },
            { text: "As a young first time home buyer, I went in clueless. I got phenomenal guidance about VA loan benefits and the entire buying process. Gregg genuinely cares.", from: "First-Time Military Homebuyer — Pace" },
          ].map((r, i) => (
            <div key={i} style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 24, marginBottom: 16 }}>
              <div style={{ color: C.gold, fontSize: 16, marginBottom: 8 }}>★★★★★</div>
              <p style={{ color: C.text, fontSize: 14.5, lineHeight: 1.8, fontStyle: "italic", marginBottom: 10, fontWeight: 300 }}>"{r.text}"</p>
              <p style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>— {r.from}</p>
            </div>
          ))}
        </div>
        <BtnG onClick={() => go("reviews")}>Read All Reviews</BtnG>
      </div>
    </div>
  </Section>
);

const CtaBanner = ({ go }) => (
  <section style={{ position: "relative", padding: "100px 32px", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${IMG.familyAwacs})`, backgroundSize: "cover", backgroundPosition: "center center" }} />
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
          <a href="/faq.html" style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "12px 24px", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontFamily: SS }}>Full PCS FAQ →</a>
          <a href="/reviews.html" style={{ color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", padding: "12px 24px", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontFamily: SS }}>Client Reviews →</a>
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
            <img loading="lazy" src={IMG.logoStacked} alt="The Costin Team" style={{ height: 160, marginBottom: 16 }} />
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>Levin Rinke Realty<br />220 W. Garden St., Pensacola, FL 32502<br />Licensed in Florida & Alabama</p>
          </div>
          <div>
            <div style={{ color: C.gold, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: SS }}>Quick Links</div>
            {["pcs", "va-loan", "homestead", "neighborhoods", "reviews", "contact"].map(id => {
              const p = pages.find(x => x.id === id);
              return <button key={id} onClick={() => go(id)} style={footerLinkStyle}>{p.label}</button>;
            })}
            <a href="/faq.html" style={footerLinkStyle}>PCS FAQ</a>
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
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}><a href="mailto:Gregg.Costin@gmail.com" style={{ color: C.muted, textDecoration: "none" }}>Gregg.Costin@gmail.com</a><br />Instagram: <a href="https://www.instagram.com/greggcostinrealtor/" target="_blank" rel="noopener" style={{ color: C.muted, textDecoration: "none" }}>@greggcostinrealtor</a><br />Facebook: <a href="https://www.facebook.com/greggcostin/" target="_blank" rel="noopener" style={{ color: C.muted, textDecoration: "none" }}>@greggcostin</a><br /><span style={{ whiteSpace: "nowrap" }}>YouTube: <a href="https://www.youtube.com/@PensacolaMilitaryRealtor" target="_blank" rel="noopener" style={{ color: C.muted, textDecoration: "none" }}>@PensacolaMilitaryRealtor</a></span></p>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ color: C.mutedD, fontSize: 11 }}>© 2026 The Costin Team. All rights reserved. | <a href="https://www.pensacolamilitaryhousing.com" style={{ color: C.mutedD }}>PensacolaMilitaryHousing.com</a></p>
          <p style={{ color: C.mutedD, fontSize: 11 }}>Gregg Costin, Realtor® · MRP® · ABR® · SRS® · RENE® · FMS®</p>
        </div>
      </div>
    </footer>
  );
};

const AboutPage = ({ go }) => (
  <div>
    <section style={{ position: "relative", padding: "140px 32px 80px", background: C.ink }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "center" }}>
        <div>
          <Eyebrow>About Gregg Costin</Eyebrow>
          <h1 style={{ fontFamily: SF, fontWeight: 500, fontSize: "clamp(36px,4vw,56px)", lineHeight: 1.05, color: "#fff", margin: "0 0 24px" }}>
            From the flight deck to your <span style={{ color: C.gold, fontStyle: "italic" }}>front door.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: C.muted, fontWeight: 300, maxWidth: 540 }}>
            I completed a full USAF career — starting as a prior-enlisted Staff Sergeant (E-5) and retiring as a Captain (O-3) serving as a Combat Systems Officer on the E-3 AWACS. Along the way I completed 11 PCS moves and multiple combat deployments. That experience is the foundation of everything I bring to real estate.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          <img loading="lazy" src={IMG.navyNoTie} alt="Gregg Costin" style={{ flex: "1 1 auto", maxWidth: 400, height: 480, objectFit: "cover", objectPosition: "center top", display: "block" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8, marginBottom: 40 }}>
        <div style={{ gridColumn: "span 2" }}>
          <img loading="lazy" src={IMG.aboutAwacsFlightline} alt="E-3 AWACS on the flightline" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center", display: "block" }} />
          <p style={{ color: C.mutedD, fontSize: 11, marginTop: 6, letterSpacing: 1 }}>E-3 AWACS on the flightline</p>
        </div>
        <div><img loading="lazy" src={IMG.aboutFlightsuitAwacs} alt="In flightsuit with E-3 AWACS" style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutDeployedCrew} alt="Deployed crew" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center 40%", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutServiceBlues} alt="Service Dress blues" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center 20%", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutPromotion} alt="Promotion ceremony" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center 30%", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutAwacsFoggy} alt="AWACS on a foggy flightline" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutFlightlineOCPs} alt="On the flightline in OCPs" style={{ width: "100%", height: 220, objectFit: "cover", objectPosition: "center top", display: "block" }} /></div>
        <div><img loading="lazy" src={IMG.aboutCockpitTanker} alt="In cockpit with KC-135 tanker" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /></div>
        <div style={{ background: C.ink }}><img loading="lazy" src={IMG.aboutFlightsuitMom} alt="In flightsuit with mom" style={{ width: "100%", height: 220, objectFit: "contain", objectPosition: "center", display: "block" }} /></div>
      </div>
      <H3>My Story: From Global Strategy to Local Real Estate Excellence</H3>
      <Body>My journey into real estate didn't start with a lifelong passion for houses; it started with a vow.</Body>
      <Body>When I bought my very first home early in my career, I was completely burned by a horrible agent. The experience left such a deep mark on me that I made a promise right then and there: I would self-educate to the absolute highest level so I would never have to rely on another real estate agent again. As I bought and sold properties across the entire United States during every military PCS move, I mastered the process from the ground up. I have experienced firsthand what it's like to have a terrible agent, which means I know exactly what it takes to be an exceptional one.</Body>
      <Body>My promise to you as a client is simple: to be better than anyone else out there in the local market. I bring that same relentless drive and determination to your transaction so you can completely avoid the pitfalls and mistakes I once faced. I aspire to be a cut above anyone else you come in contact with, delivering the absolute best in customer service, market knowledge, expertise, and fierce negotiation skills.</Body>
      <H3>Forged by Military Discipline</H3>
      <Body>That standard of excellence is rooted deeply in my military background. Over the course of my career in the United States Air Force, I evolved from hands-on technical expertise to high-level strategic planning.</Body>
      <Body>I began at the tip of the spear in nuclear deterrence as a 2M0 cruise missile technician, ensuring the readiness of payloads on the B-52 Stratofortress. After earning a prestigious double B.S. and B.A. degree from the University of Tampa, I commissioned as an officer and took to the skies. As a Navigator and Combat Systems Officer (CSO) aboard the E-3 AWACS, I managed complex tactical routing and electronic warfare across multiple deployments to combat zones including Iraq, Afghanistan, and Syria, as well as strategic hubs across the Middle East and the Pacific.</Body>
      <Body>My career culminated in the senior echelons of military strategy as the Chief of Integrated Air and Missile Defense (IAMD) Plans for CENTCOM A5, where I architected theater-wide defense strategies to protect our forward-deployed forces.</Body>
      <H3>The Gregg Costin Team Promise</H3>
      <Body>Today, I combine the precision, strategic planning, and unwavering discipline of a military war planner with my hard-earned real estate expertise. When you work with me, you aren't just getting an agent — you are getting an aggressively educated advocate who will fight for your best interests every single step of the way.</Body>
    </Section>

    <Section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "center" }}>
        <div>
          <img loading="lazy" src={IMG.kidsCockpit} alt="Family in AWACS cockpit" style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
          <p style={{ color: C.mutedD, fontSize: 11, marginTop: 6, letterSpacing: 1 }}>Sharing the mission with the next generation</p>
        </div>
        <div>
          <Eyebrow>Family Man</Eyebrow>
          <H2>11 PCS moves. I get it.</H2>
          <Body>When I say I understand the stress of a PCS move, I mean it. My family and I have lived it — packing up, finding homes from overseas, navigating schools and neighborhoods sight-unseen. Now I channel that experience into making your transition as smooth as possible.</Body>
          <Body>I am the preferred real estate agent for VeteranPCS, Tier 1 Group, and the M.O.R.E. Network — three of the most respected military relocation organizations in the country. I'm also recognized as a Zillow Premier Agent in the top 5% of Pensacola-area Realtors with a perfect 5-star rating.</Body>
        </div>
      </div>
    </Section>

    <Section bg={C.panel}>
      <H2 align="center">Credentials & Recognition</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, marginTop: 40 }}>
        {[
          { title: "Military Relocation Professional (MRP®)", desc: "NAR certification for agents specializing in serving current and former military service members." },
          { title: "Florida Military Specialist (FMS®)", desc: "Florida Realtors (Florida Association of Realtors) certification for agents trained on Florida-specific military and veteran housing, VA loan, and PCS-relocation issues." },
          { title: "Accredited Buyer's Representative (ABR®)", desc: "NAR advanced buyer-representation training — negotiation, market analysis, and fiduciary advocacy." },
          { title: "Seller Representative Specialist (SRS®)", desc: "NAR premier seller-representation certification covering pricing, marketing, and listing strategy." },
          { title: "Real Estate Negotiation Expert (RENE®)", desc: "NAR certification for advanced offer and counter-offer negotiation techniques across all transaction types." },
          { title: "Forbes Global Properties · Rookie of the Year 2025", desc: "Recognized for outstanding transactions, sales volume, and market impact in first year." },
          { title: "Zillow Premier Agent · Top 5%", desc: "Perfect 5-star rating. Recognized among the top-performing agents in the Pensacola metro area." },
          { title: "Licensed FL + AL", desc: "Dual-licensed to serve military families across the Florida Panhandle and coastal Alabama markets." },
        ].map(c => (
          <div key={c.title} style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 28 }}>
            <h4 style={{ fontFamily: SF, color: C.gold, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{c.title}</h4>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
    <CtaBanner go={go} />
  </div>
);

const PCSPage = ({ go }) => (
  <PageWrapper>
    <PageHero title="PCS to Pensacola: The Complete Guide for Military Families (2026)" subtitle="Everything you need to know about buying a home, finding the right neighborhood, navigating VA loans, and settling your family into life on the Gulf Coast." breadcrumb="Home > PCS to Pensacola Guide" />
    <Content>
      <InfoBox title="About This Guide">Written by a retired Air Force aviator who completed 11 PCS moves and has helped hundreds of military families make this exact transition. Updated quarterly with current market data.</InfoBox>
      <H2>Military Installations in the Pensacola Area</H2>
      <P>The greater Pensacola area is home to several major military installations, each serving different branches and mission sets. Understanding which base you're reporting to is the first step in narrowing your housing search.</P>
      <ComparisonTable
        headers={["Installation", "Branch", "Primary Mission", "Nearest Neighborhoods"]}
        rows={[
          ["NAS Pensacola", "Navy/Marines/Air Force", "Aviation training (NFO + USAF CSO schoolhouse), NATTC, Blue Angels", "East Pensacola Heights, Gulf Breeze, Perdido Key"],
          ["Corry Station", "Navy", "Information Warfare, cryptology, cyber, intel, IT training (CIWT)", "Pensacola proper, West Pensacola, Cantonment"],
          ["Saufley Field", "Navy", "NIOC Pensacola, CIWT detachment, NETSAFA, DLI linguist training (tenant of NAS Pensacola)", "Bellview/Myrtle Grove, Cantonment, Ferry Pass"],
          ["NAS Whiting Field", "Navy/Marines/Coast Guard", "Primary fixed-wing (T-6B) + all USN/USMC/USCG rotary-wing training (TRAWING 5)", "Milton, Pace, East Milton"],
          ["Hurlburt Field", "Air Force", "AFSOC, 1st SOW (AC-130, MC-130, CV-22)", "Mary Esther, Navarre, FWB"],
          ["Eglin AFB", "Air Force/Army", "33rd FW (F-35A FTU), 96th TW, 53rd Wing, AFRL, 7th SFG", "Niceville, Crestview, FWB, Valparaiso, Bluewater Bay"],
          ["Duke Field", "Air Force Reserve", "919th Special Operations Wing (MC-130J, MQ-9)", "Crestview, Laurel Hill, Niceville"],
        ]}
      />
      <H2>Pensacola Real Estate Market Snapshot</H2>
      <P>As of early 2026, the Pensacola metro area market looks like this: median home price around $305,000, median 71 days on market, approximately 2,300+ active listings, and a 97% sale-to-list ratio. This is a balanced market — not the frenzy of 2021-2022, but not a buyer's paradise either. There is room to negotiate, especially on homes that have been sitting, but well-priced properties in desirable neighborhoods still move quickly.</P>
      <P>Prices vary dramatically by neighborhood. Northeast Pensacola runs around $255,000 median, while Downtown Pensacola is closer to $696,000 and Perdido Key averages above $580,000. Your BAH and household budget will determine which neighborhoods are realistic targets.</P>
      <H2>Neighborhood Comparison Guide</H2>
      <ComparisonTable
        headers={["Neighborhood", "Median Price", "Commute to NAS", "Schools", "Lifestyle"]}
        rows={[
          ["Gulf Breeze", "$380-450K", "15-20 min", "A-rated (SRSD)", "Waterfront, family-friendly, quiet"],
          ["Pace", "$280-350K", "30-35 min", "Strong (SRSD)", "Suburban, new construction, affordable"],
          ["East Pensacola", "$240-320K", "10-15 min", "Mixed (ECSD)", "Close to base, older homes, value"],
          ["Perdido Key", "$450-700K+", "20-25 min", "A-rated", "Beach, investment potential, luxury"],
          ["Cantonment", "$250-330K", "20-25 min", "Good (ECSD)", "Rural feel, acreage available"],
          ["Navarre", "$350-450K", "40-50 min to NAS", "A-rated (SRSD)", "Beach community, Hurlburt/Eglin close"],
          ["Milton", "$260-340K", "25-30 min", "Good (SRSD)", "Small town, Whiting Field close"],
          ["Pensacola Downtown", "$350-600K+", "5-10 min", "Varies", "Walkable, historic, restaurants"],
        ]}
      />
      <H2>Your PCS Timeline Checklist</H2>
      <H3>90 Days Out</H3>
      <ul style={{ paddingLeft: 20 }}>
        <Li>Connect with a military relocation Realtor (call 850-266-5005)</Li>
        <Li>Get pre-approved with a VA-experienced lender</Li>
        <Li>Identify your must-haves vs nice-to-haves for housing</Li>
        <Li>Research school districts if you have children</Li>
        <Li>Start virtual home tours and neighborhood research</Li>
      </ul>
      <H3>60 Days Out</H3>
      <ul style={{ paddingLeft: 20 }}>
        <Li>Narrow to 2-3 target neighborhoods</Li>
        <Li>Set up automated MLS alerts for new listings in your criteria</Li>
        <Li>Begin making offers on strong candidates (sight-unseen if necessary)</Li>
        <Li>Coordinate with your current base housing office on move-out timeline</Li>
      </ul>
      <H3>30 Days Out</H3>
      <ul style={{ paddingLeft: 20 }}>
        <Li>Finalize under-contract property and complete inspections</Li>
        <Li>Order VA appraisal</Li>
        <Li>Coordinate closing date with your report date</Li>
        <Li>Arrange temporary housing if needed (I maintain a list of military-friendly short-term rentals)</Li>
        <Li>File for Florida homestead exemption after closing</Li>
      </ul>
      <H2>VA Loan Basics for Pensacola</H2>
      <P>The VA loan is the single most powerful financial tool available to military homebuyers. Zero down payment, no private mortgage insurance, competitive interest rates, and more flexible underwriting than conventional loans. In Pensacola's market, where the median home is around $305,000, a VA loan means you can buy a home with essentially just closing costs out of pocket — and even those can often be negotiated as seller concessions.</P>
      <P>Key Pensacola-specific VA considerations: Florida requires a Wood Destroying Organism (WDO/termite) inspection on VA purchases. Flood zone determination matters — parts of Pensacola, especially waterfront areas, fall in flood zones that require separate flood insurance. And VA appraisals in this market have been coming in at or near purchase price, which means fewer appraisal gap issues than in overheated markets.</P>
      <button onClick={() => go("va-loan")} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Read the Complete VA Loan Guide →</button>
      <H2>2026 BAH Rates for Pensacola (MHA FL064)</H2>
      <P>These are the 2026 Basic Allowance for Housing monthly rates for service members assigned to NAS Pensacola, NTTC Corry Station, and NAS Whiting Field — Military Housing Area <strong style={{ color: "#fff" }}>FL064</strong>. The "With Dependents" column applies to any service member with authorized dependents (spouse, children, or qualifying family members); "Without Dependents" is the single or unaccompanied rate. Prior-enlisted commissioned officer rates (O-1E, O-2E, O-3E) appear at the top of the officer table. Always verify your exact rate at the official DoD BAH calculator before signing an offer or lease.</P>
      <BAHTable title="Enlisted (E-1 through E-9)" rows={[["E-1 through E-4", BAH_DATA.FL064.enlisted[0][1], BAH_DATA.FL064.enlisted[0][2]], ...BAH_DATA.FL064.enlisted.filter(([g]) => !["E-1","E-2","E-3","E-4"].includes(g))]} />
      <BAHTable title="Warrant Officer (W-1 through W-5)" rows={BAH_DATA.FL064.warrant} />
      <BAHTable title="Officer (O-1 through O-6, including Prior-Enlisted O-1E, O-2E, O-3E)" rows={BAH_DATA.FL064.officer.filter(([g]) => g !== "O-7")} />
      <P style={{ fontSize: 14, color: WARM_GRAY, marginTop: 12 }}><em>Source: DoD 2026 BAH tables for MHA FL064 ({BAH_DATA.FL064.yoyChange}). E-1 through E-4 share a single "junior enlisted" rate by DoD convention, which is why they're collapsed into one row above. Fort Walton Beach (Eglin AFB, Hurlburt Field, Duke Field) falls under MHA FL023 — different rates. For FL023 or any other MHA, use the <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener" style={{ color: GOLD }}>official DoD BAH calculator</a>.</em></P>
      <button onClick={() => go("calculator")} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Run Your BAH Through the Mortgage Calculator →</button>
      <H2>Florida Benefits for Military Families</H2>
      <ul style={{ paddingLeft: 20 }}>
        <Li><strong style={{ color: "#fff" }}>No state income tax.</strong> Your military pay and any additional income are not subject to state income tax in Florida.</Li>
        <Li><strong style={{ color: "#fff" }}>Homestead exemption.</strong> Up to $50,000 off your assessed value for property tax purposes, plus additional military exemptions for disabled veterans.</Li>
        <Li><strong style={{ color: "#fff" }}>Save Our Homes portability.</strong> If you PCS within Florida, you can transfer your accrued Save Our Homes benefit to a new property.</Li>
        <Li><strong style={{ color: "#fff" }}>Vehicle registration.</strong> Active duty military stationed in Florida can register vehicles with reduced fees.</Li>
        <Li><strong style={{ color: "#fff" }}>In-state tuition.</strong> Military families qualify for in-state tuition at Florida's public universities and colleges.</Li>
      </ul>
      <button onClick={() => go("homestead")} style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}44`, color: GOLD, padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 8 }}>Read the Homestead Exemption Guide →</button>
      <H2>Why Work With a Military Relocation Specialist?</H2>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "start", marginTop: 16 }}>
        <img src={IMG.grayNoTie} alt="Gregg Costin" style={{ width: "100%", borderRadius: 10, objectFit: "cover", aspectRatio: "3/4", border: `2px solid ${GOLD}22` }} />
        <div>
          <P>Not every Realtor understands PCS timelines. Not every Realtor knows how to structure a VA offer that wins. Not every Realtor has sat in the seat you're sitting in — staring at orders to a new base, trying to figure out where to live, how to finance it, and how to make it all work on a military timeline.</P>
          <P>I have. Eleven times. And now I help military families do the same thing I had to figure out the hard way. With better information, better strategy, and better results.</P>
        </div>
      </div>
      <H2>Frequently Asked Questions</H2>
      <FAQ q="How far in advance should I start working with a Realtor before my PCS?" a="Ideally 90 days out, but I've helped families close in as few as 21 days when the timeline demands it. The earlier you start, the more options you have — but late starters are welcome. I'll make it work." />
      <FAQ q="Can I buy a home sight-unseen during a PCS?" a="Yes, and it's more common than you'd think. I provide detailed video walkthroughs, drone footage, and neighborhood context via video call. I've closed dozens of sight-unseen purchases for PCSing families. The key is having an agent you trust to be your eyes and ears." />
      <FAQ q="What's the average commute from Gulf Breeze to NAS Pensacola?" a="15-20 minutes via the Pensacola Bay Bridge (3-Mile Bridge). During morning rush it can push toward 25 minutes, but it's a scenic drive and the school quality in Gulf Breeze (Santa Rosa School District) makes it worth it for most families." />
      <FAQ q="Is BAH enough to cover a mortgage in Pensacola?" a="For most ranks E-5 and above, yes. An E-6 with dependents receives approximately $1,950/month BAH for the Pensacola area, which comfortably covers a mortgage on a $280-320K home. O-3 with dependents receives approximately $2,250/month, opening up homes in the $350-400K range. I can run exact numbers based on your rank and situation." />
      <FAQ q="Should I rent first or buy immediately?" a="If you know you'll be in Pensacola for 3+ years, buying typically makes more financial sense — especially with a VA loan at zero down. If your assignment is less than 2 years, renting may be smarter unless you plan to keep the property as a rental investment. I can help you model both scenarios." />
      <FAQ q="Do I need a Realtor if I'm looking at new construction?" a="Absolutely. Builder sales reps work for the builder, not you. Having your own representation costs you nothing (the builder pays the commission) and ensures someone is advocating for your interests on inspections, upgrades, and contract terms." />
      <InfoBox title="Ready to Start?">Call or text me at (850) 266-5005, or send me a message through the contact page. I respond to every inquiry within 2 hours during business hours. Let's talk about your PCS and find you the right home.</InfoBox>
    </Content>
  </PageWrapper>
);

const VALoanPage = ({ go }) => (
  <PageWrapper>
    <PageHero title="VA Loan Guide for Pensacola Homebuyers" subtitle="Zero down payment. No PMI. Competitive rates. Here's how to use your earned benefit to buy a home on the Gulf Coast." breadcrumb="Home > VA Loan Guide" />
    <Content>
      <P>The VA home loan is the most powerful mortgage product available to American military families. If you're an active duty service member, veteran, National Guard or Reserve member, or surviving spouse, you've likely earned access to this benefit. Here's how it works in the Pensacola market.</P>
      <H2>Who Qualifies for a VA Loan?</H2>
      <ul style={{ paddingLeft: 20 }}>
        <Li>Active duty service members with 90+ continuous days of service</Li>
        <Li>Veterans meeting length-of-service requirements (generally 90 days wartime, 181 days peacetime)</Li>
        <Li>National Guard/Reserve members with 6+ years of service or 90 days of active duty under Title 10</Li>
        <Li>Surviving spouses of service members who died in the line of duty or from a service-connected disability</Li>
      </ul>
      <H2>VA Loan Benefits vs Conventional and FHA</H2>
      <ComparisonTable
        headers={["Feature", "VA Loan", "Conventional", "FHA"]}
        rows={[
          ["Down Payment", "$0", "3-20%", "3.5%"],
          ["PMI/MIP", "None", "Required <20% down", "Required (life of loan)"],
          ["Interest Rates", "Typically lowest", "Market rate", "Moderate"],
          ["Credit Score Min", "No VA minimum (lender overlays apply, typically 580-620)", "620-680+", "580+"],
          ["Funding Fee", "0.5-3.3% (waived for disabled vets)", "None", "1.75% upfront + annual"],
          ["Seller Concessions", "4% of reasonable value (see below)", "3-6% depending on down payment", "Up to 6%"],
          ["Assumable", "Yes", "No", "Yes"],
        ]}
      />
      <H2>Seller Concessions vs. Seller-Paid Closing Costs: What the VA Handbook Actually Says</H2>
      <div style={{ background: "#1a2a1a", border: "1px solid #2a4a2a", borderRadius: 12, padding: 28, marginTop: 16, marginBottom: 24 }}>
        <div style={{ color: "#6adf6a", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.5 }}>VA Pamphlet 26-7, Chapter 8, Topic 5 — Direct Guidance</div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.9, marginBottom: 16 }}>Most agents and even some lenders incorrectly apply a blanket 4% cap to everything the seller pays. <strong style={{ color: "#fff" }}>That is a lender overlay, not a VA rule.</strong> The VA Handbook draws a clear distinction between two separate categories:</p>
        <div style={{ background: "#0d1a0d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ color: GOLD, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Category 1: Seller-Paid Closing Costs (NO CAP)</div>
          <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.8 }}>Per VA Pamphlet 26-7 Chapter 8: <em style={{ color: "#ddd" }}>Payment of the buyer's closing costs by the seller is not a seller concession.</em> The VA does not limit a seller's payment of the buyer's normal, reasonable, and customary closing costs. These do <strong style={{ color: "#fff" }}>not</strong> count against the 4% cap.</p>
        </div>
        <div style={{ background: "#0d1a0d", borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ color: GOLD, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Category 2: Seller Concessions (Capped at 4% of Reasonable Value)</div>
          <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.8 }}>The 4% cap applies to: VA funding fee paid by seller, prepaid taxes/insurance, gifts, discount points, interest rate buydowns, and payoff of buyer's credit balances.</p>
        </div>
        <div style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}33`, borderRadius: 8, padding: 16 }}>
          <p style={{ color: GOLD, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>What This Means in Practice</p>
          <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8 }}>On a $350,000 Pensacola purchase, 4% = $14,000 in allowable concessions. If the seller also agrees to pay $7,000 in normal closing costs, that's $21,000 in total seller contributions with no VA rule violation. <strong style={{ color: "#fff" }}>I work with lenders who follow VA guidelines, not restrictive overlays.</strong></p>
        </div>
      </div>
      <H2>VA Funding Fee Breakdown</H2>
      <ComparisonTable
        headers={["Usage", "Down Payment", "Regular Military", "Reserves/Guard"]}
        rows={[
          ["First Use", "0% down", "2.15%", "2.40%"],
          ["First Use", "5%+ down", "1.50%", "1.75%"],
          ["First Use", "10%+ down", "1.25%", "1.50%"],
          ["Subsequent Use", "0% down", "3.30%", "3.30%"],
          ["Subsequent Use", "5%+ down", "1.50%", "1.75%"],
        ]}
      />
      <InfoBox title="Funding Fee Exemption">Veterans with a VA-rated service-connected disability of 10% or higher are exempt from the funding fee entirely. Purple Heart recipients who are still on active duty are also exempt. This can save you $6,000-10,000+ on a Pensacola purchase.</InfoBox>
      <H2>What Can You Afford on BAH?</H2>
      <ComparisonTable
        headers={["Rank (w/ dependents)", "Pensacola BAH (approx)", "Estimated Max Purchase Price", "Target Neighborhoods"]}
        rows={[
          ["E-5", "$1,725/mo", "$250-280K", "Pace, Cantonment, NE Pensacola"],
          ["E-6", "$1,950/mo", "$280-320K", "Pace, Milton, East Pensacola"],
          ["E-7", "$2,100/mo", "$310-360K", "Gulf Breeze, Pace, Navarre"],
          ["O-1/O-2", "$1,850/mo", "$270-310K", "Pace, East Pensacola, Milton"],
          ["O-3", "$2,250/mo", "$340-400K", "Gulf Breeze, Navarre, Perdido"],
          ["O-4", "$2,500/mo", "$380-450K", "Gulf Breeze, Pensacola, Perdido"],
        ]}
      />
      <div style={{ background: `${GOLD}12`, border: `2px solid ${GOLD}55`, borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>⚠️</span>
          <span style={{ color: GOLD, fontSize: 16, fontWeight: 800, letterSpacing: .5 }}>IMPORTANT: BAH IS A FOUNDATION, NOT A CEILING</span>
        </div>
        <p style={{ color: "#ddd", fontSize: 15, lineHeight: 1.85 }}>The purchase price estimates above assume your BAH covers 100% of your PITI payment. In reality, many military families invest $200-500/month above their BAH to secure a home in a better school district, safer neighborhood, or closer to base. <strong style={{ color: "#fff" }}>I model specific scenarios for every buyer</strong> — call me at (850) 266-5005 and let's run the numbers together.</p>
      </div>
      <H2>Frequently Asked Questions</H2>
      <FAQ q="Do sellers dislike VA loan offers?" a="This is one of the biggest myths in real estate. In Pensacola's current market, sellers are happy to receive any qualified offer. VA loans close at the same rate as conventional loans. A strong VA offer with clean terms, realistic price, and proof of pre-approval is competitive with any other offer type. I structure VA offers to win." />
      <FAQ q="How long does a VA loan take to close?" a="Typically 30-45 days from contract to closing, similar to conventional. The VA appraisal usually comes back within 10-14 business days. I coordinate closely with your lender to ensure nothing falls through the cracks." />
      <FAQ q="Can I use a VA loan for a condo in Pensacola?" a="Yes, but the condo complex must be on the VA's approved list or go through the approval process. Many popular Pensacola-area condo complexes are already VA-approved, especially on Perdido Key and in Gulf Breeze. I can check approval status before we waste time on a property that won't qualify." />
      <InfoBox title="Next Step">Get pre-approved with a VA-experienced lender before you start your home search. I work with lenders who specialize in military transactions and understand the nuances of VA financing. Call me at (850) 266-5005 and I'll connect you.</InfoBox>
    </Content>
  </PageWrapper>
);

const HomesteadPage = ({ go }) => (
  <PageWrapper>
    <PageHero title="Florida Homestead Exemption Guide for Military Families" subtitle="How to save thousands on property taxes and protect your home's assessed value — including military-specific exemptions most agents don't know about." breadcrumb="Home > Florida Homestead Exemption" />
    <Content>
      <P>Florida's homestead exemption is one of the most valuable financial benefits available to homeowners in the state, and military families often have access to additional exemptions that can reduce your property tax bill even further.</P>
      <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}33`, borderRadius: 10, padding: 24, marginTop: 16, marginBottom: 24 }}>
        <div style={{ color: GOLD, fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Key Benefits for Military Homeowners — At a Glance</div>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, marginBottom: 6 }}><strong style={{ color: "#fff" }}>$50,000 standard homestead exemption</strong> — saves $800-1,200/year in property taxes</li>
          <li style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, marginBottom: 6 }}><strong style={{ color: "#fff" }}>100% disabled veteran exemption</strong> — zero property taxes ($4,000-8,000+/year savings)</li>
          <li style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, marginBottom: 6 }}><strong style={{ color: "#fff" }}>Save Our Homes portability</strong> — transfer your accrued tax benefit when PCSing within FL</li>
          <li style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, marginBottom: 6 }}><strong style={{ color: "#fff" }}>Deployed service member exemption</strong> — additional tax reduction based on deployment days</li>
        </ul>
      </div>
      <H2>Standard Homestead Exemption ($50,000)</H2>
      <P>Every Florida homeowner who occupies their property as a primary residence is entitled to a homestead exemption that removes up to $50,000 from the assessed value of the home for property tax purposes. At Pensacola's current millage rate, this saves the average homeowner approximately $800-1,200 per year.</P>
      <H2>Military-Specific Exemptions</H2>
      <H3>Disabled Veteran Exemptions</H3>
      <ul style={{ paddingLeft: 20 }}>
        <Li><strong style={{ color: "#fff" }}>100% disability (or total and permanent):</strong> Full exemption from all property taxes on your homestead. Potentially saving $4,000-8,000+ per year in Pensacola.</Li>
        <Li><strong style={{ color: "#fff" }}>Partial disability (10-99%):</strong> Additional $5,000 exemption beyond the standard homestead for veterans 65+ with a combat-related disability.</Li>
        <Li><strong style={{ color: "#fff" }}>Surviving spouse:</strong> The surviving spouse of a veteran who died from service-connected causes may be entitled to a full exemption.</Li>
      </ul>
      <H2>Save Our Homes (SOH) Cap</H2>
      <P>Once you establish homestead, the Save Our Homes amendment caps annual increases in your home's assessed value at 3% or the Consumer Price Index, whichever is lower — regardless of how much your property actually appreciates. In a market like Pensacola that has seen significant appreciation since 2020, this cap can create a growing gap between your assessed value and your actual market value.</P>
      <H2>Portability: Transferring Your SOH Benefit</H2>
      <P>If you PCS within Florida, you can transfer your accumulated SOH benefit to your new property. This portability benefit can save you significant money on property taxes at your new home. The portability benefit is the difference between your assessed value and your market value, up to $500,000.</P>
      <InfoBox title="Important Portability Rules">You must establish a new homestead within 3 years of abandoning the previous one. You must apply for portability when you apply for homestead at the new property. The transfer is not automatic — you must file the proper forms with the county property appraiser.</InfoBox>
      <H2>How to File for Homestead</H2>
      <ul style={{ paddingLeft: 20 }}>
        <Li>File with the Escambia County Property Appraiser (Pensacola) or Santa Rosa County Property Appraiser (Gulf Breeze, Pace, Milton, Navarre) depending on your property location.</Li>
        <Li>Filing deadline: March 1 of the year following your purchase. If you close in November 2026, you must file by March 1, 2027.</Li>
        <Li>Required documents: recorded deed, Florida driver's license or ID with property address, vehicle registration showing property address, and Social Security numbers for all applicants.</Li>
        <Li>Military members: you may use your Leave and Earnings Statement as proof of Florida residency if your driver's license is from another state.</Li>
      </ul>
      <H2>Frequently Asked Questions</H2>
      <FAQ q="Can I have homestead exemption if I'm active duty but my home state of record is not Florida?" a="Yes. Homestead exemption is based on where you live, not your state of legal residence. If you occupy the home as your primary residence, you can file for homestead regardless of your state of record." />
      <FAQ q="What happens to my homestead if I PCS and keep the home as a rental?" a="You lose homestead exemption when you stop occupying the home as your primary residence. Your assessed value will reset to market value, and your property taxes will increase. Factor this into your rental property cash flow analysis." />
      <FAQ q="How much does homestead actually save in Pensacola?" a="On a $325,000 home in Escambia County, the standard $50,000 exemption saves approximately $900-1,100 per year. A 100% disabled veteran pays zero property tax — a savings of $4,500-6,000+ per year on the same home. Over a 5-year assignment, that's $22,500-30,000." />
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <button onClick={() => go("contact")} style={{ background: GOLD, color: BLACK, border: "none", padding: "16px 36px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: "pointer", textTransform: "uppercase", letterSpacing: .5 }}>Questions? Call 850-266-5005</button>
      </div>
    </Content>
  </PageWrapper>
);

const BAH_DATA = {
  FL064: {
    mhaCode: "FL064", mhaName: "Pensacola, FL", yoyChange: "+0.5% from 2025",
    installations: "NAS Pensacola • NTTC Corry Station • NAS Whiting Field",
    enlisted: [
      ["E-1",1794,1521],["E-2",1794,1521],["E-3",1794,1521],["E-4",1794,1521],
      ["E-5",1863,1644],["E-6",2235,1722],["E-7",2256,1791],["E-8",2265,1941],["E-9",2304,2046],
    ],
    warrant: [
      ["W-1",2253,1782],["W-2",2262,1938],["W-3",2274,2061],["W-4",2325,2229],["W-5",2427,2241],
    ],
    officer: [
      ["O-1E",2259,1860],["O-2E",2268,2022],["O-3E",2340,2226],
      ["O-1",1914,1719],["O-2",2232,1842],["O-3",2271,2097],
      ["O-4",2457,2232],["O-5",2610,2244],["O-6",2631,2247],["O-7",2646,2259],
    ],
  },
  FL023: {
    mhaCode: "FL023", mhaName: "Fort Walton Beach, FL", yoyChange: "+0.4% from 2025",
    installations: "Eglin AFB • Hurlburt Field",
    enlisted: [
      ["E-1",2340,2007],["E-2",2340,2007],["E-3",2340,2007],["E-4",2340,2007],
      ["E-5",2433,2157],["E-6",2526,2250],["E-7",2841,2340],["E-8",3189,2457],["E-9",3447,2586],
    ],
    warrant: [
      ["W-1",2544,2322],["W-2",2985,2454],["W-3",3414,2589],["W-4",3456,2604],["W-5",3516,2922],
    ],
    officer: [
      ["O-1E",2910,2430],["O-2E",3351,2514],["O-3E",3468,2601],
      ["O-1",2451,2244],["O-2",2523,2406],["O-3",3399,2592],
      ["O-4",3528,2865],["O-5",3612,3066],["O-6",3642,3393],["O-7",3669,3453],
    ],
  },
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
      subtitle: "The Cradle of Naval Aviation — where student pilots, instructor pilots, NATTC students, and support personnel find their Gulf Coast home.",
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
      bahNote: "Student aviators on short 12-18 month pipelines should weigh a rent-vs-buy decision carefully — instructor pilots and permanent party typically benefit from buying.",
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
      subtitle: "Home of the Center for Information Dominance — training the Navy's information warfare, intelligence, and IT professionals.",
      mission: "Naval Technical Training Center Corry Station is located in West Pensacola, just a few miles from NAS Pensacola. It trains sailors and Marines in information warfare, cryptology, intelligence, and information technology.",
      neighborhoods: [
        ["West Pensacola","$220-310K","5-10 min","Good","Closest to base, affordable, improving area"],
        ["Warrington","$180-260K","5-8 min","Varies","Most affordable option, older housing stock"],
        ["Pensacola Proper","$280-400K","10-15 min","Varies","More amenities, restaurants, nightlife"],
        ["Pace","$270-340K","30-35 min","Strong (SRSD)","Better schools, longer commute, new construction"],
        ["Gulf Breeze","$380-480K","25-30 min","A-rated","Premium schools, family favorite"],
      ],
      bahMha: "FL064", bahLabel: "NTTC Corry Station", bahZip: "32511",
      bahNote: "Corry Station sits within the FL064 Pensacola MHA, so rates match NAS Pensacola and Whiting Field. Pipeline length is your biggest decision lever — 3-6 month C-schools favor renting, 18+ month instructor tours favor buying.",
      tips: "Corry Station students are often on shorter pipelines (3-9 months), making renting the default choice. For permanent party staff and instructors with multi-year assignments, buying in West Pensacola or Pensacola proper makes sense."
    },
    eglin: {
      title: "Eglin AFB Housing Guide",
      subtitle: "The largest Air Force installation by area — home to the 96th Test Wing, 33rd Fighter Wing, and 7th Special Forces Group.",
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
      bahNote: "Eglin falls under the FL023 Fort Walton Beach MHA — meaningfully higher rates than Pensacola due to the Emerald Coast beach premium.",
      tips: "Niceville (especially Bluewater Bay) is the gold standard for Eglin families with kids — top schools, safe neighborhoods, and a 10-minute commute. Crestview is where budget-conscious buyers go, with significantly lower prices and strong new construction inventory."
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
      bahNote: "Hurlburt is FL023 Fort Walton Beach MHA — same rates as Eglin AFB.",
      tips: "Navarre is the overwhelming favorite for Hurlburt families — it combines beautiful beaches, excellent Santa Rosa School District schools, a family-friendly community, and a reasonable 15-20 minute commute. Mary Esther is the closest option and most affordable."
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
        <InfoBox title="BAH as a Foundation, Not a Ceiling">BAH was designed to cover roughly 95% of median local housing costs for your rank and dependency status — it is NOT designed to cover 100% of your PITI. {d.bahNote}</InfoBox>
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

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 14, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  return (
    <div style={{ marginTop: 72, marginBottom: 32 }}>
      <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 48 }}>
        <Eyebrow>Amortization & Payoff Analyzer</Eyebrow>
        <H2>Run the Numbers on Extra Payments</H2>
        <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginBottom: 32 }}>
          Every extra dollar toward principal attacks interest at the front of the loan where interest is highest. Model different payment frequencies and extra-payment strategies below — this uses the <strong style={{ color: C.gold }}>same loan amount, interest rate, and term</strong> from your calculator above. Everything updates live.
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
            <input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Added to every monthly principal payment.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Annual Lump Sum ($)</label>
            <input type="number" value={extraAnnual} onChange={e => setExtraAnnual(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>E.g. tax refund or bonus applied once per year.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Custom Extra Payment ($)</label>
            <input type="number" value={customAmt} onChange={e => setCustomAmt(e.target.value)} style={inputStyle} min="0" placeholder="0" />
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>Frequency</label>
            <select value={customFreq} onChange={e => setCustomFreq(e.target.value)} style={inputStyle}>
              <option value="onetime">One-Time</option>
              <option value="weekly">Every Week</option>
              <option value="monthly">Every Month</option>
              <option value="quarterly">Every Quarter</option>
              <option value="annual">Every Year</option>
            </select>
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>{customFreq === "onetime" ? "Applied at month #" : "Starting at month #"}</label>
            <input type="number" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} min="1" />
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
            <strong>How to read this:</strong> "Effective Cost" is the total interest you pay divided by the amount you borrowed — a more honest measure of mortgage cost than the nominal rate. Annual payments in bi-weekly/weekly mode already account for the extra month's payment you make per year.
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
  const [a, setA] = useState({ label: "Loan A — VA, 0% down", type: "va", price: 375000, downPct: 0, rate: 6.25, years: 30, extra: 0, firstUse: true, vaExempt: false });
  const [b, setB] = useState({ label: "Loan B — FHA, 3.5% down", type: "fha", price: 375000, downPct: 3.5, rate: 6.5, years: 30, extra: 0, firstUse: true, vaExempt: false });
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

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 14, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  const typeDesc = {
    va: "VA loan — zero down allowed, no monthly PMI, VA funding fee financed into loan (unless exempt).",
    fha: "FHA loan — 3.5% min down (580+ FICO), 1.75% upfront MIP + 0.55% annual MIP for life of loan (<10% down).",
    conv: "Conventional — typically 3-5% down, 0.6% annual PMI if LTV > 80% (auto-removed at 78% LTV).",
  };

  const LoanForm = ({ loan, setLoan, color }) => (
    <div style={{ ...card, borderColor: color, borderWidth: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: color, display: "inline-block", flexShrink: 0 }} />
        <input value={loan.label} onChange={e => setLoan({ ...loan, label: e.target.value })} style={{ ...inputStyle, fontWeight: 700, fontSize: 14, padding: "8px 10px" }} />
      </div>
      <label style={labelStyle}>Loan Product</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["va","VA"],["fha","FHA"],["conv","Conventional"]].map(([id,lbl]) => (
          <button key={id} onClick={() => {
            const defaultRate = { va: 6.25, fha: 6.5, conv: 6.75 }[id];
            const defaultDown = { va: 0, fha: 3.5, conv: 5 }[id];
            setLoan({ ...loan, type: id, rate: defaultRate, downPct: defaultDown });
          }} style={{ flex: 1, padding: "8px 10px", background: loan.type === id ? color : "transparent", color: loan.type === id ? C.ink : C.muted, border: `1px solid ${loan.type === id ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</button>
        ))}
      </div>
      <p style={{ color: C.mutedD, fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>{typeDesc[loan.type]}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Home Price ($)</label><input type="number" value={loan.price} onChange={e => setLoan({ ...loan, price: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Rate (%)</label><input type="number" step="0.125" value={loan.rate} onChange={e => setLoan({ ...loan, rate: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Term (Years)</label><input type="number" value={loan.years} onChange={e => setLoan({ ...loan, years: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Extra Monthly ($)</label><input type="number" value={loan.extra} onChange={e => setLoan({ ...loan, extra: e.target.value })} style={inputStyle} /></div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Down Payment</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {(loan.type === "va" ? [0, 5, 10] : loan.type === "fha" ? [3.5, 5, 10, 20] : [5, 10, 20]).map(dp => (
            <button key={dp} onClick={() => setLoan({ ...loan, downPct: dp })} style={{ flex: "1 1 60px", padding: "6px 8px", background: Number(loan.downPct) === dp ? color : "transparent", color: Number(loan.downPct) === dp ? C.ink : C.muted, border: `1px solid ${Number(loan.downPct) === dp ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1 }}>{dp}%</button>
          ))}
          <input type="number" step="0.1" value={loan.downPct} onChange={e => setLoan({ ...loan, downPct: e.target.value })} style={{ ...inputStyle, flex: "1 1 70px", maxWidth: 90, padding: "6px 8px", fontSize: 12 }} placeholder="Custom" />
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
          <div style={{ marginTop: 6, color: C.muted, fontSize: 11 }}>No monthly PMI — VA loans never require mortgage insurance.</div>
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
          <div>{Number(loan.downPct) >= 20 ? "20%+ down clears the 80% LTV threshold — no monthly PMI ever." : "Conventional PMI is required while LTV > 80%. It auto-removes at 78% LTV of the original home value (Homeowners Protection Act of 1998) — approximately when you've paid the loan down to 78% of the purchase price."}</div>
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
          Pit two scenarios against each other — different loan amounts, rates, terms, or extra-payment strategies — and see which one saves you more in monthly cash flow, lifetime interest, and effective interest-rate cost.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 24 }}>
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
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Effective Cost — A</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioA.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Effective Cost — B</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioB.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Balance Over Time — Both Loans</div>
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
                ["Loan Product", { va: "VA", fha: "FHA", conv: "Conventional" }[a.type], { va: "VA", fha: "FHA", conv: "Conventional" }[b.type], a.type === b.type ? "—" : "different"],
                ["Home Price", fmt(a.price), fmt(b.price), fmt(Math.abs((Number(a.price)||0) - (Number(b.price)||0)))],
                ["Down Payment", fmt(rA.downPayment) + " (" + a.downPct + "%)", fmt(rB.downPayment) + " (" + b.downPct + "%)", fmt(Math.abs(rA.downPayment - rB.downPayment))],
                ["Upfront Fee/MIP", rA.upfrontFee > 0 ? `${fmt(rA.upfrontFee)} (${rA.upfrontLabel})` : "—", rB.upfrontFee > 0 ? `${fmt(rB.upfrontFee)} (${rB.upfrontLabel})` : "—", fmt(Math.abs(rA.upfrontFee - rB.upfrontFee))],
                ["Financed Total (base + fee)", fmt(rA.totalLoan), fmt(rB.totalLoan), fmt(Math.abs(rA.totalLoan - rB.totalLoan))],
                ["Nominal Rate", a.rate + "%", b.rate + "%", Math.abs(Number(a.rate) - Number(b.rate)).toFixed(2) + "%"],
                ["Term", a.years + " yr", b.years + " yr", Math.abs(Number(a.years) - Number(b.years)) + " yr"],
                ["Monthly P&I", fmt(rA.basePmt), fmt(rB.basePmt), fmt(Math.abs(rA.basePmt - rB.basePmt))],
                ["Monthly PMI/MIP", rA.miMonthly > 0 ? fmt(rA.miMonthly) : "—", rB.miMonthly > 0 ? fmt(rB.miMonthly) : "—", fmt(Math.abs(rA.miMonthly - rB.miMonthly))],
                ["Total Monthly Payment", fmt(rA.basePmt + rA.miMonthly), fmt(rB.basePmt + rB.miMonthly), fmt(pmtDelta)],
                ["Payoff Time", `${Math.floor(rA.sched.totalMonths/12)} yr ${rA.sched.totalMonths%12} mo`, `${Math.floor(rB.sched.totalMonths/12)} yr ${rB.sched.totalMonths%12} mo`, Math.abs(rA.sched.totalMonths - rB.sched.totalMonths) + " mo"],
                ["Total Interest Paid", fmt(rA.sched.totalInterest), fmt(rB.sched.totalInterest), fmt(intDelta)],
                ["Total PMI/MIP Paid", rA.totalMI > 0 ? fmt(rA.totalMI) : "—", rB.totalMI > 0 ? fmt(rB.totalMI) : "—", fmt(Math.abs(rA.totalMI - rB.totalMI))],
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
          Edit any field above — amount, rate, term, or extra monthly — and everything recalculates live. Useful for comparing VA vs FHA vs Conventional, or "pay extra $200/mo" vs "refinance to a lower rate," or 30-yr vs 15-yr.
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

  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 14, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const rowStyle = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.hairline}` };

  const loanTypeInfo = {
    va: { title: "VA Loan", desc: "Zero down, no PMI, funded by the Department of Veterans Affairs. Available to eligible service members, veterans, and surviving spouses." },
    fha: { title: "FHA Loan", desc: "Federal Housing Administration loan. 3.5% minimum down (with 580+ credit score), backed by HUD. Good fit when VA isn't available." },
    conv: { title: "Conventional Loan", desc: "Fannie Mae / Freddie Mac standard loan. 3-5% down typical; 20% down avoids PMI. Most common for second homes and investment properties." },
  };

  return (
    <PageWrapper>
      <PageHero title="Loan Calculator: VA, FHA, and Conventional" subtitle={<>Prefilled with 2026 Pensacola-area market defaults. Every input is editable.<br />Estimates only* — confirm with a VA-literate lender before offer.</>} breadcrumb="Home > Loan Calculator" />
      <Content>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.elevated, padding: 4, borderRadius: 8 }}>
              {[{id:"va",label:"VA Loan"},{id:"fha",label:"FHA"},{id:"conv",label:"Conventional"}].map(t => (
                <button key={t.id} onClick={() => setLoan(t.id)} style={{
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
              <input type="number" value={homePrice} onChange={e=>setHomePrice(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Down Payment %</label>
                <input type="number" step="0.5" value={downPct} onChange={e=>setDownPct(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Down Payment $</label>
                <div style={{ ...inputStyle, color: C.gold, display: "flex", alignItems: "center" }}>{fmt(downPayment)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Interest Rate %</label>
                <input type="number" step="0.125" value={rate} onChange={e=>setRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Loan Term (yrs)</label>
                <select value={termYears} onChange={e=>setTermYears(Number(e.target.value))} style={inputStyle}>
                  <option value={30}>30</option>
                  <option value={20}>20</option>
                  <option value={15}>15</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Property Tax Rate %</label>
                <input type="number" step="0.05" value={taxRate} onChange={e=>setTaxRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Home Insurance /yr</label>
                <input type="number" step="100" value={insuranceAnnual} onChange={e=>setInsuranceAnnual(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>HOA (monthly, optional)</label>
              <input type="number" step="10" value={hoaMonthly} onChange={e=>setHoaMonthly(e.target.value)} style={inputStyle} />
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

        <InfoBox title="Estimates Only — Confirm With a Lender">
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

const NeighborhoodsPage = ({ go }) => (
  <PageWrapper>
    <PageHero title="Pensacola Area Communities &amp; Neighborhood Guides" subtitle="From Gulf-front beach living on Perdido Key to A-rated Santa Rosa schools in Gulf Breeze to starter homes minutes from the NAS Pensacola main gate — the complete guide to every community we serve." breadcrumb="Home > Communities" />
    <Content>
      <P>Thirteen distinct communities across the Pensacola and Fort Walton Beach Military Housing Areas. Each has its own BAH fit, school zoning, commute profile, and character. Click any card below for the full built-out guide with facts, sub-neighborhoods, BAH math, schools, hurricane considerations, and FAQ.</P>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 24 }}>
        {COMMUNITY_LINKS.map(n => (
          <a key={n.href} href={n.href} style={{
            background: CHARCOAL, border: `1px solid #333`, borderRadius: 12,
            padding: 24, textDecoration: "none", display: "block",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
            <h3 style={{ fontFamily: SF, color: "#fff", fontSize: 20, margin: "0 0 10px", fontWeight: 500 }}>{n.label}</h3>
            <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{n.blurb}</p>
            <div style={{ color: GOLD, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, fontFamily: SS }}>Read {n.label} Guide →</div>
          </a>
        ))}
      </div>
      <InfoBox title="Need Help Choosing?">Every family has different priorities — schools, commute, budget, lifestyle, investment potential. Call me at (850) 266-5005 and we'll narrow it down together in a 15-minute conversation. No pressure, no obligation.</InfoBox>
    </Content>
  </PageWrapper>
);

const BLOG_API = "https://costin-blog.gregg-costin.workers.dev";

const STARTER_POSTS = [
  {
    slug: "pcs-to-pensacola-2026-complete-guide",
    title: "PCS to Pensacola in 2026: What Military Families Need to Know Before They Move",
    excerpt: "Getting orders to NAS Pensacola, Corry Station, or Whiting Field? Here's the real-world guide to neighborhoods, BAH, schools, and the housing market from someone who's done 11 PCS moves.",
    category: "PCS", date: "2026-04-15", readTime: "8 min",
    body: "If you just got orders to Pensacola, congratulations. You're headed to one of the most military-friendly communities in the country, with white-sand beaches, no state income tax, and a cost of living that actually lets you build wealth on BAH.\n\nStart 90 Days Out\n\nThe biggest mistake I see is waiting until 30 days before report date to start looking at housing. At 90 days, you have options. At 30 days, you have pressure. Connect with a Realtor who understands military timelines, get pre-approved with a VA-experienced lender, and start narrowing neighborhoods.\n\nKnow Your BAH\n\nPensacola falls under MHA FL064. An E-6 with dependents receives $2,235/month in 2026. That comfortably covers a mortgage in Pace, Milton, or East Pensacola. Gulf Breeze and Perdido Key will push above BAH for most enlisted ranks, but the school quality and lifestyle can make the $200-400/month delta worthwhile.\n\nRent vs. Buy\n\nIf you're going to be in Pensacola for 3+ years, buying almost always wins financially with a VA loan at zero down. If you're a student aviator on a 12-18 month pipeline, renting is usually smarter unless you plan to keep the property as an investment.\n\nReady to start your search? Call me at (850) 266-5005 and let's build your PCS game plan."
  },
  {
    slug: "va-loan-seller-concessions-truth",
    title: "The VA Loan Seller Concessions Myth That's Costing Military Buyers Thousands",
    excerpt: "Most agents and even some lenders incorrectly apply a blanket 4% cap to everything the seller pays on a VA loan. Here's what the VA Handbook actually says — and why it matters for your purchase.",
    category: "VA Loans", date: "2026-04-10", readTime: "6 min",
    body: "Here's a scenario I see at least once a month: a military buyer is told by their agent or lender that 'the seller can only contribute 4% on a VA loan.' They structure the offer accordingly, leaving money on the table.\n\nThat advice is wrong. Or more precisely, it's an oversimplification that costs veterans real money.\n\nWhat the VA Handbook Actually Says\n\nVA Pamphlet 26-7, Chapter 8, Topic 5 draws a clear line between two separate categories:\n\nSeller-Paid Closing Costs (NO CAP): Payment of the buyer's normal, reasonable, and customary closing costs is NOT a seller concession. The seller can pay 100% of your closing costs with no VA rule violation.\n\nSeller Concessions (4% Cap): The 4% limit only applies to concessions — things of value added to the transaction that the seller is not customarily expected to pay.\n\nThe Math on a $350,000 Pensacola Purchase: $14,000 in allowable concessions PLUS $7,000 in seller-paid closing costs = $21,000 in total seller contributions. Same VA benefit, $7,000 difference depending on your lender.\n\nCall me at (850) 266-5005 and I'll connect you with the right lenders."
  },
  {
    slug: "florida-homestead-exemption-military",
    title: "Florida Homestead Exemption: The Military Family's Guide to Saving Thousands on Property Taxes",
    excerpt: "The homestead exemption saves the average Pensacola homeowner $800-1,200/year. Disabled veterans can pay zero property taxes. Here's how to file and the deadlines you can't miss.",
    category: "Homestead", date: "2026-04-05", readTime: "5 min",
    body: "Florida's homestead exemption is one of the most valuable financial benefits available to homeowners in the state, and military families often leave money on the table by not filing — or not filing correctly.\n\nThe Basics: $50,000 Off Your Assessed Value\n\nEvery Florida homeowner who occupies their property as a primary residence gets up to $50,000 removed from their assessed value. At Pensacola's current millage rate, that's roughly $800-1,200 per year back in your pocket.\n\nThe Military Game-Changer: Disabled Veteran Exemptions\n\nIf you have a 100% VA disability rating, you pay ZERO property taxes on your homestead. On a $325,000 home in Escambia County, that's $4,500-6,000+ per year in savings.\n\nThe Deadline You Cannot Miss: File by March 1 of the year following your purchase.\n\nQuestions about your specific situation? Call me at (850) 266-5005."
  },
  {
    slug: "best-neighborhoods-eglin-afb-families",
    title: "Best Neighborhoods for Eglin AFB Families in 2026: Niceville, Crestview, or Fort Walton Beach?",
    excerpt: "Eglin families face a classic trade-off: top schools in Niceville, affordability in Crestview, or convenience in Fort Walton Beach. Here's how to choose based on your rank, family, and priorities.",
    category: "Neighborhoods", date: "2026-03-28", readTime: "7 min",
    body: "If you're PCSing to Eglin AFB, the first question everyone asks is: 'Where should I live?' The Emerald Coast has several strong options, and the right answer depends on your family's priorities.\n\nNiceville — The Gold Standard for Families: Median home price $330-420K. Commute 10-15 min. Schools A-rated Okaloosa County. Niceville is consistently the #1 choice for Eglin families with school-age children.\n\nCrestview — Best Value, Longer Commute: Median home price $260-330K. Commute 25-30 min. You get significantly more house for your money. 4-bedroom new builds under $300K are common.\n\nFort Walton Beach — Close to Everything: Median home price $300-400K. Commute 5-15 min. FWB is the natural choice if you want to be close to both Eglin and the beach without the premium of Niceville.\n\nWant help narrowing it down? Call me at (850) 266-5005."
  },
  {
    slug: "bah-2026-pensacola-what-can-you-afford",
    title: "2026 BAH for Pensacola: What Can You Actually Afford?",
    excerpt: "BAH is a foundation, not a ceiling. Here's a rank-by-rank breakdown of what your 2026 housing allowance covers in the Pensacola market — and where the math gets real.",
    category: "BAH", date: "2026-03-20", readTime: "6 min",
    body: "Every military family PCSing to Pensacola asks the same question: 'Can I afford to buy on BAH?' The honest answer is: it depends on your rank, your family's priorities, and how you define 'afford.'\n\n2026 Pensacola BAH Reality Check: E-5 $1,863/month, E-6 $2,235/month, E-7 $2,256/month, O-3 $2,271/month, O-4 $2,457/month.\n\nWhat That Actually Buys: At current interest rates, an E-6's BAH of $2,235 covers a PITI payment on roughly a $280-310K home. That puts Pace, Milton, and East Pensacola Heights well within reach.\n\nThe Gap Is an Investment, Not a Problem: BAH was designed to cover approximately the median rental cost in your area. A $150-350/month gap between BAH and PITI is normal and often worth it when you factor in equity growth, tax benefits, and quality of life.\n\nWant me to run the exact numbers for your rank and target neighborhoods? Call (850) 266-5005."
  },
];

const BlogPage = ({ go }) => {
  const [posts, setPosts] = useState(STARTER_POSTS);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(BLOG_API + "/api/posts")
      .then(r => r.ok ? r.json() : [])
      .then(apiPosts => {
        if (Array.isArray(apiPosts) && apiPosts.length > 0) {
          const slugs = new Set(STARTER_POSTS.map(p => p.slug));
          const newPosts = apiPosts.filter(p => !slugs.has(p.slug));
          setPosts([...newPosts, ...STARTER_POSTS]);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["All", ...new Set(posts.map(p => p.category))];
  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);
  const formatDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (selectedPost) {
    const post = posts.find(p => p.slug === selectedPost);
    if (!post) return null;
    return (
      <PageWrapper>
        <section style={{ background: `linear-gradient(135deg, ${C.panel}, #1a2332)`, padding: "60px 24px", borderBottom: `1px solid ${C.hairline}` }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", color: C.gold, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20, fontFamily: SS, letterSpacing: 1 }}>← Back to Blog</button>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ background: C.goldTint, border: `1px solid ${C.goldLine}`, color: C.gold, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>{post.category}</span>
              <span style={{ color: C.muted, fontSize: 13 }}>{formatDate(post.date)}</span>
              <span style={{ color: C.muted, fontSize: 13 }}>{post.readTime} read</span>
            </div>
            <h1 style={{ fontFamily: SF, fontSize: "clamp(28px,4vw,42px)", color: "#fff", lineHeight: 1.2, marginBottom: 0, fontWeight: 500 }}>{post.title}</h1>
          </div>
        </section>
        <Content>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {post.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ color: "#ccc", fontSize: 15.5, lineHeight: 1.9, marginBottom: 16 }}>{para}</p>
            ))}
          </div>
          <div style={{ maxWidth: 760, margin: "40px auto 0", padding: 28, background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 12 }}>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 8, fontFamily: SF }}>Questions about this topic?</p>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Call or text me at (850) 266-5005 and let's talk about your specific situation.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="tel:8502665005" style={{ background: C.gold, color: C.ink, border: "none", padding: "12px 24px", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none", fontFamily: SS }}>Call 850-266-5005</a>
              <button onClick={() => { setSelectedPost(null); go("contact"); }} style={{ background: "transparent", color: C.gold, border: `1px solid ${C.goldLine}`, padding: "12px 24px", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: SS }}>Send a Message</button>
            </div>
          </div>
        </Content>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHero title="Blog: Pensacola Military Real Estate" subtitle="Market insights, VA loan guidance, PCS tips, and neighborhood deep-dives from a retired USAF Combat Systems Officer turned Realtor." breadcrumb="Home > Blog" />
      <Content>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              background: activeCategory === cat ? C.gold : "transparent",
              color: activeCategory === cat ? C.ink : C.muted,
              border: `1px solid ${activeCategory === cat ? C.gold : CHARCOAL}`,
              padding: "8px 18px", fontSize: 12, borderRadius: 6, cursor: "pointer",
              fontWeight: activeCategory === cat ? 700 : 500,
              letterSpacing: 0.5, textTransform: "uppercase", fontFamily: SS,
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {filtered.map(post => (
            <div key={post.slug} onClick={() => setSelectedPost(post.slug)} style={{
              background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 12,
              padding: 28, cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.goldLine}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.hairline}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ background: C.goldTint, border: `1px solid ${C.goldLine}`, color: C.gold, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>{post.category}</span>
                <span style={{ color: C.mutedD, fontSize: 12 }}>{formatDate(post.date)}</span>
                <span style={{ color: C.mutedD, fontSize: 12 }}>{post.readTime} read</span>
              </div>
              <h3 style={{ fontFamily: SF, color: "#fff", fontSize: 22, fontWeight: 500, margin: "0 0 10px", lineHeight: 1.3 }}>{post.title}</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{post.excerpt}</p>
              <div style={{ marginTop: 16, color: C.gold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: SS }}>Read Article →</div>
            </div>
          ))}
        </div>
      </Content>
    </PageWrapper>
  );
};

const ReviewsPage = () => {
  const GOOGLE_URL = "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd";
  const tags = ["Tireless Work Ethic", "Trusted Advisor", "Prompt Responses", "Proactive Approach", "Negotiation Skills", "Excellent Communicator", "Genuine Care", "Attention to Detail", "Veteran-Owned", "Military Specialist"];
  const reviews = [
    { text: "If you are moving to the Pensacola area, you need Gregg Costin in your corner. Relocating our family all the way from Washington State to Florida felt like a massive, overwhelming task, but Gregg was an absolute lifesaver. He is truly a professional who went above and beyond for us every step of the way.", from: "Eric Johnson", meta: "Verified Google Review" },
    { text: "Gregg is an outstanding, exceptional and professional agent and advisor that is in your corner that truly looks out for you and treats you like you are family! The home buying or selling process can be an intimidating time for most people, but Gregg guides you through it with calm expertise.", from: "Shannon Williamson", meta: "Local Guide · Verified Google Review" },
    { text: "We were PCSing to Pensacola from overseas and Gregg was incredible from day one. He set us up on a video call, walked us through the Perdido Key and Gulf Breeze markets, and helped us put in an offer sight-unseen. He caught an issue on the inspection we would have missed and negotiated a $6,000 credit.", from: "Active Duty Navy Family", meta: "PCS from Overseas" },
    { text: "Gregg made our PCS transition to NAS Pensacola seamless. As a military family, we appreciated that he actually understands orders timelines, VA loan quirks, and BAH considerations. He didn't just find us a house — he found us a home within our budget and close to base.", from: "Military Family Client", meta: "Verified Google Review" },
    { text: "As a veteran myself, working with another veteran Realtor made all the difference. Gregg's 20 years in the Air Force means he gets it — deployments, short-notice moves, dual-military households. He's the real deal.", from: "Veteran Client", meta: "Verified Google Review" },
    { text: "Gregg is hands-down the best Realtor we've ever worked with. He made the entire buying process feel effortless — always available, endlessly patient, and truly invested in helping us find the right home. His military background means he actually understands PCS timelines and VA loans.", from: "USAF Veteran", meta: "Gulf Breeze Purchase" },
    { text: "Gregg's negotiation skills saved us thousands on our Gulf Breeze home. He knew the local market cold and made sure we didn't overpay in a competitive situation. His response time was incredible — texts answered within minutes, not hours.", from: "Gulf Breeze Buyer", meta: "Verified Google Review" },
    { text: "First-time homebuyers using a VA loan — we had zero clue where to start. Gregg walked us through every step, explained the VA Pamphlet 26-7 requirements, and connected us with a VA-savvy lender. Closed on our Pace, FL home in 28 days. Highly recommend to any military family.", from: "First-Time VA Buyer", meta: "Verified Google Review" },
    { text: "As a young first time home buyer, I went in clueless. I not only got phenomenal guidance and recommendations, but valuable information about VA loan benefits and the entire buying process. Gregg genuinely cares about his clients and it shows in every interaction.", from: "First-Time Military Homebuyer", meta: "Pace" },
  ];
  const credibility = [
    "Retired USAF Captain — Combat Systems Officer (E-3 AWACS), prior-enlisted Staff Sergeant, 11 personal PCS moves",
    "Military Relocation Professional (MRP) certified",
    "Accredited Buyer's Representative (ABR), Seller Representative Specialist (SRS)",
    "Real Estate Negotiation Expert (RENE) certified",
    "Florida Military Specialist designation",
    "Licensed in Florida and Alabama",
    "VA loan, BAH, and Florida Homestead Exemption expertise",
    "Serves NAS Pensacola, Corry Station, NAS Whiting Field, Eglin AFB, Hurlburt Field, Duke Field",
    "Verified veteran-owned business on Google",
    "Available 24/7 to support deploying and relocating military families",
  ];
  return (
    <PageWrapper>
      <PageHero title="5-Star Reviews from Military Families Across the Florida Panhandle" subtitle="Real stories from real military families who trusted their PCS move, VA loan, and homebuying journey to a retired USAF Combat Systems Officer." breadcrumb="Home > Reviews" />
      <Content>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: CHARCOAL, border: `1px solid ${GOLD}`, borderRadius: 14, padding: "20px 30px" }}>
            <div style={{ fontFamily: SF, fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1 }}>5.0</div>
            <div>
              <div style={{ color: GOLD, fontSize: 22, letterSpacing: 2 }}>★★★★★</div>
              <div style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>34 Google Reviews · Verified on Google Business</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          <BtnP href={GOOGLE_URL}>Read All 34 Reviews on Google</BtnP>
          <BtnG href="tel:+18502665005">Call (850) 266-5005</BtnG>
        </div>

        <H2 align="center">What Clients Say Most About Gregg</H2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "16px 0 40px" }}>
          {tags.map(t => (
            <span key={t} style={{ background: CHARCOAL, color: GOLD, padding: "6px 14px", borderRadius: 999, fontSize: 13, border: `1px solid #333` }}>{t}</span>
          ))}
        </div>

        <H2 align="center">Featured Client Reviews</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20, margin: "16px 0 40px" }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: CHARCOAL, border: `1px solid #333`, borderRadius: 14, padding: 28, display: "flex", flexDirection: "column" }}>
              <div style={{ color: GOLD, fontSize: 18, marginBottom: 10, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ color: "#D1D5DB", fontSize: 15, lineHeight: 1.75, fontStyle: "italic", marginBottom: 16, flex: 1 }}>"{r.text}"</p>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{r.from}</div>
              <div style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>{r.meta}</div>
            </div>
          ))}
        </div>

        <div style={{ background: CHARCOAL, border: `1px solid #333`, borderRadius: 14, padding: 32, marginBottom: 40 }}>
          <h2 style={{ color: GOLD, fontSize: 22, fontWeight: 700, fontFamily: SF, marginBottom: 16 }}>Why Military Families Choose Gregg</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {credibility.map(c => (
              <li key={c} style={{ color: "#D1D5DB", fontSize: 15, padding: "8px 0", lineHeight: 1.6 }}>
                <span style={{ color: "#10B981", fontWeight: 700, marginRight: 8 }}>✓</span>{c}
              </li>
            ))}
          </ul>
        </div>

        <InfoBox title="Leave a Review">Your review helps other military families find an agent they can trust. If I've helped you buy or sell, I'd be honored if you'd share your experience on Google. Visit <a href={GOOGLE_URL} target="_blank" rel="noopener" style={{ color: C.gold }}>my Google Business profile</a> to leave one directly.</InfoBox>
      </Content>
    </PageWrapper>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", inquiryType: "PCS Relocation — Buying", message: "", honeypot: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const WEBHOOK_URL = "https://costin-contact.gregg-costin.workers.dev";

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    if (!formData.name.trim() || !formData.email.trim()) { setStatus("error"); setErrorMsg("Name and email are required."); return; }
    try {
      const response = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", inquiryType: "PCS Relocation — Buying", message: "", honeypot: "" });
      } else { setStatus("error"); setErrorMsg(data.error || "Something went wrong. Please call (850) 266-5005."); }
    } catch (err) { setStatus("error"); setErrorMsg("Connection error. Please call (850) 266-5005 directly."); }
  };

  return (
    <PageWrapper>
      <PageHero title="Contact Gregg Costin" subtitle="Whether you're 90 days from PCS or boots-on-ground tomorrow, I respond to every inquiry within 2 hours during business hours." breadcrumb="Home > Contact" />
      <Content>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 32 }}>
          <div>
            <H3>Direct Contact</H3>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <img loading="lazy" src={IMG.navyTie} alt="Gregg Costin" style={{ width: 180, height: 180, borderRadius: "50%", objectFit: "cover", objectPosition: "center top", border: `3px solid ${GOLD}44` }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Business Line</p>
              <a href="tel:8502665005" style={{ color: GOLD, fontSize: 24, fontWeight: 700, textDecoration: "none" }}>(850) 266-5005</a>
              <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Call or text — this is my direct line</p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Email</p>
              <p><a href="mailto:Gregg.Costin@gmail.com" style={{ color: GOLD, fontSize: 15, textDecoration: "none", fontWeight: 600 }}>Gregg.Costin@gmail.com</a></p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Office</p>
              <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7 }}>Levin Rinke Realty<br />220 W. Garden Street<br />Pensacola, FL 32502</p>
            </div>
            <H3>Social & Web</H3>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 2 }}>Instagram: <a href="https://www.instagram.com/greggcostinrealtor/" target="_blank" rel="noopener" style={{ color: C.gold, textDecoration: "none" }}>@greggcostinrealtor</a><br />Facebook: <a href="https://www.facebook.com/greggcostin/" target="_blank" rel="noopener" style={{ color: C.gold, textDecoration: "none" }}>@greggcostin</a><br /><span style={{ whiteSpace: "nowrap" }}>YouTube: <a href="https://www.youtube.com/@PensacolaMilitaryRealtor" target="_blank" rel="noopener" style={{ color: C.gold, textDecoration: "none" }}>@PensacolaMilitaryRealtor</a></span><br />LinkTree: <a href="https://linktr.ee/Greggcostin" style={{ color: C.gold, textDecoration: "none" }} target="_blank" rel="noopener">linktr.ee/Greggcostin</a></p>
          </div>
          <div>
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
                  <label style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Full Name *</label>
                  <input type="text" value={formData.name} onChange={handleChange("name")} required disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Email Address *</label>
                  <input type="email" value={formData.email} onChange={handleChange("email")} required disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={handleChange("phone")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>What Can I Help With?</label>
                  <select value={formData.inquiryType} onChange={handleChange("inquiryType")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none" }}>
                    <option>PCS Relocation — Buying</option>
                    <option>PCS Relocation — Selling</option>
                    <option>VA Loan Questions</option>
                    <option>Investment Property</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#999", fontSize: 12, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Message</label>
                  <textarea rows={4} value={formData.message} onChange={handleChange("message")} disabled={status === "submitting"} style={{ width: "100%", padding: "12px 16px", background: CHARCOAL, border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                {status === "error" && (
                  <div style={{ background: "#3a1a1a", border: "1px solid #a03a3a", borderRadius: 8, padding: 12, color: "#ff9999", fontSize: 13 }}>
                    ⚠ {errorMsg}
                  </div>
                )}
                <button type="submit" disabled={status === "submitting"} style={{ background: status === "submitting" ? `${GOLD}66` : GOLD, color: BLACK, border: "none", padding: "14px 28px", fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: status === "submitting" ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: .5, marginTop: 8 }}>
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </button>
                <p style={{ color: "#666", fontSize: 11, marginTop: 4, textAlign: "center" }}>By submitting, you agree to be contacted by The Costin Team. Your information is never sold or shared.</p>
              </form>
            )}
          </div>
        </div>
        <InfoBox title="Response Time">I respond to every inquiry within 2 hours during business hours (8am-8pm CT, 7 days a week). After hours messages receive a response by 8am the next morning. If your situation is urgent, call directly — I answer my phone.</InfoBox>
      </Content>
    </PageWrapper>
  );
};

const PAGE_TO_SLUG = {
  home: "/",
  about: "/about",
  pcs: "/pcs-guide",
  neighborhoods: "/neighborhoods",
  "va-loan": "/va-loans",
  calculator: "/mortgage-calculator",
  homestead: "/homestead",
  contact: "/contact",
  reviews: "/reviews",
  blog: "/blog",
};
const SLUG_TO_PAGE = Object.fromEntries(Object.entries(PAGE_TO_SLUG).map(([k, v]) => [v, k]));

const resolvePageFromPath = (pathname) => {
  const clean = pathname.replace(/\/$/, "") || "/";
  return SLUG_TO_PAGE[clean] || "home";
};

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
  };

  useEffect(() => {
    const onPopState = () => {
      setPage(resolvePageFromPath(window.location.pathname));
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        .tabbar::-webkit-scrollbar { display: none; }
        .tabbar { -ms-overflow-style: none; scrollbar-width: none; }
        [id] { scroll-margin-top: 100px; }
      `}</style>
      <Nav current={page} go={go} />
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
      {page === "va-loan" && <VALoanPage go={go} />}
      {page === "calculator" && <LoanCalculator />}
      {page === "homestead" && <HomesteadPage go={go} />}
      {page === "nas" && <BaseGuide base="nas" go={go} />}
      {page === "whiting" && <BaseGuide base="whiting" go={go} />}
      {page === "corry" && <BaseGuide base="corry" go={go} />}
      {page === "eglin" && <BaseGuide base="eglin" go={go} />}
      {page === "hurlburt" && <BaseGuide base="hurlburt" go={go} />}
      {page === "neighborhoods" && <NeighborhoodsPage go={go} />}
      {page === "blog" && <BlogPage go={go} />}
      {page === "reviews" && <ReviewsPage />}
      {page === "contact" && <ContactPage />}
      <Footer go={go} />
    </div>
  );
}
