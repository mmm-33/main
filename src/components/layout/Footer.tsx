import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Anchor, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Award, Shield, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Anchor className="h-8 w-8 text-primary-500" />
              <div>
                <h3 className="text-xl font-bold">Garda Racing</h3>
                <p className="text-gray-400 text-sm">Yacht Club</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/experience" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  {t('navigation.experience')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  {t('navigation.booking')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Via del Porto 15</p>
                  <p className="text-gray-300">38066 Riva del Garda, TN</p>
                  <p className="text-gray-300">Italy</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500" />
                <a href="tel:+393456789012" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  +39 345 678 9012
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500" />
                <a href="mailto:info@gardaracing.com" className="text-gray-300 hover:text-primary-500 transition-colors duration-300">
                  info@gardaracing.com
                </a>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.certifications')}</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-gold-400" />
                <span className="text-gray-300 text-sm">RYA Certified</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-gray-300 text-sm">Fully Insured</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300 text-sm">24/7 Support</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">{t('footer.operatingHours')}</p>
              <p className="text-sm text-white">{t('footer.dailyHours')}</p>
              <p className="text-sm text-gray-400">{t('footer.season')}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-400">
              <Link to="/privacy-policy" className="hover:text-primary-500 transition-colors duration-300">
                {t('navigation.privacy')}
              </Link>
              <Link to="/terms-of-service" className="hover:text-primary-500 transition-colors duration-300">
                {t('navigation.terms')}
              </Link>
              <Link to="/cancellation-policy" className="hover:text-primary-500 transition-colors duration-300">
                {t('navigation.cancellation')}
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;