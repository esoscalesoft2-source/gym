import type { SupabaseClient } from "@supabase/supabase-js";
import { DOC_MIME, MAX_FILE_BYTES, PHOTO_MIME } from "./constants";

export const BUCKET = "trainer-docs";

function extOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
}

export function checkFile(file: File, kind: "photo" | "doc") {
  const allowed = kind === "photo" ? PHOTO_MIME : DOC_MIME;
  if (!allowed.includes(file.type)) {
    return kind === "photo"
      ? "JPG / PNG / WEBP image mattum thaan"
      : "PDF or image file mattum thaan";
  }
  if (file.size > MAX_FILE_BYTES) return "File 5 MB-ku kammiya irukanum";
  return null;
}

/** Uploads one file into the private bucket and returns its storage path. */
export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  folder: string,
): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}.${extOf(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`${file.name}: ${error.message}`);
  return path;
}
