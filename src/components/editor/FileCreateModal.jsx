import React, { useState } from 'react';
import { LANGUAGE_OPTIONS } from '../../constants/languages';

export default function FileCreateModal({ open, onClose, onCreate }) {
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);

  if (!open) return null;

  const selectedLang = LANGUAGE_OPTIONS.find(opt => opt.value === language);
  const extension = selectedLang && selectedLang.ext.length > 0 ? selectedLang.ext[0] : '';

  function getFileNameWithExtension(name) {
    if (!extension) return name;
    if (name.endsWith('.' + extension)) return name;
    // Remove any other extension if present
    const nameWithoutExt = name.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}.${extension}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#23262b]/60 backdrop-blur rounded-2xl p-8 border border-[#A78BFA] shadow-2xl">
        <h2 className="text-lg font-bold mb-4 text-[#A78BFA]">Create New File</h2>
        <input
          className="w-full border border-[#A78BFA] bg-[#23262b] text-[#EAEAEA] px-2 py-1 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          placeholder={`File name (e.g. main.${extension || 'js'})`}
          value={fileName}
          onChange={e => setFileName(e.target.value)}
        />
        <select
          className="w-full border border-[#A78BFA] bg-[#23262b] text-[#EAEAEA] px-2 py-1 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {LANGUAGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded-xl bg-gray-700 text-gray-200 hover:bg-gray-600">Cancel</button>
          <button
            onClick={() => {
              if (fileName) onCreate(getFileNameWithExtension(fileName), language);
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