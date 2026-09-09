import { CORS, RELEASE, json, normalize, fingerprint } from './contact-contract.js';
export { InquiryReceipt } from './inquiry-receipt.js';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') return json({ service: 'costin-contact', release: RELEASE, receiptStorageConfigured: Boolean(env.INQUIRY_RECEIPTS), providerDeliveryTested: false });
    if (request.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);
    let body;
    try {
      if (Number(request.headers.get('content-length')) > 16000) return json({ success: false, error: 'Message is too long. Please shorten it or call (850) 266-5005.' }, 413);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 16000) return json({ success: false, error: 'Message is too long. Please shorten it or call (850) 266-5005.' }, 413);
      body = JSON.parse(raw);
    } catch { return json({ success: false, error: 'Please submit a valid form.' }, 400); }
    if (body?._gotcha || body?.honeypot || body?.website) return json({ success: true, accepted: false, message: 'Thanks! Your message was received.' });
    let inquiry;
    try { inquiry = normalize(body, request); }
    catch (error) { return json({ success: false, error: error.message, message: error.message }, 400); }
    if (!env.INQUIRY_RECEIPTS) return json({ success: false, error: 'Please call (850) 266-5005. The form is temporarily unavailable.' }, 503);
    try {
      const id = env.INQUIRY_RECEIPTS.idFromName(await fingerprint(inquiry));
      return await env.INQUIRY_RECEIPTS.get(id).fetch('https://inquiry.internal/', { method: 'POST', body: JSON.stringify(inquiry) });
    } catch {
      console.error(JSON.stringify({ event: 'inquiry_receipt_failure', release: RELEASE }));
      return json({ success: false, error: 'We could not confirm delivery. Please call (850) 266-5005 or try again shortly.' }, 503);
    }
  },
};
