import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Reply, SearchX, ShieldCheck, TriangleAlert } from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { SearchForm } from "@/components/search-form";
import { SearchPagination } from "@/components/search-pagination";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, buildPageMetadata, SITE } from "@/lib/seo";
import { listCategories, searchProviders, type ProviderSearchItem, type SearchFilters } from "@/server/queries";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function hasActiveFilters(filters: SearchFilters) {
  return Boolean(
    filters.q || filters.oficio || filters.estado || filters.municipio || filters.colonia || filters.fraccionamiento || filters.veredicto,
  );
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const params = await searchParams;
  const filtered = hasActiveFilters({
    q: params.q,
    oficio: params.oficio,
    estado: params.estado,
    municipio: params.municipio,
    colonia: params.colonia,
    fraccionamiento: params.fraccionamiento,
    veredicto: params.veredicto === "BUENO" || params.veredicto === "MALO" || params.veredicto === "REGULAR" ? params.veredicto : "",
  });

  if (filtered) {
    return {
      title: "Resultados de búsqueda",
      description: SITE.description,
      robots: { index: false, follow: true },
      alternates: { canonical: absoluteUrl("/") },
    };
  }

  return buildPageMetadata({
    title: `${SITE.name}: opiniones de oficios en México`,
    description: SITE.description,
    path: "/",
  });
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const filters: SearchFilters = {
    q: params.q,
    oficio: params.oficio,
    estado: params.estado,
    municipio: params.municipio,
    colonia: params.colonia,
    fraccionamiento: params.fraccionamiento,
    veredicto: params.veredicto === "BUENO" || params.veredicto === "MALO" || params.veredicto === "REGULAR" ? params.veredicto : "",
    cursor: params.cursor,
  };

  let categories: { slug: string; name: string }[] = SERVICE_CATEGORIES.map(({ slug, name }) => ({ slug, name }));
  let providers: ProviderSearchItem[] = [];
  let nextCursor: string | null = null;
  let pageSize = 24;
  let notice: string | null = null;

  if (!databaseConfigured()) {
    notice = "La base de datos no está conectada. Cuando esté lista, aquí aparecen los negocios.";
  } else {
    try {
      const stored = await listCategories();
      if (stored.length > 0) categories = stored;
      const result = await searchProviders(filters);
      providers = result.items;
      nextCursor = result.nextCursor;
      pageSize = result.pageSize;
    } catch (error) {
      console.error(error);
      notice = "No se pudo consultar la base de datos. Revisa que esté encendida.";
    }
  }

  const hasFilters = hasActiveFilters(filters);
  const formDefaults = { ...filters, cursor: undefined };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#1a4a36] bg-[linear-gradient(155deg,#1f5c45_0%,#163a2d_52%,#0f2a20_100%)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(180,220,160,0.12),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-8 size-56 rounded-full bg-white/5 blur-2xl md:size-72"
        />

        <div className="relative mx-auto grid max-w-5xl gap-7 px-4 py-10 md:gap-8 md:py-14">
          <div className="grid max-w-2xl gap-3 home-hero-reveal">
            <p className="text-sm font-semibold tracking-[0.08em] text-[#c8e6d4] uppercase">
              {SITE.name}
            </p>
            <h1 className="font-heading text-[1.85rem] leading-tight text-balance sm:text-3xl md:text-4xl">
              Consulta opiniones reales antes de contratar
            </h1>
            <p className="max-w-xl text-[1.05rem] leading-relaxed text-white/80 text-pretty">
              Personas como tú cuentan cómo les fue con plomeros, electricistas, carpinteros y más
              oficios — con fotos. El negocio puede responder; nadie borra lo escrito.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] text-white/85 home-hero-reveal-delay [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[#b7dfc6]">
            <li>
              <Camera aria-hidden />
              Opiniones con fotos
            </li>
            <li>
              <Reply aria-hidden />
              El negocio puede responder
            </li>
            <li>
              <ShieldCheck aria-hidden />
              Nadie borra lo escrito
            </li>
          </ul>

          <div className="grid gap-3 home-hero-reveal-delay-2">
            <SearchForm
              key={JSON.stringify(formDefaults)}
              categories={categories}
              defaults={formDefaults}
              tone="onDark"
            />
            <p className="text-sm text-white/65">
              También puedes{" "}
              <Link href="/oficios" className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                explorar por oficio
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
        {notice ? (
          <p className="flex items-start gap-2 rounded-xl bg-amber-100 px-4 py-3 text-amber-950">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {notice}
          </p>
        ) : null}
        {providers.length === 0 && !notice ? (
          <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3">
            <SearchX className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            {hasFilters
              ? "No encontramos a nadie con esos datos. Revisa el nombre o el teléfono, o cuenta tú la primera experiencia."
              : "Todavía no hay opiniones. Si ya contrataste a alguien, puedes ser la primera persona en contarlo."}
          </p>
        ) : providers.length > 0 ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
            <SearchPagination
              pathname="/"
              filters={{
                q: filters.q,
                oficio: filters.oficio,
                estado: filters.estado,
                municipio: filters.municipio,
                colonia: filters.colonia,
                fraccionamiento: filters.fraccionamiento,
                veredicto: filters.veredicto || undefined,
                cursor: filters.cursor,
              }}
              nextCursor={nextCursor}
              pageSize={pageSize}
              itemCount={providers.length}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
