export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.json();
      const { name, email, phone, inquiryType, message } = body;

      // Honeypot: forms send it as _gotcha OR honeypot (fix 2026-08-12: pcs-checklist.html
      // sends `honeypot`, and only `_gotcha` was checked - the checklist spam trap was dead)
      if (body._gotcha || body.honeypot) {
        return new Response(JSON.stringify({ success: true, message: "Thanks! Your message was received." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!name || !email || !message) {
        return new Response(JSON.stringify({ success: false, message: "Please fill in all required fields." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const stageMap = {
        "PCS / Relocation — Buying": "Lead",
        "PCS / Relocation — Selling": "Lead",
        "PCS / Relocation — Both": "Lead",
        "First-Time Home Buyer": "Lead",
        "Investment Property": "Lead",
        "Selling My Home": "Lead",
        "VA Loan Questions": "Lead",
        // Lead magnets file as LEAD, not Prospect (fix 2026-08-12: a checklist downloader is a
        // timeline-qualified lead - they are planning a PCS move)
        "PCS Checklist Download": "Lead",
        "General Question": "Prospect",
        "Other": "Prospect",
      };

      // Lead-magnet catch: any future download/guide inquiryType files as Lead by default
      const isLeadMagnet = inquiryType && /download|checklist|guide/i.test(inquiryType);
      const fub_stage = stageMap[inquiryType] || (isLeadMagnet ? "Lead" : "Prospect");

      // SOURCE ATTRIBUTION (fix 2026-08-12: one hardcoded source destroyed capture-time
      // attribution across every form on every site). Resolution order:
      //   1. utm_source social values -> "Social" (the authority-engine flywheel becomes measurable)
      //   2. the posting site's hostname (Origin/Referer, or explicit body.sourceUrl)
      //   3. legacy default, unchanged
      const referer = request.headers.get("Origin") || request.headers.get("Referer") || String(body.sourceUrl || "");
      let siteSource = "GreggCostin.com Contact Form";
      if (/pensacolamilitaryhousing\.com/i.test(referer)) siteSource = "PensacolaMilitaryHousing.com";
      const utmSource = String(body.utm_source || "").toLowerCase();
      const isSocial = /^(fb|ig|facebook|instagram|social|youtube|yt|tiktok)$/.test(utmSource);
      const fub_source = isSocial ? "Social" : siteSource;

      const tags = [siteSource];
      if (inquiryType) tags.push(inquiryType);
      if (isSocial) tags.push("Social: " + utmSource + (body.utm_campaign ? " / " + String(body.utm_campaign).slice(0, 60) : ""));
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ").slice(1).join(" ") || "";

      const fubAuth = "Basic " + btoa(env.FUB_API_KEY + ":");

      const fubPromise = (async () => {
        try {
          const eventResp = await fetch("https://api.followupboss.com/v1/events", {
            method: "POST",
            headers: {
              "Authorization": fubAuth,
              "Content-Type": "application/json",
              "X-System": "GreggCostin.com Contact Form",
              "X-System-Key": "costin-contact-form"
            },
            body: JSON.stringify({
              source: fub_source,
              type: "Registration",
              person: {
                firstName: firstName,
                lastName: lastName,
                emails: [{ value: email }],
                phones: phone ? [{ value: phone }] : [],
                tags: tags,
                stage: fub_stage,
                assignedTo: 1
              },
              description: message
            })
          });
          await eventResp.text();

          const searchResp = await fetch("https://api.followupboss.com/v1/people?limit=1&email=" + encodeURIComponent(email), {
            headers: { "Authorization": fubAuth }
          });
          const searchData = await searchResp.json();
          const personId = searchData.people && searchData.people.length > 0 ? searchData.people[0].id : null;

          if (personId) {
            const dueDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split("T")[0];
            await fetch("https://api.followupboss.com/v1/tasks", {
              method: "POST",
              headers: { "Authorization": fubAuth, "Content-Type": "application/json" },
              body: JSON.stringify({
                personId: personId,
                name: "Follow up with " + name + " — " + (inquiryType || "General Question"),
                dueDate: dueDate,
                assignedUserId: 1
              })
            });
          }
          return { personId };
        } catch (err) {
          console.error("FUB error:", err.message);
          return { error: err.message };
        }
      })();

      const results = await Promise.allSettled([
        fubPromise,
        sendNotificationEmail(env, { name, email, phone, inquiryType, message: message + "\n\n[source: " + fub_source + (isSocial && body.utm_campaign ? " / " + String(body.utm_campaign).slice(0, 60) : "") + "]" }),
        sendConfirmationEmail(env, { name, email, inquiryType }),
      ]);

      return new Response(JSON.stringify({ success: true, message: "Thanks! Your message was received." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ success: false, message: "Something went wrong. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

async function sendNotificationEmail(env, { name, email, phone, inquiryType, message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a365d; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">New Lead from GreggCostin.com</h1>
      </div>
      <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e0e0e0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Phone:</td><td style="padding: 8px;"><a href="tel:${phone || "N/A"}">${escapeHtml(phone || "N/A")}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Inquiry:</td><td style="padding: 8px;">${escapeHtml(inquiryType || "General Question")}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Message:</td><td style="padding: 8px;">${escapeHtml(message)}</td></tr>
        </table>
      </div>
      <div style="padding: 16px; text-align: center;">
        <a href="mailto:${email}" style="display: inline-block; padding: 10px 24px; background: #1a365d; color: #fff; text-decoration: none; border-radius: 4px; margin: 4px;">Reply</a>
        ${phone ? `<a href="tel:${phone}" style="display: inline-block; padding: 10px 24px; background: #2d8a4e; color: #fff; text-decoration: none; border-radius: 4px; margin: 4px;">Call</a>` : ""}
        <a href="https://greggcostin.followupboss.com" style="display: inline-block; padding: 10px 24px; background: #e67e22; color: #fff; text-decoration: none; border-radius: 4px; margin: 4px;">Open FUB</a>
      </div>
    </div>
  `;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `GreggCostin.com Leads <${env.NOTIFICATION_FROM}>`,
      to: [env.GREGG_EMAIL],
      subject: `New Lead: ${name} — ${inquiryType || "General Question"}`,
      html: html,
    }),
  });
}

async function sendConfirmationEmail(env, { name, email, inquiryType }) {
  const firstName = name.split(" ")[0];
  const pcsNote = inquiryType && inquiryType.includes("PCS")
    ? "<p>If you are PCSing to the Emerald Coast, I have helped hundreds of military families find their perfect home here. You are in great hands!</p>"
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a365d; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Thanks for reaching out, ${escapeHtml(firstName)}!</h1>
      </div>
      <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e0e0e0;">
        <p>I received your message and will get back to you within <strong>24 hours</strong> (usually much sooner).</p>
        ${pcsNote}
        <p>In the meantime, here are some helpful resources:</p>
        <ul>
          <li><a href="https://greggcostin.realscout.com/onboarding">Set up your home search with live MLS alerts</a></li>
          <li><a href="https://pensacolamilitaryhousing.com/whats-my-home-worth">Get a free home valuation</a></li>
          <li><a href="https://pensacolamilitaryhousing.com/reviews">See what my clients say</a></li>
        </ul>
        <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-radius: 8px; text-align: center; border: 1px solid #dee2e6;">
          <strong>Gregg Costin</strong><br/>
          REALTOR | The Costin Team<br/>
          <a href="tel:+18502665005">(850) 266-5005</a><br/>
          <a href="mailto:Gregg.Costin@gmail.com">Gregg.Costin@gmail.com</a>
        </div>
      </div>
      <div style="text-align: center; padding: 12px; color: #888; font-size: 12px;">
        You are receiving this because you submitted a form on GreggCostin.com
      </div>
    </div>
  `;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Gregg Costin <${env.NOTIFICATION_FROM}>`,
      to: [email],
      subject: `Got your message, ${firstName}! I will be in touch soon`,
      html: html,
    }),
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
