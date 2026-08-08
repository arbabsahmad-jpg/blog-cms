"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: number };

export default function TableOfContents({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[];
    const items: Heading[] = nodes.map((node, i) => {
      if (!node.id) node.id = `section-${i}-${node.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? i}`;
      return { id: node.id, text: node.textContent ?? "", level: node.tagName === "H3" ? 3 : 2 };
    });
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [containerId]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-paper-200 p-5 dark:border-ink-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-paper-200">
        On this page
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? 12 : 0 }}>
            <a
              href={`#${h.id}`}
              className={`block transition ${
                activeId === h.id
                  ? "font-medium text-accent"
                  : "text-ink-600 hover:text-accent dark:text-paper-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
