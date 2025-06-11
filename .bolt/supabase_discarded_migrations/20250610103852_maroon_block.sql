/*
  # Create tables for event handling functionality

  1. New Tables
    - `event_handlers` - Stores registered event handlers
    - `event_logs` - Logs event processing
    - `webhooks` - Stores webhook configurations
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create event_handlers table
CREATE TABLE IF NOT EXISTS event_handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  handler_type text NOT NULL,
  handler_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_handlers_event_name ON event_handlers(event_name);
CREATE INDEX IF NOT EXISTS idx_event_handlers_is_active ON event_handlers(is_active);

-- Create event_logs table
CREATE TABLE IF NOT EXISTS event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  payload jsonb,
  status text NOT NULL,
  error_message text,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_logs_event_name ON event_logs(event_name);
CREATE INDEX IF NOT EXISTS idx_event_logs_status ON event_logs(status);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON event_logs(created_at);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_triggered_at timestamptz
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);

-- Enable Row Level Security
ALTER TABLE event_handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for event_handlers
CREATE POLICY "Authenticated users can view event handlers"
  ON event_handlers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage event handlers"
  ON event_handlers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create policies for event_logs
CREATE POLICY "Authenticated users can view event logs"
  ON event_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert event logs"
  ON event_logs
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Create policies for webhooks
CREATE POLICY "Authenticated users can view webhooks"
  ON webhooks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage webhooks"
  ON webhooks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE TRIGGER update_event_handlers_updated_at
BEFORE UPDATE ON event_handlers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON webhooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update webhook last_triggered_at
CREATE OR REPLACE FUNCTION update_webhook_last_triggered()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE webhooks
  SET last_triggered_at = now()
  WHERE id = NEW.webhook_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to process events
CREATE OR REPLACE FUNCTION process_event(
  event_name text,
  payload jsonb
)
RETURNS void AS $$
DECLARE
  handler record;
  webhook record;
  start_time timestamptz;
  end_time timestamptz;
  processing_time integer;
  log_id uuid;
BEGIN
  -- Log event start
  start_time := clock_timestamp();
  
  -- Insert event log
  INSERT INTO event_logs (event_name, payload, status)
  VALUES (event_name, payload, 'processing')
  RETURNING id INTO log_id;
  
  -- Process event handlers
  FOR handler IN
    SELECT * FROM event_handlers
    WHERE event_name = process_event.event_name
    AND is_active = true
  LOOP
    BEGIN
      -- Process handler based on type
      CASE handler.handler_type
        WHEN 'function' THEN
          -- Call function handler
          PERFORM execute_function_handler(handler.handler_config, payload);
        WHEN 'notification' THEN
          -- Create notification
          PERFORM create_notification_from_event(handler.handler_config, payload);
        WHEN 'webhook' THEN
          -- Trigger webhook
          PERFORM trigger_webhook_from_event(handler.handler_config, event_name, payload);
        ELSE
          RAISE EXCEPTION 'Unknown handler type: %', handler.handler_type;
      END CASE;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue processing other handlers
        RAISE WARNING 'Error processing event handler %: %', handler.id, SQLERRM;
    END;
  END LOOP;
  
  -- Trigger webhooks
  FOR webhook IN
    SELECT * FROM webhooks
    WHERE event_name = ANY(events)
    AND is_active = true
  LOOP
    BEGIN
      -- Call webhook
      PERFORM pg_notify(
        'webhook',
        json_build_object(
          'webhook_id', webhook.id,
          'url', webhook.url,
          'event', event_name,
          'payload', payload,
          'secret', webhook.secret
        )::text
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue processing other webhooks
        RAISE WARNING 'Error triggering webhook %: %', webhook.id, SQLERRM;
    END;
  END LOOP;
  
  -- Calculate processing time
  end_time := clock_timestamp();
  processing_time := extract(epoch from (end_time - start_time)) * 1000;
  
  -- Update event log
  UPDATE event_logs
  SET status = 'completed',
      processing_time_ms = processing_time
  WHERE id = log_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Update event log with error
    UPDATE event_logs
    SET status = 'error',
        error_message = SQLERRM
    WHERE id = log_id;
    
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Helper function to execute function handler
CREATE OR REPLACE FUNCTION execute_function_handler(
  config jsonb,
  payload jsonb
)
RETURNS void AS $$
DECLARE
  func_name text;
BEGIN
  func_name := config->>'function_name';
  
  IF func_name IS NULL THEN
    RAISE EXCEPTION 'Function name is required in handler config';
  END IF;
  
  -- Execute function dynamically
  EXECUTE format('SELECT %I($1)', func_name) USING payload;
END;
$$ LANGUAGE plpgsql;

-- Helper function to create notification from event
CREATE OR REPLACE FUNCTION create_notification_from_event(
  config jsonb,
  payload jsonb
)
RETURNS void AS $$
DECLARE
  notification_data jsonb;
BEGIN
  -- Build notification data
  notification_data := json_build_object(
    'type', config->>'notification_type',
    'title', config->>'title',
    'message', config->>'message',
    'recipient_id', payload->>'user_id',
    'channel', config->>'channel',
    'status', 'pending'
  );
  
  -- Insert notification
  INSERT INTO notifications (
    type, title, message, recipient_id, channel, status
  )
  VALUES (
    notification_data->>'type',
    notification_data->>'title',
    notification_data->>'message',
    (notification_data->>'recipient_id')::uuid,
    notification_data->>'channel',
    notification_data->>'status'
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to trigger webhook from event
CREATE OR REPLACE FUNCTION trigger_webhook_from_event(
  config jsonb,
  event_name text,
  payload jsonb
)
RETURNS void AS $$
BEGIN
  -- Notify webhook channel
  PERFORM pg_notify(
    'webhook',
    json_build_object(
      'url', config->>'url',
      'event', event_name,
      'payload', payload,
      'secret', config->>'secret'
    )::text
  );
END;
$$ LANGUAGE plpgsql;