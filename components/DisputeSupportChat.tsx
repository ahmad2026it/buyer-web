'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT,
  isOwnDisputeSupportMessage,
  newDisputeSupportClientMsgId,
  removeOptimisticDisputeSupportMessage,
  upsertBuyerDisputeSupportMessage,
  useGetBuyerDisputeSupportMessagesQuery,
  useMarkBuyerDisputeSupportReadMutation,
  useSendBuyerDisputeSupportMessageMutation,
} from '@/app/buyer/store/buyerDisputeSupportAPI';
import type {
  BuyerDisputeSupportMessage,
  DisputeSupportAttachment,
} from '@/app/buyer/store/buyerDisputeSupportTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const FONT = 'Poppins, sans-serif';
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_ACCEPT = 'image/*,.pdf,.doc,.docx';

type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function attachmentFromPending(item: PendingAttachment): DisputeSupportAttachment {
  return {
    url: item.previewUrl,
    mime: item.file.type,
    type: isImageFile(item.file) ? 'image' : 'file',
    name: item.file.name,
  };
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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

function DateDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#EAECF0' }} />
      <span style={{ fontFamily: FONT, fontSize: 11, color: '#98A2B3', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#EAECF0' }} />
    </div>
  );
}

function ChatAttachment({
  attachment,
  isMe,
}: {
  attachment: DisputeSupportAttachment;
  isMe: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

  if (attachment.type === 'image' && !failed) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        aria-label="Open image attachment"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <img
          src={attachment.url}
          alt={attachment.name || 'Image attachment'}
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
      href={attachment.url}
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
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        color: BRAND,
        wordBreak: 'break-all',
      }}
    >
      {attachment.name || 'Attachment'}
    </a>
  );
}

function SupportAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: GRAD,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={Math.round(size * 0.46)} height={Math.round(size * 0.46)} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3a7 7 0 0 0-7 7v2.2A2.8 2.8 0 0 0 7.8 15H8v-3H6.2A.2.2 0 0 1 6 11.8V10a6 6 0 1 1 12 0v1.8a.2.2 0 0 1-.2.2H16v3h.2A2.8 2.8 0 0 0 19 12.2V10a7 7 0 0 0-7-7z"
          fill="#fff"
        />
        <path d="M9 15.5V17a3 3 0 0 0 6 0v-1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function DisputeSupportChat({
  open,
  disputeId,
  ticketNo,
  onClose,
}: {
  open: boolean;
  disputeId: number;
  ticketNo: number | string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<PendingAttachment[]>([]);
  const markedReadRef = useRef<number | null>(null);
  pendingRef.current = pending;

  const {
    data: messagesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetBuyerDisputeSupportMessagesQuery(
    { disputeId, limit: BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT },
    { skip: !open || !disputeId, pollingInterval: open ? 8000 : 0 },
  );

  const [sendMessage] = useSendBuyerDisputeSupportMessageMutation();
  const [markRead] = useMarkBuyerDisputeSupportReadMutation();

  const messages = useMemo(() => {
    const items = messagesResponse?.data?.messages ?? [];
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesResponse]);

  const canSend = messagesResponse?.data?.canSend !== false;
  const supportName = messagesResponse?.data?.otherParticipant?.name || 'Support';

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) {
      markedReadRef.current = null;
      return;
    }
    const latest = [...messages].reverse().find((msg) => msg.id > 0);
    if (!latest || markedReadRef.current === latest.id) return;
    markedReadRef.current = latest.id;
    void markRead({ disputeId });
  }, [disputeId, markRead, messages, open]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  if (!open) return null;

  const canSubmit = Boolean(input.trim() || pending.length) && canSend && !sending;

  const addFiles = (list: FileList | File[] | null) => {
    if (!list || !canSend || sending) return;
    const incoming = Array.from(list);
    const next: PendingAttachment[] = [...pending];
    let skippedSize = 0;
    let skippedLimit = 0;

    for (const file of incoming) {
      if (next.length >= MAX_ATTACHMENTS) {
        skippedLimit += 1;
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
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
      showToast(`You can attach up to ${MAX_ATTACHMENTS} files.`, 'warning');
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

  const send = async () => {
    const text = input.trim();
    const filesToSend = pending;
    if ((!text && filesToSend.length === 0) || sending || !canSend) return;

    setSending(true);
    setInput('');
    setPending([]);
    inputRef.current?.focus();

    const clientMsgId = newDisputeSupportClientMsgId();
    const now = new Date().toISOString();
    const optimisticAttachments = filesToSend.map(attachmentFromPending);
    const optimistic: BuyerDisputeSupportMessage = {
      id: -Date.now(),
      disputeId,
      threadId: messagesResponse?.data?.threadId ?? null,
      senderUserId: user?.id ?? null,
      senderType: 'buyer',
      senderName: user?.fullName || 'You',
      senderImage: user?.profileImage ?? null,
      body: text,
      attachments: optimisticAttachments,
      clientMsgId,
      createdAt: now,
      updatedAt: now,
      pending: true,
    };

    upsertBuyerDisputeSupportMessage(dispatch, optimistic);

    try {
      const response = await sendMessage({
        disputeId,
        body: text,
        clientMsgId,
        files: filesToSend.map((item) => item.file),
      }).unwrap();

      if (response.data?.message) {
        const incoming = response.data.message;
        if (incoming.attachments.length > 0 || filesToSend.length === 0) {
          upsertBuyerDisputeSupportMessage(dispatch, incoming);
        } else {
          await refetch();
        }
      } else {
        await refetch();
      }
      filesToSend.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    } catch {
      removeOptimisticDisputeSupportMessage(dispatch, disputeId, clientMsgId);
      setInput(text);
      setPending(filesToSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="support-chat-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10040,
        background: 'rgba(16,24,40,0.48)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-chat-title"
        className="support-chat-panel"
        style={{
          width: 420,
          maxWidth: '100%',
          height: '100%',
          background: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 48px -12px rgba(16,24,40,0.18)',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            background: '#ffffff',
            borderBottom: '1px solid #EAECF0',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            aria-label="Close support chat"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F2F4F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <SupportAvatar size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id="support-chat-title"
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: '#101828', marginBottom: 2 }}
            >
              {supportName}
            </h2>
            <p style={{ fontFamily: FONT, fontSize: 12, color: '#667085' }}>
              Ticket #{ticketNo}
            </p>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            scrollbarWidth: 'thin',
            scrollbarColor: '#E9D5FF transparent',
          }}
        >
          {isLoading && messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <div style={{ alignSelf: 'flex-end', width: '46%', height: 44, borderRadius: 18, background: '#E4E6EA' }} />
              <div style={{ alignSelf: 'flex-start', width: '52%', height: 44, borderRadius: 18, background: '#ffffff', border: '1.5px solid #EAECF0' }} />
              <div style={{ alignSelf: 'flex-end', width: '38%', height: 36, borderRadius: 18, background: '#E4E6EA' }} />
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontFamily: FONT, fontSize: 14, color: '#667085', marginBottom: 16 }}>
                Couldn&apos;t load support messages.
              </p>
              <button
                type="button"
                onClick={() => { void refetch(); }}
                style={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 13,
                  color: BRAND,
                  background: '#F4EBFF',
                  borderRadius: 9999,
                  padding: '8px 16px',
                }}
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <SupportAvatar size={56} />
              <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: '#101828', marginTop: 16, marginBottom: 6 }}>
                Chat with Support
              </p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: '#667085', lineHeight: 1.6 }}>
                Send a message and our team will help with this ticket.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = isOwnDisputeSupportMessage(msg, user?.id);
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showAvatar = !isMe && (!prevMsg || isOwnDisputeSupportMessage(prevMsg, user?.id));
              const showDay = !prevMsg || formatDayLabel(prevMsg.createdAt) !== formatDayLabel(msg.createdAt);

              return (
                <div key={msg.clientMsgId || msg.id}>
                  {showDay && <DateDivider label={formatDayLabel(msg.createdAt)} />}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 8,
                      opacity: msg.pending ? 0.7 : 1,
                    }}
                  >
                    {!isMe && (
                      <div style={{ width: 32, flexShrink: 0 }}>
                        {showAvatar && <SupportAvatar size={32} />}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '78%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        gap: 4,
                      }}
                    >
                      {msg.body ? (
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMe ? '#E4E6EA' : '#ffffff',
                            border: isMe ? 'none' : '1.5px solid #EAECF0',
                            boxShadow: isMe
                              ? '0 1px 4px rgba(16,24,40,0.08)'
                              : '0 1px 4px rgba(16,24,40,0.06)',
                            color: isMe ? '#344054' : '#101828',
                            fontFamily: FONT,
                            fontSize: 14,
                            lineHeight: 1.55,
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.body}
                        </div>
                      ) : null}
                      {msg.attachments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                          {msg.attachments.map((attachment) => (
                            <ChatAttachment
                              key={attachment.url}
                              attachment={attachment}
                              isMe={isMe}
                            />
                          ))}
                        </div>
                      )}
                      <span
                        suppressHydrationWarning
                        style={{
                          fontFamily: FONT,
                          fontSize: 10,
                          color: '#98A2B3',
                          paddingLeft: isMe ? 0 : 4,
                          paddingRight: isMe ? 4 : 0,
                        }}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer
          style={{
            flexShrink: 0,
            background: '#ffffff',
            borderTop: '1px solid #EAECF0',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {!canSend && (
            <p style={{ fontFamily: FONT, fontSize: 12, color: '#98A2B3', margin: 0, padding: '0 4px' }}>
              Messaging is unavailable for this ticket.
            </p>
          )}
          {pending.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                padding: '0 2px',
              }}
            >
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
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#344054',
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept={ATTACHMENT_ACCEPT}
              multiple
              hidden
              disabled={!canSend || sending}
              onChange={(event) => addFiles(event.target.files)}
            />
            <button
              type="button"
              aria-label="Attach a file"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canSend || sending || pending.length >= MAX_ATTACHMENTS}
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
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: '#F9FAFB',
                border: '1.5px solid #EAECF0',
                borderRadius: 9999,
                padding: '10px 16px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={canSend ? 'Message support...' : 'Messaging unavailable'}
                value={input}
                disabled={!canSend || sending}
                onChange={(event) => setInput(event.target.value)}
                onPaste={(event) => {
                  const pasted = event.clipboardData.files;
                  if (pasted.length) {
                    event.preventDefault();
                    addFiles(pasted);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontFamily: FONT,
                  fontSize: 14,
                  color: '#101828',
                  background: 'transparent',
                }}
              />
            </div>
            <button
              type="button"
              aria-label="Send message"
              onClick={() => { void send(); }}
              disabled={!canSubmit}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'default',
                background: canSubmit ? GRAD : '#F2F4F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: canSubmit ? 1 : 0.5,
                boxShadow: canSubmit ? '0 2px 12px rgba(165,74,255,0.35)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke={canSubmit ? '#fff' : '#667085'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
