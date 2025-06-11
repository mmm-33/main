/*
  # Fix RLS policies for bookings table

  1. Security Updates
    - Drop existing conflicting policies on bookings table
    - Create proper RLS policy to allow anonymous users to insert bookings
    - Ensure authenticated users can manage all bookings
    - Keep existing policies for clients table as they appear to be working

  2. Changes
    - Remove duplicate INSERT policies on bookings table
    - Add clear policy for anonymous booking creation
    - Maintain security while allowing public booking submissions
*/

-- Drop existing policies on bookings table to avoid conflicts
DROP POLICY IF EXISTS "Allow anon to insert bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;

-- Create new policies for bookings table
CREATE POLICY "Anonymous users can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view and manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure clients table policies allow anonymous access for booking creation
-- (These should already exist based on the schema, but let's make sure)
DO $$
BEGIN
  -- Check if the anon insert policy exists for clients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Allow anon to create new clients'
  ) THEN
    CREATE POLICY "Allow anon to create new clients"
      ON clients
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  -- Check if the anon select policy exists for clients
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Allow anon to read clients for lookup'
  ) THEN
    CREATE POLICY "Allow anon to read clients for lookup"
      ON clients
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;