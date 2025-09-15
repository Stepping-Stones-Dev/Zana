export { firestore, serverTimestamp } from "./lib/firebase-admin.js";
import passport from "./lib/passport-saml-setup.js";
export { ensureSamlStrategy } from "./lib/passport-saml-setup.js";
export default passport;