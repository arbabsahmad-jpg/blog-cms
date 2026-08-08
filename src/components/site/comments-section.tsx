"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { formatShortDate } from "@/lib/format";

type Comment = {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
};

export default function CommentsSection({
  blogId,
  initialComments,
  allowComments,
}: {
  blogId: string;
  initialComments: Comment[];
  allowComments: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesTo = (id: string) => comments.filter((c) => c.parent_id === id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, userName: name, userEmail: email, content }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setName("");
      setEmail("");
      setContent("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-16">
      <h2 id="comments-heading" className="flex items-center gap-2 font-display text-2xl">
        <MessageCircle size={20} /> Comments ({comments.length})
      </h2>

      <ul className="mt-6 space-y-6">
        {topLevel.map((c) => (
          <li key={c.id} className="rounded-2xl border border-paper-200 p-4 dark:border-ink-700">
            <div className="flex items-center justify-between">
              <span className="font-medium">{c.user_name}</span>
              <span className="text-xs text-ink-600 dark:text-paper-200">{formatShortDate(c.created_at)}</span>
            </div>
            <p className="mt-2 text-sm text-ink-700 dark:text-paper-100">{c.content}</p>
            {repliesTo(c.id).length > 0 && (
              <ul className="mt-4 space-y-3 border-l border-paper-200 pl-4 dark:border-ink-700">
                {repliesTo(c.id).map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.user_name}</span>
                      <span className="text-xs text-ink-600 dark:text-paper-200">{formatShortDate(r.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-700 dark:text-paper-100">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {topLevel.length === 0 && (
          <p className="text-sm text-ink-600 dark:text-paper-200">Be the first to comment.</p>
        )}
      </ul>

      {allowComments ? (
        status === "done" ? (
          <p className="mt-8 rounded-2xl bg-accent-50 p-4 text-sm text-accent-700 dark:bg-ink-800 dark:text-accent-400">
            Thanks! Your comment is awaiting moderation and will appear once approved.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3 rounded-2xl border border-paper-200 p-5 dark:border-ink-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
              />
              <input
                required
                type="email"
                placeholder="Email (not published)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
              />
            </div>
            <textarea
              required
              rows={4}
              placeholder="Add to the discussion…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
            />
            {status === "error" && <p className="text-sm text-red-600">Could not post your comment. Try again.</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
            >
              {status === "loading" && <Loader2 size={14} className="animate-spin" />}
              Post comment
            </button>
          </form>
        )
      ) : (
        <p className="mt-8 text-sm text-ink-600 dark:text-paper-200">Comments are closed for this post.</p>
      )}
    </section>
  );
}
