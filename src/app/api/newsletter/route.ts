import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({ email });

  if (error) {
    // Unique violation = already subscribed; treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
