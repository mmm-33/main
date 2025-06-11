/*
  # Create tables for realtime functionality

  1. New Tables
    - `realtime_subscriptions` - Tracks active realtime subscriptions
    - `realtime_connection_logs` - Logs connection events
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create realtime_subscriptions table
CREATE TABLE IF NOT EXISTS realtime_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text NOT NULL,
  table_name text NOT NULL,
  filter jsonb,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_realtime_subscriptions_user_id ON realtime_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_subscriptions_table_name ON realtime_subscriptions(table_name);

-- Create realtime_connection_logs table
CREATE TABLE IF NOT EXISTS realtime_connection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL,
  client_info jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_realtime_connection_logs_user_id ON realtime_connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_connection_logs_created_at ON realtime_connection_logs(created_at);

-- Enable Row Level Security
ALTER TABLE realtime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_connection_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for realtime_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON realtime_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON realtime_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON realtime_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON realtime_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for realtime_connection_logs
CREATE POLICY "Users can view their own connection logs"
  ON realtime_connection_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connection logs"
  ON realtime_connection_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update last_active_at
CREATE OR REPLACE FUNCTION update_realtime_subscription_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_active_at
CREATE TRIGGER update_realtime_subscription_last_active
BEFORE UPDATE ON realtime_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_realtime_subscription_last_active();

-- Create function to clean up old subscriptions
CREATE OR REPLACE FUNCTION cleanup_old_realtime_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM realtime_subscriptions
  WHERE last_active_at < now() - INTERVAL '1 day';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up old subscriptions
CREATE TRIGGER cleanup_old_realtime_subscriptions
AFTER INSERT ON realtime_subscriptions
EXECUTE FUNCTION cleanup_old_realtime_subscriptions();