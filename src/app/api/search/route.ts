import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();

  // Search title/subtitle/excerpt/content directly, and separately match
  // against category name and tag names, then merge + de-dupe.
  const [byText, byCategory, byTag] = await Promise.all([
    supabase
      .from("blogs")
      .select("id, title, slug, excerpt, category:categories(name)")
      .eq("status", "published")
      .or(
        `title.ilike.%${q}%,subtitle.ilike.%${q}%,excerpt.ilike.%${q}%,content_html.ilike.%${q}%`
      )
      .limit(10),
    supabase
      .from("blogs")
      .select("id, title, slug, excerpt, category:categories!inner(name)")
      .eq("status", "published")
      .ilike("category.name", `%${q}%`)
      .limit(10),
    supabase
      .from("blog_tags")
      .select("blog:blogs!inner(id, title, slug, excerpt, status, category:categories(name)), tag:tags!inner(name)")
      .eq("blog.status", "published")
      .ilike("tag.name", `%${q}%`)
      .limit(10),
  ]);

  type Row = { id: string; title: string; slug: string; excerpt: string | null; category_name: string | null };

  const merged = new Map<string, Row>();

  for (const row of byText.data ?? []) {
    merged.set(row.id, {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      category_name: (row.category as unknown as { name: string } | null)?.name ?? null,
    });
  }
  for (const row of byCategory.data ?? []) {
    merged.set(row.id, {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      category_name: (row.category as unknown as { name: string } | null)?.name ?? null,
    });
  }
  for (const row of byTag.data ?? []) {
    const blog = row.blog as unknown as {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      category: { name: string } | null;
    };
    if (blog) {
      merged.set(blog.id, {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        category_name: blog.category?.name ?? null,
      });
    }
  }

  return NextResponse.json({ results: Array.from(merged.values()).slice(0, 12) });
}
