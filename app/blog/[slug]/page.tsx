import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticle from '@/components/BlogArticle';
import { fetchPublicBlogBySlug } from '@/lib/fetchPublicBlog';
import { buildPageMetadata } from '@/lib/seo';

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
  return <BlogArticle slug={slug} />;
}
