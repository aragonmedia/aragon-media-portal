import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include drizzle migration SQL files in the deployment bundle so the
  // /api/admin/migrate route can read them at runtime.
  outputFileTracingIncludes: {
    "/api/admin/migrate": ["./drizzle/**/*"],
  },
};

export default nextConfig;
