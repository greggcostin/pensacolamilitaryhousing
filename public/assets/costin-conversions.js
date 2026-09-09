/* Accepted website inquiries only. This file never sends a lead or contact data. */
(() => {
  'use strict';
  if (window.costinConversions) return;
  const receiptPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const key = 'costin_accepted_receipts_v1', lifetime = 7 * 86400000;
  const seen = new Set(), verifiedEvents = new WeakSet();
  const valid = (ok, data) => ok === true && data?.success === true && data.accepted === true &&
    typeof data.duplicate === 'boolean' && receiptPattern.test(data.receiptId || '') &&
    ['crm_accepted', 'email_fallback'].includes(data.captureStatus);
  function claim(id) {
    if (seen.has(id)) return false;
    seen.add(id);
    try {
      const now = Date.now(), parsed = JSON.parse(localStorage.getItem(key) || '[]');
      const saved = (Array.isArray(parsed) ? parsed : []).filter(row => Array.isArray(row) && receiptPattern.test(row[0]) && Number.isFinite(row[1]) && row[1] <= now && now - row[1] < lifetime).slice(-99);
      if (saved.some(row => row[0] === id)) return false;
      localStorage.setItem(key, JSON.stringify([...saved, [id, now]]));
    } catch { /* The in-memory set still prevents repeat events in this page. */ }
    return true;
  }
  function accept(ok, data, formId) {
    if (!valid(ok, data)) return false;
    // A previously accepted duplicate may show success, but is never a new lead.
    if (data.duplicate || !claim(data.receiptId)) return true;
    const detail = Object.freeze({ form_id: ['inquiry-form','inquiry-form-c','spa-inquiry-form','spa-contact-page'].includes(formId) ? formId : 'website-form', capture_status: data.captureStatus, receipt_verified: true });
    const event = new CustomEvent('costin:lead-success', { detail });
    verifiedEvents.add(event);
    if (navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1') {
      // No name, email, phone, message, receipt ID, URL query or financial input.
      try { window.gtag?.('event', 'generate_lead', { ...detail, lead_method: 'website_form', site_brand: location.hostname === 'greggcostin.com' ? 'civilian' : 'military' }); } catch {}
      try { window.costinMeta?.track('Lead'); } catch {}
    }
    try { document.dispatchEvent(event); } catch {}
    return true;
  }
  window.costinConversions = Object.freeze({ valid, accept, isVerifiedEvent: event => verifiedEvents.has(event) });
})();
