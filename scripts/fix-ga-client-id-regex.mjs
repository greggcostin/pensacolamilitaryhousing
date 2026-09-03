// analytics-02 (audit 2026-09-02): the GA4 client-id capture inside every inquiry-form payload
// shipped with its backslashes stripped, as /(?:^|; )_ga=GAd.d.(d+.d+)/, so it never matched a real
// _ga cookie and ga_client_id never reached the contact worker. src/App.jsx already carries the
// correct spelling and must not be touched; only the static HTML on both sites is wrong.
//
// Every backslash below is built from char code 92 and this source contains no backslash literal
// anywhere, because a heredoc or a shell -e eating one is exactly how the defect was introduced.
// Guards abort before any write if the replacement does not capture, if the target is not broken,
// if this file has itself been mangled, or if the blast radius is not what the audit measured.
//
//   node scripts/fix-ga-client-id-regex.mjs --dry
//   node scripts/fix-ga-client-id-regex.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const B = String.fromCharCode(92);
const BAD = "_ga=GAd.d.(d+.d+)";
const GOOD = "_ga=GA" + B + "d" + B + "." + B + "d" + B + ".(" + B + "d+" + B + "." + B + "d+)";
const DRY = process.argv.includes("--dry");
const EXPECT_FILES = 209;
const EXPECT_HITS = 214;

const ROOT = fileURLToPath(new URL("..", import.meta.url)).split(B).join("/");

// Guard 1: the replacement must CAPTURE the client id, not merely match.
const sample = "x; _ga=GA1.1.1234567890.1234567890";
const cap = new RegExp("(?:^|; )" + GOOD).exec(sample);
if (!cap || cap[1] !== "1234567890.1234567890") throw new Error("abort: replacement did not capture the client id; backslashes were mangled");
// Guard 2: the pattern being removed must genuinely be broken.
if (new RegExp("(?:^|; )" + BAD).test(sample)) throw new Error("abort: current pattern unexpectedly matches; wrong target");
// Guard 3: this source must contain no backslash literal.
if (readFileSync(fileURLToPath(import.meta.url), "utf8").includes(B)) throw new Error("abort: this script contains a backslash literal; it may have been mangled");

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = dir + "/" + e.name;
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Collect first, verify the blast radius, then write. Never write on a surprise.
const targets = [];
let hits = 0;
for (const dir of ["public", "civilian-site"]) {
  for (const f of walk(ROOT + dir)) {
    const src = readFileSync(f, "utf8"); // utf8 round-trip preserves CRLF
    const n = src.split(BAD).length - 1;
    if (!n) continue;
    targets.push({ f, src, n });
    hits += n;
  }
}
if (targets.length !== EXPECT_FILES || hits !== EXPECT_HITS) {
  throw new Error(`abort: expected ${EXPECT_HITS} occurrences in ${EXPECT_FILES} files (audit baseline 2026-09-02), found ${hits} in ${targets.length}. Re-measure before running.`);
}
if (!DRY) for (const t of targets) writeFileSync(t.f, t.src.split(BAD).join(GOOD), "utf8");
console.log(`${DRY ? "[dry] " : ""}ga_client_id regex: ${hits} occurrences in ${targets.length} files`);
