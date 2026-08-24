import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin ships a mixed ESM/CJS build that Next's bundler mishandles on
  // Vercel's serverless packaging step (ERR_REQUIRE_ESM loading firebase-admin/auth),
  // even though `next build && next start` works fine locally. Marking it external
  // skips bundling it and lets Node's own module resolution load it at runtime.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
