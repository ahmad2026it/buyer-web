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

export type BuyerProfileUser = Pick<
  AuthUser,
  | 'id'
  | 'fullName'
  | 'email'
  | 'dateOfBirth'
  | 'gender'
  | 'phoneNumber'
  | 'profileImage'
  | 'userType'
  | 'isAway'
  | 'appNotifications'
  | 'darkMode'
  | 'isBlocked'
  | 'isDeactivated'
  | 'isInactive'
  | 'createdAt'
> & {
  last_seen?: string | null;
  is_online?: boolean;
};

export type BuyerAccountStatus = {
  is_blocked: boolean;
  is_deactivated: boolean;
  is_inactive: boolean;
  is_restricted: boolean;
  message: string | null;
};

export type GetBuyerProfileResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: BuyerProfileUser;
    account_status?: BuyerAccountStatus;
  };
};

export const isBuyerProfileResponse = (
  value: unknown,
): value is GetBuyerProfileResponse => {
  if (!value || typeof value !== 'object' || !('data' in value)) return false;

  const data = value.data;
  if (!data || typeof data !== 'object' || !('user' in data)) return false;

  const user = data.user;
  return Boolean(
    user &&
      typeof user === 'object' &&
      'id' in user &&
      typeof user.id === 'number',
  );
};

export const mergeBuyerProfileUser = (
  current: AuthUser | null,
  incoming: BuyerProfileUser,
): AuthUser => ({
  additionalDetail: current?.additionalDetail ?? null,
  otp: current?.otp ?? null,
  otpExpiry: current?.otpExpiry ?? null,
  otpVerifiedAt: current?.otpVerifiedAt ?? null,
  parentSellerId: current?.parentSellerId ?? null,
  isCompany: current?.isCompany ?? false,
  failedLoginAttempts: current?.failedLoginAttempts,
  loginLockedUntil: current?.loginLockedUntil ?? null,
  lastSeen: incoming.last_seen ?? current?.lastSeen ?? null,
  stripeAccountId: current?.stripeAccountId ?? null,
  stripeCustomerId: current?.stripeCustomerId ?? null,
  stripeOnboardingStatus: current?.stripeOnboardingStatus ?? null,
  fcmToken: current?.fcmToken ?? null,
  deviceId: current?.deviceId ?? null,
  deviceType: current?.deviceType ?? null,
  lastDeviceChangeTime: current?.lastDeviceChangeTime ?? null,
  bookingTermsAcceptedAt: current?.bookingTermsAcceptedAt ?? null,
  bookingTermsVersion: current?.bookingTermsVersion ?? null,
  updatedAt: current?.updatedAt ?? incoming.createdAt,
  last_seen: incoming.last_seen ?? current?.last_seen ?? null,
  is_online: incoming.is_online ?? current?.is_online,
  id: incoming.id,
  email: incoming.email,
  fullName: incoming.fullName,
  dateOfBirth: incoming.dateOfBirth,
  gender: incoming.gender,
  phoneNumber: incoming.phoneNumber,
  profileImage: incoming.profileImage,
  userType: incoming.userType,
  isAway: incoming.isAway,
  isDeactivated: incoming.isDeactivated,
  isBlocked: incoming.isBlocked,
  isInactive: incoming.isInactive,
  appNotifications: incoming.appNotifications,
  darkMode: incoming.darkMode,
  createdAt: incoming.createdAt,
});

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

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
