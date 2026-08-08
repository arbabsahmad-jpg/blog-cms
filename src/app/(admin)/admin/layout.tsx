import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, FileText, FolderOpen, Tags, MessageSquare, Mail, Image as ImageIcon, Settings } from "lucide-react";
import SignOutButton from "@/components/admin/sign-out-button";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated visitors, but this is a
  // second, defense-in-depth check at the layout level.
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-paper-100 dark:bg-ink-950">
      <aside className="hidden w-60 shrink-0 border-r border-paper-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900 md:flex md:flex-col">
        <span className="px-2 font-display text-lg">Admin</span>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href as never}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-800"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-paper-200 pt-3 text-sm dark:border-ink-700">
          <p className="font-medium">{profile?.full_name ?? user.email}</p>
          <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-paper-200">
            {profile?.role ?? "author"}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
