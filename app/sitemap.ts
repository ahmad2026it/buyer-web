import type { MetadataRoute } from "next";
import { loadIndexableUrls } from "@/lib/indexableUrls";
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo";

/** Update this date when the static public pages change in a meaningful way. */
const STATIC_PAGES_LAST_MODIFIED = new Date("2026-11-03");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const indexable = await loadIndexableUrls();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: STATIC_PAGES_LAST_MODIFIED,
      changeFrequency,
      priority,
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = indexable.blogs.map(({ url, revision }) => {
    const parsed = new Date(revision);
    return {
      url,
      lastModified: !Number.isNaN(parsed.getTime()) ? parsed : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  return [...staticEntries, ...blogEntries];
}
