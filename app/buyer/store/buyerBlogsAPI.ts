import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  GetPublicBlogResponse,
  GetPublicBlogsParams,
  GetPublicBlogsResponse,
  PublicBlog,
  PublicBlogsPagination,
} from "./buyerBlogsTypes";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { normalizePublicBlog, unwrapPublicBlog } from "@/lib/publicBlogs";

export const PUBLIC_BLOGS_LIST_PARAMS = {
  page: 1,
  limit: 10,
} as const;

const asBlogs = (value: unknown): PublicBlog[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizePublicBlog(item))
    .filter((item): item is PublicBlog => item != null);
};

const compactBlogParams = (params?: GetPublicBlogsParams | void) => {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.page != null) out.page = params.page;
  if (params.limit != null) out.limit = params.limit;
  const search = params.search?.trim();
  if (search) out.search = search;
  if (params.featured != null) out.featured = params.featured ? "true" : "false";
  return Object.keys(out).length ? out : undefined;
};

const normalizePagination = (
  value: unknown,
  fallback: { total: number; page: number; limit: number },
): PublicBlogsPagination => {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  const page = Number(record?.page) || fallback.page;
  const limit = Number(record?.limit) || fallback.limit;
  const total = Number(record?.total) || fallback.total;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { page, limit, total, totalPages };
};

const transformBlogsResponse = (
  response: GetPublicBlogsResponse | PublicBlog[] | unknown,
): GetPublicBlogsResponse => {
  if (Array.isArray(response)) {
    const blogs = asBlogs(response);
    return {
      success: true,
      status: 200,
      message: "",
      data: {
        blogs,
        pagination: {
          total: blogs.length,
          page: 1,
          limit: blogs.length || PUBLIC_BLOGS_LIST_PARAMS.limit,
          totalPages: 1,
        },
      },
    };
  }

  const payload =
    response && typeof response === "object"
      ? (response as GetPublicBlogsResponse)
      : null;
  const nested = payload?.data;
  const blogs = asBlogs(
    nested && typeof nested === "object" && "blogs" in nested
      ? nested.blogs
      : nested,
  );
  const pagination = normalizePagination(
    nested && typeof nested === "object" ? nested.pagination : undefined,
    {
      total: blogs.length,
      page: PUBLIC_BLOGS_LIST_PARAMS.page,
      limit: PUBLIC_BLOGS_LIST_PARAMS.limit,
    },
  );

  return {
    success: payload?.success ?? true,
    status: payload?.status ?? 200,
    message: payload?.message ?? "",
    data: { blogs, pagination },
  };
};

const transformBlogResponse = (
  response: GetPublicBlogResponse | PublicBlog | unknown,
): GetPublicBlogResponse => {
  const blog = unwrapPublicBlog(response);
  const payload =
    response && typeof response === "object"
      ? (response as GetPublicBlogResponse)
      : null;

  return {
    success: payload?.success ?? true,
    status: payload?.status ?? 200,
    message: payload?.message ?? "",
    data: blog,
  };
};

export const buyerBlogsAPI = createApi({
  reducerPath: "buyerBlogsAPI",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PublicBlogs"],
  endpoints: (builder) => ({
    getPublicBlogs: builder.query<GetPublicBlogsResponse, GetPublicBlogsParams | void>({
      query: (params) => ({
        url: "/api/public/blogs",
        method: "GET",
        params: compactBlogParams(params),
        skipErrorToast: true,
      }),
      transformResponse: transformBlogsResponse,
      serializeQueryArgs: ({ queryArgs }) => {
        if (!queryArgs) return "default";
        const { page: _page, ...rest } = queryArgs;
        return JSON.stringify(rest);
      },
      merge: (currentCache, incoming, { arg }) => {
        const page = arg?.page ?? 1;
        if (!currentCache || page <= 1) return incoming;

        const existingIds = new Set(currentCache.data.blogs.map((item) => item.id));
        return {
          ...incoming,
          data: {
            ...incoming.data,
            blogs: [
              ...currentCache.data.blogs,
              ...incoming.data.blogs.filter((item) => !existingIds.has(item.id)),
            ],
          },
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ["PublicBlogs"],
    }),
    getPublicBlogBySlug: builder.query<GetPublicBlogResponse, string>({
      query: (slugOrId) => ({
        url: `/api/public/blogs/${encodeURIComponent(slugOrId)}`,
        method: "GET",
        skipErrorToast: true,
      }),
      transformResponse: transformBlogResponse,
      providesTags: (_result, _error, slugOrId) => [
        { type: "PublicBlogs", id: slugOrId },
      ],
    }),
  }),
});

export const { useGetPublicBlogsQuery, useGetPublicBlogBySlugQuery } = buyerBlogsAPI;
