import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cmsService, type CMSContent } from '../services/cms';

interface UseCMSContentOptions {
  fallbackLanguage?: string;
  fallbackTranslationKey?: string;
}

export const useCMSContent = (
  slug: string, 
  options: UseCMSContentOptions = {}
) => {
  const { i18n, t } = useTranslation();
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    fallbackLanguage = 'en',
    fallbackTranslationKey
  } = options;

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const cmsContent = await cmsService.getContentWithFallback(
          slug, 
          i18n.language, 
          fallbackLanguage
        );
        
        if (cmsContent) {
          setContent(cmsContent.content);
          setTitle(cmsContent.title);
        } else if (fallbackTranslationKey) {
          setContent(t(fallbackTranslationKey));
          setTitle(t(fallbackTranslationKey));
        } else {
          throw new Error(`Content not found for slug: ${slug}`);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
        
        if (fallbackTranslationKey) {
          setContent(t(fallbackTranslationKey));
          setTitle(t(fallbackTranslationKey));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [slug, i18n.language, fallbackLanguage, t, fallbackTranslationKey]);

  return { content, title, isLoading, error };
};

export const useMultipleCMSContent = (
  slugs: string[],
  options: UseCMSContentOptions = {}
) => {
  const { i18n } = useTranslation();
  const [contentMap, setContentMap] = useState<Map<string, CMSContent>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fallbackLanguage = 'en' } = options;

  useEffect(() => {
    const fetchMultipleContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const contentArray = await cmsService.getMultipleContent(
          slugs, 
          i18n.language
        );
        
        // If some content is missing in current language, try fallback
        const missingContent = slugs.filter(slug => 
          !contentArray.find(content => content.slug === slug)
        );
        
        if (missingContent.length > 0 && i18n.language !== fallbackLanguage) {
          const fallbackContent = await cmsService.getMultipleContent(
            missingContent,
            fallbackLanguage
          );
          contentArray.push(...fallbackContent);
        }
        
        const map = new Map<string, CMSContent>();
        contentArray.forEach(content => {
          map.set(content.slug, content);
        });
        
        setContentMap(map);
      } catch (err) {
        console.error('Error fetching multiple content:', err);
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slugs.length > 0) {
      fetchMultipleContent();
    } else {
      setIsLoading(false);
    }
  }, [slugs, i18n.language, fallbackLanguage]);

  // Helper function to get content by slug
  const getContentBySlug = (slug: string): CMSContent | undefined => {
    return contentMap.get(slug);
  };

  return { 
    contentMap, 
    isLoading, 
    error, 
    getContentBySlug,
    content: contentMap // For backward compatibility
  };
};