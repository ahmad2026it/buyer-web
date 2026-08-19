import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  AuthMessageResponse,
  ForgotPasswordRequest,
  ResetOtpRequest,
  ResetPasswordRequest,
  UpdateBuyerProfileRequest,
  UpdateBuyerProfileResponse,
  VerifyOtpRequest,
} from "./authTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

const DEVICE_ID_KEY = "whoCan_deviceId";

export const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") return "server";

  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};

export type RegisterBuyerRequest = {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  deviceId?: string;
  deviceType?: string;
  additionalDetail?: string;
  label?: string;
  profileImage?: File;
  location?: string;
  lat?: string | number;
  lng?: string | number;
  locationDetail?: string;
};

export type RegisterBuyerResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

const appendIfPresent = (
  formData: FormData,
  key: string,
  value: string | number | File | undefined | null,
) => {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, value instanceof File ? value : String(value));
};

const buildRegisterFormData = (payload: RegisterBuyerRequest): FormData => {
  const formData = new FormData();

  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("fullName", payload.fullName);
  formData.append("dateOfBirth", payload.dateOfBirth);
  formData.append("gender", payload.gender);
  formData.append("phoneNumber", payload.phoneNumber);
  formData.append("deviceId", payload.deviceId ?? getOrCreateDeviceId());
  formData.append("deviceType", payload.deviceType ?? "web");

  appendIfPresent(formData, "additionalDetail", payload.additionalDetail);
  appendIfPresent(formData, "label", payload.label);
  appendIfPresent(formData, "profileImage", payload.profileImage);
  appendIfPresent(formData, "location", payload.location);
  appendIfPresent(formData, "lat", payload.lat);
  appendIfPresent(formData, "lng", payload.lng);
  appendIfPresent(formData, "locationDetail", payload.locationDetail);

  return formData;
};

const buildUpdateProfileFormData = (
  payload: UpdateBuyerProfileRequest,
): FormData => {
  const formData = new FormData();

  formData.append("fullName", payload.fullName);
  formData.append("dateOfBirth", payload.dateOfBirth);
  formData.append("gender", payload.gender);
  formData.append("phoneNumber", payload.phoneNumber);
  appendIfPresent(formData, "profileImage", payload.profileImage);

  return formData;
};

export const authAPI = createApi({
  reducerPath: "authAPI",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    registerBuyer: builder.mutation<
      RegisterBuyerResponse,
      RegisterBuyerRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/auth/register",
        method: "POST",
        body: buildRegisterFormData(payload),
      }),
    }),
    updateBuyerProfile: builder.mutation<
      UpdateBuyerProfileResponse,
      UpdateBuyerProfileRequest
    >({
      query: (payload) => ({
        url: "/api/buyer/auth/update-profile",
        method: "PUT",
        body: buildUpdateProfileFormData(payload),
      }),
    }),
    forgotPassword: builder.mutation<AuthMessageResponse, ForgotPasswordRequest>(
      {
        query: (body) => ({
          url: "/api/buyer/auth/forgot-password",
          method: "POST",
          body,
        }),
      },
    ),
    verifyOtp: builder.mutation<AuthMessageResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/buyer/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetOtp: builder.mutation<AuthMessageResponse, ResetOtpRequest>({
      query: (body) => ({
        url: "/api/buyer/auth/reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/buyer/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterBuyerMutation,
  useUpdateBuyerProfileMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetOtpMutation,
  useResetPasswordMutation,
} = authAPI;
