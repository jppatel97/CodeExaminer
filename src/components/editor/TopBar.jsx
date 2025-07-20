import React from 'react';
import { 
  WifiIcon, 
  WifiIcon as WifiOffIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const TopBar = ({ 
  roomId, 
  isConnected, 
  username, 
  onExportZip, 
  theme,
  setTheme
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 px-4 py-2 flex items-center justify-between shadow-2xl border-b border-gray-700/50 text-gray-100">
      {/* Left side - Room info and connection status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <CodeBracketIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeExaminer
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <WifiIcon className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-400">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <WifiOffIcon className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">Disconnected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-gray-300">
            <UsersIcon className="w-3 h-3" />
            <span className="text-xs font-medium">Room:</span>
            <span className="text-xs font-mono bg-gray-700 px-1.5 py-0.5 rounded">{roomId}</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-300">
            <span className="text-xs font-medium">User:</span>
            <span className="text-xs font-semibold text-blue-400">{username}</span>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3">
        {/* Action Buttons */}
        <button
          onClick={onExportZip}
          className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
          Download ZIP
        </button>
      </div>
    </div>
  );
};

export default TopBar;
