import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass, Phone, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title="Page Not Found - Garda Racing Yacht Club"
        description="Page not found - The page you are looking for does not exist."
        url="/404"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-12">
            <div className="relative inline-block">
              <div className="text-9xl font-bold text-primary-100 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Compass className="h-24 w-24 text-primary-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              It seems you've sailed off course! Let us help you navigate back to safe waters.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link
              to="/"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Home className="h-8 w-8 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold text-gray-900 mb-2">Home</h3>
              <p className="text-sm text-gray-600">Return to our homepage</p>
            </Link>

            <Link
              to="/experience"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Compass className="h-8 w-8 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
              <p className="text-sm text-gray-600">Learn about our sailing adventures</p>
            </Link>

            <Link
              to="/booking"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">€</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Booking</h3>
              <p className="text-sm text-gray-600">Reserve your sailing experience</p>
            </Link>

            <Link
              to="/contact"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Phone className="h-8 w-8 text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-sm text-gray-600">Get in touch with our team</p>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/"
              className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            
            <a
              href="tel:+393456789012"
              className="bg-transparent border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 hover:text-white transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Call for Help</span>
            </a>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Assistance?</h2>
            <p className="text-gray-700 mb-6">
              If you were looking for something specific or believe this is an error, our team is here to help you find what you need.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <Phone className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 mb-3">Speak directly with our team</p>
                <a
                  href="tel:+393456789012"
                  className="text-primary-600 hover:underline font-medium"
                >
                  +39 345 678 9012
                </a>
              </div>
              
              <div className="text-center">
                <Mail className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 mb-3">We respond within 24 hours</p>
                <a
                  href="mailto:info@gardaracing.com"
                  className="text-primary-600 hover:underline font-medium"
                >
                  info@gardaracing.com
                </a>
              </div>
            </div>
          </div>

          {/* Fun Sailing Fact */}
          <div className="mt-12 bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">⛵ Did You Know?</h3>
            <p className="text-blue-800 text-sm">
              Lake Garda's unique thermal winds create perfect sailing conditions almost every day. The morning "Peler" wind from the north and afternoon "Ora" wind from the south make it one of Europe's most reliable sailing destinations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;