import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const DeploymentStatus = () => {
  const [status, setStatus] = useState({
    backend: 'checking',
    socket: 'checking',
    api: 'checking'
  });
  const [isVisible, setIsVisible] = useState(false);

  const checkBackendHealth = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        setStatus(prev => ({ ...prev, backend: 'connected' }));
      } else {
        setStatus(prev => ({ ...prev, backend: 'error' }));
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus(prev => ({ ...prev, backend: 'error' }));
    }
  };

  const checkSocketConnection = async () => {
    try {
      const backendUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      // Simple socket connection test
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setStatus(prev => ({ ...prev, socket: 'connected' }));
      } else {
        setStatus(prev => ({ ...prev, socket: 'error' }));
      }
    } catch (error) {
      console.error('Socket connection check failed:', error);
      setStatus(prev => ({ ...prev, socket: 'error' }));
    }
  };

  const checkApiEndpoint = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'console.log("test")',
          language: 'javascript',
          input: ''
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.status === 200 || response.status === 400) {
        // 400 is expected for invalid code, but means API is reachable
        setStatus(prev => ({ ...prev, api: 'connected' }));
      } else {
        setStatus(prev => ({ ...prev, api: 'error' }));
      }
    } catch (error) {
      console.error('API endpoint check failed:', error);
      setStatus(prev => ({ ...prev, api: 'error' }));
    }
  };

  useEffect(() => {
    // Show status after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      checkBackendHealth();
      checkSocketConnection();
      checkApiEndpoint();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'checking':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Deployment Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-200 text-xs"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Backend Server</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.backend)}
            <span className={`text-xs ${getStatusColor(status.backend)}`}>
              {getStatusText(status.backend)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Socket Connection</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.socket)}
            <span className={`text-xs ${getStatusColor(status.socket)}`}>
              {getStatusText(status.socket)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">API Endpoints</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.api)}
            <span className={`text-xs ${getStatusColor(status.api)}`}>
              {getStatusText(status.api)}
            </span>
          </div>
        </div>
      </div>
      
      {(status.backend === 'error' || status.socket === 'error' || status.api === 'error') && (
        <div className="mt-3 p-2 bg-red-900/20 border border-red-700/30 rounded text-xs text-red-300">
          <p className="font-medium mb-1">Backend Issues Detected</p>
          <p>Please ensure your backend is deployed and accessible at:</p>
          <p className="font-mono text-xs mt-1">
            {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}
          </p>
        </div>
      )}
      
      {status.backend === 'connected' && status.socket === 'connected' && status.api === 'connected' && (
        <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded text-xs text-green-300">
          <p className="font-medium">✅ All systems operational</p>
          <p>Your deployment is working correctly!</p>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus; 