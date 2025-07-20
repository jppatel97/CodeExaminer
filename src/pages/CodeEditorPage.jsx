import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import MonacoEditor from '@monaco-editor/react';
import {
  FolderIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowRightIcon,
  UserIcon,
  UserGroupIcon,
  CodeBracketIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  FolderIcon as FolderSolidIcon,
  DocumentIcon as DocumentSolidIcon
} from '@heroicons/react/24/solid';
import FileExplorer from '../components/editor/FileExplorer';
import TopBar from '../components/editor/TopBar';
import UserList from '../components/editor/UserList';
import { useEditorSocket } from '../hooks/useEditorSocket';
import { exportToZip } from '../utils/exportUtils';
import { LANGUAGE_OPTIONS } from '../constants/languages';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CodeEditorPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = useMemo(() => searchParams.get('room') || uuidv4(), [searchParams]);

  // State management
  const [showRoomSelection, setShowRoomSelection] = useState(!searchParams.get('room'));
  const [joinRoomId, setJoinRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [files, setFiles] = useState(new Map());
  const [folders, setFolders] = useState(new Set());
  const [activeFile, setActiveFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [users, setUsers] = useState(new Map());
  const [cursors, setCursors] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [userId] = useState(uuidv4());
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [theme, setTheme] = useState('dark');
  const [userInput, setUserInput] = useState('');

  // Refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Custom hooks
  const { socket, connect, disconnect } = useEditorSocket();

  // Initialize username on component mount
  useEffect(() => {
    // Only set username if it is passed from room selection
    if (location.state?.username && location.state.username !== username) {
      setUsername(location.state.username);
      localStorage.setItem('editor-username', location.state.username);
    }
    // Don't load any saved username - let user enter it manually
    // Only run this effect when location.state or username changes
  }, [location.state, username]);

  // Connect to socket when component mounts
  useEffect(() => {
    if (username && roomId && !showRoomSelection) {
      connect(roomId, username, userId);
    }
    return () => {
      disconnect();
    };
  }, [username, roomId, userId, showRoomSelection]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) {
      console.log('Socket not available, skipping event handlers');
      return;
    }

    console.log('Setting up socket event handlers...');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to editor socket');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from editor socket');
    });

    socket.on('session-state', ({ files: sessionFiles, folders: sessionFolders, users: sessionUsers, cursors: sessionCursors }) => {
      console.log('Received session state:', { files: sessionFiles.length, folders: sessionFolders?.length, users: sessionUsers.length });
      setFiles(new Map(sessionFiles));
      setFolders(new Set(sessionFolders || []));
      setUsers(new Map(sessionUsers));
      setCursors(new Map(sessionCursors));

      // Open first file if no active file
      setActiveFile(prevActive => {
        if (sessionFiles.length > 0 && !prevActive) {
          setOpenTabs([sessionFiles[0][0]]);
          return sessionFiles[0][0];
        }
        return prevActive;
      });
    });

    socket.on('file-created', ({ filePath, content, fileType, language }) => {
      console.log('File created event received:', filePath);
      setFiles(prev => new Map(prev).set(filePath, { content, type: fileType, language: language || 'plaintext' }));
      toast.success(`File created: ${filePath}`);
    });

    socket.on('file-updated', ({ filePath, content }) => {
      console.log('File updated event received:', filePath);
      setFiles(prev => {
        const newFiles = new Map(prev);
        if (newFiles.has(filePath)) {
          const oldFile = newFiles.get(filePath);
          newFiles.set(filePath, { ...oldFile, content });
        }
        return newFiles;
      });
    });

    socket.on('file-deleted', ({ filePath }) => {
      console.log('File deleted event received:', filePath);
      setFiles(prev => {
        const newFiles = new Map(prev);
        newFiles.delete(filePath);
        return newFiles;
      });

      // Remove from open tabs and active file if necessary
      setOpenTabs(prev => prev.filter(tab => tab !== filePath));
      if (activeFile === filePath) {
        const remainingTabs = openTabs.filter(tab => tab !== filePath);
        setActiveFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
      }

      toast.success(`File deleted: ${filePath}`);
    });

    socket.on('file-renamed', ({ oldPath, newPath }) => {
      console.log('File renamed event received:', oldPath, '→', newPath);
      setFiles(prev => {
        const newFiles = new Map(prev);
        if (newFiles.has(oldPath)) {
          const fileData = newFiles.get(oldPath);
          newFiles.delete(oldPath);
          newFiles.set(newPath, fileData);
        }
        return newFiles;
      });

      // Update open tabs
      setOpenTabs(prev => prev.map(tab => tab === oldPath ? newPath : tab));
      if (activeFile === oldPath) {
        setActiveFile(newPath);
      }

      toast.success(`File renamed: ${oldPath} → ${newPath}`);
    });

    socket.on('folder-created', ({ folderPath }) => {
      console.log('Folder created event received:', folderPath);
      setFolders(prev => new Set(prev).add(folderPath));
      toast.success(`Folder created: ${folderPath}`);
    });

    socket.on('folder-deleted', ({ folderPath }) => {
      console.log('Folder deleted event received:', folderPath);
      setFolders(prev => {
        const newFolders = new Set(prev);
        newFolders.delete(folderPath);
        
        // Remove any subfolders that are inside this folder
        const subfoldersToRemove = Array.from(newFolders).filter(folder => 
          folder.startsWith(folderPath + '/')
        );
        subfoldersToRemove.forEach(subfolder => newFolders.delete(subfolder));
        
        return newFolders;
      });

      // Remove any files that are inside this folder (including subfolders)
      const filesInFolder = Array.from(files.keys()).filter(filePath => 
        filePath.startsWith(folderPath + '/')
      );
      
      // Remove files from files state
      setFiles(prev => {
        const newFiles = new Map(prev);
        filesInFolder.forEach(filePath => newFiles.delete(filePath));
        return newFiles;
      });
      
      // Remove from open tabs and active file
      setOpenTabs(prev => prev.filter(tab => !filesInFolder.includes(tab)));
      if (filesInFolder.includes(activeFile)) {
        const remainingTabs = openTabs.filter(tab => !filesInFolder.includes(tab));
        setActiveFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
      }

      toast.success(`Folder deleted: ${folderPath}`);
    });

    socket.on('user-joined', ({ userId: newUserId, username: newUsername, color }) => {
      console.log('User joined event received:', newUsername);
      setUsers(prev => new Map(prev).set(newUserId, { username: newUsername, color }));
      toast.success(`${newUsername} joined the room`);
    });

    socket.on('user-left', ({ userId: leftUserId }) => {
      console.log('User left event received:', leftUserId);
      setUsers(prev => {
        const newUsers = new Map(prev);
        newUsers.delete(leftUserId);
        return newUsers;
      });
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(leftUserId);
        return newCursors;
      });

      const leftUser = users.get(leftUserId);
      if (leftUser) {
        toast.success(`${leftUser.username} left the room`);
      }
    });

    socket.on('cursor-updated', ({ userId: cursorUserId, username, color, filePath, position, selection }) => {
      if (cursorUserId !== socket.id) {
        setCursors(prev => new Map(prev).set(cursorUserId, {
          username,
          color,
          filePath,
          position,
          selection
        }));
      }
    });

    return () => {
      console.log('Cleaning up socket event handlers...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('session-state');
      socket.off('file-created');
      socket.off('file-updated');
      socket.off('file-deleted');
      socket.off('file-renamed');
      socket.off('folder-created');
      socket.off('folder-deleted');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-updated');
    };
  }, [socket]);

  // File operations
  const createFile = useCallback((path, content = '', type = 'text', language = 'plaintext') => {
    if (files.has(path)) {
      toast.error('File already exists');
      return;
    }
    const newFiles = new Map(files);
    newFiles.set(path, { content, type, language: language || 'plaintext' });
    setFiles(newFiles);

    setOpenTabs(prev => [...prev, path]);
    setActiveFile(path);

    console.log('Emitting file-create event:', { roomId, filePath: path, content, fileType: type, language });
    socket?.emit('file-create', { roomId, filePath: path, content, fileType: type, language: language || 'plaintext' });
  }, [files, roomId, socket]);

  const createFolder = useCallback((folderPath) => {
    if (folders.has(folderPath)) {
      toast.error('Folder already exists');
      return;
    }
    const newFolders = new Set(folders);
    newFolders.add(folderPath);
    setFolders(newFolders);

    console.log('Emitting folder-create event:', { roomId, folderPath });
    socket?.emit('folder-create', { roomId, folderPath });
  }, [folders, roomId, socket]);

  const deleteFolder = useCallback((folderPath) => {
    if (!folders.has(folderPath)) return;

    const newFolders = new Set(folders);
    newFolders.delete(folderPath);

    // Remove any subfolders that are inside this folder
    const subfoldersToRemove = Array.from(newFolders).filter(folder => 
      folder.startsWith(folderPath + '/')
    );
    subfoldersToRemove.forEach(subfolder => newFolders.delete(subfolder));

    // Remove any files that are inside this folder (including subfolders)
    const filesInFolder = Array.from(files.keys()).filter(filePath => 
      filePath.startsWith(folderPath + '/')
    );
    
    // Remove files from files state
    setFiles(prev => {
      const newFiles = new Map(prev);
      filesInFolder.forEach(filePath => newFiles.delete(filePath));
      return newFiles;
    });

    // Remove from open tabs and active file
    setOpenTabs(prev => prev.filter(tab => !filesInFolder.includes(tab)));
    if (filesInFolder.includes(activeFile)) {
      const remainingTabs = openTabs.filter(tab => !filesInFolder.includes(tab));
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
    }

    setFolders(newFolders);

    console.log('Emitting folder-delete event:', { roomId, folderPath });
    socket?.emit('folder-delete', { roomId, folderPath });
  }, [folders, files, activeFile, openTabs, roomId, socket]);

  const updateFile = useCallback((path, content) => {
    const newFiles = new Map(files);
    if (newFiles.has(path)) {
      const oldFile = newFiles.get(path);
      newFiles.set(path, { ...oldFile, content });
      setFiles(newFiles);

      // Emit to socket
      console.log('Emitting file-update event:', { roomId, filePath: path });
      socket?.emit('file-update', { roomId, filePath: path, content });
    }
  }, [files, roomId, socket]);

  const deleteFile = useCallback((path) => {
    if (!files.has(path)) return;

    const newFiles = new Map(files);
    newFiles.delete(path);
    setFiles(newFiles);

    // Remove from open tabs
    setOpenTabs(prev => prev.filter(tab => tab !== path));
    if (activeFile === path) {
      const remainingTabs = openTabs.filter(tab => tab !== path);
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
    }

    // Emit to socket
    console.log('Emitting file-delete event:', { roomId, filePath: path });
    socket?.emit('file-delete', { roomId, filePath: path });
  }, [files, activeFile, openTabs, roomId, socket]);

  const renameFile = useCallback((oldPath, newPath) => {
    if (!files.has(oldPath) || files.has(newPath)) {
      toast.error('Cannot rename file');
      return;
    }

    const newFiles = new Map(files);
    const fileData = newFiles.get(oldPath);
    newFiles.delete(oldPath);
    newFiles.set(newPath, fileData);
    setFiles(newFiles);

    // Update open tabs
    setOpenTabs(prev => prev.map(tab => tab === oldPath ? newPath : tab));
    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }

    // Emit to socket
    console.log('Emitting file-rename event:', { roomId, oldPath, newPath });
    socket?.emit('file-rename', { roomId, oldPath, newPath });
  }, [files, activeFile, openTabs, roomId, socket]);

  // Editor handlers
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value, event) => {
    if (activeFile) {
      updateFile(activeFile, value);

      // Emit typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket?.emit('typing-start', { roomId, filePath: activeFile });

      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('typing-stop', { roomId });
      }, 1000);
    }
  };

  const handleCursorPositionChanged = (event) => {
    if (activeFile && socket) {
      const position = event.position;
      const selection = event.selection;

      socket.emit('cursor-update', {
        roomId,
        filePath: activeFile,
        position,
        selection
      });
    }
  };

  // Tab management
  const closeTab = (filePath) => {
    setOpenTabs(prev => prev.filter(tab => tab !== filePath));
    if (activeFile === filePath) {
      const remainingTabs = openTabs.filter(tab => tab !== filePath);
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[0] : null);
    }
  };

  // Export and GitHub functions
  const handleExportZip = async () => {
    if (!files || files.size === 0) {
      toast.error('No files to export!');
      return;
    }
    try {
      await exportToZip(files);
      toast.success('Project exported successfully!');
    } catch (error) {
      toast.error('Failed to export project');
      console.error('Export error:', error);
    }
  };

  // Get file extension for Monaco editor
  const getFileExtension = (filePath) => {
    return filePath.split('.').pop().toLowerCase();
  };

  // Get Monaco language from file extension
  const getMonacoLanguage = (filePath) => {
    const ext = getFileExtension(filePath);
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return languageMap[ext] || 'plaintext';
  };

  // Run code in the editor with backend API support
  const handleRun = async (input = '') => {
    if (!activeFile) return;
    const file = files.get(activeFile);
    const code = file?.content || '';
    const language = file?.language || getMonacoLanguage(activeFile);
    
    setTerminalLines(lines => [...lines, `$ run (${language}): ${activeFile}`]);
    
    // Check if language is supported by backend
    const supportedLanguages = ['python', 'java', 'cpp', 'c'];
    
    if (language === 'javascript') {
      // Handle JavaScript locally
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(String).join(' '));
        originalLog.apply(console, args);
      };
      let result;
      try {
        result = eval(code);
      } catch (err) {
        logs.push(String(err));
      }
      console.log = originalLog;
      if (logs.length > 0) {
        setTerminalLines(lines => [...lines, ...logs]);
      } else {
        setTerminalLines(lines => [...lines, String(result)]);
      }
    } else if (supportedLanguages.includes(language)) {
      // Use backend API for supported languages
      try {
        setTerminalLines(lines => [...lines, 'Compiling and running...']);
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            language: language,
            input: input
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.output !== undefined) {
          setTerminalLines(lines => [...lines, data.output || 'No output']);
        } else {
          setTerminalLines(lines => [...lines, `Error: ${data.error || 'Execution failed'}`]);
        }
      } catch (error) {
        console.error('Execution error:', error);
        setTerminalLines(lines => [
          ...lines, 
          `Error: Backend service unavailable.`,
          `Please ensure the backend is running at: ${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}`,
          `For local development, start the backend server.`
        ]);
      }
    } else {
      setTerminalLines(lines => [...lines, `Language ${language} is not supported for execution yet.`]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Bar */}
      <TopBar
        roomId={roomId}
        isConnected={isConnected}
        username={username}
        onExportZip={handleExportZip}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-full md:w-56 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700/50 flex flex-row md:flex-col flex-shrink-0 shadow-xl">
          <FileExplorer
            files={files}
            folders={folders}
            activeFile={activeFile}
            onCreateFile={createFile}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            onSelectFile={(filePath) => {
              setActiveFile(filePath);
              if (!openTabs.includes(filePath)) {
                setOpenTabs(prev => [...prev, filePath]);
              }
            }}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            theme={theme}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Editor Controls */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeFile && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 border-b border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300 font-semibold">Language:</span>
                    <select
                      className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
                      value={files.get(activeFile)?.language || getMonacoLanguage(activeFile) || 'plaintext'}
                      onChange={e => {
                        const lang = e.target.value;
                        setFiles(prev => {
                          const newFiles = new Map(prev);
                          if (newFiles.has(activeFile)) {
                            newFiles.set(activeFile, {
                              ...newFiles.get(activeFile),
                              language: lang
                            });
                          }
                          return newFiles;
                        });
                      }}
                    >
                      {LANGUAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-1 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    onClick={() => handleRun(userInput)}
                  >
                    <span className="text-base">▶</span>
                    <span>Run</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-300 font-semibold whitespace-nowrap">Input:</label>
                  <textarea
                    placeholder="Enter program input here..."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    rows={1}
                    className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm shadow-lg"
                    style={{ 
                      minHeight: '28px',
                      maxHeight: '60px',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
              {activeFile ? (
                (() => {
                  const monacoLanguage = files.get(activeFile)?.language || getMonacoLanguage(activeFile) || 'plaintext';
                  console.log('Monaco language:', monacoLanguage);
                  return (
                    <MonacoEditor
                      height="100%"
                      language={monacoLanguage}
                      value={files.get(activeFile)?.content || ''}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderWhitespace: 'selection',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible',
                          verticalScrollbarSize: 12,
                          horizontalScrollbarSize: 12
                        }
                      }}
                      onMount={handleEditorDidMount}
                      onChange={handleEditorChange}
                      onCursorPositionChanged={handleCursorPositionChanged}
                    />
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <DocumentIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No File Selected</h3>
                    <p className="text-gray-500">Create a new file or select one from the explorer</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="h-32 bg-gradient-to-br from-gray-900 to-gray-800 border-t border-gray-700/50 flex flex-col shadow-xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
                </div>
                <span className="text-gray-300 text-xs font-semibold ml-2">Terminal</span>
              </div>
              <button
                onClick={() => setTerminalLines([])}
                className="text-gray-400 hover:text-gray-200 text-xs font-medium hover:bg-gray-700 px-2 py-1 rounded transition-all duration-200"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 bg-gradient-to-br from-gray-900 to-gray-800">
              {terminalLines.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  <div className="text-2xl mb-2">💻</div>
                  <p className="text-xs">Execute your code to see output here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {terminalLines.map((line, i) => (
                    <div 
                      key={i} 
                      className="leading-relaxed font-mono text-xs text-green-300"
                      style={{
                        textShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
                        wordBreak: 'break-word'
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User List Sidebar */}
        <div className="w-full md:w-40 bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700/50 flex-shrink-0 shadow-xl">
          <UserList
            users={users}
            cursors={cursors}
            currentUser={username}
            isConnected={isConnected}
          />
        </div>
      </div>
      
    </div>
  );
};

export default CodeEditorPage; 