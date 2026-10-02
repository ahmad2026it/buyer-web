import { createHash } from "crypto";
import { normalizePublicBlog } from "@/lib/publicBlogs";
import { MARYLAND_GUIDES } from "@/lib/marylandGuides";
import {
  PUBLIC_SITEMAP_PATHS,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  absoluteUrl,
} from "@/lib/seo";
import { INDEXNOW_HOST } from "@/lib/indexnowKey";

export type IndexableBlog = {
  url: string;
  revision: string;
};

export type IndexableSet = {
  contentHash: string;
  staticUrls: string[];
  blogs: IndexableBlog[];
  blogsOk: boolean;
};

const BLOCKED_PREFIXES = [
  "/api",
  "/backend",
  "/auth",
  "/bookings",
  "/booking",
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
  "/explore/search",
  "/register",
  "/gone",
  "/articles",
];

function publicApiOrigin(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");
}

export function staticContentHash(): string {
  const payload = JSON.stringify({
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    paths: PUBLIC_SITEMAP_PATHS.map((entry) => entry.path),
    guides: MARYLAND_GUIDES,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function isCanonicalProductionUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname !== INDEXNOW_HOST) return false;
  if (url.username || url.password) return false;
  if (url.search || url.hash) return false;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && url.pathname !== path) return false;
  if (path === "/" && url.pathname !== "/") return false;
  if (path.includes("..")) return false;
  if (BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return false;
  }
  if (/\/edit(?:\/|$)/.test(path)) return false;
  return true;
}

async function fetchPublishedBlogs(
  fresh: boolean,
): Promise<{ ok: boolean; blogs: IndexableBlog[] }> {
  try {
    const response = await fetch(
      `${publicApiOrigin()}/api/public/blogs?page=1&limit=100`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 3600 } },
    );
    if (!response.ok) return { ok: false, blogs: [] };
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

    const blogs: IndexableBlog[] = [];
    for (const item of blogsRaw) {
      const blog = normalizePublicBlog(item);
      if (!blog || blog.status !== "published" || !/^[a-z0-9-]+$/i.test(blog.slug)) {
        continue;
      }
      const url = absoluteUrl(`/blog/${blog.slug}`);
      const revision = blog.updated_at || blog.published_at || blog.created_at || blog.slug;
      blogs.push({ url, revision });
    }
    return { ok: true, blogs };
  } catch {
    return { ok: false, blogs: [] };
  }
}

export async function loadIndexableUrls(options?: { fresh?: boolean }): Promise<IndexableSet> {
  const staticUrls = PUBLIC_SITEMAP_PATHS.map((entry) => absoluteUrl(entry.path));
  const published = await fetchPublishedBlogs(options?.fresh === true);
  return {
    contentHash: staticContentHash(),
    staticUrls,
    blogs: published.blogs,
    blogsOk: published.ok,
  };
}
