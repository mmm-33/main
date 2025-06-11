import { supabase, Client, Booking, FRONTEND_URL } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CRMClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language?: string;
  leadSource?: string;
}

export interface CRMBookingData {
  clientId: string;
  sessionDate: string;
  sessionTime: string;
  participants: number;
  amount: number;
  specialRequests?: string;
  yachtId?: string;
}

export interface ClientPortalAccess {
  token: string;
  url: string;
  expiresAt: Date;
}

export const crmService = {
  /**
   * Create or update a client in the CRM system
   */
  async createOrUpdateClient(clientData: CRMClientData): Promise<Client | null> {
    try {
      console.log('Creating/updating client in CRM:', clientData);
      
      // Check if client already exists
      const { data: existingClients, error: findError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .limit(1);

      if (findError) {
        console.error('Error finding client in CRM:', findError);
        throw findError;
      }

      const existingClient = existingClients && existingClients.length > 0 ? existingClients[0] : null;

      if (existingClient) {
        // Update existing client
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({
            name: `${clientData.firstName} ${clientData.lastName}`,
            phone: clientData.phone,
            language: clientData.language || 'en',
            lead_source: clientData.leadSource || 'website',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingClient.id)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error('Error updating client in CRM:', updateError);
          throw updateError;
        }

        console.log('Client updated in CRM:', updatedClient);
        
        if (!updatedClient) {
          console.error('Client update failed - no record found');
          return null;
        }
        return updatedClient;
      } else {
        // Create new client with portal access
        const portalToken = this.generatePortalToken();
        
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            language: clientData.language || 'en',
            segment: 'new',
            total_bookings: 0,
            total_spent: 0,
            lead_source: clientData.leadSource || 'website',
            portal_access: true,
            portal_token: portalToken
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating client in CRM:', createError);
          throw createError;
        }

        console.log('New client created in CRM:', newClient);
        
        // Log the creation in sync_logs
        await this.logSyncOperation('clients', 'create', newClient.id);
        
        return newClient;
      }
    } catch (error) {
      console.error('CRM client creation/update failed:', error);
      await this.logError('createOrUpdateClient', error);
      return null;
    }
  },

  /**
   * Create a booking in the CRM system
   */
  async createBooking(bookingData: CRMBookingData): Promise<Booking | null> {
    try {
      console.log('Creating booking in CRM:', bookingData);
      
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          client_id: bookingData.clientId,
          yacht_id: bookingData.yachtId,
          session_date: bookingData.sessionDate,
          session_time: bookingData.sessionTime,
          status: 'pending',
          payment_status: 'pending',
          amount: bookingData.amount,
          notes: bookingData.specialRequests
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking in CRM:', error);
        throw error;
      }

      console.log('Booking created in CRM:', booking);
      
      // Update client statistics
      await this.updateClientStats(bookingData.clientId, bookingData.amount);
      
      // Log the creation in sync_logs
      await this.logSyncOperation('bookings', 'create', booking.id);
      
      // Create notification for the new booking
      await this.createBookingNotification(booking.id, bookingData.clientId);
      
      return booking;
    } catch (error) {
      console.error('CRM booking creation failed:', error);
      await this.logError('createBooking', error);
      return null;
    }
  },

  /**
   * Generate client portal access
   */
  async generateClientPortalAccess(clientId: string): Promise<ClientPortalAccess | null> {
    try {
      // Get client
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client for portal access:', error);
        throw error;
      }

      // Generate or use existing token
      if (!client) {
        console.error('Client not found for portal access generation');
        return null;
      }
      
      const token = client.portal_token || this.generatePortalToken();
      
      // Update client with portal access if needed
      if (!client.portal_access || !client.portal_token) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            portal_access: true,
            portal_token: token
          })
          .eq('id', clientId);

        if (updateError) {
          console.error('Error updating client portal access:', updateError);
          throw updateError;
        }
      }

      // Calculate expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Generate portal URL
      const portalUrl = `${FRONTEND_URL}portal?token=${token}`;

      return {
        token,
        url: portalUrl,
        expiresAt
      };
    } catch (error) {
      console.error('Failed to generate client portal access:', error);
      await this.logError('generateClientPortalAccess', error);
      return null;
    }
  },

  /**
   * Update client statistics after booking
   */
  async updateClientStats(clientId: string, bookingAmount: number): Promise<void> {
    try {
      // Get current client stats
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('total_bookings, total_spent, segment')
        .eq('id', clientId)
        .single();

      if (fetchError) {
        console.error('Error fetching client for stats update:', fetchError);
        throw fetchError;
      }

      // Calculate new values
      const totalBookings = (client.total_bookings || 0) + 1;
      const totalSpent = (client.total_spent || 0) + bookingAmount;
      
      // Determine segment based on booking history
      let segment = client.segment || 'new';
      if (totalBookings >= 5 || totalSpent >= 1000) {
        segment = 'vip';
      } else if (totalBookings >= 2) {
        segment = 'active';
      }

      // Update client record
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          total_bookings: totalBookings,
          total_spent: totalSpent,
          last_booking: new Date().toISOString(),
          segment: segment,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client stats:', updateError);
        throw updateError;
      }
      
      console.log('Client stats updated:', { clientId, totalBookings, totalSpent, segment });
    } catch (error) {
      console.error('Failed to update client stats:', error);
      await this.logError('updateClientStats', error);
    }
  },

  /**
   * Create notification for new booking
   */
  async createBookingNotification(bookingId: string, clientId: string): Promise<void> {
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('email, name')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error fetching client for notification:', clientError);
        throw clientError;
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'booking_created',
          title: 'New Booking Created',
          message: `A new booking has been created for ${client.name}`,
          recipient_id: clientId,
          recipient_email: client.email,
          channel: 'email',
          status: 'pending',
          booking_id: bookingId
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }
      
      console.log('Booking notification created for:', { bookingId, clientId });
    } catch (error) {
      console.error('Failed to create booking notification:', error);
      await this.logError('createBookingNotification', error);
    }
  },

  /**
   * Log synchronization operation
   */
  async logSyncOperation(tableName: string, operation: string, recordId?: string): Promise<void> {
    try {
      await supabase
        .from('sync_logs')
        .insert({
          table_name: tableName,
          operation: operation,
          record_id: recordId,
          sync_status: 'success',
          synced_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log sync operation:', error);
    }
  },

  /**
   * Log error to error_logs table
   */
  async logError(action: string, error: any): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .insert({
          action: action,
          error_message: error.message || String(error),
          error_stack: error.stack,
          context: { timestamp: new Date().toISOString() },
          user_agent: navigator.userAgent
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  },

  /**
   * Generate a unique token for client portal access
   */
  generatePortalToken(): string {
    return uuidv4();
  },

  /**
   * Validate client data
   */
  validateClientData(data: CRMClientData): string[] {
    const errors: string[] = [];
    
    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required');
    }
    
    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required');
    }
    
    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email format is invalid');
      }
    }
    
    if (!data.phone || data.phone.trim() === '') {
      errors.push('Phone number is required');
    }
    
    return errors;
  },

  /**
   * Validate booking data
   */
  validateBookingData(data: CRMBookingData): string[] {
    const errors: string[] = [];
    
    if (!data.clientId) {
      errors.push('Client ID is required');
    }
    
    if (!data.sessionDate) {
      errors.push('Session date is required');
    } else {
      const sessionDate = new Date(data.sessionDate);
      const today = new Date();
      
      // Normalize dates to UTC midnight
      const sessionDateUTC = new Date(Date.UTC(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      ));
      
      const todayUTC = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ));
      
      if (sessionDateUTC < todayUTC) {
        errors.push('Session date cannot be in the past');
      }
    }
    
    if (!data.sessionTime) {
      errors.push('Session time is required');
    }
    
    if (data.participants < 1 || data.participants > 8) {
      errors.push('Participants must be between 1 and 8');
    }
    
    if (data.amount <= 0) {
      errors.push('Amount must be greater than zero');
    }
    
    return errors;
  }
};