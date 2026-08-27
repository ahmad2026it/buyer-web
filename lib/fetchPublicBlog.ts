import { cache } from "react";
import type { PublicBlog } from "@/app/buyer/store/buyerBlogsTypes";
import { unwrapPublicBlog } from "@/lib/publicBlogs";

const publicApiOrigin = (): string =>
  (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");

export const fetchPublicBlogBySlug = cache(
  async (slugOrId: string): Promise<PublicBlog | null> => {
    const path = `${publicApiOrigin()}/api/public/blogs/${encodeURIComponent(slugOrId)}`;
    try {
      const response = await fetch(path, { next: { revalidate: 60 } });
      if (!response.ok) return null;
      const payload: unknown = await response.json();
      return unwrapPublicBlog(payload);
    } catch {
      return null;
    }
  },
);
