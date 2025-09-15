#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'locales');

const LOCALES = ['en', 'sw'];
const NAMESPACES = ['common', 'features', 'pricing'];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = true;
    }
  }
  return out;
}

function main() {
  let hasIssues = false;
  const dict = {};
  for (const loc of LOCALES) {
    let merged = {};
    for (const ns of NAMESPACES) {
      const p = path.join(LOCALES_DIR, loc, `${ns}.json`);
      if (!fs.existsSync(p)) {
        console.warn(`[i18n] Missing file: ${loc}/${ns}.json`);
        hasIssues = true;
        continue;
      }
      const json = readJson(p);
      merged = { ...merged, ...json };
    }
    dict[loc] = flatten(merged);
  }

  // Compare keys: every en key should exist in sw; warn extra keys in sw
  const enKeys = Object.keys(dict.en || {});
  const swKeys = Object.keys(dict.sw || {});

  const missingInSw = enKeys.filter((k) => !dict.sw?.[k]);
  const extraInSw = swKeys.filter((k) => !dict.en?.[k]);

  if (missingInSw.length) {
    hasIssues = true;
    console.error(`\n[i18n] Missing keys in sw (${missingInSw.length}):`);
    for (const k of missingInSw) console.error(` - ${k}`);
  }
  if (extraInSw.length) {
    console.warn(`\n[i18n] Extra keys in sw (${extraInSw.length}):`);
    for (const k of extraInSw) console.warn(` - ${k}`);
  }

  if (hasIssues) {
    console.error('\n[i18n] Inconsistencies found.');
    process.exit(1);
  } else {
    console.log('[i18n] All locale keys are consistent.');
  }
}

main();
