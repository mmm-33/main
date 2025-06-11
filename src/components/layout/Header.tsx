import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Anchor, Phone, Search } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import { Button } from '../ui';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { t } = useTranslation();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.experience'), href: '/experience' },
    { name: t('navigation.booking'), href: '/booking' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  const headerClasses = `
    fixed w-full z-50 transition-all duration-300 ease-in-out
    ${isScrolled 
      ? 'bg-white/98 backdrop-blur-xl shadow-xl border-b border-gray-200/80' 
      : 'bg-black/20 backdrop-blur-md'
    }
  `;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Anchor className={`h-10 w-10 ${isScrolled ? 'text-primary-600' : 'text-white'}`} />
            <div>
              <h1 className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                Garda Racing
              </h1>
              <p className={`text-sm ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}>
                Yacht Club
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-all duration-300 ${
                    isActive
                      ? isScrolled ? 'text-primary-600' : 'text-gold-300'
                      : isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-gold-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            <Button
              variant={isScrolled ? 'primary' : 'outline'}
              size="md"
              icon={Phone}
              onClick={() => window.location.href = 'tel:+393456789012'}
            >
              {t('cta.callNow').split(' ')[0]}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-xl rounded-lg shadow-xl mb-4 border border-gray-200/80">
            <div className="px-6 py-6 space-y-4">
              <LanguageSwitcher />
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block py-3 px-4 font-medium text-gray-700 hover:text-primary-600 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
              
              <Button
                variant="primary"
                size="lg"
                icon={Phone}
                fullWidth
                onClick={() => window.location.href = 'tel:+393456789012'}
              >
                {t('cta.callNow')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;