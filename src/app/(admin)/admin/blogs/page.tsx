import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate } from "@/lib/format";
import BlogRowActions from "@/components/admin/blog-row-actions";

const TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
  { key: "trash", label: "Trash" },
] as const;

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("blogs")
    .select("id, title, slug, status, published_at, updated_at, views_count, deleted_at, category:categories(name)")
    .order("updated_at", { ascending: false });

  if (status === "trash") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (status !== "all") query = query.eq("status", status);
  }

  if (q.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }

  const { data: blogs } = await query;

  return (
    <main className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Blogs</h1>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-full border border-paper-200 p-1 dark:border-ink-700">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/blogs?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                status === tab.key
                  ? "bg-accent text-white"
                  : "text-ink-600 hover:text-ink-900 dark:text-paper-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form className="w-full sm:w-64">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search titles…"
            className="w-full rounded-full border border-paper-200 bg-transparent px-4 py-1.5 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <input type="hidden" name="status" value={status} />
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-paper-200 bg-white dark:border-ink-700 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-600 dark:border-ink-700 dark:text-paper-200">
            <tr>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium">Views</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 dark:divide-ink-700">
            {blogs?.map((blog) => (
              <tr key={blog.id}>
                <td className="px-5 py-3">
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="font-medium hover:text-accent">
                    {blog.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-600 dark:text-paper-200">
                  {(blog.category as unknown as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-paper-100 px-2 py-0.5 text-xs capitalize text-ink-600 dark:bg-ink-800 dark:text-paper-200">
                    {blog.deleted_at ? "trashed" : blog.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-600 dark:text-paper-200">{formatShortDate(blog.updated_at)}</td>
                <td className="px-5 py-3 text-ink-600 dark:text-paper-200">{blog.views_count}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <BlogRowActions blogId={blog.id} deleted={Boolean(blog.deleted_at)} />
                  </div>
                </td>
              </tr>
            ))}
            {(!blogs || blogs.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-600 dark:text-paper-200">
                  No posts here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
