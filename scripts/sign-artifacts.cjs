#!/usr/bin/env node
/* Sign SBOM (and optionally container images) using cosign.
 * Requires cosign installed or available via npx. In CI, set COSIGN_EXPERIMENTAL=1 for keyless mode (OIDC).
 * Usage: node scripts/sign-artifacts.cjs --sbom sbom.json [--image local/app:ci]
 */
const { spawnSync } = require('node:child_process');
const { existsSync, writeFileSync } = require('node:fs');

function run(cmd, args, opts={}){
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) throw new Error(cmd+' failed');
}

function ensureCosign(){
  try { run('cosign',['version']); return 'cosign'; } catch { /* try npx */ }
  try { run('npx',['--yes','cosign','version']); return 'npx cosign'; } catch {
    console.error('[sign] cosign not available');
    process.exit(1);
  }
}

function signFile(exe, path){
  if (!existsSync(path)) { console.error('[sign] file not found', path); process.exit(1); }
  const sig = path + '.sig';
  const baseArgs = ['sign-blob','--yes'];
  // If COSIGN_EXPERIMENTAL not set, warn (keyless often needs it in CI)
  if (!process.env.COSIGN_EXPERIMENTAL) {
    console.warn('[sign] COSIGN_EXPERIMENTAL not set; attempting anyway (keyless may fail)');
  }
  const args = baseArgs.concat(path);
  console.log('[sign] signing', path, 'with', exe, 'args:', args.join(' '));
  const parts = exe.split(' ');
  const bin = parts[0];
  const rest = parts.slice(1);
  const r = spawnSync(bin, rest.concat(args), { encoding: 'utf8' });
  if (r.status !== 0){
    console.error('[sign] sign failed');
    if (r.stderr) console.error('[sign] stderr:', r.stderr.toString());
    if (r.stdout) console.error('[sign] stdout:', r.stdout.toString());
    console.error('[sign] diagnostic: ensure OIDC token available (GITHUB_ACTIONS=true, permissions id-token: write) or provide keys');
    process.exit(1);
  }
  const raw = r.stdout.toString().trim();
  writeFileSync(sig, raw + '\n');
  console.log('[sign] wrote signature', sig);
}

function signImage(exe, ref){
  console.log('[sign] signing image', ref);
  const parts = exe.split(' ');
  const bin = parts[0];
  const rest = parts.slice(1);
  const args = rest.concat(['sign','--yes', ref]);
  const r = spawnSync(bin, args, { stdio: 'inherit' });
  if (r.status !== 0){ console.error('[sign] image sign failed'); process.exit(1); }
}

function main(){
  const argv = process.argv.slice(2);
  let sbom='sbom.json';
  let image=null;
  let forceKeyless=false;
  for (let i=0;i<argv.length;i++){
    if (argv[i]==='--sbom') sbom = argv[++i];
    else if (argv[i]==='--image') image = argv[++i];
    else if (argv[i]==='--keyless') forceKeyless = true;
  }
  if (forceKeyless) process.env.COSIGN_EXPERIMENTAL = process.env.COSIGN_EXPERIMENTAL || '1';
  const exe = ensureCosign();
  if (sbom) signFile(exe, sbom);
  if (image) signImage(exe, image);
}

main();
