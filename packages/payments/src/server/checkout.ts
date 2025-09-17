import type { Plan, Subscription } from '@zana/types';

// Server-side checkout functions
export interface CheckoutRequest {
  orgId: string;
  planId: string;
  billing: 'monthly' | 'yearly';
  provider: 'stripe' | 'paypal' | 'pesapal';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

export async function createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    switch (request.provider) {
      case 'stripe':
        return await createStripeCheckout(request);
      case 'paypal':
        return await createPayPalCheckout(request);
      case 'pesapal':
        return await createPesapalCheckout(request);
      default:
        return { success: false, error: 'Unsupported payment provider' };
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Checkout failed' 
    };
  }
}

async function createStripeCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  const stripe = await import('stripe');
  const stripeInstance = new stripe.default(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
  });

  const { computePlanAmounts } = await import('../pricing');
  const amounts = computePlanAmounts(request.planId as any, request.billing);
  
  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Zana ${request.planId} Plan`,
          },
          unit_amount: request.billing === 'monthly' 
            ? amounts.monthlyKES * 100 // Convert to cents
            : amounts.yearlyKES * 100,
          recurring: {
            interval: request.billing === 'monthly' ? 'month' : 'year',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orgId: request.orgId,
      planId: request.planId,
      billing: request.billing,
    },
    success_url: request.successUrl || `${process.env.BASE_URL}/account/subscriptions?success=true`,
    cancel_url: request.cancelUrl || `${process.env.BASE_URL}/pricing?canceled=true`,
  });

  return {
    success: true,
    checkoutUrl: session.url!,
    sessionId: session.id,
  };
}

async function createPayPalCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  // Use existing PayPal provider logic
  const { PayPalProvider } = await import('./index');
  
  const result = await PayPalProvider.initiateMandate({
    email: 'user@example.com', // Would get from user context
    planId: request.planId,
    billing: request.billing,
  });

  if (result.hostedUrl && result.hostedUrl !== '#') {
    return {
      success: true,
      checkoutUrl: result.hostedUrl,
    };
  }

  return { success: false, error: 'PayPal checkout failed' };
}

async function createPesapalCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  // Use existing Pesapal provider logic
  const { PesapalProvider } = await import('./index');
  
  const result = await PesapalProvider.initiateMandate({
    email: 'user@example.com', // Would get from user context
    phone: '+254700000000', // Would get from user context
    planId: request.planId,
    billing: request.billing,
  });

  if (result.hostedUrl) {
    return {
      success: true,
      checkoutUrl: result.hostedUrl,
    };
  }

  return { success: false, error: 'Pesapal checkout failed' };
}

// Webhook handling
export interface WebhookEvent {
  type: string;
  data: any;
  provider: 'stripe' | 'paypal' | 'pesapal';
}

export async function handleWebhook(event: WebhookEvent): Promise<void> {
  switch (event.provider) {
    case 'stripe':
      await handleStripeWebhook(event);
      break;
    case 'paypal':
      await handlePayPalWebhook(event);
      break;
    case 'pesapal':
      await handlePesapalWebhook(event);
      break;
  }
}

async function handleStripeWebhook(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription creation
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
  }
}

async function handlePayPalWebhook(event: WebhookEvent): Promise<void> {
  // Handle PayPal webhook events
}

async function handlePesapalWebhook(event: WebhookEvent): Promise<void> {
  // Handle Pesapal webhook events
}