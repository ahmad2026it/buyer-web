import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginBuyerRequest, LoginBuyerResponse } from "./authTypes";
import { api, getAxiosErrorMessage } from "@/lib/axios";
import { getOrCreateDeviceId } from "./authAPI";

export const loginBuyer = createAsyncThunk<
  LoginBuyerResponse,
  LoginBuyerRequest,
  { rejectValue: string }
>("auth/loginBuyer", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<LoginBuyerResponse>("/api/buyer/auth/login", {
      email: payload.email,
      password: payload.password,
      deviceId: payload.deviceId ?? getOrCreateDeviceId(),
      deviceType: payload.deviceType ?? "web",
      ...(payload.fcmToken ? { fcmToken: payload.fcmToken } : {}),
    });

    return data;
  } catch (error) {
    return rejectWithValue(getAxiosErrorMessage(error));
  }
});
