#!/usr/bin/env node
/* Simple license policy check.
   Adjust ALLOWED / REVIEW arrays as policy evolves. */
const { execSync } = require('node:child_process');

const ALLOWED = new Set([
  'MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause','0BSD','CC0-1.0'
]);
const REVIEW = new Set([
  'MPL-2.0','LGPL-2.1','LGPL-3.0'
]);

function main(){
  let json;
  try {
    const out = execSync('npx license-checker --json', { stdio: ['ignore','pipe','inherit']}).toString();
    json = JSON.parse(out);
  } catch (e) {
    console.error('[license-checker] failed to generate list', e.message);
    process.exit(2);
  }
  const violations = [];
  const review = [];
  for (const [pkg, meta] of Object.entries(json)) {
    // ignore root private workspace package reported as UNLICENSED (we validate LICENSE separately)
    if (meta.private && /zana@/.test(pkg)) {
      const licFile = meta.licenseFile || '';
      // heuristic: treat as MIT if file contains phrase
      try {
        if (licFile) {
          const txt = require('node:fs').readFileSync(licFile,'utf8');
          if (/MIT License/i.test(txt)) continue; // effectively MIT
        }
      } catch {/* ignore */}
      continue; // skip policy enforcement on private root
    }
    let lic = meta.licenses;
    if (Array.isArray(lic)) lic = lic.join(' OR ');
    // split composite using OR/AND heuristics
    const parts = String(lic).split(/\s+(?:OR|AND)\s+/i).map(s=>s.replace(/\(|\)/g,''));
    const statuses = parts.map(p => ALLOWED.has(p) ? 'allowed' : REVIEW.has(p) ? 'review' : 'forbidden');
    if (statuses.every(s=>s==='allowed')) continue;
    if (statuses.includes('forbidden')) {
      violations.push({ pkg, license: lic });
      continue;
    }
    review.push({ pkg, license: lic });
  }
  if (review.length) {
    console.warn('[license-checker] review licenses detected');
    for (const r of review) console.warn('  REVIEW', r.pkg, '->', r.license);
  }
  if (violations.length) {
    console.error('[license-checker] forbidden licenses detected');
    for (const v of violations) console.error('  FORBIDDEN', v.pkg, '->', v.license);
    process.exit(1);
  }
  console.log('[license-checker] license policy passed');
}
main();
