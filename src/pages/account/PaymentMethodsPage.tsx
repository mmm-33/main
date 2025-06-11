import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { stripeService } from '../../services/stripe';
import { Button } from '../../components/ui';
import SEOHead from '../../components/SEOHead';
import { StripeProvider } from '../../components/payment';

const PaymentMethodsPage: React.FC = () => {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        // This would be implemented in a real application
        // const methods = await stripeService.getPaymentMethods();
        // For demo purposes, we'll use mock data
        const mockMethods = [
          {
            id: 'pm_1234567890',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025,
            },
            isDefault: true,
          },
          {
            id: 'pm_0987654321',
            card: {
              brand: 'mastercard',
              last4: '5555',
              exp_month: 10,
              exp_year: 2024,
            },
            isDefault: false,
          },
        ];
        setPaymentMethods(mockMethods);
      } catch (err) {
        setError(t('payment.fetchError', 'Failed to load payment methods'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [t]);

  const handleAddCard = () => {
    setIsAddingCard(true);
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    try {
      // This would be implemented in a real application
      // await stripeService.removePaymentMethod(paymentMethodId);
      setPaymentMethods(paymentMethods.filter(method => method.id !== paymentMethodId));
    } catch (err) {
      setError(t('payment.removeError', 'Failed to remove payment method'));
      console.error(err);
    }
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    try {
      // This would be implemented in a real application
      // await stripeService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId,
      })));
    } catch (err) {
      setError(t('payment.defaultError', 'Failed to set default payment method'));
      console.error(err);
    }
  };

  const getCardIcon = (brand: string) => {
    // In a real application, you might want to use specific card brand icons
    return <CreditCard className="h-6 w-6" />;
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('payment.methods', 'Payment Methods')}
        description={t('payment.methodsDesc', 'Manage your payment methods for Garda Racing Yacht Club')}
        url="/account/payment-methods"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('payment.methods', 'Payment Methods')}
          </h1>
          <p className="text-gray-600">
            {t('payment.methodsDesc', 'Manage your payment methods for Garda Racing Yacht Club')}
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('payment.savedCards', 'Saved Cards')}
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddCard}
              icon={Plus}
            >
              {t('payment.addCard', 'Add Card')}
            </Button>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="p-6 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('payment.noCards', 'No payment methods')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('payment.noCardsDesc', 'Add a payment method to make checkout faster.')}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddCard}
                icon={Plus}
              >
                {t('payment.addCard', 'Add Card')}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getCardIcon(method.card.brand)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t('payment.expires', 'Expires {{month}}/{{year}}', {
                          month: method.card.exp_month.toString().padStart(2, '0'),
                          year: method.card.exp_year.toString().slice(-2),
                        })}
                      </div>
                      {method.isDefault && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('payment.default', 'Default')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultCard(method.id)}
                      >
                        {t('payment.setDefault', 'Set as default')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleRemoveCard(method.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAddingCard && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t('payment.addNewCard', 'Add New Card')}
            </h2>
            <StripeProvider>
              {/* In a real application, you would implement a form to add a new card */}
              <div className="text-center p-8">
                <p className="text-gray-600 mb-4">
                  {t('payment.cardFormPlaceholder', 'Card form would be implemented here in a real application')}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setIsAddingCard(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </StripeProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsPage;