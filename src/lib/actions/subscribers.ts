"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteSubscriber(subscriberId: string) {
  const supabase = await createClient();
  await supabase.from("subscribers").delete().eq("id", subscriberId);
  revalidatePath("/admin/subscribers");
}
