"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminAuth } from "@/lib/firebase/admin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  firebaseAdminConfigured,
  firebaseConfig,
} from "@/lib/firebase/config";

export type LoginState = { error: string | null };

const SIGN_IN_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

/**
 * Firebase's email/password sign-in lives in the client SDK, which a Server Action
 * cannot use. The Identity Toolkit REST endpoint is the server-side equivalent: it
 * takes the same public API key and returns an ID token, which we immediately trade
 * for an httpOnly session cookie. The password never reaches the browser's JS.
 */
async function signInWithPassword(email: string, password: string) {
  const res = await fetch(`${SIGN_IN_URL}?key=${firebaseConfig.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as { idToken?: string };
  return json.idToken ?? null;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) return { error: "Enter your email and password." };
  if (!firebaseAdminConfigured) return { error: "Site setup is not complete yet." };

  const idToken = await signInWithPassword(email, password);
  if (!idToken) return { error: "Incorrect email or password." };

  try {
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
  } catch (e) {
    console.error("[login]", e);
    return { error: "Could not sign you in. Please try again in a moment." };
  }

  // redirect() throws to unwind — it must sit outside the try block above.
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logout() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;

  if (cookie && firebaseAdminConfigured) {
    try {
      // Kill the refresh tokens too, so the session cannot be resurrected.
      const claims = await adminAuth().verifySessionCookie(cookie);
      await adminAuth().revokeRefreshTokens(claims.sub);
    } catch {
      // Already invalid — dropping the cookie below is enough.
    }
  }

  store.delete(SESSION_COOKIE);
  redirect("/login");
}

/** Returns the signed-in owner's uid, or null. Used as a second line of defence. */
export async function currentUid(): Promise<string | null> {
  if (!firebaseAdminConfigured) return null;

  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const claims = await adminAuth().verifySessionCookie(cookie);
    return claims.sub;
  } catch {
    return null;
  }
}
