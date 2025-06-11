import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, Users, CreditCard, Shield, Clock, CheckCircle, AlertCircle, Mail, Phone, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { bookingService, type BookingFormData } from '../services/booking';
import { crmService } from '../services/crm';
import PhoneInput from '../components/PhoneInput';
import { StripeProvider } from '../components/payment';
import { stripeService } from '../services/stripe';
import CheckoutForm from '../components/payment/CheckoutForm';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';

const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      participants: 1,
      agreeTerms: false,
      agreeMarketing: false
    }
  });

  const watchedValues = watch();

  const timeSlots = [
    { time: '08:30', available: true, price: 199 },
    { time: '09:00', available: true, price: 199 },
    { time: '13:30', available: false, price: 199 },
    { time: '14:00', available: true, price: 199 }
  ];

  const totalPrice = participants * 199;
  const deposit = Math.round(totalPrice * 0.3);

  // Create payment intent when reaching payment step
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (bookingStep === 3 && !clientSecret && paymentMethod === 'card') {
        try {
          setPaymentProcessing(true);
          const paymentAmount = paymentMethod === 'deposit' ? deposit : totalPrice;
          
          const { clientSecret } = await stripeService.createPaymentIntent({
            amount: paymentAmount,
            currency: 'eur',
            description: `Booking for ${selectedDate} at ${selectedTime} - ${participants} participants`,
            metadata: {
              bookingDate: selectedDate,
              timeSlot: selectedTime,
              participants: participants.toString()
            }
          });
          
          setClientSecret(clientSecret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
          toast.error(t('payment.intentError', 'Failed to initialize payment. Please try again.'));
        } finally {
          setPaymentProcessing(false);
        }
      }
    };
    
    createPaymentIntent();
  }, [bookingStep, clientSecret, paymentMethod, deposit, totalPrice, selectedDate, selectedTime, participants, t]);

  const handleNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const isStepValid = () => {
    switch (bookingStep) {
      case 1:
        return selectedDate && selectedTime && participants > 0;
      case 2:
        return watchedValues.firstName && watchedValues.lastName && watchedValues.email && watchedValues.phone && watchedValues.agreeTerms;
      case 3:
        return paymentSucceeded || paymentMethod === 'deposit';
      default:
        return true;
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentSucceeded(true);
    toast.success(t('payment.success', 'Payment successful!'));
  };

  const handlePaymentError = (error: Error) => {
    toast.error(error.message || t('payment.error', 'Payment failed. Please try again.'));
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    const formData: BookingFormData = {
      ...data,
      bookingDate: selectedDate,
      timeSlot: selectedTime,
      participants: participants
    };

    // Add payment method information
    formData.paymentMethod = paymentMethod;
    formData.depositAmount = deposit;
    
    // Validate form data
    const validationErrors = bookingService.validateBookingForm(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      setIsSubmitting(false);
      return;
    }

    try {
      const booking = await bookingService.createBooking(formData);
      if (booking) {
        toast.success(t('booking.success'));
        
        // Generate client portal access
        if (booking.client?.id) {
          const portalAccess = await crmService.generateClientPortalAccess(booking.client.id);
          if (portalAccess) {
            setPortalUrl(portalAccess.url);
          }
        }
        
        // Mark booking as complete
        setBookingComplete(true);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(t('booking.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Booking success view
  if (bookingComplete) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('booking.success')}</h1>
          <p className="text-gray-600 mb-6">Check your email for booking confirmation and details.</p>
          {portalUrl && (
            <a href={portalUrl} target="_blank" rel="noopener norefferer" className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 mb-4">Access Your Client Portal</a>
          )}
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <SEOHead
        title={t('booking.title')}
        description={t('booking.subtitle')}
        url="/booking"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            {t('booking.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('booking.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: t('booking.steps.dateTime'), icon: Calendar },
              { step: 2, title: t('booking.steps.details'), icon: Users },
              { step: 3, title: t('booking.steps.payment'), icon: CreditCard }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-300 ${
                  bookingStep >= item.step
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {bookingStep > item.step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <item.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-4 hidden sm:block">
                  <p className={`font-semibold ${bookingStep >= item.step ? 'text-primary-600' : 'text-gray-400'}`}>
                    {t('common.step')} {item.step}
                  </p>
                  <p className={`text-sm ${bookingStep >= item.step ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </p>
                </div>
                {index < 2 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 rounded ${
                    bookingStep > item.step ? 'bg-primary-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Step 1: Date & Time Selection */}
                {bookingStep === 1 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.selectExperience')}</h2>
                    
                    {/* Date Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">{t('booking.chooseDate')}</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">{t('booking.chooseTime')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                              selectedTime === slot.time
                                ? 'border-primary-600 bg-primary-50 text-primary-600'
                                : slot.available
                                ? 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-xl font-semibold">{slot.time}</div>
                            <div className="text-sm">
                              {slot.available ? `€${slot.price} ${t('booking.pricePerPerson')}` : t('booking.fullyBooked')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-4">{t('booking.participants')}</label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => setParticipants(Math.max(1, participants - 1))}
                          className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center text-xl font-semibold"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                          {participants}
                        </span>
                        <button
                          type="button"
                          onClick={() => setParticipants(Math.min(8, participants + 1))}
                          className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center text-xl font-semibold"
                        >
                          +
                        </button>
                        <span className="text-gray-600 ml-4">{t('booking.maxParticipants')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {bookingStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.yourDetails')}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">{t('booking.firstName')} *</label>
                        <input
                          type="text"
                          {...register('firstName', { required: t('forms.required') })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">{t('booking.lastName')} *</label>
                        <input
                          type="text"
                          {...register('lastName', { required: t('forms.required') })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">{t('booking.email')} *</label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: t('forms.required'),
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: t('forms.invalidEmail')
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <PhoneInput
                        name="phone"
                        control={control}
                        label={t('booking.phone')}
                        error={errors.phone}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">{t('booking.specialRequests')}</label>
                      <textarea
                        {...register('specialRequests')}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder={t('booking.specialRequestsPlaceholder')}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          {...register('agreeTerms', { required: t('booking.agreeTermsRequired') })}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">
                          {t('booking.agreeTerms')} <Link to="/terms-of-service" className="text-primary-600 hover:underline">{t('navigation.terms')}</Link> *
                        </label>
                      </div>
                      {errors.agreeTerms && (
                        <p className="text-sm text-red-600">{errors.agreeTerms.message}</p>
                      )}
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          {...register('agreeMarketing')}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">
                          {t('booking.agreeMarketing')}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {bookingStep === 3 && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <Lock className="h-6 w-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">{t('booking.securePayment')}</h2>
                    </div>
                    
                    <PaymentMethodSelector 
                      onSelect={setPaymentMethod}
                      selectedMethod={paymentMethod}
                    />

                    {paymentMethod === 'card' && (
                      <StripeProvider>
                        {clientSecret ? (
                          <CheckoutForm
                            clientSecret={clientSecret}
                            amount={totalPrice}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        ) : (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-gray-600">{t('payment.initializing', 'Initializing payment...')}</span>
                          </div>
                        )}
                      </StripeProvider>
                    )}
                    
                    {paymentMethod === 'deposit' && (
                      <div className="bg-yellow-50 p-6 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-yellow-900 mb-2">{t('payment.depositInfo', 'Deposit Payment')}</h3>
                            <p className="text-yellow-800 text-sm">
                              {t('payment.depositDesc', 'You will pay a deposit of {{amount}} now and the remaining {{remaining}} on the day of your experience.', {
                                amount: `€${deposit}`,
                                remaining: `€${totalPrice - deposit}`
                              })}
                            </p>
                            <button
                              type="button"
                              onClick={() => setPaymentSucceeded(true)}
                              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-300"
                            >
                              {t('payment.confirmDeposit', 'Confirm Deposit Payment')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'wallet' && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Wallet className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-2">{t('payment.walletInfo', 'Digital Wallet')}</h3>
                            <p className="text-blue-800 text-sm">
                              {t('payment.walletDesc', 'Digital wallet payment will be available soon. Please select another payment method.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-900 mb-2">{t('booking.whatHappensAfter')}</h3>
                          <ul className="text-green-800 text-sm space-y-1">
                            <li>• {t('booking.instantConfirmation')}</li>
                            <li>• {t('booking.meetingPoint')}</li>
                            <li>• {t('booking.weatherUpdates')}</li>
                            <li>• {t('booking.photosDelivered')}</li>
                            <li className="font-semibold">• Access to your personal client portal</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                      bookingStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={bookingStep === 1}
                  >
                    {t('common.previous')}
                  </button>
                  
                  {bookingStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStepValid()}
                      className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        isStepValid()
                          ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {t('common.next')}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || (bookingStep === 3 && !isStepValid())}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{t('booking.processing')}</span>
                        </>
                      ) : (
                        <span>{t('booking.completeBooking')}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('booking.bookingSummary')}</h3>
                
                <div className="space-y-4 mb-6">
                  {selectedDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('booking.date')}</span>
                      <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('booking.time')}</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('booking.participants')}:</span>
                    <span className="font-semibold">{participants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('booking.pricePerPerson')}:</span>
                    <span className="font-semibold">€199</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t('booking.total')}:</span>
                    <span className="text-primary-600">€{paymentMethod === 'deposit' ? deposit : totalPrice}</span>
                  </div>
                  {paymentMethod === 'deposit' && (
                    <p className="text-sm text-gray-600 mt-2">
                      {t('booking.deposit', { deposit: deposit, remaining: totalPrice - deposit })}
                    </p>
                  )}
                </div>

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t('features.professionalSkipper.title')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t('booking.safetyEquipment')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t('booking.medalCertificate')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{t('features.photosIncluded.title')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{t('booking.freeCancellation')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>{t('features.fullyInsured.title')}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-primary-50 rounded-2xl p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">{t('booking.needHelp')}</h4>
                <div className="space-y-3">
                  <a
                    href="tel:+393456789012"
                    className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+39 345 678 9012</span>
                  </a>
                  <a
                    href="mailto:info@gardaracing.com"
                    className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                  >
                    <Mail className="h-4 w-4" />
                    <span>info@gardaracing.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;