'use client';

import { io, type Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API ||
  'https://stage.whocan-app.com';

let socket: Socket | null = null;
let activeToken: string | null = null;

export function getBuyerSocket(token: string | null | undefined): Socket | null {
  if (typeof window === 'undefined') return null;
  if (!token) return null;

  if (socket && activeToken === token) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectBuyerSocket(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  activeToken = null;
}
