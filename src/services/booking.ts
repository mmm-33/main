import { supabase, type Booking, type Client, type BookingWithClient } from './supabase';
import { crmService, type CRMClientData, type CRMBookingData } from './crm';
import toast from 'react-hot-toast';
import { stripeService } from './stripe';

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

export const bookingService = {
  async createBooking(formData: BookingFormData): Promise<BookingWithClient | null> {
    try {
      console.log('Creating booking with data:', formData);
      const totalAmount = formData.participants * 199;
      
      // Determine payment amount based on payment method
      const paymentAmount = formData.paymentMethod === 'deposit' 
        ? formData.depositAmount || Math.round(totalAmount * 0.3)
        : totalAmount;
      
      // Step 1: Prepare client data for CRM
      const clientData: CRMClientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        language: supabase.auth.getSession() ? 
          (await supabase.auth.getSession()).data.session?.user.app_metadata?.language || 'en' : 'en',
        leadSource: 'website'
      };
      
      // Validate client data
      const clientValidationErrors = crmService.validateClientData(clientData);
      if (clientValidationErrors.length > 0) {
        clientValidationErrors.forEach(error => toast.error(error));
        return null;
      }
      
      // Create or update client in CRM
      const client = await crmService.createOrUpdateClient(clientData);

      if (!client) {
        toast.error('Failed to create or update client in CRM. Please try again.');
        return null;
      }

      console.log('Client created/retrieved:', client);

      // Step 2: Get an available yacht
      const availableYacht = await this.getAvailableYacht(formData.bookingDate);
      console.log('Available yacht:', availableYacht);

      // Step 3: Prepare booking data for CRM
      const bookingData: CRMBookingData = {
        clientId: client.id,
        sessionDate: formData.bookingDate,
        sessionTime: formData.timeSlot,
        participants: formData.participants,
        amount: totalAmount,
        specialRequests: formData.specialRequests,
        yachtId: availableYacht?.id
      };
      
      // Validate booking data
      const bookingValidationErrors = crmService.validateBookingData(bookingData);
      if (bookingValidationErrors.length > 0) {
        bookingValidationErrors.forEach(error => toast.error(error));
        return null;
      }
      
      // Create booking in CRM
      const booking = await crmService.createBooking(bookingData);
      
      if (!booking) {
        toast.error('Failed to create booking in CRM. Please try again.');
        return null;
      }

      // Update yacht status if assigned
      if (availableYacht) {
        await this.updateYachtStatus(availableYacht.id, 'booked', formData.bookingDate);
      }

      // Generate client portal access
      const portalAccess = await crmService.generateClientPortalAccess(client.id);
      
      if (portalAccess) {
        console.log('Client portal access generated:', portalAccess);
      }
      
      // Fetch the complete booking with related data
      const completeBooking = await this.getBookingWithDetails(booking.id);
      
      if (!completeBooking) {
        // Return basic booking data if we can't fetch the complete booking
        const basicBooking = {
          ...booking,
          client: client,
          yacht: availableYacht
        } as BookingWithClient;
        
        toast.success('Booking created successfully! Check your email for confirmation.');
        return basicBooking;
      }

      // Step 5.5: Process payment if needed
      if (formData.paymentMethod === 'card' && completeBooking) {
        // Payment was already processed via Stripe Elements
        // Update payment status
        await this.updateBookingStatus(completeBooking.id, 'confirmed');
        await this.updatePaymentStatus(completeBooking.id, 'paid');
      }
      
      toast.success('Booking created successfully! Check your email for confirmation.');
      return completeBooking;
    } catch (error) {
      console.error('Error in createBooking:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return null;
    }
  },

  async getAvailableYacht(bookingDate: string): Promise<{ id: string; name: string } | null> {
    try {
      const { data: yachts, error } = await supabase
        .from('yachts')
        .select('id, name')
        .eq('status', 'available')
        .limit(1);

      if (error) {
        console.log('No available yacht found or error:', error);
        return null;
      }

      return yachts && yachts.length > 0 ? yachts[0] : null;
    } catch (error) {
      console.error('Error getting available yacht:', error);
      return null;
    }
  },

  async updateYachtStatus(yachtId: string, status: string, nextBooking?: string): Promise<void> {
    try {
      const updateData: any = { status };
      if (nextBooking) {
        updateData.next_booking = nextBooking;
      }

      const { error } = await supabase
        .from('yachts')
        .update(updateData)
        .eq('id', yachtId);

      if (error) {
        console.error('Error updating yacht status:', error);
      }
    } catch (error) {
      console.error('Error in updateYachtStatus:', error);
    }
  },

  async getBookingWithDetails(id: string): Promise<BookingWithClient | null> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          yacht:yachts(id, name)
        `)
        .eq('id', id);

      if (error) {
        console.error('Error fetching booking:', error);
        return null;
      }

      return bookings?.[0] || null;
    } catch (error) {
      console.error('Error in getBooking:', error);
      return null;
    }
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating booking status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      return false;
    }
  },

  async updatePaymentStatus(id: string, status: 'pending' | 'paid' | 'failed'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating payment status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      return false;
    }
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

    // Phone validation - теперь проверяем только наличие номера, так как валидация происходит в компоненте PhoneInput
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