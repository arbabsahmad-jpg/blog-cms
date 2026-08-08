"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import { updateCategory, deleteCategory } from "@/lib/actions/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-accent hover:bg-accent-50 dark:hover:bg-ink-800"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
    </button>
  );
}

export default function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const updateWithId = updateCategory.bind(null, category.id);
  const [state, formAction] = useFormState(updateWithId, undefined);

  if (editing) {
    return (
      <li className="p-4">
        <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            name="name"
            defaultValue={category.name}
            required
            className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <input
            name="slug"
            defaultValue={category.slug}
            className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <input
            name="description"
            defaultValue={category.description ?? ""}
            placeholder="Description"
            className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <div className="flex items-center gap-1">
            <SaveButton />
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              <X size={15} />
            </button>
          </div>
        </form>
        {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="font-medium">{category.name}</p>
        <p className="text-xs text-ink-600 dark:text-paper-200">/{category.slug}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-paper-100 hover:text-accent dark:text-paper-200 dark:hover:bg-ink-800"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${category.name}"? Posts keep their content but lose this category.`)) {
              startTransition(() => deleteCategory(category.id));
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-red-50 hover:text-red-600 dark:text-paper-200"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </li>
  );
}
