'use client';

import { useState } from 'react';
import {
  useSaveMarketplaceListingMutation,
  useUnsaveMarketplaceListingMutation,
} from '@/app/buyer/store/marketplaceListingsAPI';
import type { MarketplaceListing } from '@/lib/marketplace/types';
import { useAppSelector } from '@/store/hooks';

export function useSaveMarketplaceListing() {
  const token = useAppSelector((state) => state.auth.token);
  const [saveListing] = useSaveMarketplaceListingMutation();
  const [unsaveListing] = useUnsaveMarketplaceListingMutation();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const toggleSave = async (listing: MarketplaceListing): Promise<{ needsAuth: boolean }> => {
    if (!token) return { needsAuth: true };
    if (pendingIds.has(listing.id)) return { needsAuth: false };

    setPendingIds((current) => {
      const next = new Set(current);
      next.add(listing.id);
      return next;
    });

    try {
      if (listing.isFavorite) {
        await unsaveListing(listing.id).unwrap();
      } else {
        await saveListing(listing.id).unwrap();
      }
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(listing.id);
        return next;
      });
    }

    return { needsAuth: false };
  };

  return { toggleSave, pendingIds };
}
