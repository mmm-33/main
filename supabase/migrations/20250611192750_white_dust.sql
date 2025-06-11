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
  yachts_exists BOOLEAN;
  messages_exists BOOLEAN;
  error_logs_exists BOOLEAN;
  sync_logs_exists BOOLEAN;
  
  -- Variables for dynamic column handling
  column_list TEXT;
  insert_stmt TEXT;
  select_stmt TEXT;
BEGIN
  -- Check which tables exist
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') INTO clients_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') INTO bookings_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') INTO payments_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') INTO notifications_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'yachts') INTO yachts_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') INTO messages_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'error_logs') INTO error_logs_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sync_logs') INTO sync_logs_exists;

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

    -- Get the list of columns that exist in the clients table
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'clients'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO clients_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM clients';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;

    -- Create index on email if email column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients_new' AND column_name = 'email') THEN
      CREATE INDEX idx_clients_new_email ON clients_new(email);
    END IF;
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

    -- Get the list of columns that exist in the yachts table
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'yachts'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO yachts_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM yachts';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;
  END IF;

  -- 3. Create and migrate bookings table if it exists
  IF bookings_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE bookings_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id uuid,
      yacht_id uuid,
      session_date date,
      session_time text,
      status text DEFAULT 'pending',
      payment_status text DEFAULT 'pending',
      amount numeric,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Get the list of columns that exist in the bookings table (excluding client_id and yacht_id)
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'bookings'
    AND column_name NOT IN ('client_id', 'yacht_id')
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO bookings_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM bookings';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;

    -- Create indexes
    CREATE INDEX idx_bookings_new_client_id ON bookings_new(client_id);
    CREATE INDEX idx_bookings_new_yacht_id ON bookings_new(yacht_id);
    
    -- Add foreign key constraints if the referenced tables exist
    IF clients_exists THEN
      ALTER TABLE bookings_new ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients_new(id);
    END IF;
    
    IF yachts_exists THEN
      ALTER TABLE bookings_new ADD CONSTRAINT bookings_yacht_id_fkey FOREIGN KEY (yacht_id) REFERENCES yachts_new(id);
    END IF;
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

    -- Get the list of columns that exist in the messages table
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'messages'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO messages_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM messages';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;
  END IF;

  -- 5. Create and migrate payments table if it exists
  IF payments_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE payments_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      booking_id uuid,
      amount numeric,
      payment_date timestamptz DEFAULT now(),
      status text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Get the list of columns that exist in the payments table (excluding booking_id)
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'payments'
    AND column_name != 'booking_id'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO payments_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM payments';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;

    -- Create index
    CREATE INDEX idx_payments_new_booking_id ON payments_new(booking_id);
    
    -- Add foreign key constraint if the referenced table exists
    IF bookings_exists THEN
      ALTER TABLE payments_new ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings_new(id);
    END IF;
  END IF;

  -- 6. Create and migrate notifications table if it exists
  IF notifications_exists THEN
    -- Create temporary table with UUID structure
    CREATE TABLE notifications_new (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      type text,
      title text,
      message text,
      recipient_id uuid,
      recipient_email text,
      channel text DEFAULT 'email',
      status text DEFAULT 'pending',
      booking_id uuid,
      is_read boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      read_at timestamptz
    );

    -- Get the list of columns that exist in the notifications table (excluding recipient_id and booking_id)
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'notifications'
    AND column_name NOT IN ('recipient_id', 'booking_id')
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO notifications_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM notifications';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;

    -- Create indexes
    CREATE INDEX idx_notifications_new_recipient_id ON notifications_new(recipient_id);
    CREATE INDEX idx_notifications_new_booking_id ON notifications_new(booking_id);
    
    -- Add foreign key constraints if the referenced tables exist
    IF clients_exists THEN
      ALTER TABLE notifications_new ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES clients_new(id);
    END IF;
    
    IF bookings_exists THEN
      ALTER TABLE notifications_new ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings_new(id);
    END IF;
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

    -- Get the list of columns that exist in the error_logs table
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'error_logs'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO error_logs_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM error_logs';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;
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

    -- Get the list of columns that exist in the sync_logs table
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns
    WHERE table_name = 'sync_logs'
    INTO column_list;
    
    -- Build dynamic INSERT statement
    insert_stmt := 'INSERT INTO sync_logs_new (id, ' || column_list || ') SELECT convert_id_to_uuid(ctid::text), ' || column_list || ' FROM sync_logs';
    
    -- Execute the dynamic INSERT
    EXECUTE insert_stmt;
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