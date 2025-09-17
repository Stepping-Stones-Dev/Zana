import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear session cookie
    res.setHeader('Set-Cookie', [
      'session=; HttpOnly; Secure; SameSite=Lax; Domain=.zana.dev; Path=/; Max-Age=0'
    ]);
    
    return res.json({ success: true });
    
  } catch (error) {
    console.error('Signout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}