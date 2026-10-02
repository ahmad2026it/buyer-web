import type { Metadata } from "next";

/** Production site origin used for canonicals, sitemap, and Open Graph. */
export const SITE_NAME = "WhoCan";

export const SITE_DEFAULT_TITLE =
  "WhoCan — Local Services Marketplace in Maryland";

export const SITE_DEFAULT_DESCRIPTION =
  "WhoCan connects Buyers with Providers on a local services marketplace, starting in Maryland. Find cleaning, handyman help, lawn care, and car detailing.";

export const ORGANIZATION_ALTERNATE_NAME = "WhoCan App";

/** Official profile URLs. Share links and short links are omitted. */
export const ORGANIZATION_PROFILES = {
  instagram: "https://www.instagram.com/whocan.app",
  facebook: "https://www.facebook.com/WhoCanApp",
  pinterest: "https://www.pinterest.com/whocan_online/",
} as const;

export const ORGANIZATION_SAME_AS = [
  ORGANIZATION_PROFILES.instagram,
  ORGANIZATION_PROFILES.facebook,
  ORGANIZATION_PROFILES.pinterest,
] as const;

/** Official WhoCan mark, served from a stable public path. */
export const ORGANIZATION_LOGO_PATH = "/logo.svg";

export const SITE_OG_IMAGE_PATH = "/hero.webp";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "https://whocan-app.com";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  images?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  ogType = "website",
  images,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImages = (images?.length ? images : [SITE_OG_IMAGE_PATH]).map(
    (image) => (image.startsWith("http") ? image : absoluteUrl(image)),
  );

  return {
    title,
    description,
    alternates: {
      canonical: path === "/" ? absoluteUrl("/") : absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_US",
      images: ogImages.map((image) => ({
        url: image,
        alt: title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

/** Static public routes that should appear in the sitemap. */
export const PUBLIC_SITEMAP_PATHS: {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/explore/favors", changeFrequency: "daily", priority: 0.9 },
  { path: "/explore/sellers", changeFrequency: "daily", priority: 0.9 },
  { path: "/marketplace", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/sellers", changeFrequency: "monthly", priority: 0.7 },
  { path: "/maryland", changeFrequency: "monthly", priority: 0.7 },
  { path: "/maryland/offer-services", changeFrequency: "monthly", priority: 0.6 },
  { path: "/maryland/cleaning", changeFrequency: "monthly", priority: 0.6 },
  { path: "/maryland/handyman", changeFrequency: "monthly", priority: 0.6 },
  { path: "/maryland/lawn-care", changeFrequency: "monthly", priority: 0.6 },
  { path: "/maryland/car-detailing", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.4 },
  { path: "/account-deletion", changeFrequency: "yearly", priority: 0.4 },
];
