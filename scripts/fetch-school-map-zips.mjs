// Census representative ZCTA points for the school finder's local ZIP lookup.
// These are approximate ZIP-area reference points, not address geocodes or
// attendance boundaries. Membership comes from the official county crosswalk.
// node scripts/fetch-school-map-zips.mjs [--check]
// Offline reproduction: --gazetteer path/to/2025_Gaz_zcta_national.zip
//                       --relationships path/to/tab20_zcta520_county20_natl.txt
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const sourceYear = 2025;
const sourceUrl = 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/2025_Gaz_zcta_national.zip';
const relationshipUrl = 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt';
const counties = new Map([
  ['01003', 'Baldwin County'],
  ['12033', 'Escambia County'],
  ['12091', 'Okaloosa County'],
  ['12113', 'Santa Rosa County']
]);
const output = fileURLToPath(new URL('../content/schools/map-zip-centers.json', import.meta.url));
const args = process.argv.slice(2);
const arg = name => { const index = args.indexOf(name); if (index < 0) return null; if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a file path`); return args[index + 1]; };
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

async function source(url, local) {
  if (local) return readFileSync(local);
  const response = await fetch(url, { signal: AbortSignal.timeout(45000), headers: { 'User-Agent': 'CostinSchoolMapData/1.0 (+https://greggcostin.com/contact)' } });
  if (!response.ok) throw new Error(`Census source returned ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

// Read one named entry without extracting archive paths or adding dependencies.
// Gazetteer ZIPs use ordinary stored/deflate entries; unsupported formats fail.
function zipText(archive, wanted) {
  let eocd = -1;
  for (let i = archive.length - 22; i >= Math.max(0, archive.length - 65557); i--) if (archive.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Census Gazetteer ZIP directory is missing');
  if (archive.readUInt16LE(eocd + 4) || archive.readUInt16LE(eocd + 6)) throw new Error('Multi-disk ZIP is unsupported');
  let offset = archive.readUInt32LE(eocd + 16);
  const count = archive.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i++) {
    if (archive.readUInt32LE(offset) !== 0x02014b50) throw new Error('Invalid ZIP directory entry');
    const flags = archive.readUInt16LE(offset + 8);
    const method = archive.readUInt16LE(offset + 10);
    const compressed = archive.readUInt32LE(offset + 20);
    const expanded = archive.readUInt32LE(offset + 24);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    if (name === wanted) {
      if (flags & 1 || expanded > 16 * 1024 * 1024 || ![0,8].includes(method)) throw new Error('Unsupported or unexpectedly large Gazetteer entry');
      if (archive.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('Invalid ZIP local entry');
      const start = localOffset + 30 + archive.readUInt16LE(localOffset + 26) + archive.readUInt16LE(localOffset + 28);
      if (start + compressed > archive.length) throw new Error('Truncated Gazetteer ZIP');
      const data = archive.subarray(start, start + compressed);
      const result = method === 0 ? data : inflateRawSync(data, { maxOutputLength: 16 * 1024 * 1024 });
      if (result.length !== expanded) throw new Error('Gazetteer entry length mismatch');
      return result.toString('utf8');
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`ZIP does not contain ${wanted}`);
}

function table(text, required) {
  const lines = text.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
  const columns = lines.shift().split('|').map(s => s.trim());
  for (const name of required) if (!columns.includes(name)) throw new Error(`Census table is missing ${name}`);
  return lines.filter(Boolean).map(line => {
    const values = line.split('|').map(s => s.trim());
    if (values.length !== columns.length) throw new Error('Unexpected Census row column count');
    return Object.fromEntries(columns.map((name, i) => [name, values[i]]));
  });
}

const [archive, relationshipBytes] = await Promise.all([
  source(sourceUrl, arg('--gazetteer')),
  source(relationshipUrl, arg('--relationships'))
]);
const relationships = table(relationshipBytes.toString('utf8'), ['GEOID_ZCTA5_20','GEOID_COUNTY_20','NAMELSAD_COUNTY_20','AREALAND_PART']);
const selected = new Set();
const counts = Object.fromEntries([...counties].map(([fips, name]) => [fips, { name, zctas: 0 }]));
for (const row of relationships) {
  const county = row.GEOID_COUNTY_20;
  if (!counties.has(county)) continue;
  if (row.NAMELSAD_COUNTY_20 !== counties.get(county)) throw new Error(`County name does not match expected FIPS ${county}`);
  if (!/^\d{5}$/.test(row.GEOID_ZCTA5_20) || Number(row.AREALAND_PART) <= 0) continue;
  selected.add(row.GEOID_ZCTA5_20);
  counts[county].zctas++;
}
for (const [fips, summary] of Object.entries(counts)) if (!summary.zctas) throw new Error(`No ZCTAs found for ${fips}`);
const gazetteer = table(zipText(archive, '2025_Gaz_zcta_national.txt'), ['GEOID','INTPTLAT','INTPTLONG']);
const points = gazetteer.filter(row => selected.has(row.GEOID)).map(row => {
  const lat = Number(row.INTPTLAT), lng = Number(row.INTPTLONG);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 29 || lat > 32 || lng < -89 || lng > -85) throw new Error(`Invalid regional point for ${row.GEOID}`);
  return { zip: row.GEOID, lat, lng, sourceUrl, sourceYear };
}).sort((a,b) => a.zip.localeCompare(b.zip));
if (points.length !== selected.size || new Set(points.map(p => p.zip)).size !== selected.size) throw new Error('Missing or duplicated Gazetteer point for a selected county ZCTA');
const encoded = JSON.stringify(points, null, 2) + '\n';
if (args.includes('--check')) {
  if (readFileSync(output, 'utf8').replaceAll('\r\n','\n') !== encoded) throw new Error('Committed ZIP centers differ from the official source join');
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, encoded);
}
console.log(JSON.stringify({ mode: args.includes('--check') ? 'verified' : 'written', points: points.length, output, counties: counts, sourceYear, relationshipYear: 2020, sourceUrl, relationshipUrl, gazetteerSha256: sha256(archive), relationshipSha256: sha256(relationshipBytes) }, null, 2));
