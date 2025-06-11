/*
  # Create CMS Content Management System

  1. New Tables
    - `cms_content`
      - `id` (uuid, primary key)
      - `slug` (text, unique per language)
      - `title` (text)
      - `content` (text)
      - `meta_description` (text, optional)
      - `language` (text, default 'en')
      - `published` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cms_content` table
    - Add policies for public read access to published content
    - Add policies for authenticated admin users to manage content
*/

CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  language text NOT NULL DEFAULT 'en',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for slug per language
CREATE UNIQUE INDEX IF NOT EXISTS cms_content_slug_language_idx ON cms_content(slug, language);

-- Create index for published content
CREATE INDEX IF NOT EXISTS cms_content_published_idx ON cms_content(published, language);

-- Enable RLS
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published content
CREATE POLICY "Anyone can view published content"
  ON cms_content
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Policy for authenticated users to manage content
CREATE POLICY "Authenticated users can manage content"
  ON cms_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Insert default content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('privacy-policy', 'Privacy Policy', 'Default privacy policy content', 'Privacy policy for Garda Racing Yacht Club', 'en', true),
('terms-of-service', 'Terms of Service', 'Default terms of service content', 'Terms of service for Garda Racing Yacht Club', 'en', true),
('cancellation-policy', 'Cancellation Policy', 'Default cancellation policy content', 'Cancellation policy for Garda Racing Yacht Club', 'en', true)
ON CONFLICT (slug, language) DO NOTHING;