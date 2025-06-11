import { toast } from 'react-hot-toast';
import { isValidUuid, generateUuid, type Booking, type Client, type BookingWithClient } from './supabase';

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bookingDate: string;
  timeSlot: string;
  participants: number;
  specialRequests?: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
  paymentMethod?: string;
  depositAmount?: number;
  paymentSucceeded?: boolean;
}

// Mock data for available yachts
const MOCK_YACHTS = [
  { id: generateUuid(), name: 'Bavaria 34' },
  { id: generateUuid(), name: 'Beneteau First 36.7' },
  { id: generateUuid(), name: 'J/109' }
];

// Mock client data store
const mockClients: Record<string, Client> = {};

// Mock booking data store
const mockBookings: Record<string, BookingWithClient> = {};

export const bookingService = {
  async createBooking(formData: BookingFormData): Promise<BookingWithClient | null> {
    try {
      console.log('Creating booking with data:', formData);
      const totalAmount = formData.participants * 199;
      
      // Determine payment amount based on payment method
      const paymentAmount = formData.paymentMethod === 'deposit' 
        ? formData.depositAmount || Math.round(totalAmount * 0.3)
        : totalAmount;
      
      // Create client
      const clientId = generateUuid();
      const client: Client = {
        id: clientId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        language: 'en',
        segment: 'new',
        total_bookings: 1,
        total_spent: totalAmount,
        lead_source: 'website',
        portal_access: true,
        portal_token: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockClients[clientId] = client;
      
      // Get an available yacht
      const availableYacht = await this.getAvailableYacht(formData.bookingDate);
      
      // Create booking
      const bookingId = generateUuid();
      const booking: BookingWithClient = {
        id: bookingId,
        client_id: clientId,
        yacht_id: availableYacht?.id,
        session_date: formData.bookingDate,
        session_time: formData.timeSlot,
        status: formData.paymentMethod === 'card' ? 'confirmed' : 'pending',
        payment_status: formData.paymentMethod === 'card' ? 'paid' : 'pending',
        amount: totalAmount,
        notes: formData.specialRequests,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: client,
        yacht: availableYacht
      };
      
      mockBookings[bookingId] = booking;
      
      toast.success('Booking created successfully! Check your email for confirmation.');
      return booking;
    } catch (error) {
      console.error('Error in createBooking:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return null;
    }
  },

  async getAvailableYacht(bookingDate: string): Promise<{ id: string; name: string } | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return a random yacht from the mock data
    return MOCK_YACHTS[Math.floor(Math.random() * MOCK_YACHTS.length)];
  },

  async updateYachtStatus(yachtId: string, status: string, nextBooking?: string): Promise<void> {
    console.log(`Yacht ${yachtId} status updated to ${status}`);
    if (nextBooking) {
      console.log(`Next booking set to ${nextBooking}`);
    }
  },

  async getBookingWithDetails(id: string): Promise<BookingWithClient | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockBookings[id] || null;
  },

  async updateBookingStatus(id: string, status: string): Promise<boolean> {
    if (mockBookings[id]) {
      mockBookings[id].status = status;
      mockBookings[id].updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async updatePaymentStatus(id: string, status: 'pending' | 'paid' | 'failed'): Promise<boolean> {
    if (mockBookings[id]) {
      mockBookings[id].payment_status = status;
      mockBookings[id].updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  validateBookingForm(formData: BookingFormData): string[] {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.bookingDate) errors.push('Booking date is required');
    if (!formData.timeSlot) errors.push('Time slot is required');
    if (formData.participants < 1 || formData.participants > 8) {
      errors.push('Participants must be between 1 and 8');
    }
    if (!formData.agreeTerms) errors.push('You must agree to the terms and conditions');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation
    if (!formData.phone) {
      errors.push('Phone number is required');
    }
    
    // Payment method validation
    if (formData.paymentMethod === 'card' && !formData.paymentSucceeded) {
      errors.push('Payment must be completed');
    }

    // Date validation (must be in the future)
    const selectedDate = new Date(formData.bookingDate);
    const today = new Date();
   
    // Normalize both dates to UTC midnight to avoid timezone issues
    const selectedDateUTC = new Date(Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0, 0, 0, 0
    ));
    
    const todayUTC = new Date(Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0, 0, 0, 0
    ));
    
    if (selectedDate < today) {
      errors.push('Booking date must be in the future');
    }

    return errors;
  }
};