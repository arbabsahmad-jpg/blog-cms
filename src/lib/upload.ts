import { createClient } from "@/lib/supabase/client";
import { recordMediaUpload } from "@/lib/actions/media";

export async function uploadFileToStorage(file: File, folder = "uploads") {
  const supabase = createClient();
  const isVideo = file.type.startsWith("video/");
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);

  // Fire-and-forget metadata log for the media library (Phase 5).
  void recordMediaUpload({
    fileName: file.name,
    filePath: path,
    fileType: isVideo ? "video" : "image",
    mimeType: file.type,
    sizeBytes: file.size,
    folder,
  });

  return { url: publicUrl, isVideo };
}
