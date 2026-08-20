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
  return (
    <div
      style={{
        position: 'relative',
        transform: 'translate(-50%, -100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 54,
          height: 54,
          marginLeft: -27,
          borderRadius: '50%',
          border: '2px solid rgba(165,74,255,0.5)',
          animation: 'liveMapRing 1.8s ease-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 54,
          height: 54,
          marginLeft: -27,
          borderRadius: '50%',
          border: '2px solid rgba(165,74,255,0.3)',
          animation: 'liveMapRing 1.8s ease-out 0.7s infinite',
        }}
      />
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          border: `3px solid ${BRAND}`,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 4px 18px rgba(165,74,255,0.5)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: `13px solid ${BRAND}`,
          marginTop: -2,
          zIndex: 1,
          filter: 'drop-shadow(0 3px 4px rgba(165,74,255,0.35))',
        }}
      />
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
        @keyframes liveMapRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
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
