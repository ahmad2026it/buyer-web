'use client';

import { Suspense } from 'react';
import BuyerChatCenter from '@/components/chat/BuyerChatCenter';

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#F9FAFB' }} />}>
      <BuyerChatCenter />
    </Suspense>
  );
}
