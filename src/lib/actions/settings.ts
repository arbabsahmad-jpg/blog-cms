"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSiteSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const supabase = await createClient();

  const value = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    logo_url: String(formData.get("logo_url") || "").trim(),
    social: {
      twitter: String(formData.get("twitter") || "").trim(),
      linkedin: String(formData.get("linkedin") || "").trim(),
      github: String(formData.get("github") || "").trim(),
    },
  };

  const { error } = await supabase.from("settings").upsert({ key: "site", value });
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
