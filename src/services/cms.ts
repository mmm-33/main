import { supabase } from './supabase';

export interface CMSContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  language: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const cmsService = {
  // Get content by slug and language
  async getContent(slug: string, language: string = 'en'): Promise<CMSContent | null> {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('slug', slug)
        .eq('language', language)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getContent:', error);
      return null;
    }
  },

  // Get multiple content items by slugs and language
  async getMultipleContent(slugs: string[], language: string = 'en'): Promise<CMSContent[]> {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .in('slug', slugs)
        .eq('language', language)
        .eq('published', true);

      if (error) {
        console.error('Error fetching multiple content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMultipleContent:', error);
      return [];
    }
  },

  // Get all content for a specific language
  async getAllContent(language: string = 'en'): Promise<CMSContent[]> {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('language', language)
        .eq('published', true)
        .order('slug');

      if (error) {
        console.error('Error fetching all content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllContent:', error);
      return [];
    }
  },

  // Create or update content
  async upsertContent(content: Omit<CMSContent, 'id' | 'created_at' | 'updated_at'>): Promise<CMSContent | null> {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .upsert(content, {
          onConflict: 'slug,language'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting content:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertContent:', error);
      return null;
    }
  },

  // Helper function to parse JSON content safely
  parseJsonContent(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  },

  // Helper function to get content with fallback to default language
  async getContentWithFallback(slug: string, language: string = 'en', fallbackLanguage: string = 'en'): Promise<CMSContent | null> {
    let content = await this.getContent(slug, language);
    
    // If content not found in requested language, try fallback
    if (!content && language !== fallbackLanguage) {
      content = await this.getContent(slug, fallbackLanguage);
    }
    
    return content;
  }
};