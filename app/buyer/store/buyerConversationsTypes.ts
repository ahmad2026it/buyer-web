export type BuyerConversationParticipant = {
  id: number;
  fullName: string;
  profileImage: string | null;
  userType: string;
  isOnline: boolean;
};

export type BuyerConversationFavor = {
  id: number;
  title: string;
  images: string[];
};

export type BuyerConversationBooking = {
  id: number;
  status: string;
  favorId: number;
  favor: BuyerConversationFavor;
};

export type BuyerConversationLastMessage = {
  at: string;
  preview: string;
  senderUserId: number;
};

export type BuyerConversation = {
  id: number;
  favorBookingId: number;
  buyerUserId: number;
  sellerUserId: number;
  otherParticipant: BuyerConversationParticipant;
  bookingStatus: string;
  canSend: boolean;
  booking: BuyerConversationBooking;
  lastMessage: BuyerConversationLastMessage | null;
  myLastReadMessageId: number | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GetBuyerConversationsParams = {
  page?: number;
  limit?: number;
};

export type GetBuyerConversationsResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: {
    conversations: BuyerConversation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
};

export type StartBuyerConversationByBookingResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: {
    conversation: BuyerConversation;
  };
};

export type SendBuyerConversationMessageRequest = {
  conversationId: number;
  body: string;
  clientMsgId: string;
};

export type BuyerConversationMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  body: string;
  attachments: string[];
  clientMsgId: string;
  createdAt: string;
  updatedAt: string;
};

export type BuyerConversationMessagesParticipant = {
  id: number;
  name: string;
  image: string | null;
  isOnline: boolean;
};

export type GetBuyerConversationMessagesParams = {
  conversationId: number;
  limit?: number;
  cursor?: string | null;
};

export type GetBuyerConversationMessagesResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: {
    conversationId: number;
    favorBookingId: number;
    bookingStatus: string;
    otherParticipant: BuyerConversationMessagesParticipant;
    messages: BuyerConversationMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type SendBuyerConversationMessageResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data?: {
    message?: BuyerConversationMessage;
  };
};

export type MarkBuyerConversationReadRequest = {
  conversationId: number;
  messageId: number;
};

export type MarkBuyerConversationReadResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data?: unknown;
};
