// A source-reviewed financial guide must not be rebuilt from a legacy blog fragment.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './blog-lib.mjs';

export async function assertFragmentOwnership(slugs, root = ROOT) {
  const manifest = join(root, 'content/geo/financial-guide-data.mjs');
  if (!existsSync(manifest)) return;
  const { FINANCIAL_GUIDES } = await import(pathToFileURL(manifest).href);
  const owned = slugs.filter(slug => Object.hasOwn(FINANCIAL_GUIDES || {}, 'blog/' + slug));
  if (owned.length) throw new Error('Source-reviewed financial guide ownership: ' + owned.join(', ') + '. Use content/geo/financial-guide-data.mjs and scripts/financial-guide-lib.mjs, with their source checks. Do not regenerate these pages from legacy blog fragments.');
}
