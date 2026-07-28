import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  sassOptions: {
    quietDeps: true,
  } as Record<string, unknown>,
};

export default nextConfig;