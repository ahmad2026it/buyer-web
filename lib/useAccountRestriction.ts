'use client';

import {
  selectAccountStatus,
  selectAuthUser,
} from '@/app/auth/store/authSlice';
import {
  getBuyerAccountRestrictionMessage,
  isBuyerAccountInactive,
} from '@/lib/accountRestrictions';
import { showWarning } from '@/lib/swal';
import { useAppSelector } from '@/store/hooks';

export function useAccountRestriction() {
  const user = useAppSelector(selectAuthUser);
  const accountStatus = useAppSelector(selectAccountStatus);
  const isInactive = isBuyerAccountInactive(user, accountStatus);
  const message = getBuyerAccountRestrictionMessage(accountStatus);

  const guardActiveAccount = (): boolean => {
    if (!isInactive) return true;
    void showWarning('Account inactive', message);
    return false;
  };

  return { isInactive, message, guardActiveAccount };
}
