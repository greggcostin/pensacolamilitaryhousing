// Record the observed browser interruption without assigning negative results to unrun prompts.
import { readFileSync, writeFileSync } from 'node:fs';
const dir = 'docs/seo-geo-2026-09-06/projects/08-measurement/2026-09-08';
const observations = JSON.parse(readFileSync(`${dir}/ai-observations.json`, 'utf8'));
const record = {
  recordedAt: new Date().toISOString(),
  status: 'browser_session_unavailable',
  completedAtInterruption: observations.completed,
  unrunAtInterruption: observations.unrun,
  target: observations.target,
  observedError: 'Browser Use cannot open https://www.google.com/search in tab 1294953590. Browser reported: net::ERR_INTERNET_DISCONNECTED',
  recoveryObservation: 'The subsequent CUA session no longer contained the benchmark bindings. A fresh surface inventory exposed only Codex In-app Browser (id 1), with no tabs; the prior authenticated Chrome browser was absent.',
  enabledSurfacesAtRecovery: [{ id: '1', name: 'Codex In-app Browser', type: 'iab', tabs: [] }],
  interpretation: 'Collection stopped because the original authenticated browser/session was no longer exposed. This does not mean a provider returned no recommendation. Previously saved responses remain valid scoped observations.',
  resumeRule: 'Restore an authenticated supported browser, document any session/model/location change, then run only the missing surface/prompt/repeat keys with the exact existing prompt. Preserve all saved answers. Do not replace these runs with generic web-search snippets or count an absent answer as a negative recommendation.',
  automaticResumeScheduled: false
};
writeFileSync(`${dir}/collection-interruption.json`, JSON.stringify(record, null, 2) + '\n');
console.log(`Recorded interruption with ${observations.completed} saved and ${observations.unrun} unrun.`);
