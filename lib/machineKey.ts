const MACHINE_KEY_VERSION = 3;

export type MachineSignals = {
  os: string;
  hardwareConcurrency: number | null;
  maxTouchPoints: number;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  timezone: string;
  gpuVendor: string;
  gpuRenderer: string;
  gpuNormalized: string;
};

export type MachineIdentity = {
  machineKey: string;
  machineKeyVersion: number;
  machineSignals: MachineSignals;
};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function rotateRight(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256HexSync(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }

    for (let i = 16; i < 64; i += 1) {
      const s0 =
        rotateRight(w[i - 15], 7) ^
        rotateRight(w[i - 15], 18) ^
        (w[i - 15] >>> 3);
      const s1 =
        rotateRight(w[i - 2], 17) ^
        rotateRight(w[i - 2], 19) ^
        (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, h0, false);
  digestView.setUint32(4, h1, false);
  digestView.setUint32(8, h2, false);
  digestView.setUint32(12, h3, false);
  digestView.setUint32(16, h4, false);
  digestView.setUint32(20, h5, false);
  digestView.setUint32(24, h6, false);
  digestView.setUint32(28, h7, false);
  return bytesToHex(digest);
}

async function sha256Hex(value: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return bytesToHex(new Uint8Array(digest));
  }

  return sha256HexSync(value);
}

function detectOs(): string {
  const platform = (navigator.platform || "").toLowerCase();
  const userAgent = (navigator.userAgent || "").toLowerCase();
  const haystack = `${platform} ${userAgent}`;

  if (
    haystack.includes("iphone") ||
    haystack.includes("ipad") ||
    haystack.includes("ipod")
  ) {
    return "ios";
  }
  if (haystack.includes("android")) return "android";
  if (haystack.includes("win")) return "windows";
  if (
    haystack.includes("mac") ||
    haystack.includes("macintosh") ||
    haystack.includes("mac os")
  ) {
    return "macos";
  }
  if (haystack.includes("cros")) return "chromeos";
  if (haystack.includes("linux")) return "linux";

  return platform || "unknown";
}

function normalizeHexId(raw: string): string {
  const hex = raw.replace(/^0x/i, "").replace(/^0+/, "") || "0";
  return `0x${hex.toLowerCase()}`;
}

function normalizeGpu(renderer: string, vendor: string, os: string): string {
  const combined = `${vendor} ${renderer}`.toLowerCase();

  if (
    combined.includes("apple") ||
    (os === "macos" && combined.includes("webkit"))
  ) {
    return "apple";
  }

  const pciIds = [
    ...new Set(
      [...renderer.matchAll(/0x[0-9a-f]+/gi)].map((match) =>
        normalizeHexId(match[0]),
      ),
    ),
  ].sort();

  if (pciIds.length > 0) {
    return pciIds.join(" ");
  }

  const name = renderer
    .toLowerCase()
    .replace(/^angle\s*\(/, "")
    .replace(/direct3d\d*\s*ex/g, "")
    .replace(/direct3d[\w\s.]*/g, "")
    .replace(/d3d\d+/g, "")
    .replace(/vs_\d+_\d+/g, "")
    .replace(/ps_\d+_\d+/g, "")
    .replace(/opengl[\w\s.]*/g, "")
    .replace(/metal/g, "")
    .replace(/google inc\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return name || "unavailable";
}

function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return { vendor: "unavailable", renderer: "unavailable" };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      : String(gl.getParameter(gl.VENDOR));
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));

    return { vendor, renderer };
  } catch {
    return { vendor: "unavailable", renderer: "unavailable" };
  }
}

function collectMachineSignals(): MachineSignals {
  const os = detectOs();
  const webgl = getWebGLInfo();
  const gpuNormalized = normalizeGpu(webgl.renderer, webgl.vendor, os);

  return {
    os,
    hardwareConcurrency: Number.isFinite(navigator.hardwareConcurrency)
      ? navigator.hardwareConcurrency
      : null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    devicePixelRatio: Math.round(window.devicePixelRatio * 100) / 100,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    gpuVendor: webgl.vendor,
    gpuRenderer: webgl.renderer,
    gpuNormalized: gpuNormalized || "unavailable",
  };
}

function canonicalMachinePayload(signals: MachineSignals): string {
  return JSON.stringify({
    colorDepth: signals.colorDepth,
    gpu: signals.gpuNormalized,
    hardwareConcurrency: signals.hardwareConcurrency,
    maxTouchPoints: signals.maxTouchPoints,
    os: signals.os,
    screenHeight: signals.screenHeight,
    screenWidth: signals.screenWidth,
    timezone: signals.timezone,
    v: MACHINE_KEY_VERSION,
  });
}

export async function getMachineIdentity(): Promise<MachineIdentity> {
  let machineSignals: MachineSignals;

  try {
    machineSignals = collectMachineSignals();
  } catch {
    machineSignals = {
      os: "unknown",
      hardwareConcurrency: null,
      maxTouchPoints: 0,
      screenWidth: 0,
      screenHeight: 0,
      colorDepth: 0,
      pixelDepth: 0,
      devicePixelRatio: 1,
      timezone: "unknown",
      gpuVendor: "unavailable",
      gpuRenderer: "unavailable",
      gpuNormalized: "unavailable",
    };
  }

  const machineKey = await sha256Hex(canonicalMachinePayload(machineSignals));

  return {
    machineKey,
    machineKeyVersion: MACHINE_KEY_VERSION,
    machineSignals,
  };
}
