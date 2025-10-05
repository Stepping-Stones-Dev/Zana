 
/* istanbul ignore file */
 
declare module 'fast-redact' {
  interface FastRedactOptions {
    paths: string[];
    censor?: string | ((_v: unknown) => unknown);
    remove?: boolean;
  }
  type Redactor = (value: unknown) => string;
  // Declaration only – parameters are intentionally unused at type level.
  function fastRedact(_opts: FastRedactOptions): Redactor;
  export = fastRedact;
}
