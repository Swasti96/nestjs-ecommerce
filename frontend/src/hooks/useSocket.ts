import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export function useSocket(
  onInventoryUpdated: () => void,
  onProductActivated: () => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const socket = io(`${SOCKET_URL}/events`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected — polling fallback active');
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('inventory.updated', (data) => {
      console.log('inventory.updated received:', data);
      onInventoryUpdated();
    });

    socket.on('product.activated', (data) => {
      console.log('product.activated received:', data);
      onProductActivated();
    });

    socketRef.current = socket;
  }, [onInventoryUpdated, onProductActivated]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);

  return { socketRef, isConnected };
}