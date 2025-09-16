import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.headers.cookie || '';
  const match = cookie.split(';').map(c=>c.trim()).find(c=> c.startsWith('sam_session='));
  if (!match) return res.status(200).json({ user: null });
  try {
    const b64 = match.split('=')[1];
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const data = JSON.parse(json);
    // Only expose minimal safe fields
    const user = { id: data.id, email: data.email };
    return res.status(200).json({ user });
  } catch {
    return res.status(200).json({ user: null });
  }
}
