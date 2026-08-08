import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-600 dark:text-paper-200">
      <Link href="/" className="hover:text-accent">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={13} />
          {item.href ? (
            <Link href={item.href as never} className="hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-900 dark:text-paper-50" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
