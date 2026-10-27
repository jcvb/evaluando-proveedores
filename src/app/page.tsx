import { Camera, Reply, SearchX, ShieldCheck, TriangleAlert } from "lucide-react";
import { ProviderCard } from "@/components/provider-card";
import { SearchForm } from "@/components/search-form";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { listCategories, searchProviders, type SearchFilters } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters: SearchFilters = {
    q: params.q,
    oficio: params.oficio,
    estado: params.estado,
    municipio: params.municipio,
    colonia: params.colonia,
    fraccionamiento: params.fraccionamiento,
    veredicto: params.veredicto === "BUENO" || params.veredicto === "MALO" || params.veredicto === "REGULAR" ? params.veredicto : "",
  };

  let categories: { slug: string; name: string }[] = SERVICE_CATEGORIES.map(({ slug, name }) => ({ slug, name }));
  let providers: Awaited<ReturnType<typeof searchProviders>> = [];
  let notice: string | null = null;

  if (!databaseConfigured()) {
    notice = "La base de datos no está conectada. Cuando esté lista, aquí aparecen los negocios.";
  } else {
    try {
      const stored = await listCategories();
      if (stored.length > 0) categories = stored;
      providers = await searchProviders(filters);
    } catch (error) {
      console.error(error);
      notice = "No se pudo consultar la base de datos. Revisa que esté encendida.";
    }
  }

  const hasFilters = Boolean(filters.q || filters.oficio || filters.estado || filters.municipio || filters.colonia || filters.fraccionamiento || filters.veredicto);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <section className="grid gap-2">
        <h1 className="font-heading text-2xl md:text-3xl">Busca un maestro antes de contratarlo</h1>
        <p className="max-w-2xl text-muted-foreground">
          Aquí otras personas cuentan cómo les fue, con fotos. El negocio puede responder. No puede borrar lo que escribieron.
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1.5 text-sm [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-4 [&_svg]:text-primary">
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
      </section>
      <SearchForm categories={categories} defaults={filters} />
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
