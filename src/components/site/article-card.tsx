"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatShortDate, readingTimeLabel } from "@/lib/format";

export type ArticleCardPost = {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time_minutes: number;
  category?: { name: string; slug: string } | null;
};

export default function ArticleCard({
  post,
  size = "default",
}: {
  post: ArticleCardPost;
  size?: "default" | "large";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 300, damping: 25 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function onMouseLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ scale: 1.015 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-soft transition-shadow duration-300 hover:shadow-glow dark:border-ink-700 dark:bg-ink-900"
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`relative block ${size === "large" ? "aspect-[16/9]" : "aspect-[4/3]"} overflow-hidden bg-paper-100 dark:bg-ink-800`}
      >
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-600 dark:text-paper-200">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="w-fit rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100 dark:bg-ink-800 dark:text-accent-400"
          >
            {post.category.name}
          </Link>
        )}
        <Link href={`/blog/${post.slug}`} className="mt-3">
          <h3
            className={`font-display leading-snug transition-colors group-hover:text-accent ${size === "large" ? "text-2xl" : "text-lg"}`}
          >
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-600 dark:text-paper-200">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-ink-600 dark:text-paper-200">
          <span>{formatShortDate(post.published_at)}</span>
          <span aria-hidden>·</span>
          <span>{readingTimeLabel(post.reading_time_minutes)}</span>
        </div>
      </div>
    </motion.article>
  );
}
