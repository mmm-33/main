/*
  # Create chat messages table with language support

  1. New Tables
    - Updates `messages` table to add language column
  2. Security
    - Maintains existing RLS policies
*/

-- Add language column to messages table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'language'
  ) THEN
    ALTER TABLE messages ADD COLUMN language text DEFAULT 'en';
  END IF;
END $$;

-- Create index on language column
CREATE INDEX IF NOT EXISTS messages_language_idx ON messages (language);

-- Ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist (these should already be in place)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Anyone can insert messages'
  ) THEN
    CREATE POLICY "Anyone can insert messages" ON messages
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Anyone can view messages by session'
  ) THEN
    CREATE POLICY "Anyone can view messages by session" ON messages
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;