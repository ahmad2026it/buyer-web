import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './authTypes';
import { loginBuyer } from './authThunk';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
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
      state.loading = false;
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
        state.isAuthenticated = Boolean(token && user);
      })
      .addCase(loginBuyer.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? 'Login failed. Please try again.';
      });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
