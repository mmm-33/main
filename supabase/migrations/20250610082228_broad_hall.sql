/*
  # Add RLS policies for anonymous users to access clients table

  1. Security Changes
    - Add policy for anonymous users to INSERT new client records
    - Add policy for anonymous users to SELECT client records (for email lookup)
    
  2. Important Notes
    - This allows the booking system to work for anonymous users
    - The SELECT policy is necessary for the getOrCreateClient function
    - In production, consider more restrictive policies or server-side functions
*/

-- Add RLS policy for anon users to insert into clients table
CREATE POLICY "Allow anon to create new clients"
ON public.clients
FOR INSERT
TO anon
WITH CHECK (true);

-- Add RLS policy for anon users to select from clients table
-- This is needed for the getOrCreateClient function to check if a client exists
CREATE POLICY "Allow anon to read clients for lookup"
ON public.clients
FOR SELECT
TO anon
USING (true);