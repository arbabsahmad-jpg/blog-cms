"use client";

import { useTransition } from "react";
import { Copy, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { softDeleteBlog, restoreBlog, duplicateBlog } from "@/lib/actions/blogs";

export default function BlogRowActions({ blogId, deleted }: { blogId: string; deleted: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {!deleted && (
        <button
          title="Duplicate"
          onClick={() => startTransition(() => duplicateBlog(blogId))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-paper-100 hover:text-accent dark:text-paper-200 dark:hover:bg-ink-800"
        >
          <Copy size={15} />
        </button>
      )}
      {deleted ? (
        <button
          title="Restore"
          onClick={() => startTransition(() => restoreBlog(blogId))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-paper-100 hover:text-accent dark:text-paper-200 dark:hover:bg-ink-800"
        >
          <RotateCcw size={15} />
        </button>
      ) : (
        <button
          title="Delete"
          onClick={() => {
            if (confirm("Move this post to trash? You can restore it later.")) {
              startTransition(() => softDeleteBlog(blogId));
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-red-50 hover:text-red-600 dark:text-paper-200"
        >
          <Trash2 size={15} />
        </button>
      )}
      {isPending && <Loader2 size={14} className="animate-spin text-ink-600" />}
    </div>
  );
}
