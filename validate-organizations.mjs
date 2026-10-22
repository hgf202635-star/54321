// Validate a JSON array before human review/import. This script does not publish or verify records.
import {readFile} from 'node:fs/promises';
const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/validate-organizations.mjs organizations.json'); process.exit(2); }
let rows;
try { rows = JSON.parse(await readFile(file, 'utf8')); } catch (e) { console.error(`Invalid JSON: ${e.message}`); process.exit(1); }
if (!Array.isArray(rows)) { console.error('Expected a JSON array'); process.exit(1); }
const seen = new Set(); let failed = false;
for (const [i, row] of rows.entries()) {
  const errors = [];
  for (const key of ['name','slug','description','category','region','website']) if (typeof row[key] !== 'string' || !row[key].trim()) errors.push(`${key} is required`);
  if (row.website) { try { const u = new URL(row.website); if (!['https:','http:'].includes(u.protocol)) errors.push('website must use http(s)'); } catch { errors.push('website URL is invalid'); } }
  if (row.slug && seen.has(row.slug)) errors.push('duplicate slug');
  if (row.slug) seen.add(row.slug);
  if (row.verification_status === 'verified' && (!row.sources?.length || !row.last_reviewed_at)) errors.push('verified records require source evidence and last_reviewed_at');
  if (errors.length) { failed = true; console.error(`Row ${i + 1}: ${errors.join('; ')}`); }
}
if (failed) process.exit(1);
console.log(`Validated ${rows.length} rows structurally. This is not source verification or publication approval.`);
