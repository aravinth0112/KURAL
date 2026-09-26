import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right'
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/kural',
        permanent: true, // 308 — passes PageRank, tells Google this is the canonical URL
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'padxsbxfnhtdlbmpjlst.supabase.co',
      },
    ],
  },
};

export default nextConfig;
