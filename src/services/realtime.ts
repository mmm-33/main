import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeSubscription = {
  channel: RealtimeChannel;
  tableName: string;
  callback: (payload: any) => void;
};

export type ConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export const realtimeService = {
  activeSubscriptions: new Map<string, RealtimeSubscription>(),
  connectionState: 'DISCONNECTED' as ConnectionState,
  connectionListeners: new Set<(state: ConnectionState) => void>(),
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimeout: null as NodeJS.Timeout | null,

  /**
   * Initialize realtime service and set up connection state listeners
   */
  initialize(): void {
    console.log('Initializing realtime service');
    
    // Set up connection state change listener
    supabase.realtime.onOpen(() => {
      console.log('Realtime connection established');
      this.setConnectionState('CONNECTED');
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    supabase.realtime.onClose(() => {
      console.log('Realtime connection closed');
      this.setConnectionState('DISCONNECTED');
      this.attemptReconnect();
    });

    supabase.realtime.onError((error) => {
      console.error('Realtime connection error:', error);
      this.setConnectionState('ERROR');
      this.attemptReconnect();
    });
  },

  /**
   * Subscribe to realtime changes on a table
   */
  subscribeToTable(
    tableName: string,
    callback: (payload: any) => void,
    filter?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
      filter?: string;
    }
  ): string {
    console.log(`Subscribing to table: ${tableName}`);
    
    const subscriptionId = `${tableName}_${Date.now()}`;
    const schema = filter?.schema || 'public';
    const event = filter?.event || '*';
    
    // Create channel
    let channel = supabase.channel(subscriptionId);
    
    // Set up subscription
    channel = channel.on(
      'postgres_changes',
      {
        event,
        schema,
        table: tableName,
        filter: filter?.filter,
      },
      (payload) => {
        console.log(`Received ${payload.eventType} event for ${tableName}:`, payload);
        callback(payload);
      }
    );
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Subscription status for ${tableName}:`, status);
      
      if (status === 'SUBSCRIBED') {
        this.activeSubscriptions.set(subscriptionId, {
          channel,
          tableName,
          callback,
        });
      }
    });
    
    return subscriptionId;
  },

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.activeSubscriptions.get(subscriptionId);
    
    if (!subscription) {
      console.warn(`Subscription ${subscriptionId} not found`);
      return false;
    }
    
    subscription.channel.unsubscribe();
    this.activeSubscriptions.delete(subscriptionId);
    console.log(`Unsubscribed from ${subscription.tableName}`);
    
    return true;
  },

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll(): void {
    this.activeSubscriptions.forEach((subscription, id) => {
      subscription.channel.unsubscribe();
      console.log(`Unsubscribed from ${subscription.tableName}`);
    });
    
    this.activeSubscriptions.clear();
  },

  /**
   * Add connection state change listener
   */
  addConnectionListener(listener: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(listener);
    
    // Immediately notify with current state
    listener(this.connectionState);
    
    // Return cleanup function
    return () => {
      this.connectionListeners.delete(listener);
    };
  },

  /**
   * Set connection state and notify listeners
   */
  setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    
    // Notify all listeners
    this.connectionListeners.forEach(listener => {
      listener(state);
    });
  },

  /**
   * Attempt to reconnect after connection failure
   */
  attemptReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff with max 30s
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.setConnectionState('CONNECTING');
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('Reconnecting to realtime service...');
      
      // Unsubscribe from all channels and resubscribe
      const subscriptions = Array.from(this.activeSubscriptions.values());
      this.unsubscribeAll();
      
      // Reconnect to Supabase realtime
      supabase.realtime.connect();
      
      // Resubscribe to all previous subscriptions
      subscriptions.forEach(sub => {
        this.subscribeToTable(sub.tableName, sub.callback);
      });
    }, delay);
  },

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  },

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): Map<string, RealtimeSubscription> {
    return this.activeSubscriptions;
  }
};