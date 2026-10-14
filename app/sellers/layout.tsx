import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Become a Provider",
  description:
    "Join WhoCan as a provider, reach local customers, and grow your home-service business.",
  path: "/sellers",
});

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
