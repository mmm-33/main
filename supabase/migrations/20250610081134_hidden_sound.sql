-- Create cms_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  language text NOT NULL DEFAULT 'en',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index for slug + language combination if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'cms_content' 
    AND indexname = 'cms_content_slug_language_idx'
  ) THEN
    CREATE UNIQUE INDEX cms_content_slug_language_idx 
    ON cms_content (slug, language);
  END IF;
END $$;

-- Create index for published content queries if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'cms_content' 
    AND indexname = 'cms_content_published_idx'
  ) THEN
    CREATE INDEX cms_content_published_idx 
    ON cms_content (published, language);
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'cms_content' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Policy for public read access to published content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cms_content' 
    AND policyname = 'Anyone can view published content'
  ) THEN
    CREATE POLICY "Anyone can view published content"
    ON cms_content
    FOR SELECT
    TO anon, authenticated
    USING (published = true);
  END IF;

  -- Policy for authenticated users to manage all content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cms_content' 
    AND policyname = 'Authenticated users can manage content'
  ) THEN
    CREATE POLICY "Authenticated users can manage content"
    ON cms_content
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_cms_content_updated_at'
  ) THEN
    CREATE TRIGGER set_cms_content_updated_at
      BEFORE UPDATE ON cms_content
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;