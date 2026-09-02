'use client';

import { useEffect, useState } from 'react';
import { fetchBuyerProfile } from '@/app/auth/store/authThunk';
import {
  selectAuthToken,
  selectProfileLoading,
} from '@/app/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function AccountInfoOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="We are getting your account information"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(253, 250, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          textAlign: 'center',
          maxWidth: '360px',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          style={{ animation: 'spinSlow 0.85s linear infinite' }}
        >
          <circle cx="24" cy="24" r="20" stroke="#EFDBFF" strokeWidth="4" />
          <path
            d="M24 4a20 20 0 0 1 20 20"
            stroke="#A54AFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <p
          style={{
            margin: 0,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '28px',
            color: '#101828',
          }}
        >
          We are getting your account information
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#475467',
          }}
        >
          Please wait a moment while we load your latest profile.
        </p>
      </div>
    </div>
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const profileLoading = useAppSelector(selectProfileLoading);
  const [sessionFetchStarted, setSessionFetchStarted] = useState(false);
  const showOverlay = Boolean(token) && (profileLoading || !sessionFetchStarted);

  useEffect(() => {
    if (!token) {
      setSessionFetchStarted(false);
      return;
    }

    void dispatch(fetchBuyerProfile());
    setSessionFetchStarted(true);
  }, [dispatch, token]);

  useEffect(() => {
    if (!showOverlay) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showOverlay]);

  return (
    <>
      <div
        style={{ display: 'contents' }}
        {...(showOverlay ? { inert: true } : {})}
      >
        {children}
      </div>
      {showOverlay ? <AccountInfoOverlay /> : null}
    </>
  );
}
