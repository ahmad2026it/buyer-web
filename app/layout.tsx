import type { Metadata } from "next";
import "./globals.css";
import ScrollAnimator from "@/components/ScrollAnimator";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "WhoCan — Find Handymen at Your Doorstep",
  description:
    "From cleaning to grass cutting, easily connect with trusted service providers for all your home needs.",
  keywords: "handyman, home services, cleaning, repairs, plumbing, electrician",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ScrollAnimator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
