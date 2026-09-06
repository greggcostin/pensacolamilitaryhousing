// One reproducible preflight shared by both agents. It plans, never writes articles or publishes.
// --offline uses saved exports. --refresh-suggestions explicitly reruns the trend discovery.
import { execFileSync } from "node:child_process";
import { ROOT } from "./blog-lib.mjs";
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const run = (script, opts = []) => execFileSync(process.execPath, [ROOT + "scripts/" + script, ...opts], { cwd: ROOT, stdio: "inherit" });
run("blog-measure.mjs", offline ? ["--no-api"] : []);
run("ctr-opportunities.mjs", ["--json"]);
run("ctr-opportunities.mjs", ["--site", "gc", "--json"]);
run("topic-miner.mjs", args.includes("--refresh-suggestions") && !offline ? [] : ["--no-suggest", "--no-bing"]);
run("blog-retro.mjs");
run("blog-weekly-plan.mjs");
