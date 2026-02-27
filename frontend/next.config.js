/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Proxy API calls vers le backend en dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:8000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
