import DefaultLayout from '@/layouts/default';
import { useEffect, useState } from 'react';

interface Profile { trial?: { status?: string; endsAt?: string; activatedAt?: string }; name?: string }

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // naive: read email from token cookie (jwt) if present
    try {
      const cookie = document.cookie.split('; ').find(c => c.startsWith('token='));
      if (!cookie) { setLoading(false); return; }
      const token = cookie.split('=')[1];
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email;
      fetch(`/api/onboarding/status?email=${encodeURIComponent(email)}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => setProfile(data))
        .catch(()=> setError('Failed to load profile'))
        .finally(()=> setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <DefaultLayout>
      <div className='pt-10 max-w-3xl mx-auto space-y-6'>
        <h1 className='text-2xl font-semibold'>Dashboard</h1>
        {loading && <p className='text-sm'>Loading...</p>}
        {error && <p className='text-sm text-red-600'>{error}</p>}
        {profile && (
          <div className='space-y-2 text-sm'>
            <p>Welcome {profile.name || 'user'}.</p>
            <p>Plan status: <strong>{profile.trial?.status || 'unknown'}</strong></p>
            {profile.trial?.endsAt && <p>Trial ends: {new Date(profile.trial.endsAt).toLocaleDateString()}</p>}
            {profile.trial?.activatedAt && <p>Activated: {new Date(profile.trial.activatedAt).toLocaleString()}</p>}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
