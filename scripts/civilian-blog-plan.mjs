import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runPlan } from './blog-plan-lib.mjs';
export * from './blog-plan-lib.mjs';
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) runPlan('gc');
