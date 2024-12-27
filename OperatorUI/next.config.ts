import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enabling React Strict Mode (recommended for development)
  reactStrictMode: true,

  // Enabling the new SWC-based minifier (recommended for production)
  swcMinify: true,

  // Optional: Enabling Webpack 5
  future: {
    webpack5: true, // This is the default in Next.js, but you can use it if necessary
  },
};

export default nextConfig;
