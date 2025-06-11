import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Calendar, Clock, CreditCard, FileText, Bell, LogOut, ChevronRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { clientPortalService, ClientPortalData } from '../services/clientPortal';

const ClientPortalPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get token from URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const authenticateClient = async () => {
      if (!token) {
        toast.error('No access token provided');
        navigate('/');
        return;
      }

      setIsLoading(true);
      const client = await clientPortalService.authenticateWithToken(token);
      
      if (!client) {
        toast.error('Invalid or expired access token');
        navigate('/');
        return;
      }

      setIsAuthenticated(true);
      
      // Load client portal data
      const data = await clientPortalService.getClientPortalData(client.id);
      if (data) {
        setPortalData(data);
      } else {
        toast.error('Failed to load client data');
      }
      
      // Load notifications
      const clientNotifications = await clientPortalService.getClientNotifications(client.id);
      setNotifications(clientNotifications);
      
      setIsLoading(false);
    };

    authenticateClient();
  }, [token, navigate]);

  const handleCancellationRequest = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    const success = await clientPortalService.requestBookingCancellation(bookingId, reason);
    if (success) {
      toast.success('Cancellation request submitted successfully');
      
      // Refresh portal data
      if (portalData?.client?.id) {
        const updatedData = await clientPortalService.getClientPortalData(portalData.client.id);
        if (updatedData) {
          setPortalData(updatedData);
        }
      }
    } else {
      toast.error('Failed to submit cancellation request');
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    const success = await clientPortalService.markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read', read_at: new Date().toISOString() } 
            : notification
        )
      );
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !portalData) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have access to this portal or your session has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { client, upcomingBookings, pastBookings } = portalData;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <SEOHead
        title="Client Portal - Garda Racing Yacht Club"
        description="Access your bookings, view your sailing history, and manage your account."
        url="/portal"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {client.name}
              </h1>
              <p className="text-gray-600">
                Client Portal - Manage your bookings and account
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-6">
                <div className="text-sm text-gray-500">Client since</div>
                <div className="font-medium">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 bg-primary-600 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-white/80">{client.email}</div>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'upcoming' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Upcoming Bookings</span>
                      {upcomingBookings.length > 0 && (
                        <span className="ml-auto bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium">
                          {upcomingBookings.length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'history' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Clock className="h-5 w-5" />
                      <span>Booking History</span>
                      {pastBookings.length > 0 && (
                        <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          {pastBookings.length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'profile' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === 'notifications' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                      {notifications.filter(n => n.status !== 'read').length > 0 && (
                        <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          {notifications.filter(n => n.status !== 'read').length}
                        </span>
                      )}
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Client Status</div>
                    <div className="font-medium text-gray-900 capitalize">{client.segment}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Bookings</div>
                    <div className="font-medium text-gray-900">{client.total_bookings || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Spent</div>
                    <div className="font-medium text-gray-900">€{client.total_spent || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Upcoming Bookings */}
            {activeTab === 'upcoming' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Bookings</h2>
                
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Bookings</h3>
                    <p className="text-gray-600 mb-6">You don't have any upcoming bookings at the moment.</p>
                    <a 
                      href="/booking" 
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300 inline-block"
                    >
                      Book a New Experience
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="h-5 w-5 text-primary-600" />
                              <span className="font-medium text-gray-900">
                                {new Date(booking.session_date).toLocaleDateString()}
                              </span>
                              <span className="text-gray-600">at {booking.session_time}</span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-start space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-600">Amount:</span>
                                  <span className="ml-2 font-medium">€{booking.amount}</span>
                                </div>
                              </div>
                              
                              {booking.yacht && (
                                <div className="flex items-start space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                                  <div>
                                    <span className="text-gray-600">Yacht:</span>
                                    <span className="ml-2">{booking.yacht.name}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`ml-2 capitalize ${
                                    booking.status === 'confirmed' ? 'text-green-600' :
                                    booking.status === 'cancelled' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancellationRequest(booking.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Request Cancellation
                              </button>
                            )}
                            <a
                              href={`/booking-details?id=${booking.id}&token=${token}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Booking History */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Booking History</h2>
                
                {pastBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking History</h3>
                    <p className="text-gray-600">You haven't completed any bookings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="h-5 w-5 text-gray-600" />
                              <span className="font-medium text-gray-900">
                                {new Date(booking.session_date).toLocaleDateString()}
                              </span>
                              <span className="text-gray-600">at {booking.session_time}</span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-start space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-600">Amount:</span>
                                  <span className="ml-2 font-medium">€{booking.amount}</span>
                                </div>
                              </div>
                              
                              {booking.yacht && (
                                <div className="flex items-start space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                                  <div>
                                    <span className="text-gray-600">Yacht:</span>
                                    <span className="ml-2">{booking.yacht.name}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`ml-2 capitalize ${
                                    booking.status === 'confirmed' ? 'text-green-600' :
                                    booking.status === 'cancelled' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0">
                            <a
                              href={`/booking-details?id=${booking.id}&token=${token}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Profile</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={client.name}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={client.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={client.phone || ''}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                      <input
                        type="text"
                        value={client.language || 'English'}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Since</label>
                        <input
                          type="text"
                          value={new Date(client.created_at).toLocaleDateString()}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Status</label>
                        <input
                          type="text"
                          value={client.segment || 'Regular'}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Bookings</label>
                        <input
                          type="text"
                          value={client.total_bookings || 0}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Booking</label>
                        <input
                          type="text"
                          value={client.last_booking ? new Date(client.last_booking).toLocaleDateString() : 'N/A'}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Need to update your information?</h3>
                    <p className="text-gray-600 mb-4">
                      Please contact our customer support team to update your personal information.
                    </p>
                    <div className="flex space-x-4">
                      <a
                        href="mailto:info@gardaracing.com"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 inline-flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email Us</span>
                      </a>
                      <a
                        href="tel:+393456789012"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 inline-flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Call Us</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
                
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                    <p className="text-gray-600">You don't have any notifications at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`border rounded-xl p-4 transition-colors duration-300 ${
                          notification.status === 'read' 
                            ? 'border-gray-200 bg-white' 
                            : 'border-primary-200 bg-primary-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-4 ${
                            notification.type.includes('booking') 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {notification.type.includes('booking') ? (
                              <Calendar className="h-5 w-5" />
                            ) : (
                              <Bell className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-gray-900">{notification.title}</h3>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            
                            {notification.status !== 'read' && (
                              <button
                                onClick={() => handleMarkNotificationAsRead(notification.id)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;