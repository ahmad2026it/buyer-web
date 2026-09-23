import type { Metadata } from "next";

/** Production site origin used for canonicals, sitemap, and Open Graph. */
export const SITE_NAME = "WhoCan";

export const SITE_DEFAULT_TITLE =
  "WhoCan — Local Services, Favors, and a Nearby Marketplace";

export const SITE_DEFAULT_DESCRIPTION =
  "Find local help, post a favor, or buy and sell nearby on WhoCan. Browse services and goods, compare profiles, and connect with people in your area.";

/** Canonical profile URLs for Organization schema. Share and short links are omitted. */
export const ORGANIZATION_SAME_AS = [
  "https://www.instagram.com/whocan.app",
  "https://www.facebook.com/WhoCanApp",
  "https://www.pinterest.com/whocan_online/",
] as const;

export const SITE_OG_IMAGE_PATH = "/hero.png";

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
        width: 1200,
        height: 630,
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
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.4 },
  { path: "/account-deletion", changeFrequency: "yearly", priority: 0.4 },
];
