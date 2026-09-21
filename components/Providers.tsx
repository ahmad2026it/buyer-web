'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { makeStore } from '@/store';
import { injectPersistor, injectStore } from '@/lib/storeAccess';
import { muiTheme } from '@/lib/muiTheme';
import AuthHistoryGuard from '@/components/AuthHistoryGuard';
import MuiToastProvider from '@/components/MuiToastProvider';
import PushNotificationListener from '@/components/PushNotificationListener';

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    injectStore(storeRef.current.store);
    injectPersistor(storeRef.current.persistor);
  }

  const { store } = storeRef.current;

  // Do not wrap with PersistGate(loading=null): that omits children from SSR HTML
  // and leaves crawlers with an empty body. redux-persist still rehydrates in the
  // background via makeStore()/persistStore.
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={muiTheme}>
        <Provider store={store}>
          <MuiToastProvider>
            <PushNotificationListener />
            <AuthHistoryGuard />
            {children}
          </MuiToastProvider>
        </Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
