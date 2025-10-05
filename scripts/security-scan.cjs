#!/usr/bin/env node
/*
Composite security scan with severity gating.
Currently integrates:
 1. SBOM generation (scripts/generate-sbom.cjs)
 2. License check (scripts/check-licenses.cjs)
 3. pnpm audit vulnerability scan (soft if unavailable)
 4. OSV scanner (if installed or accessible via npx)

Threshold logic:
  --fail-on <severity>  (one of: low, moderate, high, critical, none)
Other flags:
  --refresh            Force SBOM regeneration (bypass cache)
  --summary json       Emit combined security-summary.json
If omitted defaults to 'high'. Any vulnerability at or above threshold exits non-zero.

Rationale: Some CI noise (npm ls / dev-only meta deps) should not fail builds.
You can extend this script later to parse OSV or Trivy results and merge severities.
*/

const { spawnSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');

const severities = ['low','moderate','high','critical'];
function severityRank(s){ const i = severities.indexOf(String(s).toLowerCase()); return i === -1 ? -1 : i; }

function parseArgs(){
  const args = process.argv.slice(2);
  const conf = { failOn: 'high', refresh: false, summary: null };
  for (let i=0;i<args.length;i++){
    if (args[i] === '--fail-on'){ conf.failOn = args[++i]; }
    else if (args[i] === '--refresh'){ conf.refresh = true; }
    else if (args[i] === '--summary'){ conf.summary = args[++i]; }
  }
  if (conf.failOn === 'none') conf.failOn = null;
  if (conf.failOn && severityRank(conf.failOn) === -1){
    console.error('[security] invalid --fail-on value');
    process.exit(2);
  }
  return conf;
}

function runNode(script, extraArgs=[]){
  const res = spawnSync(process.execPath, [script, ...extraArgs], { stdio: 'inherit' });
  if (res.status !== 0){
    console.error('[security] sub-step failed:', script);
    process.exit(res.status || 1);
  }
}

function runAudit(){
  // Attempt pnpm audit --json; tolerate failures (network/offline) but collect vulnerabilities when present.
  try {
    const res = spawnSync('pnpm', ['audit','--json'], { encoding: 'utf8' });
    if (res.status !== 0 && !res.stdout) { console.warn('[security] pnpm audit failed (non-critical)'); return []; }
    const data = JSON.parse(res.stdout || '[]');
    // pnpm audit json shape: array of advisories OR object (version-dependent). We'll normalize.
    const vulns = [];
    if (Array.isArray(data)){
      for (const v of data){ if (v?.advisory) vulns.push(v.advisory); }
    } else if (data?.advisories){
      for (const k of Object.keys(data.advisories)) vulns.push(data.advisories[k]);
    }
    return vulns.map(v => ({
      module: v.module_name || v.module || 'unknown',
      severity: v.severity || v.cvss?.severity || 'unknown',
      title: v.title || v.cwe || v.id || 'advisory'
    }));
  } catch(e){
    console.warn('[security] audit parse skipped:', e.message);
    return [];
  }
}

function runOSV(){
  // Attempt npx osv-scanner in JSON mode; non-fatal on failure.
  try {
    const res = spawnSync('npx', ['--yes','osv-scanner','--format','json','-r','.'], { encoding: 'utf8' });
    if (res.status !== 0 && !res.stdout){ console.warn('[security] OSV scanner failed (non-critical)'); return []; }
    const data = JSON.parse(res.stdout||'{}');
    if (!data.results) return [];
    const vulns = [];
    for (const r of data.results){
      if (!r.packages) continue;
      for (const p of r.packages){
        if (!p.vulnerabilities) continue;
        for (const v of p.vulnerabilities){
          vulns.push({
            source: 'osv',
            module: (p.package?.name)||'unknown',
            severity: (v.severity && v.severity.length ? (v.severity[0].type ? v.severity[0].score ? v.severity[0].score : v.severity[0].type : v.severity[0]) : 'unknown').toString().toLowerCase(),
            id: v.id,
            title: v.summary || v.id
          });
        }
      }
    }
    return vulns;
  } catch(e){
    console.warn('[security] osv scan skipped:', e.message);
    return [];
  }
}

function main(){
  const { failOn, refresh, summary } = parseArgs();
  console.log('[security] starting composite scan (failOn='+ (failOn||'none') +', refresh=' + refresh + ', summary='+(summary||'none')+')');
  const sbomArgs = [];
  if (refresh) sbomArgs.push('--refresh');
  if (summary === 'json') sbomArgs.push('--summary','json');
  runNode('scripts/generate-sbom.cjs', sbomArgs);
  runNode('scripts/check-licenses.cjs');
  const auditV = runAudit().map(v=>({ ...v, source:'pnpm-audit' }));
  const osvV = runOSV();
  const allV = [...auditV, ...osvV];
  if (!allV.length){
    console.log('[security] no vulnerabilities reported (audit/osv empty)');
    writeCombinedSummary(summary, allV);
    return;
  }
  const thresholdRank = failOn ? severityRank(failOn) : Infinity;
  const failing = [];
  for (const v of allV){
    const rank = severityRank(v.severity);
    if (failOn && rank >= thresholdRank) failing.push(v);
  }
  console.log(`[security] vulnerabilities total=${allV.length} failing=${failing.length}`);
  if (summary === 'json') writeCombinedSummary(summary, allV, failing);
  if (failing.length){
    for (const f of failing.slice(0,25)){
      console.log(` - ${f.source||'src'} ${f.severity}: ${f.module} :: ${f.title}`);
    }
    if (failing.length > 25) console.log(' ... (truncated)');
    process.exit(1);
  }
  console.log('[security] passed severity gate');
}

function writeCombinedSummary(mode, allV, failing=[]){
  if (mode !== 'json') return;
  const summary = {
    generatedAt: new Date().toISOString(),
    totalVulnerabilities: allV.length,
    failing: failing.length,
    bySource: allV.reduce((acc,v)=>{ acc[v.source]=(acc[v.source]||0)+1; return acc; },{}),
    severities: allV.reduce((acc,v)=>{ const s=v.severity||'unknown'; acc[s]=(acc[s]||0)+1; return acc; },{}),
  };
  try { writeFileSync('security-summary.json', JSON.stringify(summary, null, 2)); console.log('[security] wrote security-summary.json'); } catch(e){ console.warn('[security] failed to write security-summary.json', e.message); }
}

main();
