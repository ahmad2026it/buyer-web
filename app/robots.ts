import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/backend/",
          "/auth/",
          "/bookings",
          "/booking/",
          "/billing",
          "/profile",
          "/chat",
          "/favorites",
          "/disputes",
          "/custom-favors",
          "/marketplace/mine",
          "/marketplace/post",
          "/marketplace/saved",
          "/marketplace/chat",
          "/marketplace/*/edit",
          "/explore/search",
          "/register",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
