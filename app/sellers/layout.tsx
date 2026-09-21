import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Become a Seller",
  description:
    "Join WhoCan as a seller, reach local customers, and grow your home-service business.",
  path: "/sellers",
});

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
