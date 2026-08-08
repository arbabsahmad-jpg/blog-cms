"use client";

import { useState, useTransition } from "react";
import { Check, X, Trash2, Reply, Loader2 } from "lucide-react";
import { approveComment, rejectComment, deleteComment, replyToComment } from "@/lib/actions/comments";
import { formatShortDate } from "@/lib/format";

type Comment = {
  id: string;
  blog_id: string;
  user_name: string;
  user_email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  blog_title: string;
};

export default function CommentModerationRow({ comment }: { comment: Comment }) {
  const [isPending, startTransition] = useTransition();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };

  async function submitReply() {
    if (!replyText.trim()) return;
    setSendingReply(true);
    await replyToComment({
      blogId: comment.blog_id,
      parentId: comment.id,
      content: replyText,
      authorName: "Admin",
    });
    setSendingReply(false);
    setReplying(false);
    setReplyText("");
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {comment.user_name}{" "}
            <span className="font-normal text-ink-600 dark:text-paper-200">on “{comment.blog_title}”</span>
          </p>
          <p className="text-xs text-ink-600 dark:text-paper-200">
            {comment.user_email} · {formatShortDate(comment.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusStyles[comment.status]}`}>
          {comment.status}
        </span>
      </div>

      <p className="mt-2 text-sm">{comment.content}</p>

      <div className="mt-3 flex items-center gap-1">
        {comment.status !== "approved" && (
          <button
            onClick={() => startTransition(() => approveComment(comment.id))}
            title="Approve"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"
          >
            <Check size={15} />
          </button>
        )}
        {comment.status !== "rejected" && (
          <button
            onClick={() => startTransition(() => rejectComment(comment.id))}
            title="Reject"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50"
          >
            <X size={15} />
          </button>
        )}
        <button
          onClick={() => setReplying((v) => !v)}
          title="Reply"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-paper-100 hover:text-accent dark:text-paper-200 dark:hover:bg-ink-800"
        >
          <Reply size={15} />
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this comment permanently?")) startTransition(() => deleteComment(comment.id));
          }}
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-red-50 hover:text-red-600 dark:text-paper-200"
        >
          <Trash2 size={15} />
        </button>
        {isPending && <Loader2 size={14} className="animate-spin text-ink-600" />}
      </div>

      {replying && (
        <div className="mt-3 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply as Admin…"
            className="flex-1 rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <button
            onClick={submitReply}
            disabled={sendingReply}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {sendingReply ? <Loader2 size={14} className="animate-spin" /> : "Send"}
          </button>
        </div>
      )}
    </li>
  );
}
