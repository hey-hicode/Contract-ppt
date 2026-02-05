import type { MetadataRoute } from "next";

const siteUrl = "https://www.counselr.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
        disallow: [
          "/api/",
          "/dashboard",
          "/billing",
          "/onboarding",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
