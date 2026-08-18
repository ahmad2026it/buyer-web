import { combineReducers, configureStore } from '@reduxjs/toolkit';
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
import authReducer from '@/app/auth/store/authSlice';
import { buyerBillingAPI } from '@/app/buyer/store/buyerBillingAPI';
import { buyerBookingsAPI } from '@/app/buyer/store/buyerBookingsAPI';
import { buyerConversationsAPI } from '@/app/buyer/store/buyerConversationsAPI';
import { buyerCategoriesAPI } from '@/app/buyer/store/buyerCategoriesAPI';
import { buyerFavorsAPI } from '@/app/buyer/store/buyerFavorsAPI';
import { buyerLocationsAPI } from '@/app/buyer/store/buyerLocationsAPI';
import { buyerNotificationsAPI } from '@/app/buyer/store/buyerNotificationsAPI';
import { buyerStripeAPI } from '@/app/buyer/store/buyerStripeAPI';

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
  whitelist: ['user', 'token', 'isAuthenticated'] as string[],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [authAPI.reducerPath]: authAPI.reducer,
  [buyerBillingAPI.reducerPath]: buyerBillingAPI.reducer,
  [buyerBookingsAPI.reducerPath]: buyerBookingsAPI.reducer,
  [buyerConversationsAPI.reducerPath]: buyerConversationsAPI.reducer,
  [buyerCategoriesAPI.reducerPath]: buyerCategoriesAPI.reducer,
  [buyerFavorsAPI.reducerPath]: buyerFavorsAPI.reducer,
  [buyerLocationsAPI.reducerPath]: buyerLocationsAPI.reducer,
  [buyerNotificationsAPI.reducerPath]: buyerNotificationsAPI.reducer,
  [buyerStripeAPI.reducerPath]: buyerStripeAPI.reducer,
});

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload.timestamp'],
          ignoredPaths: ['authAPI.mutations'],
        },
      }).concat(
        authAPI.middleware,
        buyerBillingAPI.middleware,
        buyerBookingsAPI.middleware,
        buyerConversationsAPI.middleware,
        buyerCategoriesAPI.middleware,
        buyerFavorsAPI.middleware,
        buyerLocationsAPI.middleware,
        buyerNotificationsAPI.middleware,
        buyerStripeAPI.middleware,
      ),
  });

  const persistor = persistStore(store);
  return { store, persistor };
};

export type AppStore = ReturnType<typeof makeStore>['store'];
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
