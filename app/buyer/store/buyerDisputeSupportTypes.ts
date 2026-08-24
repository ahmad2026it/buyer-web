export const BUYER_DISPUTE_SUPPORT_MESSAGES_LIMIT = 50;

export type DisputeSupportSenderType = "buyer" | "admin" | "support" | "system" | "unknown";

export type BuyerDisputeSupportParticipant = {
  id: number | null;
  name: string;
  image: string | null;
  senderType: DisputeSupportSenderType;
};

export type BuyerDisputeSupportMessage = {
  id: number;
  disputeId: number;
  threadId: number | null;
  senderUserId: number | null;
  senderType: DisputeSupportSenderType;
  senderName: string;
  senderImage: string | null;
  body: string;
  attachments: string[];
  clientMsgId: string;
  createdAt: string;
  updatedAt: string;
  pending?: boolean;
};

export type GetBuyerDisputeSupportMessagesParams = {
  disputeId: number;
  limit?: number;
  cursor?: string | null;
};

export type GetBuyerDisputeSupportMessagesResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data: {
    disputeId: number;
    threadId: number | null;
    canSend: boolean;
    otherParticipant: BuyerDisputeSupportParticipant | null;
    messages: BuyerDisputeSupportMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type SendBuyerDisputeSupportMessageRequest = {
  disputeId: number;
  body: string;
  clientMsgId: string;
};

export type SendBuyerDisputeSupportMessageResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data?: {
    message?: BuyerDisputeSupportMessage;
  };
};

export type MarkBuyerDisputeSupportReadRequest = {
  disputeId: number;
};

export type MarkBuyerDisputeSupportReadResponse = {
  success: boolean;
  status?: number;
  message?: string;
  data?: unknown;
};
