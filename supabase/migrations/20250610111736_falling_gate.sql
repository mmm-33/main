/*
  # Stripe Integration Schema

  1. New Tables
    - `stripe_customers` - Links users to Stripe customer IDs
    - `stripe_subscriptions` - Stores subscription data
    - `stripe_orders` - Stores order/payment data
    - `subscription_events` - Tracks subscription lifecycle events
    - `webhook_events` - Stores incoming webhook events from Stripe
  
  2. Views
    - `stripe_user_subscriptions` - User-friendly view of subscriptions
    - `stripe_user_orders` - User-friendly view of orders
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view their own data
    - Add policies for admins and service role
*/

-- Check if enum types exist before creating them
DO $$ 
BEGIN
  -- Create stripe_subscription_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
    CREATE TYPE stripe_subscription_status AS ENUM (
      'not_started', 'incomplete', 'incomplete_expired', 'trialing', 
      'active', 'past_due', 'canceled', 'unpaid', 'paused'
    );
  END IF;

  -- Create stripe_order_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
    CREATE TYPE stripe_order_status AS ENUM (
      'pending', 'completed', 'canceled'
    );
  END IF;
END $$;

-- Create stripe_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create indices only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'stripe_customers_user_id_key') THEN
    CREATE UNIQUE INDEX stripe_customers_user_id_key ON stripe_customers(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'stripe_customers_customer_id_key') THEN
    CREATE UNIQUE INDEX stripe_customers_customer_id_key ON stripe_customers(customer_id);
  END IF;
END $$;

-- Create stripe_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES stripe_customers(customer_id),
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create index only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'stripe_subscriptions_customer_id_key') THEN
    CREATE UNIQUE INDEX stripe_subscriptions_customer_id_key ON stripe_subscriptions(customer_id);
  END IF;
END $$;

-- Create stripe_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_orders (
  id BIGSERIAL PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create subscription_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create indices only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscription_events_subscription_id') THEN
    CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscription_events_customer_id') THEN
    CREATE INDEX idx_subscription_events_customer_id ON subscription_events(customer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscription_events_timestamp') THEN
    CREATE INDEX idx_subscription_events_timestamp ON subscription_events(timestamp);
  END IF;
END $$;

-- Create webhook_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  event TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  error TEXT
);

-- Create indices only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_webhook_events_source') THEN
    CREATE INDEX idx_webhook_events_source ON webhook_events(source);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_webhook_events_event') THEN
    CREATE INDEX idx_webhook_events_event ON webhook_events(event);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_webhook_events_processed') THEN
    CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_webhook_events_timestamp') THEN
    CREATE INDEX idx_webhook_events_timestamp ON webhook_events(timestamp);
  END IF;
END $$;

-- Drop views if they exist and recreate them
DROP VIEW IF EXISTS stripe_user_subscriptions;
DROP VIEW IF EXISTS stripe_user_orders;

-- Create views for easier data access
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status AS subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM 
  stripe_customers sc
JOIN 
  stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE 
  sc.deleted_at IS NULL AND ss.deleted_at IS NULL;

CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT 
  sc.customer_id,
  so.id AS order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status AS order_status,
  so.created_at AS order_date
FROM 
  stripe_customers sc
JOIN 
  stripe_orders so ON sc.customer_id = so.customer_id
WHERE 
  sc.deleted_at IS NULL AND so.deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid duplicates
DO $$ 
BEGIN
  -- stripe_customers policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_customers' AND policyname = 'Users can view their own customer data') THEN
    DROP POLICY "Users can view their own customer data" ON stripe_customers;
  END IF;
  
  -- stripe_subscriptions policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_subscriptions' AND policyname = 'Users can view their own subscription data') THEN
    DROP POLICY "Users can view their own subscription data" ON stripe_subscriptions;
  END IF;
  
  -- stripe_orders policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stripe_orders' AND policyname = 'Users can view their own order data') THEN
    DROP POLICY "Users can view their own order data" ON stripe_orders;
  END IF;
  
  -- subscription_events policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_events' AND policyname = 'Admins can view subscription events') THEN
    DROP POLICY "Admins can view subscription events" ON subscription_events;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_events' AND policyname = 'Service role can manage subscription events') THEN
    DROP POLICY "Service role can manage subscription events" ON subscription_events;
  END IF;
  
  -- webhook_events policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Admins can view webhook events') THEN
    DROP POLICY "Admins can view webhook events" ON webhook_events;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Service role can manage webhook events') THEN
    DROP POLICY "Service role can manage webhook events" ON webhook_events;
  END IF;
END $$;

-- Create RLS policies
-- Users can view their own customer data
CREATE POLICY "Users can view their own customer data" ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Users can view their own subscription data
CREATE POLICY "Users can view their own subscription data" ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING ((customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )) AND deleted_at IS NULL);

-- Users can view their own order data
CREATE POLICY "Users can view their own order data" ON stripe_orders
  FOR SELECT
  TO authenticated
  USING ((customer_id IN (
    SELECT customer_id FROM stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )) AND deleted_at IS NULL);

-- Admins can view subscription events
CREATE POLICY "Admins can view subscription events" ON subscription_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ));

-- Service role can manage subscription events
CREATE POLICY "Service role can manage subscription events" ON subscription_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view webhook events
CREATE POLICY "Admins can view webhook events" ON webhook_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ));

-- Service role can manage webhook events
CREATE POLICY "Service role can manage webhook events" ON webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);