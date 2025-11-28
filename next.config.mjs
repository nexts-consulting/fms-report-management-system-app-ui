/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
