import type { MetadataRoute } from "next";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { SITE } from "@/lib/seo";
import { listProvidersForSitemap } from "@/server/queries";

export const dynamic = "force-dynamic";

/** Origen fijo y válido para Google Search Console (evita typos de env tipo ttps://). */
function sitemapUrl(path = "/") {
  const base = SITE.canonicalOrigin.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: sitemapUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: sitemapUrl("/oficios"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: sitemapUrl("/terminos"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: sitemapUrl("/aviso-privacidad"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: sitemapUrl("/llms.txt"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.3,
    },
    {
      url: sitemapUrl("/feed.xml"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.3,
    },
    {
      url: sitemapUrl("/contexto.md"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  for (const category of SERVICE_CATEGORIES) {
    entries.push({
      url: sitemapUrl(`/oficios/${category.slug}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  if (databaseConfigured()) {
    try {
      const providers = await listProvidersForSitemap();
      for (const provider of providers) {
        entries.push({
          url: sitemapUrl(`/proveedores/${provider.id}`),
          lastModified: provider.updatedAt,
          changeFrequency: "daily",
          priority: 0.85,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return entries;
}
