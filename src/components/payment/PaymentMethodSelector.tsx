import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  onSelect: (methodId: string) => void;
  selectedMethod?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod = 'card',
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(selectedMethod);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: t('payment.creditCard', 'Credit Card'),
      icon: <CreditCard className="h-5 w-5" />,
      description: t('payment.creditCardDesc', 'Pay securely with your credit or debit card'),
    },
    {
      id: 'deposit',
      name: t('payment.deposit', 'Pay Deposit'),
      icon: <DollarSign className="h-5 w-5" />,
      description: t('payment.depositDesc', 'Pay 30% now and the rest on the day'),
    },
    {
      id: 'wallet',
      name: t('payment.wallet', 'Digital Wallet'),
      icon: <Wallet className="h-5 w-5" />,
      description: t('payment.walletDesc', 'Pay with Apple Pay or Google Pay'),
    },
  ];

  const handleSelect = (methodId: string) => {
    setSelected(methodId);
    onSelect(methodId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {t('payment.selectMethod', 'Select Payment Method')}
      </h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              selected === method.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
            }`}
            onClick={() => handleSelect(method.id)}
          >
            <div className="flex items-center h-5">
              <input
                id={`payment-${method.id}`}
                name="payment-method"
                type="radio"
                checked={selected === method.id}
                onChange={() => handleSelect(method.id)}
                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                selected === method.id ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                {method.icon}
              </div>
              <div>
                <label
                  htmlFor={`payment-${method.id}`}
                  className="font-medium text-gray-900"
                >
                  {method.name}
                </label>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;