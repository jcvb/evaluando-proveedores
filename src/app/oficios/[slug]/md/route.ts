import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { getCategoryBySlug, searchProviders } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  let name: string | null = SERVICE_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;

  if (databaseConfigured()) {
    try {
      const stored = await getCategoryBySlug(slug);
      if (stored) name = stored.name;
    } catch (error) {
      console.error(error);
    }
  }

  if (!name) {
    return new Response("# Oficio no encontrado\n", { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  }

  let providers: Awaited<ReturnType<typeof searchProviders>>["items"] = [];
  if (databaseConfigured()) {
    try {
      const result = await searchProviders({ oficio: slug });
      providers = result.items;
    } catch (error) {
      console.error(error);
    }
  }

  const list =
    providers.length === 0
      ? "_Sin perfiles con opiniones todavía._"
      : providers
          .map(
            (provider) =>
              `- [${provider.businessName}](${absoluteUrl(`/proveedores/${provider.id}/md`)}): ${provider.primaryCity}, ${provider.primaryState}. ${provider.totalReviews} opiniones · ${provider.averageScore.toFixed(1)}/5`,
          )
          .join("\n");

  const body = `# ${name}

> Opiniones públicas de ${name.toLowerCase()} en México en Buró de oficios.

Página humana: ${absoluteUrl(`/oficios/${slug}`)}
Índice de oficios: ${absoluteUrl("/oficios")}
Mapa para agentes: ${absoluteUrl("/llms.txt")}

## Negocios con opiniones

${list}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
