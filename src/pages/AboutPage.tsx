import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, Users, Anchor, Heart, Star, Trophy, Shield, Camera, MapPin, Calendar, Target, Compass } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useMultipleCMSContent } from '../hooks/useCMSContent';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  // Define all the content slugs we need for the About page
  const contentSlugs = [
    'about-story-description',
    'about-beginning-description', 
    'about-journey-description-1',
    'about-journey-description-2',
    'about-mission-description',
    'about-vision-description',
    'about-milestone-2009',
    'about-milestone-2012',
    'about-milestone-2015', 
    'about-milestone-2018',
    'about-milestone-2020',
    'about-milestone-2024',
    'about-values-safety-description',
    'about-values-passion-description',
    'about-values-inclusive-description',
    'about-values-authentic-description',
    'about-values-innovation-description',
    'about-team-marco-description',
    'about-team-sofia-description',
    'about-team-andreas-description',
    'about-team-elena-description',
    'about-differentiators-authentic-description',
    'about-differentiators-professional-description',
    'about-differentiators-complete-description',
    'about-differentiators-location-description',
    'about-differentiators-multilingual-description',
    'about-differentiators-flexible-description'
  ];

  const { content, loading, error, getContentBySlug } = useMultipleCMSContent(contentSlugs);

  // Helper function to get content or fallback to translation key
  const getContent = (slug: string, fallbackKey?: string): string => {
    const cmsContent = getContentBySlug(slug);
    if (cmsContent) {
      return cmsContent.content;
    }
    return fallbackKey ? t(fallbackKey) : '';
  };

  const milestones = [
    { 
      year: '2009', 
      title: t('about.theBeginning'), 
      description: getContent('about-milestone-2009', 'about.milestone2009'),
      icon: Anchor
    },
    { 
      year: '2012', 
      title: t('about.milestone2012Title'), 
      description: getContent('about-milestone-2012', 'about.milestone2012'),
      icon: Users
    },
    { 
      year: '2015', 
      title: t('about.milestone2015Title'), 
      description: getContent('about-milestone-2015', 'about.milestone2015'),
      icon: Award
    },
    { 
      year: '2018', 
      title: t('about.milestone2018Title'), 
      description: getContent('about-milestone-2018', 'about.milestone2018'),
      icon: Trophy
    },
    { 
      year: '2020', 
      title: t('about.milestone2020Title'), 
      description: getContent('about-milestone-2020', 'about.milestone2020'),
      icon: Target
    },
    { 
      year: '2024', 
      title: t('about.milestone2024Title'), 
      description: getContent('about-milestone-2024', 'about.milestone2024'),
      icon: Star
    }
  ];

  const team = [
    {
      name: 'Marco Benedetti',
      role: t('about.team.marco.role'),
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: getContent('about-team-marco-description', 'about.team.marco.description'),
      specialties: [
        t('about.team.marco.specialties.strategy'),
        t('about.team.marco.specialties.safety'),
        t('about.team.marco.specialties.experience')
      ]
    },
    {
      name: 'Sofia Rossi',
      role: t('about.team.sofia.role'),
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: getContent('about-team-sofia-description', 'about.team.sofia.description'),
      specialties: [
        t('about.team.sofia.specialties.relations'),
        t('about.team.sofia.specialties.quality'),
        t('about.team.sofia.specialties.coordination')
      ]
    },
    {
      name: 'Andreas Mueller',
      role: t('about.team.andreas.role'),
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: getContent('about-team-andreas-description', 'about.team.andreas.description'),
      specialties: [
        t('about.team.andreas.specialties.techniques'),
        t('about.team.andreas.specialties.training'),
        t('about.team.andreas.specialties.weather')
      ]
    },
    {
      name: 'Elena Bianchi',
      role: t('about.team.elena.role'),
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      description: getContent('about-team-elena-description', 'about.team.elena.description'),
      specialties: [
        t('about.team.elena.specialties.protocols'),
        t('about.team.elena.specialties.response'),
        t('about.team.elena.specialties.equipment')
      ]
    }
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.values.safety.title'),
      description: getContent('about-values-safety-description', 'about.values.safety.description'),
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Heart,
      title: t('about.values.passion.title'),
      description: getContent('about-values-passion-description', 'about.values.passion.description'),
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Users,
      title: t('about.values.inclusive.title'),
      description: getContent('about-values-inclusive-description', 'about.values.inclusive.description'),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Trophy,
      title: t('about.values.authentic.title'),
      description: getContent('about-values-authentic-description', 'about.values.authentic.description'),
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      icon: Target,
      title: t('about.values.innovation.title'),
      description: getContent('about-values-innovation-description', 'about.values.innovation.description'),
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: t('about.achievements.ryaCertified.title'),
      description: t('about.achievements.ryaCertified.description'),
      year: '2015'
    },
    {
      icon: Star,
      title: t('about.achievements.guestRating.title'),
      description: t('about.achievements.guestRating.description'),
      year: t('about.achievements.ongoing')
    },
    {
      icon: Shield,
      title: t('about.achievements.safetyRecord.title'),
      description: t('about.achievements.safetyRecord.description'),
      year: '2009-2024'
    },
    {
      icon: Users,
      title: t('about.achievements.satisfiedGuests.title'),
      description: t('about.achievements.satisfiedGuests.description'),
      year: '2024'
    },
    {
      icon: Trophy,
      title: t('about.achievements.industryRecognition.title'),
      description: t('about.achievements.industryRecognition.description'),
      year: '2020-2024'
    },
    {
      icon: Camera,
      title: t('about.achievements.mediaExcellence.title'),
      description: t('about.achievements.mediaExcellence.description'),
      year: '2018'
    }
  ];

  const differentiators = [
    {
      title: t('about.differentiators.authentic.title'),
      description: getContent('about-differentiators-authentic-description', 'about.differentiators.authentic.description'),
      icon: Trophy
    },
    {
      title: t('about.differentiators.professional.title'),
      description: getContent('about-differentiators-professional-description', 'about.differentiators.professional.description'),
      icon: Award
    },
    {
      title: t('about.differentiators.complete.title'),
      description: getContent('about-differentiators-complete-description', 'about.differentiators.complete.description'),
      icon: Star
    },
    {
      title: t('about.differentiators.location.title'),
      description: getContent('about-differentiators-location-description', 'about.differentiators.location.description'),
      icon: MapPin
    },
    {
      title: t('about.differentiators.multilingual.title'),
      description: getContent('about-differentiators-multilingual-description', 'about.differentiators.multilingual.description'),
      icon: Users
    },
    {
      title: t('about.differentiators.flexible.title'),
      description: getContent('about-differentiators-flexible-description', 'about.differentiators.flexible.description'),
      icon: Calendar
    }
  ];

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('common.error')}: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            {t('common.reset')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title={t('about.title')}
        description="Learn about Garda Racing Yacht Club - passionate about sailing since 2009. Meet our expert team and discover our story of creating unforgettable yacht racing experiences on Lake Garda."
        keywords="about Garda Racing, yacht club history, sailing instructors Lake Garda, RYA certified, professional sailing team"
        url="/about"
      />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 via-primary-900 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-gold-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="flex items-center space-x-3 mb-6">
                <Anchor className="h-12 w-12 text-gold-400" />
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold font-serif">
                    {t('about.title')}
                  </h1>
                  <p className="text-xl text-white/80 mt-2">Est. 2009</p>
                </div>
              </div>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t('about.subtitle')}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-1">2000+</div>
                  <div className="text-white/80 text-sm">Happy Sailors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-1">15</div>
                  <div className="text-white/80 text-sm">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-1">30+</div>
                  <div className="text-white/80 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-1">4.9★</div>
                  <div className="text-white/80 text-sm">Rating</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Award className="h-5 w-5 text-gold-400" />
                  <span>RYA Certified</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Star className="h-5 w-5 text-gold-400" />
                  <span>Zero Incidents</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <img
                src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Yacht racing on Lake Garda with professional instruction"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <Compass className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Since 2009</p>
                    <p className="text-sm text-gray-600">Sailing Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8 font-serif">{t('about.missionVision')}</h2>
              
              <div className="space-y-8">
                <div className="border-l-4 border-primary-600 pl-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('about.mission')}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {getContent('about-mission-description', 'about.missionDescription')}
                  </p>
                </div>
                
                <div className="border-l-4 border-gold-500 pl-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('about.vision')}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {getContent('about-vision-description', 'about.visionDescription')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Beautiful Lake Garda marina with Alps in background"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.ourStory')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {getContent('about-story-description', 'about.storyDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">{t('about.theBeginning')}</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>{getContent('about-beginning-description', 'about.beginningDescription')}</p>
                <p>{getContent('about-journey-description-1', 'about.journeyDescription1')}</p>
                <p>{getContent('about-journey-description-2', 'about.journeyDescription2')}</p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional sailing instruction on Lake Garda"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -top-4 -right-4 bg-primary-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">2009</p>
                  <p className="text-sm">Founded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.ourJourney')}</h2>
            <p className="text-xl text-gray-600">{t('about.journeySubtitle')}</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200 hidden lg:block"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:space-x-0 space-y-4 lg:space-y-0`}>
                  <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'} text-center lg:text-left`}>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center justify-center lg:justify-start mb-4">
                        <milestone.icon className="h-8 w-8 text-primary-600 mr-3" />
                        <div className="text-3xl font-bold text-primary-600">{milestone.year}</div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg hidden lg:block"></div>
                  <div className="w-full lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.ourValues')}</h2>
            <p className="text-xl text-gray-600">{t('about.valuesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${value.color} group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.meetTeam')}</h2>
            <p className="text-xl text-gray-600">{t('about.teamSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">{member.description}</p>
                  <div className="space-y-1">
                    {member.specialties.map((specialty, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements & Recognition */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.certifications')}</h2>
            <p className="text-xl text-gray-600">{t('about.certificationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                  <achievement.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <span className="text-xs text-primary-600 font-medium">{achievement.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{t('about.whatSetsUsApart')}</h2>
            <p className="text-xl text-gray-600">{t('about.whyChooseUs')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differentiators.map((item, index) => (
              <div key={index} className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                    <item.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">{t('about.readyToJoin')}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('about.joinCommunity')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
            >
              <Calendar className="h-5 w-5" />
              <span>{t('cta.bookExperience')}</span>
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>{t('contact.title')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;