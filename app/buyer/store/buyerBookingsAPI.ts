import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ConfirmBuyerBookingPaymentRequest,
  ConfirmBuyerBookingPaymentResponse,
  CreateBuyerBookingRequest,
  CreateBuyerBookingResponse,
  GetBuyerBookingByIdResponse,
  GetBuyerBookingsParams,
  GetBuyerBookingsResponse,
  WithdrawBuyerBookingRequest,
  WithdrawBuyerBookingResponse,
  CancelBuyerBookingRequest,
  CancelBuyerBookingResponse,
  ApproveBuyerBookingCompleteRequest,
  ApproveBuyerBookingCompleteResponse,
  AddBuyerBookingReviewRequest,
  AddBuyerBookingReviewResponse,
  ReportBuyerBookingRequest,
  ReportBuyerBookingResponse,
  GetBuyerBookingReportsParams,
  GetBuyerBookingReportsResponse,
} from "./buyerBookingsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

const buildCreateBookingFormData = (
  payload: CreateBuyerBookingRequest,
): FormData => {
  const formData = new FormData();

  formData.append("favorId", String(payload.favorId));
  formData.append("favorDate", payload.favorDate);
  formData.append("favorTime", payload.favorTime);
  formData.append("details", payload.details);
  formData.append("lat", String(payload.lat));
  formData.append("lng", String(payload.lng));
  formData.append("address", payload.address);
  formData.append(
    "selectedAddOnIndices",
    JSON.stringify(payload.selectedAddOnIndices),
  );
  formData.append("questionAnswers", JSON.stringify(payload.questionAnswers));

  payload.images?.forEach((file) => formData.append("images", file));
  payload.videos?.forEach((file) => formData.append("videos", file));

  return formData;
};

const buildAddReviewFormData = (
  payload: AddBuyerBookingReviewRequest,
): FormData => {
  const formData = new FormData();
  formData.append("booking_id", String(payload.booking_id));
  formData.append("rating", String(payload.rating));
  formData.append("comment", payload.comment);
  payload.images?.forEach((file) => formData.append("images", file));
  payload.videos?.forEach((file) => formData.append("videos", file));
  return formData;
};

const buildReportBookingFormData = (
  payload: ReportBuyerBookingRequest,
): FormData => {
  const formData = new FormData();
  formData.append("booking_id", String(payload.booking_id));
  formData.append("reason_code", payload.reason_code);
  formData.append("message", payload.message);
  payload.images?.forEach((file) => formData.append("images", file));
  payload.videos?.forEach((file) => formData.append("videos", file));
  return formData;
};

export const buyerBookingsAPI = createApi({
  reducerPath: "buyerBookingsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BuyerBookings", "BuyerBookingReports"],
  endpoints: (builder) => ({
    getBuyerBookings: builder.query<
      GetBuyerBookingsResponse,
      GetBuyerBookingsParams
    >({
      query: (params) => ({
        url: "/api/buyer/bookings",
        method: "GET",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          status: params.status,
        },
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "BuyerBookings", id: `LIST-${arg.status}` },
        { type: "BuyerBookings", id: "LIST" },
      ],
    }),
    getBuyerBookingById: builder.query<GetBuyerBookingByIdResponse, number>({
      query: (id) => ({
        url: `/api/buyer/bookings/${id}`,
        method: "GET",
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, id) => [{ type: "BuyerBookings", id }],
    }),
    createBuyerBooking: builder.mutation<
      CreateBuyerBookingResponse,
      CreateBuyerBookingRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/bookings",
        method: "POST",
        body: buildCreateBookingFormData(payload),
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    confirmBuyerBookingPayment: builder.mutation<
      ConfirmBuyerBookingPaymentResponse,
      ConfirmBuyerBookingPaymentRequest
    >({
      query: (body) => ({
        url: "/api/buyer/bookings/confirm-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    withdrawBuyerBooking: builder.mutation<
      WithdrawBuyerBookingResponse,
      WithdrawBuyerBookingRequest
    >({
      query: (body) => ({
        url: "/api/buyer/bookings/withdraw",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    cancelBuyerBooking: builder.mutation<
      CancelBuyerBookingResponse,
      CancelBuyerBookingRequest
    >({
      query: (body) => ({
        url: "/api/buyer/bookings/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    approveBuyerBookingComplete: builder.mutation<
      ApproveBuyerBookingCompleteResponse,
      ApproveBuyerBookingCompleteRequest
    >({
      query: (body) => ({
        url: "/api/buyer/bookings/approve-complete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    addBuyerBookingReview: builder.mutation<
      AddBuyerBookingReviewResponse,
      AddBuyerBookingReviewRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/bookings/add-review",
        method: "POST",
        body: buildAddReviewFormData(payload),
      }),
      invalidatesTags: ["BuyerBookings"],
    }),
    reportBuyerBooking: builder.mutation<
      ReportBuyerBookingResponse,
      ReportBuyerBookingRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/bookings/report",
        method: "POST",
        body: buildReportBookingFormData(payload),
      }),
      invalidatesTags: ["BuyerBookings", "BuyerBookingReports"],
    }),
    getBuyerBookingReports: builder.query<
      GetBuyerBookingReportsResponse,
      GetBuyerBookingReportsParams
    >({
      query: (params) => ({
        url: "/api/buyer/bookings/reports",
        method: "GET",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.status ? { status: params.status } : {}),
        },
        skipErrorToast: true,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "BuyerBookingReports", id: `LIST-${arg.status ?? "all"}` },
        { type: "BuyerBookingReports", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBuyerBookingsQuery,
  useGetBuyerBookingByIdQuery,
  useCreateBuyerBookingMutation,
  useConfirmBuyerBookingPaymentMutation,
  useWithdrawBuyerBookingMutation,
  useCancelBuyerBookingMutation,
  useApproveBuyerBookingCompleteMutation,
  useAddBuyerBookingReviewMutation,
  useReportBuyerBookingMutation,
  useGetBuyerBookingReportsQuery,
} = buyerBookingsAPI;
