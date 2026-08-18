import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { api } from '@/lib/axios';
import { getAuthToken } from '@/lib/storeAccess';

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  body?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  skipErrorToast?: boolean;
};

type AuthTokenState = {
  auth?: {
    token?: string | null;
  };
};

export const axiosBaseQuery =
  (): BaseQueryFn<string | AxiosBaseQueryArgs, unknown, unknown> =>
  async (args, { getState }) => {
    const request: AxiosBaseQueryArgs =
      typeof args === 'string' ? { url: args, method: 'GET' } : args;

    const token =
      (getState() as AuthTokenState).auth?.token || getAuthToken();

    try {
      const result = await api({
        url: request.url,
        method: request.method ?? 'GET',
        data: request.data ?? request.body,
        params: request.params,
        headers: {
          ...request.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        skipErrorToast: request.skipErrorToast,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status ?? err.code,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };
