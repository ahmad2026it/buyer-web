import type { AuthUser, BuyerAccountStatus } from '@/app/auth/store/authTypes';

export const DEFAULT_INACTIVE_ACCOUNT_MESSAGE =
  'Your account is inactive. Please contact support at contactus@whocan-app.com.';

export function isBuyerAccountInactive(
  user: AuthUser | null | undefined,
  accountStatus: BuyerAccountStatus | null | undefined,
): boolean {
  return Boolean(user?.isInactive || accountStatus?.is_inactive);
}

export function getBuyerAccountRestrictionMessage(
  accountStatus: BuyerAccountStatus | null | undefined,
): string {
  const message = accountStatus?.message?.trim();
  return message || DEFAULT_INACTIVE_ACCOUNT_MESSAGE;
}
