import React, { useState } from 'react';

export default function FolderCreateModal({ open, onClose, onCreate }) {
  const [folderName, setFolderName] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#23262b]/60 backdrop-blur rounded-2xl p-8 border border-[#A78BFA] shadow-2xl">
        <h2 className="text-lg font-bold mb-4 text-[#A78BFA]">Create New Folder</h2>
        <input
          className="w-full border border-[#A78BFA] bg-[#23262b] text-[#EAEAEA] px-2 py-1 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          placeholder="Folder name (e.g. src)"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded-xl bg-gray-700 text-gray-200 hover:bg-gray-600">Cancel</button>
          <button
            onClick={() => {
              if (folderName) onCreate(folderName);
            }}
            className="px-3 py-1 rounded-xl bg-[#A78BFA] text-[#1C1F24] hover:bg-[#7DE2D1] hover:text-[#1C1F24]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
} 