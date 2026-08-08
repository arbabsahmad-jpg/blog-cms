"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import ToolbarButton from "@/components/admin/editor/toolbar-button";

const EMOJI = [
  "😀", "😂", "😍", "🤔", "👍", "🙌", "🎉", "🔥",
  "❤️", "✅", "⚡", "🚀", "💡", "📌", "⭐", "🙏",
  "😅", "😢", "😎", "🤯", "👀", "✍️", "📷", "🎧",
];

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <ToolbarButton title="Emoji" onClick={() => setOpen((v) => !v)}>
        <Smile size={16} />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 grid w-56 grid-cols-8 gap-1 rounded-xl border border-paper-200 bg-white p-2 shadow-soft dark:border-ink-700 dark:bg-ink-900">
          {EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              className="rounded-lg p-1 text-lg hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
