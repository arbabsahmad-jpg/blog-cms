"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";
import { estimateReadingMinutes, autoExcerpt } from "@/lib/html-utils";

export type BlogFormState = { error?: string } | undefined;

function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function buildBlogPayload(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const contentHtml = String(formData.get("content_html") || "");
  const status = String(formData.get("status") || "draft") as
    | "draft"
    | "scheduled"
    | "published";
  const scheduledAtRaw = String(formData.get("scheduled_at") || "");

  const slug = slugify(rawSlug || title, { lower: true, strict: true });
  const excerpt = String(formData.get("excerpt") || "").trim() || autoExcerpt(contentHtml);

  return {
    title,
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    slug,
    excerpt,
    content_html: contentHtml,
    content: {}, // populated by the Tiptap editor in Phase 4
    featured_image: String(formData.get("featured_image") || "").trim() || null,
    video_url: String(formData.get("video_url") || "").trim() || null,
    category_id: String(formData.get("category_id") || "") || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    scheduled_at: status === "scheduled" && scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null,
    meta_title: String(formData.get("meta_title") || "").trim() || null,
    meta_description: String(formData.get("meta_description") || "").trim() || null,
    keywords: parseKeywords(String(formData.get("keywords") || "")),
    canonical_url: String(formData.get("canonical_url") || "").trim() || null,
    reading_time_minutes: estimateReadingMinutes(contentHtml),
    is_featured: formData.get("is_featured") === "on",
    is_trending: formData.get("is_trending") === "on",
    allow_comments: formData.get("allow_comments") === "on",
  };
}

async function syncTags(blogId: string, formData: FormData) {
  const supabase = await createClient();
  const tagIds = formData.getAll("tag_ids").map(String);

  await supabase.from("blog_tags").delete().eq("blog_id", blogId);
  if (tagIds.length > 0) {
    await supabase.from("blog_tags").insert(tagIds.map((tag_id) => ({ blog_id: blogId, tag_id })));
  }
}

export async function autosaveBlog(
  blogId: string,
  data: { title: string; subtitle: string; content_html: string }
) {
  const supabase = await createClient();
  await supabase
    .from("blogs")
    .update({
      title: data.title || undefined,
      subtitle: data.subtitle || null,
      content_html: data.content_html,
      reading_time_minutes: estimateReadingMinutes(data.content_html),
    })
    .eq("id", blogId);
}

export async function createBlog(_prevState: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = buildBlogPayload(formData);
  if (!payload.title) return { error: "Title is required." };

  const { data, error } = await supabase
    .from("blogs")
    .insert({ ...payload, author_id: user?.id ?? null })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "That slug is already in use." : error.message };
  }

  await syncTags(data.id, formData);
  revalidatePath("/admin/blogs");
  revalidatePath("/");
  redirect(`/admin/blogs/${data.id}/edit?created=1`);
}

export async function updateBlog(blogId: string, _prevState: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const supabase = await createClient();
  const payload = buildBlogPayload(formData);
  if (!payload.title) return { error: "Title is required." };

  // Snapshot current content into blog_revisions before overwriting.
  const { data: existing } = await supabase
    .from("blogs")
    .select("title, content, content_html, published_at")
    .eq("id", blogId)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (existing) {
    await supabase.from("blog_revisions").insert({
      blog_id: blogId,
      title: existing.title,
      content:
        existing.content && Object.keys(existing.content).length > 0
          ? existing.content
          : { html: existing.content_html ?? "" },
      created_by: user?.id ?? null,
    });
  }

  // Preserve the original published_at if it was already published.
  const nextPublishedAt =
    payload.status === "published" ? existing?.published_at ?? payload.published_at : payload.published_at;

  const { error } = await supabase
    .from("blogs")
    .update({ ...payload, published_at: nextPublishedAt })
    .eq("id", blogId);

  if (error) {
    return { error: error.code === "23505" ? "That slug is already in use." : error.message };
  }

  await syncTags(blogId, formData);
  revalidatePath("/admin/blogs");
  revalidatePath("/");
  return undefined;
}

export async function restoreRevision(blogId: string, revisionId: string) {
  const supabase = await createClient();
  const { data: revision } = await supabase
    .from("blog_revisions")
    .select("title, content")
    .eq("id", revisionId)
    .single();

  if (!revision) return;

  const content = revision.content as { html?: string } | Record<string, unknown>;
  const html = typeof content === "object" && "html" in content ? (content.html as string) : "";

  // Snapshot the current version before overwriting, so restoring is itself
  // reversible.
  const { data: current } = await supabase.from("blogs").select("title, content_html").eq("id", blogId).single();
  if (current) {
    await supabase.from("blog_revisions").insert({
      blog_id: blogId,
      title: current.title,
      content: { html: current.content_html ?? "" },
    });
  }

  await supabase
    .from("blogs")
    .update({
      title: revision.title,
      content_html: html,
      reading_time_minutes: estimateReadingMinutes(html),
    })
    .eq("id", blogId);

  revalidatePath(`/admin/blogs/${blogId}/edit`);
  revalidatePath(`/admin/blogs/${blogId}/history`);
}

export async function softDeleteBlog(blogId: string) {
  const supabase = await createClient();
  await supabase.from("blogs").update({ deleted_at: new Date().toISOString() }).eq("id", blogId);
  revalidatePath("/admin/blogs");
  revalidatePath("/");
}

export async function restoreBlog(blogId: string) {
  const supabase = await createClient();
  await supabase.from("blogs").update({ deleted_at: null }).eq("id", blogId);
  revalidatePath("/admin/blogs");
  revalidatePath("/");
}

export async function duplicateBlog(blogId: string) {
  const supabase = await createClient();
  const { data: original } = await supabase.from("blogs").select("*").eq("id", blogId).single();
  if (!original) return;

  const { id, created_at, updated_at, views_count, slug, ...rest } = original;
  void id;
  void created_at;
  void updated_at;
  void views_count;

  const newSlug = slugify(`${slug}-copy-${Date.now()}`, { lower: true, strict: true });

  await supabase.from("blogs").insert({
    ...rest,
    slug: newSlug,
    title: `${original.title} (Copy)`,
    status: "draft",
    published_at: null,
    is_featured: false,
    is_trending: false,
  });

  revalidatePath("/admin/blogs");
}
