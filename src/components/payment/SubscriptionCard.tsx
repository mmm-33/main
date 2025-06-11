import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '../ui';

interface SubscriptionCardProps {
  status: string;
  currentPeriodEnd?: number;
  paymentMethod?: {
    brand?: string;
    last4?: string;
  };
  price?: {
    amount: number;
    currency: string;
    interval: string;
  };
  onManage?: () => void;
  onCancel?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  status,
  currentPeriodEnd,
  paymentMethod,
  price,
  onManage,
  onCancel,
}) => {
  const { t } = useTranslation();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'bg-green-100 text-green-800';
      case 'past_due':
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'past_due':
      case 'incomplete':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'canceled':
      case 'unpaid':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('subscription.title', 'Your Subscription')}
            </h3>
            {price && (
              <p className="text-gray-600">
                {formatCurrency(price.amount, price.currency)}/{price.interval}
              </p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{status}</span>
          </div>
        </div>

        <div className="space-y-4">
          {currentPeriodEnd && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {status === 'canceled' 
                  ? t('subscription.endsOn', 'Ends on {{date}}', { date: formatDate(currentPeriodEnd) })
                  : t('subscription.renewsOn', 'Renews on {{date}}', { date: formatDate(currentPeriodEnd) })}
              </span>
            </div>
          )}

          {paymentMethod && paymentMethod.brand && paymentMethod.last4 && (
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>
                {t('subscription.paymentMethod', 'Payment method: {{brand}} •••• {{last4}}', {
                  brand: paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1),
                  last4: paymentMethod.last4,
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        {onManage && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onManage}
          >
            {t('subscription.manage', 'Manage Subscription')}
          </Button>
        )}

        {onCancel && status !== 'canceled' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            {t('subscription.cancel', 'Cancel')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;