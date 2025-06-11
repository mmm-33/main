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

-- 1. Migrate clients table
-- First, check the structure of the existing clients table
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'phone'
  ) INTO column_exists;

  IF NOT column_exists THEN
    -- Add phone column if it doesn't exist
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone text;
  END IF;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'clients'
    AND column_name != 'id'
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'clients_new' AND column_name != 'id'
    )
  INTO column_names;

  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO clients_new (id, %s)
    SELECT convert_id_to_uuid(id), %s
    FROM clients
  ', column_names, column_names);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id, client_id, and yacht_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'bookings'
    AND column_name NOT IN ('id', 'client_id', 'yacht_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings_new' AND column_name NOT IN ('id', 'client_id', 'yacht_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  select_expr := format('convert_id_to_uuid(id), convert_id_to_uuid(client_id), %s', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO bookings_new (id, client_id, %s)
    SELECT %s
    FROM bookings
    WHERE client_id IS NOT NULL
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

-- Create indexes
CREATE INDEX idx_bookings_new_client_id ON bookings_new(client_id);
CREATE INDEX idx_bookings_new_yacht_id ON bookings_new(yacht_id);

-- 3. Migrate yachts table
-- Create temporary table with UUID structure
CREATE TABLE yachts_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  model text,
  year integer,
  length numeric,
  capacity integer,
  price_per_day numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'available',
  skipper text,
  location text,
  next_booking timestamptz,
  maintenance_due date,
  total_hours integer DEFAULT 0,
  last_service date
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'yachts'
    AND column_name != 'id'
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'yachts_new' AND column_name != 'id'
    )
  INTO column_names;

  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO yachts_new (id, %s)
    SELECT convert_id_to_uuid(id), %s
    FROM yachts
  ', column_names, column_names);
  
  EXECUTE insert_stmt;
END $$;

-- Update yacht_id in bookings_new
DO $$
DECLARE
  booking record;
  yacht_uuid uuid;
BEGIN
  FOR booking IN SELECT id, yacht_id FROM bookings WHERE yacht_id IS NOT NULL LOOP
    SELECT convert_id_to_uuid(booking.yacht_id) INTO yacht_uuid;
    
    UPDATE bookings_new
    SET yacht_id = yacht_uuid
    WHERE id = convert_id_to_uuid(booking.id);
  END LOOP;
END $$;

-- Add foreign key constraint for bookings_new.yacht_id
ALTER TABLE bookings_new
ADD CONSTRAINT bookings_yacht_id_fkey
FOREIGN KEY (yacht_id) REFERENCES yachts_new(id);

-- 4. Migrate payments table
-- Create temporary table with UUID structure
CREATE TABLE payments_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings_new(id),
  amount numeric NOT NULL,
  payment_date timestamptz DEFAULT now(),
  status text NOT NULL
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id and booking_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'payments'
    AND column_name NOT IN ('id', 'booking_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'payments_new' AND column_name NOT IN ('id', 'booking_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  select_expr := format('convert_id_to_uuid(id), convert_id_to_uuid(booking_id), %s', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO payments_new (id, booking_id, %s)
    SELECT %s
    FROM payments
    WHERE booking_id IS NOT NULL
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

-- Create index
CREATE INDEX idx_payments_new_booking_id ON payments_new(booking_id);

-- 5. Migrate notifications table
-- Create temporary table with UUID structure
CREATE TABLE notifications_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  title text,
  message text NOT NULL,
  recipient_id uuid REFERENCES clients_new(id),
  recipient_email text,
  channel text DEFAULT 'email',
  status text DEFAULT 'pending',
  booking_id uuid REFERENCES bookings_new(id),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_columns text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id, recipient_id, and booking_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'notifications'
    AND column_name NOT IN ('id', 'recipient_id', 'booking_id', 'user_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications_new' AND column_name NOT IN ('id', 'recipient_id', 'booking_id')
    )
  INTO column_names;

  -- Build the SELECT expression
  select_columns := format('
    convert_id_to_uuid(id), 
    %s,
    CASE WHEN recipient_id IS NOT NULL THEN convert_id_to_uuid(recipient_id) ELSE NULL END,
    CASE WHEN booking_id IS NOT NULL THEN convert_id_to_uuid(booking_id) ELSE NULL END
  ', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO notifications_new (id, %s, recipient_id, booking_id)
    SELECT %s
    FROM notifications
  ', column_names, select_columns);
  
  EXECUTE insert_stmt;
END $$;

-- Create indexes
CREATE INDEX idx_notifications_new_recipient_id ON notifications_new(recipient_id);
CREATE INDEX idx_notifications_new_booking_id ON notifications_new(booking_id);

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'error_logs'
    AND column_name != 'id'
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'error_logs_new' AND column_name != 'id'
    )
  INTO column_names;

  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO error_logs_new (id, %s)
    SELECT convert_id_to_uuid(id), %s
    FROM error_logs
  ', column_names, column_names);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'sync_logs'
    AND column_name != 'id'
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'sync_logs_new' AND column_name != 'id'
    )
  INTO column_names;

  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO sync_logs_new (id, %s)
    SELECT convert_id_to_uuid(id), %s
    FROM sync_logs
  ', column_names, column_names);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'webhook_events'
    AND column_name != 'id'
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'webhook_events_new' AND column_name != 'id'
    )
  INTO column_names;

  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO webhook_events_new (id, %s)
    SELECT convert_id_to_uuid(id), %s
    FROM webhook_events
  ', column_names, column_names);
  
  EXECUTE insert_stmt;
END $$;

-- 9. Migrate webhook_logs table
-- Create temporary table with UUID structure
CREATE TABLE webhook_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id uuid REFERENCES webhook_events_new(id),
  status text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id and webhook_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'webhook_logs'
    AND column_name NOT IN ('id', 'webhook_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'webhook_logs_new' AND column_name NOT IN ('id', 'webhook_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  select_expr := format('convert_id_to_uuid(id), convert_id_to_uuid(webhook_id), %s', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO webhook_logs_new (id, webhook_id, %s)
    SELECT %s
    FROM webhook_logs
    WHERE webhook_id IS NOT NULL
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  has_new_user_id boolean;
  insert_stmt text;
BEGIN
  -- Check if new_user_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'security_logs' AND column_name = 'new_user_id'
  ) INTO has_new_user_id;

  -- Build and execute the INSERT statement based on column existence
  IF has_new_user_id THEN
    insert_stmt := '
      INSERT INTO security_logs_new (id, log_message, created_at, user_id)
      SELECT 
        convert_id_to_uuid(id), 
        log_message, 
        created_at, 
        CASE WHEN new_user_id IS NOT NULL THEN convert_id_to_uuid(new_user_id) ELSE NULL END
      FROM security_logs
    ';
  ELSE
    insert_stmt := '
      INSERT INTO security_logs_new (id, log_message, created_at)
      SELECT 
        convert_id_to_uuid(id), 
        log_message, 
        created_at
      FROM security_logs
    ';
  END IF;
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  has_new_user_id boolean;
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Check if new_user_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subscription_events' AND column_name = 'new_user_id'
  ) INTO has_new_user_id;

  -- Get the list of columns that exist in both tables (excluding id and user_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'subscription_events'
    AND column_name NOT IN ('id', 'user_id', 'new_user_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'subscription_events_new' AND column_name NOT IN ('id', 'user_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  IF has_new_user_id THEN
    select_expr := format('
      COALESCE(id, uuid_generate_v4()), 
      CASE 
        WHEN new_user_id IS NOT NULL THEN convert_id_to_uuid(new_user_id)
        WHEN user_id IS NOT NULL THEN convert_id_to_uuid(user_id)
        ELSE NULL
      END, 
      %s', column_names);
  ELSE
    select_expr := format('
      COALESCE(id, uuid_generate_v4()), 
      CASE WHEN user_id IS NOT NULL THEN convert_id_to_uuid(user_id) ELSE NULL END, 
      %s', column_names);
  END IF;
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO subscription_events_new (id, user_id, %s)
    SELECT %s
    FROM subscription_events
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  has_new_user_id boolean;
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Check if new_user_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'file_metadata' AND column_name = 'new_user_id'
  ) INTO has_new_user_id;

  -- Get the list of columns that exist in both tables (excluding id and user_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'file_metadata'
    AND column_name NOT IN ('id', 'user_id', 'new_user_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'file_metadata_new' AND column_name NOT IN ('id', 'user_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  IF has_new_user_id THEN
    select_expr := format('
      convert_id_to_uuid(id), 
      %s,
      CASE 
        WHEN new_user_id IS NOT NULL THEN convert_id_to_uuid(new_user_id)
        WHEN user_id IS NOT NULL THEN convert_id_to_uuid(user_id)
        ELSE NULL
      END', column_names);
  ELSE
    select_expr := format('
      convert_id_to_uuid(id), 
      %s,
      CASE WHEN user_id IS NOT NULL THEN convert_id_to_uuid(user_id) ELSE NULL END', column_names);
  END IF;
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO file_metadata_new (id, %s, user_id)
    SELECT %s
    FROM file_metadata
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

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

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  has_new_user_id boolean;
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Check if new_user_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'system_events' AND column_name = 'new_user_id'
  ) INTO has_new_user_id;

  -- Get the list of columns that exist in both tables (excluding id and user_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'system_events'
    AND column_name NOT IN ('id', 'user_id', 'new_user_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'system_events_new' AND column_name NOT IN ('id', 'user_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  IF has_new_user_id THEN
    select_expr := format('
      convert_id_to_uuid(id), 
      %s,
      CASE 
        WHEN new_user_id IS NOT NULL THEN convert_id_to_uuid(new_user_id)
        ELSE NULL
      END', column_names);
  ELSE
    select_expr := format('
      convert_id_to_uuid(id), 
      %s,
      NULL', column_names);
  END IF;
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO system_events_new (id, %s, user_id)
    SELECT %s
    FROM system_events
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

-- 14. Migrate storage_files table
-- Create temporary table with UUID structure
CREATE TABLE storage_files_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id) NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id and user_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'storage_files'
    AND column_name NOT IN ('id', 'user_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'storage_files_new' AND column_name NOT IN ('id', 'user_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  select_expr := format('
    convert_id_to_uuid(id), 
    convert_id_to_uuid(user_id),
    %s', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO storage_files_new (id, user_id, %s)
    SELECT %s
    FROM storage_files
    WHERE user_id IS NOT NULL
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

-- Create index
CREATE INDEX idx_storage_files_new_user_id ON storage_files_new(user_id);

-- 15. Migrate storage_access_logs table
-- Create temporary table with UUID structure
CREATE TABLE storage_access_logs_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES clients_new(id) NOT NULL,
  file_id uuid REFERENCES storage_files_new(id) NOT NULL,
  access_time timestamptz DEFAULT now(),
  action text NOT NULL
);

-- Copy data with UUID conversion - dynamically build the column list
DO $$
DECLARE
  column_names text;
  select_expr text;
  insert_stmt text;
BEGIN
  -- Get the list of columns that exist in both tables (excluding id, user_id, and file_id)
  SELECT string_agg(column_name, ', ')
  FROM information_schema.columns
  WHERE table_name = 'storage_access_logs'
    AND column_name NOT IN ('id', 'user_id', 'file_id')
    AND column_name IN (
      SELECT column_name FROM information_schema.columns WHERE table_name = 'storage_access_logs_new' AND column_name NOT IN ('id', 'user_id', 'file_id')
    )
  INTO column_names;

  -- Build the SELECT expression with UUID conversions
  select_expr := format('
    convert_id_to_uuid(id), 
    convert_id_to_uuid(user_id),
    convert_id_to_uuid(file_id),
    %s', column_names);
  
  -- Build and execute the INSERT statement
  insert_stmt := format('
    INSERT INTO storage_access_logs_new (id, user_id, file_id, %s)
    SELECT %s
    FROM storage_access_logs
    WHERE user_id IS NOT NULL AND file_id IS NOT NULL
  ', column_names, select_expr);
  
  EXECUTE insert_stmt;
END $$;

-- Create indexes
CREATE INDEX idx_storage_access_logs_new_user_id ON storage_access_logs_new(user_id);
CREATE INDEX idx_storage_access_logs_new_file_id ON storage_access_logs_new(file_id);

-- 16. Migrate ai_chat_logs and chatbot_logs tables
-- These already use UUIDs as primary keys, so we don't need to migrate them

-- 17. Drop old tables and rename new ones
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
DROP TABLE IF EXISTS yachts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;

-- Rename new tables
ALTER TABLE clients_new RENAME TO clients;
ALTER TABLE bookings_new RENAME TO bookings;
ALTER TABLE yachts_new RENAME TO yachts;
ALTER TABLE payments_new RENAME TO payments;
ALTER TABLE notifications_new RENAME TO notifications;
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

-- Rename indexes
ALTER INDEX clients_new_email_key RENAME TO clients_email_key;
ALTER INDEX idx_clients_new_email RENAME TO idx_clients_email;
ALTER INDEX idx_bookings_new_client_id RENAME TO idx_bookings_client_id;
ALTER INDEX idx_bookings_new_yacht_id RENAME TO idx_bookings_yacht_id;
ALTER INDEX idx_payments_new_booking_id RENAME TO idx_payments_booking_id;
ALTER INDEX idx_notifications_new_recipient_id RENAME TO idx_notifications_recipient_id;
ALTER INDEX idx_notifications_new_booking_id RENAME TO idx_notifications_booking_id;
ALTER INDEX idx_webhook_logs_new_webhook_id RENAME TO idx_webhook_logs_webhook_id;
ALTER INDEX idx_subscription_events_new_user_id RENAME TO idx_subscription_events_user_id;
ALTER INDEX idx_file_metadata_new_user_id RENAME TO idx_file_metadata_user_id;
ALTER INDEX idx_storage_files_new_user_id RENAME TO idx_storage_files_user_id;
ALTER INDEX idx_storage_access_logs_new_user_id RENAME TO idx_storage_access_logs_user_id;
ALTER INDEX idx_storage_access_logs_new_file_id RENAME TO idx_storage_access_logs_file_id;

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
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

-- Create RLS policies for yachts
CREATE POLICY "Anonymous can view yachts"
  ON yachts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can access yachts"
  ON yachts
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
  USING (true)
  WITH CHECK (true);

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
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for file_metadata
CREATE POLICY "Authenticated can access file metadata"
  ON file_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

-- Drop the conversion function as it's no longer needed
DROP FUNCTION IF EXISTS convert_id_to_uuid;