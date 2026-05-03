import type { MetadataRoute } from "next";

const SITE_URL = "https://portal.kevin-aragon.com";

/**
 * Generates /robots.txt at build time.
 *
 * Allow:    public marketing pages, signup/signin
 * Disallow: anything that requires auth (creator dashboard, admin
 *           console), API endpoints, internal preview routes
 *
 * Sitemap pointer at the bottom helps Google/Bing/etc. index faster.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/preview/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
