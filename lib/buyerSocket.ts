'use client';

import { io, type Socket } from 'socket.io-client';

export const BUYER_SOCKET_URL =
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API ||
  'https://stage.whocan-app.com';

let socket: Socket | null = null;
let activeToken: string | null = null;
let debugAttached = false;

function attachSocketDebug(nextSocket: Socket): void {
  if (debugAttached) return;
  debugAttached = true;

  nextSocket.on('connect', () => {
    console.warn('[WHCAN_NOTIFY] socket connected', {
      id: nextSocket.id,
      url: BUYER_SOCKET_URL,
    });
  });

  nextSocket.on('disconnect', (reason) => {
    console.warn('[WHCAN_NOTIFY] socket disconnected', reason);
  });

  nextSocket.on('connect_error', (error) => {
    console.error('[WHCAN_NOTIFY] socket connect_error', error.message, error);
  });

  nextSocket.on('ready', (payload) => {
    console.warn('[WHCAN_NOTIFY] socket ready', payload);
  });

  nextSocket.onAny((eventName, ...args) => {
    console.warn('[WHCAN_NOTIFY] socket event', eventName, ...args);
  });
}

export function getBuyerSocket(token: string | null | undefined): Socket | null {
  if (typeof window === 'undefined') return null;
  if (!token) return null;

  if (socket && activeToken === token) {
    if (!socket.connected) {
      console.warn('[WHCAN_NOTIFY] socket reconnecting', BUYER_SOCKET_URL);
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
    debugAttached = false;
  }

  activeToken = token;
  console.warn('[WHCAN_NOTIFY] socket connecting', BUYER_SOCKET_URL);

  socket = io(BUYER_SOCKET_URL, {
    auth: {
      token,
      authorization: `Bearer ${token}`,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    query: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    timeout: 20000,
    autoConnect: true,
  });

  attachSocketDebug(socket);
  return socket;
}

export function disconnectBuyerSocket(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  activeToken = null;
  debugAttached = false;
}
