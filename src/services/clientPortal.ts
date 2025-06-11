import { supabase, Client, Booking } from './supabase';

export interface ClientPortalData {
  client: Client;
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  totalSpent: number;
}

export const clientPortalService = {
  /**
   * Authenticate client using portal token
   */
  async authenticateWithToken(token: string): Promise<Client | null> {
    try {
      if (!token) {
        console.error('No token provided for authentication');
        return null;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('portal_token', token)
        .eq('portal_access', true)
        .maybeSingle();

      if (error) {
        console.error('Error authenticating client with token:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Client portal authentication failed:', error);
      return null;
    }
  },

  /**
   * Get client portal data
   */
  async getClientPortalData(clientId: string): Promise<ClientPortalData | null> {
    try {
      // Get client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error fetching client data for portal:', clientError);
        return null;
      }

      // Get client bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          yacht:yachts(id, name)
        `)
        .eq('client_id', clientId)
        .order('session_date', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching client bookings for portal:', bookingsError);
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Split bookings into upcoming and past
      const upcomingBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.session_date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      });

      const pastBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.session_date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < today;
      });

      // Calculate total spent
      const totalSpent = bookings.reduce((sum, booking) => {
        return booking.payment_status === 'paid' ? sum + booking.amount : sum;
      }, 0);

      return {
        client,
        bookings: bookings || [],
        upcomingBookings: upcomingBookings || [],
        pastBookings: pastBookings || [],
        totalSpent
      };
    } catch (error) {
      console.error('Failed to get client portal data:', error);
      return null;
    }
  },

  /**
   * Update client profile
   */
  async updateClientProfile(clientId: string, data: Partial<Client>): Promise<Client | null> {
    try {
      // Ensure we're not updating sensitive fields
      const safeData: Partial<Client> = {
        name: data.name,
        phone: data.phone,
        language: data.language,
        location: data.location
      };

      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update({
          ...safeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client profile:', error);
        return null;
      }

      return updatedClient;
    } catch (error) {
      console.error('Failed to update client profile:', error);
      return null;
    }
  },

  /**
   * Get client notifications
   */
  async getClientNotifications(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching client notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get client notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  },

  /**
   * Request booking cancellation
   */
  async requestBookingCancellation(bookingId: string, reason: string): Promise<boolean> {
    try {
      // First update the booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          notes: `Cancellation reason: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Error cancelling booking:', bookingError);
        return false;
      }

      // Get booking details for notification
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('client_id, session_date, session_time')
        .eq('id', bookingId)
        .single();

      if (fetchError) {
        console.error('Error fetching booking details for cancellation:', fetchError);
        return true; // Still return true as the booking was cancelled
      }

      // Create notification for staff
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Booking for ${new Date(booking.session_date).toLocaleDateString()} at ${booking.session_time} has been cancelled. Reason: ${reason}`,
          recipient_id: null, // Staff notification
          channel: 'internal',
          status: 'pending',
          booking_id: bookingId
        });

      if (notificationError) {
        console.error('Error creating cancellation notification:', notificationError);
      }

      return true;
    } catch (error) {
      console.error('Failed to request booking cancellation:', error);
      return false;
    }
  },

  /**
   * Regenerate client portal token
   */
  async regeneratePortalToken(clientId: string): Promise<string | null> {
    try {
      // Generate new token
      const newToken = `pt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Update client with new token
      const { error } = await supabase
        .from('clients')
        .update({
          portal_token: newToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error regenerating portal token:', error);
        return null;
      }

      return newToken;
    } catch (error) {
      console.error('Failed to regenerate portal token:', error);
      return null;
    }
  }
};