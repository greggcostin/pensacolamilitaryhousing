// One deterministic decision packet. No model/API spend, automatic publishing or inferred demand.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, SITES, listFragments } from './blog-lib.mjs';
import { buildCorpus, compareTopic, intentReviewed } from './blog-dedup-check.mjs';
const read = (p, fallback) => existsSync(join(ROOT,p)) ? JSON.parse(readFileSync(join(ROOT,p),'utf8')) : fallback;
const normalized = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;

export function isObservedDemand(e, today, site = 'gc') {
  const start = Date.parse(e?.windowStart), end = Date.parse(e?.windowEnd), current = Date.parse(today);
  return !!(e && e.availability === 'observed' && e.source && e.site === site &&
    ['bing','google','client-questions'].includes(e.engine) && validDay(e.windowStart) && validDay(e.windowEnd) && validDay(today) &&
    start <= end && end <= current && end >= current - 30*86400000 && Number.isFinite(e.count) && e.count > 0);
}

// Exact query matching keeps a large, loosely related term from becoming evidence
// for a different article. Unmatched questions remain visible for editorial review.
export function importDemand(queue, latest, clientQuestions, today, site = 'gc') {
  const observations = [];
  if (latest.site === site && latest.endpointStatus?.queries?.status === 'observed') {
    for (const q of latest.queries || []) {
      const e = { availability:'observed', site:latest.site, engine:latest.engine, source:latest.source,
        sourceReference:`content/measure/latest-${site}.json`, collectedAt:latest.collectedAt,
        windowStart:latest.windowStart, windowEnd:latest.windowEnd, query:q.key,
        count:q.imp28, metric:'observed impressions in the stated window' };
      if (q.seen28 > 0 && isObservedDemand(e,today,site)) observations.push(e);
    }
  }
  // The committed measurement producer also emits a v1 aggregate. Its imp28
  // bin has a defined trailing window; this is positive query evidence only,
  // never proof of complete coverage, measured zeros or a comparable trend.
  if (latest.site === site && !latest.endpointStatus && latest.generated === today &&
      validDay(latest.asOf) && latest.asOf <= today) {
    const windowStart = new Date(Date.parse(latest.asOf)-27*86400000).toISOString().slice(0,10);
    for (const q of latest.queries || []) {
      const e = {availability:'observed',site,engine:'bing',source:'bing-api',
        sourceReference:`content/measure/latest-${site}.json (blog-measure.mjs v1 aggregate)`,
        windowStart,windowEnd:latest.asOf,query:q.key,count:q.imp28,
        metric:'positive query impressions in the producer-defined trailing bin',
        coverage:'returned rows only; collection timestamp and completeness unavailable'};
      if (q.last >= windowStart && q.last <= latest.asOf && isObservedDemand(e,today,site)) observations.push(e);
    }
  }
  for (const q of clientQuestions.questions || []) {
    const e = { availability:'observed', site:q.site, engine:'client-questions', source:q.sourceReference,
      sourceReference:'content/measure/client-questions.json', windowStart:q.observedFrom,
      windowEnd:q.observedThrough, query:q.question, count:q.count, metric:'documented recurring questions' };
    if (q.verified === true && isObservedDemand(e,today,site)) observations.push(e);
  }
  const mapped = new Set();
  const enriched = queue.map(item => {
    const phrases = new Set((item.targetKeywords || []).map(normalized));
    const matches = observations.filter(e=>phrases.has(normalized(e.query)));
    matches.forEach(e=>mapped.add(e));
    const evidence = [...(isObservedDemand(item.demandEvidence,today,site)?[item.demandEvidence]:[]),...matches];
    return evidence.length ? {...item,demandEvidence:evidence[0],demandMatches:evidence} : {...item};
  });
  return {queue:enriched,demandReview:observations.filter(e=>!mapped.has(e)).map(e=>({...e,requiresEditorialReview:true}))};
}

export function selectWork({ queue, refreshes, events = [], recentPillars = [], corpus, today, site = 'gc' }) {
  const ranked = queue.map((item, index) => {
    const ownership = compareTopic(item, corpus, { excludeUrl: item.refreshUrl });
    const e = item.demandEvidence;
    const observed = isObservedDemand(e,today,site);
    const covered = recentPillars.filter(p => p === item.pillar).length;
    const reasons = [];
    if (site === 'pmh' && /\bFL023\b/.test(JSON.stringify([item.evidence, item.note, item.researchRisks]))) reasons.push('old Eglin MHA in topic evidence; re-verify sources before research');
    if (item.audience === 'civilian' && site === 'pmh') reasons.push('civilian topic: route to the civilian engine');
    if (item.status === 'hold' || item.requiresEditorialReview) reasons.push('editorial/source review required');
    if (item.notBefore && item.notBefore > today) reasons.push(`not runnable before ${item.notBefore}`);
    if (item.sourceGate) {
      const proof = item.gateEvidence;
      let source;
      try { source = new URL(proof?.primarySource); } catch {}
      const recorded = proof?.status === 'verified' && validDay(proof.checkedAt) && proof.checkedAt <= today && source?.protocol === 'https:' && proof.finding;
      const annual = item.sourceGate.kind === 'official-bah-release';
      if (!recorded || (annual && (proof.year !== item.sourceGate.year || !/(^|\.)travel\.dod\.mil$/.test(source.hostname))) || (!annual && proof.periodEnd !== item.sourceGate.periodEnd)) reasons.push('source gate: verify the released official data and record the matching year or completed period');
    }
    if (item.type === 'current-events') reasons.push('requires a verified event');
    if (item.gate && !item.notBefore && !item.gateSatisfiedAt) reasons.push('explicit queue gate requires evidence');
    if (item.refreshUrl && !corpus.some(p=>p.url===item.refreshUrl)) reasons.push('refresh destination absent from this checkout; integrate the existing guide before refreshing it');
    if (ownership.verdict === 'INTENT-REVIEW' && !intentReviewed(item,ownership)) reasons.push('existing owner: select a scoped refresh or document distinct intent');
    const priority = (observed ? 1000 : 0) + Math.max(0, 5-covered)*10 - index/100;
    return { ...item, observedDemand: observed, coverageCount: covered, priority, runnable: !reasons.length, reasons, ownership };
  }).sort((a,b)=>b.priority-a.priority);
  const event = events.find(e => e.status === 'verified' && e.primarySource && e.checkedAt === today && e.materialImpact && e.ownerUrl && e.date <= today && new Date(e.date).valueOf() >= new Date(today).valueOf()-7*86400000);
  const refresh = [...refreshes].filter(r=>r.site === site && r.priority >= 60).sort((a,b)=>b.priority-a.priority)[0];
  const next = ranked.find(i=>i.runnable);
  const selected = event ? { kind: 'event', item: event } : refresh ? { kind: 'refresh', item: refresh } : next ? { kind: next.refreshUrl ? 'queued-refresh' : next.observedDemand ? 'observed-demand' : 'editorial-queue', item: next } : null;
  return { selected, ranked };
}
export function applyTopicPolicy(queue, policy, site) {
  return queue.map(item=>({...item,...(policy.topicGates?.[item.slug] || {}),
    pillar:item.pillar || policy.topicPillars?.[item.slug],
    refreshUrl:item.refreshUrl || (item.intentOwner ? new URL(item.intentOwner,SITES[site].origin).href : undefined)}));
}
export function runPlan(site = 'gc') {
  if (!SITES[site]) throw new Error('Unknown planner site: ' + site);
  const today = new Date().toISOString().slice(0,10);
  const content = SITES[site].contentDir;
  const policy=read(content + '/editorial-policy.json',{});
  const posts=listFragments(site);
  const recentPosts=posts.sort((a,b)=>(b.spec.dateModified||b.spec.datePublished).localeCompare(a.spec.dateModified||a.spec.datePublished)).slice(0,policy.coverageWindow||12);
  const recentPillars=recentPosts.map(p=>read(`${content}/research/${p.slug}.json`,{}).pillar || policy.legacyPillars?.[p.slug]).filter(Boolean);
  const queue=applyTopicPolicy(read(SITES[site].queue,{queue:[]}).queue,policy,site);
  const demand=importDemand(queue,read(`content/measure/latest-${site}.json`,{}),read('content/measure/client-questions.json',{}),today,site);
  const result=selectWork({site,today,queue:demand.queue,refreshes:read('content/blog/refresh-queue.json',{queue:[]}).queue,events:read(content + '/news-radar.json',{events:[]}).events,recentPillars,corpus:buildCorpus()});
  const measurement=read(`content/measure/opportunities-${site}.json`,{});
  const compact = item => item?.ownership ? {...item,ownership:{...item.ownership,hits:item.ownership.hits.map(({head,file,...hit})=>({...hit,file:file?.replaceAll('\\','/').replace(ROOT,'')}))}} : item;
  const packet={generated:today,site,purpose:'Editorial selection, not search-volume or ranking prediction',
    measurement:{generated:measurement.generated,collectedAt:measurement.collectedAt,windowStart:measurement.windowStart,windowEnd:measurement.windowEnd,reportedTrafficDays:measurement.reportedTrafficDays,endpointStatus:measurement.endpointStatus,site28:measurement.site28,note:'This planner reads existing records. A fresh plan is not a fresh measurement. Missing rows, citations and conversions remain unknown.'},
    demandReview:demand.demandReview,coverage:(policy.pillars||[]).map(p=>({pillar:p.id,recent:recentPillars.filter(id=>id===p.id).length})),ranked:result.ranked.map(compact),selected:result.selected ? {...result.selected,item:compact(result.selected.item)} : null};
  mkdirSync(join(ROOT,content,'reports'),{recursive:true});
  writeFileSync(join(ROOT,content,'reports/plan-latest.json'),JSON.stringify(packet,null,2)+'\n');
  console.log(JSON.stringify({site,selected:result.selected ? {kind:result.selected.kind,slug:result.selected.item.slug,url:result.selected.item.url} : null,runnable:result.ranked.filter(r=>r.runnable).length,held:result.ranked.filter(r=>!r.runnable).map(r=>({slug:r.slug,reasons:r.reasons})),coverage:packet.coverage},null,2));
  return packet;
}
