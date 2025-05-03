// src/hooks/useSocket.ts
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_WS_URL, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket };
};