'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGateModal from '@/components/AuthGateModal';
import Navbar from '@/components/Navbar';
import {
  BUYER_CONVERSATION_LIST_CACHE_ARGS,
  BUYER_CONVERSATION_MESSAGES_LIMIT,
  buyerConversationsAPI,
  conversationListingId,
  isListingConversation,
  useGetBuyerConversationMessagesQuery,
  useMarkBuyerConversationReadMutation,
} from '@/app/buyer/store/buyerConversationsAPI';
import type {
  BuyerConversation,
  BuyerConversationType,
} from '@/app/buyer/store/buyerConversationsTypes';
import {
  formatMarketplaceListingStatus,
  marketplaceListingMessagingUnavailableReason,
} from '@/lib/marketplace/listings';
import { useConversationRealtime } from '@/lib/useConversationRealtime';
import { useBuyerInboxConversations } from '@/lib/useBuyerInboxConversations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const BRAND = '#A54AFF';
const GRAD  = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const F     = 'Poppins, sans-serif';
const MAX_CHAT_ATTACHMENTS = 4;
const MAX_CHAT_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const CHAT_ATTACHMENT_ACCEPT = 'image/*,.pdf,.doc,.docx';
const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(?:$|\?)/i;

type PendingChatAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function isImageAttachmentUrl(url: string): boolean {
  if (url.startsWith('blob:') || url.startsWith('data:image/')) return true;
  try {
    return IMAGE_EXT.test(new URL(url).pathname);
  } catch {
    return IMAGE_EXT.test(url);
  }
}

function fileNameFromUrl(url: string): string {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const base = path.split('/').pop() ?? '';
    return base || 'Attachment';
  } catch {
    return 'Attachment';
  }
}

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

function listingTitle(conv: BuyerConversation): string {
  return conv.listing?.title || conv.marketplaceListing?.title || 'Marketplace listing';
}

function conversationListingStatus(conv: BuyerConversation): string {
  return (conv.listing?.status || conv.marketplaceListing?.status || '').trim();
}

function conversationSubtitle(conv: BuyerConversation): string {
  if (isListingConversation(conv)) return listingTitle(conv);
  return conv.booking?.favor?.title || 'Seller';
}

function messagingUnavailableCopy(conv: BuyerConversation): { banner: string; placeholder: string } {
  if (isListingConversation(conv)) {
    const status = conversationListingStatus(conv);
    const label = status ? formatMarketplaceListingStatus(status) : '';
    return {
      banner: marketplaceListingMessagingUnavailableReason(status),
      placeholder: label ? `Listing ${label.toLowerCase()}` : 'Messaging unavailable',
    };
  }

  const bookingStatus = (conv.bookingStatus || conv.booking?.status || '').trim();
  if (bookingStatus) {
    const label = bookingStatus.replace(/_/g, ' ').toLowerCase();
    return {
      banner: `Messaging is unavailable because this booking is ${label}.`,
      placeholder: 'Messaging unavailable',
    };
  }

  return {
    banner: 'Messaging is unavailable for this booking.',
    placeholder: 'Messaging unavailable',
  };
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

function ChatAttachment({ url, isMe }: { url: string; isMe: boolean }) {
  const [failed, setFailed] = useState(false);
  const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
  const name = fileNameFromUrl(url);

  if (isImageAttachmentUrl(url) && !failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label="Open image attachment"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: 260,
            width: 'auto',
            height: 'auto',
            borderRadius: radius,
            border: isMe ? 'none' : '1.5px solid #EAECF0',
            background: '#F2F4F7',
            objectFit: 'contain',
          }}
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: radius,
        background: isMe ? '#E4E6EA' : '#ffffff',
        border: isMe ? 'none' : '1.5px solid #EAECF0',
        fontFamily: F,
        fontSize: 12,
        fontWeight: 600,
        color: BRAND,
        wordBreak: 'break-all',
      }}
    >
      {name}
    </a>
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

function parseConversationTab(value: string | null): BuyerConversationType | null {
  if (value === 'listing' || value === 'list') return 'listing';
  if (value === 'booking') return 'booking';
  return null;
}

export default function BuyerChatCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const requestedTab = parseConversationTab(searchParams.get('tab'));

  const [tab, setTab] = useState<BuyerConversationType>(requestedTab ?? 'booking');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<PendingChatAttachment[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<PendingChatAttachment[]>([]);
  const markedReadRef = useRef<Set<string>>(new Set());
  pendingRef.current = pending;

  const {
    bookingQuery,
    listingQuery,
    bookingConversations,
    listingConversations,
  } = useBuyerInboxConversations({
    skip: !token,
    pollingInterval: token ? 20000 : 0,
  });

  const [markConversationRead] = useMarkBuyerConversationReadMutation();

  const conversations = tab === 'listing' ? listingConversations : bookingConversations;
  const conversationsLoading = tab === 'listing' ? listingQuery.isLoading : bookingQuery.isLoading;
  const conversationsError = tab === 'listing' ? listingQuery.isError : bookingQuery.isError;
  const refetchConversations = tab === 'listing' ? listingQuery.refetch : bookingQuery.refetch;
  const bookingUnread = bookingConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const listingUnread = listingConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const totalUnread = bookingUnread + listingUnread;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => {
      const name = conv.otherParticipant?.fullName?.toLowerCase() ?? '';
      const handle = toHandle(conv.otherParticipant?.fullName ?? '').toLowerCase();
      const preview = conv.lastMessage?.preview?.toLowerCase() ?? '';
      const title = conv.booking?.favor?.title?.toLowerCase() ?? '';
      const listing =
        conv.listing?.title?.toLowerCase() ?? conv.marketplaceListing?.title?.toLowerCase() ?? '';
      return (
        name.includes(q) ||
        handle.includes(q) ||
        preview.includes(q) ||
        title.includes(q) ||
        listing.includes(q)
      );
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
    const fromId = Number(searchParams.get('id'));
    const fromBooking = Number(searchParams.get('bookingId'));
    const fromSeller = Number(searchParams.get('sellerId'));
    const fromListing = Number(searchParams.get('listingId'));
    const urlTab = parseConversationTab(searchParams.get('tab'));

    const findIn = (items: BuyerConversation[]) => {
      const byId =
        Number.isFinite(fromId) && fromId > 0
          ? items.find((conv) => conv.id === fromId)
          : undefined;
      const byBooking =
        Number.isFinite(fromBooking) && fromBooking > 0
          ? items.find(
              (conv) => conv.favorBookingId === fromBooking || conv.booking?.id === fromBooking,
            )
          : undefined;
      const bySeller =
        Number.isFinite(fromSeller) && fromSeller > 0
          ? items.find(
              (conv) => conv.sellerUserId === fromSeller || conv.otherParticipant?.id === fromSeller,
            )
          : undefined;
      const byListing =
        Number.isFinite(fromListing) && fromListing > 0
          ? items.find((conv) => conversationListingId(conv) === fromListing)
          : undefined;
      return byId ?? byBooking ?? bySeller ?? byListing;
    };

    const listingMatch = findIn(listingConversations);
    const bookingMatch = findIn(bookingConversations);
    const nextTab: BuyerConversationType =
      listingMatch && !bookingMatch
        ? 'listing'
        : bookingMatch && !listingMatch
          ? 'booking'
          : urlTab ?? (Number.isFinite(fromListing) && fromListing > 0 ? 'listing' : tab);

    if (nextTab !== tab) {
      setTab(nextTab);
      return;
    }

    const list = nextTab === 'listing' ? listingConversations : bookingConversations;
    if (!list.length) {
      setActiveId(null);
      return;
    }

    const target = nextTab === 'listing' ? listingMatch : bookingMatch;
    setActiveId((prev) => {
      if (target) return target.id;
      if (prev != null && list.some((conv) => conv.id === prev)) return prev;
      return list[0].id;
    });
  }, [bookingConversations, listingConversations, searchParams, tab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, messages.length, otherUserTyping, pending.length]);

  useEffect(() => {
    setPending((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setInput('');
  }, [activeId]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

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
    setThreadOpen(true);
    BUYER_CONVERSATION_LIST_CACHE_ARGS.forEach((cacheParams) => {
      dispatch(
        buyerConversationsAPI.util.updateQueryData(
          'getBuyerConversations',
          cacheParams,
          (draft) => {
            const conv = draft.data?.conversations?.find((item) => item.id === id);
            if (conv) conv.unreadCount = 0;
          },
        ),
      );
    });
    router.replace(`/chat?tab=${tab}&id=${id}`, { scroll: false });
  };

  const selectTab = (next: BuyerConversationType) => {
    if (next === tab) return;
    setTab(next);
    setThreadOpen(false);
    setActiveId(null);
    setSearch('');
    router.replace(`/chat?tab=${next}`, { scroll: false });
  };

  const sendMsg = async () => {
    const text = input.trim();
    const filesToSend = pending;
    if ((!text && filesToSend.length === 0) || !active || sending) return;
    if (!token) {
      setAuthOpen(true);
      return;
    }
    if (!active.canSend) return;

    stopTyping();
    setInput('');
    setPending([]);
    inputRef.current?.focus();

    const result = await sendTextMessage(
      text,
      filesToSend.map((item) => item.file),
    );
    if (!result.ok) {
      setInput(text);
      setPending(filesToSend);
      return;
    }
    filesToSend.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  };

  const addFiles = (list: FileList | File[] | null) => {
    if (!list || !active?.canSend || sending) return;
    const incoming = Array.from(list);
    const next: PendingChatAttachment[] = [...pending];
    let skippedSize = 0;
    let skippedLimit = 0;

    for (const file of incoming) {
      if (next.length >= MAX_CHAT_ATTACHMENTS) {
        skippedLimit += 1;
        continue;
      }
      if (file.size > MAX_CHAT_ATTACHMENT_BYTES) {
        skippedSize += 1;
        continue;
      }
      const duplicate = next.some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified,
      );
      if (duplicate) continue;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (skippedSize) {
      showToast('Each attachment must be 10 MB or smaller.', 'warning');
    } else if (skippedLimit) {
      showToast(`You can attach up to ${MAX_CHAT_ATTACHMENTS} files.`, 'warning');
    }

    setPending(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePending = (id: string) => {
    setPending((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  };

  const threadName = messagesResponse?.data?.otherParticipant?.name || active?.otherParticipant?.fullName || '';
  const threadImage = messagesResponse?.data?.otherParticipant?.image || active?.otherParticipant?.profileImage || null;
  const threadOnline = messagesResponse?.data?.otherParticipant?.isOnline ?? active?.otherParticipant?.isOnline ?? false;
  const threadSpecialty = active ? conversationSubtitle(active) : '';
  const firstName = threadName.split(' ')[0] || 'them';
  const canSend = Boolean(active?.canSend);
  const unavailableCopy = active && !canSend ? messagingUnavailableCopy(active) : null;
  const listingStatus = active && isListingConversation(active)
    ? conversationListingStatus(active)
    : '';
  const listingStatusLabel = listingStatus ? formatMarketplaceListingStatus(listingStatus) : '';
  const listingUnavailable = Boolean(
    listingStatus && listingStatus.toLowerCase() !== 'active',
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#F9FAFB' }} className="chat-page">
      <Navbar solid />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view and send messages."
        />
      )}

      <div className={`chat-layout${threadOpen ? ' chat-open' : ''}`} style={{ flex: 1, display: 'flex', background: '#F9FAFB', overflow: 'hidden', paddingTop: 88, minHeight: 0 }}>
        <div className="chat-list" style={{
          width: 360, flexShrink: 0, borderRight: '1px solid #EAECF0', background: '#ffffff',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: F, fontWeight: 700, fontSize: '20px', color: '#101828' }}>Messages</h1>
                {totalUnread > 0 && (
                  <span style={{ background: BRAND, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '11px', borderRadius: '9999px', padding: '2px 8px', lineHeight: '1.4' }}>
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>

            <div className="chat-type-tabs" role="tablist" aria-label="Conversation type">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'booking'}
                className={`chat-type-tab${tab === 'booking' ? ' is-active' : ''}`}
                onClick={() => selectTab('booking')}
              >
                Booking
                {bookingUnread > 0 ? <span className="chat-type-tab-count">{bookingUnread}</span> : null}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'listing'}
                className={`chat-type-tab${tab === 'listing' ? ' is-active' : ''}`}
                onClick={() => selectTab('listing')}
              >
                Listing
                {listingUnread > 0 ? <span className="chat-type-tab-count">{listingUnread}</span> : null}
              </button>
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
                {conversations.length === 0
                  ? tab === 'listing'
                    ? 'No listing chats yet'
                    : 'No booking chats yet'
                  : 'No conversations found'}
              </p>
            ) : filtered.map((conv) => {
              const isActive = conv.id === activeId;
              const name = conv.otherParticipant?.fullName || (isListingConversation(conv) ? 'Buyer' : 'Seller');
              const handle = isListingConversation(conv)
                ? conversationSubtitle(conv)
                : toHandle(name);
              const listingStatus = conversationListingStatus(conv);
              const listingStatusLabel =
                listingStatus && listingStatus.toLowerCase() !== 'active'
                  ? formatMarketplaceListingStatus(listingStatus)
                  : '';
              const unread = conv.unreadCount || 0;
              const avatarSrc =
                conv.otherParticipant?.profileImage ||
                conv.listing?.thumbnail ||
                conv.marketplaceListing?.thumbnail ||
                null;
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
                  <Avatar src={avatarSrc} name={name} size={44} online={conv.otherParticipant?.isOnline} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: F, fontWeight: 600, fontSize: '14px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span suppressHydrationWarning style={{ fontFamily: F, fontSize: '11px', color: '#98A2B3', flexShrink: 0 }}>
                        {formatListTime(conv.lastMessage?.at || conv.updatedAt)}
                      </span>
                    </div>
                    <span style={{ fontFamily: F, fontSize: '11px', color: BRAND, fontWeight: 500, display: 'block', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</span>
                    {listingStatusLabel ? (
                      <span style={{ fontFamily: F, fontSize: '11px', color: '#B42318', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                        {listingStatusLabel}
                      </span>
                    ) : null}
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

        <div className="chat-thread" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <p style={{ fontFamily: F, fontSize: 14, color: '#98A2B3', textAlign: 'center' }}>
                {token ? 'Select a conversation to start messaging' : 'Log in to view your messages'}
              </p>
            </div>
          ) : (
            <>
              <div className="chat-thread-head" style={{
                flexShrink: 0, background: '#ffffff', borderBottom: '1px solid #EAECF0',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <button
                  type="button"
                  className="chat-back"
                  aria-label="Back to conversations"
                  onClick={() => setThreadOpen(false)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: '#F2F4F7', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 4 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
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
                    {listingUnavailable ? (
                      <span style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, color: '#B42318', background: '#FEF3F2', borderRadius: 9999, padding: '2px 8px', flexShrink: 0 }}>
                        {listingStatusLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="chat-thread-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="chat-profile-btn"
                    onClick={() => {
                      if (conversationListingId(active)) {
                        router.push(`/marketplace/${conversationListingId(active)}`);
                        return;
                      }
                      router.push(`/seller/${active.sellerUserId}`);
                    }}
                    style={{ fontFamily: F, fontWeight: 600, fontSize: '13px', color: '#ffffff', background: GRAD, border: 'none', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    {isListingConversation(active) ? 'View listing' : 'View Profile'}
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
                          {msg.body ? (
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
                          ) : null}
                          {msg.attachments?.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                              {msg.attachments.map((url, attachmentIndex) => (
                                <ChatAttachment
                                  key={`${url}-${attachmentIndex}`}
                                  url={url}
                                  isMe={isMe}
                                />
                              ))}
                            </div>
                          ) : null}
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

              <div className="chat-composer" style={{
                flexShrink: 0, background: '#ffffff', borderTop: '1px solid #EAECF0',
                padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {!canSend && unavailableCopy && (
                  <p style={{ fontFamily: F, fontSize: 12, color: '#B42318', margin: 0, padding: '0 4px' }}>
                    {unavailableCopy.banner}
                  </p>
                )}
                {pending.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 2px' }}>
                    {pending.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          maxWidth: '100%',
                          padding: isImageFile(item.file) ? 0 : '6px 10px 6px 8px',
                          background: '#F9FAFB',
                          border: '1.5px solid #EAECF0',
                          borderRadius: 12,
                          overflow: 'hidden',
                        }}
                      >
                        {isImageFile(item.file) ? (
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            style={{ width: 56, height: 56, objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <span style={{
                            fontFamily: F,
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#344054',
                            maxWidth: 160,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.file.name}
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${item.file.name}`}
                          onClick={() => removePending(item.id)}
                          disabled={sending}
                          style={{
                            position: isImageFile(item.file) ? 'absolute' : 'static',
                            top: 4,
                            right: 4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: isImageFile(item.file) ? 'rgba(16,24,40,0.72)' : '#E4E6EA',
                            color: isImageFile(item.file) ? '#fff' : '#344054',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: sending ? 'default' : 'pointer',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={CHAT_ATTACHMENT_ACCEPT}
                    multiple
                    hidden
                    disabled={!canSend || sending}
                    onChange={(event) => addFiles(event.target.files)}
                  />
                  <button
                    type="button"
                    aria-label="Attach a file"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canSend || sending || pending.length >= MAX_CHAT_ATTACHMENTS}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1.5px solid #EAECF0',
                      background: '#F9FAFB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      opacity: canSend && !sending ? 1 : 0.5,
                      cursor: canSend && !sending ? 'pointer' : 'default',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48"
                        stroke="#667085"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAECF0', borderRadius: '9999px', padding: '10px 16px', gap: '8px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = BRAND; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(165,74,255,0.1)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAECF0'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={canSend ? `Message ${firstName}...` : (unavailableCopy?.placeholder ?? 'Messaging unavailable')}
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
                    type="button"
                    aria-label="Send message"
                    onClick={() => { void sendMsg(); }}
                    disabled={(!input.trim() && pending.length === 0) || !canSend || sending}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: (input.trim() || pending.length) && canSend && !sending ? 'pointer' : 'default',
                      background: (input.trim() || pending.length) && canSend ? GRAD : '#F2F4F7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'background 0.2s, opacity 0.2s, transform 0.15s',
                      opacity: (input.trim() || pending.length) && canSend ? 1 : 0.5,
                      boxShadow: (input.trim() || pending.length) && canSend ? '0 2px 12px rgba(165,74,255,0.35)' : 'none',
                    }}
                    onMouseEnter={e => { if ((input.trim() || pending.length) && canSend) { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={(input.trim() || pending.length) && canSend ? '#fff' : '#667085'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

