import React from 'react';
import { Avatar } from './Avatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  user?: { name: string; avatar?: string; initials?: string };
  icon?: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  content: React.ReactNode;
  timestamp: string;
  action?: React.ReactNode;
  isLast?: boolean;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  showConnector?: boolean;
  style?: React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  showConnector = true,
  style,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', ...style }}>
    {items.map((item, idx) => {
      const isLast = item.isLast ?? idx === items.length - 1;
      return (
        <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
          {/* Left: avatar or icon + connector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              {item.user ? (
                <Avatar src={item.user.avatar} initials={item.user.initials} name={item.user.name} size="md" />
              ) : item.icon ? (
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  backgroundColor: item.iconBg || '#F4EBFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.iconColor || '#7F56D9',
                }}>
                  {item.icon}
                </div>
              ) : (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D0D5DD', margin: '15px auto 0' }} />
              )}
            </div>
            {showConnector && !isLast && (
              <div style={{ width: '2px', flex: 1, backgroundColor: '#EAECF0', minHeight: '16px', margin: '4px 0' }} />
            )}
          </div>

          {/* Right: content */}
          <div style={{ flex: 1, paddingBottom: isLast ? '0' : '24px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ fontSize: '14px', lineHeight: '20px', color: '#344054' }}>
                {item.user && (
                  <span style={{ fontWeight: 600, color: '#101828' }}>{item.user.name} </span>
                )}
                {item.content}
              </div>
              <span style={{ fontSize: '14px', lineHeight: '20px', color: '#667085', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {item.timestamp}
              </span>
            </div>
            {item.action && (
              <div style={{ marginTop: '8px' }}>
                {item.action}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);
