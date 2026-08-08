import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCsvValue(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("email, status, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const header = "email,status,subscribed_at";
  const rows = (data ?? []).map((row) =>
    [toCsvValue(row.email), toCsvValue(row.status), toCsvValue(row.subscribed_at)].join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
