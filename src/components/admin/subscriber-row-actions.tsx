"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSubscriber } from "@/lib/actions/subscribers";

export default function SubscriberRowActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (confirm("Remove this subscriber?")) startTransition(() => deleteSubscriber(id));
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-red-50 hover:text-red-600 dark:text-paper-200"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
