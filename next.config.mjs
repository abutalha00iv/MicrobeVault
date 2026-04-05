/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  },
  experimental: {
    typedRoutes: true
  },
  async headers() {
    return [
      {
        // Security headers on all routes
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      },
      {
        // Aggressive cache for static assets (_next/static is content-hashed, safe to cache forever)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        // Cache public images for 7 days
        source: "/(.*)\\.(png|jpg|jpeg|webp|svg|ico|gif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }
        ]
      },
      {
        // Cache public read-only API routes for 60 seconds, revalidate in background
        source: "/api/(encyclopedia|microbes|diseases|flowcharts|timeline|references|search)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=300" }
        ]
      }
    ];
  }
};

export default nextConfig;
