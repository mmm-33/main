import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X, HelpCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { stripeService } from '../services/stripe';
import { Button } from '../components/ui';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  priceId: string;
  popular?: boolean;
}

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: t('pricing.basic.name', 'Basic'),
      description: t('pricing.basic.description', 'Perfect for occasional sailors'),
      price: billingInterval === 'month' ? 29 : 290,
      interval: billingInterval,
      features: [
        t('pricing.basic.feature1', 'Priority booking (24h advance)'),
        t('pricing.basic.feature2', '10% discount on all experiences'),
        t('pricing.basic.feature3', 'Basic sailing tutorials'),
        t('pricing.basic.feature4', 'Standard customer support'),
      ],
      priceId: billingInterval === 'month' ? 'price_basic_monthly' : 'price_basic_yearly',
    },
    {
      id: 'premium',
      name: t('pricing.premium.name', 'Premium'),
      description: t('pricing.premium.description', 'For enthusiastic sailors'),
      price: billingInterval === 'month' ? 49 : 490,
      interval: billingInterval,
      features: [
        t('pricing.premium.feature1', 'Priority booking (48h advance)'),
        t('pricing.premium.feature2', '15% discount on all experiences'),
        t('pricing.premium.feature3', 'Advanced sailing tutorials'),
        t('pricing.premium.feature4', 'Priority customer support'),
        t('pricing.premium.feature5', 'One free experience per month'),
      ],
      priceId: billingInterval === 'month' ? 'price_premium_monthly' : 'price_premium_yearly',
      popular: true,
    },
    {
      id: 'pro',
      name: t('pricing.pro.name', 'Pro'),
      description: t('pricing.pro.description', 'For dedicated sailing enthusiasts'),
      price: billingInterval === 'month' ? 99 : 990,
      interval: billingInterval,
      features: [
        t('pricing.pro.feature1', 'Priority booking (72h advance)'),
        t('pricing.pro.feature2', '25% discount on all experiences'),
        t('pricing.pro.feature3', 'Professional sailing tutorials'),
        t('pricing.pro.feature4', 'VIP customer support'),
        t('pricing.pro.feature5', 'Two free experiences per month'),
        t('pricing.pro.feature6', 'Exclusive access to special events'),
      ],
      priceId: billingInterval === 'month' ? 'price_pro_monthly' : 'price_pro_yearly',
    },
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      setIsProcessing(true);
      setProcessingPlanId(plan.id);
      
      // In a real application, this would redirect to Stripe Checkout
      // const { url } = await stripeService.createSubscriptionSession({
      //   priceId: plan.priceId,
      //   successUrl: `${window.location.origin}/account/subscriptions?success=true`,
      //   cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      // });
      // window.location.href = url;
      
      // For demo purposes, we'll just show an alert
      alert(t('pricing.demoAlert', 'In a real application, this would redirect to Stripe Checkout to subscribe to the {{plan}} plan', { plan: plan.name }));
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(t('pricing.error', 'An error occurred. Please try again.'));
    } finally {
      setIsProcessing(false);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('pricing.title', 'Membership Plans')}
        description={t('pricing.description', 'Choose a membership plan for Garda Racing Yacht Club')}
        url="/pricing"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
            {t('pricing.title', 'Membership Plans')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle', 'Choose the perfect membership plan for your sailing adventures on Lake Garda')}
          </p>
          
          <div className="mt-8 flex justify-center">
            <div className="bg-white p-1 rounded-lg shadow-sm inline-flex">
              <button
                onClick={() => setBillingInterval('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  billingInterval === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('pricing.monthly', 'Monthly')}
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  billingInterval === 'year'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('pricing.yearly', 'Yearly')}
                <span className="ml-1 text-xs font-normal">
                  ({t('pricing.savePercent', 'Save 17%')})
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-primary-600 transform md:-translate-y-2' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary-600 text-white text-center py-2 text-sm font-semibold">
                  {t('pricing.mostPopular', 'Most Popular')}
                </div>
              )}
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{billingInterval}</span>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => handleSubscribe(plan)}
                  loading={isProcessing && processingPlanId === plan.id}
                  icon={CreditCard}
                >
                  {t('pricing.subscribe', 'Subscribe')}
                </Button>
              </div>
              
              <div className="px-8 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('pricing.includes', 'Includes:')}
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('pricing.faq', 'Frequently Asked Questions')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('pricing.faq1.question', 'What are the benefits of a membership?')}
              </h3>
              <p className="text-gray-700">
                {t('pricing.faq1.answer', 'Membership gives you priority booking, discounts on all experiences, access to exclusive tutorials, and dedicated customer support. Higher tier plans include free monthly experiences and access to special events.')}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('pricing.faq2.question', 'Can I cancel my subscription anytime?')}
              </h3>
              <p className="text-gray-700">
                {t('pricing.faq2.answer', 'Yes, you can cancel your subscription at any time. You will continue to have access to your membership benefits until the end of your current billing period.')}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('pricing.faq3.question', 'How do I use my free experiences?')}
              </h3>
              <p className="text-gray-700">
                {t('pricing.faq3.answer', 'Free experiences are automatically credited to your account each month. When booking, you\'ll see an option to use your free experience credit at checkout.')}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('pricing.faq4.question', 'What payment methods do you accept?')}
              </h3>
              <p className="text-gray-700">
                {t('pricing.faq4.answer', 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support Apple Pay and Google Pay for digital wallet payments.')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            {t('pricing.questions', 'Have more questions about our membership plans?')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            {t('pricing.contactUs', 'Contact our membership team')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;