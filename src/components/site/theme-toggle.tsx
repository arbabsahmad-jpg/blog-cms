"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-800"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
