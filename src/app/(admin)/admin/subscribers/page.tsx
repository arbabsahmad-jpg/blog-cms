import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate } from "@/lib/format";
import SubscriberRowActions from "@/components/admin/subscriber-row-actions";

export default async function AdminSubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id, email, status, subscribed_at")
    .order("subscribed_at", { ascending: false });

  return (
    <main className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Subscribers</h1>
          <p className="mt-1 text-ink-600 dark:text-paper-200">
            {subscribers?.length ?? 0} people on your newsletter list.
          </p>
        </div>
        <a
          href="/api/subscribers/export"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-600"
        >
          <Download size={16} /> Export CSV
        </a>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-paper-200 bg-white dark:border-ink-700 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-600 dark:border-ink-700 dark:text-paper-200">
            <tr>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Subscribed</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 dark:divide-ink-700">
            {subscribers?.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3">{s.email}</td>
                <td className="px-5 py-3 capitalize text-ink-600 dark:text-paper-200">{s.status}</td>
                <td className="px-5 py-3 text-ink-600 dark:text-paper-200">{formatShortDate(s.subscribed_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <SubscriberRowActions id={s.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(!subscribers || subscribers.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-600 dark:text-paper-200">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
