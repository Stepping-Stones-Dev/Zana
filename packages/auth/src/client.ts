import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './lib/firebase';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export async function signIn({ email, password }: SignInCredentials): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signUp({ email, password, displayName }: SignUpCredentials): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, updates);
  } else {
    throw new Error('No user is currently signed in');
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
}