import React, { useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import { Wifi, WifiOff, Loader, AlertTriangle } from 'lucide-react';

interface RealtimeStatusProps {
  showLabel?: boolean;
  className?: string;
}

const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  showLabel = true,
  className = ''
}) => {
  const { connectionState, isConnected } = useRealtime({
    autoInitialize: true
  });
  
  const [reconnecting, setReconnecting] = useState(false);
  
  useEffect(() => {
    if (connectionState === 'CONNECTING') {
      setReconnecting(true);
    } else if (reconnecting && connectionState === 'CONNECTED') {
      // Show reconnected state briefly before resetting
      const timeout = setTimeout(() => {
        setReconnecting(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [connectionState, reconnecting]);

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'DISCONNECTED':
        return <WifiOff className="h-5 w-5 text-gray-500" />;
      case 'CONNECTING':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (reconnecting && connectionState === 'CONNECTED') {
      return 'Reconnected';
    }
    
    switch (connectionState) {
      case 'CONNECTED':
        return 'Connected';
      case 'DISCONNECTED':
        return 'Disconnected';
      case 'CONNECTING':
        return 'Connecting...';
      case 'ERROR':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (reconnecting && connectionState === 'CONNECTED') {
      return 'text-blue-600';
    }
    
    switch (connectionState) {
      case 'CONNECTED':
        return 'text-green-600';
      case 'DISCONNECTED':
        return 'text-gray-600';
      case 'CONNECTING':
        return 'text-blue-600';
      case 'ERROR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        {getStatusIcon()}
        {connectionState === 'CONNECTED' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        )}
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default RealtimeStatus;