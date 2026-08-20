export type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

export type ToastPayload = {
  message: string;
  title?: string;
  severity?: ToastSeverity;
};

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export const subscribeToast = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const showToast = (
  message: string,
  severity: ToastSeverity = 'error',
  title?: string,
): void => {
  const text = message.trim();
  const heading = title?.trim();
  if (!text && !heading) return;

  listeners.forEach((listener) =>
    listener({ message: text || heading || '', title: heading, severity }),
  );
};

let lastToastKey = '';
let lastToastAt = 0;

export const showToastOnce = (
  key: string,
  message: string,
  severity: ToastSeverity = 'info',
  windowMs = 4000,
  title?: string,
): void => {
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < windowMs) return;
  lastToastKey = key;
  lastToastAt = now;
  showToast(message, severity, title);
};
