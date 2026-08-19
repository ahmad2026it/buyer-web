"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useForgotPasswordMutation,
  useResetOtpMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "@/app/auth/store/authAPI";
import { showToast } from "@/lib/toast";
import { showSuccess } from "@/lib/swal";

const GRAD = "linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)";
const BORDER = "#D0D5DD";
const BRAND = "#A54AFF";
const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 6;

type FlowStep = "email" | "otp" | "password";

function WhoCanLogo() {
  return (
    <svg width="130" height="26" viewBox="0 0 159 32" fill="none">
      <path
        d="M19.3728 2.47801C20.6978 0.134223 23.6737 -0.692738 26.0197 0.630946C28.3657 1.95464 29.1935 4.9277 27.8685 7.27149L15.5022 29.1471C14.1772 31.4909 11.2013 32.3179 8.8553 30.9942C6.50929 29.6705 5.68154 26.6974 7.00648 24.3536L19.3728 2.47801Z"
        fill="#A54AFF"
      />
      <path
        d="M1.26277 2.15119C3.04388 -0.22362 6.41297 -0.704966 8.7878 1.07612C11.1626 2.85723 11.644 6.22632 9.86287 8.60114L9.67537 8.85114C7.89426 11.226 4.52517 11.7073 2.15034 9.92622C-0.224467 8.14511 -0.705813 4.77601 1.07527 2.40119L1.26277 2.15119Z"
        fill="#A54AFF"
      />
      <path
        d="M10.625 3.62592C10.9375 4.81342 11.0625 6.18842 12.8125 6.50092C14.125 6.68842 15.5833 6.52175 16.1875 6.31342C17.6547 5.84183 18.785 4.82845 19.3208 4.04669L14.908 11.7282C15.3193 10.7352 15.2167 9.44123 12.8125 9.12592C9.76248 8.72592 9.1875 9.56342 8.3125 10.1259L10.625 3.62592Z"
        fill="#A54AFF"
      />
      <path
        d="M34.8734 2.47769C36.1984 0.134178 39.174 -0.692603 41.5198 0.631014C43.8658 1.95472 44.6934 4.92787 43.3685 7.27164L31.0023 29.1466C29.6774 31.4903 26.7017 32.3177 24.3558 30.9943C22.0099 29.6707 21.1814 26.6974 22.5062 24.3537L34.8734 2.47769Z"
        fill="#A54AFF"
      />
      <path
        d="M60.1314 11.1925C61.5301 11.1925 62.7957 11.4848 63.928 12.0694C65.0604 12.6316 65.9485 13.5086 66.5924 14.7004C67.2585 15.8922 67.5915 17.4325 67.5915 19.3214V29.7778H61.2637V20.3671C61.2637 19.0628 60.9973 18.1184 60.4644 17.5337C59.9537 16.9266 59.2322 16.623 58.2996 16.623C57.6336 16.623 57.023 16.7804 56.4679 17.0952C55.9128 17.3876 55.4799 17.8485 55.169 18.4782C54.8582 19.1078 54.7028 19.9286 54.7028 20.9405V29.7778H48.375V4.75H54.7028V16.6905L53.2374 15.1726C53.9257 13.8459 54.8693 12.8565 56.0683 12.2044C57.2672 11.5298 58.6216 11.1925 60.1314 11.1925Z"
        fill="#101828"
      />
      <path
        d="M80.8507 30.0814C78.8747 30.0814 77.1206 29.6766 75.5887 28.8671C74.0567 28.0575 72.8466 26.9444 71.9585 25.5278C71.0926 24.0886 70.6596 22.4471 70.6596 20.6032C70.6596 18.7593 71.0926 17.129 71.9585 15.7123C72.8466 14.2956 74.0567 13.1938 75.5887 12.4067C77.1206 11.5972 78.8747 11.1925 80.8507 11.1925C82.8268 11.1925 84.5808 11.5972 86.1128 12.4067C87.667 13.1938 88.877 14.2956 89.7429 15.7123C90.6088 17.129 91.0418 18.7593 91.0418 20.6032C91.0418 22.4471 90.6088 24.0886 89.7429 25.5278C88.877 26.9444 87.667 28.0575 86.1128 28.8671C84.5808 29.6766 82.8268 30.0814 80.8507 30.0814ZM80.8507 24.9881C81.5834 24.9881 82.2273 24.8194 82.7823 24.4821C83.3596 24.1448 83.8148 23.6501 84.1478 22.998C84.4809 22.3234 84.6474 21.5251 84.6474 20.6032C84.6474 19.6812 84.4809 18.9054 84.1478 18.2758C83.8148 17.6237 83.3596 17.129 82.7823 16.7917C82.2273 16.4544 81.5834 16.2857 80.8507 16.2857C80.1402 16.2857 79.4963 16.4544 78.9191 16.7917C78.364 17.129 77.9088 17.6237 77.5536 18.2758C77.2206 18.9054 77.054 19.6812 77.054 20.6032C77.054 21.5251 77.2206 22.3234 77.5536 22.998C77.9088 23.6501 78.364 24.1448 78.9191 24.4821C79.4963 24.8194 80.1402 24.9881 80.8507 24.9881Z"
        fill="#101828"
      />
      <path
        d="M105.896 30.25C104.053 30.25 102.344 29.9577 100.767 29.373C99.2129 28.7659 97.8585 27.9114 96.704 26.8095C95.5717 25.7077 94.6836 24.4147 94.0397 22.9306C93.3958 21.4239 93.0739 19.7712 93.0739 17.9722C93.0739 16.1733 93.3958 14.5317 94.0397 13.0476C94.6836 11.541 95.5717 10.2368 96.704 9.13492C97.8585 8.03307 99.2129 7.18982 100.767 6.60516C102.344 5.99802 104.053 5.69444 105.896 5.69444C108.05 5.69444 109.97 6.07672 111.658 6.84127C113.367 7.60582 114.788 8.70767 115.92 10.1468L111.724 13.9921C110.969 13.0926 110.137 12.4067 109.226 11.9345C108.338 11.4623 107.339 11.2262 106.229 11.2262C105.274 11.2262 104.397 11.3836 103.598 11.6984C102.799 12.0132 102.11 12.4742 101.533 13.0813C100.978 13.666 100.534 14.3743 100.201 15.2063C99.8901 16.0384 99.7347 16.9603 99.7347 17.9722C99.7347 18.9841 99.8901 19.9061 100.201 20.7381C100.534 21.5701 100.978 22.2897 101.533 22.8968C102.11 23.4815 102.799 23.9312 103.598 24.246C104.397 24.5608 105.274 24.7183 106.229 24.7183C107.339 24.7183 108.338 24.4821 109.226 24.0099C110.137 23.5377 110.969 22.8519 111.724 21.9524L115.92 25.7976C114.788 27.2143 113.367 28.3161 111.658 29.1032C109.97 29.8677 108.05 30.25 105.896 30.25Z"
        fill="#101828"
      />
      <path
        d="M129.52 29.7778V26.371L129.087 25.5278V19.254C129.087 18.2421 128.776 17.4663 128.154 16.9266C127.555 16.3644 126.589 16.0833 125.257 16.0833C124.391 16.0833 123.514 16.2295 122.626 16.5218C121.737 16.7917 120.983 17.1739 120.361 17.6687L118.229 13.3175C119.251 12.6429 120.472 12.1257 121.893 11.7659C123.336 11.3836 124.768 11.1925 126.189 11.1925C129.12 11.1925 131.385 11.8783 132.983 13.25C134.604 14.5992 135.414 16.7242 135.414 19.625V29.7778H129.52ZM124.191 30.0814C122.748 30.0814 121.527 29.834 120.527 29.3393C119.528 28.8446 118.762 28.17 118.229 27.3155C117.719 26.461 117.463 25.5053 117.463 24.4484C117.463 23.3241 117.741 22.3571 118.296 21.5476C118.873 20.7156 119.75 20.086 120.927 19.6587C122.104 19.209 123.625 18.9841 125.49 18.9841H129.753V22.3234H126.356C125.334 22.3234 124.613 22.4921 124.191 22.8294C123.791 23.1667 123.591 23.6164 123.591 24.1786C123.591 24.7407 123.802 25.1905 124.224 25.5278C124.646 25.8651 125.223 26.0337 125.956 26.0337C126.644 26.0337 127.266 25.8651 127.821 25.5278C128.398 25.168 128.82 24.6283 129.087 23.9087L129.952 26.2698C129.619 27.5291 128.964 28.4848 127.988 29.1369C127.033 29.7665 125.767 30.0814 124.191 30.0814Z"
        fill="#101828"
      />
      <path
        d="M151.165 11.1925C152.564 11.1925 153.829 11.4848 154.962 12.0694C156.094 12.6316 156.982 13.5086 157.626 14.7004C158.292 15.8922 158.625 17.4325 158.625 19.3214V29.7778H152.297V20.3671C152.297 19.0628 152.031 18.1184 151.498 17.5337C150.987 16.9266 150.266 16.623 149.333 16.623C148.667 16.623 148.056 16.7804 147.501 17.0952C146.946 17.3876 146.513 17.8485 146.203 18.4782C145.892 19.1078 145.736 19.9286 145.736 20.9405V29.7778H139.409V11.496H145.437V16.6905L144.271 15.1726C144.959 13.8459 145.903 12.8565 147.102 12.2044C148.301 11.5298 149.655 11.1925 151.165 11.1925Z"
        fill="#101828"
      />
    </svg>
  );
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
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

function PillInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          color: "#344054",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            fontFamily: "Poppins, sans-serif",
            fontSize: "16px",
            color: "#101828",
            background: "#ffffff",
            border: `1px solid ${focused ? BRAND : BORDER}`,
            borderRadius: "9999px",
            padding: isPassword ? "11px 48px 11px 18px" : "11px 18px",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: focused
              ? `0 0 0 4px rgba(165,74,255,0.12)`
              : "0 1px 1px rgba(16,24,40,0.05)",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              padding: 0,
              border: "none",
              background: "transparent",
              color: focused ? BRAND : "#667085",
              cursor: "pointer",
              borderRadius: "50%",
            }}
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 600,
        fontSize: "16px",
        color: "#ffffff",
        background: GRAD,
        border: "none",
        borderRadius: "9999px",
        padding: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        marginBottom: "24px",
        boxShadow: "0 2px 12px rgba(165,74,255,0.35)",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = disabled ? "0.7" : "1";
      }}
    >
      {children}
    </button>
  );
}

function OtpInputs({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

  const focusAt = (index: number) => {
    inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  const setDigit = (index: number, digit: string) => {
    const next = value.split("");
    while (next.length < OTP_LENGTH) next.push("");
    next[index] = digit;
    onChange(next.join("").replace(/\s/g, "").slice(0, OTP_LENGTH));
  };

  return (
    <div
      style={{ display: "flex", gap: "10px", justifyContent: "center" }}
      role="group"
      aria-label="One-time password"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(e) => {
            const nextDigit = e.target.value.replace(/\D/g, "").slice(-1);
            if (!nextDigit) {
              setDigit(index, "");
              return;
            }
            setDigit(index, nextDigit);
            if (index < OTP_LENGTH - 1) focusAt(index + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[index] && index > 0) {
              setDigit(index - 1, "");
              focusAt(index - 1);
            }
            if (e.key === "ArrowLeft") focusAt(index - 1);
            if (e.key === "ArrowRight") focusAt(index + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, OTP_LENGTH);
            if (!pasted) return;
            onChange(pasted);
            focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
          }}
          style={{
            width: "56px",
            height: "56px",
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "22px",
            color: "#101828",
            background: "#ffffff",
            border: `1px solid ${digit.trim() ? BRAND : BORDER}`,
            borderRadius: "16px",
            outline: "none",
            boxShadow: "0 1px 1px rgba(16,24,40,0.05)",
          }}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const [forgotPassword, { isLoading: sendingCode }] =
    useForgotPasswordMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [resetOtp, { isLoading: resendingOtp }] = useResetOtpMutation();
  const [resetPassword, { isLoading: savingPassword }] =
    useResetPasswordMutation();

  const busy = sendingCode || verifyingOtp || resendingOtp || savingPassword;

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const startResendTimer = () => setResendIn(RESEND_SECONDS);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    if (!isValidEmail(nextEmail)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    try {
      const result = await forgotPassword({ email: nextEmail }).unwrap();
      setEmail(nextEmail);
      setOtp("");
      startResendTimer();
      setStep("otp");
      await showSuccess(
        "Check your email",
        result.message || "We sent a 4-digit code to your email.",
      );
    } catch {
      // API errors are shown by the axios interceptor toast
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      showToast("Enter the 4-digit code from your email.", "warning");
      return;
    }

    try {
      const result = await verifyOtp({ email, otp }).unwrap();
      setPassword("");
      setConfirm("");
      setStep("password");
      await showSuccess(
        "Code verified",
        result.message || "Enter a new password to continue.",
      );
    } catch {
      // API errors are shown by the axios interceptor toast
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || busy) return;
    try {
      const result = await resetOtp({ email }).unwrap();
      setOtp("");
      startResendTimer();
      showToast(result.message || "A new code was sent to your email.", "success");
    } catch {
      // API errors are shown by the axios interceptor toast
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      showToast(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, "warning");
      return;
    }
    if (password !== confirm) {
      showToast("Passwords do not match.", "warning");
      return;
    }

    try {
      const result = await resetPassword({
        email,
        newPassword: password,
      }).unwrap();
      await showSuccess(
        "Password updated",
        result.message || "You can now log in with your new password.",
      );
      router.push("/auth/login");
    } catch {
      // API errors are shown by the axios interceptor toast
    }
  };

  const title =
    step === "email"
      ? "Forgot password"
      : step === "otp"
        ? "Enter verification code"
        : "Set a new password";

  const subtitle =
    step === "email"
      ? "Enter the email linked to your account and we'll send a reset code."
      : step === "otp"
        ? `We sent a 4-digit code to ${maskEmail(email)}.`
        : "Choose a new password for your WhoCan account.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(165,74,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(165,74,255,0.06) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle,rgba(165,74,255,0.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <a href="/" style={{ marginBottom: "40px", position: "relative" }}>
        <WhoCanLogo />
      </a>

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        {step !== "email" && (
          <button
            type="button"
            onClick={() => setStep(step === "password" ? "otp" : "email")}
            disabled={busy}
            aria-label="Back"
            style={{
              position: "absolute",
              top: "-8px",
              left: 0,
              width: "40px",
              height: "40px",
              background: "#ffffff",
              border: "1px solid #EAECF0",
              borderRadius: "12px",
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12l7 7M5 12l7-7"
                stroke="#344054"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "30px",
              color: "#101828",
              lineHeight: "1.25",
              marginBottom: "10px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
              color: "#475467",
              lineHeight: "1.5",
            }}
          >
            {subtitle}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: "24px" }}>
              <PillInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
            </div>
            <PrimaryButton disabled={busy}>
              {sendingCode ? "Sending code..." : "Send reset code"}
            </PrimaryButton>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "20px" }}>
              <OtpInputs value={otp} onChange={setOtp} disabled={busy} />
            </div>
            <PrimaryButton disabled={busy}>
              {verifyingOtp ? "Verifying..." : "Verify code"}
            </PrimaryButton>
            <p
              style={{
                textAlign: "center",
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                color: "#344054",
                marginBottom: "24px",
              }}
            >
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={busy || resendIn > 0}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: BRAND,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: busy || resendIn > 0 ? "not-allowed" : "pointer",
                  opacity: busy || resendIn > 0 ? 0.6 : 1,
                }}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </p>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <PillInput
                label="New password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <PillInput
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
              />
            </div>
            <PrimaryButton disabled={busy}>
              {savingPassword ? "Updating password..." : "Reset password"}
            </PrimaryButton>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            color: "#344054",
          }}
        >
          Remember your password?{" "}
          <a
            href="/auth/login"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "#7535B5",
              textDecoration: "none",
            }}
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
