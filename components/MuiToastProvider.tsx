'use client';

import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import {
  subscribeToast,
  type ToastPayload,
  type ToastSeverity,
} from '@/lib/toast';

type QueuedToast = ToastPayload & { id: number };

export default function MuiToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const current = queue[0];

  useEffect(() => {
    return subscribeToast((payload) => {
      setQueue((prev) => [
        ...prev,
        { ...payload, id: Date.now() + Math.random() },
      ]);
    });
  }, []);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setQueue((prev) => prev.slice(1));
  };

  const severity: ToastSeverity = current?.severity ?? 'error';

  return (
    <>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={4500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', boxShadow: '0 8px 24px rgba(16,24,40,0.16)' }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
