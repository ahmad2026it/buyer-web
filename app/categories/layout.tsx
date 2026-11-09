import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Local Service Categories: Cleaning, Repairs and More",
  description:
    "Explore WhoCan service categories: cleaning, repairs, assembly, electrical, lawn care and more. Pick a category to see local Providers and their listings.",
  path: "/categories",
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
