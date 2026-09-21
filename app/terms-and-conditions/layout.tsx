import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description:
    "Read the WhoCan terms and conditions that govern use of the buyer marketplace.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
