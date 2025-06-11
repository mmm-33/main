// Mock CMS service for static content
// This replaces the previous Supabase-based CMS

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

// Static content map for common pages
const staticContent: Record<string, Record<string, CMSContent>> = {
  'en': {
    'privacy-policy-title': {
      id: '1',
      slug: 'privacy-policy-title',
      title: 'Privacy Policy',
      content: 'Privacy Policy',
      language: 'en',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    'terms-of-service-title': {
      id: '2',
      slug: 'terms-of-service-title',
      title: 'Terms of Service',
      content: 'Terms of Service',
      language: 'en',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    'cancellation-policy-title': {
      id: '3',
      slug: 'cancellation-policy-title',
      title: 'Cancellation Policy',
      content: 'Cancellation Policy',
      language: 'en',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

export const cmsService = {
  // Get content by slug and language
  async getContent(slug: string, language: string = 'en'): Promise<CMSContent | null> {
    try {
      return staticContent[language]?.[slug] || null;
    } catch (error) {
      console.error('Error in getContent:', error);
      return null;
    }
  },

  // Get multiple content items by slugs and language
  async getMultipleContent(slugs: string[], language: string = 'en'): Promise<CMSContent[]> {
    try {
      return slugs
        .map(slug => staticContent[language]?.[slug])
        .filter(content => content !== undefined) as CMSContent[];
    } catch (error) {
      console.error('Error in getMultipleContent:', error);
      return [];
    }
  },

  // Get all content for a specific language
  async getAllContent(language: string = 'en'): Promise<CMSContent[]> {
    try {
      return Object.values(staticContent[language] || {});
    } catch (error) {
      console.error('Error in getAllContent:', error);
      return [];
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