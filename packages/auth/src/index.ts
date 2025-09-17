// Client-side exports
export * from '@zana/auth/client';

// React components and hooks
export { AuthProvider } from './react/AuthProvider';
export { useAuth } from './react/useAuth';
export { NavAuthStatus } from './react/NavAuthStatus';

// Firebase instances (client-side)
export { auth, db } from './lib/firebase';