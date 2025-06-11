import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/IMG_0967.webp',
  url,
  type = 'website'
}) => {
  const { t, i18n } = useTranslation();
  
  // Get translated meta content
  const defaultTitle = t('meta.defaultTitle');
  const defaultDescription = t('meta.defaultDescription');
  const defaultKeywords = t('meta.keywords');
  
  const fullTitle = title || defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullUrl = url ? `https://gardaracing.com${url}` : 'https://gardaracing.com';
  const fullImage = image.startsWith('http') ? image : `https://gardaracing.com${image}`;

  // Generate alternate language links
  const alternateLinks = Object.keys(supportedLanguages).map(lang => ({
    lang,
    url: lang === 'en' ? fullUrl : `${fullUrl}?lang=${lang}`
  }));

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={i18n.language} dir={supportedLanguages[i18n.language as keyof typeof supportedLanguages]?.dir || 'ltr'} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="Garda Racing Yacht Club" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Alternate language links */}
      {alternateLinks.map(({ lang, url: altUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={altUrl} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={t('meta.defaultDescription')} />
      <meta property="og:site_name" content="Garda Racing Yacht Club" />
      <meta property="og:locale" content={i18n.language.replace('-', '_')} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:image:alt" content={t('meta.defaultDescription')} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#dc2626" />
      <meta name="msapplication-TileColor" content="#dc2626" />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          "name": "Garda Racing Yacht Club",
          "description": fullDescription,
          "url": fullUrl,
          "image": {
            "@type": "ImageObject",
            "url": fullImage,
            "description": t('meta.defaultDescription')
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Via del Porto 15",
            "addressLocality": "Riva del Garda",
            "postalCode": "38066",
            "addressRegion": "TN",
            "addressCountry": "IT"
          },
          "telephone": "+393456789012",
          "email": "info@gardaracing.com",
          "priceRange": "€199",
          "openingHours": "Mo-Su 08:00-19:00",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "45.8847",
            "longitude": "10.8405"
          },
          "availableLanguage": Object.keys(supportedLanguages),
          "inLanguage": i18n.language,
          "offers": {
            "@type": "Offer",
            "price": "199",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-03-01",
            "validThrough": "2024-10-31",
            "description": fullDescription
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;