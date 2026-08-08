import { createClient } from "@/lib/supabase/server";
import { createBlog } from "@/lib/actions/blogs";
import BlogForm from "@/app/(admin)/admin/blogs/blog-form";

export default async function NewBlogPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("tags").select("id, name").order("name"),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="font-display text-3xl">Write a new post</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">
        Save as a draft, schedule it, or publish immediately.
      </p>
      <div className="mt-8">
        <BlogForm
          action={createBlog}
          categories={categories ?? []}
          tags={tags ?? []}
          submitLabel="Save post"
        />
      </div>
    </main>
  );
}
