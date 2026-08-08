import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase.from("blogs").select("slug, updated_at").eq("status", "published"),
    supabase.from("categories").select("slug"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
