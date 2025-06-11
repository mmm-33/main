/*
  # Fix UUID Migration with DROP IF EXISTS

  1. Changes
    - Add DROP IF EXISTS statements for all temporary tables before creating them
    - Keep all the original migration logic but ensure it can be run multiple times safely
    - Maintain all table structures, indexes, and RLS policies
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to convert existing IDs to UUIDs in a deterministic way
CREATE OR REPLACE FUNCTION convert_id_to_uuid(id bigint) 
RETURNS uuid AS $$
BEGIN
  -- Create a deterministic UUID based on the original ID
  -- This ensures foreign key relationships are maintained
  RETURN uuid_generate_v5(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', -- UUID namespace
    id::text
  );
END;
$$ LANGUAGE plpgsql;

-- Drop temporary tables if they exist from a previous failed migration
DROP TABLE IF EXISTS clients_new CASCADE;
DROP TABLE IF EXISTS bookings_new CASCADE;
DROP TABLE IF EXISTS payments_new CASCADE;
DROP TABLE IF EXISTS notifications_new CASCADE;
DROP TABLE IF EXISTS user_profiles_new CASCADE;
DROP TABLE IF EXISTS error_logs_new CASCADE;
DROP TABLE IF EXISTS sync_logs_new CASCADE;
DROP TABLE IF EXISTS webhook_events_new CASCADE;
DROP TABLE IF EXISTS webhook_logs_new CASCADE;
DROP TABLE IF EXISTS security_logs_new CASCADE;
DROP TABLE IF EXISTS subscription_events_new CASCADE;
DROP TABLE IF EXISTS file_metadata_new CASCADE;
DROP TABLE IF EXISTS system_events_new CASCADE;
DROP TABLE IF EXISTS storage_files_new CASCADE;
DROP TABLE IF EXISTS storage_access_logs_new CASCADE;
DROP TABLE IF EXISTS ai_chat_logs_new CASCADE;
DROP TABLE IF EXISTS chatbot_logs_new CASCADE;

-- 1. Migrate clients table
-- Create temporary table with UUID structure
CREATE TABLE clients_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  language text DEFAULT 'en',
  segment text DEFAULT 'new',
  total_bookings integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_booking timestamptz,
  lead_source text,
  portal_access boolean DEFAULT false,
  portal_token text,
  location text
);

-- Copy data with UUID conversion
INSERT INTO clients_new (
  id, name, email, phone, created_at, updated_at, language, 
  segment, total_bookings, total_spent, last_booking, 
  lead_source, portal_access, portal_token, location
)
SELECT 
  convert_id_to_uuid(id), name, email, phone, created_at, updated_at, language, 
  segment, total_bookings, total_spent, last_booking, 
  lead_source, portal_access, portal_token, location
FROM clients;

-- Create index on email
CREATE UNIQUE INDEX clients_new_email_key ON clients_new(email);
CREATE INDEX idx_clients_new_email ON clients_new(email);

-- 2. Migrate bookings table
-- Create temporary table with UUID structure
CREATE TABLE bookings_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients_new(id),
  yacht_id uuid, -- Will be updated later
  session_date date NOT NULL,
  session_time text NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  amount numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion
INSERT INTO bookings_new (
  id, client_id, session_date, session_time, status, 
  payment_status, amount, notes, created_at, updated_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(client_id), 
  session_date, 
  session_time, 
  status, 
  payment_status, 
  amount, 
  notes, 
  created_at, 
  updated_at
FROM bookings;

-- Create indexes
CREATE INDEX idx_bookings_new_client_id ON bookings_new(client_id);
CREATE INDEX idx_bookings_new_yacht_id ON bookings_new(yacht_id);

-- 3. Migrate payments table
-- Create temporary table with UUID structure
CREATE TABLE payments_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings_new(id),
  amount numeric NOT NULL,
  payment_date timestamptz DEFAULT now(),
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion
INSERT INTO payments_new (
  id, booking_id, amount, payment_date, status, created_at, updated_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(booking_id), 
  amount, 
  payment_date, 
  status, 
  created_at, 
  updated_at
FROM payments;

-- Create index
CREATE INDEX idx_payments_new_booking_id ON payments_new(booking_id);

-- 4. Migrate notifications table
-- Create temporary table with UUID structure
CREATE TABLE notifications_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  type text,
  title text,
  recipient_id uuid REFERENCES clients_new(id),
  recipient_email text,
  channel text DEFAULT 'email',
  status text DEFAULT 'pending',
  booking_id uuid REFERENCES bookings_new(id),
  read_at timestamptz
);

-- Copy data with UUID conversion
INSERT INTO notifications_new (
  id, user_id, message, is_read, created_at, updated_at,
  type, title, recipient_id, recipient_email, channel, status, 
  booking_id, read_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(user_id), 
  message, 
  is_read, 
  created_at, 
  updated_at,
  type, 
  title, 
  convert_id_to_uuid(recipient_id), 
  recipient_email, 
  channel, 
  status, 
  convert_id_to_uuid(booking_id), 
  read_at
FROM notifications;

-- Create indexes
CREATE INDEX idx_notifications_new_user_id ON notifications_new(user_id);
CREATE INDEX idx_notifications_new_recipient_id ON notifications_new(recipient_id);
CREATE INDEX idx_notifications_new_booking_id ON notifications_new(booking_id);

-- 5. Migrate user_profiles table
-- Create temporary table with UUID structure
CREATE TABLE user_profiles_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id),
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion
INSERT INTO user_profiles_new (
  id, user_id, role, created_at, updated_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(user_id), 
  role, 
  created_at, 
  updated_at
FROM user_profiles;

-- Create index
CREATE INDEX idx_user_profiles_new_user_id ON user_profiles_new(user_id);

-- 6. Migrate error_logs table
-- Create temporary table with UUID structure
CREATE TABLE error_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  action text,
  error_stack text,
  context jsonb,
  user_agent text,
  timestamp timestamptz
);

-- Copy data with UUID conversion
INSERT INTO error_logs_new (
  id, error_message, created_at, action, error_stack, context, user_agent, timestamp
)
SELECT 
  convert_id_to_uuid(id), 
  error_message, 
  created_at, 
  action, 
  error_stack, 
  context, 
  user_agent, 
  timestamp
FROM error_logs;

-- 7. Migrate sync_logs table
-- Create temporary table with UUID structure
CREATE TABLE sync_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_status text NOT NULL,
  sync_time timestamptz DEFAULT now(),
  table_name text,
  operation text,
  record_id text,
  synced_at timestamptz,
  error_message text
);

-- Copy data with UUID conversion
INSERT INTO sync_logs_new (
  id, sync_status, sync_time, table_name, operation, record_id, synced_at, error_message
)
SELECT 
  convert_id_to_uuid(id), 
  sync_status, 
  sync_time, 
  table_name, 
  operation, 
  record_id, 
  synced_at, 
  error_message
FROM sync_logs;

-- 8. Migrate webhook_events table
-- Create temporary table with UUID structure
CREATE TABLE webhook_events_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  received_at timestamptz DEFAULT now(),
  source text,
  event text,
  data jsonb,
  signature text,
  timestamp timestamptz,
  processed boolean DEFAULT false,
  error text
);

-- Copy data with UUID conversion
INSERT INTO webhook_events_new (
  id, event_type, event_data, received_at, source, event, data, 
  signature, timestamp, processed, error
)
SELECT 
  convert_id_to_uuid(id), 
  event_type, 
  event_data, 
  received_at, 
  source, 
  event, 
  data, 
  signature, 
  timestamp, 
  processed, 
  error
FROM webhook_events;

-- 9. Migrate webhook_logs table
-- Create temporary table with UUID structure
CREATE TABLE webhook_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id uuid REFERENCES webhook_events_new(id),
  status text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion
INSERT INTO webhook_logs_new (
  id, webhook_id, status, processed_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(webhook_id), 
  status, 
  processed_at
FROM webhook_logs;

-- Create index
CREATE INDEX idx_webhook_logs_new_webhook_id ON webhook_logs_new(webhook_id);

-- 10. Migrate security_logs table
-- Create temporary table with UUID structure
CREATE TABLE security_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES clients_new(id)
);

-- Copy data with UUID conversion
INSERT INTO security_logs_new (
  id, log_message, created_at, user_id
)
SELECT 
  convert_id_to_uuid(id), 
  log_message, 
  created_at, 
  convert_id_to_uuid(user_id)
FROM security_logs;

-- 11. Migrate subscription_events table
-- Create temporary table with UUID structure
CREATE TABLE subscription_events_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id),
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  subscription_id text,
  customer_id text,
  status text,
  current_period_end timestamptz,
  metadata jsonb,
  timestamp timestamptz
);

-- Copy data with UUID conversion
INSERT INTO subscription_events_new (
  id, user_id, event_type, event_data, created_at,
  subscription_id, customer_id, status, current_period_end, metadata, timestamp
)
SELECT 
  COALESCE(id, uuid_generate_v4()), 
  convert_id_to_uuid(user_id), 
  event_type, 
  event_data, 
  created_at,
  subscription_id, 
  customer_id, 
  status, 
  current_period_end, 
  metadata, 
  timestamp
FROM subscription_events;

-- Create index
CREATE INDEX idx_subscription_events_new_user_id ON subscription_events_new(user_id);

-- 12. Migrate file_metadata table
-- Create temporary table with UUID structure
CREATE TABLE file_metadata_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES clients_new(id)
);

-- Copy data with UUID conversion
INSERT INTO file_metadata_new (
  id, file_name, file_size, file_type, uploaded_at, user_id
)
SELECT 
  convert_id_to_uuid(id), 
  file_name, 
  file_size, 
  file_type, 
  uploaded_at, 
  convert_id_to_uuid(user_id)
FROM file_metadata;

-- Create index
CREATE INDEX idx_file_metadata_new_user_id ON file_metadata_new(user_id);

-- 13. Migrate system_events table
-- Create temporary table with UUID structure
CREATE TABLE system_events_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES clients_new(id)
);

-- Copy data with UUID conversion
INSERT INTO system_events_new (
  id, event_type, event_data, created_at, user_id
)
SELECT 
  convert_id_to_uuid(id), 
  event_type, 
  event_data, 
  created_at, 
  convert_id_to_uuid(user_id)
FROM system_events;

-- 14. Migrate storage_files table
-- Create temporary table with UUID structure
CREATE TABLE storage_files_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  bucket_id text,
  name text,
  owner_id uuid,
  mime_type text,
  metadata jsonb,
  path text,
  is_public boolean DEFAULT false,
  last_accessed_at timestamptz
);

-- Copy data with UUID conversion
INSERT INTO storage_files_new (
  id, user_id, file_name, file_size, file_type, created_at, updated_at
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(user_id), 
  file_name, 
  file_size, 
  file_type, 
  created_at, 
  updated_at
FROM storage_files;

-- Create index
CREATE INDEX idx_storage_files_new_user_id ON storage_files_new(user_id);

-- 15. Migrate storage_access_logs table
-- Create temporary table with UUID structure
CREATE TABLE storage_access_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id),
  file_id uuid REFERENCES storage_files_new(id),
  access_time timestamptz DEFAULT now(),
  action text NOT NULL,
  ip_address text,
  user_agent text
);

-- Copy data with UUID conversion
INSERT INTO storage_access_logs_new (
  id, user_id, file_id, access_time, action
)
SELECT 
  convert_id_to_uuid(id), 
  convert_id_to_uuid(user_id), 
  convert_id_to_uuid(file_id), 
  access_time, 
  action
FROM storage_access_logs;

-- Create indexes
CREATE INDEX idx_storage_access_logs_new_user_id ON storage_access_logs_new(user_id);
CREATE INDEX idx_storage_access_logs_new_file_id ON storage_access_logs_new(file_id);

-- 16. Migrate ai_chat_logs and chatbot_logs tables
-- Create temporary table with UUID structure
CREATE TABLE ai_chat_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  message text NOT NULL,
  language text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Copy data (these already use UUIDs as primary keys)
INSERT INTO ai_chat_logs_new (
  id, user_id, message, language, timestamp, created_at
)
SELECT 
  id, 
  user_id, 
  message, 
  language, 
  timestamp, 
  created_at
FROM ai_chat_logs;

CREATE TABLE chatbot_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  conversation_state text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Copy data (these already use UUIDs as primary keys)
INSERT INTO chatbot_logs_new (
  id, user_id, user_message, bot_response, conversation_state, timestamp, created_at
)
SELECT 
  id, 
  user_id, 
  user_message, 
  bot_response, 
  conversation_state, 
  timestamp, 
  created_at
FROM chatbot_logs;

-- 18. Drop old tables and rename new ones
-- First, drop tables with foreign key dependencies
DROP TABLE IF EXISTS storage_access_logs CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS subscription_events CASCADE;
DROP TABLE IF EXISTS file_metadata CASCADE;
DROP TABLE IF EXISTS system_events CASCADE;
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS storage_files CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS ai_chat_logs CASCADE;
DROP TABLE IF EXISTS chatbot_logs CASCADE;

-- Rename new tables
ALTER TABLE clients_new RENAME TO clients;
ALTER TABLE bookings_new RENAME TO bookings;
ALTER TABLE payments_new RENAME TO payments;
ALTER TABLE notifications_new RENAME TO notifications;
ALTER TABLE user_profiles_new RENAME TO user_profiles;
ALTER TABLE error_logs_new RENAME TO error_logs;
ALTER TABLE sync_logs_new RENAME TO sync_logs;
ALTER TABLE webhook_events_new RENAME TO webhook_events;
ALTER TABLE webhook_logs_new RENAME TO webhook_logs;
ALTER TABLE security_logs_new RENAME TO security_logs;
ALTER TABLE subscription_events_new RENAME TO subscription_events;
ALTER TABLE file_metadata_new RENAME TO file_metadata;
ALTER TABLE system_events_new RENAME TO system_events;
ALTER TABLE storage_files_new RENAME TO storage_files;
ALTER TABLE storage_access_logs_new RENAME TO storage_access_logs;
ALTER TABLE ai_chat_logs_new RENAME TO ai_chat_logs;
ALTER TABLE chatbot_logs_new RENAME TO chatbot_logs;

-- Rename indexes
ALTER INDEX IF EXISTS clients_new_email_key RENAME TO clients_email_key;
ALTER INDEX IF EXISTS idx_clients_new_email RENAME TO idx_clients_email;
ALTER INDEX IF EXISTS idx_bookings_new_client_id RENAME TO idx_bookings_client_id;
ALTER INDEX IF EXISTS idx_bookings_new_yacht_id RENAME TO idx_bookings_yacht_id;
ALTER INDEX IF EXISTS idx_payments_new_booking_id RENAME TO idx_payments_booking_id;
ALTER INDEX IF EXISTS idx_notifications_new_user_id RENAME TO idx_notifications_user_id;
ALTER INDEX IF EXISTS idx_notifications_new_recipient_id RENAME TO idx_notifications_recipient_id;
ALTER INDEX IF EXISTS idx_notifications_new_booking_id RENAME TO idx_notifications_booking_id;
ALTER INDEX IF EXISTS idx_user_profiles_new_user_id RENAME TO idx_user_profiles_user_id;
ALTER INDEX IF EXISTS idx_webhook_logs_new_webhook_id RENAME TO idx_webhook_logs_webhook_id;
ALTER INDEX IF EXISTS idx_subscription_events_new_user_id RENAME TO idx_subscription_events_user_id;
ALTER INDEX IF EXISTS idx_file_metadata_new_user_id RENAME TO idx_file_metadata_user_id;
ALTER INDEX IF EXISTS idx_storage_files_new_user_id RENAME TO idx_storage_files_user_id;
ALTER INDEX IF EXISTS idx_storage_access_logs_new_user_id RENAME TO idx_storage_access_logs_user_id;
ALTER INDEX IF EXISTS idx_storage_access_logs_new_file_id RENAME TO idx_storage_access_logs_file_id;

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Anonymous can insert clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous can read clients"
  ON clients
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can access clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for bookings
CREATE POLICY "Anonymous can insert bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can access bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for payments
CREATE POLICY "Authenticated can access payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for notifications
CREATE POLICY "Authenticated can access notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR recipient_id = auth.uid());

-- Create RLS policies for user_profiles
CREATE POLICY "Authenticated can access user profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for error_logs
CREATE POLICY "Authenticated can access error logs"
  ON error_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for sync_logs
CREATE POLICY "Authenticated can access sync logs"
  ON sync_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for webhook_events
CREATE POLICY "Authenticated can access webhook events"
  ON webhook_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for webhook_logs
CREATE POLICY "Authenticated can access webhook logs"
  ON webhook_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for security_logs
CREATE POLICY "Authenticated can access security logs"
  ON security_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for subscription_events
CREATE POLICY "Authenticated can access subscription events"
  ON subscription_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for file_metadata
CREATE POLICY "Authenticated can access file metadata"
  ON file_metadata
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for system_events
CREATE POLICY "Authenticated can access system events"
  ON system_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for storage_files
CREATE POLICY "Authenticated can access storage files"
  ON storage_files
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for storage_access_logs
CREATE POLICY "Authenticated can access storage access logs"
  ON storage_access_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for ai_chat_logs
CREATE POLICY "Service role can access AI chat logs"
  ON ai_chat_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for chatbot_logs
CREATE POLICY "Service role can access chatbot logs"
  ON chatbot_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop the conversion function as it's no longer needed
DROP FUNCTION IF EXISTS convert_id_to_uuid;