import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, AlertTriangle } from 'lucide-react';
import { stripeService } from '../../services/stripe';
import SEOHead from '../../components/SEOHead';
import { OrderHistory } from '../../components/payment';

interface Order {
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // In a real application, this would fetch from the API
        // const data = await stripeService.getUserOrders();
        
        // For demo purposes, we'll use mock data
        const mockOrders = [
          {
            order_id: 12345,
            checkout_session_id: 'cs_test_1234567890',
            payment_intent_id: 'pi_1234567890',
            amount_total: 19900,
            currency: 'eur',
            payment_status: 'paid',
            order_status: 'completed',
            order_date: new Date().toISOString(),
          },
          {
            order_id: 12344,
            checkout_session_id: 'cs_test_0987654321',
            payment_intent_id: 'pi_0987654321',
            amount_total: 39800,
            currency: 'eur',
            payment_status: 'paid',
            order_status: 'completed',
            order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          },
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        setError(t('orders.fetchError', 'Failed to load order history'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [t]);

  const handleViewReceipt = (orderId: number) => {
    // In a real application, this would fetch and display the receipt
    alert(t('orders.receiptDemo', 'In a real application, this would show the receipt for order #{{orderId}}', { orderId }));
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('orders.title', 'Order History')}
        description={t('orders.description', 'View your order history with Garda Racing Yacht Club')}
        url="/account/orders"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('orders.title', 'Order History')}
          </h1>
          <p className="text-gray-600">
            {t('orders.description', 'View your order history with Garda Racing Yacht Club')}
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

        <OrderHistory
          orders={orders}
          loading={loading}
          onViewReceipt={handleViewReceipt}
        />

        <div className="mt-8 bg-blue-50 p-6 rounded-xl">
          <div className="flex items-start space-x-4">
            <ShoppingBag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                {t('orders.needHelp', 'Need Help With an Order?')}
              </h3>
              <p className="text-blue-800 mb-4">
                {t('orders.helpText', 'If you have any questions about your orders or need assistance, our customer support team is here to help.')}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium"
              >
                {t('orders.contactSupport', 'Contact Support')} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;