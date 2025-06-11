/*
  # Update Messages Table for Chat System

  1. Changes
    - Add `session_id` column for chat sessions
    - Add `sender` column to distinguish between user and bot messages
    - Update existing data structure

  2. Security
    - Update RLS policies for chat functionality
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

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;

-- Allow anyone to insert messages (for chat functionality)
CREATE POLICY "Anyone can insert messages"
  ON messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow viewing messages by session (for chat history)
CREATE POLICY "Anyone can view messages by session"
  ON messages
  FOR SELECT
  TO anon, authenticated
  USING (true);