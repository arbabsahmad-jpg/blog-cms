"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Feather } from "lucide-react";
import SearchBar from "@/components/site/search-bar";
import ThemeToggle from "@/components/site/theme-toggle";

type Category = { name: string; slug: string };

export default function Header({ categories }: { categories: Category[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const primaryCategories = categories.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-50/80 backdrop-blur dark:border-ink-700 dark:bg-ink-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <Link href="/" className="group flex items-center gap-2 font-display text-lg">
          <Feather size={18} className="text-accent transition-transform duration-300 group-hover:-rotate-12" />
          My Blog
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm text-ink-700 dark:text-paper-100 lg:flex">
          {primaryCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="relative py-1 transition-colors hover:text-accent after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-64 md:block">
          <SearchBar />
        </div>

        <ThemeToggle />

        <button
          className="text-ink-700 dark:text-paper-100 lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-paper-200 px-6 py-4 dark:border-ink-700 lg:hidden">
          <div className="mb-4 md:hidden">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-3 text-sm">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-ink-700 dark:text-paper-100"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
