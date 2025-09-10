import passport from "passport"
import fs from "node:fs"
import { Strategy as SamlStrategy } from "passport-saml"
import path from "path"

const certPath = path.join(process.cwd(), 'certs', 'idp_cert.pem')
const idpCert = fs.readFileSync(certPath, 'utf-8')

// Prevent duplicate strategy registration in dev
if (!passport._strategy("saml")) {
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
      (profile, done) => {
        // profile contains user info from Google Workspace
        // You can add tenancy logic here if needed
        done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
}

export default passport;
