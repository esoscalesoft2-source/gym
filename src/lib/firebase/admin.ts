import "server-only";

import { cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { firebaseConfig } from "./config";

const ADMIN_APP = "gym-admin";

/**
 * The service account JSON can be pasted into .env.local either as raw JSON on a
 * single line or base64-encoded. Base64 is far easier to handle on Windows, where
 * a raw key's embedded `\n` escapes tend to get mangled.
 */
function serviceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY missing. Firebase Console → Project settings → " +
        "Service accounts → Generate new private key, then put the JSON in .env.local.",
    );
  }

  const text = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");

  let parsed: { project_id?: string; client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON or base64-encoded JSON.");
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing project_id / client_email / private_key.");
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    // .env files store the key with literal \n sequences; turn them back into newlines.
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function adminApp() {
  const existing = getApps().find((a) => a.name === ADMIN_APP);
  if (existing) return existing;

  initializeApp(
    {
      credential: cert(serviceAccount()),
      storageBucket: firebaseConfig.storageBucket,
    },
    ADMIN_APP,
  );

  return getApp(ADMIN_APP);
}

export function adminDb() {
  return getFirestore(adminApp());
}

export function adminAuth() {
  return getAuth(adminApp());
}

export function adminBucket() {
  return getStorage(adminApp()).bucket();
}
