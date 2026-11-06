import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "WhoCan Provider: App to Find Local Clients in Maryland",
    description:
      "An app for cleaners, handymen, lawn care and detailing Providers: list your service, set your own price and get requests from Requesters nearby. Launching in Maryland.",
    path: "/sellers",
  }),
  // Smart App Banner on iPhone points Providers to the Provider app.
  itunes: { appId: "6759322439" },
};

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
