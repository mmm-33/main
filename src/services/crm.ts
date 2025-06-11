import { isValidUuid, generateUuid, Client, Booking } from './supabase';
import { FRONTEND_URL } from './supabase';

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

// Mock data storage
const mockClients: Record<string, Client> = {};
const mockBookings: Record<string, Booking> = {};

export const crmService = {
  /**
   * Create or update a client in the CRM system
   */
  async createOrUpdateClient(clientData: CRMClientData): Promise<Client | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if client already exists by email
      const existingClient = Object.values(mockClients).find(
        client => client.email === clientData.email
      );
      
      if (existingClient) {
        // Update existing client
        const updatedClient: Client = {
          ...existingClient,
          name: `${clientData.firstName} ${clientData.lastName}`,
          phone: clientData.phone,
          language: clientData.language || 'en',
          lead_source: clientData.leadSource || 'website',
          updated_at: new Date().toISOString()
        };
        
        mockClients[existingClient.id] = updatedClient;
        return updatedClient;
      } else {
        // Create new client
        const clientId = generateUuid();
        const portalToken = this.generatePortalToken();
        
        const newClient: Client = {
          id: clientId,
          name: `${clientData.firstName} ${clientData.lastName}`,
          email: clientData.email,
          phone: clientData.phone,
          language: clientData.language || 'en',
          segment: 'new',
          total_bookings: 0,
          total_spent: 0,
          lead_source: clientData.leadSource || 'website',
          portal_access: true,
          portal_token: portalToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        mockClients[clientId] = newClient;
        return newClient;
      }
    } catch (error) {
      console.error('CRM client creation/update failed:', error);
      return null;
    }
  },

  /**
   * Create a booking in the CRM system
   */
  async createBooking(bookingData: CRMBookingData): Promise<Booking | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const bookingId = generateUuid();
      const booking: Booking = {
        id: bookingId,
        client_id: bookingData.clientId,
        yacht_id: bookingData.yachtId,
        session_date: bookingData.sessionDate,
        session_time: bookingData.sessionTime,
        status: 'pending',
        payment_status: 'pending',
        amount: bookingData.amount,
        notes: bookingData.specialRequests,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockBookings[bookingId] = booking;
      
      // Update client stats
      await this.updateClientStats(bookingData.clientId, bookingData.amount);
      
      return booking;
    } catch (error) {
      console.error('CRM booking creation failed:', error);
      return null;
    }
  },

  /**
   * Generate client portal access
   */
  async generateClientPortalAccess(clientId: string): Promise<ClientPortalAccess | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const client = mockClients[clientId];
      if (!client) return null;
      
      const token = client.portal_token || this.generatePortalToken();
      
      // Update client with portal access if needed
      if (!client.portal_access || !client.portal_token) {
        client.portal_access = true;
        client.portal_token = token;
        mockClients[clientId] = client;
      }
      
      // Calculate expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Generate portal URL
      const portalUrl = `${FRONTEND_URL}/portal?token=${token}`;
      
      return {
        token,
        url: portalUrl,
        expiresAt
      };
    } catch (error) {
      console.error('Failed to generate client portal access:', error);
      return null;
    }
  },

  /**
   * Update client statistics after booking
   */
  async updateClientStats(clientId: string, bookingAmount: number): Promise<void> {
    try {
      const client = mockClients[clientId];
      if (!client) return;
      
      // Update stats
      const totalBookings = (client.total_bookings || 0) + 1;
      const totalSpent = (client.total_spent || 0) + bookingAmount;
      
      // Determine segment based on booking history
      let segment = client.segment || 'new';
      if (totalBookings >= 5 || totalSpent >= 1000) {
        segment = 'vip';
      } else if (totalBookings >= 2) {
        segment = 'active';
      }
      
      // Update client
      mockClients[clientId] = {
        ...client,
        total_bookings: totalBookings,
        total_spent: totalSpent,
        last_booking: new Date().toISOString(),
        segment: segment,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to update client stats:', error);
    }
  },

  /**
   * Generate a unique token for client portal access
   */
  generatePortalToken(): string {
    return generateUuid();
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
    } else if (!isValidUuid(data.clientId)) {
      errors.push('Client ID must be a valid UUID');
    }
    
    if (data.yachtId && !isValidUuid(data.yachtId)) {
      errors.push('Yacht ID must be a valid UUID');
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