import React, { useState, useEffect } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import RealtimeStatus from './RealtimeStatus';
import { RefreshCw, Clock } from 'lucide-react';

interface RealtimeDataProps<T> {
  tableName: string;
  initialData: T[];
  renderItem: (item: T) => React.ReactNode;
  filter?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    filter?: string;
  };
  emptyMessage?: string;
  title?: string;
  className?: string;
}

function RealtimeData<T extends { id: string | number }>({
  tableName,
  initialData,
  renderItem,
  filter,
  emptyMessage = 'No data available',
  title,
  className = ''
}: RealtimeDataProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { subscribeToTable, isConnected } = useRealtime();

  // Subscribe to realtime updates
  useEffect(() => {
    if (!tableName) return;
    
    const handleRealtimeUpdate = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      setLastUpdated(new Date());
      
      switch (eventType) {
        case 'INSERT':
          setData(prev => [...prev, newRecord as T]);
          break;
        case 'UPDATE':
          setData(prev => 
            prev.map(item => 
              item.id === newRecord.id ? { ...item, ...newRecord } : item
            )
          );
          break;
        case 'DELETE':
          setData(prev => prev.filter(item => item.id !== oldRecord.id));
          break;
        default:
          console.warn(`Unknown event type: ${eventType}`);
      }
    };
    
    const subscriptionId = subscribeToTable(tableName, handleRealtimeUpdate, filter);
    
    return () => {
      // Unsubscribe is handled automatically by the useRealtime hook
    };
  }, [tableName, subscribeToTable, filter]);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return lastUpdated.toLocaleTimeString();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated: {formatLastUpdated()}</span>
            </div>
            <RealtimeStatus showLabel={false} />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id.toString()}>
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {data.length} item{data.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live updates enabled' : 'Live updates disabled'}
          </span>
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isConnected ? 'animate-spin' : ''}`} />
        </div>
      </div>
    </div>
  );
}

export default RealtimeData;