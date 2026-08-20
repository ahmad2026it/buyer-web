export type BookingQuestionAnswer = {
  question: string;
  answer: string;
};

export type CreateBuyerBookingRequest = {
  favorId: number;
  favorDate: string;
  favorTime: string;
  details: string;
  lat: number;
  lng: number;
  address: string;
  selectedAddOnIndices: number[];
  images?: File[];
  videos?: File[];
  questionAnswers: BookingQuestionAnswer[];
};

export type CreatedBooking = {
  id?: number | string;
  booking_id?: number | string;
  bookingId?: number | string;
};

export type CreateBuyerBookingResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: CreatedBooking & {
    booking?: CreatedBooking;
  };
};

export type ConfirmBuyerBookingPaymentRequest = {
  booking_id: number;
  payment_method_id: string;
};

export type ConfirmBuyerBookingPaymentResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type WithdrawBuyerBookingRequest = {
  booking_id: number;
  cancel_reason: string;
};

export type WithdrawBuyerBookingResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type CancelBuyerBookingRequest = {
  booking_id: number;
  cancel_reason: string;
};

export type CancelBuyerBookingResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type ApproveBuyerBookingCompleteRequest = {
  booking_id: number;
};

export type ApproveBuyerBookingCompleteResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type AddBuyerBookingReviewRequest = {
  booking_id: number;
  rating: number;
  comment: string;
  images?: File[];
  videos?: File[];
};

export type AddBuyerBookingReviewResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type ReportBuyerBookingRequest = {
  booking_id: number;
  reason_code: string;
  message: string;
  images?: File[];
  videos?: File[];
};

export type ReportBuyerBookingResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export const BUYER_REPORT_REASON_LABELS: Record<string, string> = {
  feel_unsafe: "I feel unsafe",
  unprofessional_behavior: "Unprofessional behavior",
  didnt_complete_work: "Didn't complete the work",
  damaged_property: "Damaged property",
  no_show: "No-show",
  other: "Other",
};

export const formatBuyerReportReason = (
  reasonCode: string,
  otherReason?: string | null,
): string => {
  if (reasonCode === "other" && otherReason?.trim()) return otherReason.trim();
  return (
    BUYER_REPORT_REASON_LABELS[reasonCode] ??
    reasonCode.replace(/_/g, " ")
  );
};

export const isClosedBuyerReportStatus = (status: string): boolean => {
  const key = status.toLowerCase();
  return key === "closed" || key === "resolved";
};

export const formatBuyerReportStatusLabel = (status: string): "Pending" | "Closed" =>
  isClosedBuyerReportStatus(status) ? "Closed" : "Pending";

export const formatBuyerReportDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getBuyerReportDueDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  date.setTime(date.getTime() + 72 * 60 * 60 * 1000);
  return formatBuyerReportDate(date.toISOString());
};

export type BuyerBookingReportStatus = "open" | "closed";

export type BuyerBookingReportFavor = {
  id: number;
  title: string;
  budget: string;
  type: string;
  favorType: string;
  coverImage: string | null;
};

export type BuyerBookingReportBooking = {
  id: number;
  status: string;
  favorDate: string;
  favorTime: string;
  totalPrice: string;
};

export type BuyerBookingReport = {
  id: number;
  ticketNo: number;
  status: string;
  createdAt: string;
  bookingId: number;
  reasonCode: string;
  otherReason: string | null;
  message: string;
  images: string[];
  videos: string[];
  disputedFavor: BuyerBookingReportFavor | null;
  seller: BuyerBookingSeller | null;
  booking: BuyerBookingReportBooking | null;
};

export type GetBuyerBookingReportsParams = {
  page?: number;
  limit?: number;
  status?: BuyerBookingReportStatus;
};

export type GetBuyerBookingReportsResponse = {
  success: boolean;
  message?: string;
  data: {
    reports: BuyerBookingReport[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages?: number;
    };
  };
};

export type BuyerBookingListStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "requests"
  | "history";

export type BuyerBookingListTab = Exclude<
  BuyerBookingListStatus,
  "in-progress" | "completed"
>;

export type GetBuyerBookingsParams = {
  page?: number;
  limit?: number;
  status: BuyerBookingListStatus;
};

export const normalizeBookingStatus = (status: string): string =>
  status.toLowerCase().replace(/[-_\s]/g, "");

export const isInProgressBookingStatus = (status: string): boolean =>
  ["inprogress", "started", "active", "ongoing", "working"].includes(
    normalizeBookingStatus(status),
  );

export const isUpcomingBookingStatus = (status: string): boolean =>
  ["upcoming", "accepted", "confirmed", "scheduled", "approved"].includes(
    normalizeBookingStatus(status),
  );

export const isAwaitingCompleteBookingStatus = (status: string): boolean => {
  const key = normalizeBookingStatus(status);
  return (
    key === "complete" ||
    key === "completed" ||
    [
      "awaitingcomplete",
      "pendingcomplete",
      "sellercomplete",
      "completionrequested",
    ].includes(key)
  );
};

export const isFinishedBookingStatus = (status: string): boolean => {
  const key = normalizeBookingStatus(status);
  return [
    "buyerapproved",
    "reviewed",
    "done",
    "finished",
  ].includes(key);
};

export const isActiveListingBookingStatus = (status: string): boolean =>
  isInProgressBookingStatus(status) ||
  isUpcomingBookingStatus(status) ||
  isAwaitingCompleteBookingStatus(status);

export type BuyerBookingAddOn = {
  id?: number | string;
  name?: string;
  title?: string;
  label?: string;
  description?: string;
  price?: string | number;
};

export type BuyerBookingFavor = {
  id: number;
  title: string;
  budget: string;
  userId: number;
  favorType: string;
  type?: string;
  description?: string;
  images?: string[];
  videos?: string[];
  favorImage?: string | null;
  addOns?: BuyerBookingAddOn[];
  lat?: string | number | null;
  lng?: string | number | null;
};

export type BuyerBookingSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
};

export type BuyerBookingBuyer = {
  id: number;
  fullName: string;
  profileImage: string | null;
  email?: string;
};

export type BuyerBookingReview = {
  id?: number;
  rating?: number;
  comment?: string;
  text?: string;
  review?: string;
} | null;

export type BuyerBooking = {
  id: number;
  favorId: number;
  buyerUserId: number;
  sellerUserId: number;
  favorDate: string;
  favorTime: string;
  details: string;
  lat: string;
  lng: string;
  address: string;
  totalPrice: string;
  sellerAmount: string;
  platformFeeAmount: string;
  boostControlId: number | null;
  boostDiscountPercent: number | string | null;
  boostDiscountAmount: string;
  selectedAddOns: BuyerBookingAddOn[] | unknown[];
  questionAnswers: BookingQuestionAnswer[];
  status: string;
  paymentIntent: string | null;
  stripeCustomerId: string | null;
  paymentStatus: string;
  cancelReason: string | null;
  images: string[];
  videos: string[];
  isBuyerComing: boolean;
  createdAt: string;
  updatedAt: string;
  favor: BuyerBookingFavor | null;
  seller: BuyerBookingSeller | null;
  buyer?: BuyerBookingBuyer | null;
};

export const mergeBuyerBookings = (
  ...groups: Array<BuyerBooking[] | undefined>
): BuyerBooking[] => {
  const seen = new Set<number>();
  const merged: BuyerBooking[] = [];

  groups.forEach((group) => {
    group?.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      merged.push(item);
    });
  });

  return merged.sort((a, b) => {
    const rank = (status: string) => {
      if (isInProgressBookingStatus(status)) return 0;
      if (isAwaitingCompleteBookingStatus(status)) return 1;
      return 2;
    };
    return rank(a.status) - rank(b.status);
  });
};

export type BuyerBookingsPagination = {
  total: number;
  page: number;
  limit: number;
};

export type GetBuyerBookingsResponse = {
  success: boolean;
  message?: string;
  data: {
    bookings: BuyerBooking[];
    pagination: BuyerBookingsPagination;
  };
};

export type GetBuyerBookingByIdResponse = {
  success: boolean;
  message?: string;
  data: {
    booking: BuyerBooking;
    review: BuyerBookingReview;
  };
};

const asBookingId = (value: unknown): number | null => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const extractBookingId = (
  response: CreateBuyerBookingResponse | undefined,
): number | null => {
  if (!response) return null;

  const data = response.data;
  const nested = data?.booking;

  return (
    asBookingId((response as { booking_id?: unknown }).booking_id) ??
    asBookingId((response as { bookingId?: unknown }).bookingId) ??
    asBookingId((response as { id?: unknown }).id) ??
    asBookingId(data?.booking_id) ??
    asBookingId(data?.bookingId) ??
    asBookingId(data?.id) ??
    asBookingId(nested?.booking_id) ??
    asBookingId(nested?.bookingId) ??
    asBookingId(nested?.id)
  );
};
