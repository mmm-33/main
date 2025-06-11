// This file has been deprecated as we're no longer using Supabase
// Keeping minimal type definitions for backward compatibility during transition

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language?: string;
  segment?: string;
  total_bookings?: number;
  total_spent?: number;
  last_booking?: string;
  lead_source?: string;
  portal_access?: boolean;
  portal_token?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id?: string;
  yacht_id?: string;
  session_date: string;
  session_time: string;
  status?: string;
  payment_status?: string;
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithClient extends Booking {
  client?: Client;
  yacht?: {
    id: string;
    name: string;
  };
}

// Helper function to validate UUID
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to generate UUID v4
export function generateUuid(): string {
  return crypto.randomUUID();
}

// Frontend URL for redirects
export const FRONTEND_URL = window.location.origin;