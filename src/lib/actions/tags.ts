"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { createClient } from "@/lib/supabase/server";

export type TagFormState = { error?: string } | undefined;

export async function createTag(_prevState: TagFormState, formData: FormData): Promise<TagFormState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({
    name,
    slug: slugify(name, { lower: true, strict: true }),
  });

  if (error) return { error: error.code === "23505" ? "That tag already exists." : error.message };

  revalidatePath("/admin/tags");
  return undefined;
}

export async function updateTag(tagId: string, _prevState: TagFormState, formData: FormData): Promise<TagFormState> {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tags")
    .update({ name, slug: slugify(name, { lower: true, strict: true }) })
    .eq("id", tagId);

  if (error) return { error: error.code === "23505" ? "That tag already exists." : error.message };

  revalidatePath("/admin/tags");
  return undefined;
}

export async function deleteTag(tagId: string) {
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", tagId);
  revalidatePath("/admin/tags");
}
