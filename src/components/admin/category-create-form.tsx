"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, Loader2 } from "lucide-react";
import { createCategory } from "@/lib/actions/categories";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
      Add category
    </button>
  );
}

export default function CategoryCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createCategory, undefined);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900"
    >
      <h2 className="font-display text-lg">New category</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          name="name"
          required
          placeholder="Name"
          className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
        <input
          name="image_url"
          placeholder="Image URL (optional)"
          className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
      </div>
      {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
