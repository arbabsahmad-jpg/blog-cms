import { createClient } from "@/lib/supabase/server";
import CategoryCreateForm from "@/components/admin/category-create-form";
import CategoryRow from "@/components/admin/category-row";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .order("name");

  return (
    <main className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">
        Organize posts into sections like Technology, Health, or Travel.
      </p>

      <div className="mt-6">
        <CategoryCreateForm />
      </div>

      <ul className="mt-6 divide-y divide-paper-200 rounded-2xl border border-paper-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
        {categories?.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
        {(!categories || categories.length === 0) && (
          <li className="p-6 text-center text-ink-600 dark:text-paper-200">No categories yet.</li>
        )}
      </ul>
    </main>
  );
}
