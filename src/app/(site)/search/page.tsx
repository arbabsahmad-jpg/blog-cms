import type { Metadata } from "next";
import { searchPosts } from "@/lib/queries";
import ArticleCard from "@/components/site/article-card";
import SearchBar from "@/components/site/search-bar";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchPosts(q) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Search</h1>
      <div className="mt-6 max-w-xl">
        <SearchBar variant="page" />
      </div>

      {q && (
        <p className="mt-6 text-sm text-ink-600 dark:text-paper-200">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {q && results.length === 0 && (
        <p className="mt-10 text-ink-600 dark:text-paper-200">
          Nothing matched &ldquo;{q}&rdquo;. Try a different keyword, category, or tag.
        </p>
      )}
    </main>
  );
}
