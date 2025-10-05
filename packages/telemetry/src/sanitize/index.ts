 
import fastRedact from 'fast-redact';
import stringify from 'safe-stable-stringify';

export interface RedactorOptions {
  redactKeys: Set<string>;                 // Case-insensitive keys
  patterns: RegExp[];                      // Applied to string leaves after key redaction
  maxDepth?: number;                       // Undefined => unlimited
  censor?: string;                         // Replacement value
  circularMarker?: string;
  truncatedMarker?: string;
  onRedactionError?: (_error: unknown) => void; // Optional hook for traversal errors
}

export interface Redactor {
  redact: <T = unknown>(input: T) => T;
  redactToString: (input: unknown) => string;
}

/**
 * Build a redactor instance.
 *
 * Two-phase approach:
 *  1. Traverse & clone input, collecting exact paths of keys requiring redaction (case-insensitive match).
 *  2. Apply fast-redact to those paths with provided censor value.
 *  3. Run pattern substitution pass on all string leaves.
 *
 * Non-mutating: returns a cloned & redacted structure.
 */
export function buildRedactor(opts: RedactorOptions): Redactor {
  const censor = opts.censor ?? '***REDACTED***';
  const circularMarker = opts.circularMarker ?? '[Circular]';
  const truncatedMarker = opts.truncatedMarker ?? '[Truncated]';
  const lowerKeys = new Set(Array.from(opts.redactKeys).map(k => k.toLowerCase()));
  const maxDepth = typeof opts.maxDepth === 'number' ? opts.maxDepth : Infinity;

  function cloneCollect(input: any): { clone: any; paths: string[] } {  
    const seen = new WeakMap<object, string>();
    const paths: string[] = [];

  function visit(value: any, path: string, depth: number): any {  
      if (value === null || typeof value !== 'object') return value;

      if (seen.has(value)) return circularMarker;

      // Depth rule:
      // Previous behavior: truncate when depth >= maxDepth.
      // Option B: when maxDepth = 0, keep root (depth 0) but truncate any children.
      // For maxDepth > 0 retain original semantics.
      if (depth >= maxDepth && !(maxDepth === 0 && depth === 0)) {
        return truncatedMarker;
      }

      seen.set(value, path);

      if (Array.isArray(value)) {
        return value.map((v, i) => visit(v, `${path}[${i}]`, depth + 1));
      }

      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        const childPath = path ? `${path}.${k}` : k;
        if (lowerKeys.has(k.toLowerCase())) {
          paths.push(childPath);
            // Placeholder; fast-redact will replace
          out[k] = v;
          continue;
        }
        out[k] = visit(v, childPath, depth + 1);
      }
      return out;
    }

    return { clone: visit(input, '', 0), paths };
  }

  function applyPatterns(obj: any): any {  
    if (obj == null) return obj;
    if (typeof obj === 'string') {
      return opts.patterns.reduce((acc, r) => acc.replace(r, censor), obj);
    }
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = applyPatterns(obj[i]);
      }
      return obj;
    }

    for (const k of Object.keys(obj)) {
      obj[k] = applyPatterns(obj[k]);
    }
    return obj;
  }

  function safeInvoke(fn: () => void) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }

  function redact<T>(input: T): T {
    // Primitive fast path
    if (input === null || typeof input !== 'object') {
      if (typeof input === 'string' && opts.patterns.length) {
        try {
          let out = input as string;
          for (const r of opts.patterns) {
            out = out.replace(r, censor);
          }
          return out as unknown as T;
        } catch (_err) {
          safeInvoke(() => opts.onRedactionError?.(_err));
          return input;
        }
      }
      return input;
    }

    const { clone, paths } = cloneCollect(input);

    if (paths.length) {
      const fr = fastRedact({
        paths,
        censor,
        // Ensure we mutate the clone and do not serialize here.
        serialize: false as any
      } as any);

      try {
        fr(clone);
      } catch (_err) {
        safeInvoke(() => opts.onRedactionError?.(_err));
      }
    }

    try {
      applyPatterns(clone);
    } catch (_err) {
      safeInvoke(() => opts.onRedactionError?.(_err));
    }

    return clone;
  }

  function redactToString(input: unknown): string {
    const red = redact(input);
    const out = stringify(red as any);
    
    /* istanbul ignore next */
    return typeof out === 'string' ? out : '';
  }

  /* istanbul ignore next: object literal return */
  return { redact, redactToString };
}
