import React, { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useRealtime } from '../hooks/useRealtime';
import { Clock, AlertCircle, CheckCircle, RefreshCw, Filter } from 'lucide-react';

interface EventLogProps {
  maxEvents?: number;
  filter?: string[];
  className?: string;
  title?: string;
  autoRefresh?: boolean;
}

interface LogEvent {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  status: 'success' | 'error' | 'info';
  details?: any;
}

const EventLog: React.FC<EventLogProps> = ({
  maxEvents = 50,
  filter = [],
  className = '',
  title = 'Event Log',
  autoRefresh = true
}) => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<LogEvent[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(filter);
  const [isLoading, setIsLoading] = useState(true);
  
  const { on } = useEvents();
  const { subscribeToTable } = useRealtime();

  // Load initial events
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      
      try {
        // Fetch error logs
        const { data: errorLogs, error: errorLogsError } = await supabase
          .from('error_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(maxEvents / 2);
          
        if (errorLogsError) {
          console.error('Error fetching error logs:', errorLogsError);
        }
        
        // Fetch sync logs
        const { data: syncLogs, error: syncLogsError } = await supabase
          .from('sync_logs')
          .select('*')
          .order('synced_at', { ascending: false })
          .limit(maxEvents / 2);
          
        if (syncLogsError) {
          console.error('Error fetching sync logs:', syncLogsError);
        }
        
        // Convert to unified format
        const unifiedEvents: LogEvent[] = [
          ...(errorLogs || []).map((log: any) => ({
            id: log.id,
            timestamp: new Date(log.timestamp),
            type: 'error',
            message: `Error in ${log.action}: ${log.error_message}`,
            status: 'error' as const,
            details: {
              action: log.action,
              errorStack: log.error_stack,
              context: log.context
            }
          })),
          ...(syncLogs || []).map((log: any) => ({
            id: log.id,
            timestamp: new Date(log.synced_at),
            type: 'sync',
            message: `${log.operation.toUpperCase()} operation on ${log.table_name}${log.record_id ? ` (ID: ${log.record_id})` : ''}`,
            status: log.sync_status === 'success' ? 'success' as const : 'error' as const,
            details: {
              table: log.table_name,
              operation: log.operation,
              recordId: log.record_id,
              status: log.sync_status
            }
          }))
        ];
        
        // Sort by timestamp
        unifiedEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Limit to maxEvents
        const limitedEvents = unifiedEvents.slice(0, maxEvents);
        
        setEvents(limitedEvents);
        applyFilters(limitedEvents, activeFilters);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
    
    // Set up realtime subscriptions if autoRefresh is enabled
    if (autoRefresh) {
      // Subscribe to error_logs table
      const errorLogsSub = subscribeToTable('error_logs', (payload) => {
        if (payload.eventType === 'INSERT') {
          const log = payload.new;
          const newEvent: LogEvent = {
            id: log.id,
            timestamp: new Date(log.timestamp),
            type: 'error',
            message: `Error in ${log.action}: ${log.error_message}`,
            status: 'error',
            details: {
              action: log.action,
              errorStack: log.error_stack,
              context: log.context
            }
          };
          
          setEvents(prev => {
            const updated = [newEvent, ...prev].slice(0, maxEvents);
            applyFilters(updated, activeFilters);
            return updated;
          });
        }
      });
      
      // Subscribe to sync_logs table
      const syncLogsSub = subscribeToTable('sync_logs', (payload) => {
        if (payload.eventType === 'INSERT') {
          const log = payload.new;
          const newEvent: LogEvent = {
            id: log.id,
            timestamp: new Date(log.synced_at),
            type: 'sync',
            message: `${log.operation.toUpperCase()} operation on ${log.table_name}${log.record_id ? ` (ID: ${log.record_id})` : ''}`,
            status: log.sync_status === 'success' ? 'success' : 'error',
            details: {
              table: log.table_name,
              operation: log.operation,
              recordId: log.record_id,
              status: log.sync_status
            }
          };
          
          setEvents(prev => {
            const updated = [newEvent, ...prev].slice(0, maxEvents);
            applyFilters(updated, activeFilters);
            return updated;
          });
        }
      });
      
      // Clean up subscriptions
      return () => {
        // Unsubscribe is handled automatically by the useRealtime hook
      };
    }
  }, [maxEvents, autoRefresh, subscribeToTable]);

  // Apply filters to events
  const applyFilters = (eventList: LogEvent[], filters: string[]) => {
    if (filters.length === 0) {
      setFilteredEvents(eventList);
      return;
    }
    
    const filtered = eventList.filter(event => 
      filters.includes(event.type) || filters.includes(event.status)
    );
    
    setFilteredEvents(filtered);
  };

  // Toggle filter
  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
      
    setActiveFilters(newFilters);
    applyFilters(events, newFilters);
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString() + ', ' + date.toLocaleDateString();
  };

  // Get status icon
  const getStatusIcon = (status: LogEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 500);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Refresh events"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Filter events"
            >
              <Filter className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Filter by type</div>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('error')}
                      onChange={() => toggleFilter('error')}
                      className="h-3 w-3 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">Errors</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('sync')}
                      onChange={() => toggleFilter('sync')}
                      className="h-3 w-3 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">Sync Events</span>
                  </label>
                </div>
                
                <div className="text-xs font-medium text-gray-700 mt-2 mb-1">Filter by status</div>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('success')}
                      onChange={() => toggleFilter('success')}
                      className="h-3 w-3 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">Success</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes('error')}
                      onChange={() => toggleFilter('error')}
                      className="h-3 w-3 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">Error</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event list */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-600">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <li key={event.id} className="hover:bg-gray-50 transition-colors duration-200">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.message}
                        </p>
                        <p className="text-xs text-gray-500 ml-2">
                          {formatTimestamp(event.timestamp)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Type: <span className="font-medium capitalize">{event.type}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {activeFilters.length > 0 ? ' (filtered)' : ''}
        </span>
        <span className="text-xs text-gray-500">
          {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
        </span>
      </div>
    </div>
  );
};

export default EventLog;