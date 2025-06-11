import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Award, Camera, MapPin, Star, Wind, Anchor, Trophy, Shield, Clock, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useLanguage } from '../hooks/useLanguage';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  // Переведенные отзывы для каждого языка
  const getTestimonials = () => {
    return [
      {
        name: "Marco Rossi",
        location: "Munich, Germany",
        rating: 5,
        text: t('testimonials.marco.text'),
        image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      {
        name: "Sarah Johnson",
        location: "London, UK",
        rating: 5,
        text: t('testimonials.sarah.text'),
        image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      {
        name: "Andreas Mueller",
        location: "Vienna, Austria",
        rating: 5,
        text: t('testimonials.andreas.text'),
        image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      }
    ];
  };

  const testimonials = getTestimonials();

  const features = [
    {
      icon: Users,
      title: t('features.professionalSkipper.title'),
      description: t('features.professionalSkipper.description')
    },
    {
      icon: Trophy,
      title: t('features.realRacing.title'),
      description: t('features.realRacing.description')
    },
    {
      icon: Camera,
      title: t('features.photosIncluded.title'),
      description: t('features.photosIncluded.description')
    },
    {
      icon: Shield,
      title: t('features.fullyInsured.title'),
      description: t('features.fullyInsured.description')
    }
  ];

  const stats = [
    { number: "2000+", label: t('stats.happySailors') },
    { number: "500+", label: t('stats.racesCompleted') },
    { number: "15", label: t('stats.yearsExperience') },
    { number: "4.9", label: t('stats.averageRating') }
  ];

  return (
    <div className="overflow-hidden">
      <SEOHead />
      
      {/* Main content with proper ID for skip link */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="absolute inset-0">
            <img
              src="/IMG_0967.webp"
              alt="Yacht racing on Lake Garda with professional skipper and participants enjoying sailing experience"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-slide-up pt-8 sm:pt-12 md:pt-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif">
                {t('hero.title')}
                <span className="block text-gold-300">{t('hero.titleHighlight')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
              
              {/* Price & CTA */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 max-w-md mx-auto border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gold-300 mb-2">{formatCurrency(199)}</div>
                  <p className="text-white/80">{t('hero.priceSubtext')}</p>
                </div>
                
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center space-x-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{t('features.professionalSkipper.title')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{t('features.realRacing.title')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{t('features.photosIncluded.title')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>{t('features.fullyInsured.title')}</span>
                  </div>
                </div>
                
                <Link
                  to="/booking"
                  className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                  aria-label={`${t('hero.bookNow')} ${formatCurrency(199)}`}
                >
                  {t('hero.bookNow')}
                </Link>
              </div>

              {/* Quick Booking Widget */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 max-w-lg mx-auto border border-white/10">
                <p className="text-white/80 mb-4">{t('hero.checkAvailability')}</p>
                <div className="flex space-x-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    aria-label="Select your preferred date"
                  />
                  <Link
                    to="/booking"
                    className="bg-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
                    aria-label="Check availability for selected date"
                  >
                    {t('common.search')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50" aria-labelledby="stats-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="stats-heading" className="sr-only">Our achievements and statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                {t('features.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors duration-300">
                    <feature.icon className="h-10 w-10 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Preview */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-primary-50" aria-labelledby="experience-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 id="experience-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                  {t('experience.title')}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0" aria-hidden="true">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('experience.step1.title')}</h3>
                      <p className="text-gray-600">{t('experience.step1.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0" aria-hidden="true">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('experience.step2.title')}</h3>
                      <p className="text-gray-600">{t('experience.step2.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex-shrink-0 font-semibold flex items-center justify-center" aria-hidden="true">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('experience.step3.title')}</h3>
                      <p className="text-gray-600">{t('experience.step3.description')}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    to="/experience"
                    className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Learn more about our yacht racing experience"
                  >
                    {t('experience.learnMore')}
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional sailing instruction and yacht racing on Lake Garda"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Wind className="h-8 w-8 text-blue-500" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">{t('location.idealConditions.title')}</p>
                      <p className="text-sm text-gray-600">{t('weather.excellent')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                {t('testimonials.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('testimonials.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <article key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gold-400 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</blockquote>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} from ${testimonial.location}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <cite className="font-semibold text-gray-900 not-italic">{testimonial.name}</cite>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white" aria-labelledby="location-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 id="location-heading" className="text-4xl md:text-5xl font-bold mb-6 font-serif">
                  {t('location.title')}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{t('location.perfectLocation.title')}</h3>
                      <p className="text-white/80">{t('location.perfectLocation.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Anchor className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{t('location.idealConditions.title')}</h3>
                      <p className="text-white/80">{t('location.idealConditions.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{t('location.dailyDepartures.title')}</h3>
                      <p className="text-white/80">{t('location.dailyDepartures.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Beautiful Lake Garda marina in Riva del Garda with mountains in background"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-6 -right-6 bg-gold-500 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">4.9★</p>
                    <p className="text-sm">{t('stats.averageRating')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600 text-white" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                aria-label="Book your yacht racing experience now"
              >
                {t('cta.bookExperience')}
              </Link>
              <a
                href="tel:+393456789012"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                aria-label="Call us at +39 345 678 9012"
              >
                {t('cta.callNow')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;