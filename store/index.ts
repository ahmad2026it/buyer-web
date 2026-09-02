import { combineReducers, configureStore, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { authAPI } from '@/app/auth/store/authAPI';
import authReducer, { logout } from '@/app/auth/store/authSlice';
import { buyerBillingAPI } from '@/app/buyer/store/buyerBillingAPI';
import { buyerBookingsAPI } from '@/app/buyer/store/buyerBookingsAPI';
import { buyerConversationsAPI } from '@/app/buyer/store/buyerConversationsAPI';
import { buyerDisputeSupportAPI } from '@/app/buyer/store/buyerDisputeSupportAPI';
import { buyerCategoriesAPI } from '@/app/buyer/store/buyerCategoriesAPI';
import { buyerCustomFavorsAPI } from '@/app/buyer/store/buyerCustomFavorsAPI';
import { buyerFavorsAPI } from '@/app/buyer/store/buyerFavorsAPI';
import { buyerLocationsAPI } from '@/app/buyer/store/buyerLocationsAPI';
import { buyerSellersAPI } from '@/app/buyer/store/buyerSellersAPI';
import { buyerNotificationsAPI } from '@/app/buyer/store/buyerNotificationsAPI';
import { buyerStripeAPI } from '@/app/buyer/store/buyerStripeAPI';
import { buyerLegalAPI } from '@/app/buyer/store/buyerLegalAPI';
import { buyerBlogsAPI } from '@/app/buyer/store/buyerBlogsAPI';
import { disconnectBuyerSocket } from '@/lib/buyerSocket';
import { purgePersistedClientState } from '@/lib/storeAccess';

type PersistStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<string>;
  removeItem: (key: string) => Promise<void>;
};

const createNoopStorage = (): PersistStorage => ({
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
});

const storage =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('redux-persist/lib/storage').default as PersistStorage)
    : createNoopStorage();

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated', 'accountStatus'] as string[],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [authAPI.reducerPath]: authAPI.reducer,
  [buyerBillingAPI.reducerPath]: buyerBillingAPI.reducer,
  [buyerBookingsAPI.reducerPath]: buyerBookingsAPI.reducer,
  [buyerConversationsAPI.reducerPath]: buyerConversationsAPI.reducer,
  [buyerDisputeSupportAPI.reducerPath]: buyerDisputeSupportAPI.reducer,
  [buyerCategoriesAPI.reducerPath]: buyerCategoriesAPI.reducer,
  [buyerCustomFavorsAPI.reducerPath]: buyerCustomFavorsAPI.reducer,
  [buyerFavorsAPI.reducerPath]: buyerFavorsAPI.reducer,
  [buyerLocationsAPI.reducerPath]: buyerLocationsAPI.reducer,
  [buyerSellersAPI.reducerPath]: buyerSellersAPI.reducer,
  [buyerNotificationsAPI.reducerPath]: buyerNotificationsAPI.reducer,
  [buyerStripeAPI.reducerPath]: buyerStripeAPI.reducer,
  [buyerLegalAPI.reducerPath]: buyerLegalAPI.reducer,
  [buyerBlogsAPI.reducerPath]: buyerBlogsAPI.reducer,
});

const rtkQueryApis = [
  authAPI,
  buyerBillingAPI,
  buyerBookingsAPI,
  buyerConversationsAPI,
  buyerDisputeSupportAPI,
  buyerCategoriesAPI,
  buyerCustomFavorsAPI,
  buyerFavorsAPI,
  buyerLocationsAPI,
  buyerSellersAPI,
  buyerNotificationsAPI,
  buyerStripeAPI,
  buyerLegalAPI,
  buyerBlogsAPI,
] as const;

const logoutMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (!logout.match(action)) {
    return next(action);
  }

  disconnectBuyerSocket();
  purgePersistedClientState();

  const result = next(action);

  for (const apiSlice of rtkQueryApis) {
    storeApi.dispatch(apiSlice.util.resetApiState());
  }

  return result;
};

export const makeStore = () => {
  const store = configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload.timestamp'],
          ignoredPaths: ['authAPI.mutations'],
        },
      }).prepend(logoutMiddleware).concat(
        authAPI.middleware,
        buyerBillingAPI.middleware,
        buyerBookingsAPI.middleware,
        buyerConversationsAPI.middleware,
        buyerDisputeSupportAPI.middleware,
        buyerCategoriesAPI.middleware,
        buyerCustomFavorsAPI.middleware,
        buyerFavorsAPI.middleware,
        buyerLocationsAPI.middleware,
        buyerSellersAPI.middleware,
        buyerNotificationsAPI.middleware,
        buyerStripeAPI.middleware,
        buyerLegalAPI.middleware,
        buyerBlogsAPI.middleware,
      ),
  });

  setupListeners(store.dispatch);
  const persistor = persistStore(store);
  return { store, persistor };
};

export type AppStore = ReturnType<typeof makeStore>['store'];
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
