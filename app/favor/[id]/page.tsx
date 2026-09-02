"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGateModal from "@/components/AuthGateModal";
import {
  useFavorDetailQuery,
  useMarkBuyerFavoriteMutation,
  useUnmarkBuyerFavoriteMutation,
} from "@/app/buyer/store/buyerFavorsAPI";
import type {
  BuyerFavorReview,
  BuyerRelatedFavor,
} from "@/app/buyer/store/buyerFavorsTypes";
import FavorImage, {
  isUsableImageUrl,
  pickFavorImage,
} from "@/components/FavorImage";
import PersonAvatar from "@/components/PersonAvatar";
import FavoriteButton from "@/components/FavoriteButton";
import { useAppSelector } from "@/store/hooks";
import { showToast } from "@/lib/toast";
import { useAccountRestriction } from "@/lib/useAccountRestriction";

const GRAD = "linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)";

type ProfileImageSource = {
  profileImage?: string | null;
  profileImageUrl?: string | null;
} | null | undefined;

function pickProfileImage(...sources: ProfileImageSource[]): string | null {
  return pickFavorImage(
    ...sources.flatMap((source) =>
      source ? [source.profileImageUrl, source.profileImage] : [],
    ),
  );
}

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={i <= n ? "#F79009" : "#EAECF0"}
            stroke="none"
          />
        </svg>
      ))}
    </span>
  );
}

function Badge({ b }: { b: string }) {
  return (
    <span
      style={{
        background: b === "Pro" || b === "Online" ? "#A54AFF" : "#344054",
        borderRadius: "9999px",
        padding: "3px 10px",
        fontFamily: "Poppins,sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.03em",
      }}
    >
      {b}
    </span>
  );
}

function Divider() {
  return (
    <div style={{ height: "1px", background: "#EAECF0", margin: "32px 0" }} />
  );
}

function displayCategory(type: string): string {
  if (!type) return "Favor";
  return type.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatMoney(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeReview(item: BuyerFavorReview, index: number) {
  const reviewer = item.reviewer || item.user;
  return {
    id: item.id ?? index,
    author: reviewer?.fullName || item.author || "Buyer",
    avatar: pickProfileImage(reviewer, { profileImage: item.avatar }),
    rating: Number(item.rating) || 0,
    date: formatDate(item.createdAt || item.date),
    text: item.comment || item.text || item.review || "",
  };
}

function asRelatedList(
  value: BuyerRelatedFavor | BuyerRelatedFavor[] | null | undefined,
): BuyerRelatedFavor[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function relatedImage(favor: BuyerRelatedFavor): string | null {
  return pickFavorImage(favor.images, favor.favorImage);
}

function relatedPrice(favor: BuyerRelatedFavor): number {
  return Number(favor.budget) || 0;
}

function relatedReviews(favor: BuyerRelatedFavor): number {
  return favor.totalReviews ?? favor.reviewCount ?? 0;
}

function relatedSellerName(favor: BuyerRelatedFavor): string {
  return favor.seller?.fullName || favor.user?.fullName || "Seller";
}

function relatedSellerAvatar(favor: BuyerRelatedFavor): string | null {
  return pickProfileImage(favor.seller, favor.user);
}

export default function FavorDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const token = useAppSelector((state) => state.auth.token);
  const { isInactive, message: inactiveMessage, guardActiveAccount } =
    useAccountRestriction();
  const favorId = Number(params.id);
  const skip = !Number.isFinite(favorId) || favorId <= 0;

  const { data, isLoading, isError } = useFavorDetailQuery(favorId, {
    skip,
  });
  const [markFavorite, { isLoading: markingFavorite }] =
    useMarkBuyerFavoriteMutation();
  const [unmarkFavorite, { isLoading: unmarkingFavorite }] =
    useUnmarkBuyerFavoriteMutation();
  const favor = data?.data?.favor;
  const related = data?.data?.relatedFavors;

  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState(
    "Log in to save this favor to your favorites.",
  );
  const favoriteBusy = markingFavorite || unmarkingFavorite;
  const canRequestBooking = Boolean(token);

  useEffect(() => {
    setActiveImg(0);
    setShowAll(false);
    setShareCopied(false);
  }, [favorId]);

  useEffect(() => {
    setLiked(Boolean(favor?.isFavorite));
  }, [favor?.isFavorite]);

  useEffect(() => {
    if (!shareCopied) return;
    const timer = window.setTimeout(() => setShareCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [shareCopied]);

  const images = useMemo(() => {
    if (!favor) return [];
    const fromGallery = (favor.images ?? []).filter(isUsableImageUrl);
    if (fromGallery.length) return fromGallery;
    const cover = pickFavorImage(favor.favorImage);
    return cover ? [cover] : [];
  }, [favor]);

  const galleryImages = images;
  const reviewItems = (favor?.reviews ?? []).map(normalizeReview);
  const visibleReviews = showAll ? reviewItems : reviewItems.slice(0, 2);
  const moreFromSeller = related?.sellerOtherFavors ?? [];
  const similarFavors = asRelatedList(related?.sameTypeOtherSellerFavor);

  const startingPrice = Number(favor?.budget) || 0;
  const total = startingPrice;

  const sellerName =
    favor?.seller?.fullName || favor?.user?.fullName || "Seller";
  const sellerAvatar = pickProfileImage(favor?.seller, favor?.user);
  const sellerId = favor?.seller?.id || favor?.user?.id;
  const sellerBadge = favor?.seller?.isOnline ? "Online" : "";
  const distance = favor?.seller?.distanceMiles ?? favor?.distanceMiles;
  const rating =
    favor?.averageRating != null ? Number(favor.averageRating) : null;
  const reviewCount = favor?.totalReviews ?? reviewItems.length;
  const category = displayCategory(favor?.type ?? "");
  const subCategories = favor?.subCategories ?? [];
  const locationLabel =
    favor?.location?.location || favor?.favorLocation?.location;

  const showLoading = !skip && isLoading;
  const showError = skip || (!isLoading && (isError || !favor));

  const openAuthGate = (message: string) => {
    setAuthMessage(message);
    setAuthOpen(true);
  };

  const handleRequestBooking = () => {
    if (!favor) return;
    if (!token) {
      openAuthGate("Log in to request a booking.");
      return;
    }
    if (!guardActiveAccount()) return;
    router.push(`/booking/${favor.id}`);
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      openAuthGate("Log in to save this favor to your favorites.");
      return;
    }
    if (!favor || favoriteBusy) return;

    try {
      if (liked) {
        await unmarkFavorite(favor.id).unwrap();
      } else {
        await markFavorite(favor.id).unwrap();
      }
    } catch {
      // axios interceptor already toasts API errors
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = favor?.title?.trim() || "hoCan favor";
    const text = `Check out this favor on hoCan: ${title}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      showToast("Link copied to clipboard", "success");
    } catch {
      showToast(
        "Couldn't copy the link. Please copy it from the address bar.",
        "error",
      );
    }
  };

  return (
    <>
      <Navbar />
      {authOpen && (
        <AuthGateModal
          onClose={() => setAuthOpen(false)}
          message={authMessage}
        />
      )}
      <main
        className="favor-page-main"
        style={{
          minHeight: "100vh",
          background: "#FAFAFA",
          paddingTop: "88px",
        }}
      >
        {showLoading ? (
          <div
            className="favor-page"
            style={{
              maxWidth: "1376px",
              margin: "0 auto",
              padding: "40px 32px 80px",
            }}
          >
            <div
              style={{
                height: "16px",
                width: "240px",
                background: "#EAECF0",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            />
            <div
              className="favor-gallery"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 352px",
                gap: "16px",
                marginBottom: "40px",
              }}
            >
              <div
                className="favor-gallery-main"
                style={{
                  height: "520px",
                  borderRadius: "20px",
                  background: "#F2F4F7",
                }}
              />
              <div
                className="favor-thumbs"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  className="favor-thumb"
                  style={{
                    height: "254px",
                    borderRadius: "16px",
                    background: "#F2F4F7",
                  }}
                />
                <div
                  className="favor-thumb"
                  style={{
                    height: "254px",
                    borderRadius: "16px",
                    background: "#F2F4F7",
                  }}
                />
              </div>
            </div>
            <div
              className="favor-body"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: "40px",
              }}
            >
              <div>
                <div
                  style={{
                    height: "36px",
                    width: "70%",
                    background: "#EAECF0",
                    borderRadius: "10px",
                    marginBottom: "16px",
                  }}
                />
                <div
                  style={{
                    height: "20px",
                    width: "40%",
                    background: "#F2F4F7",
                    borderRadius: "8px",
                    marginBottom: "24px",
                  }}
                />
                <div
                  style={{
                    height: "84px",
                    background: "#fff",
                    border: "1.5px solid #EAECF0",
                    borderRadius: "16px",
                  }}
                />
              </div>
              <div
                style={{
                  height: "360px",
                  background: "#fff",
                  border: "1.5px solid #EAECF0",
                  borderRadius: "24px",
                }}
              />
            </div>
          </div>
        ) : showError ? (
          <div
            className="favor-page"
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              padding: "120px 32px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#101828",
                marginBottom: "8px",
              }}
            >
              Unable to load this favor
            </h1>
            <p
              style={{
                fontFamily: "Poppins,sans-serif",
                fontSize: "14px",
                color: "#667085",
                marginBottom: "24px",
              }}
            >
              It may have been removed, or there was a problem fetching the
              details.
            </p>
            <button
              onClick={() => router.push("/explore")}
              style={{
                fontFamily: "Poppins,sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "#fff",
                background: GRAD,
                border: "none",
                borderRadius: "9999px",
                padding: "12px 24px",
                cursor: "pointer",
              }}
            >
              Back to Explore
            </button>
          </div>
        ) : favor ? (
          <>
            <div
              className="favor-page"
              style={{
                maxWidth: "1376px",
                margin: "0 auto",
                padding: "0 32px",
              }}
            >
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "20px 0",
                  fontFamily: "Poppins,sans-serif",
                  fontSize: "13px",
                  color: "#667085",
                  minWidth: 0,
                }}
              >
                <button
                  onClick={() => router.push("/")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#667085",
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "13px",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  Home
                </button>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="#D0D5DD"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <button
                  onClick={() => router.push("/explore")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#667085",
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "13px",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  Explore
                </button>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="#D0D5DD"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="favor-crumb-title"
                  style={{
                    color: "#101828",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "300px",
                  }}
                >
                  {favor.title}
                </span>
              </nav>

              <div
                className="favor-gallery"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    galleryImages.length > 1 ? "1fr 352px" : "1fr",
                  gap: "16px",
                  marginBottom: "40px",
                }}
              >
                <div
                  className="favor-gallery-main"
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    height: "520px",
                    cursor: "pointer",
                    background: "#F3E8FF",
                  }}
                >
                  <FavorImage
                    src={galleryImages[activeImg]}
                    alt={favor.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {galleryImages.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "9999px",
                        padding: "4px 12px",
                        fontFamily: "Poppins,sans-serif",
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    >
                      {Math.min(activeImg + 1, galleryImages.length)} /{" "}
                      {galleryImages.length}
                    </div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div
                    className={`favor-thumbs${galleryImages.slice(1, 3).length === 1 ? " favor-thumbs-one" : ""}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {galleryImages.slice(1, 3).map((img, idx) => {
                      const i = idx + 1;
                      const thumbHeight =
                        galleryImages.length === 2 ? "520px" : "254px";
                      return (
                        <div
                          key={`${img}-${i}`}
                          className="favor-thumb"
                          onClick={() => setActiveImg(i)}
                          style={{
                            height: thumbHeight,
                            flexShrink: 0,
                            borderRadius: "16px",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: `2.5px solid ${activeImg === i ? "#A54AFF" : "transparent"}`,
                            boxShadow:
                              activeImg === i
                                ? "0 0 0 3px rgba(165,74,255,0.2)"
                                : "none",
                            transition: "all 0.15s",
                            background: "#F3E8FF",
                          }}
                        >
                          <FavorImage
                            src={img}
                            alt={`View ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              opacity: activeImg === i ? 1 : 0.75,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className="favor-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 380px",
                  gap: "40px",
                  alignItems: "flex-start",
                  paddingBottom: "80px",
                }}
              >
                <div>
                  <div
                    className="favor-title-row"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      marginBottom: "14px",
                    }}
                  >
                    <h1
                      className="favor-title"
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontWeight: 800,
                        fontSize: "32px",
                        color: "#101828",
                        lineHeight: "1.2",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {favor.title}
                    </h1>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                        paddingTop: "4px",
                      }}
                    >
                      <FavoriteButton
                        liked={liked}
                        pending={favoriteBusy}
                        variant="surface"
                        size={40}
                        onClick={() => {
                          void handleToggleFavorite();
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void handleShare();
                        }}
                        aria-label={shareCopied ? "Link copied" : "Share"}
                        title={shareCopied ? "Link copied" : "Share this favor"}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "9999px",
                          background: shareCopied ? "#ECFDF3" : "#F9FAFB",
                          border: `1.5px solid ${shareCopied ? "#A7F3D0" : "#EAECF0"}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!shareCopied) {
                            e.currentTarget.style.borderColor = "#D0D5DD";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = shareCopied
                            ? "#A7F3D0"
                            : "#EAECF0";
                        }}
                      >
                        {shareCopied ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="#059669"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="18"
                              cy="5"
                              r="3"
                              stroke="#667085"
                              strokeWidth="2"
                            />
                            <circle
                              cx="6"
                              cy="12"
                              r="3"
                              stroke="#667085"
                              strokeWidth="2"
                            />
                            <circle
                              cx="18"
                              cy="19"
                              r="3"
                              stroke="#667085"
                              strokeWidth="2"
                            />
                            <line
                              x1="8.59"
                              y1="13.51"
                              x2="15.42"
                              y2="17.49"
                              stroke="#667085"
                              strokeWidth="2"
                            />
                            <line
                              x1="15.41"
                              y1="6.51"
                              x2="8.59"
                              y2="10.49"
                              stroke="#667085"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontSize: "12px",
                        color: "#667085",
                        fontWeight: 500,
                      }}
                    >
                      Category:
                    </span>
                    <span
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#344054",
                        background: "#ffffff",
                        border: "1px solid #EAECF0",
                        borderRadius: "9999px",
                        padding: "3px 14px",
                        boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
                      }}
                    >
                      {category}
                    </span>
                  </div>

                  {subCategories.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "20px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          fontSize: "12px",
                          color: "#667085",
                          fontWeight: 500,
                        }}
                      >
                        Sub-category:
                      </span>
                      {subCategories.map((c) => (
                        <span
                          key={c.id}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#A54AFF",
                            background: "#F4EBFF",
                            border: "1px solid #DFBAFF",
                            borderRadius: "9999px",
                            padding: "3px 12px",
                          }}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 20px",
                      background: "#fff",
                      border: "1.5px solid #EAECF0",
                      borderRadius: "16px",
                      cursor: sellerId ? "pointer" : "default",
                      transition: "border-color 0.15s",
                      marginBottom: "0",
                      minWidth: 0,
                    }}
                    onClick={() => {
                      if (sellerId) router.push(`/seller/${sellerId}`);
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(165,74,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#EAECF0";
                    }}
                  >
                    <PersonAvatar
                      src={sellerAvatar}
                      name={sellerName}
                      size={52}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 700,
                            fontSize: "15px",
                            color: "#101828",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sellerName}
                        </span>
                        {sellerBadge && <Badge b={sellerBadge} />}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            color: "#F79009",
                            fontWeight: 600,
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14">
                            <polygon
                              fill="#F79009"
                              stroke="none"
                              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                            />
                          </svg>
                          {rating != null ? rating.toFixed(1) : "—"}
                        </span>
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "12px",
                            color: "#667085",
                          }}
                        >
                          {reviewCount.toLocaleString()} reviews
                        </span>
                        {distance != null && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "12px",
                              color: "#667085",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                stroke="#98A2B3"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="10"
                                r="3"
                                stroke="#98A2B3"
                                strokeWidth="2"
                              />
                            </svg>
                            {distance} miles away
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: "#98A2B3", flexShrink: 0 }}
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="#98A2B3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <Divider />

                  <div
                    className="favor-stats"
                    style={{
                      display: "grid",
                      gridTemplateColumns: locationLabel
                        ? "repeat(3,1fr)"
                        : "repeat(2,1fr)",
                      gap: "16px",
                      marginBottom: "0",
                    }}
                  >
                    {[
                      {
                        label: "Rating",
                        value: rating != null ? `${rating.toFixed(1)} ★` : "—",
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <polygon
                              fill="#F79009"
                              stroke="none"
                              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                            />
                          </svg>
                        ),
                      },
                      {
                        label: "Reviews",
                        value: reviewCount.toLocaleString(),
                        icon: (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                              stroke="#A54AFF"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ),
                      },
                      ...(locationLabel
                        ? [
                            {
                              label: "Location",
                              value: locationLabel,
                              icon: (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                    stroke="#A54AFF"
                                    strokeWidth="2"
                                  />
                                  <circle
                                    cx="12"
                                    cy="10"
                                    r="3"
                                    stroke="#A54AFF"
                                    strokeWidth="2"
                                  />
                                </svg>
                              ),
                            },
                          ]
                        : []),
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: "#fff",
                          border: "1.5px solid #EAECF0",
                          borderRadius: "16px",
                          padding: "16px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "8px",
                          }}
                        >
                          {s.icon}
                        </div>
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "#101828",
                            marginBottom: "2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:
                              s.label === "Location" ? "normal" : "nowrap",
                          }}
                        >
                          {s.value}
                        </p>
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "12px",
                            color: "#667085",
                          }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  <div style={{ marginBottom: "0" }}>
                    <h2
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#101828",
                        marginBottom: "14px",
                      }}
                    >
                      About this service
                    </h2>
                    {(favor.description || "No description provided.")
                      .split("\n\n")
                      .map((p, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "15px",
                            color: "#475467",
                            lineHeight: "1.75",
                            marginBottom: "14px",
                          }}
                        >
                          {p}
                        </p>
                      ))}
                  </div>

                  <Divider />

                  <div>
                    <div
                      className="favor-head-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 700,
                            fontSize: "20px",
                            color: "#101828",
                            marginBottom: "6px",
                          }}
                        >
                          Reviews &amp; Ratings
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Stars n={Math.round(rating ?? 0)} size={16} />
                          <span
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontWeight: 700,
                              fontSize: "15px",
                              color: "#101828",
                            }}
                          >
                            {rating != null ? rating.toFixed(1) : "—"}
                          </span>
                          <span
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "13px",
                              color: "#667085",
                            }}
                          >
                            ({reviewCount.toLocaleString()} reviews)
                          </span>
                        </div>
                      </div>
                      {reviewItems.length > 2 && (
                        <button
                          onClick={() => setShowAll((s) => !s)}
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#A54AFF",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {showAll ? "Show less" : "See all"}
                        </button>
                      )}
                    </div>
                    {visibleReviews.length === 0 ? (
                      <p
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          fontSize: "14px",
                          color: "#667085",
                        }}
                      >
                        No reviews yet.
                      </p>
                    ) : (
                      <div
                        className="favor-reviews"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            visibleReviews.length === 1 ? "1fr" : "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        {visibleReviews.map((r) => (
                          <div
                            key={r.id}
                            style={{
                              background: "#fff",
                              border: "1.5px solid #EAECF0",
                              borderRadius: "16px",
                              padding: "20px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "12px",
                              }}
                            >
                              <PersonAvatar
                                src={r.avatar}
                                name={r.author}
                                size={40}
                              />
                              <div>
                                <p
                                  style={{
                                    fontFamily: "Poppins,sans-serif",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    color: "#101828",
                                  }}
                                >
                                  {r.author}
                                </p>
                                {r.date && (
                                  <p
                                    style={{
                                      fontFamily: "Poppins,sans-serif",
                                      fontSize: "11px",
                                      color: "#98A2B3",
                                    }}
                                  >
                                    {r.date}
                                  </p>
                                )}
                              </div>
                              <div style={{ marginLeft: "auto" }}>
                                <Stars n={r.rating} size={13} />
                              </div>
                            </div>
                            {r.text && (
                              <p
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "13px",
                                  color: "#475467",
                                  lineHeight: "1.6",
                                }}
                              >
                                {r.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {moreFromSeller.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <div
                          className="favor-head-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                          }}
                        >
                          <h2
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontWeight: 700,
                              fontSize: "20px",
                              color: "#101828",
                            }}
                          >
                            More from this pro
                          </h2>
                          {sellerId && moreFromSeller.length > 4 && (
                            <button
                              onClick={() => router.push(`/seller/${sellerId}`)}
                              style={{
                                fontFamily: "Poppins,sans-serif",
                                fontWeight: 600,
                                fontSize: "14px",
                                color: "#A54AFF",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                              }}
                            >
                              See all
                            </button>
                          )}
                        </div>
                        <div
                          className="favor-cards"
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${Math.min(moreFromSeller.length, 4)},1fr)`,
                            gap: "20px",
                          }}
                        >
                          {moreFromSeller.slice(0, 4).map((f) => (
                            <div
                              key={f.id}
                              onClick={() => router.push(`/favor/${f.id}`)}
                              style={{
                                background: "#fff",
                                borderRadius: "20px",
                                border: "1.5px solid #EAECF0",
                                cursor: "pointer",
                                transition:
                                  "border-color 0.2s, box-shadow 0.2s",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "rgba(165,74,255,0.3)";
                                el.style.boxShadow =
                                  "0 8px 24px rgba(165,74,255,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "#EAECF0";
                                el.style.boxShadow = "none";
                              }}
                            >
                              <div
                                style={{
                                  padding: "10px 10px 0",
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    height: "160px",
                                    borderRadius: "14px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <FavorImage
                                    src={relatedImage(f)}
                                    alt={f.title}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              </div>
                              <div
                                style={{
                                  padding: "12px 14px 14px",
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                <h3
                                  style={{
                                    fontFamily: "Poppins,sans-serif",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    color: "#101828",
                                    lineHeight: "1.4",
                                    margin: 0,
                                  }}
                                >
                                  {f.title}
                                </h3>
                                <span
                                  style={{
                                    fontFamily: "Poppins,sans-serif",
                                    fontWeight: 700,
                                    fontSize: "16px",
                                    color: "#8E40FF",
                                  }}
                                >
                                  from ${formatMoney(relatedPrice(f))}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingTop: "8px",
                                    borderTop: "1px solid #EAECF0",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      overflow: "hidden",
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    <PersonAvatar
                                      src={relatedSellerAvatar(f)}
                                      name={relatedSellerName(f)}
                                      size={24}
                                      border="1.5px solid #DFBAFF"
                                    />
                                    <span
                                      style={{
                                        fontFamily: "Poppins,sans-serif",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "#101828",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {relatedSellerName(f)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Stars
                                      n={Math.round(f.averageRating ?? 0)}
                                      size={11}
                                    />
                                    <span
                                      style={{
                                        fontFamily: "Poppins,sans-serif",
                                        fontSize: "11px",
                                        color: "#667085",
                                      }}
                                    >
                                      {relatedReviews(f).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="favor-booking-col"
                  style={{
                    position: "sticky",
                    top: "108px",
                    alignSelf: "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid #EAECF0",
                      borderRadius: "24px",
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(16,24,40,0.08)",
                    }}
                  >
                    <div
                      style={{
                        padding: "24px 24px 20px",
                        borderBottom: "1px solid #EAECF0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "6px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 800,
                            fontSize: "36px",
                            background: GRAD,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            lineHeight: 1,
                          }}
                        >
                          ${formatMoney(total)}
                        </p>
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            color: "#667085",
                          }}
                        >
                          starting price
                        </p>
                      </div>
                      {distance != null && (
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "12px",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "Poppins,sans-serif",
                              fontSize: "12px",
                              color: "#667085",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                stroke="#98A2B3"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="10"
                                r="3"
                                stroke="#98A2B3"
                                strokeWidth="2"
                              />
                            </svg>
                            {distance} miles away
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            color: "#667085",
                          }}
                        >
                          Starting price
                        </span>
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#101828",
                          }}
                        >
                          ${formatMoney(startingPrice)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "1px",
                          background: "#EAECF0",
                          margin: "12px 0",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "20px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 700,
                            fontSize: "15px",
                            color: "#101828",
                          }}
                        >
                          Total
                        </span>
                        <span
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 800,
                            fontSize: "20px",
                            background: GRAD,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          ${formatMoney(total)}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!canRequestBooking}
                        aria-describedby={
                          canRequestBooking
                            ? undefined
                            : "request-booking-login-hint"
                        }
                        onClick={handleRequestBooking}
                        style={{
                          width: "100%",
                          fontFamily: "Poppins,sans-serif",
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "#fff",
                          background: canRequestBooking ? GRAD : "#D0D5DD",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "14px",
                          cursor: canRequestBooking ? "pointer" : "not-allowed",
                          transition: "opacity 0.2s",
                          boxShadow: canRequestBooking
                            ? "0 4px 16px rgba(165,74,255,0.3)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!canRequestBooking) return;
                          (e.currentTarget as HTMLElement).style.opacity =
                            "0.9";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "1";
                        }}
                      >
                        Request Booking
                      </button>
                      {!canRequestBooking && (
                        <p
                          id="request-booking-login-hint"
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            color: "#667085",
                            textAlign: "center",
                            margin: "12px 0 0",
                            lineHeight: 1.5,
                          }}
                        >
                          Log in to request a booking.{" "}
                          <button
                            type="button"
                            onClick={() =>
                              openAuthGate("Log in to request a booking.")
                            }
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontWeight: 600,
                              fontSize: "13px",
                              color: "#A54AFF",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              textDecoration: "underline",
                              textUnderlineOffset: "2px",
                            }}
                          >
                            Log in
                          </button>
                        </p>
                      )}
                      {canRequestBooking && isInactive && (
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "13px",
                            color: "#B42318",
                            textAlign: "center",
                            margin: "12px 0 0",
                            lineHeight: 1.5,
                          }}
                        >
                          {inactiveMessage}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        padding: "0 24px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: sellerId ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (sellerId) router.push(`/seller/${sellerId}`);
                      }}
                    >
                      <PersonAvatar
                        src={sellerAvatar}
                        name={sellerName}
                        size={44}
                      />
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontWeight: 600,
                            fontSize: "13px",
                            color: "#101828",
                          }}
                        >
                          {sellerName}
                        </p>
                        <p
                          style={{
                            fontFamily: "Poppins,sans-serif",
                            fontSize: "11px",
                            color: "#667085",
                          }}
                        >
                          View full profile →
                        </p>
                      </div>
                      {sellerBadge && <Badge b={sellerBadge} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {similarFavors.length > 0 && (
              <div
                className="favor-similar"
                style={{
                  background: "#F9FAFB",
                  borderTop: "1px solid #EAECF0",
                  padding: "64px 0",
                }}
              >
                <div
                  className="favor-page"
                  style={{
                    maxWidth: "1376px",
                    margin: "0 auto",
                    padding: "0 32px",
                  }}
                >
                  <div
                    className="favor-head-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "28px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#A54AFF",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        You may also like
                      </p>
                      <h2
                        style={{
                          fontFamily: "Poppins,sans-serif",
                          fontWeight: 700,
                          fontSize: "24px",
                          color: "#101828",
                        }}
                      >
                        Explore similar favors
                      </h2>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/explore/search?category=${encodeURIComponent(category)}`,
                        )
                      }
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#A54AFF",
                        background: "#fff",
                        border: "1.5px solid #A54AFF",
                        borderRadius: "9999px",
                        padding: "10px 24px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#F8F0FF";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#fff";
                      }}
                    >
                      View all
                    </button>
                  </div>
                  <div
                    className="favor-cards"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(similarFavors.length, 4)},1fr)`,
                      gap: "20px",
                    }}
                  >
                    {similarFavors.slice(0, 4).map((f) => (
                      <div
                        key={f.id}
                        onClick={() => router.push(`/favor/${f.id}`)}
                        style={{
                          background: "#fff",
                          borderRadius: "20px",
                          border: "1.5px solid #EAECF0",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = "rgba(165,74,255,0.3)";
                          el.style.boxShadow =
                            "0 8px 24px rgba(165,74,255,0.1)";
                          el.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = "#EAECF0";
                          el.style.boxShadow = "none";
                          el.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ padding: "10px 10px 0", flexShrink: 0 }}>
                          <div
                            style={{
                              height: "180px",
                              borderRadius: "14px",
                              overflow: "hidden",
                            }}
                          >
                            <FavorImage
                              src={relatedImage(f)}
                              alt={f.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "12px 14px 14px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#101828",
                              lineHeight: "1.4",
                              margin: 0,
                            }}
                          >
                            {f.title}
                          </p>
                          <span
                            style={{
                              fontFamily: "Poppins,sans-serif",
                              fontWeight: 700,
                              fontSize: "18px",
                              color: "#8E40FF",
                            }}
                          >
                            ${formatMoney(relatedPrice(f))}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: "8px",
                              borderTop: "1px solid #EAECF0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                overflow: "hidden",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <PersonAvatar
                                src={relatedSellerAvatar(f)}
                                name={relatedSellerName(f)}
                                size={26}
                                border="1.5px solid #DFBAFF"
                              />
                              <span
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#344054",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {relatedSellerName(f)}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexShrink: 0,
                              }}
                            >
                              <Stars
                                n={Math.round(f.averageRating ?? 0)}
                                size={12}
                              />
                              <span
                                style={{
                                  fontFamily: "Poppins,sans-serif",
                                  fontSize: "11px",
                                  color: "#667085",
                                }}
                              >
                                ({relatedReviews(f)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="favor-mobile-cta">
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontWeight: 800,
                    fontSize: "22px",
                    color: "#8E40FF",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  ${formatMoney(total)}
                </p>
                <p
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontSize: "12px",
                    color: "#667085",
                    margin: "2px 0 0",
                  }}
                >
                  starting price
                </p>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  disabled={!canRequestBooking}
                  aria-describedby={
                    canRequestBooking
                      ? undefined
                      : "request-booking-login-hint-mobile"
                  }
                  onClick={handleRequestBooking}
                  style={{
                    fontFamily: "Poppins,sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#fff",
                    background: canRequestBooking ? GRAD : "#D0D5DD",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "12px 20px",
                    cursor: canRequestBooking ? "pointer" : "not-allowed",
                    boxShadow: canRequestBooking
                      ? "0 4px 16px rgba(165,74,255,0.3)"
                      : "none",
                  }}
                >
                  Request Booking
                </button>
                {!canRequestBooking && (
                  <p
                    id="request-booking-login-hint-mobile"
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "11px",
                      color: "#667085",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openAuthGate("Log in to request a booking.")
                      }
                      style={{
                        fontFamily: "Poppins,sans-serif",
                        fontWeight: 600,
                        fontSize: "11px",
                        color: "#A54AFF",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                      }}
                    >
                      Log in
                    </button>{" "}
                    to request a booking
                  </p>
                )}
                {canRequestBooking && isInactive && (
                  <p
                    style={{
                      fontFamily: "Poppins,sans-serif",
                      fontSize: "11px",
                      color: "#B42318",
                      margin: 0,
                      lineHeight: 1.4,
                      textAlign: "right",
                      maxWidth: 220,
                    }}
                  >
                    {inactiveMessage}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
