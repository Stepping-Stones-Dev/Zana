import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const expired = serialize('sam_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', expired);
  if (req.headers.accept?.includes('text/html')) {
    res.redirect('/saml-login?logged_out=1');
  } else {
    res.status(200).json({ ok: true });
  }
}
