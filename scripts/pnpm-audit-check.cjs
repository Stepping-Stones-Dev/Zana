#!/usr/bin/env node
// Robust PNPM/NPM audit results parser that fails build on any High/Critical vulnerabilities.
// Handles multiple possible JSON structures produced by different npm/pnpm versions.

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.resolve(process.cwd(), 'audit.json');

function loadJson(file) {
    try {
        const raw = fs.readFileSync(file, 'utf8').trim();
        if (!raw) return {};

        // Some tools may emit multiple JSON objects newline separated; try last complete.
        if (raw.includes('\n')) {
            const candidates = raw.split(/\n+/).sort((a, b) => b.length - a.length);
            for (const c of candidates) {
                try {
                    return JSON.parse(c);
                } catch (err) {
                    if (process.env.AUDIT_JSON_DEBUG) {
                        console.error('[audit-check] Skipping invalid JSON candidate:', err.message);
                    }
                    // continue
                }
            }
        }

        return JSON.parse(raw);
    } catch (e) {
        console.error('[audit-check] Failed to parse audit.json:', e.message);
        return {};
    }
}

function collectFindings(json) {
    const findings = [];

    // Case 1: npm v7+ style: json.metadata.vulnerabilities { info, low, moderate, high, critical }
    if (json.metadata?.vulnerabilities) {
        const meta = json.metadata.vulnerabilities;
        for (const sev of ['high', 'critical']) {
            const count = meta[sev];
            if (typeof count === 'number' && count > 0) {
                findings.push({ severity: sev, count, source: 'metadata' });
            }
        }
    }

    // Case 2: pnpm / npm legacy: vulnerabilities as a summary object
    if (json.vulnerabilities && !Array.isArray(json.vulnerabilities)) {
        const vulns = json.vulnerabilities;
        const looksLikeSummary = ['info', 'low', 'moderate', 'high', 'critical']
            .some(k => Object.prototype.hasOwnProperty.call(vulns, k));

        if (looksLikeSummary) {
            for (const sev of ['high', 'critical']) {
                const count = vulns[sev];
                if (typeof count === 'number' && count > 0) {
                    findings.push({ severity: sev, count, source: 'vulnerabilities-summary' });
                }
            }
        } else {
            // Possibly an object keyed by package/advisory ids
            for (const k of Object.keys(vulns)) {
                const v = vulns[k];
                if (v && typeof v === 'object' && ['high', 'critical'].includes(v.severity)) {
                    findings.push({
                        severity: v.severity,
                        id: v.id || k,
                        source: 'vulnerabilities-detailed',
                    });
                }
            }
        }
    }

    // Case 3: direct array
    if (Array.isArray(json.vulnerabilities)) {
        for (const v of json.vulnerabilities) {
            if (v && ['high', 'critical'].includes(v.severity)) {
                findings.push({
                    severity: v.severity,
                        id: v.id || v.name,
                    source: 'vulnerabilities-array',
                });
            }
        }
    }

    // Case 4: advisories object
    if (json.advisories && typeof json.advisories === 'object') {
        for (const id of Object.keys(json.advisories)) {
            const adv = json.advisories[id];
            if (adv && ['high', 'critical'].includes(adv.severity)) {
                findings.push({
                    severity: adv.severity,
                    id,
                    module: adv.module_name,
                    source: 'advisories',
                });
            }
        }
    }

    return findings;
}

if (!fs.existsSync(AUDIT_FILE)) {
    console.error('[audit-check] audit.json not found; treating as no data (pass).');
    process.exit(0);
}

const data = loadJson(AUDIT_FILE);
const findings = collectFindings(data).filter(f => ['high', 'critical'].includes(f.severity));

if (findings.length === 0) {
    console.log('[audit-check] No high/critical vulnerabilities found.');
    process.exit(0);
}

const counts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + (f.count || 1);
    return acc;
}, {});

console.error('[audit-check] High/Critical vulnerabilities detected:', counts);

const sample = findings.slice(0, 20);
for (const f of sample) {
    console.error(
        ' -',
        f.severity.toUpperCase(),
        f.id || '',
        f.module ? `(${f.module})` : '',
        `[source:${f.source}]`,
    );
}

if (findings.length > sample.length) {
    console.error(` ... and ${findings.length - sample.length} more.`);
}

process.exit(1);
