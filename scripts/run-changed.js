#!/usr/bin/env node
/* Run a command (lint or test) only on changed workspaces compared to origin/main. */

const { execSync } = require('node:child_process');

function sh(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}

const mode = process.argv[2];
if (!['lint', 'test'].includes(mode)) {
  console.error('Usage: node scripts/run-changed.js <lint|test>');
  process.exit(2);
}

// Fallback if no git remote
let base = 'origin/main';
try {
  sh('git fetch origin main --depth=1');
} catch {
  /* ignore */
}
try {
  sh('git rev-parse --verify origin/main');
} catch {
  base = 'HEAD~1';
}

let changed = [];
try {
  const diff = sh(`git diff --name-only ${base}...HEAD`);
  changed = diff.split(/\r?\n/).filter(Boolean);
} catch {
  /* ignore */
}

// Map changed files to package roots (packages/<name>/). Always include root if config/test infra touched.
const pkgs = new Set();
const rootAffect = [/^package\.json$/, /^pnpm-lock\.yaml$/, /^turbo\.json$/, /^eslint\.config/, /^jest/];
const isRootAffected = changed.some(f => rootAffect.some(r => r.test(f)));

if (isRootAffected || changed.length === 0) {
  // run across all if unknown
  try {
    const ls = sh('ls packages');
    ls.split(/\r?\n/).filter(Boolean).forEach(n => pkgs.add(n));
  } catch {
    /* ignore */
  }
} else {
  for (const f of changed) {
    const m = f.match(/^packages\/([^/]+)\//);
    if (m) pkgs.add(m[1]);
  }
}

if (pkgs.size === 0) {
  console.log('[changed] no specific package detected; defaulting to root');
}

function run(cmd) {
  console.log('[changed] exec:', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

if (mode === 'lint') {
  run('pnpm lint');
} else if (mode === 'test') {
  if (pkgs.size === 0) {
    run('pnpm test --passWithNoTests');
  } else {
    // Use turbo to filter tests
    const filters = Array.from(pkgs)
      .map(p => `--filter=@zana/${p}`)
      .join(' ');
    run(`turbo run test ${filters}`);
  }
}
