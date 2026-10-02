import type { MetadataRoute } from "next";
import { loadIndexableUrls } from "@/lib/indexableUrls";
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const indexable = await loadIndexableUrls();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
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
