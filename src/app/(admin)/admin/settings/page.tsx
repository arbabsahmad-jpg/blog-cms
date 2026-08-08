import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "site").single();

  const defaults = { name: "My Blog", description: "", logo_url: "", social: { twitter: "", linkedin: "", github: "" } };
  const settings = { ...defaults, ...(data?.value as object) };

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-1 text-ink-600 dark:text-paper-200">Site-wide info used across the public website.</p>
      <div className="mt-6">
        <SettingsForm settings={settings as never} />
      </div>
    </main>
  );
}
