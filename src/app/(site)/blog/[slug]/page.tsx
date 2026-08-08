import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import {
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  getApprovedComments,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDate, readingTimeLabel } from "@/lib/format";
import Breadcrumb from "@/components/site/breadcrumb";
import ShareButtons from "@/components/site/share-buttons";
import TableOfContents from "@/components/site/table-of-contents";
import ArticleCard from "@/components/site/article-card";
import CommentsSection from "@/components/site/comments-section";
import NewsletterForm from "@/components/site/newsletter-form";

export const revalidate = 60;

type Author = { id: string; full_name: string; avatar_url: string | null; bio: string | null };
type Category = { id: string; name: string; slug: string };

function siteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const url = post.canonical_url || siteUrl(`/blog/${post.slug}`);

  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const author = post.author as unknown as Author | null;
  const category = post.category as unknown as Category | null;
  const tags = (post.tags as unknown as { tag: { id: string; name: string; slug: string } }[]) ?? [];

  const [related, { previous, next }, comments] = await Promise.all([
    getRelatedPosts(category?.id ?? null, post.id),
    getAdjacentPosts(post.published_at, post.id),
    getApprovedComments(post.id),
  ]);

  // Fire-and-forget view tracking — never blocks the render.
  const supabase = await createClient();
  void supabase.rpc("record_blog_view", { p_blog_id: post.id });

  const url = siteUrl(`/blog/${post.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: author ? { "@type": "Person", name: author.full_name } : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb
        items={[
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: post.title },
        ]}
      />

      <header className="mt-6">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="w-fit rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:bg-ink-800 dark:text-accent-400"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">{post.title}</h1>
        {post.subtitle && (
          <p className="mt-3 text-lg text-ink-600 dark:text-paper-200">{post.subtitle}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {author && (
            <div className="flex items-center gap-2">
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.full_name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 font-display text-sm text-accent-700 dark:bg-ink-800">
                  {author.full_name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium">{author.full_name}</span>
            </div>
          )}
          <span className="flex items-center gap-1.5 text-sm text-ink-600 dark:text-paper-200">
            <CalendarDays size={14} /> {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-ink-600 dark:text-paper-200">
            <Clock size={14} /> {readingTimeLabel(post.reading_time_minutes)}
          </span>
        </div>

        <div className="mt-6">
          <ShareButtons url={url} title={post.title} />
        </div>
      </header>

      {post.featured_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-paper-100 dark:bg-ink-800">
          <Image src={post.featured_image} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_220px]">
        <article
          id="article-content"
          className="prose prose-neutral max-w-none prose-headings:font-display prose-a:text-accent prose-img:rounded-xl dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content_html || "<p>This post has no content yet.</p>" }}
        />
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents containerId="article-content" />
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/search?q=${encodeURIComponent(tag.name)}`}
              className="rounded-full border border-paper-200 px-3 py-1 text-xs text-ink-600 transition hover:border-accent hover:text-accent dark:border-ink-700 dark:text-paper-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {author?.bio && (
        <div className="mt-10 flex gap-4 rounded-2xl border border-paper-200 p-5 dark:border-ink-700">
          {author.avatar_url ? (
            <Image src={author.avatar_url} alt={author.full_name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 font-display text-accent-700 dark:bg-ink-800">
              {author.full_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium">{author.full_name}</p>
            <p className="mt-1 text-sm text-ink-600 dark:text-paper-200">{author.bio}</p>
          </div>
        </div>
      )}

      {/* Prev / next */}
      {(previous || next) && (
        <div className="mt-10 grid gap-4 border-y border-paper-200 py-6 dark:border-ink-700 sm:grid-cols-2">
          {previous ? (
            <Link href={`/blog/${previous.slug}`} className="group flex flex-col">
              <span className="flex items-center gap-1 text-xs text-ink-600 dark:text-paper-200">
                <ArrowLeft size={12} /> Previous
              </span>
              <span className="mt-1 font-display group-hover:text-accent">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="group flex flex-col sm:items-end sm:text-right">
              <span className="flex items-center gap-1 text-xs text-ink-600 dark:text-paper-200">
                Next <ArrowRight size={12} />
              </span>
              <span className="mt-1 font-display group-hover:text-accent">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl">Related articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.id} post={r} />
            ))}
          </div>
        </section>
      )}

      <CommentsSection blogId={post.id} initialComments={comments} allowComments={post.allow_comments} />

      <div className="mt-16 rounded-2xl border border-paper-200 bg-white p-6 text-center dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-xl">Enjoyed this? Get more in your inbox.</h2>
        <div className="mx-auto mt-4 max-w-sm">
          <NewsletterForm />
        </div>
      </div>
    </main>
  );
}
