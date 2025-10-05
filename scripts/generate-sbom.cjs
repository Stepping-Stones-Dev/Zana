#!/usr/bin/env node
/* Generate a consolidated CycloneDX SBOM with caching, noise suppression, and summaries.
 * Flags:
 *   --refresh          Ignore cache and force regeneration.
 *   --summary json     Emit sbom-summary.json with counts (also prints normal text summary).
 */
const { execSync } = require('node:child_process');
const {
  writeFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync
} = require('node:fs');
const crypto = require('node:crypto');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function hashFile(p) {
  const data = readFileSync(p, 'utf8');
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}

function cacheRoot() {
  const dir = join(process.cwd(), '.sbom-cache');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function cacheKey(name, pkgJson) {
  return name.replace(/[@/]/g, '_') + '-' + hashFile(pkgJson) + '.json';
}

let FORCE_REFRESH = false;
let SUMMARY_MODE = null; // 'json'
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--refresh') FORCE_REFRESH = true;
  else if (a === '--summary') SUMMARY_MODE = process.argv[++i] || null;
}

function loadCache(name, pkgJson) {
  try {
    const f = join(cacheRoot(), cacheKey(name, pkgJson));
    if (!FORCE_REFRESH && existsSync(f)) return loadJson(f);
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(name, pkgJson, report) {
  try {
    writeFileSync(join(cacheRoot(), cacheKey(name, pkgJson)), JSON.stringify(report));
  } catch {
    /* ignore */
  }
}

// Execute a command with filtered stderr lines (mute noisy npm ls). Always return object; never throw.
function run(cmd, cwd) {
  try {
    const out = execSync(cmd, { stdio: 'pipe', cwd });
    return { ok: true, stdout: out.toString(), stderr: '' };
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    const filtered = [];
    let suppressed = 0;
    for (const line of stderr.split(/\r?\n/)) {
      if (!line.trim()) continue;
      if (/^npm (ERR|error)/i.test(line.trim())) {
        suppressed++;
        continue;
      }
      filtered.push(line);
    }
    if (filtered.length)
      console.error('[sbom] command issues (filtered) for', cmd, '\n' + filtered.join('\n'));
    if (suppressed) console.error(`[sbom] suppressed ${suppressed} npm error line(s)`);
    return { ok: false, stdout: e.stdout?.toString() || '', stderr: filtered.join('\n'), error: e };
  }
}

function mergeComponents(reports) {
  const seen = new Map();
  for (const r of reports) {
    for (const c of r.components || []) {
      const key = (c.group || '') + ':' + c.name + ':' + c.version;
      if (!seen.has(key)) seen.set(key, c);
    }
  }
  return Array.from(seen.values());
}

function generateReport(name, dir, cmdBases, tmp) {
  const pkgJson = join(dir, 'package.json');
  const cached = existsSync(pkgJson) ? loadCache(name, pkgJson) : null;
  if (cached) {
    console.log('[sbom] cache hit for', name);
    return cached;
  }
  const outFile = join(tmp, name.replace(/[@/]/g, '_') + '.json');
  const attemptArgs = ['--ignore-npm-errors', ''];
  for (const base of cmdBases) {
    let incompatible = false;
    for (const extra of attemptArgs) {
      const cmd = `${base} --output-format json --output-file ${outFile} ${extra}`.trim();
      const res = run(cmd, dir);
      if (existsSync(outFile)) {
        try {
          const st = statSync(outFile);
          if (st.size === 0) throw new Error('empty');
          const json = loadJson(outFile);
            if (!res.ok) console.warn('[sbom] soft-fail treated as success for', name);
          writeCache(name, pkgJson, json);
          return json;
        } catch {
          /* parse failed; continue attempts */
        }
      }
      // If the stderr indicates pnpm ls option incompatibility, break to next base (fallback to npx)
      if (
        res.stderr &&
        /Unknown option: 'all'|failed to parse npm-ls response|npm-ls exited/i.test(res.stderr)
      ) {
        if (!incompatible)
          console.warn('[sbom] detected pnpm ls incompatibility; switching command base');
        incompatible = true;
        break; // move to next command base
      }
    }
  }
  throw new Error('unable to generate SBOM for ' + name);
}

function deriveSummary(components) {
  const typeCounts = new Map();
  const licenseCounts = new Map();
  for (const c of components) {
    const t = c.type || 'library';
    typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    let licenseIds = [];
    if (Array.isArray(c.licenses)) {
      for (const l of c.licenses) {
        if (l?.license) {
          if (l.license.id) licenseIds.push(l.license.id);
          else if (l.license.name) licenseIds.push(l.license.name);
        } else if (l?.expression) licenseIds.push(l.expression);
      }
    } else if (c.license) {
      if (c.license.id) licenseIds.push(c.license.id);
      else if (c.license.name) licenseIds.push(c.license.name);
    }
    if (!licenseIds.length) licenseIds = ['(unknown)'];
    for (const lid of licenseIds) {
      licenseCounts.set(lid, (licenseCounts.get(lid) || 0) + 1);
    }
  }
  const total = components.length || 1;
  const sortEntries = (map) => Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return {
    totalComponents: total,
    types: sortEntries(typeCounts).map(([k, v]) => ({
      type: k,
      count: v,
      pct: +((v / total) * 100).toFixed(2)
    })),
    licenses: sortEntries(licenseCounts).map(([k, v]) => ({
      license: k,
      count: v,
      pct: +((v / total) * 100).toFixed(2)
    }))
  };
}

function emitSummary(components) {
  const summary = deriveSummary(components);
  const top = (list, key) =>
    list
      .slice(0, 10)
      .map((e) => `${e[key]}:${e.count}(${e.pct}%)`)
      .join(', ');
  console.log('[sbom] summary types:', top(summary.types, 'type'));
  console.log('[sbom] summary top licenses:', top(summary.licenses, 'license'));
  if (SUMMARY_MODE === 'json') {
    try {
      writeFileSync('sbom-summary.json', JSON.stringify(summary, null, 2));
      console.log('[sbom] wrote sbom-summary.json');
    } catch (e) {
      console.warn('[sbom] failed to write sbom-summary.json', e.message);
    }
  }
}

function main() {
  const root = process.cwd();
  const pkgsDir = join(root, 'packages');
  const workspaces = [];
  if (existsSync(pkgsDir)) {
    for (const entry of readdirSync(pkgsDir)) {
      const pj = join(pkgsDir, entry, 'package.json');
      if (existsSync(pj)) workspaces.push(join(pkgsDir, entry));
    }
  }
  const tmp = mkdtempSync(join(tmpdir(), 'sbom-'));
  const reports = [];
  const cmdBasePrimary = 'pnpm dlx @cyclonedx/cyclonedx-npm@1.20.0';
  const cmdBaseFallback = 'npx cyclonedx-npm';
  for (const ws of workspaces) {
    try {
      const report = generateReport(
        require(join(ws, 'package.json')).name,
        ws,
        [cmdBasePrimary, cmdBaseFallback],
        tmp
      );
      reports.push(report);
      console.log('[sbom] generated for', ws);
    } catch (e) {
      console.warn('[sbom] skipping workspace due to error', ws, e.message);
    }
  }
  // root
  try {
    const rootName = require(join(root, 'package.json')).name || 'root';
    const rReport = generateReport(
      rootName === 'zana' ? 'root' : rootName,
      root,
      [cmdBasePrimary, cmdBaseFallback],
      tmp
    );
    reports.push(rReport);
    console.log('[sbom] root scan succeeded');
  } catch (e) {
    console.warn('[sbom] root scan failed', e.message);
  }
  if (!reports.length) {
    console.error('[sbom] no reports generated');
    process.exit(1);
  }
  const base = reports[0];
  base.components = mergeComponents(reports);
  writeFileSync('sbom.json', JSON.stringify(base, null, 2));
  console.log('[sbom] consolidated components:', base.components.length);
  emitSummary(base.components);
  rmSync(tmp, { recursive: true, force: true });
}

main();
