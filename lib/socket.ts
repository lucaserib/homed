import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';
const baseUrl = SOCKET_URL.replace('/api', '');

let socket: Socket | null = null;

export const connectSocket = (userId: string, userType: 'doctor' | 'patient') => {
  if (socket?.connected) return socket;

  socket = io(baseUrl, {
    transports: ['websocket'],
    query: {
      userId,
      userType,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
