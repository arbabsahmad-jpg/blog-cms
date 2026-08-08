"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-2 flex items-center gap-2 text-sm text-ink-600 transition hover:text-red-600 dark:text-paper-200"
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}
