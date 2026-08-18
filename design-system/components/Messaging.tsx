import React from 'react';
import { Avatar } from './Avatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  content: string;
  sender: { name: string; avatar?: string; initials?: string };
  timestamp: string;
  isSelf?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { name: string; size: string; icon?: React.ReactNode }[];
}

export interface MessagingProps {
  messages: Message[];
  onSend?: (content: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isSelf = message.isSelf;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
      flexDirection: isSelf ? 'row-reverse' : 'row',
    }}>
      {!isSelf && (
        <Avatar
          src={message.sender.avatar}
          initials={message.sender.initials}
          name={message.sender.name}
          size="sm"
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
        {!isSelf && (
          <span style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 600, color: '#344054', marginLeft: '4px' }}>
            {message.sender.name}
          </span>
        )}
        <div style={{
          padding: '10px 14px',
          borderRadius: isSelf ? '12px 12px 0 12px' : '0 12px 12px 12px',
          backgroundColor: isSelf ? '#7F56D9' : '#F2F4F7',
          color: isSelf ? '#FFFFFF' : '#101828',
          fontSize: '14px', lineHeight: '20px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {message.content}
        </div>
        {message.attachments && message.attachments.map((att, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #EAECF0',
            backgroundColor: '#FFFFFF',
          }}>
            <span style={{ color: '#667085' }}>{att.icon || '📎'}</span>
            <div>
              <div style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500, color: '#344054' }}>{att.name}</div>
              <div style={{ fontSize: '12px', lineHeight: '18px', color: '#667085' }}>{att.size}</div>
            </div>
          </div>
        ))}
        <span style={{ fontSize: '12px', lineHeight: '18px', color: '#98A2B3', marginLeft: isSelf ? 0 : '4px', marginRight: isSelf ? '4px' : 0 }}>
          {message.timestamp}
          {isSelf && message.status && <span style={{ marginLeft: '4px' }}>
            {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : message.status === 'read' ? '✓✓' : '⋯'}
          </span>}
        </span>
      </div>
      {isSelf && (
        <Avatar
          src={message.sender.avatar}
          initials={message.sender.initials}
          name={message.sender.name}
          size="sm"
        />
      )}
    </div>
  );
};

// ─── Messaging Container ──────────────────────────────────────────────────────

export const Messaging: React.FC<MessagingProps> = ({
  messages,
  onSend,
  placeholder = 'Type a message…',
  style,
}) => {
  const [draft, setDraft] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #EAECF0',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style,
    }}>
      {/* Message list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {messages.map(m => <MessageBubble key={m.id} message={m} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {onSend && (
        <div style={{ borderTop: '1px solid #EAECF0', padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              border: '1px solid #D0D5DD',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '16px', lineHeight: '24px', color: '#101828',
              fontFamily: 'Inter, system-ui, sans-serif',
              outline: 'none',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            style={{
              height: '44px', width: '44px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: draft.trim() ? '#7F56D9' : '#F4EBFF',
              color: draft.trim() ? '#FFFFFF' : '#B692F6',
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background-color 0.15s',
            }}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18.333 1.667L9.167 10.833M18.333 1.667L12.5 18.333l-3.333-7.5-7.5-3.333L18.333 1.667z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
