import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/baseUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/scrape", "/webhook", "/admin"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
