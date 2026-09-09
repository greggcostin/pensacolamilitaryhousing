// Attribution records observable referral evidence, not recommendations or lead qualification.
export const RELEASE = '2026-09-07-inquiry-receipts-v1';
export const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Costin-Release': RELEASE } });
const text = (v, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const hostname = v => { try { return new URL(v).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };
const belongsTo = (host, domain) => host === domain || host.endsWith('.' + domain);
const stages = {
  'PCS / Relocation — Buying': 'Lead', 'PCS / Relocation — Selling': 'Lead',
  'PCS / Relocation — Both': 'Lead', 'First-Time Home Buyer': 'Lead',
  'Investment Property': 'Lead', 'Selling My Home': 'Lead', 'VA Loan Questions': 'Lead',
  'PCS Checklist Download': 'Lead', 'General Question': 'Prospect', 'Other': 'Prospect',
};
const aiSources = [
  ['ChatGPT', ['chatgpt.com', 'chat.openai.com'], ['chatgpt', 'chatgpt.com', 'openai']],
  ['Perplexity', ['perplexity.ai'], ['perplexity', 'perplexity.ai']],
  ['Claude', ['claude.ai'], ['claude', 'claude.ai', 'anthropic']],
  ['Gemini', ['gemini.google.com'], ['gemini', 'gemini.google.com']],
  ['Copilot', ['copilot.microsoft.com'], ['copilot', 'copilot.microsoft.com']],
];
export function attribution(body, request) {
  const origin = hostname(request.headers.get('Origin') || request.headers.get('Referer') || body.sourceUrl);
  const site = belongsTo(origin, 'pensacolamilitaryhousing.com') ? 'pensacolamilitaryhousing.com' : 'greggcostin.com';
  const siteSource = site === 'pensacolamilitaryhousing.com' ? 'PensacolaMilitaryHousing.com' : 'GreggCostin.com Contact Form';
  const source = text(body.utm_source, 80).toLowerCase(), medium = text(body.utm_medium, 60).toLowerCase(), referrerHost = hostname(body.referrer);
  const ai = aiSources.find(([, hosts, aliases]) => aliases.includes(source) || (!source && hosts.some(h => belongsTo(referrerHost, h))));
  const social = /^(fb|ig|facebook|instagram|social|youtube|yt|tiktok)$/.test(source), paid = /^(cpc|ppc|paid|paidsearch|paid_search|paid_social|display)$/.test(medium);
  const search = ['google.com', 'bing.com', 'search.yahoo.com', 'duckduckgo.com'].some(h => belongsTo(referrerHost, h));
  const organicCampaign = medium === 'organic' && /^(google|bing|yahoo|duckduckgo)(\.com)?$/.test(source);
  const channel = paid ? 'paid' : ai ? 'ai_referral' : social ? 'social' : medium === 'email' ? 'email' : organicCampaign ? 'organic_search' : source ? 'campaign' : search ? 'organic_search' : referrerHost && !['greggcostin.com', 'pensacolamilitaryhousing.com'].some(h => belongsTo(referrerHost, h)) ? 'referral' : 'direct_or_unavailable';
  return { site, siteSource, fubSource: social ? 'Social' : siteSource, channel, platform: ai?.[0] || null, evidence: source ? 'utm_source' : referrerHost ? 'referrer_host' : 'unavailable', source, medium, referrerHost, campaign: text(body.utm_campaign, 100), landingPage: text(body.landing_page, 240), pagePath: text(body.page_path, 160), gaClientId: text(body.ga_client_id, 60) };
}
export function normalize(body, request) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('Please fill in all required fields.');
  for (const [field, max] of Object.entries({ name: 160, email: 254, phone: 60, inquiryType: 120, message: 6000 })) {
    if (body[field] != null && typeof body[field] !== 'string') throw Error('Please submit valid form fields.');
    if (typeof body[field] === 'string' && body[field].trim().length > max) throw Error(`Please shorten the ${field === 'inquiryType' ? 'inquiry type' : field} or call (850) 266-5005.`);
  }
  const name = text(body.name, 160).replace(/\s+/g, ' '), email = text(body.email, 254).toLowerCase(), message = text(body.message, 6000);
  if (!name || !email || !message) throw Error('Name, email and message are required.');
  if (!/^[^\s<>"@]+@[^\s<>"@]+\.[^\s<>"@]+$/.test(email)) throw Error('Please enter a valid email address.');
  const inquiryType = text(body.inquiryType, 120) || 'General Question';
  return { name, email, phone: text(body.phone, 60), inquiryType, message, stage: stages[inquiryType] || (/download|checklist|guide/i.test(inquiryType) ? 'Lead' : 'Prospect'), attribution: attribution(body, request) };
}
export async function fingerprint(inquiry) {
  const value = JSON.stringify([inquiry.attribution.site, inquiry.name, inquiry.email, inquiry.phone, inquiry.inquiryType, inquiry.message]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function fubPayload(record) {
  const p = record.inquiry, a = p.attribution;
  const tags = [a.siteSource, p.inquiryType, 'discovery:' + a.channel];
  if (a.platform) tags.push('AI: ' + a.platform);
  if (a.source) tags.push((a.fubSource === 'Social' ? 'Social: ' : 'utm:') + a.source.slice(0, 40));
  const parts = [`Website receipt: ${record.id}`, `Site: ${a.site}`, `Discovery: ${a.channel}`, a.platform && `AI referral: ${a.platform} (${a.evidence})`, a.pagePath && `Page: ${a.pagePath}`, a.landingPage && `Landing: ${a.landingPage}`, a.referrerHost && `Referrer host: ${a.referrerHost}`, a.source && `UTM source: ${a.source}`, a.medium && `UTM medium: ${a.medium}`, a.campaign && `Campaign: ${a.campaign}`, a.gaClientId && `GA client id: ${a.gaClientId}`].filter(Boolean);
  return { source: a.fubSource, type: 'Registration', person: { firstName: p.name.split(' ')[0], lastName: p.name.split(' ').slice(1).join(' '), emails: [{ value: p.email }], phones: p.phone ? [{ value: p.phone }] : [], tags, stage: p.stage, assignedTo: 1 }, description: p.message + '\n\n[Attribution] ' + parts.join(' | ') };
}
