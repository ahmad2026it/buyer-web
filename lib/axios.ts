import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { showToast } from '@/lib/toast';
import { getAuthToken } from '@/lib/storeAccess';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  error?: string;
};

const getMessageFromBody = (body: unknown, fallback: string): string => {
  if (typeof body === 'string' && body.trim()) return body;

  if (body && typeof body === 'object') {
    const data = body as ApiErrorBody;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  }

  return fallback;
};

export const getAxiosErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to connect. Please try again.';
    }

    return getMessageFromBody(
      error.response.data,
      error.message || 'Something went wrong. Please try again.',
    );
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return 'Something went wrong. Please try again.';
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    }
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data as ApiErrorBody | undefined;

    if (payload && typeof payload === 'object' && payload.success === false) {
      const message = getMessageFromBody(payload, 'Something went wrong. Please try again.');

      if (!response.config.skipErrorToast) {
        showToast(message, 'error');
      }

      return Promise.reject(
        new AxiosError(
          message,
          AxiosError.ERR_BAD_RESPONSE,
          response.config,
          response.request,
          response,
        ),
      );
    }

    return response;
  },
  (error: AxiosError) => {
    if (!error.config?.skipErrorToast) {
      showToast(getAxiosErrorMessage(error), 'error');
    }

    return Promise.reject(error);
  },
);

export type { AxiosRequestConfig };
