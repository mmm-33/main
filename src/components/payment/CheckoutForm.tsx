import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../ui';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  amount,
  currency = 'EUR',
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    if (!stripe) {
      return;
    }
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      elements.getElement(CardElement)?.focus();
      return;
    }

    if (!cardComplete) {
      setError(t('payment.incompleteCard', 'Please complete your card details'));
      return;
    }

    if (!cardholderName) {
      setError(t('payment.nameRequired', 'Cardholder name is required'));
      return;
    }

    setProcessing(true);

    try {
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (payload.error) {
        setError(payload.error.message || 'An error occurred with your payment');
        onError?.(new Error(payload.error.message || 'Payment failed'));
      } else {
        setError(null);
        setSucceeded(true);
        onSuccess?.(payload.paymentIntent);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onError?.(err as Error);
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start space-x-3">
          <CreditCard className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">{t('booking.secureProcessing')}</h3>
            <p className="text-blue-800 text-sm">
              {t('booking.secureProcessingDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('booking.cardholderName')}
          </label>
          <input
            id="cardholderName"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={processing || succeeded}
          />
        </div>

        <div>
          <label htmlFor="card-element" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('booking.cardNumber')}
          </label>
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent bg-white">
            <CardElement
              id="card-element"
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => {
                setError(e.error ? e.error.message : '');
                setCardComplete(e.complete);
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {succeeded && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{t('payment.success', 'Payment successful!')}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-gray-700">
          <span className="text-sm">{t('booking.total')}:</span>
          <span className="ml-2 font-semibold text-lg">{formatAmount(amount, currency)}</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={processing || succeeded || !stripe || !cardComplete}
          loading={processing}
        >
          {processing
            ? t('booking.processing')
            : succeeded
            ? t('payment.paid', 'Paid')
            : t('payment.pay', 'Pay') + ' ' + formatAmount(amount, currency)}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;