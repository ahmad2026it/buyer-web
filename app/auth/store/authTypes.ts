export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  additionalDetail: string | null;
  otp: string | null;
  otpExpiry: string | null;
  otpVerifiedAt: string | null;
  profileImage: string | null;
  userType: string;
  parentSellerId: number | null;
  isCompany: boolean;
  isAway: boolean;
  isDeactivated: boolean;
  isBlocked: boolean;
  isInactive: boolean;
  failedLoginAttempts?: number;
  loginLockedUntil?: string | null;
  appNotifications: boolean;
  darkMode: boolean;
  lastSeen: string | null;
  stripeAccountId: string | null;
  stripeCustomerId: string | null;
  stripeOnboardingStatus: string | null;
  fcmToken: string | null;
  deviceId: string | null;
  deviceType: string | null;
  lastDeviceChangeTime: string | null;
  bookingTermsAcceptedAt: string | null;
  bookingTermsVersion: string | null;
  createdAt: string;
  updatedAt: string;
  last_seen?: string | null;
  is_online?: boolean;
};

export type LoginBuyerRequest = {
  email: string;
  password: string;
  fcmToken?: string;
  deviceId?: string;
  deviceType?: string;
};

export type AuthApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

export type LoginBuyerResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type UpdateBuyerProfileRequest = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  profileImage?: File;
};

export type UpdateBuyerProfileResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: AuthUser;
  };
};

export type AuthMessageResponse = {
  success: boolean;
  status: number;
  message: string;
  data?: unknown;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type ResetOtpRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
};
