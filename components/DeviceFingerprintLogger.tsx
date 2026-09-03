'use client';

import { useEffect } from 'react';

type NavigatorUABrand = {
  brand: string;
  version: string;
};

type HighEntropyUA = {
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  uaFullVersion?: string;
  fullVersionList?: NavigatorUABrand[];
};

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  userAgentData?: {
    brands: NavigatorUABrand[];
    mobile: boolean;
    platform: string;
    getHighEntropyValues: (hints: string[]) => Promise<HighEntropyUA>;
  };
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
};

function getCanvasFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'unavailable';

  canvas.width = 240;
  canvas.height = 60;
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('WhoCan fingerprint 🌐', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('WhoCan fingerprint 🌐', 4, 17);
  return canvas.toDataURL();
}

function getWebGLInfo(): { vendor: string; renderer: string } {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

  if (!gl || !(gl instanceof WebGLRenderingContext)) {
    return { vendor: 'unavailable', renderer: 'unavailable' };
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = debugInfo
    ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
    : String(gl.getParameter(gl.VENDOR));
  const renderer = debugInfo
    ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
    : String(gl.getParameter(gl.RENDERER));

  return { vendor, renderer };
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function collectDeviceInfo() {
  const nav = navigator as NavigatorWithHints;
  let highEntropy: HighEntropyUA | null = null;

  try {
    highEntropy =
      (await nav.userAgentData?.getHighEntropyValues([
        'architecture',
        'bitness',
        'model',
        'platformVersion',
        'uaFullVersion',
        'fullVersionList',
      ])) ?? null;
  } catch {
    highEntropy = null;
  }

  const webgl = getWebGLInfo();

  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,
    language: nav.language,
    languages: [...nav.languages],
    cookieEnabled: nav.cookieEnabled,
    onLine: nav.onLine,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemoryGb: nav.deviceMemory ?? null,
    maxTouchPoints: nav.maxTouchPoints,
    touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: window.screen.orientation?.type ?? null,
    },
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    timezone: {
      name: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offsetMinutes: new Date().getTimezoneOffset(),
    },
    connection: nav.connection
      ? {
          effectiveType: nav.connection.effectiveType ?? null,
          downlink: nav.connection.downlink ?? null,
          rtt: nav.connection.rtt ?? null,
          saveData: nav.connection.saveData ?? null,
        }
      : null,
    clientHints: nav.userAgentData
      ? {
          brands: nav.userAgentData.brands,
          mobile: nav.userAgentData.mobile,
          platform: nav.userAgentData.platform,
          highEntropy,
        }
      : null,
    webgl,
  };
}

export default function DeviceFingerprintLogger() {
  useEffect(() => {
    let cancelled = false;

    async function logBrowserIdentity() {
      const device = await collectDeviceInfo();
      const canvas = getCanvasFingerprint();
      const fingerprintHash = await sha256(
        JSON.stringify({
          userAgent: device.userAgent,
          platform: device.platform,
          languages: device.languages,
          hardwareConcurrency: device.hardwareConcurrency,
          deviceMemoryGb: device.deviceMemoryGb,
          maxTouchPoints: device.maxTouchPoints,
          screen: device.screen,
          timezone: device.timezone,
          webgl: device.webgl,
          canvas,
          clientHints: device.clientHints,
        })
      );

      if (cancelled) return;

      console.log('[WhoCan] Device information', device);
      console.log('[WhoCan] Browser fingerprint', {
        hash: fingerprintHash,
        canvas,
        webgl: device.webgl,
      });
    }

    void logBrowserIdentity();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
