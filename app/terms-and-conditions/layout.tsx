import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — WhoCan",
  description:
    "Read the WhoCan terms and conditions that govern use of the buyer marketplace.",
};

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
