"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = { error?: string } | undefined;

export async function createCategory(_prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(String(formData.get("slug") || name), { lower: true, strict: true }),
    description: String(formData.get("description") || "").trim() || null,
    image_url: String(formData.get("image_url") || "").trim() || null,
  });

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return undefined;
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: slugify(String(formData.get("slug") || name), { lower: true, strict: true }),
      description: String(formData.get("description") || "").trim() || null,
      image_url: String(formData.get("image_url") || "").trim() || null,
    })
    .eq("id", categoryId);

  if (error) return { error: error.code === "23505" ? "That slug is already in use." : error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return undefined;
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
