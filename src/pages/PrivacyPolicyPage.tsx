import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import ContentLoader from '../components/ContentLoader';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('navigation.privacy')}
        description="Privacy policy for Garda Racing Yacht Club - how we collect, use, and protect your personal information."
        url="/privacy-policy"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">
            <ContentLoader 
              slug="privacy-policy-title" 
              fallbackTranslationKey="navigation.privacy" 
            />
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <ContentLoader 
              slug="privacy-policy-intro" 
              className="text-gray-600 mb-8"
            />

            <ContentLoader slug="privacy-policy-information-collected" />
            <ContentLoader slug="privacy-policy-information-use" />
            <ContentLoader slug="privacy-policy-information-sharing" />
            <ContentLoader slug="privacy-policy-data-security" />
            <ContentLoader slug="privacy-policy-your-rights" />
            <ContentLoader slug="privacy-policy-cookies" />
            <ContentLoader slug="privacy-policy-data-retention" />
            <ContentLoader slug="privacy-policy-international-transfers" />
            <ContentLoader slug="privacy-policy-childrens-privacy" />
            <ContentLoader slug="privacy-policy-changes" />
            <ContentLoader slug="privacy-policy-contact" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;