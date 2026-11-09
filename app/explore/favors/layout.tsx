import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Browse Local Services: Cleaning, Handyman, Lawn Care",
  description:
    "Browse services local Providers offer on WhoCan, from house cleaning and handyman jobs to lawn care and car detailing. See what is included and send a request.",
  path: "/explore/favors",
});

export default function ExploreFavorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
