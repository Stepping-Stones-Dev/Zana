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
  // Keyless (OIDC) if identity available; fallback to local key requirement.
  const args = ['sign-blob','--yes', path];
  console.log('[sign] signing', path);
  const r = spawnSync(exe.split(' ')[0], exe.startsWith('npx')?exe.split(' ').slice(1).concat(args):args, { stdio: 'pipe' });
  if (r.status !== 0){ console.error('[sign] sign failed'); process.exit(1); }
  writeFileSync(sig, r.stdout);
  console.log('[sign] wrote', sig);
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
  for (let i=0;i<argv.length;i++){
    if (argv[i]==='--sbom') sbom = argv[++i];
    else if (argv[i]==='--image') image = argv[++i];
  }
  const exe = ensureCosign();
  if (sbom) signFile(exe, sbom);
  if (image) signImage(exe, image);
}

main();
