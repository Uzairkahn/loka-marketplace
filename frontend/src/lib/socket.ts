import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Base URL for the socket connection — same host as the API but without
 * the /api suffix, since Socket.io attaches directly to the HTTP server root.
 */
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
