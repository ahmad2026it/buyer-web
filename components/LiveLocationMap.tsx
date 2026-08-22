'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_ID,
  getGoogleMapsApiKey,
} from '@/lib/googleMaps';

type LiveLocationMapProps = {
  lat: number | null;
  lng: number | null;
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
        <Marker position={position} title={sellerName} />
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
