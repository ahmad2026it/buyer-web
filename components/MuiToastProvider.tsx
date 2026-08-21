'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, IconButton, Snackbar } from '@mui/material';
import {
  subscribeToast,
  type ToastPayload,
  type ToastSeverity,
} from '@/lib/toast';

type QueuedToast = ToastPayload & { id: number };

const FONT = 'Poppins, sans-serif';
const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';

const TONE: Record<ToastSeverity, { bg: string; fg: string }> = {
  info: { bg: '#F8F0FF', fg: BRAND },
  success: { bg: '#ECFDF3', fg: '#079455' },
  warning: { bg: '#FFFAEB', fg: '#DC6803' },
  error: { bg: '#FEF3F2', fg: '#D92D20' },
};

function ChatIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 11v5M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10.3 4.9 2.4 18.2A2 2 0 0 0 4.1 21h15.8a2 2 0 0 0 1.7-2.8L13.7 4.9a2 2 0 0 0-3.4 0Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToastGlyph({ severity, href }: { severity: ToastSeverity; href?: string }) {
  const color = TONE[severity].fg;
  if (href?.startsWith('/chat')) return <ChatIcon color="#fff" />;
  if (severity === 'success') return <SuccessIcon color={color} />;
  if (severity === 'warning') return <WarningIcon color={color} />;
  if (severity === 'error') return <ErrorIcon color={color} />;
  return <InfoIcon color={color} />;
}

export default function MuiToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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

  const dismiss = () => setQueue((prev) => prev.slice(1));

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    dismiss();
  };

  const href = current?.href;
  const severity: ToastSeverity = current?.severity ?? 'error';
  const tone = TONE[severity];
  const isChat = Boolean(href?.startsWith('/chat'));
  const clickable = Boolean(href);

  const openTarget = () => {
    if (!href) return;
    dismiss();
    router.push(href);
  };

  return (
    <>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={7000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          zIndex: 14000,
          top: { xs: '16px', sm: '88px' },
          right: { xs: '16px', sm: '24px' },
        }}
      >
        <Box
          role={clickable ? 'link' : 'alert'}
          tabIndex={clickable ? 0 : undefined}
          aria-label={clickable ? `${current?.title ? `${current.title}: ` : ''}${current?.message ?? ''}` : undefined}
          onClick={clickable ? openTarget : undefined}
          onKeyDown={clickable ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTarget();
            }
          } : undefined}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            minWidth: 280,
            maxWidth: 380,
            width: '100%',
            padding: '14px 14px 14px 16px',
            background: '#FFFFFF',
            border: `1.5px solid ${isChat ? '#DFBAFF' : '#EAECF0'}`,
            borderRadius: '24px',
            boxShadow: '0 16px 40px rgba(16,24,40,0.14)',
            fontFamily: FONT,
            cursor: clickable ? 'pointer' : 'default',
            outline: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': clickable ? {
              transform: 'translateY(-1px)',
              boxShadow: '0 20px 44px rgba(165,74,255,0.18)',
            } : undefined,
            '&:focus-visible': {
              boxShadow: '0 0 0 4px rgba(165,74,255,0.24)',
            },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '9999px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isChat ? GRAD : tone.bg,
            }}
          >
            <ToastGlyph severity={severity} href={href} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
            {current?.title ? (
              <Box
                sx={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.35,
                  color: '#101828',
                  marginBottom: current?.message ? '2px' : 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {current.title}
              </Box>
            ) : null}
            <Box
              sx={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 13,
                lineHeight: 1.5,
                color: '#475467',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {current?.message}
            </Box>
          </Box>
          <IconButton
            aria-label="Dismiss notification"
            onClick={(event) => {
              event.stopPropagation();
              dismiss();
            }}
            sx={{
              width: 32,
              height: 32,
              margin: '-4px -4px 0 0',
              color: '#98A2B3',
              '&:hover': { background: '#F2F4F7', color: '#667085' },
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </IconButton>
        </Box>
      </Snackbar>
    </>
  );
}
