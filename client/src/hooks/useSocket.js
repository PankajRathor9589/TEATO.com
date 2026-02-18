import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || '';

export function useSocket(event, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = io(SOCKET_URL || window.location.origin, { path: '/socket.io', withCredentials: true });
    const handler = (...args) => callbackRef.current?.(...args);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
      socket.disconnect();
    };
  }, [event]);
}

export function useSocketOrderRoom(orderId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    const socket = io(SOCKET_URL || window.location.origin, { path: '/socket.io', withCredentials: true });
    socket.on('connect', () => {
      socket.emit('join:order', orderId);
    });
    socketRef.current = socket;
    return () => {
      socket.off('connect');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [orderId]);

  return socketRef.current;
}

/** Join a server room (e.g. 'kitchen', 'admin') for real-time updates */
export function useSocketJoinRoom(room) {
  useEffect(() => {
    if (!room) return;
    const socket = io(SOCKET_URL || window.location.origin, { path: '/socket.io', withCredentials: true });
    socket.on('connect', () => {
      socket.emit(`join:${room}`);
    });
    return () => {
      socket.disconnect();
    };
  }, [room]);
}
