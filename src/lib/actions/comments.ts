"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveComment(commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").update({ status: "approved" }).eq("id", commentId);
  revalidatePath("/admin/comments");
  revalidatePath("/blog", "layout");
}

export async function rejectComment(commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").update({ status: "rejected" }).eq("id", commentId);
  revalidatePath("/admin/comments");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin/comments");
}

export async function replyToComment(input: {
  blogId: string;
  parentId: string;
  content: string;
  authorName: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("comments").insert({
    blog_id: input.blogId,
    parent_id: input.parentId,
    user_name: input.authorName,
    user_email: user?.email ?? "admin@site",
    content: input.content,
    status: "approved", // admin replies publish immediately
  });

  revalidatePath("/admin/comments");
  revalidatePath("/blog", "layout");
}
