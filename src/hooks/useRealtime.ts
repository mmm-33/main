import { useState, useEffect, useCallback } from 'react';
import { realtimeService, ConnectionState } from '../services/realtime';

type UseRealtimeOptions = {
  onConnectionChange?: (state: ConnectionState) => void;
  autoInitialize?: boolean;
};

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    realtimeService.getConnectionState()
  );
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  // Initialize realtime service if not already initialized
  useEffect(() => {
    if (options.autoInitialize !== false) {
      realtimeService.initialize();
    }
    
    // Set up connection state listener
    const unsubscribe = realtimeService.addConnectionListener((state) => {
      setConnectionState(state);
      options.onConnectionChange?.(state);
    });
    
    return () => {
      unsubscribe();
    };
  }, [options.autoInitialize, options.onConnectionChange]);

  // Subscribe to a table
  const subscribeToTable = useCallback((
    tableName: string,
    callback: (payload: any) => void,
    filter?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      schema?: string;
      filter?: string;
    }
  ) => {
    const subscriptionId = realtimeService.subscribeToTable(tableName, callback, filter);
    setSubscriptions(prev => [...prev, subscriptionId]);
    return subscriptionId;
  }, []);

  // Unsubscribe from a specific subscription
  const unsubscribe = useCallback((subscriptionId: string) => {
    const success = realtimeService.unsubscribe(subscriptionId);
    if (success) {
      setSubscriptions(prev => prev.filter(id => id !== subscriptionId));
    }
    return success;
  }, []);

  // Unsubscribe from all subscriptions
  const unsubscribeAll = useCallback(() => {
    realtimeService.unsubscribeAll();
    setSubscriptions([]);
  }, []);

  // Clean up subscriptions on unmount
  useEffect(() => {
    return () => {
      // Only unsubscribe from subscriptions created by this hook
      subscriptions.forEach(id => {
        realtimeService.unsubscribe(id);
      });
    };
  }, [subscriptions]);

  return {
    connectionState,
    subscribeToTable,
    unsubscribe,
    unsubscribeAll,
    activeSubscriptions: subscriptions,
    isConnected: connectionState === 'CONNECTED'
  };
};