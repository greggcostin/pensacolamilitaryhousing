// Military context supplements the shared evidence gate; it does not decide benefits.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, strip } from './blog-lib.mjs';
import { validateEditorial } from './blog-editorial-lib.mjs';

export const MILITARY_AUDIENCES = ['active-duty', 'student', 'veteran', 'guard-reserve', 'surviving-spouse', 'military-seller', 'military-landlord'];
export const MILITARY_TOPICS = ['bah', 'va-loans', 'pcs-orders', 'training-housing', 'ownership-costs', 'sell-or-rent', 'local-market'];
const plain = text => strip(text || '').replace(/\s+/g, ' ').trim();
const official = (source, domains) => {
  try { const host = new URL(source.url).hostname; return source.primary === true && domains.some(d => host === d || host.endsWith('.' + d)); }
  catch { return false; }
};

// Compare a declared rate to the locally archived official data, never a blog's
// old numbers. A missing archive is an explicit blocker, not a fallback to memory.
export function bahRateFindings(rate, root = ROOT) {
  const errors = [];
  if (!rate || !Number.isInteger(rate.year) || !['FL064', 'FL056'].includes(rate.mha) || !/^(?:E-[1-9]|W-[1-5]|O-(?:[1-9]|10|[1-3]E))$/.test(rate.grade || '') || !['withDependents', 'withoutDependents'].includes(rate.dependency) || !Number.isFinite(rate.monthly)) return ['BAH: declare year, FL064/FL056, pay grade, dependency status and monthly rate'];
  const dataFile = join(root, `content/client-guides/bah-${rate.year}.json`);
  const archive = join(root, `content/client-guides/research/BAH-ASCII-${rate.year}.zip`);
  if (!existsSync(dataFile) || !existsSync(archive)) return ['BAH: official data or archive unavailable; integrate the source-reviewed BAH files and run verify-bah-source.mjs before using rates'];
  try {
    const data = JSON.parse(readFileSync(dataFile, 'utf8'));
    const hash = createHash('sha256').update(readFileSync(archive)).digest('hex');
    if (data.year !== rate.year || !official({primary:true,url:data.source}, ['travel.dod.mil']) || hash !== data.sourceSha256) errors.push('BAH: archive provenance or year does not match');
    if (data.areas?.[rate.mha]?.rates?.[rate.grade]?.[rate.dependency] !== rate.monthly) errors.push('BAH: monthly figure differs from the official rate record');
  } catch { errors.push('BAH: unreadable official source record'); }
  return errors;
}

export function validateMilitaryEditorial(spec, body, research, options = {}) {
  const result = validateEditorial(spec, body, research, {...options, site:'pmh'});
  if (!research || research.version !== 2) return result;
  const { errors } = result;
  const m = research.military;
  if (!m || !MILITARY_AUDIENCES.includes(m.audience) || !m.readerSituation || !m.dutyLocations?.length || !m.limitations?.length || !m.topics?.length || m.topics.some(t => !MILITARY_TOPICS.includes(t))) errors.push('military: define audience status, reader situation, duty locations, applicable topics and limitations');
  const passages = [spec.quickAnswer, spec.lead, body, ...(spec.faq || spec.faqs || []).map(f => f.a)];
  const combined = plain(passages.join(' '));
  const sources = new Map((research.sources || []).map(s => [s.id, s]));
  const claims = new Map((research.claims || []).map(c => [c.id, c]));
  // These are the actual paragraphs or FAQ answers that a reader can quote.
  const questionAnswers = new Map([...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(x => [plain(x[1]), plain(x[2])]));
  for (const f of spec.faq || spec.faqs || []) questionAnswers.set(plain(f.q), plain(f.a));
  if (!research.quickAnswerClaimIds?.length || research.quickAnswerClaimIds.some(id => !claims.has(id) || !plain(spec.quickAnswer).includes(plain(claims.get(id).text)))) errors.push('answers: quickAnswer must restate a registered claim and declare its claim id');
  const answers = research.answerPassages || [];
  if (answers.length < 2) errors.push('answers: register two useful question-and-answer passages with their supporting claim ids');
  for (const a of answers) {
    if (questionAnswers.get(plain(a.question)) !== plain(a.answer) || !a.claimIds?.length || a.claimIds.some(id => !claims.has(id)) || !a.scope || !a.caveat) errors.push('answers: question, its opening answer paragraph, supporting claims, scope and caveat are required');
    if (a.caveat && !plain(a.answer).includes(plain(a.caveat))) errors.push('answers: keep the important caveat in the answer itself');
    // A citation cannot be attached to a completely unrelated paragraph.
    if (a.claimIds?.some(id => claims.has(id) && !plain(a.answer).includes(plain(claims.get(id).text)))) errors.push('answers: supporting claim must occur in its registered answer');
  }
  for (const c of claims.values()) {
    if (c.kind !== 'fact') continue;
    const text = plain(c.text);
    const refs = (c.sourceIds || []).map(id => sources.get(id)).filter(Boolean);
    const bah = /\bBAH\b|basic allowance for housing/i.test(text);
    const va = /\bVA (?:loan|purchase|funding|entitlement|occupancy)|certificate of eligibility|\bCOE\b/i.test(text);
    const orders = /\bJTR\b|\b(?:PCS|PCA) (?:orders|entitlement|allowance|reimbursement)|\bTLE\b|\bDLA\b/i.test(text);
    if (bah && !refs.some(s => official(s, ['travel.dod.mil','defense.gov','dfas.mil']))) errors.push(`military claim ${c.id}: BAH rules require an official DoD/DFAS source`);
    if (va && !refs.some(s => official(s, ['va.gov']))) errors.push(`military claim ${c.id}: VA benefit rules require an official VA source`);
    if (orders && !refs.some(s => official(s, ['travel.dod.mil','militaryonesource.mil','defense.gov']))) errors.push(`military claim ${c.id}: moving entitlements require current official guidance`);
    if ((bah || va || orders) && (!c.appliesTo || !c.limitations)) errors.push(`military claim ${c.id}: state who qualifies and what can change the answer`);
    if (bah && /\$\s*[\d,]+|\bFL0\d\d\b/i.test(text) && !c.bahRate) errors.push(`military claim ${c.id}: dollar BAH claims require a structured bahRate record`);
    if (c.bahRate) errors.push(...bahRateFindings(c.bahRate, options.root || ROOT).map(e => `claim ${c.id}: ${e}`));
  }
  if (/\bFL023\b/i.test(combined)) errors.push('military: FL023 is not the Eglin/Hurlburt/Duke MHA; check official source mapping');
  if (m?.topics?.includes('bah')) {
    if (!/\bLES\b|leave and earnings statement/i.test(combined)) errors.push('military: BAH budgets must direct readers to their actual LES/entitlement');
    if (!/\bnot (?:a |an )?(?:loan approval|approval|home.price limit)|does not (?:determine|guarantee) (?:approval|affordability)/i.test(combined)) errors.push('military: explain that a BAH budget is not loan approval or a home-price limit');
  }
  if (m?.audience === 'student' && !/\borders\b/i.test(combined)) errors.push('military: student housing advice must account for actual orders and student status');
  if (m?.topics?.includes('sell-or-rent') && (!/\bvacan/i.test(combined) || !/\b(?:reserves?|maintenance)\b/i.test(combined))) errors.push('military: a rental exit plan must consider vacancy and reserves/maintenance');
  return result;
}
