/*
  # Create messages table for chat functionality

  1. New Tables
    - `messages`
      - `id` (bigint, primary key, auto-increment)
      - `text` (text, required)
      - `session_id` (text, optional for grouping chat sessions)
      - `sender` (text, either 'user' or 'bot', defaults to 'user')
      - `inserted_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for anyone to insert messages (for chat functionality)
    - Add policy for anyone to view messages (for chat history)

  3. Indexes
    - Add index on session_id for efficient session queries
*/

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text text NOT NULL,
  session_id text,
  sender text DEFAULT 'user' CHECK (sender IN ('user', 'bot')),
  inserted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create index for session queries
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);

-- Create index for timestamp queries
CREATE INDEX IF NOT EXISTS messages_inserted_at_idx ON messages(inserted_at);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages by session" ON messages;

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