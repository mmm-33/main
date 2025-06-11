import { createClient } from '@supabase/supabase-js';

// Use the provided CRM credentials
const supabaseUrl = 'https://czxfcjmbhqieljqlyoqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eGZjam1iaHFpZWxqcWx5b3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODEzNzAsImV4cCI6MjA2NTA1NzM3MH0.9ExttPAreL2yklm5rbEJAlQ-MVMzW8GCz0u4ffPdn8Y';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Constants
export const FRONTEND_URL = 'https://inquisitive-selkie-2bc7bf.netlify.app/';

// Database types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language?: string;
  segment?: 'new' | 'active' | 'vip' | 'corporate';
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
  status?: 'pending' | 'confirmed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed';
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

export interface Payment {
  id: string;
  booking_id?: string;
  client_id?: string;
  amount: number;
  status?: 'pending' | 'completed' | 'failed';
  method?: 'stripe' | 'paypal';
  reference: string;
  processed_at?: string;
  created_at: string;
}

export interface Message {
  id: number;
  text: string;
  session_id?: string;
  sender?: 'user' | 'bot';
  inserted_at?: string;
  language?: string;
}

export interface CMSContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  language: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Yacht {
  id: string;
  name: string;
  status?: 'active' | 'available' | 'booked' | 'maintenance';
  skipper?: string;
  location?: string;
  next_booking?: string;
  maintenance_due?: string;
  total_hours?: number;
  last_service?: string;
  created_at: string;
  updated_at: string;
}

export interface ErrorLog {
  id: string;
  action: string;
  error_message: string;
  error_stack?: string;
  context?: any;
  timestamp?: string;
  user_agent?: string;
}

export interface SyncLog {
  id: string;
  table_name: string;
  operation: string;
  record_id?: string;
  sync_status?: 'success' | 'failed' | 'pending';
  error_message?: string;
  synced_at?: string;
  participants: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  text: string;
  inserted_at: string;
}

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  language: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}