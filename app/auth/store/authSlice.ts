import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mergeBuyerProfileUser, type AuthUser, type BuyerAccountStatus } from './authTypes';
import { fetchBuyerProfile, loginBuyer } from './authThunk';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  accountStatus: BuyerAccountStatus | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  accountStatus: null,
  loading: false,
  profileLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.accountStatus = null;
      state.loading = false;
      state.profileLoading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token && action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginBuyer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginBuyer.fulfilled, (state, action) => {
        const { token, user } = action.payload.data;
        state.loading = false;
        state.error = null;
        state.token = token;
        state.user = user;
        state.accountStatus = null;
        state.isAuthenticated = Boolean(token && user);
      })
      .addCase(loginBuyer.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.accountStatus = null;
        state.error = action.payload?.message ?? 'Login failed. Please try again.';
      })
      .addCase(fetchBuyerProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchBuyerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (!state.token) return;

        const { user, account_status: accountStatus } = action.payload.data;
        state.user = mergeBuyerProfileUser(state.user, user);
        state.accountStatus = accountStatus ?? null;
        state.isAuthenticated = Boolean(state.token && state.user);
        state.error = null;
      })
      .addCase(fetchBuyerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        if (action.meta.aborted) return;
        state.error =
          action.payload?.message ?? 'Unable to load account information.';
      });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;

type AuthRootState = { auth: AuthState };

export const selectAuthToken = (state: AuthRootState) => state.auth.token;
export const selectAuthUser = (state: AuthRootState) => state.auth.user;
export const selectIsAuthenticated = (state: AuthRootState) => state.auth.isAuthenticated;
export const selectAccountStatus = (state: AuthRootState) =>
  state.auth.accountStatus ?? null;
export const selectProfileLoading = (state: AuthRootState) => state.auth.profileLoading;
