"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) router.push(redirectTo);
  });
}, [redirectTo, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-100 px-6 dark:bg-ink-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-paper-200 bg-white p-8 shadow-soft dark:border-ink-700 dark:bg-ink-900"
      >
        <h1 className="font-display text-2xl">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-paper-200">
          Only for the site owner and authors.
        </p>

        <label className="mt-6 block text-sm font-medium">Email</label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-paper-200 px-3 py-2 dark:border-ink-700">
          <Mail size={16} className="text-ink-600 dark:text-paper-200" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="you@example.com"
          />
        </div>

        <label className="mt-4 block text-sm font-medium">Password</label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-paper-200 px-3 py-2 dark:border-ink-700">
          <Lock size={16} className="text-ink-600 dark:text-paper-200" />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>
    </main>
  );
}
