import { useState } from 'react';

export interface UseCheckoutOptions {
  onSuccess?: (sessionId?: string) => void;
  onError?: (error: string) => void;
}

export interface CheckoutData {
  orgId: string;
  planId: string;
  billing: 'monthly' | 'yearly';
  provider: 'stripe' | 'paypal' | 'pesapal';
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (data: CheckoutData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      if (result.checkoutUrl) {
        // Redirect to checkout URL
        window.location.href = result.checkoutUrl;
      } else {
        options.onSuccess?.(result.sessionId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    startCheckout,
    loading,
    error,
    clearError,
  };
}