/*
  # Fix RLS policy for bookings table

  1. Security
    - Allow anonymous users to insert bookings (for public booking form)
    - Keep existing policies for authenticated users
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow anon to insert bookings" ON bookings;

-- Create new policy to allow anonymous users to insert bookings
CREATE POLICY "Allow anon to insert bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);