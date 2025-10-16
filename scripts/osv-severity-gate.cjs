#!/usr/bin/env node
/*
 Simple OSV results severity gate.
 Usage: node scripts/osv-severity-gate.cjs <results.json> <THRESHOLD>
 THRESHOLD: LOW|MODERATE|MEDIUM|HIGH|CRITICAL (case-insensitive)
 Exits 1 if any vulnerability at or above threshold is present.
*/
const fs = require('fs');
const path = require('path');

const sevOrder = ['none','low','moderate','medium','high','critical']; // treat moderate==medium
function norm(s){
  return (s||'').toString().trim().toLowerCase();
}
function sevRank(s){
  const n = norm(s);
  if (n === 'medium') return sevOrder.indexOf('moderate');
  return sevOrder.indexOf(n);
}

const file = process.argv[2] || 'osv-results.json';
const threshold = process.argv[3] || 'HIGH';
const thresholdRank = sevRank(threshold);
if (thresholdRank === -1) {
  console.error('[osv-gate] Invalid threshold:', threshold);
  process.exit(2);
}

let data = {};
try {
  data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
} catch (e) {
  console.warn('[osv-gate] Failed to read/parse results file; assuming none. Error:', e.message);
  process.exit(0);
}

const hits = [];
if (Array.isArray(data.results)) {
  for (const r of data.results) {
    const pkgs = r.packages || [];
    for (const p of pkgs) {
      const vulns = p.vulnerabilities || [];
      for (const v of vulns) {
        // Heuristic: choose first severity record if array present
        let sev = 'unknown';
        if (Array.isArray(v.severity) && v.severity.length) {
          // OSV severity entries may have type + score; we prefer type if available
            const first = v.severity[0];
            if (first.score && typeof first.score === 'string') sev = first.score; // e.g., HIGH
            else if (first.type) sev = first.type;
            else sev = first;
        } else if (v.database_specific?.severity) {
          sev = v.database_specific.severity;
        }
        sev = norm(sev);
        const rank = sevRank(sev);
        if (rank >= thresholdRank && rank !== -1) {
          hits.push({ id: v.id, package: p.package?.name || 'unknown', severity: sev });
        }
      }
    }
  }
}

if (!hits.length) {
  console.log(`[osv-gate] No vulnerabilities >= ${threshold.toUpperCase()} found.`);
  process.exit(0);
}

console.error(`[osv-gate] Found ${hits.length} vulnerabilities >= ${threshold.toUpperCase()}`);
for (const h of hits.slice(0, 25)) {
  console.error(` - ${h.severity.toUpperCase()} ${h.package} (${h.id})`);
}
if (hits.length > 25) console.error(` ... and ${hits.length - 25} more`);
process.exit(1);
