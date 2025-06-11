import Stripe from 'npm:stripe@13.9.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  if (req.method === 'POST') {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the event for debugging
    console.log(`Received event: ${event.type}`);

    try {
      // Store the event in the webhook_events table
      const { error: logError } = await supabase
        .from('webhook_events')
        .insert({
          id: event.id,
          source: 'stripe',
          event: event.type,
          data: event.data.object,
          signature: signature
        });

      if (logError) {
        console.error(`Error logging webhook event: ${logError.message}`);
      }

      // Process the event based on its type
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await handleCheckoutCompleted(session);
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await handleSubscriptionChange(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await handleSubscriptionDeleted(subscription);
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          await handlePaymentSucceeded(paymentIntent);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await handlePaymentFailed(paymentIntent);
          break;
        }
        // Add more event handlers as needed
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error processing webhook: ${error.message}`);
      
      // Update the webhook event with the error
      await supabase
        .from('webhook_events')
        .update({ error: error.message })
        .eq('id', event.id);
      
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
});

// Handler functions for different event types

async function handleCheckoutCompleted(session) {
  // Extract metadata from the session
  const { metadata = {}, customer, client_reference_id, mode } = session;
  
  if (mode === 'subscription') {
    // For subscriptions, we'll handle this in the subscription events
    console.log(`Subscription checkout completed for customer: ${customer}`);
    return;
  }

  // For one-time payments, create an order record
  if (session.payment_status === 'paid') {
    const { error } = await supabase
      .from('stripe_orders')
      .insert({
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent,
        customer_id: customer,
        amount_subtotal: session.amount_subtotal,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        status: 'completed',
      });

    if (error) {
      console.error(`Error creating order record: ${error.message}`);
      throw error;
    }

    // If this is a booking payment, update the booking status
    if (metadata.bookingId) {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', metadata.bookingId);

      if (bookingError) {
        console.error(`Error updating booking: ${bookingError.message}`);
        throw bookingError;
      }
    }
  }
}

async function handleSubscriptionChange(subscription) {
  // Get the customer ID from the subscription
  const { customer, status, current_period_start, current_period_end, cancel_at_period_end } = subscription;
  
  // Get the default payment method for the customer
  let paymentMethodDetails = {};
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer,
      type: 'card',
      limit: 1,
    });
    
    if (paymentMethods.data.length > 0) {
      const card = paymentMethods.data[0].card;
      paymentMethodDetails = {
        payment_method_brand: card.brand,
        payment_method_last4: card.last4,
      };
    }
  } catch (error) {
    console.error(`Error fetching payment method: ${error.message}`);
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;

  // Upsert the subscription record
  const { error } = await supabase
    .from('stripe_subscriptions')
    .upsert({
      customer_id: customer,
      subscription_id: subscription.id,
      price_id: priceId,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      status,
      ...paymentMethodDetails
    }, {
      onConflict: 'customer_id'
    });

  if (error) {
    console.error(`Error updating subscription: ${error.message}`);
    throw error;
  }

  // Log the subscription event
  await supabase
    .from('subscription_events')
    .insert({
      subscription_id: subscription.id,
      customer_id: customer,
      event_type: 'subscription_updated',
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      metadata: {
        priceId,
        cancel_at_period_end
      }
    });
}

async function handleSubscriptionDeleted(subscription) {
  const { customer, id } = subscription;
  
  // Update the subscription record
  const { error } = await supabase
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      deleted_at: new Date().toISOString()
    })
    .eq('customer_id', customer);

  if (error) {
    console.error(`Error updating subscription: ${error.message}`);
    throw error;
  }

  // Log the subscription event
  await supabase
    .from('subscription_events')
    .insert({
      subscription_id: id,
      customer_id: customer,
      event_type: 'subscription_canceled',
      status: 'canceled'
    });
}

async function handlePaymentSucceeded(paymentIntent) {
  const { metadata = {}, customer, amount, currency } = paymentIntent;
  
  // Create a payment record
  const { error } = await supabase
    .from('payments')
    .insert({
      booking_id: metadata.bookingId,
      client_id: metadata.clientId,
      amount: amount / 100, // Convert from cents
      status: 'completed',
      method: 'stripe',
      reference: paymentIntent.id,
      processed_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error creating payment record: ${error.message}`);
    throw error;
  }

  // If this is a booking payment, update the booking status
  if (metadata.bookingId) {
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        payment_status: 'paid',
        status: 'confirmed'
      })
      .eq('id', metadata.bookingId);

    if (bookingError) {
      console.error(`Error updating booking: ${bookingError.message}`);
      throw bookingError;
    }
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { metadata = {} } = paymentIntent;
  
  // If this is a booking payment, update the booking status
  if (metadata.bookingId) {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        payment_status: 'failed'
      })
      .eq('id', metadata.bookingId);

    if (error) {
      console.error(`Error updating booking: ${error.message}`);
      throw error;
    }
  }

  // Log the payment failure
  await supabase
    .from('error_logs')
    .insert({
      action: 'payment_processing',
      error_message: `Payment failed for intent ${paymentIntent.id}`,
      context: {
        payment_intent: paymentIntent.id,
        booking_id: metadata.bookingId,
        client_id: metadata.clientId,
        error_code: paymentIntent.last_payment_error?.code,
        error_message: paymentIntent.last_payment_error?.message
      }
    });
}