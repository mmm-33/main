import { useEffect, useCallback } from 'react';
import { eventsService, EventHandler, WebhookPayload } from '../services/events';

type UseEventsOptions = {
  webhookUrl?: string;
  setupTriggers?: boolean;
};

export const useEvents = (options: UseEventsOptions = {}) => {
  // Initialize events service
  useEffect(() => {
    if (options.webhookUrl) {
      eventsService.initialize(options.webhookUrl);
    }
    
    if (options.setupTriggers) {
      eventsService.setupDatabaseTriggers();
    }
  }, [options.webhookUrl, options.setupTriggers]);

  // Register event handler
  const on = useCallback((event: string, handler: EventHandler) => {
    return eventsService.on(event, handler);
  }, []);

  // Trigger event manually
  const trigger = useCallback(async (event: string, payload: any) => {
    return eventsService.trigger(event, payload);
  }, []);

  // Send webhook
  const sendWebhook = useCallback(async (event: string, payload: any) => {
    return eventsService.sendWebhook(event, payload);
  }, []);

  // Process incoming webhook
  const processWebhook = useCallback(async (body: any) => {
    return eventsService.processWebhook(body);
  }, []);

  return {
    on,
    trigger,
    sendWebhook,
    processWebhook
  };
};