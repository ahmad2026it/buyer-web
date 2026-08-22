import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Favors — WhoCan",
  description: "Browse every favor on WhoCan, from cleaning to repairs and more.",
};

export default function ExploreFavorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
