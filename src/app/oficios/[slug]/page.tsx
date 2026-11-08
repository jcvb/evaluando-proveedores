import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, SearchX, Wrench } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProviderCard } from "@/components/provider-card";
import { SearchPagination } from "@/components/search-pagination";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, buildPageMetadata, SITE } from "@/lib/seo";
import { getCategoryBySlug, searchProviders, type ProviderSearchItem } from "@/server/queries";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

function fallbackCategory(slug: string) {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let name: string | undefined = fallbackCategory(slug)?.name;
  if (!name && databaseConfigured()) {
    try {
      name = (await getCategoryBySlug(slug))?.name;
    } catch {
      /* ignore */
    }
  }
  if (!name) return { title: "Oficio no encontrado", robots: { index: false } };

  const title = `${name}: opiniones y maestros en México`;
  const description = `Lee opiniones con fotos de ${name.toLowerCase()} en México. Compara calificaciones, quejas y respuestas del negocio antes de contratar.`;

  return buildPageMetadata({
    title,
    description,
    path: `/oficios/${slug}`,
    keywords: [name, `${name} México`, `opiniones ${name}`, `reseñas ${name}`, ...SITE.keywords],
  });
}

export default async function OficioPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  let category = fallbackCategory(slug) as { slug: string; name: string } | null;

  if (databaseConfigured()) {
    try {
      const stored = await getCategoryBySlug(slug);
      if (stored) category = { slug: stored.slug, name: stored.name };
    } catch (error) {
      console.error(error);
    }
  }

  if (!category) notFound();

  let providers: ProviderSearchItem[] = [];
  let nextCursor: string | null = null;
  let pageSize = 24;
  if (databaseConfigured()) {
    try {
      const result = await searchProviders({ oficio: slug, cursor: query.cursor });
      providers = result.items;
      nextCursor = result.nextCursor;
      pageSize = result.pageSize;
    } catch (error) {
      console.error(error);
    }
  }

  const pageUrl = absoluteUrl(`/oficios/${slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Oficios", item: absoluteUrl("/oficios") },
        { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} | ${SITE.name}`,
      description: `Opiniones de ${category.name} en México`,
      url: pageUrl,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: providers.length,
        itemListElement: providers.map((provider, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/proveedores/${provider.id}`),
          name: provider.businessName,
        })),
      },
    },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <JsonLd data={jsonLd} />
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/oficios" className="hover:underline">
          Oficios
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{category.name}</span>
      </nav>
      <header className="grid gap-2">
        <h1 className="flex items-center gap-2 font-heading text-2xl md:text-3xl">
          <Wrench className="size-7 text-primary" aria-hidden />
          {category.name}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Opiniones con fotos de {category.name.toLowerCase()} en México. Revisa calificación, quejas abiertas y si el negocio respondió.
        </p>
        <p className="text-sm">
          <Link href={`/oficios/${slug}/md`} className="underline">
            Versión Markdown para agentes
          </Link>
        </p>
      </header>
      {providers.length === 0 ? (
        <div className="grid gap-3">
          <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3">
            <SearchX className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            Todavía no hay opiniones de este oficio. Si contrataste a alguien, cuenta la primera experiencia.
          </p>
          <Link href="/resenas/nueva" className={buttonVariants({ className: "w-fit" })}>
            Contar mi experiencia
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
          <SearchPagination
            pathname={`/oficios/${slug}`}
            filters={{ cursor: query.cursor }}
            nextCursor={nextCursor}
            pageSize={pageSize}
            itemCount={providers.length}
          />
        </div>
      )}
    </div>
  );
}
