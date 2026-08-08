"use client";

import { useTransition } from "react";
import { History, Loader2 } from "lucide-react";
import { restoreRevision } from "@/lib/actions/blogs";

export default function RestoreRevisionButton({ blogId, revisionId }: { blogId: string; revisionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Restore this version? The current content will be saved as a new revision first.")) {
          startTransition(() => restoreRevision(blogId, revisionId));
        }
      }}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border border-paper-200 px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent disabled:opacity-60 dark:border-ink-700"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
      Restore
    </button>
  );
}
