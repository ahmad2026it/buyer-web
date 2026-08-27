import type { PublicBlog, PublicBlogAuthor } from "@/app/buyer/store/buyerBlogsTypes";

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

const asNullableString = (value: unknown): string | null => {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
};

const asBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === "1" || value === "true";

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAuthor = (value: unknown): PublicBlogAuthor | null => {
  const record = asRecord(value);
  if (!record) return null;
  const id = asNumber(record.id, NaN);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    full_name: asNullableString(record.full_name ?? record.fullName),
    email: asNullableString(record.email),
  };
};

export const normalizePublicBlog = (value: unknown): PublicBlog | null => {
  const record = asRecord(value);
  if (!record) return null;

  const id = asNumber(record.id, NaN);
  const title = asString(record.title).trim();
  const slug = asString(record.slug).trim();
  if (!Number.isFinite(id) || !title || !slug) return null;

  const status = record.status === "draft" ? "draft" : "published";

  return {
    id,
    title,
    slug,
    excerpt: asNullableString(record.excerpt),
    content: typeof record.content === "string" ? record.content : undefined,
    content_json: null,
    cover_image_url: asNullableString(
      record.cover_image_url ?? record.coverImageUrl,
    ),
    status,
    published_at: asNullableString(record.published_at ?? record.publishedAt),
    meta_title: asNullableString(record.meta_title ?? record.metaTitle),
    meta_description: asNullableString(
      record.meta_description ?? record.metaDescription,
    ),
    is_featured: asBoolean(record.is_featured ?? record.isFeatured),
    author_admin_id:
      record.author_admin_id == null && record.authorAdminId == null
        ? null
        : asNumber(record.author_admin_id ?? record.authorAdminId),
    author: normalizeAuthor(record.author),
    created_at: asString(record.created_at ?? record.createdAt),
    updated_at: asString(record.updated_at ?? record.updatedAt),
  };
};

export const unwrapPublicBlog = (payload: unknown): PublicBlog | null => {
  const record = asRecord(payload);
  if (!record) return null;

  const direct = normalizePublicBlog(record);
  if (direct) return direct;

  const data = record.data;
  const nested = asRecord(data);
  if (!nested) return normalizePublicBlog(data);

  return normalizePublicBlog(nested.blog) ?? normalizePublicBlog(nested);
};

export const getBlogAuthorName = (blog: PublicBlog): string => {
  const name = blog.author?.full_name?.trim();
  return name || "WhoCan Team";
};

export const getBlogAuthorInitials = (blog: PublicBlog): string => {
  const parts = getBlogAuthorName(blog)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "WC";
};

export const formatBlogDate = (value: string | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const blogHref = (slug: string): string =>
  `/blog/${encodeURIComponent(slug)}`;

export const sanitizeBlogHtml = (html: string): string => {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
};
