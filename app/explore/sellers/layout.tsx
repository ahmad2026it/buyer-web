import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "All Providers",
  description: "Browse every provider on WhoCan and hire local service providers.",
  path: "/explore/sellers",
});

export default function ExploreSellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
