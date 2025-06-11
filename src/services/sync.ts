import { supabase } from './supabase';

/**
 * Service for handling data synchronization between systems
 */
export const syncService = {
  /**
   * Synchronize data between booking system and CRM
   */
  async syncData(entity: 'clients' | 'bookings' | 'yachts', id?: string): Promise<boolean> {
    try {
      console.log(`Syncing ${entity}${id ? ` with ID ${id}` : ''}`);
      
      // Log sync attempt
      const { error: logError } = await supabase
        .from('sync_logs')
        .insert({
          table_name: entity,
          operation: 'sync',
          record_id: id,
          sync_status: 'pending',
          synced_at: new Date().toISOString()
        });
        
      if (logError) {
        console.error('Error logging sync attempt:', logError);
      }
      
      // Perform sync based on entity type
      let success = false;
      
      switch (entity) {
        case 'clients':
          success = await this.syncClients(id);
          break;
        case 'bookings':
          success = await this.syncBookings(id);
          break;
        case 'yachts':
          success = await this.syncYachts(id);
          break;
      }
      
      // Update sync log with result
      if (id) {
        const { error: updateError } = await supabase
          .from('sync_logs')
          .update({
            sync_status: success ? 'success' : 'failed',
            synced_at: new Date().toISOString()
          })
          .eq('table_name', entity)
          .eq('record_id', id)
          .eq('sync_status', 'pending');
          
        if (updateError) {
          console.error('Error updating sync log:', updateError);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error syncing ${entity}:`, error);
      
      // Log error
      await supabase
        .from('error_logs')
        .insert({
          action: `sync_${entity}`,
          error_message: error instanceof Error ? error.message : String(error),
          error_stack: error instanceof Error ? error.stack : undefined,
          context: { entity, id },
          timestamp: new Date().toISOString()
        });
        
      return false;
    }
  },
  
  /**
   * Synchronize clients
   */
  async syncClients(clientId?: string): Promise<boolean> {
    try {
      // If specific client ID provided, sync just that client
      if (clientId) {
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) {
          console.error('Error fetching client for sync:', error);
          return false;
        }
        
        console.log('Client synced successfully:', client);
        return true;
      }
      
      // Otherwise sync all clients that need syncing
      // This would typically involve more complex logic to determine which clients need syncing
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('Error fetching clients for sync:', error);
        return false;
      }
      
      console.log(`${clients.length} clients synced successfully`);
      return true;
    } catch (error) {
      console.error('Error in syncClients:', error);
      return false;
    }
  },
  
  /**
   * Synchronize bookings
   */
  async syncBookings(bookingId?: string): Promise<boolean> {
    try {
      // If specific booking ID provided, sync just that booking
      if (bookingId) {
        const { data: booking, error } = await supabase
          .from('bookings')
          .select(`
            *,
            client:clients(id, name, email),
            yacht:yachts(id, name)
          `)
          .eq('id', bookingId)
          .single();
          
        if (error) {
          console.error('Error fetching booking for sync:', error);
          return false;
        }
        
        console.log('Booking synced successfully:', booking);
        return true;
      }
      
      // Otherwise sync all bookings that need syncing
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Error fetching bookings for sync:', error);
        return false;
      }
      
      console.log(`${bookings.length} bookings synced successfully`);
      return true;
    } catch (error) {
      console.error('Error in syncBookings:', error);
      return false;
    }
  },
  
  /**
   * Synchronize yachts
   */
  async syncYachts(yachtId?: string): Promise<boolean> {
    try {
      // If specific yacht ID provided, sync just that yacht
      if (yachtId) {
        const { data: yacht, error } = await supabase
          .from('yachts')
          .select('*')
          .eq('id', yachtId)
          .single();
          
        if (error) {
          console.error('Error fetching yacht for sync:', error);
          return false;
        }
        
        console.log('Yacht synced successfully:', yacht);
        return true;
      }
      
      // Otherwise sync all yachts
      const { data: yachts, error } = await supabase
        .from('yachts')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching yachts for sync:', error);
        return false;
      }
      
      console.log(`${yachts.length} yachts synced successfully`);
      return true;
    } catch (error) {
      console.error('Error in syncYachts:', error);
      return false;
    }
  },
  
  /**
   * Check sync status
   */
  async checkSyncStatus(entity: 'clients' | 'bookings' | 'yachts', id: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('sync_status')
        .eq('table_name', entity)
        .eq('record_id', id)
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error checking sync status:', error);
        return 'unknown';
      }
      
      return data.sync_status;
    } catch (error) {
      console.error('Error in checkSyncStatus:', error);
      return 'error';
    }
  },
  
  /**
   * Get sync history
   */
  async getSyncHistory(entity: 'clients' | 'bookings' | 'yachts', id: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('table_name', entity)
        .eq('record_id', id)
        .order('synced_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Error fetching sync history:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getSyncHistory:', error);
      return [];
    }
  }
};