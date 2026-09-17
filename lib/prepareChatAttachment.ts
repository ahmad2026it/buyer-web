const MAX_DIMENSION = 1600;
const TARGET_BYTES = 700 * 1024;
const START_QUALITY = 0.82;
const MIN_QUALITY = 0.58;
const QUALITY_STEP = 0.08;

/** Stay under typical reverse-proxy body limits (Vercel rewrite ~4.5 MB). */
export const MAX_PREPARED_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const MAX_PREPARED_TOTAL_BYTES = 3.5 * 1024 * 1024;

const HEIC_EXT = /\.(heic|heif)$/i;

function isHeicLike(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    HEIC_EXT.test(file.name)
  );
}

function isAnimatedOrVector(file: File): boolean {
  return file.type === 'image/gif' || file.type === 'image/svg+xml';
}

function isImageLike(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|heic|heif|bmp|avif)$/i.test(file.name);
}

function jpegName(file: File): string {
  const base = file.name.replace(/\.[^/.]+$/, '').trim() || 'image';
  return `${base}.jpg`;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

async function loadImageSource(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Fall through to HTMLImageElement for formats some browsers reject.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image load failed'));
      el.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function prepareChatAttachment(file: File): Promise<File> {
  if (!isImageLike(file) || isAnimatedOrVector(file)) return file;
  if (file.type === 'image/jpeg' && file.size <= TARGET_BYTES) return file;
  if (typeof window === 'undefined') return file;

  try {
    const loaded = await loadImageSource(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(loaded.width, loaded.height, 1));
    const width = Math.max(1, Math.round(loaded.width * scale));
    const height = Math.max(1, Math.round(loaded.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      loaded.close?.();
      return file;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(loaded.source, 0, 0, width, height);
    loaded.close?.();

    let quality = START_QUALITY;
    let blob = await canvasToJpeg(canvas, quality);
    while (blob && blob.size > TARGET_BYTES && quality - QUALITY_STEP >= MIN_QUALITY) {
      quality -= QUALITY_STEP;
      blob = await canvasToJpeg(canvas, quality);
    }

    if (!blob) return file;
    if (blob.size >= file.size && file.type === 'image/jpeg') return file;

    return new File([blob], jpegName(file), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function prepareOutgoingChatFiles(
  files: File[],
): Promise<{ ok: true; files: File[] } | { ok: false; error: string }> {
  const prepared: File[] = [];

  for (const file of files) {
    const next = await prepareChatAttachment(file);
    if (isHeicLike(file) && next.type !== 'image/jpeg') {
      return {
        ok: false,
        error: 'This photo format is not supported. Try a JPG, PNG, or screenshot.',
      };
    }
    if (next.size > MAX_PREPARED_ATTACHMENT_BYTES) {
      return {
        ok: false,
        error: 'That attachment is too large to send. Try a smaller photo.',
      };
    }
    prepared.push(next);
  }

  const total = prepared.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_PREPARED_TOTAL_BYTES) {
    return {
      ok: false,
      error: 'Those attachments are too large to send together. Try fewer or smaller photos.',
    };
  }

  return { ok: true, files: prepared };
}

export function appendChatAttachments(formData: FormData, files: File[]): void {
  files.forEach((file, index) => {
    const fallbackExt = file.type === 'image/jpeg' ? '.jpg' : '';
    const name = file.name.trim() || `attachment-${index + 1}${fallbackExt}`;
    formData.append('attachments', file, name);
  });
}
