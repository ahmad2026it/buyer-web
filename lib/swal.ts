'use client';

import Swal, { type SweetAlertIcon, type SweetAlertResult } from 'sweetalert2';

export type SwalVariant = 'success' | 'error' | 'warning' | 'info' | 'danger';

const ICONS: Record<SwalVariant, string> = {
  success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 7L9.5 17.5 4 12" stroke="#A54AFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="#D92D20" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#DC6803" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="#DC6803" stroke-width="2" stroke-linecap="round"/></svg>`,
  info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#A54AFF" stroke-width="2"/><path d="M12 11v5M12 8h.01" stroke="#A54AFF" stroke-width="2" stroke-linecap="round"/></svg>`,
  danger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="3 6 5 6 21 6" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#D92D20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const SWAL_ICON: Record<SwalVariant, SweetAlertIcon> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  danger: 'error',
};

const confirmClass = (variant: SwalVariant) =>
  `whocan-swal-btn ${variant === 'danger' || variant === 'error' ? 'whocan-swal-btn-danger' : variant === 'warning' ? 'whocan-swal-btn-warning' : 'whocan-swal-btn-brand'}`;

const swalClasses = (variant: SwalVariant) => ({
  container: 'whocan-swal-container',
  popup: 'whocan-swal-popup',
  title: 'whocan-swal-title',
  htmlContainer: 'whocan-swal-html',
  actions: 'whocan-swal-actions',
  confirmButton: confirmClass(variant),
  cancelButton: 'whocan-swal-btn whocan-swal-btn-cancel',
  denyButton: 'whocan-swal-btn whocan-swal-btn-cancel',
  icon: `whocan-swal-icon whocan-swal-icon--${variant}`,
});

export const swal = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  focusConfirm: false,
  showCloseButton: false,
  backdrop: 'rgba(16, 24, 40, 0.52)',
  width: 360,
  customClass: swalClasses('info'),
});

export type ShowSwalOptions = {
  title: string;
  text?: string;
  html?: string;
  variant?: SwalVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
};

export function showSwal({
  title,
  text,
  html,
  variant = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}: ShowSwalOptions): Promise<SweetAlertResult> {
  return swal.fire({
    title,
    text: html ? undefined : text,
    html,
    icon: SWAL_ICON[variant],
    iconHtml: ICONS[variant],
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: swalClasses(variant),
  });
}

export function showSuccess(title: string, text?: string) {
  return showSwal({ title, text, variant: 'success', confirmText: 'Continue' });
}

export function showError(title: string, text?: string) {
  return showSwal({ title, text, variant: 'error', confirmText: 'OK' });
}

export function showWarning(title: string, text?: string) {
  return showSwal({ title, text, variant: 'warning', confirmText: 'OK' });
}

export async function confirmAction({
  title,
  text,
  html,
  variant = 'danger',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: Omit<ShowSwalOptions, 'showCancel'>): Promise<boolean> {
  const result = await showSwal({
    title,
    text,
    html,
    variant,
    confirmText,
    cancelText,
    showCancel: true,
  });
  return result.isConfirmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function confirmDelete(
  name: string,
  {
    title = 'Delete location?',
    entity = 'this item',
  }: { title?: string; entity?: string } = {},
) {
  const label = name.trim() || entity;
  return confirmAction({
    title,
    variant: 'danger',
    confirmText: 'Delete',
    html: `<p>Are you sure you want to delete <strong>${escapeHtml(label)}</strong>?</p><p class="whocan-swal-sub">This action cannot be undone.</p>`,
  });
}
