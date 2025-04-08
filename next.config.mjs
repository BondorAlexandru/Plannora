/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  devIndicators: false,
  experimental: {
    // Enable any experimental features if needed
  },
  // For local development, setting port in package.json scripts
  // For production, these env vars can be used
  env: {
    PORT: 4000,
  },
};

export default nextConfig;
