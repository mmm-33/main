/*
  # Fix booking RLS policies

  1. Security Changes
    - Drop and recreate conflicting policies
    - Allow anonymous users to create clients for booking
    - Allow anonymous users to read clients and yachts for validation
    - Create proper booking insertion policy with foreign key validation

  2. Changes Made
    - Fixed client creation and reading policies for anonymous users
    - Updated booking policy to validate foreign key references
    - Added yacht reading policy for booking validation
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Anonymous users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Allow anon to create new clients" ON clients;
DROP POLICY IF EXISTS "Anonymous users can read yachts for booking" ON yachts;

-- Recreate client policy to allow anonymous users to create and reference clients
CREATE POLICY "Anonymous users can create clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can read clients for booking"
  ON clients
  FOR SELECT
  TO anon
  USING (true);

-- Create yacht reading policy for booking validation
CREATE POLICY "Anonymous users can read yachts for booking"
  ON yachts
  FOR SELECT
  TO anon
  USING (status IN ('available', 'active'));

-- Recreate booking policy with proper conditions
CREATE POLICY "Anonymous users can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Allow if client_id exists and is accessible
    (client_id IS NULL OR EXISTS (
      SELECT 1 FROM clients WHERE id = client_id
    ))
    AND
    -- Allow if yacht_id is null or references an available yacht
    (yacht_id IS NULL OR EXISTS (
      SELECT 1 FROM yachts WHERE id = yacht_id AND status IN ('available', 'active')
    ))
  );