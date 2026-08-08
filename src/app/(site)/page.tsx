import Link from "next/link";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import {
  getCategories,
  getFeaturedPosts,
  getLatestPosts,
  getTrendingPosts,
} from "@/lib/queries";
import ArticleCard from "@/components/site/article-card";
import SearchBar from "@/components/site/search-bar";
import NewsletterForm from "@/components/site/newsletter-form";
import Hero3DStack from "@/components/site/hero-3d-stack";
import Reveal from "@/components/site/reveal";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending, categories] = await Promise.all([
    getFeaturedPosts(3),
    getLatestPosts(9),
    getTrendingPosts(5),
    getCategories(),
  ]);

  const hasAnyPosts = featured.length + latest.length > 0;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-paper-200 bg-ink-950 dark:border-ink-700">
        <div className="gradient-mesh pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
              <Sparkles size={12} /> Field notes &amp; essays
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight text-paper-50 sm:text-5xl">
              Ideas worth <span className="text-shimmer">your time.</span>
            </h1>
            <p className="mt-4 max-w-md text-paper-200">
              Writing on technology, business, and the craft of building things —
              published straight from the newsroom to you.
            </p>
            <div className="mt-8 max-w-md">
              <SearchBar variant="page" />
            </div>
          </div>

          <Hero3DStack />
        </div>
      </section>

      {!hasAnyPosts && (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-ink-600 dark:text-paper-200">
          Nothing published yet — write and publish your first post from{" "}
          <Link href={"/admin/blogs/new" as never} className="text-accent underline">
            the admin dashboard
          </Link>
          . It will appear here instantly.
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <h2 className="font-display text-2xl">Featured</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {featured.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                <ArticleCard post={post} size={i === 0 ? "large" : "default"} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 lg:grid-cols-[2fr_1fr]">
        {/* Latest */}
        <section>
          <Reveal>
            <h2 className="font-display text-2xl">Latest articles</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {latest.map((post, i) => (
              <Reveal key={post.id} delay={(i % 4) * 0.06}>
                <ArticleCard post={post} />
              </Reveal>
            ))}
          </div>
        </section>

        <aside className="space-y-10">
          {/* Trending */}
          {trending.length > 0 && (
            <Reveal>
              <h2 className="flex items-center gap-2 font-display text-xl">
                <TrendingUp size={18} className="text-accent" /> Trending now
              </h2>
              <ol className="mt-4 space-y-4">
                {trending.map((post, i) => (
                  <li key={post.id} className="group flex gap-3">
                    <span className="font-display text-2xl text-paper-200 transition-colors group-hover:text-accent dark:text-ink-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium leading-snug transition-colors group-hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {/* Popular categories */}
          {categories.length > 0 && (
            <Reveal delay={0.1}>
              <h2 className="font-display text-xl">Popular categories</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-1 rounded-full border border-paper-200 px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-soft dark:border-ink-700"
                  >
                    {c.name}
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {/* Newsletter */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-glow dark:border-ink-700 dark:bg-ink-900">
              <h2 className="font-display text-xl">Get new posts by email</h2>
              <p className="mt-2 text-sm text-ink-600 dark:text-paper-200">
                One email whenever something new goes up. No spam, unsubscribe anytime.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </Reveal>
        </aside>
      </div>
    </main>
  );
}
