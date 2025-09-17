import { adminAuth } from './lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  return await adminAuth.verifyIdToken(idToken);
}

export async function createCustomToken(uid: string, additionalClaims?: Record<string, any>): Promise<string> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  return await adminAuth.createCustomToken(uid, additionalClaims);
}

export async function getUserById(uid: string): Promise<SessionUser> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  const userRecord = await adminAuth.getUser(uid);
  
  return {
    uid: userRecord.uid,
    email: userRecord.email || '',
    displayName: userRecord.displayName,
    emailVerified: userRecord.emailVerified,
  };
}

export async function updateUser(uid: string, properties: {
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  disabled?: boolean;
}): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  await adminAuth.updateUser(uid, properties);
}

export async function deleteUser(uid: string): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  await adminAuth.deleteUser(uid);
}

export async function listUsers(maxResults = 1000): Promise<SessionUser[]> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not initialized');
  }
  
  const listResult = await adminAuth.listUsers(maxResults);
  
  return listResult.users.map(user => ({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  }));
}

// Export Firestore admin instance for server-side use
export { adminDb as firestore } from './lib/firebase-admin';