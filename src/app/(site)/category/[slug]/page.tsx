import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByCategory } from "@/lib/queries";
import ArticleCard from "@/components/site/article-card";
import Breadcrumb from "@/components/site/breadcrumb";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getPostsByCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Articles in ${category.name}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, posts } = await getPostsByCategory(slug);
  if (!category) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumb items={[{ label: category.name }]} />

      <header className="mt-6 border-b border-paper-200 pb-8 dark:border-ink-700">
        <h1 className="font-display text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-ink-600 dark:text-paper-200">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-ink-600 dark:text-paper-200">
          {posts.length} article{posts.length === 1 ? "" : "s"}
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-ink-600 dark:text-paper-200">No articles in this category yet.</p>
      )}
    </main>
  );
}
