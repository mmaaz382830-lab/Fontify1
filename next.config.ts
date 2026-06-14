import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Google profile avatars (returned on lh3.googleusercontent.com)
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
