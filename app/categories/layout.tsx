import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Service Categories",
  description:
    "Explore WhoCan service categories — cleaning, repairs, assembly, electrical, and more.",
  path: "/categories",
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
