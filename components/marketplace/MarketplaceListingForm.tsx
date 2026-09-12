'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  useCreateMarketplaceListingMutation,
  useUpdateMarketplaceListingMutation,
} from '@/app/buyer/store/marketplaceListingsAPI';
import { useMarketplaceCategories } from '@/app/buyer/store/marketplaceCategoriesAPI';
import type { PickedLocation } from '@/components/locationTypes';
import {
  MARKETPLACE_LISTING_CONDITIONS,
  MAX_MARKETPLACE_LISTING_IMAGES,
  type MarketplaceListing,
  type MarketplaceListingCondition,
} from '@/lib/marketplace/types';
import { useAppSelector } from '@/store/hooks';
import { showToast } from '@/lib/toast';

const LocationMapPicker = dynamic(() => import('@/components/LocationMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="marketplace-map-skel" aria-hidden="true">
      Loading map...
    </div>
  ),
});

const GRAD = 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)';

type PostForm = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  condition: MarketplaceListingCondition;
  locationLabel: string;
  city: string;
  state: string;
  zipCode: string;
};

type FieldErrors = Partial<Record<keyof PostForm | 'location' | 'images', string>>;

type ListingPhoto =
  | { id: string; kind: 'existing'; url: string }
  | { id: string; kind: 'new'; file: File; url: string };

const EMPTY_FORM: PostForm = {
  title: '',
  description: '',
  price: '',
  categoryId: '',
  condition: 'used_like_new',
  locationLabel: '',
  city: '',
  state: '',
  zipCode: '',
};

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function asListingCondition(value: string): MarketplaceListingCondition {
  return MARKETPLACE_LISTING_CONDITIONS.some((item) => item.value === value)
    ? (value as MarketplaceListingCondition)
    : 'used_like_new';
}

function listingToForm(listing: MarketplaceListing): PostForm {
  return {
    title: listing.title,
    description: listing.description,
    price: listing.price ? String(listing.price) : '',
    categoryId: listing.categoryId,
    condition: asListingCondition(listing.condition),
    locationLabel: listing.location === 'Location not set' ? '' : listing.location,
    city: listing.city ?? '',
    state: listing.state ?? '',
    zipCode: listing.zipCode ?? '',
  };
}

function listingToPicked(listing: MarketplaceListing): PickedLocation | null {
  if (listing.lat == null || listing.lng == null) return null;
  if (!Number.isFinite(listing.lat) || !Number.isFinite(listing.lng)) return null;
  return {
    address: listing.location === 'Location not set' ? '' : listing.location,
    detail: [listing.city, listing.state].filter(Boolean).join(', '),
    lat: listing.lat,
    lng: listing.lng,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
  };
}

export default function MarketplaceListingForm({
  mode,
  listing,
}: {
  mode: 'create' | 'edit';
  listing?: MarketplaceListing | null;
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const token = useAppSelector((state) => state.auth.token);
  const { postableCategories, isLoading: categoriesLoading } = useMarketplaceCategories();
  const [createListing, { isLoading: isCreating }] = useCreateMarketplaceListingMutation();
  const [updateListing, { isLoading: isUpdating }] = useUpdateMarketplaceListingMutation();
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const photosRef = useRef<ListingPhoto[]>([]);
  const hydratedIdRef = useRef<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const saving = isCreating || isUpdating;

  photosRef.current = photos;

  const firstCategoryId = postableCategories[0]?.id;
  useEffect(() => {
    if (isEdit) return;
    if (!form.categoryId && firstCategoryId) {
      setForm((current) => ({ ...current, categoryId: firstCategoryId }));
    }
  }, [form.categoryId, firstCategoryId, isEdit]);

  useEffect(() => {
    if (!isEdit || !listing) return;
    if (hydratedIdRef.current === listing.id) return;
    hydratedIdRef.current = listing.id;
    setForm(listingToForm(listing));
    setPicked(listingToPicked(listing));
    setPhotos(listing.images.map((url) => ({ id: url, kind: 'existing' as const, url })));
    setErrors({});
  }, [isEdit, listing]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        if (photo.kind === 'new') URL.revokeObjectURL(photo.url);
      });
    };
  }, []);

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const applyPickedLocation = (location: PickedLocation | null) => {
    setPicked(location);
    if (!location) return;
    setForm((current) => ({
      ...current,
      locationLabel: location.address || current.locationLabel,
      city: location.city || current.city,
      state: location.state || current.state,
      zipCode: location.zipCode || current.zipCode,
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.location;
      delete next.locationLabel;
      delete next.city;
      delete next.state;
      delete next.zipCode;
      return next;
    });
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter(isImageFile);
    if (!incoming.length) {
      showToast('Please choose image files only.', 'warning', 'Photos');
      return;
    }

    setPhotos((current) => {
      const remaining = MAX_MARKETPLACE_LISTING_IMAGES - current.length;
      if (remaining <= 0) {
        showToast(`You can add up to ${MAX_MARKETPLACE_LISTING_IMAGES} photos.`, 'warning', 'Photos');
        return current;
      }
      const nextFiles = incoming.slice(0, remaining);
      if (incoming.length > remaining) {
        showToast(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} can be added.`, 'warning', 'Photos');
      }
      setErrors((currentErrors) => {
        if (!currentErrors.images) return currentErrors;
        const next = { ...currentErrors };
        delete next.images;
        return next;
      });
      return [
        ...current,
        ...nextFiles.map((file) => {
          const url = URL.createObjectURL(file);
          return { id: url, kind: 'new' as const, file, url };
        }),
      ];
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const target = current[index];
      if (target?.kind === 'new') URL.revokeObjectURL(target.url);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.title.trim()) next.title = 'Enter a title.';
    if (!form.categoryId) next.categoryId = 'Select a category.';
    if (!form.condition) next.condition = 'Select a condition.';
    const price = Number(form.price);
    if (!form.price.trim() || !Number.isFinite(price) || price <= 0) {
      next.price = 'Enter a price greater than 0.';
    }
    if (!form.description.trim()) next.description = 'Add a description.';
    if (picked == null || !Number.isFinite(picked.lat) || !Number.isFinite(picked.lng)) {
      next.location = 'Pin a location on the map.';
    }
    if (!form.locationLabel.trim()) next.locationLabel = 'Enter a location label.';
    if (!form.city.trim()) next.city = 'Enter a city.';
    if (!form.state.trim()) next.state = 'Enter a state.';
    if (!form.zipCode.trim()) next.zipCode = 'Enter a ZIP / postal code.';
    if (photos.length === 0) next.images = 'Add at least one photo.';
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('Please complete the required listing details.', 'warning', 'Missing details');
      return;
    }
    if (!picked) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: String(Number(form.price)),
      categoryId: form.categoryId,
      condition: form.condition,
      lat: picked.lat,
      lng: picked.lng,
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      locationLabel: form.locationLabel.trim(),
      images: photos.filter((photo) => photo.kind === 'new').map((photo) => photo.file),
    };

    try {
      if (isEdit) {
        if (!listing) return;
        const result = await updateListing({
          id: listing.id,
          ...payload,
          keepImages: photos.filter((photo) => photo.kind === 'existing').map((photo) => photo.url),
        }).unwrap();
        showToast(result.message || 'Your ad was updated.', 'success', 'Listing updated');
      } else {
        const result = await createListing(payload).unwrap();
        showToast(result.message || 'Your ad is live.', 'success', 'Listing posted');
      }
      router.push('/marketplace/mine');
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  const backHref = isEdit ? '/marketplace/mine' : '/marketplace';

  return (
    <div className="marketplace-post">
      <button type="button" className="marketplace-detail-back" onClick={() => router.push(backHref)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isEdit ? 'Back to my listings' : 'Back to Marketplace'}
      </button>

      <h1>{isEdit ? 'Edit listing' : 'Post an ad'}</h1>
      <p>
        {isEdit
          ? 'Update the details, photos, or location for this ad.'
          : 'Free listing — add photos and pin a location so buyers can find your item.'}
      </p>

      <form className="marketplace-post-form" onSubmit={handleSubmit} noValidate aria-busy={saving}>
        <label className="marketplace-field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="e.g. iPhone 14 Pro Max - 256GB"
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'listing-title-error' : undefined}
          />
          {errors.title ? (
            <em id="listing-title-error" className="marketplace-field-error">
              {errors.title}
            </em>
          ) : null}
        </label>

        <div className="marketplace-price-fields">
          <label className="marketplace-field">
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) => set('categoryId', event.target.value)}
              disabled={categoriesLoading && postableCategories.length === 0}
              required
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={errors.categoryId ? 'listing-category-error' : undefined}
            >
              {postableCategories.length === 0 ? (
                <option value="">{categoriesLoading ? 'Loading categories...' : 'No categories yet'}</option>
              ) : (
                postableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))
              )}
            </select>
            {errors.categoryId ? (
              <em id="listing-category-error" className="marketplace-field-error">
                {errors.categoryId}
              </em>
            ) : null}
          </label>
          <label className="marketplace-field">
            <span>Condition</span>
            <select
              value={form.condition}
              onChange={(event) => set('condition', event.target.value as MarketplaceListingCondition)}
              required
              aria-invalid={Boolean(errors.condition)}
              aria-describedby={errors.condition ? 'listing-condition-error' : undefined}
            >
              {MARKETPLACE_LISTING_CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
            {errors.condition ? (
              <em id="listing-condition-error" className="marketplace-field-error">
                {errors.condition}
              </em>
            ) : null}
          </label>
        </div>

        <label className="marketplace-field">
          <span>Price ($)</span>
          <input
            type="number"
            min={1}
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => set('price', event.target.value)}
            placeholder="e.g. 45"
            required
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'listing-price-error' : undefined}
          />
          {errors.price ? (
            <em id="listing-price-error" className="marketplace-field-error">
              {errors.price}
            </em>
          ) : null}
        </label>

        <label className="marketplace-field">
          <span>Description</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            placeholder="Share condition, what’s included, and why you’re selling."
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'listing-description-error' : undefined}
          />
          {errors.description ? (
            <em id="listing-description-error" className="marketplace-field-error">
              {errors.description}
            </em>
          ) : null}
        </label>

        <div className="marketplace-field">
          <span>Location</span>
          <div className="marketplace-map-wrap">
            <LocationMapPicker
              brandColor="#A54AFF"
              value={picked}
              onChange={applyPickedLocation}
              height={220}
              autoLocate={!isEdit}
            />
          </div>
          {errors.location ? (
            <em className="marketplace-field-error">{errors.location}</em>
          ) : (
            <span className="marketplace-field-hint">Search or pin the map. City, state, and ZIP fill in from the pin.</span>
          )}
        </div>

        <label className="marketplace-field">
          <span>Location label</span>
          <input
            value={form.locationLabel}
            onChange={(event) => set('locationLabel', event.target.value)}
            placeholder="Austin, TX"
            required
            aria-invalid={Boolean(errors.locationLabel)}
            aria-describedby={errors.locationLabel ? 'listing-location-label-error' : undefined}
          />
          {errors.locationLabel ? (
            <em id="listing-location-label-error" className="marketplace-field-error">
              {errors.locationLabel}
            </em>
          ) : null}
        </label>

        <div className="marketplace-location-grid">
          <label className="marketplace-field">
            <span>City</span>
            <input
              value={form.city}
              onChange={(event) => set('city', event.target.value)}
              placeholder="Austin"
              required
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? 'listing-city-error' : undefined}
            />
            {errors.city ? (
              <em id="listing-city-error" className="marketplace-field-error">
                {errors.city}
              </em>
            ) : null}
          </label>
          <label className="marketplace-field">
            <span>State</span>
            <input
              value={form.state}
              onChange={(event) => set('state', event.target.value)}
              placeholder="TX"
              required
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? 'listing-state-error' : undefined}
            />
            {errors.state ? (
              <em id="listing-state-error" className="marketplace-field-error">
                {errors.state}
              </em>
            ) : null}
          </label>
          <label className="marketplace-field">
            <span>ZIP code</span>
            <input
              value={form.zipCode}
              onChange={(event) => set('zipCode', event.target.value)}
              placeholder="78701"
              required
              aria-invalid={Boolean(errors.zipCode)}
              aria-describedby={errors.zipCode ? 'listing-zip-error' : undefined}
            />
            {errors.zipCode ? (
              <em id="listing-zip-error" className="marketplace-field-error">
                {errors.zipCode}
              </em>
            ) : null}
          </label>
        </div>

        <div className="marketplace-field">
          <span>Photos</span>
          <div
            className={`marketplace-photo-drop${dragging ? ' is-drag' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <p>{isEdit ? 'Update photos' : 'Add photos'}</p>
            <span>
              Up to {MAX_MARKETPLACE_LISTING_IMAGES} images. Keep current photos or add new ones.
            </span>
            <button
              type="button"
              className="marketplace-photo-upload"
              onClick={() => fileRef.current?.click()}
            >
              Choose photos
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="marketplace-photo-input"
              aria-label="Listing photos"
              onChange={onFileChange}
            />
          </div>
          {errors.images ? (
            <em className="marketplace-field-error">{errors.images}</em>
          ) : null}
          {photos.length > 0 ? (
            <ul className="marketplace-photo-grid">
              {photos.map((photo, index) => (
                <li key={photo.id} className="marketplace-photo-thumb">
                  <img src={photo.url} alt="" />
                  <button
                    type="button"
                    className="marketplace-photo-remove"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removePhoto(index)}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          className="marketplace-post-btn"
          disabled={saving}
          style={{
            justifyContent: 'center',
            width: '100%',
            background: saving ? '#D0D5DD' : GRAD,
            padding: '14px 20px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save changes' : 'Publish ad'}
        </button>
      </form>
    </div>
  );
}
