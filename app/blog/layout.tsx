import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "WhoCan Blog: Guides for Requesters, Providers and Local Sellers",
  description:
    "Practical guides from WhoCan: hiring a local Provider in Maryland, pricing your services, and selling used items near you on the Marketplace.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
