import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Local Service Providers: Cleaners, Handymen and More",
  description:
    "Browse local Providers on WhoCan for cleaning, handyman work, lawn care and car detailing. Compare profiles, chat in the app and book the one that fits the job.",
  path: "/explore/sellers",
});

export default function ExploreSellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
