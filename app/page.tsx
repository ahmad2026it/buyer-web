import type { Metadata } from "next";
import FaqSection from "@/components/FaqSection";
import HomePageClient from "@/components/HomePageClient";
import HowItWorksSection from "@/components/HowItWorksSection";
import HomeSeoContent from "@/components/HomeSeoContent";
import JsonLd from "@/components/JsonLd";
import { APP_STORE_LINKS } from "@/lib/appStores";
import { fetchPublicFaqs } from "@/lib/fetchPublicFaqs";
import {
  ORGANIZATION_ALTERNATE_NAME,
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_SAME_AS,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
  getSiteUrl,
} from "@/lib/seo";

export const revalidate = 300;

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

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  const faqs = await fetchPublicFaqs();

  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ORGANIZATION_ALTERNATE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(ORGANIZATION_LOGO_PATH),
    },
    description: SITE_DEFAULT_DESCRIPTION,
    sameAs: [...ORGANIZATION_SAME_AS],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contactus@whocan-app.com",
      contactType: "customer service",
    },
  };

  // The two store apps as entities. No price, rating or review fields: none are confirmed.
  const appLd = [
    {
      name: "WhoCan",
      description:
        "Requester app: post a job or browse local Providers in Maryland, compare offers, chat and pay in the app.",
      links: APP_STORE_LINKS.buyer,
    },
    {
      name: "WhoCan Provider",
      description:
        "Provider app: list your service, set your own price and accept the requests you want.",
      links: APP_STORE_LINKS.seller,
    },
  ].map((app) => ({
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: app.name,
    description: app.description,
    operatingSystem: "iOS, Android",
    applicationCategory: "LifestyleApplication",
    url: absoluteUrl("/"),
    sameAs: [app.links.apple, app.links.play],
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  }));

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
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
        href="/hero-md.webp"
        as="image"
        type="image/webp"
        media="(max-width: 900px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/hero.webp"
        as="image"
        type="image/webp"
        media="(min-width: 901px)"
        fetchPriority="high"
      />
      <JsonLd
        data={
          faqLd
            ? [organizationLd, websiteLd, ...appLd, faqLd]
            : [organizationLd, websiteLd, ...appLd]
        }
      />
      <HomePageClient seoSlot={<HomeSeoContent />} faqSlot={<FaqSection items={faqs} />}
        howItWorksSlot={<HowItWorksSection />}
      />
    </>
  );
}
