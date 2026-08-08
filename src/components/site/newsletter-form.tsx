"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setMessage(data.alreadySubscribed ? "You're already on the list." : "Subscribed! Check your inbox.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-accent">
        <Check size={16} /> {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
      <div className="relative flex-1">
        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-paper-200" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-full border border-paper-200 bg-paper-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent-400 dark:border-ink-700 dark:bg-ink-800"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-glow active:translate-y-0 disabled:opacity-60"
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        Subscribe
      </button>
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
