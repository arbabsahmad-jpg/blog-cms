import { createClient } from "@/lib/supabase/server";

const CARD_FIELDS =
  "id, title, subtitle, slug, excerpt, featured_image, published_at, reading_time_minutes, is_featured, is_trending, category:categories(id, name, slug)";

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .order("name");
  return data ?? [];
}

export async function getFeaturedPosts(limit = 4) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getLatestPosts(limit = 9, offset = 0) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return data ?? [];
}

export async function getTrendingPosts(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("is_trending", true)
    .order("views_count", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(
      "id, title, subtitle, slug, excerpt, content_html, featured_image, video_url, published_at, updated_at, reading_time_minutes, meta_title, meta_description, keywords, canonical_url, allow_comments, views_count, author:profiles(id, full_name, avatar_url, bio), category:categories(id, name, slug), tags:blog_tags(tag:tags(id, name, slug))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

export async function getRelatedPosts(categoryId: string | null, excludeId: string, limit = 3) {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAdjacentPosts(publishedAt: string | null, currentId: string) {
  if (!publishedAt) return { previous: null, next: null };
  const supabase = await createClient();

  const [{ data: previous }, { data: next }] = await Promise.all([
    supabase
      .from("blogs")
      .select("title, slug")
      .eq("status", "published")
      .lt("published_at", publishedAt)
      .neq("id", currentId)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("blogs")
      .select("title, slug")
      .eq("status", "published")
      .gt("published_at", publishedAt)
      .neq("id", currentId)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return { previous, next };
}

export async function getPostsByCategory(slug: string, limit = 12, offset = 0) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) return { category: null, posts: [] };

  const { data: posts } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { category, posts: posts ?? [] };
}

export async function searchPosts(q: string, limit = 20) {
  if (!q.trim()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,excerpt.ilike.%${q}%,content_html.ilike.%${q}%`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getApprovedComments(blogId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, user_name, content, created_at, parent_id")
    .eq("blog_id", blogId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  return data ?? [];
}
