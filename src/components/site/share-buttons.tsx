"use client";

import { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-200 text-ink-700 transition hover:border-accent hover:text-accent dark:border-ink-700 dark:text-paper-100"
        >
          <Icon size={15} />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-200 text-ink-700 transition hover:border-accent hover:text-accent dark:border-ink-700 dark:text-paper-100"
      >
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
