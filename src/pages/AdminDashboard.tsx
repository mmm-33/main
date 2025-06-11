import React, { useState, useEffect } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import { useStorage } from '../hooks/useStorage';
import { useEvents } from '../hooks/useEvents';
import RealtimeStatus from '../components/RealtimeStatus';
import RealtimeData from '../components/RealtimeData';
import FileManager from '../components/FileManager';
import EventLog from '../components/EventLog';
import { supabase } from '../services/supabase';
import { realtimeService } from '../services/realtime';
import { storageService } from '../services/storage';
import { eventsService } from '../services/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { 
  Database, 
  HardDrive, 
  Bell, 
  Users, 
  Calendar, 
  Ship, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Booking {
  id: string;
  client_id: string;
  yacht_id: string;
  session_date: string;
  session_time: string;
  status: string;
  payment_status: string;
  amount: number;
  created_at: string;
  client?: {
    name: string;
    email: string;
  };
  yacht?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
}

interface Yacht {
  id: string;
  name: string;
  status: string;
  location: string;
  next_booking: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');
  
  const { connectionState, isConnected } = useRealtime({
    autoInitialize: true,
    onConnectionChange: (state) => {
      console.log('Realtime connection state changed:', state);
    }
  });
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize storage service
      await storageService.initialize();
      
      // Initialize events service with webhook URL
      eventsService.initialize('https://your-webhook-endpoint.netlify.app/.netlify/functions/webhook');
      
      // Set up database triggers
      eventsService.setupDatabaseTriggers();
      
      // Load initial data
      await loadInitialData();
      
      setIsInitialized(true);
    };
    
    initializeServices();
  }, []);
  
  // Load initial data
  const loadInitialData = async () => {
    try {
      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(name, email),
          yacht:yachts(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
      } else {
        setBookings(bookingsData || []);
      }
      
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (clientsError) {
        console.error('Error loading clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }
      
      // Load yachts
      const { data: yachtsData, error: yachtsError } = await supabase
        .from('yachts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (yachtsError) {
        console.error('Error loading yachts:', yachtsError);
      } else {
        setYachts(yachtsData || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Render booking item
  const renderBookingItem = (booking: Booking) => (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-primary-500 mr-2" />
            <span className="font-medium text-gray-900">
              {new Date(booking.session_date).toLocaleDateString()} at {booking.session_time}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {booking.client?.name || 'Unknown Client'} • €{booking.amount}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {booking.yacht?.name || 'No yacht assigned'}
          </span>
        </div>
      </div>
    </Card>
  );

  // Render client item
  const renderClientItem = (client: Client) => (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between">
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-600">{client.email}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            client.segment === 'vip' ? 'bg-purple-100 text-purple-800' :
            client.segment === 'active' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {client.segment}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {client.total_bookings} bookings • €{client.total_spent}
          </span>
        </div>
      </div>
    </Card>
  );

  // Render yacht item
  const renderYachtItem = (yacht: Yacht) => (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between">
        <div>
          <div className="font-medium text-gray-900">{yacht.name}</div>
          <div className="text-sm text-gray-600">{yacht.location || 'No location'}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            yacht.status === 'available' ? 'bg-green-100 text-green-800' :
            yacht.status === 'booked' ? 'bg-blue-100 text-blue-800' :
            yacht.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {yacht.status}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {yacht.next_booking ? `Next: ${new Date(yacht.next_booking).toLocaleDateString()}` : 'No upcoming bookings'}
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <RealtimeStatus />
        </div>
        
        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Realtime Status</h2>
                <p className={`text-sm ${
                  isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Active subscriptions: {realtimeService.getActiveSubscriptions().size}</p>
              <p>Connection state: {connectionState}</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Storage Status</h2>
                <p className="text-sm text-green-600">Initialized</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Default buckets: profile-photos, booking-documents, yacht-images, client-uploads</p>
              <p>Max file size: 10MB</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Event Handlers</h2>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Registered events: booking_created, booking_updated, client_created</p>
              <p>Webhook URL: configured</p>
            </div>
          </Card>
        </div>
        
        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="realtime">
              <Database className="h-4 w-4 mr-2" />
              Realtime Data
            </TabsTrigger>
            <TabsTrigger value="storage">
              <HardDrive className="h-4 w-4 mr-2" />
              File Storage
            </TabsTrigger>
            <TabsTrigger value="events">
              <Bell className="h-4 w-4 mr-2" />
              Event Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
                <RealtimeData
                  tableName="bookings"
                  initialData={bookings}
                  renderItem={renderBookingItem}
                  title="Live Bookings"
                  emptyMessage="No bookings found"
                />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Clients</h2>
                <RealtimeData
                  tableName="clients"
                  initialData={clients}
                  renderItem={renderClientItem}
                  title="Live Clients"
                  emptyMessage="No clients found"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Yacht Status</h2>
              <RealtimeData
                tableName="yachts"
                initialData={yachts}
                renderItem={renderYachtItem}
                title="Live Yacht Status"
                emptyMessage="No yachts found"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Realtime Connection Management</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Connection Status</p>
                    <p className="text-sm text-gray-600">Current state of the realtime connection</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {connectionState}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active Subscriptions</p>
                    <p className="text-sm text-gray-600">Number of active realtime subscriptions</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      {realtimeService.getActiveSubscriptions().size}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reconnection Attempts</p>
                    <p className="text-sm text-gray-600">Number of reconnection attempts made</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      {realtimeService.reconnectAttempts} / {realtimeService.maxReconnectAttempts}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => supabase.realtime.disconnect()}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={() => supabase.realtime.connect()}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => realtimeService.unsubscribeAll()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  >
                    Unsubscribe All
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Yacht Images</h2>
                <FileManager
                  bucket="yacht-images"
                  fileTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Documents</h2>
                <FileManager
                  bucket="booking-documents"
                  fileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Uploads</h2>
              <FileManager
                bucket="client-uploads"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Management</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Storage Buckets</p>
                    <p className="text-sm text-gray-600">Configured storage buckets</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">4 buckets</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">File Type Restrictions</p>
                    <p className="text-sm text-gray-600">Allowed file types per bucket</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Configured</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Size Limits</p>
                    <p className="text-sm text-gray-600">Maximum file size allowed</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">10MB default</span>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => storageService.initialize()}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                  >
                    Reinitialize Storage
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Logs</h2>
              <EventLog
                maxEvents={50}
                autoRefresh={true}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Handlers</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">booking_created</p>
                        <p className="text-xs text-gray-600">Handles new booking creation</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">booking_updated</p>
                        <p className="text-xs text-gray-600">Handles booking status changes</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">client_created</p>
                        <p className="text-xs text-gray-600">Handles new client registration</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="text"
                      value="https://your-webhook-endpoint.netlify.app/.netlify/functions/webhook"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value="••••••••••••••••••••••••••••••"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Webhook Status</p>
                      <p className="text-xs text-gray-600">Current status of webhook endpoint</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => eventsService.sendWebhook('test_event', { message: 'Test webhook' })}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                    >
                      Test Webhook
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Manual Event</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <button
                    onClick={() => {
                      eventsService.trigger('booking_created', {
                        table: 'bookings',
                        record: {
                          id: `test-${Date.now()}`,
                          client_id: clients[0]?.id,
                          session_date: new Date().toISOString().split('T')[0],
                          session_time: '14:00',
                          status: 'pending',
                          amount: 199
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center"
                    disabled={clients.length === 0}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Trigger Booking Created
                  </button>
                </div>
                
                <div>
                  <button
                    onClick={() => {
                      eventsService.trigger('client_created', {
                        table: 'clients',
                        record: {
                          id: `test-${Date.now()}`,
                          name: 'Test Client',
                          email: `test-${Date.now()}@example.com`,
                          segment: 'new'
                        }
                      });
                    }}
                    className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Trigger Client Created
                  </button>
                </div>
                
                <div>
                  <button
                    onClick={() => {
                      if (bookings.length > 0) {
                        const booking = bookings[0];
                        eventsService.trigger('booking_updated', {
                          table: 'bookings',
                          record: {
                            ...booking,
                            status: 'confirmed'
                          },
                          old_record: booking
                        });
                      }
                    }}
                    className="w-full px-4 py-3 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-200 flex items-center justify-center"
                    disabled={bookings.length === 0}
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Trigger Booking Updated
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;