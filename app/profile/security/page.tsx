'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import { useChangePasswordMutation } from '@/app/auth/store/authAPI';
import type { AuthApiError } from '@/app/auth/store/authTypes';
import { getAxiosErrorDetails } from '@/lib/axios';
import { showToast } from '@/lib/toast';
import { showSuccess } from '@/lib/swal';

const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL = '9999px';
const BORDER = '#D0D5DD';
const ERROR = '#D92D20';
const MIN_PASSWORD_LENGTH = 8;

const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (value: string) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value: string) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'One special character (e.g. !@#$%)',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

function getPasswordError(password: string): string | undefined {
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(password));
  if (failed.length === 0) return undefined;
  return `Password must include ${failed
    .map((rule) => rule.label.toLowerCase())
    .join(', ')}.`;
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      {off && (
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function PasswordField({
  label,
  value,
  error,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const borderColor = hasError ? ERROR : focused ? BRAND : BORDER;

  return (
    <div>
      <label
        style={{
          fontFamily: 'Poppins,sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: '#344054',
          marginBottom: '6px',
          display: 'block',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={hasError}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '15px',
            color: '#101828',
            background: '#fff',
            border: `1px solid ${borderColor}`,
            borderRadius: PILL,
            padding: '11px 48px 11px 16px',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: hasError
              ? '0 0 0 3px rgba(217,45,32,0.12)'
              : focused
                ? '0 0 0 3px rgba(165,74,255,0.12)'
                : '0 1px 2px rgba(16,24,40,0.05)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: focused ? BRAND : '#667085',
            cursor: 'pointer',
            borderRadius: '50%',
          }}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
      {hasError && (
        <p
          style={{
            fontFamily: 'Poppins,sans-serif',
            fontSize: '12px',
            color: ERROR,
            marginTop: '6px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordRules({ value }: { value: string }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        return (
          <li
            key={rule.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '12px',
              color: passed ? '#027A48' : '#667085',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: passed ? '#ECFDF3' : '#F2F4F7',
                color: passed ? '#027A48' : '#98A2B3',
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {passed ? '✓' : '•'}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof fieldErrors = {};
    if (!currentPassword) {
      nextErrors.currentPassword = 'Please enter your current password.';
    }

    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      nextErrors.newPassword = passwordError;
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = 'New password must be different from your current password.';
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      showToast(Object.values(nextErrors)[0] ?? 'Please check the form.', 'warning');
      return;
    }

    setFieldErrors({});

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await showSuccess(
        'Password updated',
        result.message || 'Your password has been changed successfully.',
      );
    } catch (error) {
      const details = getAxiosErrorDetails(error as AuthApiError);
      const nextFieldErrors = {
        currentPassword:
          details.fieldErrors.currentPassword || details.fieldErrors.password,
        newPassword: details.fieldErrors.newPassword,
      };
      setFieldErrors(nextFieldErrors);

      if (!nextFieldErrors.currentPassword && !nextFieldErrors.newPassword) {
        showToast(details.message || 'Unable to change password. Please try again.', 'error');
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '32px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Poppins,sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#667085',
                textDecoration: 'none',
                marginBottom: '16px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = BRAND;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#667085';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </a>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '28px', color: '#101828' }}>
              Security
            </h1>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '14px', color: '#667085', marginTop: '8px' }}>
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            style={{
              background: '#fff',
              border: '1px solid #EAECF0',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(16,24,40,0.05)',
            }}
          >
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #F2F4F7' }}>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '15px', color: '#101828', marginBottom: '4px' }}>
                Change password
              </p>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085' }}>
                Use a strong password you have not used here before.
              </p>
            </div>

            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <PasswordField
                  label="Current password"
                  value={currentPassword}
                  error={fieldErrors.currentPassword}
                  autoComplete="current-password"
                  onChange={(value) => {
                    setCurrentPassword(value);
                    clearFieldError('currentPassword');
                  }}
                />
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: '13px', color: '#667085', marginTop: '10px' }}>
                  Forgot it?{' '}
                  <Link
                    href="/auth/forgot-password"
                    style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Reset password
                  </Link>
                </p>
              </div>

              <div>
                <PasswordField
                  label="New password"
                  value={newPassword}
                  error={fieldErrors.newPassword}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setNewPassword(value);
                    clearFieldError('newPassword');
                    if (fieldErrors.confirmPassword && value === confirmPassword) {
                      clearFieldError('confirmPassword');
                    }
                  }}
                />
                <div style={{ marginTop: '10px' }}>
                  <PasswordRules value={newPassword} />
                </div>
              </div>

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
                onChange={(value) => {
                  setConfirmPassword(value);
                  clearFieldError('confirmPassword');
                }}
              />
            </div>

            <div
              style={{
                padding: '20px 32px',
                borderTop: '1px solid #F2F4F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#344054',
                  background: '#fff',
                  border: '1px solid #D0D5DD',
                  borderRadius: PILL,
                  padding: '11px 22px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#fff';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#fff',
                  background: GRAD,
                  border: 'none',
                  borderRadius: PILL,
                  padding: '11px 24px',
                  cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.8 : 1,
                  boxShadow: '0 4px 12px rgba(165,74,255,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = isLoading ? '0.8' : '0.9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = isLoading ? '0.8' : '1';
                }}
              >
                {isLoading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
