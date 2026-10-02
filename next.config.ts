import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      // Room for a 3.5 MB event image (lib/r2.ts) plus multipart overhead,
      // while staying under Vercel's 4.5 MB request body cap.
      bodySizeLimit: "4mb",
    },
  },
};

export default withBotId(nextConfig);
