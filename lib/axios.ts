import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getAppStore, getAuthToken } from '@/lib/storeAccess';
import { showToast } from '@/lib/toast';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

type ApiFieldError = {
  field?: string;
  message?: string;
};

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: ApiFieldError[];
};

export type AxiosErrorDetails = {
  message: string;
  fieldErrors: Record<string, string>;
};

const getErrorBody = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) return error.response?.data;
  if (error && typeof error === 'object' && 'data' in error) {
    return (error as { data?: unknown }).data;
  }
  return error;
};

const getFieldErrorsFromBody = (body: unknown): Record<string, string> => {
  if (!body || typeof body !== 'object') return {};

  const errors = (body as ApiErrorBody).errors;
  if (!Array.isArray(errors)) return {};

  const mapped: Record<string, string> = {};
  for (const item of errors) {
    if (!item || typeof item !== 'object') continue;
    const field = typeof item.field === 'string' ? item.field.trim() : '';
    const message = typeof item.message === 'string' ? item.message.trim() : '';
    if (field && message && !mapped[field]) {
      mapped[field] = message;
    }
  }
  return mapped;
};

const getMessageFromBody = (body: unknown, fallback: string): string => {
  if (typeof body === 'string' && body.trim()) return body;

  const fieldErrors = getFieldErrorsFromBody(body);
  const fieldMessages = Object.values(fieldErrors);
  if (fieldMessages.length === 1) return fieldMessages[0];
  if (fieldMessages.length > 1) return fieldMessages.join('. ');

  if (body && typeof body === 'object') {
    const data = body as ApiErrorBody;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  }

  return fallback;
};

export const getAxiosErrorDetails = (error: unknown): AxiosErrorDetails => {
  if (typeof error === 'string' && error.trim()) {
    return { message: error, fieldErrors: {} };
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'fieldErrors' in error &&
    typeof (error as AxiosErrorDetails).message === 'string'
  ) {
    const details = error as AxiosErrorDetails;
    return {
      message: details.message,
      fieldErrors:
        details.fieldErrors && typeof details.fieldErrors === 'object'
          ? details.fieldErrors
          : {},
    };
  }

  if (axios.isAxiosError(error) && !error.response) {
    return {
      message: 'Unable to connect. Please try again.',
      fieldErrors: {},
    };
  }

  const body = getErrorBody(error);
  const fallback =
    axios.isAxiosError(error)
      ? error.message || 'Something went wrong. Please try again.'
      : 'Something went wrong. Please try again.';

  return {
    message: getMessageFromBody(body, fallback),
    fieldErrors: getFieldErrorsFromBody(body),
  };
};

export const getAxiosErrorMessage = (error: unknown): string => {
  return getAxiosErrorDetails(error).message;
};

const isPublicAuthRequest = (url?: string): boolean => {
  if (!url) return false;
  return /\/api\/buyer\/auth\/(login|register|forgot-password|verify-otp|reset-otp|reset-password)/.test(
    url,
  );
};

const isPublicLegalRequest = (url?: string): boolean => {
  return Boolean(
    url &&
      (/\/api\/buyer\/legal\//.test(url) ||
        /\/api\/public\/(privacy-policy|terms-and-conditions|blogs)/.test(url)),
  );
};

const isChangePasswordCredentialError = (url?: string, body?: unknown): boolean => {
  if (!url?.includes('/api/buyer/auth/change-password')) return false;
  const message = getMessageFromBody(body, '').toLowerCase();
  const fieldErrors = getFieldErrorsFromBody(body);
  return (
    Boolean(fieldErrors.currentPassword || fieldErrors.password) ||
    /password|credential|current/.test(message)
  );
};

const logoutOnUnauthorized = (): void => {
  getAppStore()?.dispatch({ type: 'auth/logout' });

  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/auth/')) return;
  window.location.replace('/auth/login');
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
    const isUnauthorized =
      error.response?.status === 401 &&
      !isPublicAuthRequest(error.config?.url) &&
      !isPublicLegalRequest(error.config?.url) &&
      !isChangePasswordCredentialError(error.config?.url, error.response?.data);

    if (isUnauthorized) {
      logoutOnUnauthorized();
    } else if (!error.config?.skipErrorToast) {
      showToast(getAxiosErrorMessage(error), 'error');
    }

    return Promise.reject(error);
  },
);

export type { AxiosRequestConfig };
