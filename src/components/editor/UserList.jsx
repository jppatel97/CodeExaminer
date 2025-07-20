import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const UserList = ({ users, cursors, currentUser, isConnected }) => {
  return (
    <div className="h-full w-40 min-w-[10rem] flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-white font-medium">Users ({users.size})</h3>
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-gray-300 text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {Array.from(users.entries()).map(([userId, userData]) => (
          <div key={userId} className="flex items-center p-2 hover:bg-gray-700 rounded mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: userData.color }}
            ></div>
            <div className="flex-1">
              <div className="text-white text-sm">
                {userData.username}
                {userData.username === currentUser && (
                  <span className="text-gray-400 text-xs ml-1">(you)</span>
                )}
              </div>
              {cursors.has(userId) && (
                <div className="text-gray-400 text-xs">
                  {cursors.get(userId).filePath}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {users.size === 0 && (
          <div className="text-gray-400 text-sm text-center py-4">
            No other users in this room
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 