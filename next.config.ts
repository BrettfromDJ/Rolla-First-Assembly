import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Old prototype addresses keep working.
  async redirects() {
    return [
      { source: "/new", destination: "/visit", permanent: true },
      { source: "/home", destination: "/me", permanent: true },
      { source: "/explore", destination: "/events", permanent: true },
      { source: "/explore/:id", destination: "/events/:id", permanent: true },
      { source: "/students", destination: "/youth", permanent: true },
    ];
  },
};

export default nextConfig;
