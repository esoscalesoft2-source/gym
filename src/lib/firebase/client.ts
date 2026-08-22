import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

/**
 * Browser-side Firebase app. Only used for uploading files to Cloud Storage —
 * every read and write of application data goes through a Server Action so the
 * service account (and `firestore.rules`) stay in charge.
 *
 * Next.js re-executes modules on hot reload, so reuse the app if it already exists.
 */
function clientApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function clientStorage() {
  return getStorage(clientApp());
}
