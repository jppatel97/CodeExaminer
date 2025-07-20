import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useEditorSocket = () => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const connect = (roomId, username, userId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Use 127.0.0.1 for Windows compatibility
    const newSocket = io('http://localhost:5000', {
      path: '/editor-socket',
      transports: ['websocket', 'polling'],
      query: {
        roomId,
        username,
        userId
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully!');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join the room
    newSocket.emit('join-room', { roomId, username, userId });

    console.log(`Connecting to room: ${roomId} as ${username}`);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return { socket, connect, disconnect };
};
