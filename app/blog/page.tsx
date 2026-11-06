import Link from "next/link";
import BlogIndexClient from "./BlogIndexClient";
import { blogHref, normalizePublicBlog } from "@/lib/publicBlogs";

const FONT = "Poppins, sans-serif";

function publicApiOrigin(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");
}

async function loadPublishedBlogLinks(): Promise<{ slug: string; title: string }[]> {
  try {
    const response = await fetch(
      `${publicApiOrigin()}/api/public/blogs?page=1&limit=100`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    const record =
      payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    const data =
      record?.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : null;
    const raw = Array.isArray(data?.blogs) ? data.blogs : Array.isArray(payload) ? payload : [];
    const links: { slug: string; title: string }[] = [];
    for (const item of raw) {
      const blog = normalizePublicBlog(item);
      if (!blog || blog.status !== "published" || !/^[a-z0-9-]+$/i.test(blog.slug)) continue;
      links.push({ slug: blog.slug, title: blog.title });
    }
    return links;
  } catch {
    return [];
  }
}

export default async function BlogIndexPage() {
  const links = await loadPublishedBlogLinks();
  return (
    <BlogIndexClient
      seoLinks={
        links.length > 0 ? (
          <nav
            aria-label="All guides"
            style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 24px 56px" }}
          >
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 20,
                color: "#101828",
                margin: "0 0 12px",
              }}
            >
              All guides
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {links.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={blogHref(link.slug)}
                    style={{ fontFamily: FONT, fontSize: 15, color: "#7A2DD6" }}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null
      }
    />
  );
}
