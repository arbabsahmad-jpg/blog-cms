import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateBlog, autosaveBlog } from "@/lib/actions/blogs";
import BlogForm from "@/app/(admin)/admin/blogs/blog-form";

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();

  const [{ data: blog }, { data: categories }, { data: tags }, { data: blogTags }] = await Promise.all([
    supabase.from("blogs").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    supabase.from("blog_tags").select("tag_id").eq("blog_id", id),
  ]);

  if (!blog) notFound();

  const updateWithId = updateBlog.bind(null, id);
  const autosaveWithId = autosaveBlog.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      {created && (
        <div className="mb-6 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700 dark:bg-ink-800 dark:text-accent-400">
          Post created. Keep editing below.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Edit post</h1>
          <p className="mt-1 text-ink-600 dark:text-paper-200">
            Changes save a revision snapshot automatically.
          </p>
        </div>
        <Link
          href={`/admin/blogs/${id}/history`}
          className="flex items-center gap-2 rounded-xl border border-paper-200 px-4 py-2 text-sm transition hover:border-accent hover:text-accent dark:border-ink-700"
        >
          <History size={15} /> History
        </Link>
      </div>
      <div className="mt-8">
        <BlogForm
          action={updateWithId}
          autosaveAction={autosaveWithId}
          categories={categories ?? []}
          tags={tags ?? []}
          submitLabel="Save changes"
          initial={{
            title: blog.title,
            subtitle: blog.subtitle ?? "",
            slug: blog.slug,
            excerpt: blog.excerpt ?? "",
            content_html: blog.content_html ?? "",
            featured_image: blog.featured_image ?? "",
            video_url: blog.video_url ?? "",
            category_id: blog.category_id ?? "",
            status: blog.status,
            scheduled_at: blog.scheduled_at ? blog.scheduled_at.slice(0, 16) : "",
            meta_title: blog.meta_title ?? "",
            meta_description: blog.meta_description ?? "",
            keywords: (blog.keywords ?? []).join(", "),
            canonical_url: blog.canonical_url ?? "",
            is_featured: blog.is_featured,
            is_trending: blog.is_trending,
            allow_comments: blog.allow_comments,
            tag_ids: (blogTags ?? []).map((bt) => bt.tag_id),
          }}
        />
      </div>
    </main>
  );
}
