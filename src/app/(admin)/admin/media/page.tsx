import { createClient } from "@/lib/supabase/server";
import MediaLibrary from "@/components/admin/media-library";

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("id, file_name, file_path, file_type, folder, size_bytes, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Media library</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">
        Everything uploaded from the post editor lands here automatically.
      </p>

      <div className="mt-6">
        <MediaLibrary initialItems={media ?? []} />
      </div>
    </main>
  );
}
