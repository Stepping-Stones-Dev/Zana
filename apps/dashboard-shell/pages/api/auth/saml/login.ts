import type { NextApiRequest, NextApiResponse } from 'next';
import passport from '@sam/auth/server';
import { ensureSamlStrategy } from '@sam/auth/server';
import nextConnect from 'next-connect';

ensureSamlStrategy();

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, req, res) {
    console.error('SAML login error', err);
    res.status(500).json({ error: 'saml_login_failed' });
  }
});

handler.get(passport.authenticate('saml', { failureRedirect: '/saml-login' }));

export default handler;
