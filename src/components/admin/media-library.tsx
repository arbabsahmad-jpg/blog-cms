"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Copy, Check, Loader2, FileVideo, Search } from "lucide-react";
import { uploadFileToStorage } from "@/lib/upload";
import { deleteMedia } from "@/lib/actions/media";
import { createClient } from "@/lib/supabase/client";

type MediaItem = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  folder: string;
  size_bytes: number;
  created_at: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const folders = useMemo(() => ["all", ...Array.from(new Set(items.map((i) => i.folder)))], [items]);

  const filtered = items.filter((item) => {
    const matchesFolder = folder === "all" || item.folder === folder;
    const matchesQuery = item.file_name.toLowerCase().includes(query.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  function publicUrl(path: string) {
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        await uploadFileToStorage(file, isVideo ? "videos" : "images");
      }
      // Optimistic-ish: reload the list from the server after uploads finish.
      window.location.reload();
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(item: MediaItem) {
    await navigator.clipboard.writeText(publicUrl(item.file_path));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function remove(item: MediaItem) {
    if (!confirm(`Delete "${item.file_name}"? This can't be undone.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    startTransition(() => deleteMedia(item.id, item.file_path));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver ? "border-accent bg-accent-50 dark:bg-ink-800" : "border-paper-200 dark:border-ink-700"
        }`}
      >
        {uploading ? <Loader2 className="animate-spin text-accent" /> : <Upload className="text-accent" />}
        <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-ink-600 dark:text-paper-200">Images and videos, uploaded straight to Supabase Storage</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-paper-200 p-1 dark:border-ink-700">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize transition ${
                folder === f ? "bg-accent text-white" : "text-ink-600 hover:text-ink-900 dark:text-paper-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full rounded-full border border-paper-200 bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none focus:border-accent-400 dark:border-ink-700"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-paper-200 bg-white dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="relative aspect-square bg-paper-100 dark:bg-ink-800">
              {item.file_type === "video" ? (
                <div className="flex h-full items-center justify-center text-ink-600 dark:text-paper-200">
                  <FileVideo size={28} />
                </div>
              ) : (
                <Image src={publicUrl(item.file_path)} alt={item.file_name} fill className="object-cover" />
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium" title={item.file_name}>
                {item.file_name}
              </p>
              <p className="text-[11px] text-ink-600 dark:text-paper-200">{formatBytes(item.size_bytes)}</p>
            </div>
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={() => copyUrl(item)}
                title="Copy URL"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-ink-700 shadow-soft hover:text-accent dark:bg-ink-900/90 dark:text-paper-100"
              >
                {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button
                onClick={() => remove(item)}
                title="Delete"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-ink-700 shadow-soft hover:text-red-600 dark:bg-ink-900/90 dark:text-paper-100"
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-ink-600 dark:text-paper-200">
            No files match yet — upload something above.
          </p>
        )}
      </div>
    </div>
  );
}
