/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_ENV === "development") {
      return [
        {
          source: "/api/v2/:path*",
          destination: "https://staging-analytics.airqo.net/api/v2/:path*",
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      {
        source: "/api/v2/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
