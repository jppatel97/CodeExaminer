import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  DocumentIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';
import { 
  FolderIcon as FolderSolidIcon,
  DocumentIcon as DocumentSolidIcon
} from '@heroicons/react/24/solid';
import { LANGUAGE_OPTIONS } from '../../constants/languages';
import FileCreateModal from './FileCreateModal';
import FolderCreateModal from './FolderCreateModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import toast from 'react-hot-toast';

const FileExplorer = ({ 
  files, 
  folders, 
  activeFile, 
  onCreateFile, 
  onDeleteFile, 
  onRenameFile, 
  onSelectFile, 
  onChangeLanguage, 
  onCreateFolder, 
  onDeleteFolder, 
  theme 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [recentlyCreated, setRecentlyCreated] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [pendingParentPath, setPendingParentPath] = useState('');
  const [pendingFolderParent, setPendingFolderParent] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', name: '' });

  // Highlight new file for 2 seconds
  useEffect(() => {
    if (recentlyCreated) {
      const timer = setTimeout(() => setRecentlyCreated(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyCreated]);

  // Build file/folder tree from both folders and files
  const buildFileTree = () => {
    const tree = {};
    // Defensive: ensure folders and files are defined and iterable
    if (!folders || typeof folders.forEach !== 'function') return tree;
    if (!files || typeof files.forEach !== 'function') return tree;
    // Add folders first
    folders.forEach(folderPath => {
      const parts = folderPath.split('/');
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { type: 'folder', children: {} };
        }
        current = current[part].children;
      }
    });
    // Add files
    files.forEach((fileData, filePath) => {
      const parts = filePath.split('/');
      let current = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { type: 'folder', children: {} };
        }
        current = current[part].children;
      }
      const fileName = parts[parts.length - 1];
      current[fileName] = { type: 'file', ...fileData };
    });
    return tree;
  };

  const fileTree = buildFileTree();

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const handleCreateFile = (parentPath = '') => {
    setPendingParentPath(parentPath);
    setShowFileModal(true);
  };

  const handleFileModalCreate = (fileName, language) => {
    const filePath = pendingParentPath ? `${pendingParentPath}/${fileName}` : fileName;
    onCreateFile(filePath, '', 'file', language);
    setRecentlyCreated(filePath);
    setShowFileModal(false);
    toast.custom(
      <div className="flex items-center bg-green-600 text-white px-4 py-2 rounded shadow-lg">
        <span className="mr-2">📄</span>
        <span>File <b>{filePath}</b> created!</span>
      </div>
    );
  };

  const handleCreateFolder = (parentPath = '') => {
    setPendingFolderParent(parentPath);
    setShowFolderModal(true);
  };

  const handleFolderModalCreate = (folderName) => {
    const folderPath = pendingFolderParent ? `${pendingFolderParent}/${folderName}` : folderName;
    onCreateFolder(folderPath);
    setExpandedFolders(prev => new Set(prev).add(folderPath));
    setRecentlyCreated(folderPath);
    setShowFolderModal(false);
    toast.custom(
      <div className="flex items-center bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 rounded shadow-lg border-l-4 border-blue-300">
        <span className="mr-2 text-2xl">📁</span>
        <span>
          <b>Folder created:</b> <span className="font-mono">{folderPath}</span>
        </span>
      </div>
    );
  };

  const handleDelete = (filePath) => {
    setDeleteModal({ open: true, type: 'file', name: filePath });
  };

  const handleDeleteFolder = (folderPath) => {
    setDeleteModal({ open: true, type: 'folder', name: folderPath });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'file') {
      onDeleteFile(deleteModal.name);
      toast.custom(
        <div className="flex items-center bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-2 rounded shadow-lg border-l-4 border-gray-400">
          <span className="mr-2 text-2xl">🗑️</span>
          <span>
            <b>File deleted:</b> <span className="font-mono">{deleteModal.name}</span>
          </span>
        </div>
      );
    } else if (deleteModal.type === 'folder') {
      onDeleteFolder(deleteModal.name);
    }
    setDeleteModal({ open: false, type: '', name: '' });
  };

  const handleRename = (oldPath, newName) => {
    const parts = oldPath.split('/');
    const newPath = [...parts.slice(0, -1), newName].join('/');
    onRenameFile(oldPath, newPath);
    setEditingFile(null);
  };

  const renderTreeItem = (name, item, path = '') => {
    const fullPath = path ? `${path}/${name}` : name;
    const isExpanded = expandedFolders.has(fullPath);
    const isActive = activeFile === fullPath;
    const isEditing = editingFile === fullPath;
    const isNew = recentlyCreated === fullPath;

    if (item.type === 'folder') {
      return (
        <div key={fullPath} className={`select-none ${isNew ? 'bg-green-700/40' : ''}`}>
          <div 
            className={`group flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
            }`}
            onClick={() => toggleFolder(fullPath)}
          >
            {isExpanded ? (
              <FolderSolidIcon className="w-4 h-4 mr-2 text-yellow-400" />
            ) : (
              <FolderIcon className="w-4 h-4 mr-2 text-yellow-400" />
            )}
            <span className="text-sm flex-1">{name}</span>
            <div className="flex space-x-1">
              <button
                className="p-1 hover:bg-gray-600 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFile(fullPath);
                }}
              >
                <PlusIcon className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-gray-600 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFolder(fullPath);
                }}
              >
                <FolderIcon className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-red-600 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(fullPath);
                }}
              >
                <TrashIcon className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
          {isExpanded && (
            <div className="ml-4">
              {Object.entries(item.children).map(([childName, childItem]) =>
                renderTreeItem(childName, childItem, fullPath)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={fullPath} className={`group select-none ${isNew ? 'bg-green-700/40' : ''}`}>
          {isEditing ? (
            <div className="flex items-center px-2 py-1">
              <DocumentIcon className="w-4 h-4 mr-2 text-blue-400" />
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(fullPath, newFileName);
                  } else if (e.key === 'Escape') {
                    setEditingFile(null);
                  }
                }}
                onBlur={() => setEditingFile(null)}
                className="flex-1 bg-gray-700 text-white text-sm px-1 py-0.5 rounded"
                autoFocus
              />
            </div>
          ) : (
            <div 
              className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer ${
                isActive ? 'bg-[#007ACC]/20 text-[#EAEAEA]' : 'text-gray-300'
              }`}
              onClick={() => onSelectFile(fullPath)}
            >
              <DocumentIcon className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm flex-1">{name}</span>
              <div className="flex space-x-1">
                <button
                  className="p-1 hover:bg-gray-600 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFile(fullPath);
                    setNewFileName(name);
                  }}
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button
                  className="p-1 hover:bg-gray-600 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(fullPath);
                  }}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className={`sidebar p-4 h-full w-48 min-w-[12rem] shadow-xl border flex flex-col ${theme === 'dark' ? 'bg-[#23272E] border-[#23272E] text-[#EAEAEA]' : 'bg-[#E3EAF2] border-[#E3EAF2] text-[#2D2D2D]'}`}>
      <FileCreateModal open={showFileModal} onClose={() => setShowFileModal(false)} onCreate={handleFileModalCreate} />
      <FolderCreateModal open={showFolderModal} onClose={() => setShowFolderModal(false)} onCreate={handleFolderModalCreate} />
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: '', name: '' })}
        onConfirm={handleConfirmDelete}
        type={deleteModal.type}
        name={deleteModal.name}
      />
      <div className={`p-3 border-b ${theme === 'dark' ? 'border-[#23272E]' : 'border-[#E3EAF2]'}`}>
        <h3 className="font-medium mb-2" style={{ color: theme === 'dark' ? '#EAEAEA' : '#2D2D2D' }}>Files and Folders</h3>
        <div className="flex space-x-1 mt-2">
          <button
            onClick={() => handleCreateFile()}
            className={`flex items-center px-2 py-1 text-xs font-medium rounded-lg transition
              ${theme === 'dark'
                ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'}
            `}
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            New File
          </button>
          <button
            onClick={() => handleCreateFolder()}
            className={`flex items-center px-2 py-1 text-xs font-medium rounded-lg transition
              ${theme === 'dark'
                ? 'bg-[#6ee7b7] text-[#134e4a] hover:bg-[#34d399]'
                : 'bg-[#6ee7b7] text-[#134e4a] hover:bg-[#34d399]'}
            `}
          >
            <FolderIcon className="w-3 h-3 mr-1" />
            New Folder
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(fileTree).map(([name, item]) => renderTreeItem(name, item))}
      </div>
    </div>
  );
};

export default FileExplorer; 