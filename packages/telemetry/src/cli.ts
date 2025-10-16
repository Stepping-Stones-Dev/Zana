#!/usr/bin/env node
/* istanbul ignore file -- CLI utility excluded from strict coverage */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Command } from 'commander';
import stringify from 'safe-stable-stringify';

import { EventSchemas, listSchemaNames } from './schemas.ts';

const program = new Command();
program.name('zana-events').description('Utilities for @zana/events').version('0.1.0');

program.command('list')
  .description('List registered event schemas')
  .option('-j, --json', 'Output JSON')
  .action((opts: { json?: boolean }) => {
    const names = listSchemaNames();
    if (opts.json) {
       
      console.log(stringify(names));
    } else {
      names.forEach((n: string) => console.log(n));  
    }
  });

program.command('generate-docs')
  .description('Generate markdown documentation for event schemas')
  .option('-o, --out <file>', 'Output file', 'EVENT_CATALOG.md')
  .action((opts: { out: string }) => {
    const lines: string[] = [];
    lines.push('# Event Catalog');
    lines.push('');
    for (const [name, schema] of Object.entries(EventSchemas)) {
      lines.push(`## ${name}`);
      lines.push('```json');
      // best-effort: zod schema introspection (avoid private defs) – fallback to keys list
      let shape: unknown = (schema as any)?._def?.shape();  
      if (!shape || typeof shape !== 'object') shape = Object.keys((schema as any).shape || {}); // zod 3 style
      lines.push(JSON.stringify(shape, null, 2));
      lines.push('```');
      lines.push('');
    }
    const outPath = resolve(process.cwd(), opts.out);
    writeFileSync(outPath, lines.join('\n'), 'utf8');
     
    console.log(`Wrote ${outPath}`);
  });

program.parse(process.argv);
