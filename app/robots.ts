import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://hangerlamp.com/sitemap.xml",
    host: "https://hangerlamp.com",
  };
}
