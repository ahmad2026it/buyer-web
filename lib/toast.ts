export type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

export type ToastPayload = {
  message: string;
  title?: string;
  severity?: ToastSeverity;
  href?: string;
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
  href?: string,
): void => {
  const text = message.trim();
  const heading = title?.trim();
  const link = href?.trim();
  if (!text && !heading) return;

  listeners.forEach((listener) =>
    listener({
      message: text || heading || '',
      title: heading,
      severity,
      href: link || undefined,
    }),
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
  href?: string,
): void => {
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < windowMs) return;
  lastToastKey = key;
  lastToastAt = now;
  showToast(message, severity, title, href);
};
