
import React from 'react';

export default function DeleteConfirmModal({ open, onClose, onConfirm, type, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#23262b]/60 backdrop-blur rounded-2xl p-8 border border-[#A78BFA] shadow-2xl w-96">
        <h2 className="text-lg font-bold mb-4 text-red-400 flex items-center">
          <span className="mr-2 text-2xl">{type === 'folder' ? '🗂️' : '🗑️'}</span>
          {type === 'folder' ? 'Delete Folder' : 'Delete File'}
        </h2>
        <p className="text-[#EAEAEA] mb-6">
          Are you sure you want to delete <span className="font-mono text-red-300">{name}</span>
          {type === 'folder' && ' and all its contents'}?
        </p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-1 rounded-xl bg-gray-700 text-gray-200 hover:bg-gray-600">No</button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 rounded-xl bg-red-600 text-[#EAEAEA] hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
} 