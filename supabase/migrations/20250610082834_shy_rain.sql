/*
  # Create yachts table and fix booking system

  1. New Tables
    - `yachts` table with all necessary columns and constraints

  2. Security
    - Enable RLS on `yachts` table
    - Create policies for authenticated and anonymous users

  3. Sample Data
    - Insert sample yachts for the booking system

  4. Updates
    - Make yacht_id optional in bookings table
*/

-- Create yachts table
CREATE TABLE IF NOT EXISTS yachts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('active', 'available', 'booked', 'maintenance')),
  skipper text,
  location text,
  next_booking timestamptz,
  maintenance_due date,
  total_hours integer DEFAULT 0,
  last_service date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_yachts_status ON yachts (status);
CREATE INDEX IF NOT EXISTS idx_yachts_name ON yachts (name);

-- Enable Row Level Security
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can manage yachts" ON yachts;
DROP POLICY IF EXISTS "Anonymous users can view available yachts" ON yachts;

-- Create policies
CREATE POLICY "Authenticated users can manage yachts"
ON yachts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can view available yachts"
ON yachts
FOR SELECT
TO anon
USING (status IN ('available', 'active'));

-- Create updated_at trigger (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_yachts_updated_at' 
    AND tgrelid = 'yachts'::regclass
  ) THEN
    CREATE TRIGGER set_yachts_updated_at
      BEFORE UPDATE ON yachts
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Insert sample yachts
INSERT INTO yachts (name, status, skipper, location, last_service) VALUES
  ('Bavaria 34 "Garda Wind"', 'available', 'Marco Benedetti', 'Riva del Garda', '2024-01-15'),
  ('Bavaria 34 "Lake Spirit"', 'available', 'Andreas Mueller', 'Riva del Garda', '2024-01-20'),
  ('Bavaria 34 "Alpine Breeze"', 'available', 'Sofia Rossi', 'Riva del Garda', '2024-01-10')
ON CONFLICT (name) DO NOTHING;

-- Update bookings table to make yacht_id optional (only if column exists and is NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'yacht_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE bookings ALTER COLUMN yacht_id DROP NOT NULL;
  END IF;
END $$;