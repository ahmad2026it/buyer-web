'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MarketplaceChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'listing');
    router.replace(`/chat?${params.toString()}`);
  }, [router, searchParams]);

  return <div style={{ minHeight: '100dvh', background: '#F9FAFB' }} />;
}

export default function MarketplaceChatPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#F9FAFB' }} />}>
      <MarketplaceChatRedirect />
    </Suspense>
  );
}
