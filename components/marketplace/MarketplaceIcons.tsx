import type { ReactNode } from 'react';
import type { MarketplaceCategoryId } from '@/lib/marketplace/types';

type IconProps = { size?: number; color?: string };

function Svg({ size = 16, color = 'currentColor', children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function GridIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}

export function PhoneIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </Svg>
  );
}

export function CarIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <path d="M3 13l2-6h14l2 6" />
      <path d="M3 13h18v4H3z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </Svg>
  );
}

export function ChipIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M9 7V4M15 7V4M9 20v-3M15 20v-3M4 12H2M22 12h-2" />
    </Svg>
  );
}

export function SofaIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <path d="M4 14v4h16v-4" />
      <path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
      <path d="M7 12V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
    </Svg>
  );
}

export function ShirtIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <path d="M16 4l4 3-2 3v10H6V10L4 7l4-3 2 2h4l2-2z" />
    </Svg>
  );
}

export function HomeIcon({ size, color }: IconProps) {
  return (
    <Svg size={size} color={color}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function SearchIcon({ size = 16, color = '#98A2B3' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SlidersIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="12" r="2" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="10" r="2" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="14" r="2" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function PinIcon({ size = 12, color = '#98A2B3' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="10" r="2.2" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function CameraIcon({ size = 12, color = '#ffffff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h3l2-2h6l2 2h3v11H4V8z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function PlusIcon({ size = 16, color = '#ffffff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function HeartOutlineIcon({ size = 16, color = '#667085' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartFilledIcon({ size = 16, color = '#F43F5E' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={color}
      />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<MarketplaceCategoryId, (props: IconProps) => ReactNode> = {
  all: GridIcon,
  mobiles: PhoneIcon,
  vehicles: CarIcon,
  electronics: ChipIcon,
  furniture: SofaIcon,
  fashion: ShirtIcon,
  property: HomeIcon,
};
