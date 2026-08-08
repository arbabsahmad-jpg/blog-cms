"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { updateSiteSettings } from "@/lib/actions/settings";

type SiteSettings = {
  name: string;
  description: string;
  logo_url: string;
  social: { twitter: string; linkedin: string; github: string };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
      Save settings
    </button>
  );
}

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useFormState(updateSiteSettings, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-lg">Site</h2>
        <label className="mt-4 block text-sm font-medium">Site name</label>
        <input
          name="name"
          defaultValue={settings.name}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
        <label className="mt-4 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={settings.description}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
        <label className="mt-4 block text-sm font-medium">Logo URL</label>
        <input
          name="logo_url"
          defaultValue={settings.logo_url}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
      </section>

      <section className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-lg">Social links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Twitter / X</label>
            <input name="twitter" defaultValue={settings.social?.twitter} className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700" />
          </div>
          <div>
            <label className="block text-sm font-medium">LinkedIn</label>
            <input name="linkedin" defaultValue={settings.social?.linkedin} className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700" />
          </div>
          <div>
            <label className="block text-sm font-medium">GitHub</label>
            <input name="github" defaultValue={settings.social?.github} className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700" />
          </div>
        </div>
      </section>

      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700 dark:bg-ink-800 dark:text-accent-400">Saved.</p>}

      <SubmitButton />
    </form>
  );
}
