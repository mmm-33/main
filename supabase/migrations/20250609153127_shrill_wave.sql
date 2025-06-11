/*
  # Update messages table for chat functionality

  1. Table Updates
    - Add `session_id` column if it doesn't exist
    - Add `sender` column if it doesn't exist
    - Add check constraint for sender values

  2. Security
    - Update RLS policies for chat functionality
    - Allow anonymous and authenticated users to insert and view messages

  3. Indexes
    - Add index on session_id for efficient session queries
*/

-- Add new columns to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN session_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'sender'
  ) THEN
    ALTER TABLE messages ADD COLUMN sender text DEFAULT 'user';
  END IF;
END $$;

-- Add check constraint for sender
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'messages_sender_check'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_sender_check 
    CHECK (sender IN ('user', 'bot'));
  END IF;
END $$;

-- Create index for session queries
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can insert messages'
  ) THEN
    DROP POLICY "Anyone can insert messages" ON messages;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can view messages'
  ) THEN
    DROP POLICY "Anyone can view messages" ON messages;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can view messages by session'
  ) THEN
    DROP POLICY "Anyone can view messages by session" ON messages;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Anyone can insert messages"
  ON messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages by session"
  ON messages
  FOR SELECT
  TO anon, authenticated
  USING (true);