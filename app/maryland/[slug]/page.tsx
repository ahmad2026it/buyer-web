import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarylandGuidePage from "@/components/MarylandGuidePage";
import { buildPageMetadata } from "@/lib/seo";
import {
  MARYLAND_GUIDES,
  MARYLAND_HUB_PATH,
  getMarylandGuide,
  marylandGuidePath,
} from "@/lib/marylandGuides";

const SEARCH_LINKS: Record<string, { href: string; label: string }> = {
  "offer-services": {
    href: "/sellers",
    label: "Set up your Provider profile",
  },
  cleaning: {
    href: "/explore/search?type=favors&q=cleaning",
    label: "Search cleaning favors",
  },
  handyman: {
    href: "/explore/search?type=favors&q=handyman",
    label: "Search handyman favors",
  },
  "lawn-care": {
    href: "/explore/search?type=favors&q=lawn",
    label: "Search lawn care favors",
  },
  "car-detailing": {
    href: "/explore/search?type=favors&q=car%20detailing",
    label: "Search car detailing favors",
  },
};

type MarylandGuideRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return MARYLAND_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: MarylandGuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getMarylandGuide(slug);
  if (!guide) return {};
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: marylandGuidePath(guide.slug),
  });
}

export default async function MarylandGuideRoute({
  params,
}: MarylandGuideRouteProps) {
  const { slug } = await params;
  const guide = getMarylandGuide(slug);
  if (!guide) notFound();

  const searchLink = SEARCH_LINKS[guide.slug];

  return (
    <MarylandGuidePage
      path={marylandGuidePath(guide.slug)}
      crumbLabel={guide.title}
      heading={guide.heading}
      lede={guide.lede}
      sections={guide.sections}
      links={[
        { href: MARYLAND_HUB_PATH, label: "Local services in Maryland" },
        ...(searchLink ? [searchLink] : []),
        { href: "/explore/favors", label: "Browse all favors" },
      ]}
    />
  );
}
