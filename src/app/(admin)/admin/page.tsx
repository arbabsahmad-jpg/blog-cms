import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, CheckCircle2, PenLine, Eye, FolderOpen } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const [{ count: total }, { count: published }, { count: drafts }, { count: categories }, viewsAgg, recent] =
    await Promise.all([
      supabase.from("blogs").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("blogs").select("*", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
      supabase.from("blogs").select("*", { count: "exact", head: true }).eq("status", "draft").is("deleted_at", null),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("blogs").select("views_count").is("deleted_at", null),
      supabase
        .from("blogs")
        .select("id, title, status, updated_at")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  const totalViews = (viewsAgg.data ?? []).reduce((sum, row) => sum + (row.views_count ?? 0), 0);

  return {
    total: total ?? 0,
    published: published ?? 0,
    drafts: drafts ?? 0,
    categories: categories ?? 0,
    totalViews,
    recent: recent.data ?? [],
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total blogs", value: stats.total, icon: FileText },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Drafts", value: stats.drafts, icon: PenLine },
    { label: "Total views", value: stats.totalViews, icon: Eye },
    { label: "Categories", value: stats.categories, icon: FolderOpen },
  ];

  return (
    <main className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">An overview of your blog.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-paper-200 bg-white p-5 shadow-soft dark:border-ink-700 dark:bg-ink-900"
          >
            <Icon size={18} className="text-accent" />
            <p className="mt-3 text-2xl font-semibold">{value}</p>
            <p className="text-sm text-ink-600 dark:text-paper-200">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Recent posts</h2>
          <Link href={"/admin/blogs/new" as never} className="text-sm text-accent underline">
            Write a new post
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-paper-200 rounded-2xl border border-paper-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
          {stats.recent.length ? (
            stats.recent.map((post) => (
              <li key={post.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{post.title}</span>
                <span className="rounded-full bg-paper-100 px-2 py-0.5 text-xs capitalize text-ink-600 dark:bg-ink-800 dark:text-paper-200">
                  {post.status}
                </span>
              </li>
            ))
          ) : (
            <li className="px-5 py-4 text-sm text-ink-600 dark:text-paper-200">
              No posts yet.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
