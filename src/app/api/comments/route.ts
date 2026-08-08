import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { blogId, userName, userEmail, content, parentId } = await request.json();

  if (!blogId || !userName || !userEmail || !content?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    blog_id: blogId,
    user_name: userName,
    user_email: userEmail,
    content,
    parent_id: parentId ?? null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Could not post your comment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
