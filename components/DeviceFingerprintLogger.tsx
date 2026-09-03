'use client';

import { useEffect } from 'react';
import { getMachineIdentity } from '@/lib/machineKey';

export default function DeviceFingerprintLogger() {
  useEffect(() => {
    let cancelled = false;

    async function logMachineIdentity() {
      const identity = await getMachineIdentity();
      if (cancelled) return;

      console.log('[WhoCan] Device identity (sent on login/register)', {
        deviceId: identity.machineKey,
        deviceType: 'web',
        machineKey: identity.machineKey,
        machineKeyVersion: identity.machineKeyVersion,
        machineSignals: identity.machineSignals,
      });
    }

    void logMachineIdentity();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
