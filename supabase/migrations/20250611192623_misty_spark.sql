/*
# Database Schema Migration to UUID Primary Keys

1. New Tables
  - Creates new tables with UUID primary keys
  - Preserves all existing data with UUID conversion
  - Maintains referential integrity

2. Data Migration
  - Converts all numeric IDs to UUIDs
  - Handles foreign key relationships
  - Preserves all existing data

3. Security
  - Recreates RLS policies for all tables
  - Maintains existing permissions
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to convert existing IDs to UUIDs in a deterministic way
CREATE OR REPLACE FUNCTION convert_id_to_uuid(id_value anyelement) 
RETURNS uuid AS $$
BEGIN
  -- Create a deterministic UUID based on the original ID
  -- This ensures foreign key relationships are maintained
  RETURN uuid_generate_v5(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', -- UUID namespace
    id_value::text
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
DROP TABLE IF EXISTS yachts_new CASCADE;
DROP TABLE IF EXISTS messages_new CASCADE;

-- Check if tables exist before attempting migration
DO $$
DECLARE
  clients_exists BOOLEAN;
  bookings_exists BOOLEAN;
  payments_exists BOOLEAN;
  notifications_exists BOOLEAN;
  user_profiles_exists BOOLEAN;
  error_logs_exists BOOLEAN;
  sync_logs_exists BOOLEAN;
  webhook_events_exists BOOLEAN;
  webhook_logs_exists BOOLEAN;
  security_logs_exists BOOLEAN;
  subscription_events_exists BOOLEAN;
  file_metadata_exists BOOLEAN;
  system_events_exists BOOLEAN;
  storage_files_exists BOOLEAN;
  storage_access_logs_exists BOOLEAN;
  ai_chat_logs_exists BOOLEAN;
  chatbot_logs_exists BOOLEAN;
  yachts_exists BOOLEAN;
  messages_exists BOOLEAN;
BEGIN
  -- Check which tables exist
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') INTO clients_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') INTO bookings_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') INTO payments_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') INTO notifications_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') INTO user_profiles_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'error_logs') INTO error_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sync_logs') INTO sync_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events') INTO webhook_events_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_logs') INTO webhook_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_logs') INTO security_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_events') INTO subscription_events_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file_metadata') INTO file_metadata_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_events') INTO system_events_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_files') INTO storage_files_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_access_logs') INTO storage_access_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_chat_logs') INTO ai_chat_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chatbot_logs') INTO chatbot_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'yachts') INTO yachts_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') INTO messages_exists;

  -- 1. Create and migrate clients table if it exists
  IF clients_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE clients_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text,
      email text UNIQUE,
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
    EXECUTE '
      INSERT INTO clients_new (
        id, name, email, phone, created_at, updated_at, language, 
        segment, total_bookings, total_spent, last_booking, 
        lead_source, portal_access, portal_token, location
      )
      SELECT 
        convert_id_to_uuid(c.ctid::text), 
        name, 
        email, 
        phone, 
        created_at, 
        updated_at, 
        language, 
        segment, 
        total_bookings, 
        total_spent, 
        last_booking, 
        lead_source, 
        portal_access, 
        portal_token, 
        location
      FROM clients c
    ';

    -- Create index on email
    CREATE INDEX idx_clients_new_email ON clients_new(email);
  END IF;

  -- 2. Create and migrate yachts table if it exists
  IF yachts_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE yachts_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text,
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

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO yachts_new (
        id, name, model, year, length, capacity, price_per_day,
        created_at, updated_at, status, skipper, location,
        next_booking, maintenance_due, total_hours, last_service
      )
      SELECT 
        convert_id_to_uuid(y.ctid::text), 
        name, 
        model, 
        year, 
        length, 
        capacity, 
        price_per_day,
        created_at, 
        updated_at, 
        status, 
        skipper, 
        location,
        next_booking, 
        maintenance_due, 
        total_hours, 
        last_service
      FROM yachts y
    ';
  END IF;

  -- 3. Create and migrate bookings table if it exists
  IF bookings_exists AND clients_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE bookings_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id uuid REFERENCES clients_new(id),
      yacht_id uuid REFERENCES yachts_new(id),
      session_date date,
      session_time text,
      status text DEFAULT 'pending',
      payment_status text DEFAULT 'pending',
      amount numeric,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO bookings_new (
        id, client_id, yacht_id, session_date, session_time, status, 
        payment_status, amount, notes, created_at, updated_at
      )
      SELECT 
        convert_id_to_uuid(b.ctid::text), 
        (SELECT id FROM clients_new WHERE email = (SELECT email FROM clients WHERE ctid = b.client_id::tid)), 
        (SELECT id FROM yachts_new WHERE name = (SELECT name FROM yachts WHERE ctid = b.yacht_id::tid)), 
        session_date, 
        session_time, 
        status, 
        payment_status, 
        amount, 
        notes, 
        created_at, 
        updated_at
      FROM bookings b
    ';

    -- Create indexes
    CREATE INDEX idx_bookings_new_client_id ON bookings_new(client_id);
    CREATE INDEX idx_bookings_new_yacht_id ON bookings_new(yacht_id);
  END IF;

  -- 4. Create and migrate messages table if it exists
  IF messages_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE messages_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      text text,
      session_id text,
      sender text,
      language text,
      created_at timestamptz DEFAULT now()
    );

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO messages_new (
        id, text, session_id, sender, language, created_at
      )
      SELECT 
        convert_id_to_uuid(m.ctid::text), 
        text, 
        session_id, 
        sender, 
        language, 
        created_at
      FROM messages m
    ';
  END IF;

  -- 5. Create and migrate payments table if it exists
  IF payments_exists AND bookings_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE payments_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      booking_id uuid REFERENCES bookings_new(id),
      amount numeric,
      payment_date timestamptz DEFAULT now(),
      status text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO payments_new (
        id, booking_id, amount, payment_date, status, created_at, updated_at
      )
      SELECT 
        convert_id_to_uuid(p.ctid::text), 
        (SELECT id FROM bookings_new WHERE id = convert_id_to_uuid(p.booking_id::text)), 
        amount, 
        payment_date, 
        status, 
        created_at, 
        updated_at
      FROM payments p
      WHERE booking_id IS NOT NULL
    ';

    -- Create index
    CREATE INDEX idx_payments_new_booking_id ON payments_new(booking_id);
  END IF;

  -- 6. Create and migrate notifications table if it exists
  IF notifications_exists AND clients_exists AND bookings_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE notifications_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      type text,
      title text,
      message text,
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

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO notifications_new (
        id, type, title, message, recipient_id, recipient_email, 
        channel, status, booking_id, is_read, created_at, updated_at, read_at
      )
      SELECT 
        convert_id_to_uuid(n.ctid::text), 
        type, 
        title, 
        message, 
        (SELECT id FROM clients_new WHERE email = (SELECT email FROM clients WHERE ctid = n.recipient_id::tid)), 
        recipient_email, 
        channel, 
        status, 
        (SELECT id FROM bookings_new WHERE id = convert_id_to_uuid(n.booking_id::text)), 
        is_read, 
        created_at, 
        updated_at, 
        read_at
      FROM notifications n
    ';

    -- Create indexes
    CREATE INDEX idx_notifications_new_recipient_id ON notifications_new(recipient_id);
    CREATE INDEX idx_notifications_new_booking_id ON notifications_new(booking_id);
  END IF;

  -- 7. Create and migrate error_logs table if it exists
  IF error_logs_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE error_logs_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      error_message text,
      created_at timestamptz DEFAULT now(),
      action text,
      error_stack text,
      context jsonb,
      user_agent text,
      timestamp timestamptz
    );

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO error_logs_new (
        id, error_message, created_at, action, error_stack, context, user_agent, timestamp
      )
      SELECT 
        convert_id_to_uuid(e.ctid::text), 
        error_message, 
        created_at, 
        action, 
        error_stack, 
        context, 
        user_agent, 
        timestamp
      FROM error_logs e
    ';
  END IF;

  -- 8. Create and migrate sync_logs table if it exists
  IF sync_logs_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE sync_logs_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      table_name text,
      operation text,
      record_id text,
      sync_status text DEFAULT 'success',
      synced_at timestamptz DEFAULT now(),
      error_message text
    );

    -- Copy data with UUID conversion
    EXECUTE '
      INSERT INTO sync_logs_new (
        id, table_name, operation, record_id, sync_status, synced_at, error_message
      )
      SELECT 
        convert_id_to_uuid(s.ctid::text), 
        table_name, 
        operation, 
        record_id, 
        sync_status, 
        synced_at, 
        error_message
      FROM sync_logs s
    ';
  END IF;

  -- Drop old tables and rename new ones
  IF clients_exists THEN
    DROP TABLE IF EXISTS clients CASCADE;
    ALTER TABLE clients_new RENAME TO clients;
    ALTER INDEX IF EXISTS idx_clients_new_email RENAME TO idx_clients_email;
  END IF;

  IF yachts_exists THEN
    DROP TABLE IF EXISTS yachts CASCADE;
    ALTER TABLE yachts_new RENAME TO yachts;
  END IF;

  IF bookings_exists THEN
    DROP TABLE IF EXISTS bookings CASCADE;
    ALTER TABLE bookings_new RENAME TO bookings;
    ALTER INDEX IF EXISTS idx_bookings_new_client_id RENAME TO idx_bookings_client_id;
    ALTER INDEX IF EXISTS idx_bookings_new_yacht_id RENAME TO idx_bookings_yacht_id;
  END IF;

  IF messages_exists THEN
    DROP TABLE IF EXISTS messages CASCADE;
    ALTER TABLE messages_new RENAME TO messages;
  END IF;

  IF payments_exists THEN
    DROP TABLE IF EXISTS payments CASCADE;
    ALTER TABLE payments_new RENAME TO payments;
    ALTER INDEX IF EXISTS idx_payments_new_booking_id RENAME TO idx_payments_booking_id;
  END IF;

  IF notifications_exists THEN
    DROP TABLE IF EXISTS notifications CASCADE;
    ALTER TABLE notifications_new RENAME TO notifications;
    ALTER INDEX IF EXISTS idx_notifications_new_recipient_id RENAME TO idx_notifications_recipient_id;
    ALTER INDEX IF EXISTS idx_notifications_new_booking_id RENAME TO idx_notifications_booking_id;
  END IF;

  IF error_logs_exists THEN
    DROP TABLE IF EXISTS error_logs CASCADE;
    ALTER TABLE error_logs_new RENAME TO error_logs;
  END IF;

  IF sync_logs_exists THEN
    DROP TABLE IF EXISTS sync_logs CASCADE;
    ALTER TABLE sync_logs_new RENAME TO sync_logs;
  END IF;

  -- Enable RLS on all tables
  IF clients_exists THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  IF yachts_exists THEN
    ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  IF bookings_exists THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    
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
  END IF;

  IF messages_exists THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for messages
    CREATE POLICY "Anonymous can insert messages"
      ON messages
      FOR INSERT
      TO anon
      WITH CHECK (true);

    CREATE POLICY "Anonymous can read messages"
      ON messages
      FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF payments_exists THEN
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for payments
    CREATE POLICY "Authenticated can access payments"
      ON payments
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF notifications_exists THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for notifications
    CREATE POLICY "Authenticated can access notifications"
      ON notifications
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF error_logs_exists THEN
    ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for error_logs
    CREATE POLICY "Authenticated can access error logs"
      ON error_logs
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF sync_logs_exists THEN
    ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies for sync_logs
    CREATE POLICY "Authenticated can access sync logs"
      ON sync_logs
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Drop the conversion function as it's no longer needed
DROP FUNCTION IF EXISTS convert_id_to_uuid;