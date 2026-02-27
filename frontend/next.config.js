/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy vers le backend FastAPI en dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
