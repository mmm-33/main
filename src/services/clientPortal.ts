import { generateUuid, isValidUuid, Client, Booking } from './supabase';

export interface ClientPortalData {
  client: Client;
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  totalSpent: number;
}

// Mock client data
const mockClients: Record<string, Client> = {
  'test-token': {
    id: generateUuid(),
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    language: 'en',
    segment: 'active',
    total_bookings: 3,
    total_spent: 597,
    portal_access: true,
    portal_token: 'test-token',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-06-20T14:45:00Z'
  }
};

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: generateUuid(),
    client_id: mockClients['test-token'].id,
    session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    session_time: '10:30',
    status: 'confirmed',
    payment_status: 'paid',
    amount: 199,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUuid(),
    client_id: mockClients['test-token'].id,
    session_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    session_time: '14:00',
    status: 'completed',
    payment_status: 'paid',
    amount: 199,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: generateUuid(),
    client_id: mockClients['test-token'].id,
    session_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    session_time: '09:00',
    status: 'completed',
    payment_status: 'paid',
    amount: 199,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: generateUuid(),
    type: 'booking_created',
    title: 'Booking Confirmed',
    message: 'Your booking for next week has been confirmed.',
    recipient_id: mockClients['test-token'].id,
    status: 'unread',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: generateUuid(),
    type: 'payment_received',
    title: 'Payment Received',
    message: 'We have received your payment of €199.',
    recipient_id: mockClients['test-token'].id,
    status: 'read',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const clientPortalService = {
  /**
   * Authenticate client using portal token
   */
  async authenticateWithToken(token: string): Promise<Client | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockClients[token] || null;
  },

  /**
   * Get client portal data
   */
  async getClientPortalData(clientId: string): Promise<ClientPortalData | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Find client
    const client = Object.values(mockClients).find(c => c.id === clientId);
    if (!client) return null;
    
    // Filter bookings for this client
    const clientBookings = mockBookings.filter(b => b.client_id === clientId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Split bookings into upcoming and past
    const upcomingBookings = clientBookings.filter(booking => {
      const bookingDate = new Date(booking.session_date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= today;
    });
    
    const pastBookings = clientBookings.filter(booking => {
      const bookingDate = new Date(booking.session_date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate < today;
    });
    
    // Calculate total spent
    const totalSpent = clientBookings.reduce((sum, booking) => {
      return booking.payment_status === 'paid' ? sum + booking.amount : sum;
    }, 0);
    
    return {
      client,
      bookings: clientBookings,
      upcomingBookings,
      pastBookings,
      totalSpent
    };
  },

  /**
   * Get client notifications
   */
  async getClientNotifications(clientId: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockNotifications.filter(n => n.recipient_id === clientId);
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'read';
      notification.read_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  /**
   * Request booking cancellation
   */
  async requestBookingCancellation(bookingId: string, reason: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const booking = mockBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      booking.notes = `Cancellation reason: ${reason}`;
      booking.updated_at = new Date().toISOString();
      
      // Add cancellation notification
      mockNotifications.push({
        id: generateUuid(),
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.session_date} at ${booking.session_time} has been cancelled.`,
        recipient_id: booking.client_id!,
        status: 'unread',
        created_at: new Date().toISOString()
      });
      
      return true;
    }
    return false;
  },

  /**
   * Regenerate client portal token
   */
  async regeneratePortalToken(clientId: string): Promise<string | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const client = Object.values(mockClients).find(c => c.id === clientId);
    if (client) {
      const newToken = generateUuid();
      client.portal_token = newToken;
      client.updated_at = new Date().toISOString();
      
      // Update the mock clients record
      mockClients[newToken] = client;
      
      return newToken;
    }
    return null;
  }
};