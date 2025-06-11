import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with your publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is missing');
      return Promise.reject(new Error('Stripe publishable key is missing'));
    }
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
    try {
      // Call our Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl,
          cancelUrl,
          clientReferenceId,
          customerEmail,
          metadata,
          quantity,
          mode: 'payment'
        }
      });

      if (error) {
        throw new Error(`Error creating checkout session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
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
    try {
      // Call our Supabase Edge Function to create a subscription session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl,
          cancelUrl,
          customerEmail,
          metadata,
          mode: 'subscription',
          trialPeriodDays
        }
      });

      if (error) {
        throw new Error(`Error creating subscription session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating subscription session:', error);
      throw error;
    }
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
    try {
      // Call our Supabase Edge Function to create a payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
          metadata,
          receiptEmail,
          description
        }
      });

      if (error) {
        throw new Error(`Error creating payment intent: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Get customer portal URL for managing subscriptions
   */
  async getCustomerPortalUrl(returnUrl: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: { returnUrl }
      });

      if (error) {
        throw new Error(`Error creating customer portal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating customer portal:', error);
      throw error;
    }
  },

  /**
   * Get subscription details for the current user
   */
  async getUserSubscription() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      // Query the stripe_user_subscriptions view
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error fetching subscription: ${error.message}`);
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  },

  /**
   * Get order history for the current user
   */
  async getUserOrders() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      // Query the stripe_user_orders view
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
};