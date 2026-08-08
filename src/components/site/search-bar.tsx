"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";

type Result = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_name: string | null;
};

export default function SearchBar({ variant = "header" }: { variant?: "header" | "page" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}` as never);
  }

  return (
    <div ref={containerRef} className={variant === "header" ? "relative" : "relative w-full max-w-xl"}>
      <form onSubmit={submit} className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-paper-200"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search articles…"
          className="w-full rounded-full border border-paper-200 bg-paper-50 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-accent-400 dark:border-ink-700 dark:bg-ink-800"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-600" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-paper-200"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-2xl border border-paper-200 bg-white p-2 shadow-soft dark:border-ink-700 dark:bg-ink-900">
          {results.length === 0 && !loading && (
            <p className="px-3 py-4 text-sm text-ink-600 dark:text-paper-200">
              No articles match &ldquo;{query}&rdquo;.
            </p>
          )}
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/blog/${r.slug}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 transition hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              <p className="text-sm font-medium">{r.title}</p>
              {r.category_name && (
                <p className="text-xs text-accent">{r.category_name}</p>
              )}
            </Link>
          ))}
          {results.length > 0 && (
            <button
              onClick={submit}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-accent hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              See all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
