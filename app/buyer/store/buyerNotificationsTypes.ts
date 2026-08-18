export type BuyerNotificationActor = {
  id?: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImage?: string | null;
  avatar?: string | null;
} | null;

export type BuyerNotificationPayload = {
  title?: string;
  source?: string;
  description?: string;
  [key: string]: unknown;
};

export type BuyerNotification = {
  id: number;
  title: string;
  description: string;
  message: string;
  key: string;
  payload: BuyerNotificationPayload | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  actorUserId: number | null;
  actor: BuyerNotificationActor;
  visualType: string;
};

export type BuyerNotificationsPagination = {
  total: number;
  page: number;
  limit: number;
};

export type GetBuyerNotificationsParams = {
  page?: number;
  limit?: number;
};

export type GetBuyerNotificationsResponse = {
  success: boolean;
  status: number;
  message?: string;
  data: {
    notifications: BuyerNotification[];
    unreadCount: number;
    pagination: BuyerNotificationsPagination;
  };
};

export type MarkBuyerNotificationReadResponse = {
  success: boolean;
  status: number;
  message?: string;
  data?: unknown;
};

export type MarkAllBuyerNotificationsReadResponse = {
  success: boolean;
  status: number;
  message?: string;
  data?: unknown;
};
