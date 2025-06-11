import { supabase } from './supabase';

export type WebhookPayload = {
  event: string;
  table: string;
  record: any;
  schema: string;
  old_record?: any;
};

export type EventHandler = (payload: WebhookPayload) => Promise<void>;

export const eventsService = {
  eventHandlers: new Map<string, EventHandler[]>(),
  webhookUrl: '',

  /**
   * Initialize events service
   */
  initialize(webhookUrl: string): void {
    console.log('Initializing events service');
    this.webhookUrl = webhookUrl;
  },

  /**
   * Register an event handler for a specific event
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  },

  /**
   * Trigger an event manually
   */
  async trigger(event: string, payload: any): Promise<void> {
    console.log(`Triggering event: ${event}`, payload);
    
    const handlers = this.eventHandlers.get(event) || [];
    const webhookPayload: WebhookPayload = {
      event,
      table: payload.table || '',
      record: payload.record || payload,
      schema: payload.schema || 'public',
      old_record: payload.old_record
    };
    
    // Execute all handlers
    const promises = handlers.map(handler => {
      try {
        return handler(webhookPayload);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
        return Promise.resolve();
      }
    });
    
    await Promise.all(promises);
  },

  /**
   * Send a webhook to external service
   */
  async sendWebhook(event: string, payload: any): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('Webhook URL not configured');
      return false;
    }
    
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending webhook:', error);
      
      // Log error
      await supabase
        .from('error_logs')
        .insert({
          action: 'send_webhook',
          error_message: error instanceof Error ? error.message : String(error),
          error_stack: error instanceof Error ? error.stack : undefined,
          context: { event, payload },
          timestamp: new Date().toISOString()
        });
      
      return false;
    }
  },

  /**
   * Set up database triggers for automated actions
   * This is a client-side simulation since actual DB triggers are set up in migrations
   */
  setupDatabaseTriggers(): void {
    // Example: Handle booking creation
    this.on('booking_created', async (payload) => {
      console.log('Booking created trigger:', payload);
      
      // Create notification for client
      if (payload.record && payload.record.client_id) {
        try {
          const { data: client } = await supabase
            .from('clients')
            .select('email, name')
            .eq('id', payload.record.client_id)
            .single();
            
          if (client) {
            await supabase
              .from('notifications')
              .insert({
                type: 'booking_confirmation',
                title: 'Booking Confirmation',
                message: `Your booking for ${new Date(payload.record.session_date).toLocaleDateString()} at ${payload.record.session_time} has been confirmed.`,
                recipient_id: payload.record.client_id,
                recipient_email: client.email,
                channel: 'email',
                status: 'pending',
                booking_id: payload.record.id
              });
          }
        } catch (error) {
          console.error('Error creating booking notification:', error);
        }
      }
      
      // Send webhook to external service
      await this.sendWebhook('booking_created', payload.record);
    });
    
    // Example: Handle booking status change
    this.on('booking_updated', async (payload) => {
      console.log('Booking updated trigger:', payload);
      
      // Only process status changes
      if (payload.old_record && 
          payload.record && 
          payload.old_record.status !== payload.record.status) {
        
        try {
          const { data: client } = await supabase
            .from('clients')
            .select('email, name')
            .eq('id', payload.record.client_id)
            .single();
            
          if (client) {
            await supabase
              .from('notifications')
              .insert({
                type: 'booking_status_changed',
                title: `Booking ${payload.record.status.charAt(0).toUpperCase() + payload.record.status.slice(1)}`,
                message: `Your booking for ${new Date(payload.record.session_date).toLocaleDateString()} has been ${payload.record.status}.`,
                recipient_id: payload.record.client_id,
                recipient_email: client.email,
                channel: 'email',
                status: 'pending',
                booking_id: payload.record.id
              });
          }
        } catch (error) {
          console.error('Error creating booking status notification:', error);
        }
        
        // Send webhook to external service
        await this.sendWebhook('booking_status_changed', {
          booking: payload.record,
          old_status: payload.old_record.status,
          new_status: payload.record.status
        });
      }
    });
    
    // Example: Handle client creation
    this.on('client_created', async (payload) => {
      console.log('Client created trigger:', payload);
      
      // Send welcome notification
      try {
        await supabase
          .from('notifications')
          .insert({
            type: 'welcome',
            title: 'Welcome to Garda Racing Yacht Club',
            message: 'Thank you for joining Garda Racing Yacht Club. We look forward to providing you with unforgettable sailing experiences.',
            recipient_id: payload.record.id,
            recipient_email: payload.record.email,
            channel: 'email',
            status: 'pending'
          });
      } catch (error) {
        console.error('Error creating welcome notification:', error);
      }
      
      // Send webhook to external service
      await this.sendWebhook('client_created', payload.record);
    });
  },

  /**
   * Process webhook from external service
   */
  async processWebhook(body: any): Promise<boolean> {
    try {
      console.log('Processing incoming webhook:', body);
      
      const { event, payload } = body;
      
      if (!event || !payload) {
        throw new Error('Invalid webhook format: missing event or payload');
      }
      
      // Log webhook receipt
      await supabase
        .from('sync_logs')
        .insert({
          table_name: payload.table || 'external',
          operation: 'webhook_received',
          record_id: payload.id,
          sync_status: 'success',
          synced_at: new Date().toISOString()
        });
      
      // Trigger local event handlers
      await this.trigger(event, payload);
      
      return true;
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Log error
      await supabase
        .from('error_logs')
        .insert({
          action: 'process_webhook',
          error_message: error instanceof Error ? error.message : String(error),
          error_stack: error instanceof Error ? error.stack : undefined,
          context: { body },
          timestamp: new Date().toISOString()
        });
      
      return false;
    }
  }
};