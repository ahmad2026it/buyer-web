'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, OverlayViewF, OVERLAY_MOUSE_TARGET, useJsApiLoader } from '@react-google-maps/api';

import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_ID,
  getGoogleMapsApiKey,
} from '@/lib/googleMaps';

type LiveLocationMapProps = {
  lat: number | null;
  lng: number | null;
  sellerAvatar: string;
  sellerName: string;
  address?: string;
  height?: number;
};

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const BRAND = '#A54AFF';

function toLatLng(lat: number | null, lng: number | null): { lat: number; lng: number } | null {
  if (
    lat == null ||
    lng == null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return { lat, lng };
}

function SellerPin({ avatar, name }: { avatar: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(avatar) && !broken;

  return (
    <div
      style={{
        position: 'relative',
        width: 36,
        height: 48,
        transform: 'translate(-50%, calc(-100% + 6px))',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 8px 16px rgba(16,24,40,0.28))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 2,
          width: 14,
          height: 14,
          marginLeft: -7,
          borderRadius: '50%',
          background: 'rgba(165,74,255,0.28)',
          animation: 'liveMapPulse 1.8s ease-out infinite',
        }}
      />
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" aria-hidden>
        <path
          d="M18 47C18 47 33 31.2 33 18.5C33 10.04 26.28 3.2 18 3.2C9.72 3.2 3 10.04 3 18.5C3 31.2 18 47 18 47Z"
          fill={BRAND}
        />
        <path
          d="M18 47C18 47 33 31.2 33 18.5C33 10.04 26.28 3.2 18 3.2C9.72 3.2 3 10.04 3 18.5C3 31.2 18 47 18 47Z"
          stroke="#fff"
          strokeWidth="2.2"
        />
        <circle cx="18" cy="18" r="10.5" fill="#fff" />
        {!showPhoto && (
          <path
            d="M18 12.4a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2Zm0 7.4c2.6 0 5.2 1.3 5.2 3.1v.9H12.8v-.9c0-1.8 2.6-3.1 5.2-3.1Z"
            fill={BRAND}
          />
        )}
      </svg>
      {showPhoto && (
        <img
          src={avatar}
          alt={name}
          onError={() => setBroken(true)}
          style={{
            position: 'absolute',
            top: 9,
            left: 9,
            width: 18,
            height: 18,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}

function MapFallback({ message }: { message: string }) {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 210,
        borderRadius: 16,
        background: '#F2F4F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#667085', margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

export default function LiveLocationMap({
  lat,
  lng,
  sellerAvatar,
  sellerName,
  address,
  height = 210,
}: LiveLocationMapProps) {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const position = useMemo(() => toLatLng(lat, lng), [lat, lng]);
  const hasCoords = position != null;
  const [mapCenter, setMapCenter] = useState(position ?? { lat: 0, lng: 0 });
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!position) return;
    setMapCenter(position);
    mapRef.current?.panTo(position);
  }, [position]);

  const mapsUrl = position
    ? `https://www.google.com/maps?q=${position.lat},${position.lng}`
    : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  if (!hasCoords) {
    return <MapFallback message="Location coordinates are not available for this booking." />;
  }

  if (!apiKey) {
    return <MapFallback message="Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the live map." />;
  }

  if (loadError) {
    return <MapFallback message="Failed to load Google Maps. Check your API key and Maps JavaScript API." />;
  }

  if (!isLoaded || !position) {
    return <MapFallback message="Loading map..." />;
  }

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height }}>
      <style>{`
        @keyframes liveMapPulse {
          0% { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={16}
        onLoad={(map) => {
          mapRef.current = map;
          map.panTo(position);
        }}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: 'cooperative',
          zoomControl: true,
        }}
      >
        <OverlayViewF position={position} mapPaneName={OVERLAY_MOUSE_TARGET}>
          <SellerPin avatar={sellerAvatar} name={sellerName} />
        </OverlayViewF>
      </GoogleMap>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            zIndex: 2,
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 600,
            fontSize: 12,
            color: BRAND,
            background: '#fff',
            border: '1px solid #EAECF0',
            borderRadius: 9999,
            padding: '7px 12px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
          }}
        >
          Open in Maps
        </a>
      )}
    </div>
  );
}
