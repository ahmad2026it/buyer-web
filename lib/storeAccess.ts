import type { Persistor } from 'redux-persist';
import type { AppStore } from '@/store';

let appStore: AppStore | undefined;
let appPersistor: Persistor | undefined;

export const injectStore = (store: AppStore): void => {
  appStore = store;
};

export const injectPersistor = (persistor: Persistor): void => {
  appPersistor = persistor;
};

export const getAppStore = (): AppStore | undefined => appStore;

export const purgePersistedClientState = (): void => {
  void appPersistor?.purge();

  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('whoCan_loggedIn');
  window.localStorage.removeItem('persist:auth');
};

const readPersistedToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('persist:auth');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { token?: string };
    if (typeof parsed.token !== 'string') return null;

    const token = JSON.parse(parsed.token) as unknown;
    return typeof token === 'string' && token ? token : null;
  } catch {
    return null;
  }
};

export const getAuthToken = (): string | null => {
  const storeToken = appStore?.getState()?.auth?.token;
  if (typeof storeToken === 'string' && storeToken) return storeToken;
  return readPersistedToken();
};
