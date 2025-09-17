import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';

const AuthPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // Call HRD discovery API
      const response = await fetch('/api/auth/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Discovery failed');
      }

      // Handle discovery result
      if (result.provider) {
        // Redirect to SSO provider
        window.location.href = result.redirectUrl;
      } else {
        // Show local login options
        // For now, just redirect to Firebase Auth
        window.location.href = `/auth/login?email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Zana Account Hub</title>
        <meta name="description" content="Sign in to your Zana account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 hero-pattern opacity-50" />
        
        <div className="relative z-10">
          {/* Back to home link */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gradient">
              Zana
            </Link>
          </div>

          {/* Auth Card */}
          <div className="auth-card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Enter your email to continue to your account
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="form-field">
                <Input
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isRequired
                  size="lg"
                  variant="bordered"
                />
                {error && (
                  <div className="form-error">{error}</div>
                )}
              </div>

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={!email}
              >
                Continue
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;