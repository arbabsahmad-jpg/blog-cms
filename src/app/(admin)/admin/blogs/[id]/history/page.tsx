import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, readingTimeLabel } from "@/lib/format";
import { estimateReadingMinutes, stripHtml } from "@/lib/html-utils";
import RestoreRevisionButton from "@/components/admin/restore-revision-button";

export default async function BlogHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: blog }, { data: revisions }] = await Promise.all([
    supabase.from("blogs").select("title, content_html, updated_at").eq("id", id).single(),
    supabase
      .from("blog_revisions")
      .select("id, title, content, created_at, author:profiles(full_name)")
      .eq("blog_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!blog) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <Link href={`/admin/blogs/${id}/edit`} className="flex items-center gap-1 text-sm text-ink-600 hover:text-accent dark:text-paper-200">
        <ArrowLeft size={14} /> Back to editor
      </Link>

      <h1 className="mt-3 font-display text-3xl">Revision history</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">“{blog.title}”</p>

      <div className="mt-6 rounded-2xl border-2 border-accent bg-accent-50 p-4 dark:bg-ink-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-400">
          Current version
        </p>
        <p className="mt-1 text-sm text-ink-600 dark:text-paper-200">
          Last saved {formatDate(blog.updated_at)} · {readingTimeLabel(estimateReadingMinutes(blog.content_html ?? ""))}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {(revisions ?? []).map((rev) => {
          const content = rev.content as { html?: string } | Record<string, unknown>;
          const html = typeof content === "object" && "html" in content ? (content.html as string) : "";
          const preview = stripHtml(html).slice(0, 160);
          const author = rev.author as unknown as { full_name: string } | null;

          return (
            <li key={rev.id} className="rounded-2xl border border-paper-200 p-4 dark:border-ink-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{rev.title}</p>
                  <p className="text-xs text-ink-600 dark:text-paper-200">
                    {formatDate(rev.created_at)} {author?.full_name && `· ${author.full_name}`}
                  </p>
                </div>
                <RestoreRevisionButton blogId={id} revisionId={rev.id} />
              </div>
              {preview && <p className="mt-2 text-sm text-ink-600 dark:text-paper-200">{preview}…</p>}
            </li>
          );
        })}
        {(!revisions || revisions.length === 0) && (
          <p className="text-ink-600 dark:text-paper-200">No earlier versions yet — they appear here after your next edit.</p>
        )}
      </ul>
    </main>
  );
}
