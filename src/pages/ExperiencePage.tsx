import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Clock, Users, Award, Camera, Wind, Anchor, MapPin, CheckCircle, Star, Calendar } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const ExperiencePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = [
    {
      url: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: t('experience.gallery.racing')
    },
    {
      url: "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: t('experience.gallery.harbor')
    },
    {
      url: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: t('experience.gallery.instruction')
    },
    {
      url: "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800",
      caption: t('experience.gallery.ceremony')
    }
  ];

  const schedule = [
    { time: "08:30", activity: t('schedule.welcomeRegistration'), description: t('experience.schedule.welcome.description') },
    { time: "09:00", activity: t('schedule.safetyBriefing'), description: t('experience.schedule.safety.description') },
    { time: "09:30", activity: t('schedule.sailingBasics'), description: t('experience.schedule.basics.description') },
    { time: "10:30", activity: t('schedule.firstRace'), description: t('experience.schedule.practice.description') },
    { time: "12:00", activity: t('schedule.lunchBreak'), description: t('experience.schedule.lunch.description') },
    { time: "13:30", activity: t('schedule.championshipRace'), description: t('experience.schedule.championship.description') },
    { time: "15:30", activity: t('schedule.finalRace'), description: t('experience.schedule.final.description') },
    { time: "16:30", activity: t('schedule.medalCeremony'), description: t('experience.schedule.medal.description') },
    { time: "17:00", activity: t('schedule.photoSession'), description: t('experience.schedule.photo.description') }
  ];

  const equipment = [
    t('experience.equipment.yacht'),
    t('experience.equipment.safety'),
    t('experience.equipment.gear'),
    t('experience.equipment.racing'),
    t('experience.equipment.firstAid'),
    t('experience.equipment.waterproof')
  ];

  const weatherConditions = [
    { condition: t('weather.windSpeed'), value: "8-15 knots", icon: Wind },
    { condition: t('weather.temperature'), value: "18-28°C", icon: Clock },
    { condition: t('weather.visibility'), value: t('weather.excellent'), icon: Star },
    { condition: t('weather.waterTemp'), value: "16-24°C", icon: Anchor }
  ];

  const faqs = [
    {
      question: t('experience.faq.experience.question'),
      answer: t('experience.faq.experience.answer')
    },
    {
      question: t('experience.faq.bring.question'),
      answer: t('experience.faq.bring.answer')
    },
    {
      question: t('experience.faq.weather.question'),
      answer: t('experience.faq.weather.answer')
    },
    {
      question: t('experience.faq.people.question'),
      answer: t('experience.faq.people.answer')
    },
    {
      question: t('experience.faq.meals.question'),
      answer: t('experience.faq.meals.answer')
    },
    {
      question: t('experience.faq.camera.question'),
      answer: t('experience.faq.camera.answer')
    }
  ];

  return (
    <div className="pt-20">
      <SEOHead
        title={t('experience.title')}
        description={t('experience.subtitle')}
        url="/experience"
      />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
                {t('experience.hero.title')}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t('experience.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-gold-400" />
                  <span>{t('experience.hero.duration')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Users className="h-5 w-5 text-gold-400" />
                  <span>{t('experience.hero.people')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Award className="h-5 w-5 text-gold-400" />
                  <span>{t('experience.hero.medal')}</span>
                </div>
              </div>
              <Link
                to="/booking"
                className="bg-gold-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gold-600 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
              >
                {t('cta.bookExperience')}
              </Link>
            </div>
            <div className="relative">
              <img
                src={galleryImages[selectedImage].url}
                alt={galleryImages[selectedImage].caption}
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-center">{galleryImages[selectedImage].caption}</p>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl hover:bg-black/30 transition-colors duration-300 group">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: t('experience.tabs.overview') },
              { id: 'schedule', label: t('experience.tabs.schedule') },
              { id: 'gallery', label: t('experience.tabs.gallery') },
              { id: 'weather', label: t('experience.tabs.weather') },
              { id: 'equipment', label: t('experience.tabs.equipment') },
              { id: 'faq', label: t('experience.tabs.faq') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('experience.overview.title')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.professionalSkipper.title')}</h3>
                      <p className="text-gray-600">{t('features.professionalSkipper.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.realRacing.title')}</h3>
                      <p className="text-gray-600">{t('features.realRacing.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Camera className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.photosIncluded.title')}</h3>
                      <p className="text-gray-600">{t('features.photosIncluded.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('experience.overview.racingFormat')}</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('experience.overview.championship')}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('experience.overview.practice')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('experience.overview.championship')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('experience.overview.final')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('experience.overview.ceremony')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('experience.schedule.title')}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {schedule.map((item, index) => (
                  <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold min-w-fit">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.activity}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('experience.gallery.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-semibold text-center px-4">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">{t('experience.gallery.followUs')}</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                  Facebook
                </a>
                <a href="#" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors duration-300">
                  Instagram
                </a>
                <a href="#" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Weather */}
        {activeTab === 'weather' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('experience.weather.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {weatherConditions.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <item.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.condition}</h3>
                  <p className="text-2xl font-bold text-primary-600">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('experience.weather.whyPerfect')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('experience.weather.consistentWinds')}</h4>
                  <p className="text-gray-700 mb-4">
                    {t('experience.weather.windsDescription')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('experience.weather.protectedWaters')}</h4>
                  <p className="text-gray-700 mb-4">
                    {t('experience.weather.watersDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment */}
        {activeTab === 'equipment' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('experience.equipment.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('experience.equipment.included')}</h3>
                <div className="space-y-4">
                  {equipment.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-gold-50 rounded-xl">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('experience.equipment.premiumYachts')}</h4>
                  <p className="text-gray-700">
                    {t('experience.equipment.yachtsDescription')}
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt={t('experience.equipment.professionalEquipment')}
                  className="rounded-xl shadow-lg w-full h-96 object-cover"
                />
                <div className="mt-6 p-6 bg-primary-50 rounded-xl">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('experience.equipment.safetyFirst')}</h4>
                  <p className="text-gray-700">
                    {t('experience.equipment.safetyDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('contact.faq')}</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">{t('experience.faq.stillQuestions')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+393456789012"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300"
                >
                  {t('cta.callNow')}
                </a>
                <a
                  href="mailto:info@gardaracing.com"
                  className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                >
                  {t('contact.emailUs')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-white/90 mb-8">
            {t('experience.cta.description')}
          </p>
          <Link
            to="/booking"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
          >
            {t('cta.bookExperience')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ExperiencePage;