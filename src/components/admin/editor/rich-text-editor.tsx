"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import EditorToolbar from "@/components/admin/editor/editor-toolbar";
import { FontSize } from "@/components/admin/editor/extensions/font-size";
import { Video } from "@/components/admin/editor/extensions/video";
import { ResizableImage } from "@/components/admin/editor/extensions/resizable-image";

export default function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "rounded-xl" } }),
      Video,
      ResizableImage,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      CharacterCount,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-accent prose-img:rounded-xl focus:outline-none min-h-[400px] px-4 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    // Keep external content changes (e.g. loading a saved draft) in sync.
    if (editor.getHTML() !== initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[460px] items-center justify-center rounded-2xl border border-paper-200 text-sm text-ink-600 dark:border-ink-700 dark:text-paper-200">
        Loading editor…
      </div>
    );
  }

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col overflow-auto bg-paper-50 dark:bg-ink-950"
          : "overflow-hidden rounded-2xl border border-paper-200 dark:border-ink-700"
      }
    >
      <EditorToolbar editor={editor} fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} />
      <div className={fullscreen ? "mx-auto w-full max-w-3xl flex-1 px-6 py-6" : ""}>
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t border-paper-200 px-4 py-2 text-xs text-ink-600 dark:border-ink-700 dark:text-paper-200">
        <span>
          {words} words · {characters} characters
        </span>
        <span>{readingMinutes} min read</span>
      </div>
    </div>
  );
}
