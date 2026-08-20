'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';

import type { PickedLocation } from '@/components/locationTypes';
import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_ID,
  getGoogleMapsApiKey,
} from '@/lib/googleMaps';

export type { PickedLocation };

type LocationMapPickerProps = {
  brandColor?: string;
  value: PickedLocation | null;
  onChange: (location: PickedLocation | null) => void;
  height?: number;
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const formatAddressParts = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult) => {
  const placeName = 'name' in place ? place.name : undefined;
  const address =
    ('formatted_address' in place && place.formatted_address) ||
    placeName ||
    '';
  const components =
    ('address_components' in place && place.address_components) || [];

  const city =
    components.find((c) => c.types.includes('locality'))?.long_name ||
    components.find((c) => c.types.includes('administrative_area_level_2'))?.long_name ||
    '';
  const region =
    components.find((c) => c.types.includes('administrative_area_level_1'))?.short_name ||
    '';
  const country =
    components.find((c) => c.types.includes('country'))?.short_name ||
    '';

  const detail = [city, region, country].filter(Boolean).join(', ');
  return { address, detail };
};

export default function LocationMapPicker({
  brandColor = '#A54AFF',
  value,
  onChange,
  height = 190,
}: LocationMapPickerProps) {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [query, setQuery] = useState(value?.address ?? '');
  const [mapCenter, setMapCenter] = useState(
    value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER,
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [pickerError, setPickerError] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!value) return;
    setQuery(value.address);
    setMapCenter({ lat: value.lat, lng: value.lng });
  }, [value]);

  const markerPosition = useMemo(
    () => (value ? { lat: value.lat, lng: value.lng } : null),
    [value],
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!window.google?.maps) return;
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }

      const result = await geocoderRef.current.geocode({ location: { lat, lng } });
      const first = result.results[0];
      if (!first) {
        onChange({
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          detail: '',
          lat,
          lng,
        });
        return;
      }

      const { address, detail } = formatAddressParts(first);
      const next = { address, detail, lat, lng };
      setQuery(address);
      onChange(next);
    },
    [onChange],
  );

  const applyCoords = useCallback(
    async (lat: number, lng: number) => {
      setMapCenter({ lat, lng });
      mapRef.current?.panTo({ lat, lng });
      setPickerError('');
      await reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const loc = place?.geometry?.location;
    if (!place || !loc) {
      setPickerError('Please pick an address from the suggestions.');
      return;
    }

    const lat = loc.lat();
    const lng = loc.lng();
    const { address, detail } = formatAddressParts(place);
    const next = {
      address: address || query,
      detail,
      lat,
      lng,
    };
    setQuery(next.address);
    setMapCenter({ lat, lng });
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(15);
    setPickerError('');
    onChange(next);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPickerError('Geolocation is not supported in this browser.');
      return;
    }

    setGeoLoading(true);
    setPickerError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await applyCoords(pos.coords.latitude, pos.coords.longitude);
          mapRef.current?.setZoom(16);
        } catch {
          setPickerError('Could not resolve your current location.');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoLoading(false);
        setPickerError('Location permission denied. Enable location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  if (!apiKey) {
    return (
      <div
        style={{
          borderRadius: '16px',
          border: '1.5px solid #FECDCA',
          background: '#FEF3F2',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#B42318', margin: 0 }}>
          Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable map search and lat/lng pinning.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          borderRadius: '16px',
          border: '1.5px solid #FECDCA',
          background: '#FEF3F2',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#B42318', margin: 0 }}>
          Failed to load Google Maps. Check your API key and enabled Maps/Places APIs.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          borderRadius: '16px',
          height,
          marginBottom: '16px',
          background: '#F2F4F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', margin: 0 }}>
          Loading map...
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          height,
          position: 'relative',
          border: '1px solid #EAECF0',
        }}
      >
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={mapCenter}
          zoom={value ? 15 : 11}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onClick={(e) => {
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (lat == null || lng == null) return;
            void applyCoords(lat, lng);
          }}
          options={{
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat == null || lng == null) return;
                void applyCoords(lat, lng);
              }}
            />
          )}
        </GoogleMap>
      </div>

      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <svg
          style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={onPlaceChanged}
          options={{ fields: ['formatted_address', 'geometry', 'name', 'address_components'] }}
        >
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (value) onChange(null);
            }}
            placeholder="Search an address..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 48px 12px 42px',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '13px',
              color: '#101828',
              border: '1.5px solid #EAECF0',
              borderRadius: '9999px',
              outline: 'none',
              background: '#F9FAFB',
              transition: 'border-color 0.15s,box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = brandColor;
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(165,74,255,0.12)';
              e.currentTarget.style.background = '#fff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#EAECF0';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = '#F9FAFB';
            }}
          />
        </Autocomplete>
        <button
          type="button"
          onClick={useCurrentLocation}
          title="Use current location"
          disabled={geoLoading}
          style={{
            position: 'absolute',
            right: '13px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: geoLoading ? 'wait' : 'pointer',
            padding: '2px',
            lineHeight: 0,
            opacity: geoLoading ? 0.6 : 1,
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={brandColor} strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill={brandColor} />
            <line x1="12" y1="2" x2="12" y2="5" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="5" y2="12" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="19" y1="12" x2="22" y2="12" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {pickerError ? (
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#D92D20', margin: '0 0 8px' }}>
          {pickerError}
        </p>
      ) : (
        <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '11px', color: '#98A2B3', margin: '0 0 8px' }}>
          Search, tap the map, or drag the pin to set coordinates.
        </p>
      )}
    </div>
  );
}
