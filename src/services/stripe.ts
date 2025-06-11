// This is a mock implementation of the Stripe service
// It simulates Stripe functionality without actual API calls

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key';
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface CreateCheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  quantity?: number;
}

export interface CreateSubscriptionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
  description?: string;
}

export const stripeService = {
  /**
   * Create a Stripe Checkout Session for one-time payments
   */
  async createCheckoutSession({
    priceId,
    successUrl,
    cancelUrl,
    clientReferenceId,
    customerEmail,
    metadata = {},
    quantity = 1
  }: CreateCheckoutParams) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `cs_test_${Math.random().toString(36).substring(2, 15)}`,
      url: successUrl,
      clientSecret: `cs_secret_${Math.random().toString(36).substring(2, 15)}`
    };
  },

  /**
   * Create a Stripe Checkout Session for subscriptions
   */
  async createSubscriptionSession({
    priceId,
    successUrl,
    cancelUrl,
    customerEmail,
    metadata = {},
    trialPeriodDays
  }: CreateSubscriptionParams) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: `cs_sub_${Math.random().toString(36).substring(2, 15)}`,
      url: successUrl,
      clientSecret: `cs_secret_${Math.random().toString(36).substring(2, 15)}`
    };
  },

  /**
   * Create a Payment Intent for custom payment flows
   */
  async createPaymentIntent({
    amount,
    currency,
    metadata = {},
    receiptEmail,
    description
  }: CreatePaymentIntentParams) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      clientSecret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      currency,
      status: 'requires_payment_method'
    };
  },

  /**
   * Get customer portal URL for managing subscriptions
   */
  async getCustomerPortalUrl(returnUrl: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      url: returnUrl
    };
  },

  /**
   * Get subscription details for the current user
   */
  async getUserSubscription() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      subscription_id: 'sub_1234567890',
      subscription_status: 'active',
      price_id: 'price_1234567890',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15,
      cancel_at_period_end: false,
      payment_method_brand: 'visa',
      payment_method_last4: '4242'
    };
  },

  /**
   * Get order history for the current user
   */
  async getUserOrders() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        order_id: 12345,
        checkout_session_id: 'cs_test_1234567890',
        payment_intent_id: 'pi_1234567890',
        amount_total: 19900,
        currency: 'eur',
        payment_status: 'paid',
        order_status: 'completed',
        order_date: new Date().toISOString()
      },
      {
        order_id: 12344,
        checkout_session_id: 'cs_test_0987654321',
        payment_intent_id: 'pi_0987654321',
        amount_total: 39800,
        currency: 'eur',
        payment_status: 'paid',
        order_status: 'completed',
        order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
};