import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = String(req.query.email || '').toLowerCase();
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const doc = await firestore().collection('onboardingProfiles').doc(email).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(doc.data());
  } catch (e: any) {
    return res.status(500).json({ error: 'Status lookup failed' });
  }
}
