import { createClient } from "@/lib/supabase/server";
import CommentModerationRow from "@/components/admin/comment-moderation-row";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("comments")
    .select("id, blog_id, user_name, user_email, content, status, created_at, blog:blogs(title)")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data } = await query;
  const comments = (data ?? []).map((c) => ({
    ...c,
    blog_title: (c.blog as unknown as { title: string } | null)?.title ?? "Untitled",
  }));

  return (
    <main className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Comments</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">Moderate what shows up on published posts.</p>

      <div className="mt-6 flex flex-wrap gap-1 rounded-full border border-paper-200 p-1 dark:border-ink-700">
        {TABS.map((tab) => (
          <a
            key={tab.key}
            href={`/admin/comments?status=${tab.key}`}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              status === tab.key ? "bg-accent text-white" : "text-ink-600 hover:text-ink-900 dark:text-paper-200"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <ul className="mt-6 divide-y divide-paper-200 rounded-2xl border border-paper-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
        {comments.map((comment) => (
          <CommentModerationRow key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 && (
          <li className="p-8 text-center text-ink-600 dark:text-paper-200">No comments here.</li>
        )}
      </ul>
    </main>
  );
}
