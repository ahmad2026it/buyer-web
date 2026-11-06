'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { APP_STORE_LINKS } from '@/lib/appStores';

interface InviteClientProps {
  referralCode: string;
}

type DetectedPlatform = 'android' | 'ios' | 'other';

function detectPlatform(): DetectedPlatform {
  if (typeof window === 'undefined') {
    return 'other';
  }
  const ua = window.navigator.userAgent || '';
  if (/android/i.test(ua)) {
    return 'android';
  }
  if (
    /iPad|iPhone|iPod/i.test(ua) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1)
  ) {
    return 'ios';
  }
  return 'other';
}

export default function InviteClient({ referralCode }: InviteClientProps) {
  const cleanCode = useMemo(
    () => referralCode.trim().toUpperCase(),
    [referralCode],
  );
  const [platform, setPlatform] = useState<DetectedPlatform>('other');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Checking if WhoCan is installed on your device...',
  );

  const appDeepLink = useMemo(
    () =>
      cleanCode
        ? `whocan://invite?ref=${encodeURIComponent(cleanCode)}`
        : 'whocan://invite',
    [cleanCode],
  );

  const playStoreUrl = useMemo(() => {
    if (!cleanCode) {
      return APP_STORE_LINKS.buyer.play;
    }
    const referrerParam = encodeURIComponent(`ref=${cleanCode}`);
    return `${APP_STORE_LINKS.buyer.play}&referrer=${referrerParam}`;
  }, [cleanCode]);

  const appStoreUrl = APP_STORE_LINKS.buyer.apple;

  // Android intent:// URL automatically opens the app if installed OR falls back to Google Play Store
  const androidIntentUrl = useMemo(() => {
    const query = cleanCode ? `?ref=${encodeURIComponent(cleanCode)}` : '';
    const fallback = encodeURIComponent(playStoreUrl);
    return `intent://invite${query}#Intent;scheme=whocan;package=com.whocanapp.buyer;S.browser_fallback_url=${fallback};end`;
  }, [cleanCode, playStoreUrl]);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);

    if (cleanCode && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('whocan_pending_referral_code', cleanCode);
      } catch {
        // Ignore storage errors in private browsing
      }
    }

    if (detected === 'other') {
      setStatusMessage(
        'Scan or open this link on your iPhone or Android phone to get the WhoCan app.',
      );
      return;
    }

    let didHidePage = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        didHidePage = true;
      }
    };
    const handlePageHide = () => {
      didHidePage = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // 1. Attempt to open the installed app via custom scheme deep link
    setStatusMessage('Opening WhoCan app...');
    window.location.href = appDeepLink;

    // 2. If the app is not installed (page is still visible after 1600ms), redirect to the right store
    const fallbackTimer = window.setTimeout(() => {
      if (didHidePage || document.hidden) {
        return;
      }
      if (detected === 'android') {
        setStatusMessage('Redirecting you to Google Play Store...');
        window.location.href = playStoreUrl;
      } else if (detected === 'ios') {
        setStatusMessage('Redirecting you to Apple App Store...');
        window.location.href = appStoreUrl;
      }
    }, 1600);

    return () => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [appDeepLink, appStoreUrl, cleanCode, playStoreUrl]);

  const handleCopyCode = async () => {
    if (!cleanCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  const handleOpenApp = () => {
    if (platform === 'android') {
      window.location.href = androidIntentUrl;
      return;
    }
    window.location.href = appDeepLink;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F9F5FF] via-white to-[#F4EBFF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#E9D7FE] shadow-xl p-6 sm:p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EBFF] text-[#7F56D9] font-extrabold text-2xl shadow-sm">
          W
        </div>

        <span className="inline-flex items-center rounded-full bg-[#F4EBFF] px-3 py-1 text-xs font-semibold text-[#6941C6] mb-3">
          You&apos;ve Been Invited to WhoCan
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#101828]">
          Get Local Tasks &amp; Favors Done Easily
        </h1>

        <p className="mt-2 text-sm text-[#475467] leading-relaxed">
          Join WhoCan with your friend&apos;s invite: post a job, compare offers
          from local Providers, chat first and pay in the app.
        </p>

        {cleanCode && (
          <div className="mt-6 rounded-2xl bg-[#F9F5FF] border border-[#D6BBFB] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6941C6]">
              Referral Code
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-3">
              <span className="text-xl font-extrabold tracking-widest text-[#7F56D9]">
                {cleanCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#7F56D9] border border-[#D6BBFB] hover:bg-[#F4EBFF] transition cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[#667085]">
              Tip: Copy this code so it&apos;s ready when you create your
              account after installing the app.
            </p>
          </div>
        )}

        <p className="mt-5 text-xs font-medium text-[#6941C6] animate-pulse">
          {statusMessage}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleOpenApp}
            className="w-full rounded-full bg-[#7F56D9] px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6941C6] transition cursor-pointer"
          >
            Open in WhoCan App
          </button>

          {platform !== 'ios' && (
            <a
              href={playStoreUrl}
              className="w-full rounded-full border border-[#D0D5DD] bg-white px-5 py-3 text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] transition"
            >
              Download on Google Play (Android)
            </a>
          )}

          {platform !== 'android' && (
            <a
              href={appStoreUrl}
              className="w-full rounded-full border border-[#D0D5DD] bg-white px-5 py-3 text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] transition"
            >
              Download on the App Store (iPhone)
            </a>
          )}

          <Link
            href={
              cleanCode
                ? `/auth/signup?ref=${encodeURIComponent(cleanCode)}`
                : '/auth/signup'
            }
            className="mt-1 text-xs font-semibold text-[#667085] hover:text-[#7F56D9] transition"
          >
            Or continue on Web Signup &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}

