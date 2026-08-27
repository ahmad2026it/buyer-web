export type PublicBlogAuthor = {
  id: number;
  full_name: string | null;
  email: string | null;
};

export type PublicBlog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  content_json?: Record<string, unknown> | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  author_admin_id: number | null;
  author: PublicBlogAuthor | null;
  created_at: string;
  updated_at: string;
};

export type PublicBlogsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetPublicBlogsParams = {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
};

export type GetPublicBlogsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    blogs: PublicBlog[];
    pagination: PublicBlogsPagination;
  };
};

export type GetPublicBlogResponse = {
  success: boolean;
  status: number;
  message: string;
  data: PublicBlog | null;
};
