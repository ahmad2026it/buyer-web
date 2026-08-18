export type ToastSeverity = 'error' | 'warning' | 'info' | 'success';

export type ToastPayload = {
  message: string;
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
): void => {
  const text = message.trim();
  if (!text) return;

  listeners.forEach((listener) => listener({ message: text, severity }));
};
