'use client';
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGateModal from '@/components/AuthGateModal';
import {
  BUYER_CONVERSATION_MESSAGES_LIMIT,
  BUYER_CONVERSATIONS_LIST_PARAMS,
  buyerConversationsAPI,
  useGetBuyerConversationMessagesQuery,
  useGetBuyerConversationsQuery,
  useMarkBuyerConversationReadMutation,
} from '@/app/buyer/store/buyerConversationsAPI';
import type { BuyerConversation } from '@/app/buyer/store/buyerConversationsTypes';
import { useConversationRealtime } from '@/lib/useConversationRealtime';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const F     = 'Poppins, sans-serif';
const NAV_H = 64;
const PROFILE_FALLBACK = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=72&h=72&fit=crop&auto=format';

function toHandle(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return slug ? `@${slug}` : '';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function conversationSubtitle(conv: BuyerConversation): string {
  return conv.booking?.favor?.title || 'Seller';
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatListTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffDays = Math.round((startOfLocalDay(new Date()) - startOfLocalDay(date)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function OnlineDot({ online }: { online: boolean }) {
  if (!online) return null;
  return (
    <span style={{
      position: 'absolute', bottom: '1px', right: '1px',
      width: '10px', height: '10px', borderRadius: '50%',
      background: '#12B76A', border: '2px solid #ffffff',
    }} />
  );
}

function Avatar({ src, name, size = 40, online = false }: { src: string | null; name: string; size?: number; online?: boolean }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: GRAD, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: F, fontWeight: 600, fontSize: Math.max(11, size * 0.34),
        }}>
          {getInitials(name)}
        </div>
      )}
      <OnlineDot online={online} />
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
      <div style={{ flex: 1, height: '1px', background: '#EAECF0' }} />
      <span style={{ fontFamily: F, fontSize: '11px', color: '#98A2B3', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#EAECF0' }} />
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F2F4F7', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '55%', height: 12, borderRadius: 4, background: '#F2F4F7', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 10, borderRadius: 4, background: '#F2F4F7' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markedReadRef = useRef<Set<string>>(new Set());

  const {
    data: conversationsResponse,
    isLoading: conversationsLoading,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useGetBuyerConversationsQuery(BUYER_CONVERSATIONS_LIST_PARAMS, {
    skip: !token,
    pollingInterval: token ? 20000 : 0,
  });

  const [markConversationRead] = useMarkBuyerConversationReadMutation();

  const conversations = conversationsResponse?.data?.conversations ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const name = conv.otherParticipant?.fullName?.toLowerCase() ?? '';
      const handle = toHandle(conv.otherParticipant?.fullName ?? '').toLowerCase();
      const preview = conv.lastMessage?.preview?.toLowerCase() ?? '';
      const title = conv.booking?.favor?.title?.toLowerCase() ?? '';
      return name.includes(q) || handle.includes(q) || preview.includes(q) || title.includes(q);
    });
  }, [conversations, search]);

  const active = conversations.find((conv) => conv.id === activeId) ?? null;
  const myUserId = user?.id ?? active?.buyerUserId ?? null;

  const { sending, joined, otherUserTyping, sendTextMessage, notifyTyping, stopTyping } =
    useConversationRealtime({
      enabled: Boolean(token && activeId != null),
      conversationId: activeId,
      myUserId,
    });

  const {
    data: messagesResponse,
    isLoading: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
  } = useGetBuyerConversationMessagesQuery(
    { conversationId: activeId ?? 0, limit: BUYER_CONVERSATION_MESSAGES_LIMIT },
    {
      skip: !token || activeId == null,
      pollingInterval: token && activeId != null && !joined ? 10000 : 0,
    },
  );

  const messages = useMemo(() => {
    const items = messagesResponse?.data?.messages ?? [];
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesResponse]);

  useEffect(() => {
    if (!conversations.length) return;
    setActiveId((prev) => {
      if (prev != null && conversations.some((conv) => conv.id === prev)) return prev;
      const fromUrl = Number(searchParams.get('id'));
      if (Number.isFinite(fromUrl) && conversations.some((conv) => conv.id === fromUrl)) return fromUrl;
      return conversations[0].id;
    });
  }, [conversations, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, messages.length, otherUserTyping]);

  useEffect(() => {
    if (!token || activeId == null) return;

    const latest = [...messages].reverse().find((msg) => msg.id > 0);
    if (!latest) return;

    const key = `${activeId}:${latest.id}`;
    if (markedReadRef.current.has(key)) return;

    const lastRead = active?.myLastReadMessageId ?? 0;
    const unread = active?.unreadCount ?? 0;
    if (unread <= 0 && latest.id <= lastRead) return;

    markedReadRef.current.add(key);
    void markConversationRead({
      conversationId: activeId,
      messageId: latest.id,
    });
  }, [activeId, active?.myLastReadMessageId, active?.unreadCount, markConversationRead, messages, token]);

  const selectConv = (id: number) => {
    setActiveId(id);
    dispatch(
      buyerConversationsAPI.util.updateQueryData(
        'getBuyerConversations',
        BUYER_CONVERSATIONS_LIST_PARAMS,
        (draft) => {
          const conv = draft.data?.conversations?.find((item) => item.id === id);
          if (conv) conv.unreadCount = 0;
        },
      ),
    );
    router.replace(`/chat?id=${id}`, { scroll: false });
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || !active || sending) return;
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (!active.canSend) return;

    stopTyping();
    setInput('');
    inputRef.current?.focus();

    const result = await sendTextMessage(text);
    if (!result.ok) {
      setInput(text);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const threadName = messagesResponse?.data?.otherParticipant?.name || active?.otherParticipant?.fullName || '';
  const threadImage = messagesResponse?.data?.otherParticipant?.image || active?.otherParticipant?.profileImage || null;
  const threadOnline = messagesResponse?.data?.otherParticipant?.isOnline ?? active?.otherParticipant?.isOnline ?? false;
  const threadSpecialty = active ? conversationSubtitle(active) : '';
  const firstName = threadName.split(' ')[0] || 'them';
  const canSend = Boolean(active?.canSend);
  const profileSrc = user?.profileImage || PROFILE_FALLBACK;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view and send messages."
        />
      )}

      <header style={{ flexShrink: 0, height: NAV_H, background: '#ffffff', borderBottom: '1px solid #EAECF0', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '32px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="118" height="24" viewBox="0 0 159 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.3728 2.47801C20.6978 0.134223 23.6737 -0.692738 26.0197 0.630946C28.3657 1.95464 29.1935 4.9277 27.8685 7.27149L15.5022 29.1471C14.1772 31.4909 11.2013 32.3179 8.8553 30.9942C6.50929 29.6705 5.68154 26.6974 7.00648 24.3536L19.3728 2.47801Z" fill="#A54AFF"/>
            <path d="M1.26277 2.15119C3.04388 -0.22362 6.41297 -0.704966 8.7878 1.07612C11.1626 2.85723 11.644 6.22632 9.86287 8.60114L9.67537 8.85114C7.89426 11.226 4.52517 11.7073 2.15034 9.92622C-0.224467 8.14511 -0.705813 4.77601 1.07527 2.40119L1.26277 2.15119Z" fill="#A54AFF"/>
            <path d="M10.625 3.62592C10.9375 4.81342 11.0625 6.18842 12.8125 6.50092C14.125 6.68842 15.5833 6.52175 16.1875 6.31342C17.6547 5.84183 18.785 4.82845 19.3208 4.04669L19.5625 3.62592C19.5053 3.75387 19.4241 3.89597 19.3208 4.04669L14.908 11.7282C14.7975 11.9949 14.65 12.2399 14.5 12.4384L14.908 11.7282C15.3193 10.7352 15.2167 9.44123 12.8125 9.12592C9.76248 8.72592 9.1875 9.56342 8.3125 10.1259L10.625 3.62592Z" fill="#A54AFF"/>
            <path d="M34.8734 2.47769C36.1984 0.134178 39.174 -0.692603 41.5198 0.631014C43.8658 1.95472 44.6934 4.92787 43.3685 7.27164L31.0023 29.1466C29.6774 31.4903 26.7017 32.3177 24.3558 30.9943C22.0099 29.6707 21.1814 26.6974 22.5062 24.3537L34.8734 2.47769ZM28.722 23.8859C27.3108 22.8335 25.3087 23.1174 24.2503 24.5207L24.139 24.6681C23.0806 26.0713 23.3666 28.062 24.7777 29.1144C26.1888 30.1668 28.1909 29.8827 29.2493 28.4796L29.3607 28.3322C30.419 26.929 30.1331 24.9383 28.722 23.8859Z" fill="#A54AFF"/>
            <path d="M60.1314 11.1925C61.5301 11.1925 62.7957 11.4848 63.928 12.0694C65.0604 12.6316 65.9485 13.5086 66.5924 14.7004C67.2585 15.8922 67.5915 17.4325 67.5915 19.3214V29.7778H61.2637V20.3671C61.2637 19.0628 60.9973 18.1184 60.4644 17.5337C59.9537 16.9266 59.2322 16.623 58.2996 16.623C57.6336 16.623 57.023 16.7804 56.4679 17.0952C55.9128 17.3876 55.4799 17.8485 55.169 18.4782C54.8582 19.1078 54.7028 19.9286 54.7028 20.9405V29.7778H48.375V4.75H54.7028V16.6905L53.2374 15.1726C53.9257 13.8459 54.8693 12.8565 56.0683 12.2044C57.2672 11.5298 58.6216 11.1925 60.1314 11.1925Z" fill="#101828"/>
            <path d="M80.8507 30.0814C78.8747 30.0814 77.1206 29.6766 75.5887 28.8671C74.0567 28.0575 72.8466 26.9444 71.9585 25.5278C71.0926 24.0886 70.6596 22.4471 70.6596 20.6032C70.6596 18.7593 71.0926 17.129 71.9585 15.7123C72.8466 14.2956 74.0567 13.1938 75.5887 12.4067C77.1206 11.5972 78.8747 11.1925 80.8507 11.1925C82.8268 11.1925 84.5808 11.5972 86.1128 12.4067C87.667 13.1938 88.877 14.2956 89.7429 15.7123C90.6088 17.129 91.0418 18.7593 91.0418 20.6032C91.0418 22.4471 90.6088 24.0886 89.7429 25.5278C88.877 26.9444 87.667 28.0575 86.1128 28.8671C84.5808 29.6766 82.8268 30.0814 80.8507 30.0814ZM80.8507 24.9881C81.5834 24.9881 82.2273 24.8194 82.7823 24.4821C83.3596 24.1448 83.8148 23.6501 84.1478 22.998C84.4809 22.3234 84.6474 21.5251 84.6474 20.6032C84.6474 19.6812 84.4809 18.9054 84.1478 18.2758C83.8148 17.6237 83.3596 17.129 82.7823 16.7917C82.2273 16.4544 81.5834 16.2857 80.8507 16.2857C80.1402 16.2857 79.4963 16.4544 78.9191 16.7917C78.364 17.129 77.9088 17.6237 77.5536 18.2758C77.2206 18.9054 77.054 19.6812 77.054 20.6032C77.054 21.5251 77.2206 22.3234 77.5536 22.998C77.9088 23.6501 78.364 24.1448 78.9191 24.4821C79.4963 24.8194 80.1402 24.9881 80.8507 24.9881Z" fill="#101828"/>
            <path d="M105.896 30.25C104.053 30.25 102.344 29.9577 100.767 29.373C99.2129 28.7659 97.8585 27.9114 96.704 26.8095C95.5717 25.7077 94.6836 24.4147 94.0397 22.9306C93.3958 21.4239 93.0739 19.7712 93.0739 17.9722C93.0739 16.1733 93.3958 14.5317 94.0397 13.0476C94.6836 11.541 95.5717 10.2368 96.704 9.13492C97.8585 8.03307 99.2129 7.18982 100.767 6.60516C102.344 5.99802 104.053 5.69444 105.896 5.69444C108.05 5.69444 109.97 6.07672 111.658 6.84127C113.367 7.60582 114.788 8.70767 115.92 10.1468L111.724 13.9921C110.969 13.0926 110.137 12.4067 109.226 11.9345C108.338 11.4623 107.339 11.2262 106.229 11.2262C105.274 11.2262 104.397 11.3836 103.598 11.6984C102.799 12.0132 102.11 12.4742 101.533 13.0813C100.978 13.666 100.534 14.3743 100.201 15.2063C99.8901 16.0384 99.7347 16.9603 99.7347 17.9722C99.7347 18.9841 99.8901 19.9061 100.201 20.7381C100.534 21.5701 100.978 22.2897 101.533 22.8968C102.11 23.4815 102.799 23.9312 103.598 24.246C104.397 24.5608 105.274 24.7183 106.229 24.7183C107.339 24.7183 108.338 24.4821 109.226 24.0099C110.137 23.5377 110.969 22.8519 111.724 21.9524L115.92 25.7976C114.788 27.2143 113.367 28.3161 111.658 29.1032C109.97 29.8677 108.05 30.25 105.896 30.25Z" fill="#101828"/>
            <path d="M129.52 29.7778V26.371L129.087 25.5278V19.254C129.087 18.2421 128.776 17.4663 128.154 16.9266C127.555 16.3644 126.589 16.0833 125.257 16.0833C124.391 16.0833 123.514 16.2295 122.626 16.5218C121.737 16.7917 120.983 17.1739 120.361 17.6687L118.229 13.3175C119.251 12.6429 120.472 12.1257 121.893 11.7659C123.336 11.3836 124.768 11.1925 126.189 11.1925C129.12 11.1925 131.385 11.8783 132.983 13.25C134.604 14.5992 135.414 16.7242 135.414 19.625V29.7778H129.52ZM124.191 30.0814C122.748 30.0814 121.527 29.834 120.527 29.3393C119.528 28.8446 118.762 28.17 118.229 27.3155C117.719 26.461 117.463 25.5053 117.463 24.4484C117.463 23.3241 117.741 22.3571 118.296 21.5476C118.873 20.7156 119.75 20.086 120.927 19.6587C122.104 19.209 123.625 18.9841 125.49 18.9841H129.753V22.3234H126.356C125.334 22.3234 124.613 22.4921 124.191 22.8294C123.791 23.1667 123.591 23.6164 123.591 24.1786C123.591 24.7407 123.802 25.1905 124.224 25.5278C124.646 25.8651 125.223 26.0337 125.956 26.0337C126.644 26.0337 127.266 25.8651 127.821 25.5278C128.398 25.168 128.82 24.6283 129.087 23.9087L129.952 26.2698C129.619 27.5291 128.964 28.4848 127.988 29.1369C127.033 29.7665 125.767 30.0814 124.191 30.0814Z" fill="#101828"/>
            <path d="M151.165 11.1925C152.564 11.1925 153.829 11.4848 154.962 12.0694C156.094 12.6316 156.982 13.5086 157.626 14.7004C158.292 15.8922 158.625 17.4325 158.625 19.3214V29.7778H152.297V20.3671C152.297 19.0628 152.031 18.1184 151.498 17.5337C150.987 16.9266 150.266 16.623 149.333 16.623C148.667 16.623 148.056 16.7804 147.501 17.0952C146.946 17.3876 146.513 17.8485 146.203 18.4782C145.892 19.1078 145.736 19.9286 145.736 20.9405V29.7778H139.409V11.496H145.437V16.6905L144.271 15.1726C144.959 13.8459 145.903 12.8565 147.102 12.2044C148.301 11.5298 149.655 11.1925 151.165 11.1925Z" fill="#101828"/>
          </svg>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {[['Home', '/'], ['Explore', '/explore'], ['My Bookings', '/bookings'], ['Custom Favor', '/custom-favor']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: F, fontWeight: 500, fontSize: '14px', color: '#475467', padding: '8px 12px', borderRadius: '9999px', textDecoration: 'none', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#101828'; el.style.background = '#F9FAFB'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#475467'; el.style.background = 'transparent'; }}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <a href="#app" style={{ fontFamily: F, fontWeight: 600, fontSize: '13px', color: '#101828', background: '#FEC84B', padding: '8px 16px', borderRadius: '9999px', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FDB022'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEC84B'; }}>
            Get App
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: GRAD, borderRadius: '9999px', padding: '6px 10px' }}>
            <button onClick={() => router.push('/favorites')} title="Favorites" style={{ width: 34, height: 34, borderRadius: '9999px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </button>
            <button title="Notifications" style={{ width: 34, height: 34, borderRadius: '9999px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button title="Messages" style={{ width: 34, height: 34, borderRadius: '9999px', background: 'rgba(255,255,255,0.28)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={() => { if (token) router.push('/profile'); else setAuthOpen(true); }}
              title="Profile"
              style={{ width: 34, height: 34, borderRadius: '9999px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, background: 'transparent' }}
            >
              <img src={profileSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', background: '#F9FAFB', overflow: 'hidden' }}>
        <div style={{
          width: 360, flexShrink: 0, borderRight: '1px solid #EAECF0', background: '#ffffff',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: F, fontWeight: 700, fontSize: '20px', color: '#101828' }}>Messages</h1>
                {totalUnread > 0 && (
                  <span style={{ background: BRAND, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '11px', borderRadius: '9999px', padding: '2px 8px', lineHeight: '1.4' }}>
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: '9999px', padding: '9px 14px', transition: 'border-color 0.15s' }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: F, fontSize: '13px', color: '#101828', background: 'transparent' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: '#E9D5FF transparent' }}>
            {!token ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontFamily: F, fontSize: '14px', color: '#667085', marginBottom: 16, lineHeight: 1.6 }}>Log in to see your conversations.</p>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  style={{ fontFamily: F, fontWeight: 700, fontSize: 13, color: '#fff', background: GRAD, border: 'none', borderRadius: 9999, padding: '10px 20px', cursor: 'pointer' }}
                >
                  Log in
                </button>
              </div>
            ) : conversationsLoading ? (
              <ConversationSkeleton />
            ) : conversationsError ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontFamily: F, fontSize: '14px', color: '#667085', marginBottom: 16 }}>Couldn&apos;t load conversations.</p>
                <button
                  type="button"
                  onClick={() => { void refetchConversations(); }}
                  style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: BRAND, background: '#F4EBFF', border: 'none', borderRadius: 9999, padding: '8px 16px', cursor: 'pointer' }}
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p style={{ fontFamily: F, fontSize: '13px', color: '#98A2B3', textAlign: 'center', padding: '40px 20px' }}>
                {conversations.length === 0 ? 'No conversations yet' : 'No conversations found'}
              </p>
            ) : filtered.map((conv) => {
              const isActive = conv.id === activeId;
              const name = conv.otherParticipant?.fullName || 'Seller';
              const handle = toHandle(name);
              const unread = conv.unreadCount || 0;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConv(conv.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                    cursor: 'pointer',
                    background: isActive ? '#F8F0FF' : 'transparent',
                    borderLeft: isActive ? `3px solid ${BRAND}` : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Avatar src={conv.otherParticipant?.profileImage} name={name} size={44} online={conv.otherParticipant?.isOnline} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: F, fontWeight: 600, fontSize: '14px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span suppressHydrationWarning style={{ fontFamily: F, fontSize: '11px', color: '#98A2B3', flexShrink: 0 }}>
                        {formatListTime(conv.lastMessage?.at || conv.updatedAt)}
                      </span>
                    </div>
                    <span style={{ fontFamily: F, fontSize: '11px', color: BRAND, fontWeight: 500, display: 'block', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontFamily: F, fontSize: '12px', color: unread > 0 ? '#344054' : '#667085', fontWeight: unread > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {conv.lastMessage?.preview || conversationSubtitle(conv)}
                      </span>
                      {unread > 0 && (
                        <span style={{ background: BRAND, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '10px', borderRadius: '9999px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <p style={{ fontFamily: F, fontSize: 14, color: '#98A2B3', textAlign: 'center' }}>
                {token ? 'Select a conversation to start messaging' : 'Log in to view your messages'}
              </p>
            </div>
          ) : (
            <>
              <div style={{
                flexShrink: 0, background: '#ffffff', borderBottom: '1px solid #EAECF0',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <Avatar src={threadImage} name={threadName} size={48} online={threadOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: '16px', color: '#101828', marginBottom: '2px' }}>{threadName}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    {threadOnline ? (
                      <>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#12B76A', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontFamily: F, fontSize: '12px', color: '#12B76A', fontWeight: 500 }}>Online</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: F, fontSize: '12px', color: '#98A2B3' }}>Offline</span>
                    )}
                    {threadSpecialty && (
                      <span style={{ fontFamily: F, fontSize: '12px', color: '#98A2B3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        · {threadSpecialty}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push(`/seller/${active.sellerUserId}`)}
                    style={{ fontFamily: F, fontWeight: 600, fontSize: '13px', color: '#ffffff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    View Profile
                  </button>
                  <button
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1.5px solid #EAECF0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                      <circle cx="2" cy="2" r="1.5" fill="#667085" />
                      <circle cx="8" cy="2" r="1.5" fill="#667085" />
                      <circle cx="14" cy="2" r="1.5" fill="#667085" />
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', scrollbarWidth: 'thin', scrollbarColor: '#E9D5FF transparent' }}>
                {messagesLoading && messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    <div style={{ alignSelf: 'flex-end', width: '46%', height: 44, borderRadius: 18, background: '#E4E6EA' }} />
                    <div style={{ alignSelf: 'flex-start', width: '52%', height: 44, borderRadius: 18, background: '#ffffff', border: '1.5px solid #EAECF0' }} />
                    <div style={{ alignSelf: 'flex-end', width: '38%', height: 36, borderRadius: 18, background: '#E4E6EA' }} />
                  </div>
                ) : messagesError ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ fontFamily: F, fontSize: '14px', color: '#667085', marginBottom: 16 }}>Couldn&apos;t load messages.</p>
                    <button
                      type="button"
                      onClick={() => { void refetchMessages(); }}
                      style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: BRAND, background: '#F4EBFF', border: 'none', borderRadius: 9999, padding: '8px 16px', cursor: 'pointer' }}
                    >
                      Try again
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <p style={{ fontFamily: F, fontSize: '13px', color: '#98A2B3', textAlign: 'center', padding: '40px 20px' }}>
                    No messages yet. Say hello!
                  </p>
                ) : messages.map((msg, idx) => {
                  const isMe = msg.senderUserId === myUserId;
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const showAvatar = !isMe && (!prevMsg || prevMsg.senderUserId === myUserId);
                  const showDay = !prevMsg || formatDayLabel(prevMsg.createdAt) !== formatDayLabel(msg.createdAt);
                  return (
                    <div key={msg.clientMsgId || msg.id}>
                      {showDay && <DateDivider label={formatDayLabel(msg.createdAt)} />}
                      <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px' }}>
                        {!isMe && (
                          <div style={{ width: 32, flexShrink: 0 }}>
                            {showAvatar && <Avatar src={threadImage} name={threadName} size={32} />}
                          </div>
                        )}

                        <div style={{ maxWidth: '66%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMe ? '#E4E6EA' : '#ffffff',
                            border: isMe ? 'none' : '1.5px solid #EAECF0',
                            boxShadow: isMe ? '0 1px 4px rgba(16,24,40,0.08)' : '0 1px 4px rgba(16,24,40,0.06)',
                            color: isMe ? '#344054' : '#101828',
                            fontFamily: F,
                            fontSize: '14px',
                            lineHeight: '1.55',
                            wordBreak: 'break-word' as const,
                          }}>
                            {msg.body}
                          </div>
                          <span suppressHydrationWarning style={{ fontFamily: F, fontSize: '10px', color: '#98A2B3', paddingLeft: isMe ? 0 : '4px', paddingRight: isMe ? '4px' : 0 }}>
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {otherUserTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ width: 32, flexShrink: 0 }}>
                      <Avatar src={threadImage} name={threadName} size={32} />
                    </div>
                    <p style={{ fontFamily: F, fontSize: '12px', color: '#98A2B3', margin: 0 }}>
                      {firstName} is typing…
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div style={{
                flexShrink: 0, background: '#ffffff', borderTop: '1px solid #EAECF0',
                padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {!canSend && (
                  <p style={{ fontFamily: F, fontSize: 12, color: '#98A2B3', margin: 0, padding: '0 4px' }}>
                    Messaging is unavailable for this booking.
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <button
                    title="Attach file"
                    disabled={!canSend || sending}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: '#F9FAFB', border: '1.5px solid #EAECF0', cursor: canSend ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s', opacity: canSend ? 1 : 0.5 }}
                    onMouseEnter={e => { if (canSend) { (e.currentTarget as HTMLElement).style.background = '#F4EBFF'; (e.currentTarget as HTMLElement).style.borderColor = BRAND; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: '9999px', padding: '10px 16px', gap: '8px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(165,74,255,0.1)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={canSend ? `Message ${firstName}...` : 'Messaging unavailable'}
                      value={input}
                      disabled={!canSend || sending}
                      onChange={e => {
                        setInput(e.target.value);
                        if (e.target.value.trim()) notifyTyping();
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMsg(); } }}
                      style={{ flex: 1, border: 'none', outline: 'none', fontFamily: F, fontSize: '14px', color: '#101828', background: 'transparent' }}
                    />
                  </div>

                  <button
                    onClick={() => { void sendMsg(); }}
                    disabled={!input.trim() || !canSend || sending}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: input.trim() && canSend && !sending ? 'pointer' : 'default',
                      background: input.trim() && canSend ? GRAD : '#F2F4F7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'background 0.2s, opacity 0.2s, transform 0.15s',
                      opacity: input.trim() && canSend ? 1 : 0.5,
                      boxShadow: input.trim() && canSend ? '0 2px 12px rgba(165,74,255,0.35)' : 'none',
                    }}
                    onMouseEnter={e => { if (input.trim() && canSend) { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={input.trim() && canSend ? '#fff' : '#667085'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F9FAFB' }} />}>
      <ChatPageInner />
    </Suspense>
  );
}
