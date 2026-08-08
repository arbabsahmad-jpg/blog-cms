"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Link2Off,
  Image as ImageIcon,
  Upload,
  Youtube as YoutubeIcon,
  Video as VideoIcon,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  Eraser,
  Maximize2,
  Minimize2,
  Palette,
  Highlighter,
} from "lucide-react";
import ToolbarButton from "@/components/admin/editor/toolbar-button";
import EmojiPicker from "@/components/admin/editor/emoji-picker";
import { uploadFileToStorage } from "@/lib/upload";

const FONT_SIZES = [
  { label: "Small", value: "0.875rem" },
  { label: "Normal", value: "1rem" },
  { label: "Large", value: "1.25rem" },
  { label: "X-Large", value: "1.5rem" },
];

const IMAGE_WIDTHS = [
  { label: "S", value: "40%" },
  { label: "M", value: "70%" },
  { label: "L", value: "100%" },
];

const HIGHLIGHT_COLORS = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8"];

export default function EditorToolbar({
  editor,
  fullscreen,
  onToggleFullscreen,
}: {
  editor: Editor;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFileToStorage(file, "images");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFileToStorage(file, "videos");
      editor.chain().focus().setVideo(url).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function embedYoutube() {
    const url = window.prompt("YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-paper-200 bg-paper-50 p-2 dark:border-ink-700 dark:bg-ink-800">
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      <select
        title="Paragraph style"
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : editor.isActive("heading", { level: 5 })
                    ? "h5"
                    : editor.isActive("heading", { level: 6 })
                      ? "h6"
                      : "p"
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(val[1]) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
        }}
        className="h-8 rounded-lg border border-paper-200 bg-transparent px-2 text-sm dark:border-ink-700"
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>

      <select
        title="Font size"
        defaultValue="1rem"
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        className="h-8 rounded-lg border border-paper-200 bg-transparent px-2 text-sm dark:border-ink-700"
      >
        {FONT_SIZES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <Divider />

      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={16} />
      </ToolbarButton>

      <Divider />

      <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-700 hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-800" title="Font color">
        <Palette size={16} />
        <input
          type="color"
          className="sr-only"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>

      <div className="relative flex items-center gap-1">
        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight({ color: HIGHLIGHT_COLORS[0] }).run()}
        >
          <Highlighter size={16} />
        </ToolbarButton>
        <div className="flex gap-0.5">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Highlight ${color}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
              className="h-4 w-4 rounded-full border border-paper-200 dark:border-ink-700"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Divider />

      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton title="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ListTodo size={16} />
      </ToolbarButton>
      <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <span className="font-mono text-xs">{"{ }"}</span>
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Link2Off size={16} />
      </ToolbarButton>

      <ToolbarButton title="Upload image" onClick={() => imageInputRef.current?.click()}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <ToolbarButton title="Upload video" onClick={() => videoInputRef.current?.click()}>
        <VideoIcon size={16} />
      </ToolbarButton>
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

      <ToolbarButton title="Embed YouTube" onClick={embedYoutube}>
        <YoutubeIcon size={16} />
      </ToolbarButton>

      {editor.isActive("image") && (
        <div className="flex items-center gap-1 rounded-lg border border-paper-200 px-1 dark:border-ink-700">
          {IMAGE_WIDTHS.map((w) => (
            <button
              key={w.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().updateAttributes("image", { width: w.value }).run()}
              className="px-1.5 py-1 text-xs text-ink-700 hover:text-accent dark:text-paper-100"
              title={`Image width ${w.label}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      <Divider />

      <ToolbarButton
        title="Insert table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon size={16} />
      </ToolbarButton>
      {editor.isActive("table") && (
        <div className="flex items-center gap-1 text-xs text-ink-600 dark:text-paper-200">
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addRowAfter().run()} className="rounded px-1.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-800">+Row</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().addColumnAfter().run()} className="rounded px-1.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-800">+Col</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteRow().run()} className="rounded px-1.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-800">-Row</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteColumn().run()} className="rounded px-1.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-800">-Col</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteTable().run()} className="rounded px-1.5 py-1 text-red-600 hover:bg-red-50">Delete</button>
        </div>
      )}

      <Divider />

      <EmojiPicker onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()} />

      <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        <Eraser size={16} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1">
        {uploading && <span className="text-xs text-ink-600 dark:text-paper-200">Uploading…</span>}
        <ToolbarButton title={fullscreen ? "Exit full screen" : "Full screen"} onClick={onToggleFullscreen}>
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </ToolbarButton>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-paper-200 dark:bg-ink-700" />;
}
