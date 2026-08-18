// Untitled UI-style stroke icons — 24×24 viewBox, stroke-width 2, round caps/joins

import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  display: 'block' as const,
  flexShrink: 0 as const,
  color,
});

const S = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

// ── Category icons ─────────────────────────────────────────────────────────────

export function SparklesIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path {...S} d="M20 3v4M22 5h-4M4 17v4M6 19H2" />
    </svg>
  );
}

export function WrenchIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function SettingsIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <circle {...S} cx="12" cy="12" r="3" />
      <path {...S} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function ZapIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function LeafIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path {...S} d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function DropletsIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 13.09 3 14.25c0 2.22 1.8 4.05 4 4.05z" />
      <path {...S} d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.99 3 6.48c0 4.05-3.13 7-7 7-1.53 0-3-.5-4.1-1.37" />
    </svg>
  );
}

export function PaintbrushIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M18.37 2.63L14 7l-1.59-1.59-2.83 2.83 1.59 1.59L7 14H2v5h5l4.17-4.17 1.59 1.59 2.83-2.83L14 12.42l4.37-4.37 2 2L22 6.63z" />
      <line {...S} x1="16" y1="14" x2="10" y2="8" />
    </svg>
  );
}

export function PackageIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline {...S} points="3.27 6.96 12 12.01 20.73 6.96" />
      <line {...S} x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function HammerIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M15 12l-8.5 8.5a2.121 2.121 0 0 1-3-3L12 9" />
      <path {...S} d="M17.64 15L22 10.64" />
      <path {...S} d="m20.91 11.7-1.25-1.25c.037-.264.594-1.68 .594-1.68l-2.335-2.335s-1.42.557-1.68.594L15 5.78c0-.264.558-1.68.558-1.68L12.23 1.77a1 1 0 0 0-1.414 0L8.16 4.42a1 1 0 0 0 0 1.415l1.25 1.25c-.037.264-.594 1.68-.594 1.68l2.335 2.335s1.42-.558 1.68-.594L14.22 11.8c0 .264-.558 1.68-.558 1.68l2.335 2.335s1.42-.557 1.68-.594l1.25 1.25a1 1 0 0 0 1.414 0l2.648-2.648a1 1 0 0 0 0-1.414z" />
    </svg>
  );
}

export function ShieldIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function BugIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M8 2l1.88 1.88" />
      <path {...S} d="M14.12 3.88L16 2" />
      <path {...S} d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path {...S} d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path {...S} d="M12 20v-9" />
      <path {...S} d="M6.53 9C4.6 8.8 2.96 7.58 2 6" />
      <path {...S} d="M6 13H2" />
      <path {...S} d="M3 19c1.1-1.22 2.49-2 4-2" />
      <path {...S} d="M20 6c-.96 1.58-2.6 2.8-4.53 3" />
      <path {...S} d="M18 13h4" />
      <path {...S} d="M17 17c1.51 0 2.9.78 4 2" />
    </svg>
  );
}

export function ToolboxIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line {...S} x1="12" y1="11" x2="12" y2="17" />
      <line {...S} x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

// ── Why Choose Us icons ────────────────────────────────────────────────────────

export function LinkIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path {...S} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function LockIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <rect {...S} x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path {...S} d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function MapPinIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle {...S} cx="12" cy="10" r="3" />
    </svg>
  );
}

export function EditIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path {...S} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ── App Download icons ─────────────────────────────────────────────────────────

export function SearchIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <circle {...S} cx="11" cy="11" r="8" />
      <line {...S} x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline {...S} points="9 12 11 14 15 10" />
    </svg>
  );
}

export function SmartphoneIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <rect {...S} x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line {...S} x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

// ── Become Seller icons ────────────────────────────────────────────────────────

export function DollarSignIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <line {...S} x1="12" y1="1" x2="12" y2="23" />
      <path {...S} d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function CalendarIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <rect {...S} x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line {...S} x1="16" y1="2" x2="16" y2="6" />
      <line {...S} x1="8" y1="2" x2="8" y2="6" />
      <line {...S} x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function GlobeIcon({ size = 24, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <circle {...S} cx="12" cy="12" r="10" />
      <line {...S} x1="2" y1="12" x2="22" y2="12" />
      <path {...S} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ── Misc ───────────────────────────────────────────────────────────────────────

export function StarIcon({ size = 14, color = '#F79009', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <polygon fill="currentColor" stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function BookmarkIcon({ size = 18, color = '#667085', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <line {...S} x1="5" y1="12" x2="19" y2="12" />
      <polyline {...S} points="12 5 19 12 12 19" />
    </svg>
  );
}

export function CheckIcon({ size = 16, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <polyline {...S} points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 16, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <line {...S} x1="7" y1="17" x2="17" y2="7" />
      <polyline {...S} points="7 7 17 7 17 17" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <polyline {...S} points="6 9 12 15 18 9" />
    </svg>
  );
}

export function HeartIcon({ size = 16, color = 'currentColor', style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base(size, color), ...style }}>
      <path {...S} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
