import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/venue/:slug",
        destination: "/miejsce/:slug",
        permanent: true,
      },
      {
        source: "/event/:slug",
        destination: "/wydarzenie/:slug",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withBotId(nextConfig);
