import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticle from '@/components/BlogArticle';
import JsonLd from '@/components/JsonLd';
import { fetchPublicBlogBySlug } from '@/lib/fetchPublicBlog';
import { getBlogAuthorName } from '@/lib/publicBlogs';
import {
  ORGANIZATION_LOGO_PATH,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
} from '@/lib/seo';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchPublicBlogBySlug(slug);
  if (!blog) notFound();

  const title = blog.meta_title?.trim() || blog.title;
  const description =
    blog.meta_description?.trim() ||
    blog.excerpt?.trim() ||
    'Read this guide on WhoCan.';

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    ogType: 'article',
    images: blog.cover_image_url ? [blog.cover_image_url] : undefined,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await fetchPublicBlogBySlug(slug);
  if (!blog) notFound();

  const url = absoluteUrl(`/blog/${slug}`);
  const authorName = getBlogAuthorName(blog);
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description:
      blog.meta_description?.trim() || blog.excerpt?.trim() || undefined,
    image: blog.cover_image_url || undefined,
    datePublished: blog.published_at || blog.created_at || undefined,
    dateModified: blog.updated_at || blog.published_at || undefined,
    // Admin accounts named "WhoCan" or "WhoCan Team" are the brand, not a person.
    author:
      /^whocan( team)?$/i.test(authorName)
        ? { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') }
        : { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: { '@type': 'ImageObject', url: absoluteUrl(ORGANIZATION_LOGO_PATH) },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <BlogArticle slug={slug} initialBlog={blog} />
    </>
  );
}
