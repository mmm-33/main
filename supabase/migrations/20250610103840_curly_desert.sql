/*
  # Create tables for storage functionality

  1. New Tables
    - `storage_files` - Tracks file metadata
    - `storage_access_logs` - Logs file access events
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create storage_files table
CREATE TABLE IF NOT EXISTS storage_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  size bigint NOT NULL,
  mime_type text,
  metadata jsonb,
  path text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz
);

-- Create unique index for bucket_id and path
CREATE UNIQUE INDEX IF NOT EXISTS idx_storage_files_bucket_path ON storage_files(bucket_id, path);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_storage_files_owner_id ON storage_files(owner_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_bucket_id ON storage_files(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_created_at ON storage_files(created_at);

-- Create storage_access_logs table
CREATE TABLE IF NOT EXISTS storage_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES storage_files(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_storage_access_logs_file_id ON storage_access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_storage_access_logs_user_id ON storage_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_access_logs_created_at ON storage_access_logs(created_at);

-- Enable Row Level Security
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_files
CREATE POLICY "Users can view public files"
  ON storage_files
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Users can view their own files"
  ON storage_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own files"
  ON storage_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files"
  ON storage_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files"
  ON storage_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create policies for storage_access_logs
CREATE POLICY "Users can view their own access logs"
  ON storage_access_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert access logs"
  ON storage_access_logs
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Create function to update storage_files.updated_at
CREATE OR REPLACE FUNCTION update_storage_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update storage_files.updated_at
CREATE TRIGGER update_storage_files_updated_at
BEFORE UPDATE ON storage_files
FOR EACH ROW
EXECUTE FUNCTION update_storage_files_updated_at();

-- Create function to update storage_files.last_accessed_at
CREATE OR REPLACE FUNCTION update_storage_files_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE storage_files
  SET last_accessed_at = now()
  WHERE id = NEW.file_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update storage_files.last_accessed_at
CREATE TRIGGER update_storage_files_last_accessed
AFTER INSERT ON storage_access_logs
FOR EACH ROW
WHEN (NEW.action = 'download' OR NEW.action = 'view')
EXECUTE FUNCTION update_storage_files_last_accessed();