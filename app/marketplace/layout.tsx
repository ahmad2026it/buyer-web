import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Buy and Sell Items Near You | Local Marketplace",
  description:
    "Post an ad or browse items near you on the WhoCan Marketplace. Chat with Sellers in the app. Available across the United States.",
  path: "/marketplace",
});

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
