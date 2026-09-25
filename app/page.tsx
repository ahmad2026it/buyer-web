import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import HomeSeoContent from "@/components/HomeSeoContent";
import JsonLd from "@/components/JsonLd";
import {
  ORGANIZATION_SAME_AS,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
  getSiteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: SITE_DEFAULT_TITLE,
  },
};

export default function HomePage() {
  const siteUrl = getSiteUrl();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: absoluteUrl("/icon.svg"),
    sameAs: [...ORGANIZATION_SAME_AS],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contactus@whocan-app.com",
      contactType: "customer service",
    },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/explore/search?q={search_term_string}&type=all`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <link
        rel="preload"
        href="/hero.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      <JsonLd data={[organizationLd, websiteLd]} />
      <HomePageClient seoSlot={<HomeSeoContent />} />
    </>
  );
}
