import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  isBuyerProfileResponse,
  type AuthApiError,
  type GetBuyerProfileResponse,
  type LoginBuyerRequest,
  type LoginBuyerResponse,
} from "./authTypes";
import { api, getAxiosErrorDetails } from "@/lib/axios";
import { getMachineIdentity } from "@/lib/machineKey";
import { getAuthToken } from "@/lib/storeAccess";

export const loginBuyer = createAsyncThunk<
  LoginBuyerResponse,
  LoginBuyerRequest,
  { rejectValue: AuthApiError }
>("auth/loginBuyer", async (payload, { rejectWithValue }) => {
  try {
    const identity = await getMachineIdentity();
    const { data } = await api.post<LoginBuyerResponse>(
      "/api/buyer/auth/login",
      {
        email: payload.email,
        password: payload.password,
        deviceId: payload.deviceId ?? identity.machineKey,
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

export const fetchBuyerProfile = createAsyncThunk<
  GetBuyerProfileResponse,
  void,
  { rejectValue: AuthApiError }
>(
  "auth/fetchBuyerProfile",
  async (_, { rejectWithValue, signal }) => {
    try {
      const { data } = await api.get<GetBuyerProfileResponse>(
        "/api/buyer/profile",
        { skipErrorToast: true, signal },
      );

      if (!isBuyerProfileResponse(data)) {
        return rejectWithValue({
          message: "Unable to load account information.",
          fieldErrors: {},
        });
      }

      return data;
    } catch (error) {
      const body = axios.isAxiosError(error) ? error.response?.data : undefined;
      if (isBuyerProfileResponse(body)) {
        return body;
      }

      return rejectWithValue(getAxiosErrorDetails(error));
    }
  },
  {
    condition: () => Boolean(getAuthToken()),
  },
);
