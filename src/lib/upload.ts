import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { clientStorage } from "./firebase/client";
import { uploadsEnabled } from "./firebase/config";
import { DOC_MIME, MAX_FILE_BYTES, PHOTO_MIME } from "./constants";

/**
 * Everything the applicant uploads lands under this prefix. `storage.rules` lets
 * anyone create here but nobody read — the dashboard reads through the admin SDK
 * with short-lived signed URLs instead.
 */
export const UPLOAD_ROOT = "trainer-docs";

function extOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
}

export function checkFile(file: File, kind: "photo" | "doc") {
  const allowed = kind === "photo" ? PHOTO_MIME : DOC_MIME;
  if (!allowed.includes(file.type)) {
    return kind === "photo"
      ? "Only JPG, PNG or WEBP images are allowed"
      : "Only PDF or image files are allowed";
  }
  if (file.size > MAX_FILE_BYTES) return "File must be smaller than 5 MB";
  return null;
}

/**
 * Uploads one file to Cloud Storage and returns its object path (not a URL) —
 * the path is what gets stored on the application document.
 */
const UPLOAD_TIMEOUT_MS = 45_000;

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!uploadsEnabled) {
    throw new Error("File uploads are turned off for this site.");
  }

  const path = `${UPLOAD_ROOT}/${folder}/${crypto.randomUUID()}.${extOf(file.name)}`;
  const storageRef = ref(clientStorage(), path);

  try {
    // The SDK retries a failing upload for a long time, which looks like a frozen
    // submit button. Give up first and report something the applicant can act on.
    await Promise.race([
      uploadBytes(storageRef, file, { contentType: file.type }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("upload timed out — check your connection and try again")),
          UPLOAD_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : "upload failed";
    throw new Error(`${file.name}: ${message}`);
  }

  return path;
}

/** Only used if you ever make the bucket public; the dashboard signs URLs instead. */
export async function publicUrl(path: string) {
  return getDownloadURL(ref(clientStorage(), path));
}
