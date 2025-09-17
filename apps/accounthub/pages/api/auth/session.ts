import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const sessionSchema = z.object({
  idToken: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = sessionSchema.parse(req.body);
    
    // Verify Firebase ID token (would use Firebase Admin SDK)
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Mock verification for now
    if (!idToken || idToken === 'invalid') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Create session cookie
    const sessionCookie = generateSessionToken(); // Mock function
    
    // Set HttpOnly cookie for parent domain
    res.setHeader('Set-Cookie', [
      `session=${sessionCookie}; HttpOnly; Secure; SameSite=Lax; Domain=.zana.dev; Path=/; Max-Age=86400`
    ]);
    
    return res.json({ success: true });
    
  } catch (error) {
    console.error('Session error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Mock function - would be replaced with actual JWT generation
function generateSessionToken(): string {
  return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}