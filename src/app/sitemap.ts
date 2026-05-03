import type { MetadataRoute } from "next";

const SITE_URL = "https://portal.kevin-aragon.com";

/**
 * Generates /sitemap.xml at build time.
 *
 * Lists all PUBLIC pages — anything a search-engine crawler should
 * be able to discover and index. Auth-walled routes (dashboard,
 * admin) are deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Use the deploy timestamp as lastModified — every push refreshes
  // the date so crawlers know to re-fetch.
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/book-a-demo`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
