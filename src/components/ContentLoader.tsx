import React from 'react';
import { useCMSContent } from '../hooks/useCMSContent';

interface ContentLoaderProps {
  slug: string;
  fallbackTranslationKey?: string;
  className?: string;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  slug, 
  fallbackTranslationKey,
  className = ''
}) => {
  const { content, isLoading, error } = useCMSContent(slug, {
    fallbackTranslationKey
  });

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className={`text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  if (!content) {
    return null;
  }

  // Simple markdown-like rendering for basic formatting
  const renderContent = (text: string) => {
    // Convert markdown-style formatting to HTML
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="text-gray-700 mb-4">')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="text-gray-700">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc pl-6 text-gray-700 space-y-2 mb-6">$1</ul>');

    // Wrap in paragraph if not already wrapped
    if (!html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>') && !html.includes('<ul>')) {
      html = `<p class="text-gray-700 mb-4">${html}</p>`;
    }

    return html;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
};

export default ContentLoader;