import passport from "passport";
import fs from "node:fs";
import { Strategy as SamlStrategy } from "passport-saml";
import path from "path";

export function ensureSamlStrategy() {
  const certPath = path.join(process.cwd(), 'certs', 'idp_cert.pem');
  const idpCert = fs.readFileSync(certPath, 'utf-8');

  // Prevent duplicate strategy registration in dev
  // _strategy is not part of the public type surface; cast to any for the guard.
  if (!(passport as any)._strategy || !(passport as any)._strategy("saml")) {
    passport.use(
      new SamlStrategy(
        {
          entryPoint: process.env.SAML_ENTRY_POINT!, // Google Workspace SAML SSO URL
          issuer: process.env.SAML_ISSUER!, // Your SP Entity ID
          callbackUrl: process.env.SAML_CALLBACK_URL!, // This API route
          cert: idpCert,
          signatureAlgorithm:    'sha256',
          digestAlgorithm:       'http://www.w3.org/2001/04/xmlenc#sha256',
          disableRequestedAuthnContext: true,
        },
        (profile: any, done: (err: any, user?: any) => void) => {
          // profile contains user info from Google Workspace
          // You can add tenancy logic here if needed
          done(null, profile);
        }
      )
    );

    passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user));
    passport.deserializeUser((obj: any, done: (err: any, user?: any) => void) => done(null, obj));
  }

  return passport;
}

// Initialize on import for convenience in API routes
const p = ensureSamlStrategy();
export default p;
