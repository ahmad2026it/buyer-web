import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

const ARTICLE_SEO: Record<
  string,
  { title: string; description: string }
> = {
  "deep-home-cleaning": {
    title: "Deep Home Cleaning Guide",
    description:
      "A complete guide to deep home cleaning — what it includes, when you need it, and how to book help on WhoCan.",
  },
  "how-it-works": {
    title: "How WhoCan Works",
    description:
      "Learn how WhoCan connects you with local handymen and service providers for home tasks.",
  },
  "trusted-local-providers": {
    title: "How WhoCan Reviews Local Providers",
    description:
      "Learn how WhoCan reviews local service providers before they appear on the platform.",
  },
};

type ArticlesSlugLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlesSlugLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = ARTICLE_SEO[slug];
  if (!seo) {
    return buildPageMetadata({
      title: "Article",
      description: "Read guides and tips from WhoCan.",
      path: `/articles/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/articles/${slug}`,
    ogType: "article",
  });
}

export default function ArticlesSlugLayout({
  children,
}: ArticlesSlugLayoutProps) {
  return children;
}
