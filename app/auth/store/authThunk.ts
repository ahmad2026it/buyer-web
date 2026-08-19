import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthApiError, LoginBuyerRequest, LoginBuyerResponse } from "./authTypes";
import { api, getAxiosErrorDetails } from "@/lib/axios";
import { getOrCreateDeviceId } from "./authAPI";

export const loginBuyer = createAsyncThunk<
  LoginBuyerResponse,
  LoginBuyerRequest,
  { rejectValue: AuthApiError }
>("auth/loginBuyer", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<LoginBuyerResponse>(
      "/api/buyer/auth/login",
      {
        email: payload.email,
        password: payload.password,
        deviceId: payload.deviceId ?? getOrCreateDeviceId(),
        deviceType: payload.deviceType ?? "web",
        ...(payload.fcmToken ? { fcmToken: payload.fcmToken } : {}),
      },
      { skipErrorToast: true },
    );

    return data;
  } catch (error) {
    return rejectWithValue(getAxiosErrorDetails(error));
  }
});
