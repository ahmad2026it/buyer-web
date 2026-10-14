import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "WhoCan Provider: list your service and get booked in Maryland",
  description:
    "List your service, set your own price and get booking requests from people nearby with the WhoCan Provider app. Now launching in Maryland.",
  path: "/sellers",
});

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
