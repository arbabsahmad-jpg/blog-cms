import Link from "next/link";
import { Feather, Twitter, Linkedin, Github } from "lucide-react";
import NewsletterForm from "@/components/site/newsletter-form";

type Category = { name: string; slug: string };

export default function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-24 border-t border-paper-200 bg-white dark:border-ink-700 dark:bg-ink-900">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-lg">
              <Feather size={18} className="text-accent" />
              My Blog
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-600 dark:text-paper-200">
              Ideas, essays, and field notes — published straight from the admin dashboard.
            </p>
            <div className="mt-4 flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-paper-200 text-ink-600 transition hover:border-accent hover:text-accent dark:border-ink-700 dark:text-paper-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-paper-200">
              Categories
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-ink-700 hover:text-accent dark:text-paper-100">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-paper-200">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/" className="text-ink-700 hover:text-accent dark:text-paper-100">Home</Link></li>
              <li><Link href="/search" className="text-ink-700 hover:text-accent dark:text-paper-100">Search</Link></li>
              <li><Link href="/admin" className="text-ink-700 hover:text-accent dark:text-paper-100">Admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-paper-200">
              Stay in the loop
            </p>
            <p className="mt-3 text-sm text-ink-600 dark:text-paper-200">
              New posts, no spam.
            </p>
            <div className="mt-3">
              <NewsletterForm compact />
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs text-ink-600 dark:text-paper-200">
          © {new Date().getFullYear()} My Blog. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
