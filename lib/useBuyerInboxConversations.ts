'use client';

import { useMemo } from 'react';
import {
  BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS,
  BUYER_LISTING_CONVERSATIONS_LIST_PARAMS,
  useGetBuyerConversationsQuery,
} from '@/app/buyer/store/buyerConversationsAPI';
import type { BuyerConversation } from '@/app/buyer/store/buyerConversationsTypes';

type InboxOptions = {
  skip?: boolean;
  pollingInterval?: number;
};

export function useBuyerInboxConversations(options?: InboxOptions) {
  const bookingQuery = useGetBuyerConversationsQuery(
    BUYER_BOOKING_CONVERSATIONS_LIST_PARAMS,
    options,
  );
  const listingQuery = useGetBuyerConversationsQuery(
    BUYER_LISTING_CONVERSATIONS_LIST_PARAMS,
    options,
  );

  const bookingConversations = bookingQuery.data?.data?.conversations ?? [];
  const listingConversations = listingQuery.data?.data?.conversations ?? [];

  const conversations = useMemo(() => {
    const seen = new Set<number>();
    const merged: BuyerConversation[] = [];
    for (const item of [...bookingConversations, ...listingConversations]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
    return merged;
  }, [bookingConversations, listingConversations]);

  return {
    bookingQuery,
    listingQuery,
    bookingConversations,
    listingConversations,
    conversations,
  };
}
