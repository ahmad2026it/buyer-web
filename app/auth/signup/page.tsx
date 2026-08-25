"use client";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterBuyerMutation } from "@/app/auth/store/authAPI";
import { goHomeAfterAuth } from "@/lib/authNavigation";
import { showSuccess } from "@/lib/swal";
import {
  COUNTRY_DIAL_CODES,
  countryFlag,
  getCountryByIso,
} from "@/lib/countryCodes";

const GRAD = "linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)";
const BRAND = "#A54AFF";
const PILL = "9999px";
const ILLUS =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=540&h=660&fit=crop&auto=format&q=80";
const MAP_IMG =
  "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&h=300&fit=crop&auto=format&q=75";

/* ── Logo ─────────────────────────────────────────────── */
function WhoCanLogo({ size = 120 }: { size?: number }) {
  const scale = size / 159;
  return (
    <svg
      width={size}
      height={Math.round(32 * scale)}
      viewBox="0 0 159 32"
      fill="none"
    >
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

/* ── Pill input ────────────────────────────────────────── */
function PillInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label
        style={{
          fontFamily: "Poppins,sans-serif",
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
          autoComplete={isPassword ? "new-password" : undefined}
          style={{
            width: "100%",
            fontFamily: "Poppins,sans-serif",
            fontSize: "15px",
            color: "#101828",
            background: "#ffffff",
            border: `1.5px solid ${focused ? BRAND : "#D0D5DD"}`,
            borderRadius: PILL,
            padding: isPassword ? "12px 48px 12px 20px" : "12px 20px",
            outline: "none",
            boxSizing: "border-box",
            boxShadow: focused
              ? `0 0 0 4px rgba(165,74,255,0.12)`
              : "0 1px 2px rgba(16,24,40,0.05)",
            transition: "border-color 0.15s,box-shadow 0.15s",
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

const CALENDAR_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CALENDAR_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDobLabel(value: string) {
  const date = parseIsoDate(value);
  if (!date) return "";
  return `${date.getDate()} ${CALENDAR_MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function CountryCodeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = getCountryByIso(value) ?? COUNTRY_DIAL_CODES.find((c) => c.iso === "US")!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.iso.toLowerCase().includes(q) ||
        country.dial.includes(q) ||
        country.dial.replace("+", "").includes(q.replace("+", "")),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "12px 14px",
          background: "#ffffff",
          border: `1.5px solid ${open ? BRAND : "#D0D5DD"}`,
          borderRadius: PILL,
          cursor: "pointer",
          boxShadow: open ? "0 0 0 4px rgba(165,74,255,0.12)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>
          {countryFlag(selected.iso)}
        </span>
        <span
          className="auth-signup-cc-text"
          style={{
            fontFamily: "Poppins,sans-serif",
            fontSize: "14px",
            color: "#344054",
            whiteSpace: "nowrap",
          }}
        >
          <span className="auth-signup-cc-iso">{selected.iso} </span>
          {selected.dial}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9l6 6 6-6"
            stroke="#667085"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="auth-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 40,
            background: "#ffffff",
            border: "1px solid #EAECF0",
            borderRadius: "16px",
            boxShadow:
              "0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 10px 6px" }}>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country"
              style={{
                width: "100%",
                fontFamily: "Poppins,sans-serif",
                fontSize: "13px",
                color: "#101828",
                background: "#F9FAFB",
                border: "1px solid #E4E7EC",
                borderRadius: "10px",
                padding: "8px 12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div
            role="listbox"
            style={{ maxHeight: "240px", overflowY: "auto", padding: "4px 0 8px" }}
          >
            {filtered.length === 0 && (
              <p
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "13px",
                  color: "#667085",
                  padding: "12px 16px",
                  margin: 0,
                }}
              >
                No countries found
              </p>
            )}
            {filtered.map((country) => {
              const isActive = country.iso === selected.iso;
              return (
                <button
                  key={country.iso}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(country.iso);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 14px",
                    border: "none",
                    background: isActive ? "#F4EBFF" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive
                      ? "#F4EBFF"
                      : "transparent";
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>
                    {countryFlag(country.iso)}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "13px",
                      color: "#101828",
                    }}
                  >
                    {country.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "13px",
                      color: "#667085",
                    }}
                  >
                    {country.dial}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BirthDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (isoDate: string) => void;
}) {
  const selected = parseIsoDate(value);
  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const minYear = today.getFullYear() - 120;
  const maxYear = today.getFullYear();
  const defaultView = selected ?? new Date(today.getFullYear() - 18, 0, 1);

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(defaultView);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  const isDisabled = (date: Date) => date > maxDate;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setViewDate(selected ?? new Date(today.getFullYear() - 18, 0, 1));
          setOpen((prev) => !prev);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Poppins,sans-serif",
          fontSize: "14px",
          color: selected ? "#101828" : "#98A2B3",
          background: "#ffffff",
          border: `1.5px solid ${open ? BRAND : "#D0D5DD"}`,
          borderRadius: PILL,
          padding: "12px 14px 12px 18px",
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer",
          textAlign: "left",
          boxShadow: open ? "0 0 0 4px rgba(165,74,255,0.12)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {selected ? formatDobLabel(value) : "Select"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="#98A2B3"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="#98A2B3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="#98A2B3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
            stroke="#98A2B3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="auth-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 40,
            background: "#ffffff",
            border: "1px solid #EAECF0",
            borderRadius: "16px",
            boxShadow:
              "0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)",
            padding: "12px",
            fontFamily: "Poppins,sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setViewDate(new Date(year, month - 1, 1))
              }
              style={{
                width: "32px",
                height: "32px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#667085",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <select
              value={month}
              onChange={(e) =>
                setViewDate(new Date(year, Number(e.target.value), 1))
              }
              style={{
                flex: 1,
                fontFamily: "Poppins,sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#344054",
                border: "1px solid #E4E7EC",
                borderRadius: "8px",
                padding: "6px 8px",
                outline: "none",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {CALENDAR_MONTHS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) =>
                setViewDate(new Date(Number(e.target.value), month, 1))
              }
              style={{
                width: "84px",
                fontFamily: "Poppins,sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#344054",
                border: "1px solid #E4E7EC",
                borderRadius: "8px",
                padding: "6px 8px",
                outline: "none",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setViewDate(new Date(year, month + 1, 1))
              }
              style={{
                width: "32px",
                height: "32px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#667085",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              marginBottom: "4px",
            }}
          >
            {CALENDAR_DAYS.map((day) => (
              <div
                key={day}
                style={{
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#667085",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
            }}
          >
            {cells.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} />;
              const iso = toIsoDate(date);
              const isSelected = value === iso;
              const disabled = isDisabled(date);
              const isToday = toIsoDate(maxDate) === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  style={{
                    width: "32px",
                    height: "32px",
                    margin: "0 auto",
                    border: isToday && !isSelected ? `1px solid ${BRAND}` : "none",
                    borderRadius: "50%",
                    background: isSelected ? BRAND : "transparent",
                    color: disabled
                      ? "#D0D5DD"
                      : isSelected
                        ? "#ffffff"
                        : "#344054",
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "13px",
                    fontWeight: isSelected || isToday ? 600 : 400,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Left illustration panel ───────────────────────────── */
function LeftPanel() {
  return (
    <div className="auth-signup-left">
      {/* Dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(165,74,255,0.12) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      {/* Logo top */}
      <div
        style={{ position: "absolute", top: "32px", left: "40px", zIndex: 1 }}
      >
        <WhoCanLogo size={120} />
      </div>
      {/* Main illustration */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <img
          src={ILLUS}
          alt="Welcome illustration"
          style={{
            width: "80%",
            maxWidth: "360px",
            height: "auto",
            objectFit: "cover",
            borderRadius: "28px",
            boxShadow: "0 32px 72px rgba(165,74,255,0.22)",
          }}
        />
        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontFamily: "Poppins,sans-serif",
              fontWeight: 700,
              fontSize: "22px",
              color: "#6B21A8",
              marginBottom: "8px",
            }}
          >
            Find anyone. Anytime.
          </h2>
          <p
            style={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "14px",
              color: "#7C3AED",
              maxWidth: "280px",
              lineHeight: "1.6",
            }}
          >
            Connect with trusted local service providers for any favor,
            anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Mock addresses for search suggestions ─────────────── */
const MOCK_SUGGESTIONS = [
  { address: "12 A, High Street, Downtown", city: "Texas, US" },
  { address: "45, Main Boulevard, Gulberg III", city: "Lahore, PK" },
  { address: "7, Blue Area, F-6/3", city: "Islamabad, PK" },
  { address: "23, Clifton, Block 5", city: "Karachi, PK" },
  { address: "89, DHA Phase 6, Sector B", city: "Lahore, PK" },
  { address: "34, Commercial Avenue, DHA", city: "Karachi, PK" },
];

type SelectedLoc = { address: string; city: string };
type LabelType = "home" | "work" | "partner" | "other" | "";

type AccountFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  password: string;
};

type Step1Draft = {
  fullName: string;
  email: string;
  countryIso: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  confirm: string;
};

type LocationFormData = {
  location: string;
  locationDetail: string;
  label: string;
};

type SignupStep = 1 | 2 | 3;

const SIGNUP_DRAFT_KEY = "whoCan_signupDraft";
const EMPTY_DRAFT: Step1Draft = {
  fullName: "",
  email: "",
  countryIso: "US",
  phone: "",
  dateOfBirth: "",
  gender: "",
  password: "",
  confirm: "",
};

function parseSignupStep(value: string | null): SignupStep {
  if (value === "2" || value === "3") return Number(value) as SignupStep;
  return 1;
}

function loadSignupDraft(): {
  draft: Step1Draft;
  account: AccountFormData | null;
} | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      draft?: Step1Draft;
      account?: AccountFormData | null;
    };
    if (!parsed?.draft) return null;
    return {
      draft: { ...EMPTY_DRAFT, ...parsed.draft },
      account: parsed.account ?? null,
    };
  } catch {
    return null;
  }
}

function saveSignupDraft(draft: Step1Draft, account: AccountFormData | null) {
  sessionStorage.setItem(
    SIGNUP_DRAFT_KEY,
    JSON.stringify({ draft, account }),
  );
}

function clearSignupDraft() {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}

function StepBackButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Back"
      className="auth-signup-back"
      style={{
        position: "absolute",
        zIndex: 2,
        width: "44px",
        height: "44px",
        background: "#ffffff",
        border: "1px solid #EAECF0",
        borderRadius: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.borderColor = BRAND;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EAECF0";
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 12H5M5 12l7 7M5 12l7-7"
          stroke="#344054"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function getRegisterErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return "Registration failed. Please try again.";
}

/* ══════════════════════════════════════════════════════════
   STEP 1 — Sign Up form
══════════════════════════════════════════════════════════ */
function Step1({
  initial,
  onNext,
}: {
  initial: Step1Draft;
  onNext: (draft: Step1Draft, account: AccountFormData) => void;
}) {
  const [name, setName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [countryIso, setCountryIso] = useState(initial.countryIso);
  const [phone, setPhone] = useState(initial.phone);
  const [dob, setDob] = useState(initial.dateOfBirth);
  const [gender, setGender] = useState(initial.gender);
  const [password, setPassword] = useState(initial.password);
  const [confirm, setConfirm] = useState(initial.confirm);
  const [formError, setFormError] = useState("");

  const handleContinue = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !dob.trim() ||
      !gender ||
      !password
    ) {
      setFormError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    const country = getCountryByIso(countryIso) ?? COUNTRY_DIAL_CODES.find((c) => c.iso === "US")!;
    const national = phone.replace(/[^\d]/g, "").replace(/^0+/, "");
    const draft: Step1Draft = {
      fullName: name.trim(),
      email: email.trim(),
      countryIso,
      phone,
      dateOfBirth: dob.trim(),
      gender,
      password,
      confirm,
    };
    setFormError("");
    onNext(draft, {
      fullName: draft.fullName,
      email: draft.email,
      phoneNumber: `${country.dial}${national}`,
      dateOfBirth: draft.dateOfBirth,
      gender,
      password,
    });
  };

  return (
    <div className="auth-signup-form">
      {/* Logo above form */}
      <div className="auth-signup-logo">
        <WhoCanLogo size={110} />
      </div>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 className="auth-signup-title">
          Sign Up
        </h1>
        <p
          style={{
            fontFamily: "Poppins,sans-serif",
            fontSize: "15px",
            color: "#667085",
          }}
        >
          Let's Create Your Account
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <PillInput
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChange={setName}
        />
        <PillInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
        />

        {/* Phone */}
        <div>
          <label
            style={{
              fontFamily: "Poppins,sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              color: "#344054",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Phone number
          </label>
          <div className="auth-signup-phone">
            <CountryCodeSelect value={countryIso} onChange={setCountryIso} />
            <input
              type="tel"
              placeholder="Type here"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "Poppins,sans-serif",
                fontSize: "15px",
                color: "#101828",
                background: "#ffffff",
                border: "1.5px solid #D0D5DD",
                borderRadius: PILL,
                padding: "12px 20px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = BRAND;
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px rgba(165,74,255,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#D0D5DD";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Date of Birth + Gender */}
        <div className="auth-signup-pair">
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#344054",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Date of birth
            </label>
            <BirthDatePicker value={dob} onChange={setDob} />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: "#344054",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Gender
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "14px",
                  color: gender ? "#101828" : "#98A2B3",
                  background: "#ffffff",
                  border: "1.5px solid #D0D5DD",
                  borderRadius: PILL,
                  padding: "12px 40px 12px 18px",
                  outline: "none",
                  boxSizing: "border-box",
                  appearance: "none",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = BRAND;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#D0D5DD";
                }}
              >
                <option value="">Select one</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
              <svg
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#98A2B3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <PillInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
        />
        <PillInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={setConfirm}
        />
      </div>

      {formError && (
        <p
          style={{
            fontFamily: "Poppins,sans-serif",
            fontSize: "13px",
            color: "#D92D20",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {formError}
        </p>
      )}

      <button
        onClick={handleContinue}
        style={{
          width: "100%",
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "16px",
          color: "#ffffff",
          background: GRAD,
          border: "none",
          borderRadius: PILL,
          padding: "14px",
          cursor: "pointer",
          marginBottom: "20px",
          boxShadow: "0 4px 16px rgba(165,74,255,0.35)",
          transition: "opacity 0.2s,transform 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.opacity = "0.9";
          el.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }}
      >
        Sign Up
      </button>
      <p
        style={{
          textAlign: "center",
          fontFamily: "Poppins,sans-serif",
          fontSize: "14px",
          color: "#344054",
        }}
      >
        Already have an account?{" "}
        <a
          href="/auth/login"
          style={{
            fontFamily: "Poppins,sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            color: BRAND,
            textDecoration: "none",
          }}
        >
          Login
        </a>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 2 — Location Access
══════════════════════════════════════════════════════════ */
function Step2({
  onAllow,
  onAddManual,
  onSkip,
  isLoading = false,
  error,
}: {
  onAllow: () => void;
  onAddManual: () => void;
  onSkip: () => void;
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <div className="auth-signup-form auth-signup-form-wide">
      <h2
        style={{
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "22px",
          color: BRAND,
          marginBottom: "10px",
        }}
      >
        Location Access
      </h2>
      <p
        style={{
          fontFamily: "Poppins,sans-serif",
          fontSize: "14px",
          color: "#667085",
          marginBottom: "32px",
          lineHeight: "1.6",
        }}
      >
        Allow WhoCan App to access your location for better experience
      </p>

      {/* Circular map */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "36px",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid rgba(165,74,255,0.2)",
            boxShadow: "0 12px 40px rgba(165,74,255,0.18)",
            position: "relative",
          }}
        >
          <img
            src={MAP_IMG}
            alt="Map"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Pin */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                fill="#D92D20"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="10" r="3" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* Why section */}
      <h3
        style={{
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "17px",
          color: "#101828",
          marginBottom: "16px",
        }}
      >
        How does enabling location access help me?
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          marginBottom: "36px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#F4EBFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                stroke={BRAND}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="4" stroke={BRAND} strokeWidth="2" />
            </svg>
          </div>
          <p
            style={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "14px",
              color: "#344054",
              lineHeight: "1.5",
            }}
          >
            Let buyers find you using your location
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#F4EBFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke={BRAND}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            style={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "14px",
              color: "#344054",
              lineHeight: "1.5",
            }}
          >
            Exclusive offers near your area
          </p>
        </div>
      </div>

      {/* Buttons */}
      {error && (
        <p
          style={{
            fontFamily: "Poppins,sans-serif",
            fontSize: "13px",
            color: "#D92D20",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          onClick={onAllow}
          disabled={isLoading}
          style={{
            width: "100%",
            fontFamily: "Poppins,sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            color: "#ffffff",
            background: GRAD,
            border: "none",
            borderRadius: PILL,
            padding: "14px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(165,74,255,0.35)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = isLoading ? "0.7" : "1";
          }}
        >
          {isLoading ? "Creating account..." : "Allow Location Access"}
        </button>
        <button
          onClick={onAddManual}
          disabled={isLoading}
          style={{
            width: "100%",
            fontFamily: "Poppins,sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            color: BRAND,
            background: "#F4EBFF",
            border: "none",
            borderRadius: PILL,
            padding: "14px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLElement).style.background = "#EDD9FF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#F4EBFF";
          }}
        >
          Add Another Location
        </button>
        <button
          onClick={onSkip}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            fontFamily: "Poppins,sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            color: BRAND,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            padding: "8px",
            textAlign: "center",
            width: "100%",
          }}
        >
          I'll do it later
        </button>
      </div>
    </div>
  );
}

const STEP3_LABELS: { key: LabelType; icon: React.ReactNode; text: string }[] =
  [
    {
      key: "home",
      text: "Home",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9 22 9 12 15 12 15 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: "work",
      text: "Work",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="7"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="14"
            x2="14"
            y2="14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: "partner",
      text: "Partner",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: "other",
      text: "Other",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

/* ══════════════════════════════════════════════════════════
   STEP 3 — Add Location (with details inline)
══════════════════════════════════════════════════════════ */
function Step3({
  onSkip,
  onSave,
  isLoading = false,
  error,
}: {
  onSkip: () => void;
  onSave: (data: LocationFormData) => void;
  isLoading?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof MOCK_SUGGESTIONS>([]);
  const [selected, setSelected] = useState<SelectedLoc | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [floor, setFloor] = useState("Ground floor");
  const [label, setLabel] = useState<LabelType>("home");
  const [customName, setCustomName] = useState("");
  const [floorFocused, setFloorFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null!);

  const handleSearch = (val: string) => {
    setQuery(val);
    setSelected(null);
    clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const matches = MOCK_SUGGESTIONS.filter(
        (s) =>
          s.address.toLowerCase().includes(val.toLowerCase()) ||
          s.city.toLowerCase().includes(val.toLowerCase()),
      );
      setSuggestions(matches.length > 0 ? matches : MOCK_SUGGESTIONS);
      setShowDrop(true);
    }, 350);
  };

  const pickSuggestion = (s: (typeof MOCK_SUGGESTIONS)[0]) => {
    setSelected(s);
    setQuery(s.address);
    setShowDrop(false);
  };

  return (
    <div className="auth-signup-form auth-signup-form-wide">
      <h2
        style={{
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "22px",
          color: BRAND,
          marginBottom: "6px",
        }}
      >
        Add Location
      </h2>
      <p
        style={{
          fontFamily: "Poppins,sans-serif",
          fontSize: "14px",
          color: "#667085",
          marginBottom: "24px",
        }}
      >
        Update your current location
      </p>

      {/* Map */}
      <div
        style={{
          borderRadius: "18px",
          overflow: "hidden",
          marginBottom: "20px",
          height: "160px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <img
          src={MAP_IMG}
          alt="Map"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-100%)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
              fill="#D92D20"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <svg
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="8" stroke="#98A2B3" strokeWidth="2" />
          <path
            d="M21 21l-4.35-4.35"
            stroke="#98A2B3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search an address..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "Poppins,sans-serif",
            fontSize: "14px",
            color: "#101828",
            background: "#ffffff",
            border: "1.5px solid #D0D5DD",
            borderRadius: PILL,
            padding: "13px 50px 13px 46px",
            outline: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            transition: "border-color 0.15s,box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = BRAND;
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(165,74,255,0.12)";
          }}
          onBlur={(e) => {
            setTimeout(() => setShowDrop(false), 200);
            e.currentTarget.style.borderColor = "#D0D5DD";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
          }}
        />
        <button
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={BRAND} strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill={BRAND} />
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="6"
              stroke={BRAND}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="18"
              x2="12"
              y2="22"
              stroke={BRAND}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="12"
              x2="6"
              y2="12"
              stroke={BRAND}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="12"
              x2="22"
              y2="12"
              stroke={BRAND}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {showDrop && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(16,24,40,0.14)",
              border: "1px solid #EAECF0",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => pickSuggestion(s)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    i < suggestions.length - 1 ? "1px solid #F2F4F7" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                <svg
                  style={{ marginTop: "2px", flexShrink: 0 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                    stroke="#98A2B3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                    stroke="#98A2B3"
                    strokeWidth="2"
                  />
                </svg>
                <div>
                  <p
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#101828",
                      lineHeight: "1.4",
                    }}
                  >
                    {s.address}
                  </p>
                  <p
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "12px",
                      color: "#98A2B3",
                      marginTop: "1px",
                    }}
                  >
                    {s.city}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected location card */}
      {selected ? (
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontFamily: "Poppins,sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              color: "#101828",
              marginBottom: "8px",
            }}
          >
            Your location
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "12px 16px",
              border: `1.5px solid ${BRAND}`,
              borderRadius: "14px",
              background: "rgba(165,74,255,0.03)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <svg
                style={{ marginTop: "2px", flexShrink: 0 }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                  stroke={BRAND}
                  strokeWidth="2"
                />
                <circle cx="12" cy="10" r="3" stroke={BRAND} strokeWidth="2" />
              </svg>
              <div>
                <p
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#101828",
                  }}
                >
                  {selected.address}
                </p>
                <p
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "12px",
                    color: "#667085",
                    marginTop: "2px",
                  }}
                >
                  {selected.city}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                lineHeight: 0,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#667085"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Floor input */}
          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <label
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#101828",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Floor
            </label>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. Ground floor"
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "Poppins,sans-serif",
                fontSize: "14px",
                color: "#101828",
                background: "#ffffff",
                border: `1.5px solid ${floorFocused ? BRAND : "#EAECF0"}`,
                borderRadius: PILL,
                padding: "11px 20px",
                outline: "none",
                boxShadow: floorFocused
                  ? "0 0 0 4px rgba(165,74,255,0.12)"
                  : "0 1px 2px rgba(16,24,40,0.05)",
                transition: "border-color 0.15s,box-shadow 0.15s",
              }}
              onFocus={() => setFloorFocused(true)}
              onBlur={() => setFloorFocused(false)}
            />
          </div>

          {/* Label picker */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#101828",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Add a label
            </label>
            <div className="auth-signup-labels">
              {STEP3_LABELS.map((l) => {
                const active = label === l.key;
                return (
                  <div
                    key={l.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => setLabel(l.key)}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: active ? GRAD : "#F2F4F7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                        color: active ? "#ffffff" : "#667085",
                        border: active ? "none" : "1.5px solid #EAECF0",
                      }}
                    >
                      {l.icon}
                    </div>
                    <span
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontSize: "11px",
                        fontWeight: active ? 700 : 500,
                        color: active ? BRAND : "#667085",
                      }}
                    >
                      {l.text}
                    </span>
                  </div>
                );
              })}
            </div>
            {label === "other" && (
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="eg. Admin house"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "13px",
                  color: "#101828",
                  background: "#ffffff",
                  border: "1.5px solid #EAECF0",
                  borderRadius: PILL,
                  padding: "11px 20px",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
                  transition: "border-color 0.15s,box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = BRAND;
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(165,74,255,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#EAECF0";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(16,24,40,0.05)";
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
          <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            fill="none"
            style={{ marginBottom: "12px" }}
          >
            <circle cx="50" cy="50" r="42" fill="#F4EBFF" />
            <circle cx="38" cy="42" r="8" fill="#F4A261" />
            <rect x="26" y="52" width="24" height="20" rx="6" fill="#FF8C42" />
            <path
              d="M62 28c0 10-13 20-13 20s-13-10-13-20a13 13 0 0 1 26 0z"
              fill={BRAND}
              opacity="0.85"
            />
            <circle cx="62" cy="28" r="5" fill="white" />
          </svg>
          <p
            style={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "13px",
              color: "#98A2B3",
              lineHeight: "1.6",
              maxWidth: "240px",
              margin: "0 auto",
            }}
          >
            Search an address or locate pin
            <br />
            on map of your location
          </p>
        </div>
      )}

      {/* Footer buttons */}
      <div className="auth-signup-actions">
        <button
          onClick={onSkip}
          disabled={isLoading}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            fontFamily: "Poppins,sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            color: BRAND,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            padding: "14px",
            textAlign: "center",
          }}
        >
          Skip for now
        </button>
        <button
          onClick={() => {
            if (!selected || isLoading) return;
            onSave({
              location: `${selected.address}, ${selected.city}`,
              locationDetail: floor.trim(),
              label:
                label === "other"
                  ? customName.trim() || "other"
                  : label || "home",
            });
          }}
          disabled={!selected || isLoading}
          style={{
            flex: 2,
            fontFamily: "Poppins,sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            color: "#ffffff",
            background: selected && !isLoading ? GRAD : "#D0D5DD",
            border: "none",
            borderRadius: PILL,
            padding: "14px",
            cursor: selected && !isLoading ? "pointer" : "not-allowed",
            boxShadow:
              selected && !isLoading
                ? "0 4px 16px rgba(165,74,255,0.3)"
                : "none",
            transition: "background 0.2s",
          }}
        >
          {isLoading ? "Creating account..." : "Add Location"}
        </button>
      </div>
      {error && (
        <p
          style={{
            fontFamily: "Poppins,sans-serif",
            fontSize: "13px",
            color: "#D92D20",
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedStep = parseSignupStep(searchParams.get("step"));
  const [draft, setDraft] = useState<Step1Draft>(EMPTY_DRAFT);
  const [account, setAccount] = useState<AccountFormData | null>(null);
  const [ready, setReady] = useState(false);
  const [apiError, setApiError] = useState("");
  const [registerBuyer, { isLoading }] = useRegisterBuyerMutation();

  useEffect(() => {
    const saved = loadSignupDraft();
    if (saved) {
      setDraft(saved.draft);
      setAccount(saved.account);
    }
    setReady(true);
  }, []);

  const step: SignupStep =
    ready && requestedStep > 1 && !account ? 1 : requestedStep;

  useEffect(() => {
    if (!ready) return;
    if (requestedStep > 1 && !account) {
      router.replace("/auth/signup?step=1", { scroll: false });
    }
  }, [ready, requestedStep, account, router]);

  const goToStep = (next: SignupStep, mode: "push" | "replace" = "push") => {
    const href = `/auth/signup?step=${next}`;
    if (mode === "replace") {
      router.replace(href, { scroll: false });
      return;
    }
    router.push(href, { scroll: false });
  };

  const goBack = () => {
    goToStep(step === 3 ? 2 : 1, "replace");
  };

  const completeSignup = async (location?: LocationFormData) => {
    if (!account) {
      setApiError("Please complete the sign up form first.");
      goToStep(1);
      return;
    }

    setApiError("");
    try {
      const result = await registerBuyer({
        ...account,
        ...(location ?? {}),
      }).unwrap();

      localStorage.setItem("whoCan_loggedIn", "true");
      clearSignupDraft();

      await showSuccess("Success", result.message || "User registered successfully");

      goHomeAfterAuth();
    } catch (err) {
      setApiError(getRegisterErrorMessage(err));
    }
  };

  return (
    <div
      className="auth-signup"
      style={{ background: "#ffffff" }}
    >
      <LeftPanel />

      <div
        className={`auth-signup-right${step > 1 ? " auth-signup-right--paged" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(165,74,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(165,74,255,0.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        {step > 1 && (
          <StepBackButton onClick={goBack} disabled={isLoading} />
        )}

        {/* Step indicator — steps 2 and 3 */}
        {step > 1 && (
          <div
            className="auth-signup-steps"
            style={{
              position: "absolute",
              display: "flex",
              gap: "8px",
              zIndex: 1,
            }}
          >
            {([2, 3] as const).map((s) => (
              <div
                key={s}
                style={{
                  width: s === step ? "24px" : "8px",
                  height: "8px",
                  borderRadius: PILL,
                  background: s <= step ? BRAND : "#E4E7EC",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {ready && (
            <div
              style={{
                display: step === 1 ? "flex" : "none",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Step1
                initial={draft}
                onNext={(nextDraft, data) => {
                  setDraft(nextDraft);
                  setAccount(data);
                  saveSignupDraft(nextDraft, data);
                  setApiError("");
                  goToStep(2);
                }}
              />
            </div>
          )}
          {step === 2 && (
            <Step2
              onAllow={() => completeSignup()}
              onAddManual={() => {
                setApiError("");
                goToStep(3);
              }}
              onSkip={() => completeSignup()}
              isLoading={isLoading}
              error={apiError}
            />
          )}
          {step === 3 && (
            <Step3
              onSkip={() => completeSignup()}
              onSave={(location) => completeSignup(location)}
              isLoading={isLoading}
              error={apiError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
          minHeight: "100dvh",
            background: "#ffffff",
          }}
        />
      }
    >
      <SignupFlow />
    </Suspense>
  );
}
