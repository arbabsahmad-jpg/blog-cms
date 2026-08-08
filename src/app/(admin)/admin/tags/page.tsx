import { createClient } from "@/lib/supabase/server";
import { TagCreateForm, TagRow } from "@/components/admin/tag-controls";

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("id, name, slug").order("name");

  return (
    <main className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Tags</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">
        Fine-grained labels for posts, independent of category.
      </p>

      <div className="mt-6 rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <TagCreateForm />
      </div>

      <ul className="mt-6 flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <TagRow key={tag.id} tag={tag} />
        ))}
      </ul>
      {(!tags || tags.length === 0) && (
        <p className="mt-6 text-ink-600 dark:text-paper-200">No tags yet — add your first one above.</p>
      )}
    </main>
  );
}
