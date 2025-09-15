import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebase-admin';

// M-Pesa callback endpoint (set MPESA_CALLBACK_URL to public URL pointing here)
// Stores raw payload and updates payment status if success
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }
  try {
    const payload = req.body;
    const db = firestore();
    const id = `cb_${Date.now()}`;
    await db.collection('mpesaCallbacks').doc(id).set({ payload, receivedAt: new Date().toISOString() });
    const resultCode = payload?.Body?.stkCallback?.ResultCode;
    const msisdn = payload?.Body?.stkCallback?.CallbackMetadata?.Item?.find((i: any) => i.Name === 'PhoneNumber')?.Value;
    if (resultCode === 0 && msisdn) {
      // success update any trial from phone
      const profiles = await db
        .collection('onboardingProfiles')
        .where('phone', '==', String(msisdn))
        .limit(1)
        .get();
      if (!profiles.empty) {
        await profiles.docs[0].ref.set(
          { trial: { status: 'active', activatedAt: new Date().toISOString() } },
          { merge: true },
        );
      }
    }
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: 'Callback error' });
  }
}
