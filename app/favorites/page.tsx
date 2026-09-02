"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGateModal from "@/components/AuthGateModal";
import {
  BUYER_FAVORITES_LIST_PARAMS,
  useGetBuyerFavoritesQuery,
  useUnmarkBuyerFavoriteMutation,
} from "@/app/buyer/store/buyerFavorsAPI";
import type { BuyerFavor } from "@/app/buyer/store/buyerFavorsTypes";
import FavorImage, { pickFavorImage } from "@/components/FavorImage";
import FavoriteButton from "@/components/FavoriteButton";
import PersonAvatar from "@/components/PersonAvatar";
import { useAppSelector } from "@/store/hooks";
import { selectAuthToken } from "@/app/auth/store/authSlice";
import { getAuthToken } from "@/lib/storeAccess";

const GRAD = "linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)";
const BRAND = "#A54AFF";

function displayCategory(type: string): string {
  if (!type) return "Favor";
  return type.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatPrice(value: string | number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

/* ── Favor card ────────────────────────────────────────── */
function FavoriteCard({
  favor,
  onUnheart,
  removing,
}: {
  favor: BuyerFavor;
  onUnheart: () => void;
  removing?: boolean;
}) {
  const router = useRouter();
  const sellerName = favor.seller?.fullName || "Seller";
  const sellerAvatar = pickFavorImage(
    favor.seller?.profileImageUrl,
    favor.seller?.profileImage,
  );
  const rating =
    favor.averageRating != null ? Number(favor.averageRating).toFixed(1) : "—";
  const reviews = String(favor.reviewCount ?? favor.totalReviews ?? 0);
  const isOnline = Boolean(favor.seller?.isOnline);

  return (
    <div
      onClick={() => router.push(`/favor/${favor.id}`)}
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: "1.5px solid #EAECF0",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(165,74,255,0.3)";
        el.style.boxShadow = "0 8px 24px rgba(165,74,255,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#EAECF0";
        el.style.boxShadow = "none";
      }}
    >
      {/* Image zone */}
      <div
        style={{ position: "relative", padding: "10px 10px 0", flexShrink: 0 }}
      >
        <div
          style={{ height: "200px", borderRadius: "14px", overflow: "hidden" }}
        >
          <FavorImage
            src={pickFavorImage(favor.images, favor.favorImage)}
            alt={favor.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <FavoriteButton
          liked
          pending={removing}
          title="Remove from favorites"
          onClick={(event) => {
            event.stopPropagation();
            if (!removing) onUnheart();
          }}
        />
      </div>

      {/* Card body */}
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "10px",
        }}
      >
        {/* 1. Title */}
        <h3
          style={{
            fontFamily: "Poppins,sans-serif",
            fontWeight: 600,
            fontSize: "17px",
            color: "#101828",
            lineHeight: "1.4",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {favor.title}
        </h3>
        {/* 2. Price + Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "Poppins,sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#8E40FF",
            }}
          >
            {formatPrice(favor.budget)}
          </span>
          <span
            style={{
              fontFamily: "Poppins,sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#6941C6",
              background: "#F9F5FF",
              border: "1px solid #E9D7FE",
              borderRadius: "9999px",
              padding: "3px 10px",
            }}
          >
            {displayCategory(favor.type)}
          </span>
        </div>
        {/* 3. Seller + rating */}
        <div
          style={{
            paddingTop: "10px",
            borderTop: "1px solid #EAECF0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflow: "hidden",
              flex: 1,
              minWidth: 0,
            }}
          >
            <PersonAvatar src={sellerAvatar} name={sellerName} size={30} />
            <span
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#101828",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
              }}
            >
              {sellerName}
            </span>
            {isOnline && (
              <span
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "#A54AFF",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "2px 8px",
                  flexShrink: 0,
                  letterSpacing: "0.02em",
                }}
              >
                Online
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
              marginLeft: "4px",
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13">
              <polygon
                fill="#F79009"
                stroke="none"
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <span
              style={{
                fontFamily: "Poppins,sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#101828",
              }}
            >
              {rating}
            </span>
            <span
              style={{
                fontFamily: "Poppins,sans-serif",
                fontSize: "12px",
                color: "#D0D5DD",
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: "Poppins,sans-serif",
                fontSize: "12px",
                color: "#667085",
              }}
            >
              {reviews}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
function EmptyState() {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      {/* Illustration */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        {/* Outer glow ring */}
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(165,74,255,0.12) 0%,transparent 70%)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "#F4EBFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Broken heart SVG */}
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="#EDD9FF"
              stroke={BRAND}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Small floating hearts */}
          {[
            { size: 16, top: "-12px", right: "-8px", opacity: 0.5 },
            { size: 10, top: "-4px", left: "-14px", opacity: 0.35 },
            { size: 12, bottom: "-4px", right: "-14px", opacity: 0.4 },
          ].map((h, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: h.top,
                left: (h as { left?: string }).left,
                right: (h as { right?: string }).right,
                bottom: (h as { bottom?: string }).bottom,
                opacity: h.opacity,
              }}
            >
              <svg
                width={h.size}
                height={h.size}
                viewBox="0 0 24 24"
                fill={BRAND}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <h2
        style={{
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "22px",
          color: "#101828",
          marginBottom: "10px",
        }}
      >
        No favorites yet
      </h2>
      <p
        style={{
          fontFamily: "Poppins,sans-serif",
          fontSize: "15px",
          color: "#667085",
          lineHeight: "1.7",
          maxWidth: "360px",
          marginBottom: "32px",
        }}
      >
        Tap the heart on any favor you love and it'll appear here — so you can
        find it again in a flash.
      </p>
      <button
        onClick={() => router.push("/explore/search")}
        style={{
          fontFamily: "Poppins,sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          color: "#ffffff",
          background: GRAD,
          border: "none",
          borderRadius: "9999px",
          padding: "14px 36px",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(165,74,255,0.35)",
          transition: "transform 0.15s, opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-2px)";
          el.style.opacity = "0.92";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(0)";
          el.style.opacity = "1";
        }}
      >
        Explore favors
      </button>
    </div>
  );
}

function FavoriteCardSkeleton() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        border: "1.5px solid #EAECF0",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "10px 10px 0" }}>
        <div
          style={{
            height: "200px",
            borderRadius: "14px",
            background: "#F2F4F7",
          }}
        />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          style={{
            height: "18px",
            width: "70%",
            borderRadius: "6px",
            background: "#F2F4F7",
            marginBottom: "12px",
          }}
        />
        <div
          style={{
            height: "16px",
            width: "40%",
            borderRadius: "6px",
            background: "#F2F4F7",
            marginBottom: "16px",
          }}
        />
        <div
          style={{
            height: "30px",
            borderRadius: "8px",
            background: "#F9FAFB",
          }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function FavoritesPage() {
  const reduxToken = useAppSelector(selectAuthToken);
  const token = reduxToken || getAuthToken();
  const [authOpen, setAuthOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetBuyerFavoritesQuery(BUYER_FAVORITES_LIST_PARAMS, {
      skip: !token,
      refetchOnMountOrArgChange: true,
    });
  const [unmarkFavorite] = useUnmarkBuyerFavoriteMutation();

  const favorites = Array.isArray(data?.data?.favors) ? data.data.favors : [];
  const totalSaved = data?.data?.pagination?.total ?? favorites.length;
  const showListLoading = Boolean(token) && (isLoading || isFetching) && favorites.length === 0;

  const handleUnheart = async (id: number) => {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setRemovingId(id);
    try {
      await unmarkFavorite(id).unwrap();
    } catch {
      // axios interceptor already toasts API errors
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message="Log in to view and manage your favorites."
        />
      )}
      <main className="app-page" style={{ minHeight: "100dvh", background: "#FAFAFA" }}>
        {/* Header band */}
        <div
          className="app-page-band"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #EAECF0",
            paddingTop: "104px",
            paddingBottom: "32px",
          }}
        >
          <div
            className="app-page-inner"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
          >
            {/* Back link */}
            <a
              href="/explore/search"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "Poppins,sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#667085",
                textDecoration: "none",
                marginBottom: "16px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = BRAND;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#667085";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12l7 7M5 12l7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to explore
            </a>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "6px",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontWeight: 800,
                      fontSize: "30px",
                      color: "#101828",
                      lineHeight: "1.2",
                    }}
                  >
                    My Favorites
                  </h1>
                  {/* Heart icon next to heading */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#FEF0FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={BRAND}
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke={BRAND}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "15px",
                    color: "#667085",
                  }}
                >
                  All favors you've loved, in one place.
                </p>
              </div>

              {/* Count badge */}
              {token && totalSaved > 0 && (
                <div
                  style={{
                    background: "#F4EBFF",
                    border: "1.5px solid rgba(165,74,255,0.2)",
                    borderRadius: "9999px",
                    padding: "8px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={BRAND}>
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke={BRAND}
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: BRAND,
                    }}
                  >
                    {totalSaved} saved
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="app-page-body"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 24px 80px",
          }}
        >
          {!token ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "80px 24px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#101828",
                  marginBottom: 8,
                }}
              >
                Log in to view your favorites
              </h3>
              <p
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontSize: 14,
                  color: "#667085",
                  maxWidth: 360,
                  lineHeight: 1.65,
                  marginBottom: 20,
                }}
              >
                Sign in to see the favors you have saved.
              </p>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#fff",
                  background: GRAD,
                  border: "none",
                  borderRadius: "9999px",
                  padding: "11px 22px",
                  cursor: "pointer",
                }}
              >
                Log in
              </button>
            </div>
          ) : showListLoading ? (
            <div
                className="app-cards-grid"
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%), 1fr))",
                gap: "24px",
              }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <FavoriteCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "80px 24px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#101828",
                  marginBottom: 8,
                }}
              >
                Could not load favorites
              </h3>
              <p
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontSize: 14,
                  color: "#667085",
                  marginBottom: 20,
                }}
              >
                There was a problem fetching your saved favors.
              </p>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: BRAND,
                  background: "#F4EBFF",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "11px 22px",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div
                className="app-cards-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%), 1fr))",
                  gap: "24px",
                }}
              >
                {favorites.map((favor) => (
                  <FavoriteCard
                    key={favor.id}
                    favor={favor}
                    removing={removingId === favor.id}
                    onUnheart={() => {
                      void handleUnheart(favor.id);
                    }}
                  />
                ))}
              </div>

              {/* Bottom note */}
              <p
                style={{
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "13px",
                  color: "#98A2B3",
                  textAlign: "center",
                  marginTop: "48px",
                }}
              >
                Click the heart on any card to remove it from your favorites.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
