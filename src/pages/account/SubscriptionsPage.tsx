import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, AlertTriangle, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { stripeService } from '../../services/stripe';
import { Button } from '../../components/ui';
import SEOHead from '../../components/SEOHead';
import { SubscriptionCard } from '../../components/payment';

interface Subscription {
  subscription_id: string;
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand: string;
  payment_method_last4: string;
}

const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        // In a real application, this would fetch from the API
        // const data = await stripeService.getUserSubscription();
        
        // For demo purposes, we'll use mock data
        const mockSubscription = {
          subscription_id: 'sub_1234567890',
          subscription_status: 'active',
          price_id: 'price_1234567890',
          current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
          current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15, // 15 days from now
          cancel_at_period_end: false,
          payment_method_brand: 'visa',
          payment_method_last4: '4242',
        };
        
        setSubscription(mockSubscription);
      } catch (err) {
        setError(t('subscription.fetchError', 'Failed to load subscription details'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [t]);

  const handleManageSubscription = async () => {
    try {
      // In a real application, this would redirect to the Stripe Customer Portal
      // const { url } = await stripeService.getCustomerPortalUrl(window.location.origin + '/account/subscriptions');
      // window.location.href = url;
      
      // For demo purposes, we'll just show an alert
      alert(t('subscription.manageDemo', 'In a real application, this would redirect to the Stripe Customer Portal'));
    } catch (err) {
      setError(t('subscription.portalError', 'Failed to open customer portal'));
      console.error(err);
    }
  };

  const handleCancelSubscription = async () => {
    setIsConfirmingCancel(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      // In a real application, this would call the API to cancel the subscription
      // await stripeService.cancelSubscription(subscription.subscription_id);
      
      // For demo purposes, we'll just update the local state
      if (subscription) {
        setSubscription({
          ...subscription,
          cancel_at_period_end: true,
        });
      }
      
      setIsConfirmingCancel(false);
    } catch (err) {
      setError(t('subscription.cancelError', 'Failed to cancel subscription'));
      console.error(err);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('subscription.title', 'Your Subscription')}
        description={t('subscription.description', 'Manage your subscription to Garda Racing Yacht Club')}
        url="/account/subscriptions"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('subscription.title', 'Your Subscription')}
          </h1>
          <p className="text-gray-600">
            {t('subscription.description', 'Manage your subscription to Garda Racing Yacht Club')}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : subscription ? (
          <>
            <SubscriptionCard
              status={subscription.subscription_status}
              currentPeriodEnd={subscription.current_period_end}
              paymentMethod={{
                brand: subscription.payment_method_brand,
                last4: subscription.payment_method_last4,
              }}
              price={{
                amount: 199,
                currency: 'eur',
                interval: 'month',
              }}
              onManage={handleManageSubscription}
              onCancel={handleCancelSubscription}
            />

            {isConfirmingCancel && (
              <div className="mt-6 bg-red-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  {t('subscription.confirmCancel', 'Confirm Cancellation')}
                </h3>
                <p className="text-red-800 mb-4">
                  {t('subscription.cancelWarning', 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')}
                </p>
                <div className="flex space-x-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsConfirmingCancel(false)}
                  >
                    {t('subscription.keepSubscription', 'Keep Subscription')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={confirmCancelSubscription}
                  >
                    {t('subscription.confirmCancelButton', 'Yes, Cancel')}
                  </Button>
                </div>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="mt-6 bg-yellow-50 p-6 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      {t('subscription.canceledInfo', 'Subscription Canceled')}
                    </h3>
                    <p className="text-yellow-800">
                      {t('subscription.accessUntil', 'Your subscription has been canceled. You will have access until {{date}}.', {
                        date: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
                      })}
                    </p>
                    <button
                      onClick={handleManageSubscription}
                      className="mt-4 text-yellow-900 underline hover:text-yellow-700"
                    >
                      {t('subscription.reactivate', 'Reactivate Subscription')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('subscription.noActive', 'No Active Subscription')}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('subscription.noActiveDesc', 'You don\'t have an active subscription. Subscribe to get premium features and benefits.')}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/pricing'}
            >
              {t('subscription.viewPlans', 'View Subscription Plans')}
            </Button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('subscription.benefits', 'Subscription Benefits')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.priorityBooking', 'Priority Booking')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.priorityBookingDesc', 'Get early access to booking slots before they open to the public')}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.extendedSessions', 'Extended Sessions')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.extendedSessionsDesc', 'Enjoy 30 minutes of additional sailing time with each booking')}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.discountedRates', 'Discounted Rates')}
              </h3>
              <p className="text-gray-600">
                {t('subscription.discountedRatesDesc', 'Save 15% on all bookings and special events')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;