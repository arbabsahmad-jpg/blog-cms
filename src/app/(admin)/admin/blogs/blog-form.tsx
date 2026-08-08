"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Loader2, Save } from "lucide-react";
import type { BlogFormState } from "@/lib/actions/blogs";
import RichTextEditor from "@/components/admin/editor/rich-text-editor";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

export type BlogFormValues = {
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image: string;
  video_url: string;
  category_id: string;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  canonical_url: string;
  is_featured: boolean;
  is_trending: boolean;
  allow_comments: boolean;
  tag_ids: string[];
};

const defaults: BlogFormValues = {
  title: "",
  subtitle: "",
  slug: "",
  excerpt: "",
  content_html: "",
  featured_image: "",
  video_url: "",
  category_id: "",
  status: "draft",
  scheduled_at: "",
  meta_title: "",
  meta_description: "",
  keywords: "",
  canonical_url: "",
  is_featured: false,
  is_trending: false,
  allow_comments: true,
  tag_ids: [],
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
      {label}
    </button>
  );
}

export default function BlogForm({
  action,
  initial,
  categories,
  tags,
  submitLabel,
  autosaveAction,
}: {
  action: (state: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  initial?: Partial<BlogFormValues>;
  categories: Category[];
  tags: Tag[];
  submitLabel: string;
  autosaveAction?: (data: { title: string; subtitle: string; content_html: string }) => Promise<void>;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, undefined);
  const values = { ...defaults, ...initial };

  const [title, setTitle] = useState(values.title);
  const [subtitle, setSubtitle] = useState(values.subtitle);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));
  const [status, setStatus] = useState(values.status);
  const [contentHtml, setContentHtml] = useState(values.content_html);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle");
  const skipFirstAutosave = useRef(true);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title, { lower: true, strict: true }));
  }, [title, slugTouched]);

  useEffect(() => {
    if (!autosaveAction) return;
    if (skipFirstAutosave.current) {
      skipFirstAutosave.current = false;
      return;
    }
    setAutosaveState("saving");
    const handle = setTimeout(async () => {
      await autosaveAction({ title, subtitle, content_html: contentHtml });
      setAutosaveState("saved");
    }, 2500);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, contentHtml]);

  return (
    <form action={formAction} className="space-y-8">
      <section className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-lg">Content</h2>

        <label className="mt-4 block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />

        <label className="mt-4 block text-sm font-medium">Subtitle</label>
        <input
          name="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />

        <label className="mt-4 block text-sm font-medium">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />

        <label className="mt-4 block text-sm font-medium">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={values.excerpt}
          placeholder="Auto-generated from content if left blank"
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />

        <label className="mt-4 block text-sm font-medium">Content</label>
        <div className="mt-1">
          <RichTextEditor initialContent={values.content_html} onChange={setContentHtml} />
        </div>
        <input type="hidden" name="content_html" value={contentHtml} readOnly />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
          <h2 className="font-display text-lg">Media</h2>
          <label className="mt-4 block text-sm font-medium">Featured image URL</label>
          <input
            name="featured_image"
            defaultValue={values.featured_image}
            placeholder="https://…"
            className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <label className="mt-4 block text-sm font-medium">Video URL (YouTube embed or file)</label>
          <input
            name="video_url"
            defaultValue={values.video_url}
            placeholder="https://youtube.com/…"
            className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
          <p className="mt-2 text-xs text-ink-600 dark:text-paper-200">
            Drag-and-drop uploads to the media library arrive in Phase 5 — paste a URL for now.
          </p>
        </div>

        <div className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
          <h2 className="font-display text-lg">Organize</h2>
          <label className="mt-4 block text-sm font-medium">Category</label>
          <select
            name="category_id"
            defaultValue={values.category_id}
            className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <p className="mt-4 text-sm font-medium">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length === 0 && (
              <p className="text-sm text-ink-600 dark:text-paper-200">No tags yet — create some in Tags.</p>
            )}
            {tags.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-paper-200 px-3 py-1 text-xs has-[:checked]:border-accent has-[:checked]:text-accent dark:border-ink-700"
              >
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={t.id}
                  defaultChecked={values.tag_ids.includes(t.id)}
                  className="accent-accent"
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-lg">SEO</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Meta title</label>
            <input
              name="meta_title"
              defaultValue={values.meta_title}
              placeholder="Falls back to the post title"
              className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Canonical URL</label>
            <input
              name="canonical_url"
              defaultValue={values.canonical_url}
              placeholder="Optional"
              className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
            />
          </div>
        </div>
        <label className="mt-4 block text-sm font-medium">Meta description</label>
        <textarea
          name="meta_description"
          rows={2}
          defaultValue={values.meta_description}
          placeholder="Falls back to the excerpt"
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
        <label className="mt-4 block text-sm font-medium">Keywords (comma separated)</label>
        <input
          name="keywords"
          defaultValue={values.keywords}
          className="mt-1 w-full rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
        />
      </section>

      <section className="rounded-2xl border border-paper-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="font-display text-lg">Publish</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {(["draft", "scheduled", "published"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="accent-accent"
              />
              {s}
            </label>
          ))}
        </div>
        {status === "scheduled" && (
          <div className="mt-4">
            <label className="block text-sm font-medium">Publish at</label>
            <input
              type="datetime-local"
              name="scheduled_at"
              defaultValue={values.scheduled_at}
              className="mt-1 rounded-xl border border-paper-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={values.is_featured} className="accent-accent" />
            Featured post
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_trending" defaultChecked={values.is_trending} className="accent-accent" />
            Trending post
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allow_comments" defaultChecked={values.allow_comments} className="accent-accent" />
            Allow comments
          </label>
        </div>
      </section>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="rounded-xl px-5 py-2.5 text-sm text-ink-600 hover:text-ink-900 dark:text-paper-200"
        >
          Cancel
        </button>
        {autosaveAction && (
          <span className="text-xs text-ink-600 dark:text-paper-200">
            {autosaveState === "saving" && "Saving draft…"}
            {autosaveState === "saved" && "All changes saved"}
          </span>
        )}
      </div>
    </form>
  );
}
