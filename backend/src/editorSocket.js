const { Server } = require('socket.io');

// In-memory storage for active sessions (no database storage)
const activeSessions = new Map();

function initializeEditorSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://your-frontend-domain.vercel.app" // Add your production domain
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/editor-socket',
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Editor client connected:', socket.id);

    // Join a room based on room ID
    socket.on('join-room', ({ roomId, username, userId }) => {
      console.log(`User ${username} (${userId}) attempting to join room ${roomId}`);
      
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!activeSessions.has(roomId)) {
        activeSessions.set(roomId, {
          files: new Map(),
          folders: new Set(),
          users: new Map(),
          cursors: new Map()
        });
        console.log(`Created new room: ${roomId}`);
      }

      const session = activeSessions.get(roomId);
      
      // Add user to session
      session.users.set(socket.id, {
        id: userId,
        username: username,
        color: generateUserColor(),
        joinedAt: new Date()
      });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        username: username,
        color: session.users.get(socket.id).color
      });

      // Send current session state to the new user
      socket.emit('session-state', {
        files: Array.from(session.files.entries()),
        folders: Array.from(session.folders),
        users: Array.from(session.users.entries()),
        cursors: Array.from(session.cursors.entries())
      });

      console.log(`User ${username} joined room ${roomId}. Total users: ${session.users.size}`);
    });

    // Handle file operations
    socket.on('file-create', ({ roomId, filePath, content, fileType, language }) => {
      console.log(`File create request in room ${roomId}: ${filePath}`);
      const session = activeSessions.get(roomId);
      if (session) {
        session.files.set(filePath, { 
          content, 
          type: fileType, 
          language: language || 'plaintext',
          lastModified: new Date() 
        });
        socket.to(roomId).emit('file-created', { filePath, content, fileType, language: language || 'plaintext' });
        console.log(`File created in room ${roomId}: ${filePath}`);
      } else {
        console.log(`Room ${roomId} not found for file creation`);
      }
    });

    socket.on('file-update', ({ roomId, filePath, content }) => {
      const session = activeSessions.get(roomId);
      if (session && session.files.has(filePath)) {
        session.files.get(filePath).content = content;
        session.files.get(filePath).lastModified = new Date();
        socket.to(roomId).emit('file-updated', { filePath, content });
        console.log(`File updated in room ${roomId}: ${filePath}`);
      }
    });

    socket.on('file-delete', ({ roomId, filePath }) => {
      const session = activeSessions.get(roomId);
      if (session) {
        session.files.delete(filePath);
        socket.to(roomId).emit('file-deleted', { filePath });
        console.log(`File deleted in room ${roomId}: ${filePath}`);
      }
    });

    socket.on('file-rename', ({ roomId, oldPath, newPath }) => {
      const session = activeSessions.get(roomId);
      if (session && session.files.has(oldPath)) {
        const fileData = session.files.get(oldPath);
        session.files.delete(oldPath);
        session.files.set(newPath, fileData);
        socket.to(roomId).emit('file-renamed', { oldPath, newPath });
        console.log(`File renamed in room ${roomId}: ${oldPath} → ${newPath}`);
      }
    });

    // Handle folder operations
    socket.on('folder-create', ({ roomId, folderPath }) => {
      console.log(`Folder create request in room ${roomId}: ${folderPath}`);
      const session = activeSessions.get(roomId);
      if (session) {
        session.folders.add(folderPath);
        socket.to(roomId).emit('folder-created', { folderPath });
        console.log(`Folder created in room ${roomId}: ${folderPath}`);
      } else {
        console.log(`Room ${roomId} not found for folder creation`);
      }
    });

    socket.on('folder-delete', ({ roomId, folderPath }) => {
      const session = activeSessions.get(roomId);
      if (session) {
        session.folders.delete(folderPath);
        
        // Remove any subfolders that are inside this folder
        const subfoldersToRemove = Array.from(session.folders).filter(folder => 
          folder.startsWith(folderPath + '/')
        );
        subfoldersToRemove.forEach(subfolder => session.folders.delete(subfolder));
        
        // Remove any files that are inside this folder (including subfolders)
        const filesInFolder = Array.from(session.files.keys()).filter(filePath => 
          filePath.startsWith(folderPath + '/')
        );
        filesInFolder.forEach(filePath => session.files.delete(filePath));
        
        socket.to(roomId).emit('folder-deleted', { folderPath });
        console.log(`Folder deleted in room ${roomId}: ${folderPath}`);
      }
    });

    // Handle cursor position updates
    socket.on('cursor-update', ({ roomId, filePath, position, selection }) => {
      const session = activeSessions.get(roomId);
      if (session) {
        session.cursors.set(socket.id, {
          filePath,
          position,
          selection,
          timestamp: new Date()
        });
        socket.to(roomId).emit('cursor-updated', {
          userId: socket.id,
          username: session.users.get(socket.id)?.username,
          color: session.users.get(socket.id)?.color,
          filePath,
          position,
          selection
        });
      }
    });

    // Handle user typing indicator
    socket.on('typing-start', ({ roomId, filePath }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.id,
        username: activeSessions.get(roomId)?.users.get(socket.id)?.username,
        filePath,
        isTyping: true
      });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.id,
        username: activeSessions.get(roomId)?.users.get(socket.id)?.username,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Editor client disconnected:', socket.id);
      
      // Remove user from all sessions they were in
      for (const [roomId, session] of activeSessions.entries()) {
        if (session.users.has(socket.id)) {
          const user = session.users.get(socket.id);
          session.users.delete(socket.id);
          session.cursors.delete(socket.id);
          
          // Notify others in the room
          socket.to(roomId).emit('user-left', { userId: socket.id });
          
          console.log(`User ${user.username} left room ${roomId}`);
          
          // Clean up empty sessions
          if (session.users.size === 0) {
            activeSessions.delete(roomId);
            console.log(`Room ${roomId} cleaned up (no users left)`);
          }
        }
      }
    });

    // Debug endpoint to check active sessions
    socket.on('debug-sessions', () => {
      console.log('Active sessions:', Array.from(activeSessions.keys()));
      socket.emit('debug-sessions-response', {
        sessions: Array.from(activeSessions.keys()),
        totalSessions: activeSessions.size
      });
    });
  });

  return io;
}

// Generate a unique color for each user
function generateUserColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { initializeEditorSocket }; 