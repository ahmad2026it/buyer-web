"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginBuyer } from "@/app/auth/store/authThunk";
import { clearAuthError, selectIsAuthenticated } from "@/app/auth/store/authSlice";
import type { AuthApiError } from "@/app/auth/store/authTypes";
import { getAxiosErrorDetails } from "@/lib/axios";
import {
  getCachedWebFcmToken,
  getNotificationPermission,
  getWebFcmToken,
  isChromeBrowser,
  isEdgeBrowser,
} from "@/lib/fcm";
import { showToast } from "@/lib/toast";
import { showSuccess, showSwal } from "@/lib/swal";

const GRAD = "linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)";
const BORDER = "#D0D5DD";
const BRAND = "#A54AFF";
const ERROR = "#D92D20";

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

function PillInput({
  label,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;
  const hasError = Boolean(error);
  const borderColor = hasError ? ERROR : focused ? BRAND : BORDER;

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
          aria-invalid={hasError}
          autoComplete={isPassword ? "current-password" : undefined}
          style={{
            width: "100%",
            fontFamily: "Poppins, sans-serif",
            fontSize: "16px",
            color: "#101828",
            background: "#ffffff",
            border: `1px solid ${borderColor}`,
            borderRadius: "9999px",
            padding: isPassword ? "11px 48px 11px 18px" : "11px 18px",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: hasError
              ? "0 0 0 4px rgba(217,45,32,0.12)"
              : focused
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
      {hasError && (
        <p
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            color: ERROR,
            marginTop: "6px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const skipAuthRedirectRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [remember, setRemember] = useState(false);
  const [pushPermission, setPushPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => {
    setPushPermission(getNotificationPermission());

    if (getNotificationPermission() === "granted") {
      void getWebFcmToken();
    }

    if (!navigator.permissions?.query) return;

    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const sync = () => {
      const permission = getNotificationPermission();
      setPushPermission(permission);
      if (permission === "granted") void getWebFcmToken();
    };

    void navigator.permissions
      .query({ name: "notifications" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        permissionStatus = status;
        sync();
        status.addEventListener("change", sync);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (skipAuthRedirectRef.current || !isAuthenticated) return;
    router.replace("/");
  }, [isAuthenticated, router]);

  const showBlockedNotificationHelp = async (permission: NotificationPermission | "unsupported") => {
    const chromeHelp =
      "<p>Chrome automatically blocked the prompt. That is why no FCM token is sent on sign in.</p><p>1. Click the site settings icon (tune / crossed-out bell) in the address bar.</p><p>2. Set <strong>Notifications</strong> to <strong>Allow</strong>. If it says Automatically blocked, change it to Allow.</p><p>3. Reload this page, click <strong>Enable</strong>, then sign in.</p><p>You can also open <strong>chrome://settings/content/notifications</strong>, turn on <strong>Sites can ask to send notifications</strong>, and remove <strong>localhost:3000</strong> from Not allowed.</p>";
    const edgeHelp =
      "<p>Edge denied the request without prompting. Check these in order, then reload:</p><p>1. Windows Settings → System → Notifications → <strong>Microsoft Edge must be On</strong>. If Windows notifications are off for Edge, every web prompt is auto-denied.</p><p>2. <strong>edge://settings/content/notifications</strong> → the top toggle must be <strong>Ask before sending</strong>, and turn off <strong>Quiet notification requests</strong>.</p><p>3. On that same page, remove <strong>localhost:3000</strong> from the Block list.</p>";
    const genericHelp =
      "<p>The browser denied notifications without prompting, so this device cannot send an FCM token.</p><p>Open the lock / site settings icon next to the URL, set Notifications to Allow, reload, click Enable, then sign in.</p>";

    await showSwal({
      title: `Permission is "${permission}"`,
      html: isChromeBrowser() ? chromeHelp : isEdgeBrowser() ? edgeHelp : genericHelp,
      variant: "warning",
      confirmText: "Got it",
    });
  };

  const handleEnablePush = async () => {
    if (typeof Notification === "undefined") {
      showToast("This browser does not support notifications.", "warning");
      return;
    }

    if (Notification.permission === "denied") {
      setPushPermission("denied");
      await showBlockedNotificationHelp("denied");
      return;
    }

    const fcm = await getWebFcmToken({ requestPermission: true });
    const permission = getNotificationPermission();
    setPushPermission(permission);

    if (fcm.token) {
      showToast("Notifications enabled. You can sign in now.", "success");
      return;
    }

    await showBlockedNotificationHelp(permission);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setFieldErrors({
        email: !email.trim() ? "Please enter your email." : undefined,
        password: !password ? "Please enter your password." : undefined,
      });
      return;
    }

    dispatch(clearAuthError());
    setFieldErrors({});

    try {
      const permission = getNotificationPermission();
      setPushPermission(permission);

      const fcm =
        permission === "granted"
          ? await getWebFcmToken()
          : { token: getCachedWebFcmToken() || undefined, status: "blocked" as const };

      if (!fcm.token) {
        console.warn(`Signing in without fcmToken: ${fcm.status}`);
      }

      const result = await dispatch(
        loginBuyer({
          email: email.trim(),
          password,
          fcmToken: fcm.token,
        }),
      ).unwrap();

      localStorage.setItem("whoCan_loggedIn", "true");
      if (remember) {
        localStorage.setItem("whoCan_remember", "true");
      }

      skipAuthRedirectRef.current = true;
      await showSuccess("Success", result.message || "Logged in successfully");

      router.replace("/");
    } catch (error) {
      const details = getAxiosErrorDetails(error as AuthApiError);
      const nextErrors = {
        email: details.fieldErrors.email,
        password: details.fieldErrors.password,
      };
      setFieldErrors(nextErrors);

      if (!nextErrors.email && !nextErrors.password) {
        showToast(details.message, "error");
      }
    }
  };

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
      {/* Subtle grid background */}
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
      {/* Top radial glow */}
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

      {/* Logo */}
      <a href="/" style={{ marginBottom: "40px", position: "relative" }}>
        <WhoCanLogo />
      </a>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
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
            Log In
          </h1>
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
              color: "#475467",
            }}
          >
            Welcome back! Please enter your details.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "16px",
          }}
        >
          <PillInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            error={fieldErrors.email}
            onChange={(value) => {
              setEmail(value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />
          <PillInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            error={fieldErrors.password}
            onChange={(value) => {
              setPassword(value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
          />
        </div>

        {/* Remember + Forgot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                accentColor: BRAND,
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#344054",
              }}
            >
              Remember for 30 days
            </span>
          </label>
          <a
            href="/auth/forgot-password"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#7535B5",
              textDecoration: "none",
            }}
          >
            Forgot password
          </a>
        </div>

        {/* Push notification status */}
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            border: `1px solid ${pushPermission === "denied" ? "#FECDCA" : BORDER}`,
            borderRadius: "12px",
            background: pushPermission === "denied" ? "#FEF3F2" : "#F9FAFB",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
                color: "#475467",
              }}
            >
              Notifications:{" "}
              <strong style={{ color: "#101828" }}>
                {pushPermission === "denied" ? "automatically blocked" : pushPermission}
              </strong>
            </span>
            {pushPermission !== "granted" && (
              <button
                type="button"
                onClick={handleEnablePush}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: BRAND,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {pushPermission === "denied" ? "Allow in browser" : "Enable"}
              </button>
            )}
          </div>
          {pushPermission !== "granted" && (
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "12px",
                color: "#667085",
                margin: "8px 0 0",
              }}
            >
              {pushPermission === "denied"
                ? "The browser blocked the prompt. Set Notifications to Allow in the address bar, reload, then enable before signing in."
                : "Enable notifications before signing in so the FCM token is sent with login."}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
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
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: "24px",
            boxShadow: "0 2px 12px rgba(165,74,255,0.35)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = loading
              ? "0.7"
              : "1";
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Sign up link */}
        <p
          style={{
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            color: "#344054",
          }}
        >
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "#7535B5",
              textDecoration: "none",
            }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
