import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import ScrollAnimator from "@/components/ScrollAnimator";
import Providers from "@/components/Providers";
import AuthProvider from "@/components/AuthProvider";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "local services",
    "favors",
    "marketplace",
    "home services",
    "cleaning",
    "repairs",
    "nearby help",
    "WhoCan",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(SITE_OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [absoluteUrl(SITE_OG_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#A54AFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const PRELOADED_FONT_WEIGHTS = [400, 500, 600, 700, 800] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Hero text uses all five weights above the fold; preloading avoids the swap shift. */}
        {PRELOADED_FONT_WEIGHTS.map((weight) => (
          <link
            key={weight}
            rel="preload"
            href={`/fonts/poppins-latin-${weight}.woff2`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <Providers>
          <AuthProvider>
            <Suspense fallback={null}>
              {children}
              {/* Last child of the page boundary: its effect only runs once the whole page has
                  hydrated, so adding "in-view" classes can't cause a hydration mismatch. */}
              <ScrollAnimator />
            </Suspense>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
