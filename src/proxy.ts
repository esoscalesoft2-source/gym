import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, firebaseAdminConfigured } from "@/lib/firebase/config";

/**
 * Route guard for the owner dashboard.
 *
 * In Next 16 this file replaces `middleware.ts` and runs on the Node.js runtime,
 * so `firebase-admin` works here — it is imported lazily so an unconfigured site
 * (or a public route) never pays for loading it.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Before .env.local is filled in, don't crash the whole route — let the page
  // render and show its own "setup incomplete" message.
  if (!firebaseAdminConfigured) return NextResponse.next({ request });

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  let signedIn = false;

  if (cookie) {
    try {
      const { adminAuth } = await import("@/lib/firebase/admin");
      await adminAuth().verifySessionCookie(cookie);
      signedIn = true;
    } catch {
      // Expired, revoked or forged — treat exactly like "not signed in".
      signedIn = false;
    }
  }

  if (!signedIn && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);

    const redirect = NextResponse.redirect(url);
    // Clear a stale cookie so the browser stops sending it on every request.
    if (cookie) redirect.cookies.delete(SESSION_COOKIE);
    return redirect;
  }

  if (signedIn && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
