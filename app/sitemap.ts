import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo";
import { normalizePublicBlog } from "@/lib/publicBlogs";

async function fetchPublishedBlogSlugs(): Promise<
  { slug: string; lastModified?: Date }[]
> {
  const origin = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${origin}/api/public/blogs?page=1&limit=100`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    const record =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const data =
      record?.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : null;
    const blogsRaw = Array.isArray(data?.blogs)
      ? data.blogs
      : Array.isArray(payload)
        ? payload
        : [];

    return blogsRaw
      .map((item) => normalizePublicBlog(item))
      .filter(
        (blog): blog is NonNullable<typeof blog> =>
          blog != null && blog.status === "published" && Boolean(blog.slug),
      )
      .map((blog) => ({
        slug: blog.slug,
        lastModified: blog.updated_at
          ? new Date(blog.updated_at)
          : blog.published_at
            ? new Date(blog.published_at)
            : undefined,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const blogs = await fetchPublishedBlogSlugs();
  const blogEntries: MetadataRoute.Sitemap = blogs.map(
    ({ slug, lastModified }) => ({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: lastModified && !Number.isNaN(lastModified.getTime())
        ? lastModified
        : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...blogEntries];
}
