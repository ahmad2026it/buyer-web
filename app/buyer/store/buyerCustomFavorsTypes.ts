export type CustomFavorAddOn = {
  description: string;
  price: number;
};

export type CreateBuyerCustomFavorRequest = {
  type: string;
  title: string;
  description: string;
  budget: string | number;
  dateTime: string;
  lat: string | number;
  lng: string | number;
  locationId: number;
  addOns?: CustomFavorAddOn[];
  questions?: string[];
  invitedSellerIds?: number[];
  images?: File[];
  videos?: File[];
  sellersRequired?: number;
};

export type CreatedCustomFavor = {
  id?: number;
  favor?: { id?: number };
  customFavor?: { id?: number };
};

export type CreateBuyerCustomFavorResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: CreatedCustomFavor;
};

export type BuyerCustomFavorUser = {
  id: number;
  fullName: string;
  profileImage: string | null;
  phoneNumber?: string | null;
};

export type BuyerCustomFavorLocation = {
  id: number;
  userId?: number;
  location: string;
  lat: string | number;
  lng: string | number;
  locationDetail: string | null;
  floor: string | null;
  label: string | null;
  isSelected: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BuyerCustomFavor = {
  id: number;
  favorType: string;
  userId: number;
  locationId: number | null;
  invitedSellerIds: number[];
  type: string;
  title: string;
  description: string;
  budget: string | number;
  dateTime: string | null;
  lat: string | number | null;
  lng: string | number | null;
  images: string[];
  videos: string[];
  addOns: unknown[];
  questions: unknown[];
  categoryId: number | null;
  subCategoryIds: number[];
  isHidden: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  user?: BuyerCustomFavorUser | null;
  favorLocation: BuyerCustomFavorLocation | null;
  location?: {
    id: number;
    location: string;
    lat: number | string;
    lng: number | string;
    locationDetail: string | null;
    floor: string | null;
    label: string | null;
    isSelected: boolean;
  } | null;
  requestCount?: number;
  requests?: number;
  isExpired?: boolean;
  isBooked?: boolean;
  status?: string | null;
  hires?: number;
  hiredCount?: number;
  sellersRequired?: number;
};

export type BuyerCustomFavorsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BuyerCustomFavorOfferStatus = "active" | "history";

export type GetBuyerCustomFavorsParams = {
  status?: BuyerCustomFavorOfferStatus;
  page?: number;
  limit?: number;
};

export type GetBuyerCustomFavorsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    offers: BuyerCustomFavor[];
    pagination: BuyerCustomFavorsPagination;
  };
};

export type BuyerCustomFavorRequestSeller = {
  id: number;
  fullName: string;
  profileImage: string | null;
};

export type BuyerCustomFavorRequest = {
  id: number;
  favorId: number;
  buyerUserId: number;
  sellerUserId: number;
  favorDate: string;
  favorTime: string;
  details: string;
  lat: string | number | null;
  lng: string | number | null;
  address: string;
  totalPrice: string | number;
  sellerAmount: string | number;
  platformFeeAmount: string | number;
  boostControlId?: number | null;
  boostDiscountPercent?: number | null;
  boostDiscountAmount?: string | number | null;
  selectedAddOns: unknown[];
  questionAnswers: unknown[];
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
  seller: BuyerCustomFavorRequestSeller | null;
};

export type GetBuyerCustomFavorByIdResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    favor: BuyerCustomFavor;
    requests: BuyerCustomFavorRequest[];
  };
};

export type AcceptBuyerCustomFavorRequestRequest = {
  booking_id: number;
  payment_method_id: string;
  favorId?: number;
};

export type AcceptBuyerCustomFavorRequestResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type RejectBuyerCustomFavorRequestRequest = {
  booking_id: number;
  cancel_reason: string;
  favorId?: number;
};

export type RejectBuyerCustomFavorRequestResponse = {
  success: boolean;
  status?: number;
  message: string;
  data?: unknown;
};

export type CustomFavorListStatus = "Active" | "Completed" | "Expired" | "Cancelled";

const toCount = (value: unknown): number => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

export const formatCustomFavorCategory = (type?: string | null): string => {
  const value = type?.trim();
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatCustomFavorBudget = (budget: string | number | null | undefined): string => {
  const amount = Number(budget);
  if (!Number.isFinite(amount)) return "$0";
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
};

export const formatCustomFavorDueDate = (dateTime?: string | null): string => {
  if (!dateTime) return "—";
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatCustomFavorTime = (dateTime?: string | null): string => {
  if (!dateTime) return "—";
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getCustomFavorLocationLabel = (favor: BuyerCustomFavor): string =>
  favor.location?.location?.trim()
  || favor.favorLocation?.location?.trim()
  || favor.location?.locationDetail?.trim()
  || favor.favorLocation?.locationDetail?.trim()
  || "—";

export const resolveCustomFavorStatus = (
  favor: BuyerCustomFavor,
): CustomFavorListStatus => {
  const raw = (favor.status ?? "").toLowerCase().trim();
  if (["completed", "complete", "done", "booked"].includes(raw)) return "Completed";
  if (["cancelled", "canceled"].includes(raw)) return "Cancelled";
  if (["expired"].includes(raw)) return "Expired";
  if (["active", "open", "pending"].includes(raw)) return "Active";
  if (favor.isBooked) return "Completed";
  if (favor.isHidden) return "Cancelled";
  if (favor.isExpired) return "Expired";
  if (favor.dateTime) {
    const due = new Date(favor.dateTime).getTime();
    if (Number.isFinite(due) && due < Date.now()) return "Expired";
  }
  return "Active";
};

export const getCustomFavorRequestCount = (favor: BuyerCustomFavor): number =>
  toCount(favor.requestCount ?? favor.requests);

export const getCustomFavorHires = (favor: BuyerCustomFavor): number => {
  const hired = toCount(favor.hires ?? favor.hiredCount);
  if (hired > 0) return hired;
  return favor.isBooked ? 1 : 0;
};

export const getCustomFavorSellersRequired = (favor: BuyerCustomFavor): number => {
  const required = toCount(favor.sellersRequired);
  if (required > 0) return required;
  return Math.max(1, favor.invitedSellerIds?.length ?? 1);
};
