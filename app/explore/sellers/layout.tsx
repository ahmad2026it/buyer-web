import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Sellers — WhoCan",
  description: "Browse every seller on WhoCan and hire top-rated service providers.",
};

export default function ExploreSellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
