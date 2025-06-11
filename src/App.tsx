import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Import i18n configuration
import './i18n';

// Layout components (keep these as regular imports since they're used on every page)
import { Header, Footer } from './components/layout';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';

// Components (keep these as regular imports since they're used frequently)
import ChatWidget from './components/ChatWidget';

// Utils
import { monitoring, accessibility } from './utils';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const CancellationPolicyPage = lazy(() => import('./pages/CancellationPolicyPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PaymentMethodsPage = lazy(() => import('./pages/account/PaymentMethodsPage'));
const SubscriptionsPage = lazy(() => import('./pages/account/SubscriptionsPage'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ClientPortalPage = lazy(() => import('./pages/ClientPortalPage'));

// Enhanced loading component with better UX
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
      <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 mx-auto">
        <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
);

// Error fallback component for lazy loading errors
const LazyLoadErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Page</h2>
      <p className="text-gray-600 mb-6">There was an error loading this page. Please try again.</p>
      <div className="space-y-3">
        <button
          onClick={retry}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
);

// Custom Suspense wrapper with error boundary for lazy components
const LazyComponentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={LazyLoadErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    if (import.meta.env.PROD) {
      monitoring.measureCoreWebVitals();
    }

    // Setup accessibility listeners
    const cleanupAccessibility = accessibility.setupAccessibilityListeners();

    // Preload critical resources
    const criticalImages = [
      '/IMG_0967.webp',
      'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical routes after initial load
    const preloadRoutes = () => {
      // Preload the most likely next pages
      import('./pages/ExperiencePage');
      import('./pages/BookingPage');
    };

    // Preload after a short delay to not interfere with initial load
    const preloadTimer = setTimeout(preloadRoutes, 2000);

    return () => {
      cleanupAccessibility();
      clearTimeout(preloadTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <SkipLink />
            <Header />
            <main id="main-content">
              <LazyComponentWrapper>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/experience" element={<ExperiencePage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/account/payment-methods" element={<PaymentMethodsPage />} />
                  <Route path="/account/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/account/orders" element={<OrdersPage />} />
                  <Route path="/portal" element={<ClientPortalPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </LazyComponentWrapper>
            </main>
            <Footer />
            <ChatWidget />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;