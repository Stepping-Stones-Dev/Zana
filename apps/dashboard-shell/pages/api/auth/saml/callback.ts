import type { NextApiRequest, NextApiResponse } from 'next';
import passport from '@sam/auth/server';
import { ensureSamlStrategy } from '@sam/auth/server';
import nextConnect from 'next-connect';
import { serialize } from 'cookie';
import { ensureTenantForEmail } from '@sam/db';

ensureSamlStrategy();

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, req, res) {
    console.error('SAML callback error', err);
    res.status(500).json({ error: 'saml_callback_failed' });
  }
});

handler.post(passport.authenticate('saml', { failureRedirect: '/saml-login' }), async (req: any, res) => {
  try {
    // Basic session cookie; replace with signed/encrypted implementation next iteration
    const redirect = (req.query.RelayState as string) || '/';
    const user = req.user || {};
    // Provision tenant based on email domain (minimal placeholder until full user models)
    const tenant = await ensureTenantForEmail(user.email);
    const value = Buffer.from(JSON.stringify({ email: user.email, id: user.nameID, tenantId: tenant?.id, tenantDomain: tenant?.domain })).toString('base64');
    res.setHeader('Set-Cookie', serialize('sam_session', value, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8 // 8h
    }));
    res.redirect(redirect);
  } catch (e) {
    console.error('SAML post-auth error', e);
    res.redirect('/saml-login?error=post_auth');
  }
});

export default handler;
