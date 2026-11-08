import type { MetadataRoute } from "next";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { listProvidersForSitemap } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absoluteUrl("/oficios"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/terminos"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/aviso-privacidad"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/llms.txt"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/feed.xml"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/contexto.md"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  for (const category of SERVICE_CATEGORIES) {
    entries.push({
      url: absoluteUrl(`/oficios/${category.slug}`),
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
          url: absoluteUrl(`/proveedores/${provider.id}`),
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
