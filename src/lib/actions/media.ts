"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordMediaUpload(input: {
  fileName: string;
  filePath: string;
  fileType: "image" | "video";
  mimeType: string;
  sizeBytes: number;
  folder?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("media").insert({
    file_name: input.fileName,
    file_path: input.filePath,
    file_type: input.fileType,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    folder: input.folder ?? "uploads",
    uploaded_by: user?.id ?? null,
  });

  revalidatePath("/admin/media");
}

export async function deleteMedia(mediaId: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("media").remove([filePath]);
  await supabase.from("media").delete().eq("id", mediaId);
  revalidatePath("/admin/media");
}

export async function renameMedia(mediaId: string, fileName: string) {
  const supabase = await createClient();
  await supabase.from("media").update({ file_name: fileName }).eq("id", mediaId);
  revalidatePath("/admin/media");
}
