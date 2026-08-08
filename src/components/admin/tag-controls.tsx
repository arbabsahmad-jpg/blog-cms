"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil, Trash2, Loader2, Check, X, Plus } from "lucide-react";
import { createTag, updateTag, deleteTag } from "@/lib/actions/tags";

type Tag = { id: string; name: string; slug: string };

function SmallSubmit({ icon: Icon }: { icon: typeof Check }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-accent hover:bg-accent-50 dark:hover:bg-ink-800"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
    </button>
  );
}

export function TagCreateForm() {
  const [state, formAction] = useFormState(createTag, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-start gap-3">
      <input
        name="name"
        required
        placeholder="New tag name"
        className="rounded-full border border-paper-200 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
      />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
      >
        <Plus size={14} /> Add tag
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function TagRow({ tag }: { tag: Tag }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const updateWithId = updateTag.bind(null, tag.id);
  const [state, formAction] = useFormState(updateWithId, undefined);

  if (editing) {
    return (
      <li>
        <form action={formAction} className="flex items-center gap-1 rounded-full border border-accent bg-white px-2 py-1 dark:bg-ink-900">
          <input
            name="name"
            defaultValue={tag.name}
            required
            className="w-28 bg-transparent px-2 text-sm outline-none"
          />
          <SmallSubmit icon={Check} />
          <button type="button" onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center text-ink-600">
            <X size={15} />
          </button>
        </form>
        {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1 rounded-full border border-paper-200 py-1 pl-4 pr-1 text-sm dark:border-ink-700">
      #{tag.name}
      <button
        onClick={() => setEditing(true)}
        className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-ink-600 hover:bg-paper-100 hover:text-accent dark:text-paper-200 dark:hover:bg-ink-800"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => {
          if (confirm(`Delete tag "${tag.name}"?`)) startTransition(() => deleteTag(tag.id));
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-600 hover:bg-red-50 hover:text-red-600 dark:text-paper-200"
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </li>
  );
}
