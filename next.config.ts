import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  devIndicators: false,
  // The /portal route streams the vendored prototype HTML from disk; make
  // sure it is traced into serverless/standalone output.
  outputFileTracingIncludes: {
    "/portal": ["./app/portal/index.html"],
  },
};

export default nextConfig;
