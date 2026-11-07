import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, buildPageMetadata, SITE } from "@/lib/seo";
import { listCategories } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: `Oficios y maestros | ${SITE.name}`,
  description:
    "Explora opiniones por oficio: plomería, electricidad, carpintería, albañilería, cocinas, impermeabilización y más en México.",
  path: "/oficios",
  keywords: ["oficios México", "maestros de oficio", "directorio plomeros", "directorio electricistas", ...SITE.keywords],
});

export default async function OficiosIndexPage() {
  let categories: { slug: string; name: string }[] = SERVICE_CATEGORIES.map(({ slug, name }) => ({ slug, name }));

  if (databaseConfigured()) {
    try {
      const stored = await listCategories();
      if (stored.length > 0) categories = stored.map(({ slug, name }) => ({ slug, name }));
    } catch (error) {
      console.error(error);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Oficios | ${SITE.name}`,
    description: SITE.description,
    url: absoluteUrl("/oficios"),
    isPartOf: { "@type": "WebSite", name: SITE.name, url: absoluteUrl("/") },
    about: categories.map((category) => ({
      "@type": "Thing",
      name: category.name,
      url: absoluteUrl(`/oficios/${category.slug}`),
    })),
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <JsonLd data={jsonLd} />
      <header className="grid gap-2">
        <h1 className="flex items-center gap-2 font-heading text-2xl md:text-3xl">
          <Wrench className="size-7 text-primary" aria-hidden />
          Oficios
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Elige un oficio para ver negocios y opiniones con fotos en México. Sirve para buscar antes de contratar.
        </p>
      </header>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/oficios/${category.slug}`}
              className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
            >
              <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
