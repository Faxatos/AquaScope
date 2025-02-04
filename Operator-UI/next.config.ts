import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enabling React Strict Mode (recommended for development)
  reactStrictMode: true,

  // Adding custom webpack configuration
  webpack: (config) => {
    // Add "kerberos" to the externals to prevent bundling it
    config.externals = [...config.externals, "kerberos"];

    // You can add more custom webpack configurations here if needed
    return config;
  },

  // Set output to "standalone"
  output: "standalone",
};

export default nextConfig;
